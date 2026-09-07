import { createAdminClient } from "@/lib/supabase/admin";
import { jsonError } from "@/lib/api";
import { requireActivePatient, requireActivePsychologist } from "@/lib/authz";
import { getProfessional } from "@/lib/professional";

export async function GET(request: Request, { params }: RouteContext<"/api/public/psychologists/[slug]/slots">) {
  const auth = await requireActivePatient() ?? await requireActivePsychologist();
  if (!auth) return jsonError("Entre na sua conta para consultar horários.", 401);
  const admin = createAdminClient();
  if (!admin) return jsonError("Agenda temporariamente indisponível.", 503);
  const { slug } = await params;
  const professional = await getProfessional(slug);
  if (!professional) return jsonError("Agenda não encontrada.", 404);
  const url = new URL(request.url);
  const now = new Date();
  const from = new Date(url.searchParams.get("from") ?? now.toISOString());
  const to = new Date(url.searchParams.get("to") ?? new Date(from.getTime() + 14 * 86400000).toISOString());
  if (!Number.isFinite(from.getTime()) || !Number.isFinite(to.getTime()) || to <= from || to.getTime() - from.getTime() > 31 * 86400000) return jsonError("Consulte um intervalo de até 31 dias.", 422);
  let duration = professional.session_duration_minutes;
  let price = Number(professional.session_price);
  let deposit = Number(professional.deposit_amount);
  const appointmentId = url.searchParams.get("appointmentId");
  if (appointmentId) {
    const { data: appointment } = await admin.from("appointments").select("patient_id,psychologist_id,starts_at,ends_at,session_price,deposit_amount").eq("id", appointmentId).maybeSingle();
    if (!appointment || appointment.psychologist_id !== professional.user_id || ![appointment.patient_id, appointment.psychologist_id].includes(auth.user.id)) return jsonError("Agendamento não encontrado.", 404);
    duration = (new Date(appointment.ends_at).getTime() - new Date(appointment.starts_at).getTime()) / 60000;
    price = Number(appointment.session_price); deposit = Number(appointment.deposit_amount);
  }
  const [rulesResult, blocksResult, appointmentsResult] = await Promise.all([
    admin.from("availability_rules").select("weekday,starts_at,ends_at,valid_from,valid_until").eq("psychologist_id", professional.user_id).eq("active", true),
    admin.from("schedule_blocks").select("starts_at,ends_at").eq("psychologist_id", professional.user_id).eq("active", true).lt("starts_at", to.toISOString()).gt("ends_at", from.toISOString()),
    admin.from("appointments").select("starts_at,ends_at").eq("psychologist_id", professional.user_id).in("status", ["RESERVADO_TEMPORARIAMENTE", "AGUARDANDO_SINAL", "CONFIRMADO"]).lt("starts_at", to.toISOString()).gt("ends_at", from.toISOString()),
  ]);
  if (rulesResult.error || blocksResult.error || appointmentsResult.error) return jsonError("Não foi possível consultar os horários. Tente novamente.", 503);
  const busy = [...(blocksResult.data ?? []), ...(appointmentsResult.data ?? [])];
  const slots = new Map<string, { startsAt: string; endsAt: string }>();
  const localDate = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(from);
  for (let day = new Date(localDate + "T12:00:00Z"); day.getTime() <= to.getTime() + 86400000; day = new Date(day.getTime() + 86400000)) {
    const key = day.toISOString().slice(0, 10);
    for (const rule of rulesResult.data ?? []) {
      if (day.getUTCDay() !== rule.weekday || key < rule.valid_from || (rule.valid_until && key > rule.valid_until)) continue;
      const end = new Date(key + "T" + rule.ends_at + "-03:00").getTime();
      for (let cursor = new Date(key + "T" + rule.starts_at + "-03:00").getTime(); cursor + duration * 60000 <= end; cursor += duration * 60000) {
        const finish = cursor + duration * 60000;
        if (cursor <= now.getTime() || cursor < from.getTime() || finish > to.getTime() || busy.some((item) => cursor < new Date(item.ends_at).getTime() && finish > new Date(item.starts_at).getTime())) continue;
        const startsAt = new Date(cursor).toISOString();
        slots.set(startsAt, { startsAt, endsAt: new Date(finish).toISOString() });
      }
    }
  }
  return Response.json({ slots: [...slots.values()].sort((a,b) => a.startsAt.localeCompare(b.startsAt)), sessionDurationMinutes: duration, sessionPrice: price, depositAmount: deposit, bookingEnabled: true }, { headers: { "Cache-Control": "private, no-store" } });
}
