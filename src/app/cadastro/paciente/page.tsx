import Link from "next/link";
import { AuthShell } from "@/components/auth-shell";
import { RegistrationForm } from "@/components/auth-form";

export const metadata = { title: "Cadastro de paciente" };
export default function PatientRegistrationPage() {
  return <AuthShell title="Crie seu acesso" subtitle="Sua conta permite reservar e acompanhar os agendamentos com segurança." footer={<>Já tem conta? <Link href="/entrar" className="font-bold text-[#117f72]">Entrar</Link></>}><RegistrationForm role="PATIENT" /></AuthShell>;
}
