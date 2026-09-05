import { handleRouteError, jsonError } from "@/lib/api";
import { requireActivePsychologist } from "@/lib/authz";
import { statusTransitionSchema } from "@/lib/validation";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request, { params }: RouteContext<"/api/appointments/[id]/status">) {
  try {
    const auth = await requireActivePsychologist();
    if (!auth) return jsonError("Acesso restrito.", 403);
    const { id } = await params;
    const input = statusTransitionSchema.parse(await request.json());
    const admin = createAdminClient();
    if (!admin) return jsonError("Serviço temporariamente indisponível.", 503);
    const { data, error } = await admin.rpc("transition_appointment_for_psychologist", {
      requested_psychologist_id: auth.user.id,
      requested_appointment_id: id,
      requested_status: input.status,
      requested_reason: input.reason,
    });
    if (error) {
      if (/INVALID_TRANSITION/.test(error.message)) return jsonError("Transição de status inválida.", 409);
      if (/NOT_FOUND/.test(error.message)) return jsonError("Agendamento não encontrado.", 404);
      return jsonError("Não foi possível alterar o status.", 500);
    }
    return Response.json({ appointment: data });
  } catch (error) {
    return handleRouteError(error);
  }
}
