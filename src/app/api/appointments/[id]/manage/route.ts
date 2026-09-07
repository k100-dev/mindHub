import { z } from "zod";
import { handleRouteError, jsonError } from "@/lib/api";
import { requireActivePatient, requireActivePsychologist } from "@/lib/authz";
import { createAdminClient } from "@/lib/supabase/admin";

const schema = z.object({ action: z.enum(["CANCEL", "RESCHEDULE", "PAYMENT", "REFUND", "CONFIRM", "COMPLETE", "NO_SHOW"]), startsAt: z.iso.datetime({ offset: true }).optional(), amount: z.number().positive().max(100000).optional() });
export async function POST(request: Request, { params }: RouteContext<"/api/appointments/[id]/manage">) {
  try {
    const input = schema.parse(await request.json());
    const auth = await requireActivePsychologist() ?? await requireActivePatient();
    if (!auth) return jsonError("Entre na sua conta para continuar.", 401);
    const { id } = await params;
    if (!z.uuid().safeParse(id).success) return jsonError("Agendamento inválido.", 422);
    const admin = createAdminClient();
    if (!admin) return jsonError("Agenda temporariamente indisponível.", 503);
    const { data, error } = await admin.rpc("manage_manual_appointment", { p_actor: auth.user.id, p_appointment: id, p_action: input.action, p_start: input.startsAt ?? null, p_amount: input.amount ?? null });
    if (error) {
      if (/NOT_FOUND/.test(error.message)) return jsonError("Agendamento não encontrado.", 404);
      if (/TOO_LATE/.test(error.message)) return jsonError("Com menos de 24 horas de antecedência, entre em contato com a profissional para remarcar.", 409);
      if (/DEPOSIT_REQUIRED/.test(error.message)) return jsonError("Registre o recebimento do sinal antes de confirmar o atendimento.", 409);
      if (/INVALID_AMOUNT/.test(error.message)) return jsonError("Informe o total recebido, maior que o já registrado e até o preço da sessão.", 422);
      if (/SLOT_CONFLICT|UNAVAILABLE_SLOT|BLOCKED_SLOT|PAST_SLOT/.test(error.message)) return jsonError("Este horário não está disponível. Escolha outro.", 409);
      if (/INVALID/.test(error.message)) return jsonError("Esta ação não está disponível para a situação atual. Atualize a página.", 409);
      return jsonError("Não foi possível atualizar o agendamento.", 500);
    }
    return Response.json({ appointment: data });
  } catch (error) { return handleRouteError(error); }
}
