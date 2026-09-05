import { jsonError } from "@/lib/api";
import { requireActivePatient } from "@/lib/authz";

export async function GET(request: Request) {
  const auth = await requireActivePatient();
  if (!auth) return jsonError("Autenticação necessária.", 401);
  const status = new URL(request.url).searchParams.get("status");
  let query = auth.supabase.from("appointments").select("id,psychologist_id,starts_at,ends_at,status,origin,created_at").eq("patient_id", auth.user.id).order("starts_at", { ascending: false });
  if (status) query = query.eq("status", status);
  const { data, error } = await query;
  if (error) return jsonError("Não foi possível carregar os agendamentos.", 500);
  return Response.json({ appointments: data ?? [] });
}
