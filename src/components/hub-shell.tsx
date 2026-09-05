import Link from "next/link";
import { Brand } from "@/components/brand";
import { SignOutButton } from "@/components/sign-out-button";
export function HubShell({ children }: { children: React.ReactNode }) { return <div className="min-h-screen"><header className="border-b border-[#e1e8eb] bg-white"><div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-5"><Brand /><nav className="flex flex-wrap items-center gap-4 text-sm font-extrabold" aria-label="Navegação do paciente"><Link href="/hub">Início</Link><Link href="/hub/agendamentos">Agendamentos</Link><Link href="/hub/perfil">Perfil</Link><SignOutButton /></nav></div></header><main className="mx-auto max-w-6xl px-5 py-9">{children}</main></div>; }
