import "server-only";

import { assertProductionIntegrationConfig, env } from "@/lib/env";

export type WhatsAppTemplateInput = {
  to: string;
  template: string;
  language?: string;
  parameters: string[];
};

export async function sendWhatsAppTemplate(input: WhatsAppTemplateInput) {
  assertProductionIntegrationConfig();
  if (env.WHATSAPP_PROVIDER_MODE === "fake") {
    return { providerMessageId: `fake-${crypto.randomUUID()}`, status: "sent" };
  }
  if (!env.WHATSAPP_PHONE_NUMBER_ID || !env.WHATSAPP_ACCESS_TOKEN) {
    throw new Error("WhatsApp Cloud API não configurada.");
  }

  const response = await fetch(
    `https://graph.facebook.com/${env.WHATSAPP_API_VERSION}/${env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.WHATSAPP_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: input.to,
        type: "template",
        template: {
          name: input.template,
          language: { code: input.language ?? "pt_BR" },
          components: [{
            type: "body",
            parameters: input.parameters.map((text) => ({ type: "text", text })),
          }],
        },
      }),
    },
  );

  if (!response.ok) throw new Error(`WhatsApp rejeitou a mensagem (${response.status}).`);
  const payload = await response.json() as { messages?: { id: string }[] };
  return { providerMessageId: payload.messages?.[0]?.id, status: "sent" };
}
