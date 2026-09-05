import "server-only";

import { MercadoPagoConfig, Preference, Payment } from "mercadopago";
import { assertProductionIntegrationConfig, env } from "@/lib/env";

export type CheckoutInput = {
  appointmentId: string;
  title: string;
  amount: number;
  payerEmail: string;
};

export interface PaymentProvider {
  createCheckout(input: CheckoutInput): Promise<{ externalId: string; checkoutUrl: string }>;
  getPayment(paymentId: string): Promise<{ status: string; externalReference?: string }>;
}

class MercadoPagoProvider implements PaymentProvider {
  private client = new MercadoPagoConfig({ accessToken: env.MERCADO_PAGO_ACCESS_TOKEN! });

  async createCheckout(input: CheckoutInput) {
    const result = await new Preference(this.client).create({
      body: {
        external_reference: input.appointmentId,
        items: [{ id: input.appointmentId, title: input.title, quantity: 1, unit_price: input.amount, currency_id: "BRL" }],
        payer: { email: input.payerEmail },
        back_urls: {
          success: `${env.NEXT_PUBLIC_APP_URL}/pagamento/retorno?appointment=${input.appointmentId}`,
          pending: `${env.NEXT_PUBLIC_APP_URL}/pagamento/retorno?appointment=${input.appointmentId}`,
          failure: `${env.NEXT_PUBLIC_APP_URL}/pagamento/retorno?appointment=${input.appointmentId}`,
        },
        auto_return: "approved",
        notification_url: `${env.NEXT_PUBLIC_APP_URL}/api/webhooks/mercadopago`,
      },
    });
    if (!result.id || !(result.init_point || result.sandbox_init_point)) {
      throw new Error("Mercado Pago não retornou uma preferência válida.");
    }
    return {
      externalId: result.id,
      checkoutUrl: env.PAYMENT_PROVIDER_MODE === "production" ? result.init_point! : result.sandbox_init_point ?? result.init_point!,
    };
  }

  async getPayment(paymentId: string) {
    const result = await new Payment(this.client).get({ id: paymentId });
    return {
      status: result.status ?? "unknown",
      externalReference: result.external_reference ?? undefined,
    };
  }
}

export function getPaymentProvider(): PaymentProvider {
  assertProductionIntegrationConfig();
  if (env.PAYMENT_PROVIDER_MODE === "fake") throw new Error("Mercado Pago não habilitado.");
  if (!env.MERCADO_PAGO_ACCESS_TOKEN) throw new Error("Mercado Pago não configurado.");
  return new MercadoPagoProvider();
}
