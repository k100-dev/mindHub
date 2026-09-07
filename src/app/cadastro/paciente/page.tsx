import Link from "next/link";
import { AuthShell } from "@/components/auth-shell";
import { RegistrationForm } from "@/components/auth-form";

export const metadata = { title: "Cadastro de paciente" };
export default async function PatientRegistrationPage({ searchParams }: PageProps<"/cadastro/paciente">) {
  const { next } = await searchParams;
  const requested = typeof next === "string" ? next : undefined;
  return <AuthShell title="Crie seu acesso" subtitle="Sua conta permite solicitar e acompanhar horários." footer={<>Já tem conta? <Link href={`/entrar${requested ? `?next=${encodeURIComponent(requested)}` : ""}`} className="font-bold text-[#117f72]">Entrar</Link></>}><RegistrationForm next={requested} /></AuthShell>;
}
