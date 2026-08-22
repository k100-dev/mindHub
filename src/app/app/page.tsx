import Link from "next/link";
import { BellRing, CalendarCheck2, CircleAlert, UsersRound } from "lucide-react";
import { PageHeading } from "@/components/page-heading";
import { StatusBadge } from "@/components/status-badge";
import { demoAppointments } from "@/lib/demo-data";

const metrics = [
  { label: "Agendamentos hoje", value: "4", icon: CalendarCheck2, color: "text-[#117f72] bg-[#e8f5f2]" },
  { label: "Pacientes ativos", value: "18", icon: UsersRound, color: "text-sky-700 bg-sky-50" },
  { label: "Taxa de no-show", value: "8%", icon: CircleAlert, color: "text-amber-700 bg-amber-50" },
  { label: "Lembretes próximos", value: "3", icon: BellRing, color: "text-violet-700 bg-violet-50" },
];

export default function DashboardPage() {
  return <><PageHeading eyebrow="Sábado, 22 de agosto" title="Olá, Isadora" description="Acompanhe a agenda e as pendências operacionais de hoje." action={<Link href="/app/pacientes/novo" className="button-primary">+ Novo paciente</Link>} />
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{metrics.map(({ label, value, icon: Icon, color }) => <article key={label} className="card flex items-center justify-between p-5"><div><p className="muted text-sm">{label}</p><p className="mt-2 text-3xl font-black">{value}</p></div><span className={`grid size-12 place-items-center rounded-2xl ${color}`}><Icon size={23} /></span></article>)}</section>
    <section className="mt-6 grid gap-6 xl:grid-cols-[1fr_330px]"><div className="card overflow-hidden"><div className="flex items-center justify-between border-b border-[#e5ebee] p-5"><div><h2 className="text-lg font-extrabold">Próximos agendamentos</h2><p className="muted mt-1 text-sm">Semana de 24 a 28 de agosto</p></div><Link href="/app/agenda" className="text-sm font-extrabold text-[#117f72]">Ver agenda</Link></div><div className="divide-y divide-[#edf1f3]">{demoAppointments.map((item) => <Link href={`/app/agendamentos/${item.id}`} key={item.id} className="grid grid-cols-[65px_1fr_auto] items-center gap-4 p-5 hover:bg-[#f8fbfb]"><div className="rounded-xl bg-[#edf7f5] py-2 text-center"><p className="text-lg font-black text-[#117f72]">{item.start}</p></div><div><p className="font-extrabold">{item.patient}</p><p className="muted mt-1 text-sm">{new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: '2-digit', month: 'short', timeZone: 'UTC' }).format(new Date(`${item.date}T12:00:00Z`))}</p></div><StatusBadge status={item.status} /></Link>)}</div></div>
    <aside className="card p-5"><h2 className="text-lg font-extrabold">Atenção hoje</h2><div className="mt-5 grid gap-3"><div className="rounded-2xl border border-amber-200 bg-amber-50 p-4"><p className="text-sm font-extrabold text-amber-900">1 sinal aguardando</p><p className="mt-1 text-xs leading-5 text-amber-800">A reserva expira em menos de 10 minutos.</p></div><div className="rounded-2xl border border-sky-200 bg-sky-50 p-4"><p className="text-sm font-extrabold text-sky-900">3 lembretes programados</p><p className="mt-1 text-xs leading-5 text-sky-800">O envio será processado automaticamente.</p></div></div></aside></section>
  </>;
}
