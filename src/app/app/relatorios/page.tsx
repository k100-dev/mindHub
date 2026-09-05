import { PageHeading } from "@/components/page-heading";
import { requireActivePsychologist } from "@/lib/authz";

const labels: Record<string, string> = { CONFIRMADO: "Confirmados", REALIZADO: "Realizados", CANCELADO: "Cancelados", NO_SHOW: "Ausências", AGUARDANDO_SINAL: "Aguardando sinal", RESERVADO_TEMPORARIAMENTE: "Reservas temporárias", REMARCADO: "Remarcados", EXPIRADO: "Expirados" };
export default async function ReportsPage() {
  const auth = await requireActivePsychologist(); if (!auth) return null;
  const from = new Date(); from.setMonth(from.getMonth() - 6);
  const { data } = await auth.supabase.from("appointments").select("status").eq("psychologist_id", auth.user.id).gte("starts_at", from.toISOString());
  const summary = (data ?? []).reduce<Record<string, number>>((result, item) => ({ ...result, [item.status]: (result[item.status] ?? 0) + 1 }), {});
  return <><PageHeading title="Histórico e relatórios" description="Indicadores administrativos dos últimos seis meses." /><section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><article className="card p-5"><p className="muted text-sm">Agendamentos</p><p className="mt-2 text-3xl font-black">{data?.length ?? 0}</p></article>{Object.entries(summary).map(([status, value]) => <article key={status} className="card p-5"><p className="muted text-sm">{labels[status] ?? status}</p><p className="mt-2 text-3xl font-black">{value}</p></article>)}</section>{!data?.length && <div className="card mt-6 p-8 text-center text-[#66758d]">Ainda não há dados para este período.</div>}</>;
}
