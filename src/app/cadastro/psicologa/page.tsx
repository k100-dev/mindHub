import Link from "next/link";
import { AuthShell } from "@/components/auth-shell";
import { RegistrationForm } from "@/components/auth-form";

export const metadata = { title: "Cadastro profissional" };
export default function PsychologistRegistrationPage() {
  return <AuthShell title="Cadastro profissional" subtitle="Configure o acesso que administrará pacientes, agenda e integrações." footer={<>Já tem conta? <Link href="/entrar" className="font-bold text-[#117f72]">Entrar</Link></>}><RegistrationForm role="PSYCHOLOGIST" /></AuthShell>;
}
