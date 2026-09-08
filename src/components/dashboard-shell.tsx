"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, CalendarDays, Clock3, LayoutDashboard, Menu, Settings, UserRound, UsersRound, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Brand } from "@/components/brand";
import { cn } from "@/lib/utils";
import { SignOutButton } from "@/components/sign-out-button";

const items = [
  { href: "/app", label: "Visão geral", icon: LayoutDashboard, exact: true },
  { href: "/app/agenda", label: "Agenda", icon: CalendarDays },
  { href: "/app/disponibilidade", label: "Disponibilidade", icon: Clock3 },
  { href: "/app/pacientes", label: "Pacientes", icon: UsersRound },
  { href: "/app/relatorios", label: "Relatórios", icon: BarChart3 },
  { href: "/app/configuracoes/perfil", label: "Configurações", icon: Settings },
];

export function DashboardShell({ children, name }: { children: React.ReactNode; name: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const close = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", close);
    return () => { document.body.style.overflow = previous; window.removeEventListener("keydown", close); };
  }, [open]);
  return (
    <div className="min-h-screen bg-[#f6f8f2] lg:grid lg:grid-cols-[250px_1fr]">
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-[#dfe7d8] bg-[#fffef9] px-4 py-3 lg:hidden"><Brand/><button className="grid size-11 place-items-center rounded-xl bg-[#315c42] text-white" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="professional-navigation" aria-label={open ? "Fechar menu" : "Abrir menu"}>{open ? <X /> : <Menu />}</button></header>
      {open && <button className="fixed inset-0 z-30 bg-slate-950/30 lg:hidden" aria-label="Fechar menu" onClick={() => setOpen(false)} />}
      <aside className={cn("fixed bottom-0 left-0 top-[69px] z-40 flex w-[250px] overflow-y-auto lg:top-0 flex-col bg-[#244f3b] px-4 py-6 transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0", open ? "translate-x-0" : "-translate-x-full")}>
        <div className="px-2"><Brand inverse /></div>
        <p className="mt-3 px-2 text-xs tracking-wide text-white/60">Seu espaço de trabalho</p><nav id="professional-navigation" className="mt-8 grid gap-1.5" aria-label="Navegação principal">
          {items.map(({ href, label, icon: Icon, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href);
            return <Link key={href} href={href} aria-current={active ? "page" : undefined} onClick={() => setOpen(false)} className={cn("flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold transition", active ? "bg-white text-[#155f42]" : "text-white/78 hover:bg-white/10 hover:text-white")}><Icon size={19} />{label}</Link>;
          })}
        </nav>
        <div className="mt-auto rounded-2xl border border-white/15 bg-white/8 p-3 text-white"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-full bg-white/12"><UserRound /></span><div className="min-w-0 flex-1"><p className="truncate text-sm font-extrabold">{name}</p><p className="text-xs text-white/60">Acesso profissional</p></div><SignOutButton compact /></div></div>
      </aside>
      <main className="page-enter min-w-0 p-4 py-7 sm:p-7 lg:p-8">{children}</main>
    </div>
  );
}
