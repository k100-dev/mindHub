"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase";
import type { Agendamento, AgendamentoStatus } from "@/lib/types";
import { agendamentoSchema } from "@/lib/validations";

export type ActionState = {
  message?: string;
  errors?: Partial<Record<keyof Omit<Agendamento, "id" | "created_at" | "updated_at">, string[]>>;
};

function toValues(formData: FormData) {
  return {
    nome_paciente: String(formData.get("nome_paciente") ?? ""),
    nome_psicologo: String(formData.get("nome_psicologo") ?? ""),
    data: String(formData.get("data") ?? ""),
    horario: String(formData.get("horario") ?? ""),
    status: String(formData.get("status") ?? "Pendente") as AgendamentoStatus,
  };
}

export async function listAgendamentosAction() {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("agendamentos")
    .select("*")
    .order("data", { ascending: true })
    .order("horario", { ascending: true });

  if (error) {
    throw new Error(`Erro ao listar agendamentos: ${error.message}`);
  }

  return (data ?? []) as Agendamento[];
}

export async function getAgendamentoByIdAction(id: string) {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("agendamentos")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    throw new Error(`Erro ao buscar agendamento: ${error.message}`);
  }

  return data as Agendamento;
}

export async function createAgendamentoAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const values = toValues(formData);
  const parsed = agendamentoSchema.safeParse(values);

  if (!parsed.success) {
    return {
      message: "Revise os campos destacados e tente novamente.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const supabase = createSupabaseServerClient();
  const { error } = await supabase.from("agendamentos").insert(parsed.data);

  if (error) {
    return {
      message: `Não foi possível criar o agendamento. ${error.message}`,
    };
  }

  revalidatePath("/agendamentos");
  redirect("/agendamentos?feedback=created");
}

export async function updateAgendamentoAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = String(formData.get("id") ?? "");
  const values = toValues(formData);
  const parsed = agendamentoSchema.safeParse(values);

  if (!id) {
    return {
      message: "Identificador do agendamento não informado.",
    };
  }

  if (!parsed.success) {
    return {
      message: "Revise os campos destacados e tente novamente.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const supabase = createSupabaseServerClient();
  const { error } = await supabase
    .from("agendamentos")
    .update(parsed.data)
    .eq("id", id);

  if (error) {
    return {
      message: `Não foi possível atualizar o agendamento. ${error.message}`,
    };
  }

  revalidatePath("/agendamentos");
  redirect("/agendamentos?feedback=updated");
}

export async function deleteAgendamentoAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");

  if (!id) {
    throw new Error("Identificador do agendamento não informado.");
  }

  const supabase = createSupabaseServerClient();
  const { error } = await supabase.from("agendamentos").delete().eq("id", id);

  if (error) {
    throw new Error(`Erro ao excluir agendamento: ${error.message}`);
  }

  revalidatePath("/agendamentos");
  redirect("/agendamentos?feedback=deleted");
}
