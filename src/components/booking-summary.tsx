import type { Booking } from "@/components/appointment-actions";
const money = (value: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
export function BookingSummary({ item, instructions = "" }: { item: Booking; instructions?: string }) {
  const pending = ["AGUARDANDO_SINAL", "RESERVADO_TEMPORARIAMENTE"].includes(item.status);
  return <div className="my-6 space-y-4">
    {pending && <div className="rounded-xl bg-amber-50 p-4 text-amber-950"><p className="font-extrabold">Agendamento pendente</p><p className="mt-1 text-sm">A psicóloga irá confirmar seu horário em breve!</p></div>}
    <dl className="grid gap-4 rounded-xl bg-[#f2f7f5] p-4 sm:grid-cols-3"><div><dt className="muted text-sm">Preço da sessão</dt><dd className="mt-1 font-extrabold">{money(Number(item.session_price))}</dd></div><div><dt className="muted text-sm">Sinal</dt><dd className="mt-1 font-extrabold">{money(Number(item.deposit_amount))}</dd></div><div><dt className="muted text-sm">Pagamento registrado</dt><dd className="mt-1 font-extrabold">{money(Number(item.paid_amount))}</dd></div></dl>
    {pending && Number(item.paid_amount) < Number(item.deposit_amount) && <div className="rounded-xl border border-[#dfe6eb] p-4"><h3 className="font-bold">Como pagar o sinal</h3><p className="muted mt-2 whitespace-pre-wrap text-sm leading-6">{instructions || "A profissional entrará em contato para orientar o pagamento do sinal. Seu horário já está reservado."}</p><p className="muted mt-2 text-xs">O recebimento é conferido manualmente pela profissional.</p></div>}
    {item.refund_status === "PENDING" && <p className="rounded-xl bg-amber-50 p-4 text-sm text-amber-950">{Number(item.refund_amount) > 0 ? `Reembolso pendente: ${money(Number(item.refund_amount))}. A profissional realizará a devolução manualmente.` : "Cancelamento com direito à devolução integral. Caso tenha pago, a profissional conferirá o recebimento e registrará o reembolso."}</p>}
    {item.refund_status === "COMPLETED" && <p className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-950">Reembolso realizado: {money(Number(item.refund_amount))}.</p>}
    {item.refund_status === "NOT_ELIGIBLE" && <p className="muted text-sm">Cancelamento realizado com menos de 24 horas de antecedência, sem reembolso.</p>}
  </div>;
}
