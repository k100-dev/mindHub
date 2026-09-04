import { PageHeading } from "@/components/page-heading";
import { AvailabilityEditor } from "@/components/availability-editor";
import { ScheduleBlockEditor } from "@/components/schedule-block-editor";

export default function AvailabilityPage() {
  return <><PageHeading title="Gerenciar disponibilidade" description="Defina os horários recorrentes e bloqueie datas específicas." /><section className="grid gap-6 xl:grid-cols-[1fr_340px]"><div className="card p-5 sm:p-6"><h2 className="text-lg font-extrabold">Horários de atendimento</h2><p className="muted mt-1 text-sm">Sessões padrão de 60 minutos.</p><div className="mt-6"><AvailabilityEditor /></div></div><aside className="grid content-start gap-5"><ScheduleBlockEditor /><div className="card p-5"><h2 className="font-extrabold">Prévia de horários livres</h2><p className="muted mt-3 text-sm leading-6">Use a agenda para criar consultas. Horários já ocupados não podem ser reservados novamente.</p></div></aside></section></>;
}
