import Link from "next/link";
import { AuthShell } from "@/components/auth-shell";
import { LoginForm } from "@/components/auth-form";

export const metadata = { title: "Entrar" };
export default async function LoginPage({ searchParams }: PageProps<"/entrar">) {
  const { next } = await searchParams;
  const requested = typeof next === "string" ? next : undefined;
  return <AuthShell title="Acesse sua conta" subtitle="Entre para ver sua agenda com Isadora Bezerra." footer={<><Link href="/recuperar-senha" className="font-bold text-[#117f72]">Esqueci minha senha</Link><span className="mx-2 text-slate-300">·</span><Link href={`/cadastro/paciente${requested ? `?next=${encodeURIComponent(requested)}` : ""}`} className="font-bold text-[#117f72]">Criar conta</Link></>}><LoginForm next={requested} /></AuthShell>;
}
