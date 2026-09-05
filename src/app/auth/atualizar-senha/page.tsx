import Link from "next/link";
import { AuthShell } from "@/components/auth-shell";
import { UpdatePasswordForm } from "@/components/auth-form";

export const metadata = { title: "Atualizar senha" };
export default function UpdatePasswordPage() {
  return <AuthShell title="Defina uma nova senha" subtitle="Use pelo menos 10 caracteres." footer={<Link href="/entrar" className="font-bold text-[#117f72]">Voltar para entrar</Link>}><UpdatePasswordForm /></AuthShell>;
}
