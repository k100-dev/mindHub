import Link from "next/link";
import { Brand } from "@/components/brand";

export function AuthShell({ title, subtitle, children, footer }: { title: string; subtitle: string; children: React.ReactNode; footer?: React.ReactNode }) {
  return (
    <main className="grid min-h-screen bg-white lg:grid-cols-[1.05fr_.95fr]">
      <section className="hidden bg-[radial-gradient(circle_at_20%_20%,#60d9c9_0,transparent_34%),linear-gradient(145deg,#0b766a,#24b9aa)] p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <Brand inverse />
        <div className="max-w-xl"><p className="text-sm font-black uppercase tracking-[.18em] text-white/65">Organização com propósito</p><h2 className="mt-5 text-5xl font-black leading-tight tracking-[-.04em]">Mais tempo para cuidar. Menos tempo administrando.</h2><p className="mt-6 max-w-lg text-lg leading-8 text-white/75">Agenda, pacientes, pagamentos e lembretes em um ambiente claro e seguro.</p></div>
        <p className="text-sm text-white/60">MindHub · Dados administrativos protegidos</p>
      </section>
      <section className="flex items-center justify-center bg-[#f5f7f8] px-5 py-12">
        <div className="w-full max-w-lg"><div className="mb-9 lg:hidden"><Brand /></div><div className="card p-6 sm:p-9"><p className="eyebrow">MindHub</p><h1 className="mt-3 text-3xl font-black tracking-[-.03em]">{title}</h1><p className="muted mt-3 leading-6">{subtitle}</p>{children}{footer && <div className="mt-6 border-t border-[#e3e8eb] pt-5 text-center text-sm">{footer}</div>}</div><p className="muted mt-6 text-center text-xs">Ao continuar, você concorda com o uso administrativo dos dados conforme a finalidade informada.</p><Link href="/" className="mt-3 block text-center text-sm font-bold text-[#117f72]">Voltar ao início</Link></div>
      </section>
    </main>
  );
}
