import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PageHeading } from "@/components/page-heading";
import { demoAppointments } from "@/lib/demo-data";

const days = ["Seg 24", "Ter 25", "Qua 26", "Qui 27", "Sex 28"];
export default function AgendaPage() {
  return <><PageHeading title="Agenda" description="Visualize horários, reservas e consultas confirmadas." action={<div className="flex rounded-xl border border-[#d7e0e5] bg-white p-1 text-sm font-bold"><button className="rounded-lg px-3 py-2">Dia</button><button className="rounded-lg bg-[#e8f5f2] px-3 py-2 text-[#117f72]">Semana</button><button className="rounded-lg px-3 py-2">Mês</button></div>} />
    <section className="card overflow-hidden"><header className="flex items-center justify-between border-b border-[#e6ecef] p-4"><div className="flex gap-2"><button className="button-secondary !min-h-9 !px-2" aria-label="Semana anterior"><ChevronLeft size={18} /></button><button className="button-secondary !min-h-9 !px-2" aria-label="Próxima semana"><ChevronRight size={18} /></button></div><p className="font-extrabold">24–28 de agosto de 2026</p><button className="button-secondary !min-h-9">Hoje</button></header>
      <div className="grid min-w-[760px] grid-cols-[72px_repeat(5,1fr)]"><div className="border-b border-r border-[#e7ecef]" />{days.map((day) => <div key={day} className="border-b border-r border-[#e7ecef] p-4 text-center text-sm font-extrabold last:border-r-0">{day}</div>)}
        {[8,9,10,11,12,13,14,15,16,17,18].flatMap((hour) => [<div key={`h-${hour}`} className="h-20 border-b border-r border-[#e7ecef] p-3 text-xs text-[#8a98aa]">{String(hour).padStart(2,'0')}:00</div>, ...days.map((_, dayIndex) => { const item = demoAppointments.find((a) => Number(a.start.slice(0,2)) === hour && new Date(`${a.date}T12:00:00Z`).getUTCDay() - 1 === dayIndex); return <div key={`${dayIndex}-${hour}`} className="relative h-20 border-b border-r border-[#edf1f3] p-1 last:border-r-0">{item && <Link href={`/app/agendamentos/${item.id}`} className="block h-full rounded-lg bg-[#42afa9] p-2 text-xs font-bold text-white shadow-sm"><span className="block">{item.start}</span><span className="mt-1 block truncate">{item.patient}</span></Link>}</div>; })])}
      </div></section></>;
}
