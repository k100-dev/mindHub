"use client";

import { addDays, addMonths, addWeeks, endOfMonth, endOfWeek, format, isWithinInterval, parseISO, startOfMonth, startOfWeek } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { StatusBadge } from "@/components/status-badge";
import { initialDemoWorkspace, loadDemoWorkspace, saveDemoWorkspace, type DemoWorkspace } from "@/lib/demo-workspace";

type View = "DIA" | "SEMANA" | "MES";

function intervalFor(view: View, anchor: Date) {
  if (view === "DIA") return { start: anchor, end: anchor };
  if (view === "MES") return { start: startOfMonth(anchor), end: endOfMonth(anchor) };
  return { start: startOfWeek(anchor, { weekStartsOn: 1 }), end: endOfWeek(anchor, { weekStartsOn: 1 }) };
}

export function AgendaWorkspace() {
  const [workspace, setWorkspace] = useState<DemoWorkspace>(initialDemoWorkspace);
  const [view, setView] = useState<View>("SEMANA");
  const [anchor, setAnchor] = useState(() => new Date());
  const [message, setMessage] = useState("");
  useEffect(() => {
    queueMicrotask(() => setWorkspace(loadDemoWorkspace()));
  }, []);

  const interval = useMemo(() => intervalFor(view, anchor), [anchor, view]);
  const visible = useMemo(() => workspace.appointments
    .filter((appointment) => isWithinInterval(parseISO(`${appointment.date}T12:00:00`), interval))
    .sort((a, b) => `${a.date}${a.start}`.localeCompare(`${b.date}${b.start}`)), [interval, workspace.appointments]);

  function move(direction: number) {
    setAnchor((current) => view === "DIA" ? addDays(current, direction) : view === "MES" ? addMonths(current, direction) : addWeeks(current, direction));
  }

  function createAppointment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const patientId = String(form.get("patientId"));
    const date = String(form.get("date"));
    const start = String(form.get("start"));
    const patient = workspace.patients.find((item) => item.id === patientId);
    if (!patient) return setMessage("Selecione um paciente ativo.");
    if (workspace.appointments.some((item) => item.date === date && item.start === start && item.status !== "CANCELADO")) return setMessage("Conflito: este horário já está ocupado.");
    const next: DemoWorkspace = {
      patients: workspace.patients.map((item) => item.id === patientId ? { ...item, appointments: item.appointments + 1 } : item),
      appointments: [...workspace.appointments, { id: `demo-appt-${Date.now()}`, patientId, patient: patient.name, date, start, status: "CONFIRMADO" }],
    };
    setWorkspace(next); saveDemoWorkspace(next); setAnchor(parseISO(`${date}T12:00:00`)); setMessage("Agendamento criado e horário bloqueado."); event.currentTarget.reset();
  }

  const title = view === "DIA"
    ? format(anchor, "EEEE, dd 'de' MMMM", { locale: ptBR })
    : `${format(interval.start, "dd MMM", { locale: ptBR })} – ${format(interval.end, "dd MMM yyyy", { locale: ptBR })}`;

  return <div className="grid gap-6 xl:grid-cols-[1fr_330px]">
    <section className="card overflow-hidden">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e6ecef] p-4"><div className="flex gap-2"><button onClick={() => move(-1)} className="button-secondary !min-h-9 !px-2" aria-label="Período anterior"><ChevronLeft size={18} /></button><button onClick={() => move(1)} className="button-secondary !min-h-9 !px-2" aria-label="Próximo período"><ChevronRight size={18} /></button></div><p className="font-extrabold capitalize">{title}</p><button onClick={() => setAnchor(new Date())} className="button-secondary !min-h-9">Hoje</button></header>
      <div className="flex gap-1 border-b border-[#e6ecef] bg-[#f6f8f9] p-3">{(["DIA", "SEMANA", "MES"] as View[]).map((item) => <button key={item} onClick={() => setView(item)} className={`rounded-lg px-3 py-2 text-sm font-bold ${view === item ? "bg-[#117f72] text-white" : "text-[#516378]"}`}>{item === "MES" ? "Mês" : item[0] + item.slice(1).toLowerCase()}</button>)}</div>
      <p className="bg-emerald-50 px-4 py-3 text-xs font-bold text-emerald-900">Demonstração funcional: novos agendamentos persistem neste navegador e conflitos são impedidos.</p>
      <div className="grid gap-3 p-4">{visible.map((appointment) => <article key={appointment.id} className="flex flex-col gap-3 rounded-xl border border-[#e1e8eb] p-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-xs font-extrabold uppercase tracking-wide text-[#117f72]">{format(parseISO(`${appointment.date}T12:00:00`), "EEE, dd/MM", { locale: ptBR })} · {appointment.start}</p><h3 className="mt-1 font-extrabold">{appointment.patient}</h3></div><StatusBadge status={appointment.status} /></article>)}{!visible.length && <div className="p-8 text-center text-[#66758d]"><p className="font-extrabold text-[#17233c]">Agenda livre neste período</p><p className="mt-1 text-sm">Crie um agendamento usando o formulário ao lado.</p></div>}</div>
    </section>
    <aside className="card h-fit p-5"><h2 className="flex items-center gap-2 font-extrabold"><Plus size={18} /> Novo agendamento</h2><form onSubmit={createAppointment} className="mt-5 grid gap-4"><label className="grid gap-2 text-sm font-bold">Paciente<select required name="patientId" className="field"><option value="">Selecione</option>{workspace.patients.filter((patient) => patient.status === "ATIVO").map((patient) => <option key={patient.id} value={patient.id}>{patient.name}</option>)}</select></label><label className="grid gap-2 text-sm font-bold">Data<input required name="date" type="date" className="field" defaultValue={format(new Date(), "yyyy-MM-dd")} /></label><label className="grid gap-2 text-sm font-bold">Horário<input required name="start" type="time" className="field" defaultValue="09:00" /></label><button className="button-primary">Criar agendamento</button>{message && <p role="status" className="rounded-xl bg-sky-50 p-3 text-sm font-bold text-sky-900">{message}</p>}</form></aside>
  </div>;
}
