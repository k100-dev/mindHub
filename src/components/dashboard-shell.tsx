"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, CalendarDays, Clock3, LayoutDashboard, Menu, Settings, UserRound, UsersRound, X } from "lucide-react";
import { useState } from "react";
import { Brand } from "@/components/brand";
import { cn } from "@/lib/utils";

const items = [
  { href: "/app", label: "Visão geral", icon: LayoutDashboard, exact: true },
  { href: "/app/agenda", label: "Agenda", icon: CalendarDays },
  { href: "/app/disponibilidade", label: "Disponibilidade", icon: Clock3 },
  { href: "/app/pacientes", label: "Pacientes", icon: UsersRound },
  { href: "/app/relatorios", label: "Relatórios", icon: BarChart3 },
  { href: "/app/configuracoes/perfil", label: "Configurações", icon: Settings },
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen bg-[#f2f5f6] lg:grid lg:grid-cols-[250px_1fr]">
      <button className="fixed right-4 top-4 z-50 grid size-11 place-items-center rounded-xl bg-[#0d665b] text-white shadow-lg lg:hidden" onClick={() => setOpen(!open)} aria-label={open ? "Fechar menu" : "Abrir menu"}>{open ? <X /> : <Menu />}</button>
      {open && <button className="fixed inset-0 z-30 bg-slate-950/30 lg:hidden" aria-label="Fechar menu" onClick={() => setOpen(false)} />}
      <aside className={cn("fixed inset-y-0 left-0 z-40 flex w-[250px] flex-col bg-[#155f42] px-4 py-6 transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0", open ? "translate-x-0" : "-translate-x-full")}>
        <div className="px-2"><Brand inverse /></div>
        <nav className="mt-9 grid gap-1.5" aria-label="Navegação principal">
          {items.map(({ href, label, icon: Icon, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href);
            return <Link key={href} href={href} onClick={() => setOpen(false)} className={cn("flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold transition", active ? "bg-white text-[#155f42]" : "text-white/78 hover:bg-white/10 hover:text-white")}><Icon size={19} />{label}</Link>;
          })}
        </nav>
        <div className="mt-auto rounded-2xl border border-white/15 bg-white/8 p-3 text-white"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-full bg-white/12"><UserRound /></span><div><p className="text-sm font-extrabold">Dra. Isadora B.</p><p className="text-xs text-white/60">Conta verificada</p></div></div></div>
      </aside>
      <main className="min-w-0 p-4 pt-20 sm:p-7 sm:pt-20 lg:p-8">{children}</main>
    </div>
  );
}
