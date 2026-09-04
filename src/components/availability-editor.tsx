"use client";

import { useEffect, useState } from "react";
import { Save } from "lucide-react";

const initial = [
  { day: "Segunda-feira", enabled: true, start: "08:00", end: "18:00" }, { day: "Terça-feira", enabled: true, start: "08:00", end: "18:00" },
  { day: "Quarta-feira", enabled: true, start: "08:00", end: "18:00" }, { day: "Quinta-feira", enabled: true, start: "09:00", end: "17:00" },
  { day: "Sexta-feira", enabled: true, start: "08:00", end: "16:00" }, { day: "Sábado", enabled: false, start: "08:00", end: "12:00" },
  { day: "Domingo", enabled: false, start: "08:00", end: "12:00" },
];

export function AvailabilityEditor() {
  const [days, setDays] = useState(initial); const [message, setMessage] = useState(""); const [saving, setSaving] = useState(false);
  useEffect(() => { queueMicrotask(() => { try { const saved = window.localStorage.getItem("mindhub.demo.availability.v1"); if (saved) setDays(JSON.parse(saved)); } catch { /* mantém padrão seguro */ } }); }, []);
  function update(index: number, patch: Partial<(typeof initial)[number]>) { setMessage(""); setDays((current) => current.map((item, i) => i === index ? { ...item, ...patch } : item)); }
  async function save() { setSaving(true); setMessage(""); try { if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) { window.localStorage.setItem("mindhub.demo.availability.v1", JSON.stringify(days)); setMessage("Disponibilidade salva no modo demonstrativo deste navegador."); return; } const response = await fetch("/api/availability-rules", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ rules: days.map((item, index) => ({ weekday: index === 6 ? 0 : index + 1, startsAt: item.start, endsAt: item.end, enabled: item.enabled })), sessionDurationMinutes: 60 }) }); const body = await response.json(); if (!response.ok) throw new Error(body.error?.message ?? "Não foi possível salvar."); setMessage("Disponibilidade salva com sucesso."); } catch (error) { setMessage(error instanceof Error ? error.message : "Não foi possível salvar."); } finally { setSaving(false); } }
  return <div className="grid gap-4">{days.map((item, index) => <div key={item.day} className="grid items-center gap-3 rounded-xl border border-[#e3eaed] p-3 sm:grid-cols-[180px_56px_1fr_20px_1fr]"><span className="font-bold">{item.day}</span><button type="button" aria-pressed={item.enabled} aria-label={`${item.enabled ? 'Desativar' : 'Ativar'} ${item.day}`} onClick={() => update(index, { enabled: !item.enabled })} className={`relative h-7 w-12 rounded-full ${item.enabled ? 'bg-[#20a596]' : 'bg-slate-300'}`}><span className={`absolute top-1 size-5 rounded-full bg-white transition-all ${item.enabled ? 'left-6' : 'left-1'}`} /></button><input className="field disabled:bg-slate-100" type="time" value={item.start} disabled={!item.enabled} onChange={(e) => update(index, { start: e.target.value })} /><span className="text-center text-sm text-slate-400">até</span><input className="field disabled:bg-slate-100" type="time" value={item.end} disabled={!item.enabled} onChange={(e) => update(index, { end: e.target.value })} /></div>)}<button disabled={saving} onClick={save} className="button-primary mt-2"><Save size={18} />{saving ? "Salvando…" : "Salvar alterações"}</button>{message && <p role="status" className="rounded-xl bg-sky-50 p-3 text-sm font-bold text-sky-900">{message}</p>}</div>;
}
