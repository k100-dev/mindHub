"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SchedulePicker } from "@/components/schedule-picker";

export type Booking = { id: string; status: string; starts_at: string; ends_at: string; session_price: number; deposit_amount: number; paid_amount: number; refund_amount: number; refund_status: string };
const money = (value: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

export function AppointmentActions({ item, professional = false, slug }: { item: Booking; professional?: boolean; slug: string }) {
  const router = useRouter();
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => { const timer = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(timer); }, []);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [panel, setPanel] = useState<"cancel" | "reschedule" | "payment" | "refund" | null>(null);
  const [amount, setAmount] = useState(String(Math.max(Number(item.paid_amount), Number(item.deposit_amount))));
  const active = ["RESERVADO_TEMPORARIAMENTE", "AGUARDANDO_SINAL", "CONFIRMADO"].includes(item.status);
  const future = new Date(item.starts_at).getTime() > now;
  const eligible = new Date(item.starts_at).getTime() - now >= 24 * 3600000;
  async function update(action: string) {
    setLoading(true); setMessage("");
    try {
      const response = await fetch("/api/appointments/" + item.id + "/manage", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, ...(action === "PAYMENT" && { amount: Number(amount) }) }) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error?.message ?? "Não foi possível salvar.");
      setMessage(action === "CANCEL" ? "Agendamento cancelado." : action === "PAYMENT" ? "Pagamento registrado." : action === "REFUND" ? "Reembolso registrado como realizado." : "Agendamento atualizado.");
      setPanel(null); router.refresh();
    } catch (error) { setMessage(error instanceof Error ? error.message : "Falha de conexão. Tente novamente."); }
    finally { setLoading(false); }
  }
  return <div className="space-y-4">
    <div className="flex flex-wrap gap-3">
      {professional && active && future && item.status !== "CONFIRMADO" && <button className="button-primary" disabled={loading || Number(item.paid_amount) < Number(item.deposit_amount)} onClick={() => update("CONFIRM")}>Confirmar atendimento</button>}
      {professional && Number(item.paid_amount) < Number(item.session_price) && item.refund_status !== "COMPLETED" && <button className="button-secondary" disabled={loading} onClick={() => setPanel("payment")}>Registrar pagamento</button>}
      {active && (professional || future) && <button className="button-secondary" disabled={loading} onClick={() => setPanel("cancel")}>Cancelar agendamento</button>}
      {active && (professional || eligible) && <button className="button-secondary" disabled={loading} onClick={() => setPanel("reschedule")}>Remarcar</button>}
      {professional && item.refund_status === "PENDING" && Number(item.refund_amount) > 0 && <button className="button-secondary" disabled={loading} onClick={() => setPanel("refund")}>Registrar reembolso</button>}
      {professional && item.status === "CONFIRMADO" && new Date(item.ends_at).getTime() <= now && <><button className="button-secondary" disabled={loading} onClick={() => update("COMPLETE")}>Marcar como realizado</button><button className="button-secondary" disabled={loading} onClick={() => update("NO_SHOW")}>Registrar ausência</button></>}
    </div>
    {professional && active && Number(item.paid_amount) < Number(item.deposit_amount) && <p className="muted text-sm">Confira e registre o sinal recebido antes de confirmar o atendimento.</p>}
    {!professional && active && !eligible && future && <p className="muted text-sm">Para remarcar com menos de 24 horas de antecedência, entre em contato com a profissional.</p>}
    {panel && <section className="rounded-2xl border border-[#dce5e9] bg-[#f8fbfa] p-4 sm:p-6"><div className="mb-4 flex items-center justify-between gap-3"><h3 className="font-extrabold">{panel === "cancel" ? "Cancelar este atendimento?" : panel === "reschedule" ? "Escolha o novo horário" : panel === "refund" ? "Confirmar reembolso realizado" : "Registrar valor recebido"}</h3><button type="button" className="button-secondary" disabled={loading} onClick={() => setPanel(null)}>Voltar</button></div>
      {panel === "cancel" && <><p className="mb-4 text-sm leading-6">{eligible || professional ? "O horário será liberado. O valor pago será devolvido integralmente pela profissional, de forma manual." : "Faltam menos de 24 horas para o atendimento. O cancelamento libera o horário e não gera reembolso, conforme a política informada."}</p><button className="button-primary" disabled={loading} onClick={() => update("CANCEL")}>Confirmar cancelamento</button></>}
      {panel === "refund" && <><p className="mb-4 text-sm">Confirme somente após devolver {money(Number(item.refund_amount))} ao paciente. Esta ação registra a devolução e não transfere dinheiro.</p><button className="button-primary" disabled={loading} onClick={() => update("REFUND")}>Já realizei o reembolso</button></>}
      {panel === "payment" && <form onSubmit={(e) => { e.preventDefault(); void update("PAYMENT"); }} className="grid max-w-md gap-4"><label className="grid gap-2 text-sm font-bold">Total recebido para esta sessão (R$)<input className="field" type="number" min={Number(item.paid_amount) + .01} max={Number(item.session_price)} step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} required /></label><p className="muted text-sm">Já registrado: {money(Number(item.paid_amount))}. Informe o total acumulado após conferir o recebimento.</p><button className="button-primary" disabled={loading}>Salvar pagamento conferido</button></form>}
      {panel === "reschedule" && <><p className="muted mb-4 text-sm">O valor pago será mantido. O novo horário ficará pendente de confirmação. Se ele não estiver disponível, seu horário atual será preservado.</p><SchedulePicker psychologistSlug={slug} appointmentId={item.id} professional={professional} /></>}
    </section>}
    {message && <p role="status" className="rounded-xl bg-sky-50 p-3 text-sm text-sky-900">{message}</p>}
  </div>;
}
