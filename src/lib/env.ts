import { z } from "zod";

const providerMode = z.enum(["fake", "sandbox", "production"]);

const serverSchema = z.object({
  APP_ENV: z.enum(["development", "test", "production"]).default("development"),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  APP_TIMEZONE: z.string().default("America/Sao_Paulo"),
  APPOINTMENT_HOLD_MINUTES: z.coerce.number().int().min(5).max(60).default(15),
  PSYCHOLOGIST_ALLOWLIST: z.string().default(""),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  PAYMENT_PROVIDER_MODE: providerMode.default("fake"),
  WHATSAPP_PROVIDER_MODE: providerMode.default("fake"),
  MERCADO_PAGO_ACCESS_TOKEN: z.string().optional(),
  MERCADO_PAGO_WEBHOOK_SECRET: z.string().optional(),
  WHATSAPP_API_VERSION: z.string().default("v23.0"),
  WHATSAPP_PHONE_NUMBER_ID: z.string().optional(),
  WHATSAPP_ACCESS_TOKEN: z.string().optional(),
  WHATSAPP_APP_SECRET: z.string().optional(),
  WHATSAPP_VERIFY_TOKEN: z.string().optional(),
  CRON_SECRET: z.string().optional(),
});

export const env = serverSchema.parse(process.env);

export function hasSupabaseConfig() {
  return Boolean(env.NEXT_PUBLIC_SUPABASE_URL && env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export function assertProductionIntegrationConfig() {
  if (env.APP_ENV === "production" && (env.PAYMENT_PROVIDER_MODE === "fake" || env.WHATSAPP_PROVIDER_MODE === "fake")) {
    throw new Error("Integrações simuladas são proibidas quando APP_ENV=production.");
  }
  if (env.PAYMENT_PROVIDER_MODE === "production" && !env.MERCADO_PAGO_ACCESS_TOKEN) {
    throw new Error("MERCADO_PAGO_ACCESS_TOKEN é obrigatório em produção.");
  }

  if (
    env.WHATSAPP_PROVIDER_MODE === "production" &&
    (!env.WHATSAPP_ACCESS_TOKEN || !env.WHATSAPP_PHONE_NUMBER_ID)
  ) {
    throw new Error("Credenciais do WhatsApp são obrigatórias em produção.");
  }
}
