import { notFound } from "next/navigation";
import { getAgendamentoByIdAction } from "@/app/actions/agendamentos";
import { AgendamentoForm } from "@/components/agendamentos/agendamento-form";

type Params = Promise<{ id: string }>;

export default async function EditarAgendamentoPage({ params }: { params: Params }) {
  const { id } = await params;
  const agendamento = await getAgendamentoByIdAction(id);

  if (!agendamento) {
    notFound();
  }

  return <AgendamentoForm mode="edit" agendamento={agendamento} />;
}
