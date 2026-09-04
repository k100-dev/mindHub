import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  CircleDot,
  Clock3,
  Database,
  GitBranch,
  LockKeyhole,
  MessageCircleMore,
  ShieldCheck,
  WalletCards,
} from "lucide-react";
import { Brand } from "@/components/brand";

export const metadata: Metadata = {
  title: "Plano do projeto",
  description: "Estado verificado e plano concentrado de finalização do MindHub.",
};

const foundations = [
  "34 rotas entre páginas e APIs",
  "Migração PostgreSQL, RLS e proteção contra conflito",
  "Autenticação e autorização por perfil",
  "UC01 e UC02 funcionais em modo demonstrativo",
  "Adaptadores de pagamento e WhatsApp isolados",
  "Testes unitários, E2E e integração contínua",
];

const milestones = [
  {
    id: "01",
    title: "Supabase funcional",
    text: "Executar a migração em um projeto de teste, validar autenticação e provar o isolamento por RLS.",
    icon: Database,
    gate: "Banco recriável e testes negativos de acesso passando.",
  },
  {
    id: "02",
    title: "Fluxos sem dados demonstrativos",
    text: "Conectar dashboard, pacientes, agenda pública e hub às APIs e aos registros persistidos.",
    icon: CircleDot,
    gate: "Nenhuma tela crítica depende das fixtures de demonstração.",
  },
  {
    id: "03",
    title: "Reserva concorrente",
    text: "Disputar o mesmo horário simultaneamente e confirmar que somente uma reserva vence.",
    icon: ShieldCheck,
    gate: "Uma reserva criada e respostas de conflito para todas as demais.",
  },
  {
    id: "04",
    title: "Pagamento sandbox",
    text: "Validar checkout, assinatura do webhook, repetição de eventos e confirmação idempotente.",
    icon: WalletCards,
    gate: "Pagamento aprovado confirma o agendamento exatamente uma vez.",
  },
  {
    id: "05",
    title: "WhatsApp e lembretes",
    text: "Configurar template de teste, consentimento, envio, retentativa e auditoria de falhas.",
    icon: MessageCircleMore,
    gate: "Cada job termina auditável como enviado ou falho.",
  },
  {
    id: "06",
    title: "Estabilização",
    text: "Executar a jornada completa no ambiente remoto, revisar acessibilidade e ensaiar rollback.",
    icon: CheckCircle2,
    gate: "Demonstração ponta a ponta aprovada com dados fictícios.",
  },
];

const dependencies = [
  "Projeto Supabase exclusivo de teste",
  "Credenciais sandbox do Mercado Pago",
  "Template e credenciais de teste da Meta",
  "Validação final das políticas de consentimento e retenção",
];

