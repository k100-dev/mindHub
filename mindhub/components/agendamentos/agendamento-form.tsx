"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { useFormStatus } from "react-dom";
import { createAgendamentoAction, type ActionState, updateAgendamentoAction } from "@/app/actions/agendamentos";
import type { Agendamento } from "@/lib/types";
import { statusOptions } from "@/lib/validations";

const initialState: ActionState = {};

export function AgendamentoForm({
  mode,
  agendamento,
}: {
  mode: "create" | "edit";
  agendamento?: Agendamento;
}) {
  const [nomePaciente, setNomePaciente] = useState(agendamento?.nome_paciente ?? "");
  const [nomePsicologo, setNomePsicologo] = useState(agendamento?.nome_psicologo ?? "");
  const [data, setData] = useState(agendamento?.data ?? "");
  const [horario, setHorario] = useState(agendamento?.horario ?? "14:00");
  const [status, setStatus] = useState(agendamento?.status ?? "Pendente");

  const action = mode === "create" ? createAgendamentoAction : updateAgendamentoAction;
  const [state, formAction] = useActionState(action, initialState);

  const title = mode === "create" ? "Novo agendamento" : "Editar agendamento";

  return (
    <div className="card" style={{ maxWidth: 720, margin: "0 auto" }}>
      <Link href="/agendamentos">Voltar para agendamentos</Link>
      <h1 className="title" style={{ marginTop: 10 }}>
        {title}
      </h1>

      <form action={formAction} className="form-grid">
        {mode === "edit" ? <input type="hidden" name="id" value={agendamento?.id} /> : null}

        {state.message ? <p className="message-error">{state.message}</p> : null}

        <label htmlFor="nome_paciente">Nome do paciente</label>
        <input
          id="nome_paciente"
          name="nome_paciente"
          value={nomePaciente}
          onChange={(event) => setNomePaciente(event.target.value)}
          placeholder="Ex.: Mariana Souza"
        />
        {state.errors?.nome_paciente ? <small className="field-error">{state.errors.nome_paciente[0]}</small> : null}

        <label htmlFor="nome_psicologo">Nome do psicólogo</label>
        <input
          id="nome_psicologo"
          name="nome_psicologo"
          value={nomePsicologo}
          onChange={(event) => setNomePsicologo(event.target.value)}
          placeholder="Ex.: Dr. Rafael Mendes"
        />
        {state.errors?.nome_psicologo ? <small className="field-error">{state.errors.nome_psicologo[0]}</small> : null}

        <label htmlFor="data">Data</label>
        <input id="data" name="data" type="date" value={data} onChange={(event) => setData(event.target.value)} />
        {state.errors?.data ? <small className="field-error">{state.errors.data[0]}</small> : null}

        <label htmlFor="horario">Horário</label>
        <input id="horario" name="horario" type="time" value={horario} onChange={(event) => setHorario(event.target.value)} />
        {state.errors?.horario ? <small className="field-error">{state.errors.horario[0]}</small> : null}

        <label htmlFor="status">Status</label>
        <select id="status" name="status" value={status} onChange={(event) => setStatus(event.target.value as typeof status)}>
          {statusOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        {state.errors?.status ? <small className="field-error">{state.errors.status[0]}</small> : null}

        <div className="actions">
          <Link className="btn btn-outline" href="/agendamentos">
            Cancelar
          </Link>
          <SubmitLabel label={mode === "create" ? "Criar agendamento" : "Salvar alterações"} />
        </div>
      </form>
    </div>
  );
}

function SubmitLabel({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button className="btn btn-primary" type="submit" disabled={pending}>
      {pending ? "Salvando..." : label}
    </button>
  );
}
