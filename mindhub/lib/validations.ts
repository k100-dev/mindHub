import { z } from "zod";

export const statusOptions = ["Pendente", "Confirmado", "Cancelado"] as const;

export const agendamentoSchema = z.object({
  nome_paciente: z
    .string()
    .trim()
    .min(3, "Nome do paciente deve ter ao menos 3 caracteres."),
  nome_psicologo: z
    .string()
    .trim()
    .min(3, "Nome do psicólogo deve ter ao menos 3 caracteres."),
  data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Informe uma data válida."),
  horario: z.string().regex(/^\d{2}:\d{2}$/, "Informe um horário válido."),
  status: z.enum(statusOptions),
});