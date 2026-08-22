import { jsonError } from "@/lib/api";
import { requireActivePsychologist } from "@/lib/authz";

export async function GET(request: Request) {
  const auth = await requireActivePsychologist();
  if (!auth) return jsonError("Acesso restrito.", 403);
  const url = new URL(request.url);
  const from = new Date(url.searchParams.get("from") ?? new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString());
  const to = new Date(url.searchParams.get("to") ?? new Date().toISOString());
  if (Number.isNaN(from.valueOf()) || Number.isNaN(to.valueOf()) || to < from) return jsonError("Período inválido.", 422);
  const { data, error } = await auth.supabase.from("appointments").select("status").eq("psychologist_id", auth.user.id).gte("starts_at", from.toISOString()).lte("starts_at", to.toISOString());
  if (error) return jsonError("Não foi possível gerar o resumo.", 500);
  const byStatus = (data ?? []).reduce<Record<string, number>>((summary, item) => {
    summary[item.status] = (summary[item.status] ?? 0) + 1;
    return summary;
  }, {});
  return Response.json({ period: { from: from.toISOString(), to: to.toISOString() }, total: data?.length ?? 0, byStatus });
}
