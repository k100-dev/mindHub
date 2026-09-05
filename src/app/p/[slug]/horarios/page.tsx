import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Brand } from "@/components/brand";
import { SchedulePicker } from "@/components/schedule-picker";
import { requireActivePatient } from "@/lib/authz";
import { ISADORA_DISPLAY_NAME, ISADORA_SLUG } from "@/lib/mindhub";

export const metadata = { title: "Escolher horário", robots: { index: false, follow: false } };
export default async function PrivateSchedulePage({ params }: PageProps<"/p/[slug]/horarios">) {
  const { slug } = await params;
  if (slug !== ISADORA_SLUG) notFound();
  const auth = await requireActivePatient();
  if (!auth) redirect(`/entrar?next=${encodeURIComponent(`/p/${slug}/horarios`)}`);
  return <main className="min-h-screen"><header className="border-b border-[#e2e9ec] bg-white"><div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5"><Brand /><Link href="/hub" className="font-extrabold text-[#117f72]">Meu espaço</Link></div></header><section className="mx-auto max-w-6xl px-5 py-10"><p className="eyebrow">Área protegida</p><h1 className="mt-2 text-3xl font-black tracking-[-.03em]">Horários com {ISADORA_DISPLAY_NAME}</h1><p className="muted mt-2">Escolha entre os horários liberados para sua conta.</p><div className="mt-8"><SchedulePicker psychologistSlug={ISADORA_SLUG} /></div></section></main>;
}
