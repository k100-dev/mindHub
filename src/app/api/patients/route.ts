import { handleRouteError, jsonError } from "@/lib/api";
import { requireActivePsychologist } from "@/lib/authz";
import { createAdminClient } from "@/lib/supabase/admin";
import { patientSchema } from "@/lib/validation";

export async function GET(request: Request) {
  const auth = await requireActivePsychologist();
  if (!auth) return jsonError("Acesso restrito a psicóloga ativa.", 403);
  const admin = createAdminClient();
  if (!admin) return jsonError("Supabase administrativo não configurado.", 503);
  const q = new URL(request.url).searchParams.get("q")?.trim().toLowerCase();
  const { data: links, error } = await admin
    .from("psychologist_patients")
    .select("id,status,created_at,patient_id")
    .eq("psychologist_id", auth.user.id)
    .order("created_at", { ascending: false });
  if (error) return jsonError("Não foi possível listar pacientes.", 500);
  const patientIds = (links ?? []).map((item) => item.patient_id);
  const [{ data: profiles }, { data: patientProfiles }] = patientIds.length ? await Promise.all([
    admin.from("profiles").select("user_id,name,phone").in("user_id", patientIds),
    admin.from("patient_profiles").select("user_id,birth_date").in("user_id", patientIds),
  ]) : [{ data: [] }, { data: [] }];
  const { data: appointments } = patientIds.length ? await admin.from("appointments").select("patient_id").eq("psychologist_id", auth.user.id).in("patient_id", patientIds) : { data: [] };
  const patients = (links ?? []).map((link) => ({
    ...link,
    profile: profiles?.find((profile) => profile.user_id === link.patient_id),
    patientProfile: patientProfiles?.find((profile) => profile.user_id === link.patient_id),
    appointments: appointments?.filter((appointment) => appointment.patient_id === link.patient_id).length ?? 0,
  }));
  const filtered = q ? patients.filter((item) => JSON.stringify(item).toLowerCase().includes(q)) : patients;
  return Response.json({ patients: filtered });
}

export async function POST(request: Request) {
  try {
    const auth = await requireActivePsychologist();
    if (!auth) return jsonError("Acesso restrito a psicóloga ativa.", 403);
    const admin = createAdminClient();
    if (!admin) return jsonError("Supabase administrativo não configurado.", 503);
    const input = patientSchema.parse(await request.json());
    const { data: created, error: authError } = await admin.auth.admin.inviteUserByEmail(input.email, {
      redirectTo: `${new URL(request.url).origin}/auth/atualizar-senha`,
      data: { role: "PATIENT", name: input.name, phone: input.phone, invited: true },
    });
    if (authError || !created.user) return jsonError("E-mail já cadastrado ou inválido.", 409);
    if (input.birthDate) await admin.from("patient_profiles").update({ birth_date: input.birthDate }).eq("user_id", created.user.id);
    const { data: link, error } = await admin.from("psychologist_patients").insert({ psychologist_id: auth.user.id, patient_id: created.user.id }).select().single();
    if (error) return jsonError("Não foi possível criar o vínculo com o paciente.", 409);
    await admin.from("audit_logs").insert({ actor_id: auth.user.id, action: "PATIENT_CREATED", resource_type: "psychologist_patient", resource_id: link.id });
    return Response.json({ patient: { id: created.user.id, relationshipId: link.id }, invitationSent: true }, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
