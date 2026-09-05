"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, CheckCircle2, Clock3, LoaderCircle, ShieldCheck } from "lucide-react";

type Slot = { startsAt: string; endsAt: string };
type ScheduleData = { slots: Slot[]; sessionDurationMinutes: number; depositAmount: number; bookingEnabled: boolean };

function dayKey(value: string) { return value.slice(0, 10); }
function dateLabel(value: string) { return new Intl.DateTimeFormat("pt-BR", { weekday: "short", day: "2-digit", month: "short", timeZone: "America/Sao_Paulo" }).format(new Date(value)); }
function timeLabel(value: string) { return new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: "America/Sao_Paulo" }).format(new Date(value)); }

export function SchedulePicker({ psychologistSlug }: { psychologistSlug: string }) {
  const [data, setData] = useState<ScheduleData | null>(null);
  const [selected, setSelected] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [reserving, setReserving] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const from = new Date(); const to = new Date(Date.now() + 14 * 86400000);
    fetch(`/api/public/psychologists/${psychologistSlug}/slots?from=${encodeURIComponent(from.toISOString())}&to=${encodeURIComponent(to.toISOString())}`, { cache: "no-store", signal: controller.signal })
      .then(async (response) => { const body = await response.json(); if (!response.ok) throw new Error(body.error?.message ?? "Não foi possível carregar os horários."); return body; })
      .then(setData).catch((error) => { if (error.name !== "AbortError") setMessage(error.message); }).finally(() => setLoading(false));
    return () => controller.abort();
  }, [psychologistSlug]);

  const days = useMemo(() => {
    const grouped = new Map<string, Slot[]>();
    for (const slot of data?.slots ?? []) grouped.set(dayKey(slot.startsAt), [...(grouped.get(dayKey(slot.startsAt)) ?? []), slot]);
    return [...grouped.entries()];
  }, [data]);

  async function reserve() {
    if (!selected || !data?.bookingEnabled) return;
    setReserving(true); setMessage("");
    try {
      const response = await fetch("/api/appointments/holds", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ psychologistSlug, startsAt: selected }) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error?.message ?? "O horário não está mais disponível.");
      const checkout = await fetch(`/api/appointments/${body.appointment.id}/checkout`, { method: "POST" });
      const checkoutBody = await checkout.json();
      if (!checkout.ok || !checkoutBody.checkoutUrl) throw new Error(checkoutBody.error?.message ?? "Não foi possível iniciar a confirmação.");
      location.assign(checkoutBody.checkoutUrl);
    } catch (error) { setMessage(error instanceof Error ? error.message : "Não foi possível reservar."); }
    finally { setReserving(false); }
  }

  if (loading) return <div className="card flex min-h-56 items-center justify-center gap-3 p-8"><LoaderCircle className="animate-spin text-[#117f72]" /> Carregando horários…</div>;
  if (!data) return <div className="card p-6"><p className="font-extrabold">Agenda indisponível</p><p role="alert" className="muted mt-2">{message || "Tente novamente mais tarde."}</p></div>;
  return <div className="grid gap-6 lg:grid-cols-[1fr_340px]"><section className="card p-5 sm:p-7"><p className="eyebrow">Horários liberados</p>{days.length ? <div className="mt-5 grid gap-6">{days.map(([day, slots]) => <fieldset key={day}><legend className="font-extrabold capitalize">{dateLabel(slots[0].startsAt)}</legend><div className="mt-3 flex flex-wrap gap-3">{slots.map((slot) => <button key={slot.startsAt} type="button" onClick={() => setSelected(slot.startsAt)} aria-pressed={selected === slot.startsAt} className={`min-w-24 rounded-xl border px-4 py-3 font-extrabold ${selected === slot.startsAt ? "border-[#117f72] bg-[#e8f5f2] text-[#0d6e63]" : "border-[#dce5e9] bg-white hover:border-[#55aa9f]"}`}>{timeLabel(slot.startsAt)}</button>)}</div></fieldset>)}</div> : <div className="mt-5 rounded-xl bg-slate-50 p-6 text-sm text-slate-600">Não há horários liberados nos próximos 14 dias.</div>}</section><aside className="card h-fit p-6"><h2 className="text-lg font-extrabold">Resumo</h2>{selected ? <div className="mt-5 grid gap-4 text-sm"><p className="flex items-center gap-3"><CalendarDays className="text-[#117f72]" size={19} />{dateLabel(selected)}</p><p className="flex items-center gap-3"><Clock3 className="text-[#117f72]" size={19} />{timeLabel(selected)} · {data.sessionDurationMinutes} minutos</p>{data.depositAmount > 0 && <p className="rounded-xl bg-[#edf7f5] p-4"><span className="block text-xs text-[#54756f]">Sinal informado pela profissional</span><strong className="mt-1 block text-xl text-[#0d6e63]">{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(data.depositAmount)}</strong></p>}<button className="button-primary w-full" disabled={reserving || !data.bookingEnabled} onClick={reserve}>{reserving ? <LoaderCircle className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}{reserving ? "Reservando…" : "Continuar"}</button>{!data.bookingEnabled && <p className="rounded-xl bg-amber-50 p-3 text-sm leading-5 text-amber-900">A confirmação de novos horários ainda não foi habilitada pela responsável.</p>}<p className="muted flex gap-2 text-xs leading-5"><ShieldCheck size={17} className="shrink-0 text-[#117f72]" />O horário é reservado no servidor; nenhuma confirmação é simulada.</p></div> : <p className="muted mt-5 text-sm">Selecione um horário para continuar.</p>}{message && <p role="alert" className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">{message}</p>}</aside></div>;
}