export default function ProjectPlanPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_15%_5%,#d9faf2_0,transparent_25%),linear-gradient(180deg,#f8fbfb,#eef3f4)]">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <Brand />
        <Link href="/" className="button-secondary"><ArrowLeft size={17} /> Voltar ao site</Link>
      </nav>

      <section className="mx-auto max-w-7xl px-6 pb-10 pt-10 md:pt-16">
        <div className="max-w-4xl">
          <p className="eyebrow">Plano concentrado · fonte atualizada em 04/09/2026</p>
          <h1 className="mt-5 text-4xl font-black leading-tight tracking-[-.035em] text-[#142139] md:text-6xl">Do protótipo navegável ao MVP comprovado.</h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-[#607087]">Este painel traduz o plano versionado no repositório. Pacientes e agenda já podem ser demonstrados com dados fictícios persistidos no navegador; integrações reais só serão consideradas concluídas após os gates abaixo.</p>
          <div className="mt-7 flex flex-wrap gap-3"><Link href="/app/pacientes" className="button-primary">Demonstrar UC01</Link><Link href="/app/agenda" className="button-secondary">Demonstrar UC02</Link></div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-5 px-6 pb-14 lg:grid-cols-[1.15fr_.85fr]">
        <article className="card p-7 md:p-8">
          <div className="flex items-center justify-between gap-4"><div><p className="eyebrow">Fundação verificada</p><h2 className="mt-2 text-2xl font-black">O que já está construído</h2></div><span className="rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-extrabold text-emerald-800">DEMONSTRÁVEL</span></div>
          <div className="mt-7 grid gap-3 sm:grid-cols-2">{foundations.map((item) => <div key={item} className="flex gap-3 rounded-xl bg-[#f3f7f7] p-4 text-sm font-bold leading-6"><CheckCircle2 className="mt-0.5 shrink-0 text-[#117f72]" size={18} />{item}</div>)}</div>
        </article>
        <aside className="rounded-[18px] bg-[#142139] p-7 text-white shadow-xl shadow-slate-900/10 md:p-8">
          <div className="grid size-12 place-items-center rounded-2xl bg-white/10 text-[#78ddce]"><LockKeyhole size={23} /></div>
          <p className="mt-6 text-xs font-extrabold uppercase tracking-[.14em] text-[#78ddce]">Transparência de entrega</p>
          <h2 className="mt-3 text-2xl font-black">Ainda não é produção.</h2>
          <p className="mt-3 text-sm leading-7 text-white/70">Os dados atuais são fictícios e os provedores operam apenas quando um ambiente autorizado fornece credenciais. O retorno do navegador nunca confirma pagamento.</p>
          <div className="mt-7 flex items-center gap-3 border-t border-white/10 pt-5 text-sm text-white/75"><GitBranch size={18} /><span>Plano, código, testes e decisões permanecem versionados juntos.</span></div>
        </aside>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-14">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end"><div><p className="eyebrow">Sequência crítica</p><h2 className="mt-2 text-3xl font-black">Seis gates para concluir o MVP</h2></div><p className="max-w-lg text-sm leading-6 text-[#607087]">A ordem protege autorização, consistência da agenda e rastreabilidade antes de conectar serviços externos.</p></div>
        <div className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-3">{milestones.map(({ id, title, text, icon: Icon, gate }) => <article key={id} className="card flex min-h-72 flex-col p-6"><div className="flex items-center justify-between"><span className="grid size-11 place-items-center rounded-xl bg-[#e9f6f3] text-[#117f72]"><Icon size={21} /></span><span className="text-sm font-black text-[#9aa7b6]">{id}</span></div><h3 className="mt-5 text-xl font-black">{title}</h3><p className="muted mt-2 text-sm leading-6">{text}</p><div className="mt-auto border-t border-[#e4ebee] pt-4 text-xs font-bold leading-5 text-[#40546a]"><span className="text-[#117f72]">Gate:</span> {gate}</div></article>)}</div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-5 px-6 pb-20 lg:grid-cols-2">
        <article className="card p-7 md:p-8"><div className="flex items-center gap-3"><Clock3 className="text-[#e19a2e]" /><h2 className="text-xl font-black">Dependências do proprietário</h2></div><ul className="mt-5 space-y-3">{dependencies.map((item) => <li key={item} className="flex gap-3 text-sm leading-6 text-[#52647a]"><span className="mt-2 size-2 shrink-0 rounded-full bg-[#e19a2e]" />{item}</li>)}</ul></article>
        <article className="flex flex-col justify-between rounded-[18px] bg-[#0e6e63] p-7 text-white md:p-8"><div><p className="text-xs font-extrabold uppercase tracking-[.14em] text-white/65">Próxima execução essencial</p><h2 className="mt-3 text-2xl font-black">Validar o Supabase de teste.</h2><p className="mt-3 text-sm leading-7 text-white/75">Aplicar a migração, criar contas fictícias e registrar a matriz de testes RLS. Mercado Pago e WhatsApp entram somente depois desse gate.</p></div><Link href="/p/dra-isadora-bezerra" className="mt-7 inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-xl bg-white px-5 font-extrabold text-[#0e6e63]">Explorar demonstração <ArrowRight size={18} /></Link></article>
      </section>
    </main>
  );
}
