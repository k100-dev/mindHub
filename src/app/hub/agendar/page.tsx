import { PageHeading } from "@/components/page-heading";
import { SchedulePicker } from "@/components/schedule-picker";
import { getProfessional } from "@/lib/professional";

export default async function SchedulePage() {
  const professional = await getProfessional();
  return <><PageHeading title="Agendar atendimento" description="Escolha o melhor horário para você. Horários de Brasília." />{professional ? <SchedulePicker psychologistSlug={professional.public_slug} /> : <div className="card p-6">A agenda está sendo preparada. Volte em breve para consultar os horários.</div>}</>;
}
