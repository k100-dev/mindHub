import Link from "next/link";
import { notFound } from "next/navigation";
import { Brand } from "@/components/brand";
import { getProfessional } from "@/lib/professional";

export const metadata = { title: "Agendamento | MindHub", robots: { index: true, follow: true } };
export default async function ProfessionalPage({ params }: PageProps<"/p/[slug]">) {
  const { slug } = await params;
  const professional = await getProfessional(slug === "dra-isadora-bezerra" ? undefined : slug);
  if (!professional) notFound();
  const schedulePath = `/p/${professional.public_slug}/horarios`;
  return <main className="min-h-screen bg-[#f5f8f6]"><header className="border-b border-[#dfe8e3] bg-white"><div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-5"><Brand /><Link href={`/entrar?next=${encodeURIComponent(schedulePath)}`} className="font-extrabold text-[#117f72]">Entrar</Link></div></header><section className="mx-auto max-w-5xl px-5 py-16 sm:py-24"><div className="max-w-3xl"><p className="eyebrow">Espaço de agendamento</p><h1 className="mt-4 text-4xl font-black tracking-[-.04em] sm:text-6xl">Atendimento com {professional.professional_name}</h1><p className="muted mt-6 text-lg leading-8">Entre ou crie sua conta de paciente para consultar os horários disponibilizados. A agenda não é exibida publicamente.</p><div className="mt-8 flex flex-col gap-3 sm:flex-row"><Link href={`/cadastro/paciente?next=${encodeURIComponent(schedulePath)}`} className="button-primary">Criar conta e agendar</Link><Link href={`/entrar?next=${encodeURIComponent(schedulePath)}`} className="button-secondary">Já tenho conta</Link></div></div></section></main>;
}
