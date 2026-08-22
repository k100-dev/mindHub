import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { env } from "@/lib/env";
import { jsonError } from "@/lib/api";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  const url = new URL(request.url);
  if (url.searchParams.get("hub.mode") === "subscribe" && url.searchParams.get("hub.verify_token") === env.WHATSAPP_VERIFY_TOKEN) {
    return new Response(url.searchParams.get("hub.challenge") ?? "", { status: 200 });
  }
  return jsonError("Token de verificação inválido.", 403);
}

export async function POST(request: Request) {
  const raw = await request.text();
  if (env.WHATSAPP_PROVIDER_MODE !== "fake") {
    if (!env.WHATSAPP_APP_SECRET) return jsonError("Webhook não configurado.", 503);
    const received = request.headers.get("x-hub-signature-256")?.replace("sha256=", "") ?? "";
    const expected = createHmac("sha256", env.WHATSAPP_APP_SECRET).update(raw).digest("hex");
    const a = Buffer.from(received, "hex"); const b = Buffer.from(expected, "hex");
    if (a.length !== b.length || !timingSafeEqual(a, b)) return jsonError("Assinatura inválida.", 401);
  }
  const admin = createAdminClient();
  if (!admin) return jsonError("Supabase administrativo não configurado.", 503);
  let payload: Record<string, unknown>;
  try { payload = JSON.parse(raw) as Record<string, unknown>; } catch { return jsonError("JSON inválido.", 400); }
  const id = createHash("sha256").update(raw).digest("hex");
  const { error } = await admin.from("webhook_events").insert({ provider: "WHATSAPP", external_event_id: id, payload_hash: id, processed_at: new Date().toISOString(), processing_result: "RECEIVED" });
  if (error && error.code !== "23505") return jsonError("Não foi possível registrar o evento.", 500);
  void payload;
  return Response.json({ received: true });
}
