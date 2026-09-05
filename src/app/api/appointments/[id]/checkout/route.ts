import { handleRouteError, jsonError } from "@/lib/api";
import { requireActivePatient } from "@/lib/authz";
import { getPaymentProvider } from "@/lib/integrations/payments";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(_: Request, { params }: RouteContext<"/api/appointments/[id]/checkout">) {
  try {
    const auth = await requireActivePatient();
    if (!auth) return jsonError("Autenticação necessária.", 401);
    const { id } = await params;
    const admin = createAdminClient();
    if (!admin) return jsonError("Supabase administrativo não configurado.", 503);
    const { data: appointment } = await auth.supabase
      .from("appointments")
      .select("id,patient_id,status,psychologist_profiles(deposit_amount,professional_name)")
      .eq("id", id)
      .eq("patient_id", auth.user.id)
      .maybeSingle();
    if (!appointment) return jsonError("Agendamento não encontrado.", 404);
    if (!(["RESERVADO_TEMPORARIAMENTE", "AGUARDANDO_SINAL"] as string[]).includes(appointment.status)) {
      return jsonError("Este agendamento não aceita novo checkout.", 409);
    }
    const professional = Array.isArray(appointment.psychologist_profiles)
      ? appointment.psychologist_profiles[0]
      : appointment.psychologist_profiles;
    const amount = Number(professional?.deposit_amount ?? 0);
    const provider = getPaymentProvider();
    const checkout = await provider.createCheckout({
      appointmentId: appointment.id,
      title: `Sinal de consulta — ${professional?.professional_name ?? "MindHub"}`,
      amount,
      payerEmail: auth.user.email ?? "",
    });
    const { error: paymentError } = await admin.from("payments").upsert({
      appointment_id: appointment.id,
      amount,
      external_reference: checkout.externalId,
      status: "PENDING",
    }, { onConflict: "external_reference" });
    if (paymentError) return jsonError("Não foi possível registrar o checkout.", 500);
    await admin.from("appointments").update({ status: "AGUARDANDO_SINAL" }).eq("id", appointment.id);
    await admin.from("appointment_events").insert({
      appointment_id: appointment.id,
      actor_id: auth.user.id,
      previous_status: appointment.status,
      new_status: "AGUARDANDO_SINAL",
      reason: "Checkout do sinal iniciado",
    });
    return Response.json({ checkoutUrl: checkout.checkoutUrl, expiresAt: null });
  } catch (error) {
    return handleRouteError(error);
  }
}
