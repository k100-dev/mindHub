import { AgendaWorkspace } from "@/components/agenda-workspace";
import { PageHeading } from "@/components/page-heading";

export default function AgendaPage() {
  return <><PageHeading title="Agenda" description="Visualize horários, reservas e consultas confirmadas." /><AgendaWorkspace /></>;
}
