import { createHash } from "node:crypto";
import { env } from "@/lib/env";
import { jsonError } from "@/lib/api";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPaymentProvider } from "@/lib/integrations/payments";
import { verifyMercadoPagoSignature } from "@/lib/integrations/mercado-pago-signature";
import { maskPhone } from "@/lib/authz";

type MercadoPagoEvent = { id?: string | number; data?: { id?: string | number }; type?: string; action?: string };

export async function POST(request: Request) {
  const raw = await request.text();
  let event: MercadoPagoEvent;
  try { event = JSON.parse(raw) as MercadoPagoEvent; } catch { return jsonError("JSON inválido.", 400); }
  const url = new URL(request.url);
  const paymentId = String(event.data?.id ?? url.searchParams.get("data.id") ?? "");
  if (!paymentId) return jsonError("Evento sem identificador.", 422);
  if (env.PAYMENT_PROVIDER_MODE !== "fake") {
    if (!env.MERCADO_PAGO_WEBHOOK_SECRET) return jsonError("Webhook não configurado.", 503);
    const valid = verifyMercadoPagoSignature({
      signature: request.headers.get("x-signature"),
      requestId: request.headers.get("x-request-id"),
      dataId: paymentId,
      secret: env.MERCADO_PAGO_WEBHOOK_SECRET,
    });
    if (!valid) return jsonError("Assinatura inválida.", 401);
  }
  const admin = createAdminClient();
  if (!admin) return jsonError("Supabase administrativo não configurado.", 503);
  const externalEventId = String(event.id ?? `${event.type ?? event.action ?? "payment"}:${paymentId}`);
  const payloadHash = createHash("sha256").update(raw).digest("hex");
  const { error: eventError } = await admin.from("webhook_events").insert({ provider: "MERCADO_PAGO", external_event_id: externalEventId, payload_hash: payloadHash });
  if (eventError?.code === "23505") return Response.json({ received: true, duplicate: true });
  if (eventError) return jsonError("Não foi possível registrar o evento.", 500);
  try {
    const providerPayment = await getPaymentProvider().getPayment(paymentId);
    const appointmentId = providerPayment.externalReference;
    if (!appointmentId) throw new Error("Pagamento sem referência do agendamento.");
    const { data: appointment } = await admin.from("appointments").select("id,status,patient_id,starts_at").eq("id", appointmentId).maybeSingle();
    if (!appointment) throw new Error("Agendamento não encontrado.");
    const normalizedStatus = providerPayment.status === "approved" ? "APPROVED" : providerPayment.status === "rejected" ? "REJECTED" : "PENDING";
    await admin.from("payments").update({ status: normalizedStatus, external_reference: paymentId, ...(normalizedStatus === "APPROVED" ? { confirmed_at: new Date().toISOString() } : {}) }).eq("appointment_id", appointment.id);
    if (normalizedStatus === "APPROVED" && appointment.status === "AGUARDANDO_SINAL") {
      await admin.from("appointments").update({ status: "CONFIRMADO", version: 2 }).eq("id", appointment.id).eq("status", "AGUARDANDO_SINAL");
      await admin.from("appointment_events").insert({ appointment_id: appointment.id, previous_status: "AGUARDANDO_SINAL", new_status: "CONFIRMADO", reason: "Pagamento aprovado e consultado no Mercado Pago" });
      const { data: patient } = await admin.from("profiles").select("phone").eq("user_id", appointment.patient_id).single();
      if (patient?.phone) await admin.from("notification_jobs").insert({ appointment_id: appointment.id, template_name: "mindhub_agendamento_confirmado", recipient_masked: maskPhone(patient.phone), scheduled_for: new Date().toISOString() });
    }
    await admin.from("webhook_events").update({ processed_at: new Date().toISOString(), processing_result: normalizedStatus }).eq("provider", "MERCADO_PAGO").eq("external_event_id", externalEventId);
    return Response.json({ received: true });
  } catch {
    await admin.from("webhook_events").update({ processed_at: new Date().toISOString(), processing_result: "FAILED" }).eq("provider", "MERCADO_PAGO").eq("external_event_id", externalEventId);
    return Response.json({ received: true });
  }
}
