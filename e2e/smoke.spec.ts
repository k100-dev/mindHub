import { expect, test } from "@playwright/test";

test("jornada pública apresenta proposta e chamada de agendamento", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /sua agenda leve/i })).toBeVisible();
  await page.getByRole("link", { name: /agendar consulta/i }).first().click();
  await expect(page.getByRole("heading", { name: /escolha um horário disponível/i })).toBeVisible();
});

test("cadastro de paciente informa campos obrigatórios", async ({ page }) => {
  await page.goto("/cadastro/paciente");
  await expect(page.getByRole("heading", { name: /crie seu acesso/i })).toBeVisible();
  await expect(page.getByLabel(/nome completo/i)).toBeVisible();
  await expect(page.getByLabel(/^e-mail$/i)).toBeVisible();
  await expect(page.getByLabel(/whatsapp/i)).toBeVisible();
});

test("painel do projeto apresenta os gates reais do MVP", async ({ page }) => {
  await page.goto("/projeto");
  await expect(page.getByRole("heading", { name: /seis gates para concluir o MVP/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /supabase funcional/i })).toBeVisible();
  await expect(page.getByText(/ainda não é produção/i)).toBeVisible();
});
