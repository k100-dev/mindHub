import { cn } from "@/lib/utils";

const styles: Record<string, string> = {
  CONFIRMADO: "bg-emerald-100 text-emerald-800", REALIZADO: "bg-emerald-100 text-emerald-800", ATIVO: "bg-emerald-100 text-emerald-800",
  AGUARDANDO_SINAL: "bg-amber-100 text-amber-800", RESERVADO_TEMPORARIAMENTE: "bg-sky-100 text-sky-800",
  CANCELADO: "bg-rose-100 text-rose-800", NO_SHOW: "bg-rose-100 text-rose-800",
  INATIVO: "bg-slate-200 text-slate-700", EXPIRADO: "bg-slate-200 text-slate-700", REMARCADO: "bg-violet-100 text-violet-800",
};

export function StatusBadge({ status }: { status: string }) {
  return <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-bold", styles[status] ?? "bg-slate-100 text-slate-700")}>{status.replaceAll("_", " ")}</span>;
}
