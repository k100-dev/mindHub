import { handleRouteError, jsonError } from "@/lib/api";
import { requireActivePsychologist } from "@/lib/authz";
import { createAdminClient } from "@/lib/supabase/admin";
import { patientSchema } from "@/lib/validation";

async function scopedPatient(psychologistId: string, patientId: string) {
  const admin = createAdminClient();
  if (!admin) return { admin: null, link: null };
  const { data: link } = await admin.from("psychologist_patients").select("id,status,patient_id").eq("psychologist_id", psychologistId).eq("patient_id", patientId).maybeSingle();
  return { admin, link };
}

export async function GET(_: Request, { params }: RouteContext<"/api/patients/[id]">) {
  const auth = await requireActivePsychologist();
  if (!auth) return jsonError("Acesso restrito.", 403);
  const { id } = await params;
  const { admin, link } = await scopedPatient(auth.user.id, id);
  if (!admin) return jsonError("Supabase administrativo não configurado.", 503);
  if (!link) return jsonError("Paciente não encontrado.", 404);
  const [{ data: profile }, { data: patient }, { data: appointments }] = await Promise.all([
    admin.from("profiles").select("name,phone").eq("user_id", id).single(),
    admin.from("patient_profiles").select("birth_date,status").eq("user_id", id).single(),
    admin.from("appointments").select("id,starts_at,status").eq("psychologist_id", auth.user.id).eq("patient_id", id).order("starts_at", { ascending: false }).limit(50),
  ]);
  return Response.json({ patient: { ...profile, ...patient, relationship: link }, appointments: appointments ?? [] });
}

export async function PATCH(request: Request, { params }: RouteContext<"/api/patients/[id]">) {
  try {
    const auth = await requireActivePsychologist();
    if (!auth) return jsonError("Acesso restrito.", 403);
    const { id } = await params;
    const { admin, link } = await scopedPatient(auth.user.id, id);
    if (!admin) return jsonError("Supabase administrativo não configurado.", 503);
    if (!link) return jsonError("Paciente não encontrado.", 404);
    const input = patientSchema.partial().parse(await request.json());
    if (input.name || input.phone) await admin.from("profiles").update({ ...(input.name && { name: input.name }), ...(input.phone && { phone: input.phone }) }).eq("user_id", id);
    if (input.birthDate) await admin.from("patient_profiles").update({ birth_date: input.birthDate }).eq("user_id", id);
    await admin.from("audit_logs").insert({ actor_id: auth.user.id, action: "PATIENT_UPDATED", resource_type: "psychologist_patient", resource_id: link.id });
    return Response.json({ updated: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
