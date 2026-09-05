import { jsonError } from "@/lib/api";
import { requireActivePsychologist } from "@/lib/authz";
import { createAdminClient } from "@/lib/supabase/admin";
import { z } from "zod";

const createSchema = z.object({ patientId: z.uuid(), startsAt: z.iso.datetime({ offset: true }) });

export async function GET(request: Request) {
  const auth = await requireActivePsychologist();
  if (!auth) return jsonError("Acesso restrito.", 403);
  const url = new URL(request.url);
  const from = new Date(url.searchParams.get("from") ?? new Date().toISOString());
  const to = new Date(url.searchParams.get("to") ?? new Date(Date.now() + 7 * 86400000).toISOString());
  if (Number.isNaN(from.valueOf()) || Number.isNaN(to.valueOf()) || to <= from) return jsonError("Intervalo inválido.", 422);
  const [{ data: appointments }, { data: blocks }, { data: availability }, { data: relationships }] = await Promise.all([
    auth.supabase.from("appointments").select("id,patient_id,starts_at,ends_at,status,origin").eq("psychologist_id", auth.user.id).gte("starts_at", from.toISOString()).lt("starts_at", to.toISOString()).order("starts_at"),
    auth.supabase.from("schedule_blocks").select("id,starts_at,ends_at,administrative_reason").eq("psychologist_id", auth.user.id).eq("active", true).lt("starts_at", to.toISOString()).gt("ends_at", from.toISOString()),
    auth.supabase.from("availability_rules").select("*").eq("psychologist_id", auth.user.id).eq("active", true),
    auth.supabase.from("psychologist_patients").select("patient_id,status").eq("psychologist_id", auth.user.id).eq("status", "ATIVO"),
  ]);
  const admin = createAdminClient();
  const patientIds = [...new Set([...(appointments ?? []).map((item) => item.patient_id), ...(relationships ?? []).map((item) => item.patient_id)])];
  const { data: patientProfiles } = patientIds.length && admin ? await admin.from("profiles").select("user_id,name").in("user_id", patientIds) : { data: [] };
  const nameFor = (id: string) => patientProfiles?.find((profile) => profile.user_id === id)?.name ?? "Paciente";
  return Response.json({ appointments: (appointments ?? []).map((item) => ({ ...item, patient_name: nameFor(item.patient_id) })), blocks: blocks ?? [], availability: availability ?? [], patients: (relationships ?? []).map((item) => ({ id: item.patient_id, name: nameFor(item.patient_id) })) }, { headers: { "Cache-Control": "private, no-store" } });
}

export async function POST(request: Request) {
  const auth = await requireActivePsychologist();
  if (!auth) return jsonError("Acesso restrito.", 403);
  try {
    const input = createSchema.parse(await request.json());
    const admin = createAdminClient();
    if (!admin) return jsonError("Agenda temporariamente indisponível.", 503);
    const [{ data: relationship }, { data: professional }] = await Promise.all([
      admin.from("psychologist_patients").select("id").eq("psychologist_id", auth.user.id).eq("patient_id", input.patientId).eq("status", "ATIVO").maybeSingle(),
      admin.from("psychologist_profiles").select("session_duration_minutes").eq("user_id", auth.user.id).single(),
    ]);
    if (!relationship || !professional) return jsonError("Paciente ativo não encontrado.", 404);
    const startsAt = new Date(input.startsAt); const endsAt = new Date(startsAt.getTime() + professional.session_duration_minutes * 60000);
    if (startsAt <= new Date()) return jsonError("Escolha um horário futuro.", 422);
    const { data, error } = await admin.from("appointments").insert({ psychologist_id: auth.user.id, patient_id: input.patientId, starts_at: startsAt.toISOString(), ends_at: endsAt.toISOString(), status: "CONFIRMADO", origin: "PSYCHOLOGIST_PANEL" }).select("id,patient_id,starts_at,ends_at,status,origin").single();
    if (error) return jsonError(error.code === "23P01" ? "Este horário já está ocupado." : "Não foi possível criar o agendamento.", error.code === "23P01" ? 409 : 500);
    await admin.from("appointment_events").insert({ appointment_id: data.id, actor_id: auth.user.id, new_status: "CONFIRMADO", reason: "Agendamento criado pela profissional" });
    return Response.json({ appointment: data }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) return jsonError("Dados inválidos.", 422, error.flatten());
    return jsonError("Não foi possível criar o agendamento.", 500);
  }
}
