import Link from "next/link";
import { AuthShell } from "@/components/auth-shell";
import { LoginForm } from "@/components/auth-form";

export const metadata = { title: "Entrar" };
export default function LoginPage() {
  return <AuthShell title="Bem-vindo de volta" subtitle="Acesse seu painel ou o Hub do Paciente." footer={<><Link href="/recuperar-senha" className="font-bold text-[#117f72]">Esqueci minha senha</Link><span className="mx-2 text-slate-300">·</span><Link href="/cadastro/paciente" className="font-bold text-[#117f72]">Criar conta</Link></>}><LoginForm /></AuthShell>;
}
