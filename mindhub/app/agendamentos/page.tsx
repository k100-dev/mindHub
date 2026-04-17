import Link from "next/link";
import { deleteAgendamentoAction, listAgendamentosAction } from "@/app/actions/agendamentos";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function feedbackMessage(value: string | undefined) {
  if (value === "created") return "Agendamento criado com sucesso.";
  if (value === "updated") return "Agendamento atualizado com sucesso.";
  if (value === "deleted") return "Agendamento excluído com sucesso.";
  return null;
}

export default async function AgendamentosPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const feedback = typeof params.feedback === "string" ? feedbackMessage(params.feedback) : null;

  let errorMessage: string | null = null;
  let agendamentos = await listAgendamentosAction().catch((error: unknown) => {
    errorMessage = error instanceof Error ? error.message : "Erro inesperado ao carregar agendamentos.";
    return [];
  });

  return (
    <main className="card">
      <h1 className="title">Agenda de consultas</h1>
      <p className="subtitle">Organize a agenda do consultório e acompanhe cada consulta com clareza.</p>
      <div className="toolbar">
        <span />
        <Link className="btn btn-primary" href="/agendamentos/novo">
          Novo agendamento
        </Link>
      </div>

      {feedback ? <p className="message-success">{feedback}</p> : null}
      {errorMessage ? <p className="message-error">{errorMessage}</p> : null}

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Paciente</th>
              <th>Psicólogo</th>
              <th>Data</th>
              <th>Horário</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {agendamentos.length === 0 ? (
              <tr>
                <td colSpan={6}>Nenhum agendamento cadastrado.</td>
              </tr>
            ) : (
              agendamentos.map((agendamento) => (
                <tr key={agendamento.id}>
                  <td>{agendamento.nome_paciente}</td>
                  <td>{agendamento.nome_psicologo}</td>
                  <td>{agendamento.data}</td>
                  <td>{agendamento.horario}</td>
                  <td>
                    <span className="status-badge">{agendamento.status}</span>
                  </td>
                  <td>
                    <div className="actions">
                      <Link href={`/agendamentos/${agendamento.id}/editar`}>Editar</Link>
                      <form action={deleteAgendamentoAction}>
                        <input type="hidden" name="id" value={agendamento.id} />
                        <button className="btn btn-outline" type="submit">
                          Excluir
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
