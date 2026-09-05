import Link from "next/link";
import { CalendarCheck, CheckCircle2, LockKeyhole, MessageCircleMore } from "lucide-react";
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
        <div className="flex items-center gap-2 sm:gap-3"><Link href="/entrar?next=/app" className="hidden text-sm font-bold text-[#516378] transition hover:text-[#117f72] md:inline-flex">Área da psicóloga</Link><Link href="/entrar" className="button-secondary px-3 text-sm sm:px-4">Entrar</Link><Link href="/cadastro/paciente" className="button-primary px-3 text-sm sm:px-4">Criar conta</Link></div>
      </nav>
      <section className="mx-auto grid max-w-7xl items-center gap-14 px-6 pb-20 pt-12 lg:grid-cols-[1.05fr_.95fr] lg:pt-20">
        <div>
          <p className="eyebrow">Cuidado começa com organização</p>
          <h1 className="mt-5 max-w-3xl text-5xl font-black leading-[1.06] tracking-[-.04em] text-[#142139] md:text-7xl">Sua agenda leve. Seu atendimento no centro.</h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-[#607087]">O MindHub reúne pacientes, horários, sinal e lembretes em um fluxo simples para a psicóloga e acolhedor para o paciente.</p>
          <div className="mt-9 max-w-lg rounded-2xl border border-[#d7e9e5] bg-white/70 p-4 text-sm leading-6 text-[#516378] shadow-sm">Para começar, entre na sua conta ou crie um acesso. A agenda e os detalhes do atendimento aparecem somente depois da autenticação.</div>
          <div className="mt-7 flex flex-wrap gap-x-7 gap-y-3 text-sm font-semibold text-[#516378]">
            {['Horários em tempo real', 'Pagamento de sinal seguro', 'Sem prontuário clínico'].map((item) => <span key={item} className="inline-flex items-center gap-2"><CheckCircle2 size={17} className="text-[#117f72]" />{item}</span>)}
          </div>
        </div>
        <div className="relative mx-auto w-full max-w-xl">
          <div className="absolute -inset-5 -z-0 rounded-[36px] bg-gradient-to-br from-[#117f72]/20 to-[#66d7c4]/10 blur-2xl" />
          <div className="card relative overflow-hidden p-6 sm:p-8 md:p-10">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="eyebrow">Um começo tranquilo</p>
                <h2 className="mt-3 max-w-sm text-2xl font-black tracking-[-.03em] text-[#142139] sm:text-3xl">Cada etapa do cuidado no seu tempo.</h2>
              </div>
              <span aria-hidden="true" className="mt-1 grid size-10 shrink-0 place-items-center rounded-full bg-[#e9f6f3] text-xl text-[#117f72]">✦</span>
            </div>
            <div className="mt-8 rounded-2xl bg-gradient-to-br from-[#effaf7] to-[#f8fbfb] p-3 sm:p-5">
              <svg viewBox="0 0 520 360" role="img" aria-labelledby="mindhub-path-title mindhub-path-description" className="h-auto w-full">
                <title id="mindhub-path-title">Caminhos de cuidado conectados</title>
                <desc id="mindhub-path-description">Uma ilustração abstrata de caminhos que se ramificam e se conectam, representando a organização do cuidado.</desc>
                <defs>
                  <linearGradient id="mindhub-path-gradient" x1="0" x2="1" y1="1" y2="0">
                    <stop offset="0" stopColor="#117f72" />
                    <stop offset="1" stopColor="#63cdbd" />
                  </linearGradient>
                </defs>
                <path d="M260 322C260 276 260 243 260 213C260 181 235 162 208 145C180 127 157 104 157 70" fill="none" stroke="url(#mindhub-path-gradient)" strokeLinecap="round" strokeWidth="12" />
                <path d="M260 214C260 179 287 161 316 144C344 128 365 104 365 70" fill="none" stroke="#55b9ad" strokeLinecap="round" strokeWidth="12" />
                <path d="M260 255C226 255 198 239 178 217C159 196 137 187 106 187" fill="none" stroke="#8bd8cc" strokeLinecap="round" strokeWidth="10" />
                <path d="M260 255C294 255 322 239 342 217C361 196 383 187 414 187" fill="none" stroke="#8bd8cc" strokeLinecap="round" strokeWidth="10" />
                <circle cx="260" cy="322" r="20" fill="#0e6e63" />
                <circle cx="157" cy="70" r="16" fill="#117f72" />
                <circle cx="365" cy="70" r="16" fill="#117f72" />
                <circle cx="106" cy="187" r="14" fill="#63cdbd" />
                <circle cx="414" cy="187" r="14" fill="#63cdbd" />
              </svg>
            </div>
            <p className="muted mt-5 max-w-md text-sm leading-6">Um espaço claro para organizar horários, confirmações e lembretes — sem expor informações pessoais antes da hora.</p>
          </div>
        </div>
      </section>
      <section className="mx-auto grid max-w-7xl gap-5 px-6 pb-20 md:grid-cols-3">{benefits.map(({ icon: Icon, title, text }) => <article key={title} className="card p-6"><span className="grid size-11 place-items-center rounded-xl bg-[#e9f6f3] text-[#117f72]"><Icon size={22} /></span><h2 className="mt-5 text-lg font-extrabold">{title}</h2><p className="muted mt-2 leading-6">{text}</p></article>)}</section>
      <footer className="border-t border-[#dfe8e8] bg-white/70">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-6 py-9 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Brand />
            <p className="muted mt-2 max-w-sm text-sm leading-6">Organização simples para uma rotina de atendimento mais tranquila.</p>
          </div>
          <p className="max-w-md text-sm leading-6 text-[#718194]">MindHub · gestão de agenda e comunicação para um cuidado mais organizado.</p>
        </div>
      </footer>
    </main>
  );
}
