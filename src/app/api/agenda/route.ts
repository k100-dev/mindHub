import { jsonError } from "@/lib/api";
import { requireActivePsychologist } from "@/lib/authz";

export async function GET(request: Request) {
  const auth = await requireActivePsychologist();
  if (!auth) return jsonError("Acesso restrito.", 403);
  const url = new URL(request.url);
  const from = new Date(url.searchParams.get("from") ?? new Date().toISOString());
  const to = new Date(url.searchParams.get("to") ?? new Date(Date.now() + 7 * 86400000).toISOString());
  if (Number.isNaN(from.valueOf()) || Number.isNaN(to.valueOf()) || to <= from) return jsonError("Intervalo inválido.", 422);
  const [{ data: appointments }, { data: blocks }, { data: availability }] = await Promise.all([
    auth.supabase.from("appointments").select("id,patient_id,starts_at,ends_at,status,origin").eq("psychologist_id", auth.user.id).gte("starts_at", from.toISOString()).lt("starts_at", to.toISOString()).order("starts_at"),
    auth.supabase.from("schedule_blocks").select("id,starts_at,ends_at,administrative_reason").eq("psychologist_id", auth.user.id).eq("active", true).lt("starts_at", to.toISOString()).gt("ends_at", from.toISOString()),
    auth.supabase.from("availability_rules").select("*").eq("psychologist_id", auth.user.id).eq("active", true),
  ]);
  return Response.json({ appointments: appointments ?? [], blocks: blocks ?? [], availability: availability ?? [] });
}
