import Link from "next/link";
import { ArrowRight, CalendarCheck, CheckCircle2, LockKeyhole, MessageCircleMore } from "lucide-react";
import { Brand } from "@/components/brand";

const benefits = [
  { icon: CalendarCheck, title: "Agenda sem conflitos", text: "Disponibilidades, bloqueios e reservas protegidas contra agendamento duplo." },
  { icon: MessageCircleMore, title: "Lembretes automáticos", text: "Confirmações e lembretes pelo WhatsApp sem depender de mensagens manuais." },
  { icon: LockKeyhole, title: "Privacidade desde o início", text: "Dados administrativos protegidos por vínculo, autenticação e rastreabilidade." },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_15%_15%,#d9faf2_0,transparent_32%),linear-gradient(145deg,#f8fbfb,#eef3f4)]">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <Brand />
        <div className="flex items-center gap-3"><Link href="/entrar?next=/app" className="hidden text-sm font-bold text-[#516378] transition hover:text-[#117f72] md:inline-flex">Área da psicóloga</Link><Link href="/entrar" className="button-secondary">Entrar</Link><Link href="/cadastro/paciente" className="button-primary hidden sm:inline-flex">Criar conta</Link></div>
      </nav>
      <section className="mx-auto grid max-w-7xl items-center gap-14 px-6 pb-20 pt-12 lg:grid-cols-[1.05fr_.95fr] lg:pt-20">
        <div>
          <p className="eyebrow">Cuidado começa com organização</p>
          <h1 className="mt-5 max-w-3xl text-5xl font-black leading-[1.06] tracking-[-.04em] text-[#142139] md:text-7xl">Sua agenda leve. Seu atendimento no centro.</h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-[#607087]">O MindHub reúne pacientes, horários, sinal e lembretes em um fluxo simples para a psicóloga e acolhedor para o paciente.</p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row"><Link href="/p/dra-isadora-bezerra" className="button-primary min-w-48">Agendar consulta <ArrowRight size={18} /></Link><Link href="/cadastro/psicologa" className="button-secondary min-w-48">Sou psicóloga</Link></div>
          <div className="mt-8 flex flex-wrap gap-x-7 gap-y-3 text-sm font-semibold text-[#516378]">
            {['Horários em tempo real', 'Pagamento de sinal seguro', 'Sem prontuário clínico'].map((item) => <span key={item} className="inline-flex items-center gap-2"><CheckCircle2 size={17} className="text-[#117f72]" />{item}</span>)}
          </div>
        </div>
        <div className="relative mx-auto w-full max-w-xl">
          <div className="absolute -inset-5 -z-0 rounded-[36px] bg-gradient-to-br from-[#117f72]/20 to-[#66d7c4]/10 blur-2xl" />
          <div className="card relative overflow-hidden p-5 md:p-7">
            <div className="flex items-center justify-between border-b border-[#e4ebee] pb-5"><div><p className="text-sm font-bold">Próxima consulta</p><p className="muted mt-1 text-sm">Terça-feira, 25 de agosto</p></div><span className="rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-bold text-emerald-800">Confirmado</span></div>
            <div className="grid gap-3 py-5 sm:grid-cols-3"><div className="rounded-xl bg-[#f3f7f7] p-4"><p className="muted text-xs">Horário</p><p className="mt-1 text-lg font-black">14:00</p></div><div className="rounded-xl bg-[#f3f7f7] p-4"><p className="muted text-xs">Duração</p><p className="mt-1 text-lg font-black">60 min</p></div><div className="rounded-xl bg-[#eaf7f4] p-4"><p className="text-xs text-[#117f72]">Lembrete</p><p className="mt-1 text-lg font-black text-[#0d6d62]">Ativo</p></div></div>
            <div className="rounded-2xl bg-[#0e6e63] p-6 text-white"><p className="text-sm text-white/70">Agenda da semana</p><div className="mt-5 grid grid-cols-5 gap-2 text-center text-xs">{['SEG', 'TER', 'QUA', 'QUI', 'SEX'].map((day, index) => <div key={day}><p className="text-white/60">{day}</p><div className={index === 1 ? "mx-auto mt-2 grid size-10 place-items-center rounded-xl bg-white font-black text-[#0e6e63]" : "mx-auto mt-2 grid size-10 place-items-center rounded-xl bg-white/10 font-bold"}>{24 + index}</div></div>)}</div></div>
          </div>
        </div>
      </section>
      <section className="mx-auto grid max-w-7xl gap-5 px-6 pb-20 md:grid-cols-3">{benefits.map(({ icon: Icon, title, text }) => <article key={title} className="card p-6"><span className="grid size-11 place-items-center rounded-xl bg-[#e9f6f3] text-[#117f72]"><Icon size={22} /></span><h2 className="mt-5 text-lg font-extrabold">{title}</h2><p className="muted mt-2 leading-6">{text}</p></article>)}</section>
      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="flex flex-col justify-between gap-5 rounded-[24px] bg-[#142139] p-7 text-white md:flex-row md:items-center md:p-9">
          <div><p className="text-xs font-extrabold uppercase tracking-[.14em] text-[#78ddce]">Área exclusiva da psicóloga</p><h2 className="mt-3 text-2xl font-black">Pacientes, agenda e disponibilidade em um só lugar.</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-white/70">Acesse o painel profissional para organizar cadastros, horários e o acompanhamento administrativo dos atendimentos.</p></div>
          <Link href="/entrar?next=/app" className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 font-extrabold text-[#142139] transition hover:-translate-y-0.5">Acessar área da psicóloga <ArrowRight size={18} /></Link>
        </div>
      </section>
    </main>
  );
}
