import Link from "next/link";
import { AuthShell } from "@/components/auth-shell";
import { RegistrationForm } from "@/components/auth-form";

export const metadata = { title: "Cadastro de paciente" };
export default async function PatientRegistrationPage({ searchParams }: PageProps<"/cadastro/paciente">) {
  const { next } = await searchParams;
  const requested = typeof next === "string" ? next : undefined;
  return <AuthShell title="Seu espaço começa aqui." subtitle="Conte um pouco sobre você para escolher seu primeiro horário." footer={<>Já tem conta? <Link href={`/entrar${requested ? `?next=${encodeURIComponent(requested)}` : ""}`} className="font-bold text-[#117f72]">Entrar</Link></>}><RegistrationForm next={requested} /></AuthShell>;
}
