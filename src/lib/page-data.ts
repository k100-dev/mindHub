import "server-only";

import { requireActivePatient, requireActivePsychologist } from "@/lib/authz";
import { createAdminClient } from "@/lib/supabase/admin";

export async function getProfessionalDashboard() {
  const auth = await requireActivePsychologist(); const admin = createAdminClient();
  if (!auth || !admin) return null;
  const now = new Date(); const end = new Date(now.getTime() + 14 * 86400000);
  const [{ data: appointments }, { count: patientCount }] = await Promise.all([
    admin.from("appointments").select("id,patient_id,starts_at,ends_at,status").eq("psychologist_id", auth.user.id).gte("starts_at", now.toISOString()).lt("starts_at", end.toISOString()).order("starts_at").limit(20),
    admin.from("psychologist_patients").select("id", { count: "exact", head: true }).eq("psychologist_id", auth.user.id).eq("status", "ATIVO"),
  ]);
  const patientIds = [...new Set((appointments ?? []).map((item) => item.patient_id))];
  const { data: profiles } = patientIds.length ? await admin.from("profiles").select("user_id,name").in("user_id", patientIds) : { data: [] };
  return { name: auth.professional.professional_name, patientCount: patientCount ?? 0, appointments: (appointments ?? []).map((item) => ({ ...item, patientName: profiles?.find((profile) => profile.user_id === item.patient_id)?.name ?? "Paciente" })) };
}

export async function getProfessionalAppointment(id: string) {
  const auth = await requireActivePsychologist(); const admin = createAdminClient();
  if (!auth || !admin) return null;
  const { data: appointment } = await admin.from("appointments").select("id,patient_id,starts_at,ends_at,status,origin").eq("id", id).eq("psychologist_id", auth.user.id).maybeSingle();
  if (!appointment) return null;
  const { data: patient } = await admin.from("profiles").select("name,phone").eq("user_id", appointment.patient_id).single();
  const { data: payment } = await admin.from("payments").select("status,amount").eq("appointment_id", id).order("requested_at", { ascending: false }).limit(1).maybeSingle();
  return { ...appointment, patient, payment };
}

export async function getPatientArea() {
  const auth = await requireActivePatient(); const admin = createAdminClient();
  if (!auth || !admin) return null;
  const { data: appointments } = await admin.from("appointments").select("id,psychologist_id,starts_at,ends_at,status,origin").eq("patient_id", auth.user.id).order("starts_at", { ascending: false }).limit(50);
  const psychologistIds = [...new Set((appointments ?? []).map((item) => item.psychologist_id))];
  const { data: professionals } = psychologistIds.length ? await admin.from("psychologist_profiles").select("user_id,professional_name").in("user_id", psychologistIds) : { data: [] };
  const enriched = (appointments ?? []).map((item) => ({ ...item, professionalName: professionals?.find((professional) => professional.user_id === item.psychologist_id)?.professional_name ?? "Profissional" }));
  return { name: auth.profile.name, email: auth.user.email ?? "", appointments: enriched };
}

export async function getPatientAppointment(id: string) {
  const auth = await requireActivePatient(); const admin = createAdminClient();
  if (!auth || !admin) return null;
  const { data: appointment } = await admin.from("appointments").select("id,psychologist_id,starts_at,ends_at,status,origin").eq("id", id).eq("patient_id", auth.user.id).maybeSingle();
  if (!appointment) return null;
  const [{ data: professional }, { data: payment }] = await Promise.all([
    admin.from("psychologist_profiles").select("professional_name").eq("user_id", appointment.psychologist_id).single(),
    admin.from("payments").select("status,amount").eq("appointment_id", id).order("requested_at", { ascending: false }).limit(1).maybeSingle(),
  ]);
  return { ...appointment, professionalName: professional?.professional_name ?? "Profissional", payment };
}

