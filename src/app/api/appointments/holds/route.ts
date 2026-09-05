import { handleRouteError, jsonError } from "@/lib/api";
import { requireActivePatient } from "@/lib/authz";
import { env } from "@/lib/env";
import { holdSchema } from "@/lib/validation";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const auth = await requireActivePatient();
    if (!auth) return jsonError("Entre como paciente para reservar.", 401);
    const input = holdSchema.parse(await request.json());
    if (env.PAYMENT_PROVIDER_MODE === "fake" || !env.MERCADO_PAGO_ACCESS_TOKEN) return jsonError("A confirmação de novos horários ainda não está habilitada.", 503);
    const admin = createAdminClient();
    if (!admin) return jsonError("Agenda temporariamente indisponível.", 503);
    const { data: professional } = await admin.from("psychologist_profiles").select("user_id").eq("public_slug", input.psychologistSlug).eq("verification_status", "VERIFIED").maybeSingle();
    if (!professional) return jsonError("Agenda não encontrada.", 404);
    const { data: appointment, error } = await admin.rpc("create_appointment_hold_for_patient", {
      requested_patient_id: auth.user.id,
      requested_psychologist_id: professional.user_id,
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
