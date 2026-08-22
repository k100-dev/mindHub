import { env } from "@/lib/env";
import { jsonError } from "@/lib/api";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendWhatsAppTemplate } from "@/lib/integrations/whatsapp";

export async function POST(request: Request) {
  if (!env.CRON_SECRET || request.headers.get("authorization") !== `Bearer ${env.CRON_SECRET}`) return jsonError("Não autorizado.", 401);
  const admin = createAdminClient();
  if (!admin) return jsonError("Supabase administrativo não configurado.", 503);
  const { data: jobs } = await admin.from("notification_jobs").select("id,appointment_id,template_name,attempts,appointments(patient_id,starts_at)").eq("status", "PENDING").lte("scheduled_for", new Date().toISOString()).lt("attempts", 5).limit(20);
  let sent = 0; let failed = 0;
  for (const job of jobs ?? []) {
    await admin.from("notification_jobs").update({ status: "PROCESSING", attempts: job.attempts + 1 }).eq("id", job.id).eq("status", "PENDING");
    const appointment = Array.isArray(job.appointments) ? job.appointments[0] : job.appointments;
    const { data: patient } = await admin.from("profiles").select("phone").eq("user_id", appointment?.patient_id).maybeSingle();
    try {
      if (!patient?.phone) throw new Error("RECIPIENT_MISSING");
      const result = await sendWhatsAppTemplate({ to: patient.phone, template: job.template_name, parameters: [new Date(appointment.starts_at).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })] });
      await admin.from("notification_jobs").update({ status: "SENT", provider_message_id: result.providerMessageId, last_error_code: null }).eq("id", job.id);
      sent++;
    } catch (error) {
      const final = job.attempts + 1 >= 5;
      await admin.from("notification_jobs").update({ status: final ? "FAILED" : "PENDING", last_error_code: error instanceof Error ? error.message.slice(0, 80) : "UNKNOWN" }).eq("id", job.id);
      failed++;
    }
  }
  return Response.json({ processed: (jobs ?? []).length, sent, failed });
}
