import { jsonError } from "@/lib/api";
import { requireActivePsychologist } from "@/lib/authz";

export async function POST(_: Request, { params }: RouteContext<"/api/patients/[id]/reactivate">) {
  const auth = await requireActivePsychologist();
  if (!auth) return jsonError("Acesso restrito.", 403);
  const { id } = await params;
  const { data: link } = await auth.supabase.from("psychologist_patients").select("id,status").eq("psychologist_id", auth.user.id).eq("patient_id", id).maybeSingle();
  if (!link) return jsonError("Paciente não encontrado.", 404);
  if (link.status === "ATIVO") return jsonError("Paciente já está ativo.", 409);
  const { error } = await auth.supabase.from("psychologist_patients").update({ status: "ATIVO" }).eq("id", link.id);
  if (error) return jsonError("Não foi possível reativar o paciente.", 500);
  await auth.supabase.from("audit_logs").insert({ actor_id: auth.user.id, action: "PATIENT_REACTIVATED", resource_type: "psychologist_patient", resource_id: link.id });
  return Response.json({ status: "ATIVO" });
}
