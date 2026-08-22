import { handleRouteError, jsonError } from "@/lib/api";
import { requireUser } from "@/lib/authz";
import { env } from "@/lib/env";
import { holdSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const auth = await requireUser();
    if (!auth) return jsonError("Entre como paciente para reservar.", 401);
    const input = holdSchema.parse(await request.json());
    const { data: appointment, error } = await auth.supabase.rpc("create_appointment_hold", {
      requested_psychologist_id: input.psychologistId,
      requested_starts_at: input.startsAt,
      hold_minutes: env.APPOINTMENT_HOLD_MINUTES,
    });
    if (error) {
      const conflict = /SLOT_CONFLICT|BLOCKED_SLOT|UNAVAILABLE_SLOT/.test(error.message);
      return jsonError(conflict ? "Este horário não está mais disponível." : "Não foi possível criar a reserva.", conflict ? 409 : 400);
    }
    return Response.json({ appointment }, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
