"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, CheckCircle2, Clock3, LoaderCircle, ShieldCheck } from "lucide-react";

const days = [
  { iso: "2026-08-24", weekday: "Seg", day: "24" }, { iso: "2026-08-25", weekday: "Ter", day: "25" },
  { iso: "2026-08-26", weekday: "Qua", day: "26" }, { iso: "2026-08-27", weekday: "Qui", day: "27" },
  { iso: "2026-08-28", weekday: "Sex", day: "28" },
];
const hoursByDay: Record<string, string[]> = {
  "2026-08-24": ["08:00", "10:00", "11:00", "13:00", "15:00", "16:00"],
  "2026-08-25": ["09:00", "11:00", "14:00", "15:00", "17:00"],
  "2026-08-26": ["08:00", "09:00", "10:00", "14:00", "16:00"],
  "2026-08-27": ["09:00", "10:00", "13:00", "15:00"],
  "2026-08-28": ["08:00", "11:00", "14:00", "15:00"],
};

export function SchedulePicker({ psychologistId, depositAmount }: { psychologistId: string; depositAmount: number }) {
  const router = useRouter();
  const [date, setDate] = useState(days[0].iso); const [time, setTime] = useState(""); const [loading, setLoading] = useState(false); const [message, setMessage] = useState("");
  const startsAt = useMemo(() => time ? `${date}T${time}:00-03:00` : "", [date, time]);
  async function reserve() {
    if (!startsAt) return; setLoading(true); setMessage("");
    try {
      const response = await fetch("/api/appointments/holds", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ psychologistId, startsAt }) });
      const body = await response.json();
      if (response.status === 401) { router.push(`/entrar?next=${encodeURIComponent(location.pathname)}`); return; }
      if (!response.ok) throw new Error(body.error?.message ?? "Horário não está mais disponível.");
      if (body.demo) { setMessage("Reserva demonstrativa criada por 15 minutos. Configure o Supabase para persistir e iniciar o pagamento."); return; }
      const checkout = await fetch(`/api/appointments/${body.appointment.id}/checkout`, { method: "POST" });
      const checkoutBody = await checkout.json();
      if (!checkout.ok) throw new Error(checkoutBody.error?.message ?? "Não foi possível iniciar o pagamento.");
      location.href = checkoutBody.checkoutUrl;
    } catch (error) { setMessage(error instanceof Error ? error.message : "Não foi possível reservar."); }
    finally { setLoading(false); }
  }
  return <div className="grid gap-6 lg:grid-cols-[1fr_360px]"><div className="card p-5 sm:p-7"><p className="eyebrow">1. Escolha o dia</p><div className="mt-4 grid grid-cols-5 gap-2">{days.map((item) => <button key={item.iso} onClick={() => { setDate(item.iso); setTime(""); }} className={`rounded-xl border p-3 text-center ${date === item.iso ? 'border-[#117f72] bg-[#117f72] text-white' : 'border-[#dfe7ea] bg-white hover:border-[#55aa9f]'}`}><span className="block text-xs opacity-70">{item.weekday}</span><span className="mt-1 block text-xl font-black">{item.day}</span></button>)}</div><p className="eyebrow mt-8">2. Selecione o horário</p><div className="mt-4 flex flex-wrap gap-3">{hoursByDay[date].map((hour) => <button key={hour} onClick={() => setTime(hour)} className={`min-w-20 rounded-xl border px-4 py-3 font-extrabold ${time === hour ? 'border-[#117f72] bg-[#e8f5f2] text-[#0d6e63]' : 'border-[#dce5e9] bg-white hover:border-[#55aa9f]'}`}>{hour}</button>)}</div></div><aside className="card h-fit p-6"><h2 className="text-lg font-extrabold">Resumo da consulta</h2>{time ? <div className="mt-5 grid gap-4 text-sm"><p className="flex items-center gap-3"><CalendarDays className="text-[#117f72]" size={19} />{date.split('-').reverse().join('/')}</p><p className="flex items-center gap-3"><Clock3 className="text-[#117f72]" size={19} />{time} · 60 minutos</p><div className="rounded-xl bg-[#edf7f5] p-4"><p className="text-xs text-[#54756f]">Sinal para confirmação</p><p className="mt-1 text-xl font-black text-[#0d6e63]">{new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(depositAmount)}</p></div><button className="button-primary w-full" disabled={loading} onClick={reserve}>{loading ? <LoaderCircle className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}{loading ? 'Reservando…' : 'Reservar e pagar sinal'}</button><p className="muted flex gap-2 text-xs leading-5"><ShieldCheck size={17} className="shrink-0 text-[#117f72]" />O pagamento é processado pelo Mercado Pago. O MindHub não armazena dados do cartão.</p></div> : <div className="mt-5 rounded-xl bg-slate-50 p-5 text-center text-sm text-slate-500">Escolha um horário para ver o resumo.</div>}{message && <p role="alert" className="mt-4 rounded-xl bg-amber-50 p-3 text-sm leading-5 text-amber-900">{message}</p>}</aside></div>;
}
