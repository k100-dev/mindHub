"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, CalendarDays } from "lucide-react";
import { StatusBadge } from "@/components/status-badge";

type Appointment = { id: string; starts_at: string; ends_at: string; status: string; professionalName: string };
export function PatientAppointments({ appointments, now }: { appointments: Appointment[]; now: number }) {
  const [tab, setTab] = useState("upcoming");
  const upcoming = (item: Appointment) => new Date(item.ends_at).getTime() >= now && !["CANCELADO", "REALIZADO", "NAO_COMPARECEU"].includes(item.status);
  const items = appointments.filter(item => tab === "upcoming" ? upcoming(item) : !upcoming(item)).sort((a,b) => tab === "upcoming" ? a.starts_at.localeCompare(b.starts_at) : b.starts_at.localeCompare(a.starts_at));
  return <><div className="mb-6 flex gap-2 border-b border-[#dfe7d8] pb-4" aria-label="Período dos encontros">{[{id:"upcoming",label:"Próximos encontros"},{id:"history",label:"Histórico"}].map(item=><button key={item.id} aria-pressed={tab===item.id} className={`rounded-full px-5 py-3 text-sm font-semibold ${tab===item.id?'bg-[#315c42] text-white':'bg-white text-[#667b5d]'}`} onClick={()=>setTab(item.id)}>{item.label}</button>)}</div><div className="grid gap-4">{items.map(item=><Link key={item.id} href={`/hub/agendamentos/${item.id}`} className="card flex flex-wrap items-center gap-4 p-5 hover:border-[#95ac87]"><span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[#edf3e5] text-[#648454]"><CalendarDays size={23}/></span><div className="min-w-0 flex-1"><p className="font-semibold">{new Intl.DateTimeFormat("pt-BR", { dateStyle:"long",timeStyle:"short",timeZone:"America/Sao_Paulo" }).format(new Date(item.starts_at))}</p><p className="mt-1 text-sm text-[#7b8b73]">Com {item.professionalName}</p></div><StatusBadge status={item.status}/><ArrowRight size={17} className="text-[#869b7b]"/></Link>)}{!items.length&&<div className="card flex flex-col items-center px-6 py-14 text-center"><CalendarDays className="mb-5 text-[#7d9970]" size={32}/><h2 className="font-serif text-2xl text-[#365b40]">{tab==='upcoming'?'Há espaço para um novo começo.':'Cada encontro faz parte do caminho.'}</h2><p className="mt-3 max-w-sm text-sm leading-7 text-[#7b8b73]">{tab==='upcoming'?'Quando quiser, escolha um horário que combine com sua rotina.':'Seus encontros anteriores e cancelados aparecerão aqui.'}</p>{tab==='upcoming'&&<Link href="/hub/agendar" className="button-primary mt-6">Escolher um horário <ArrowRight size={17}/></Link>}</div>}</div></>;
}
