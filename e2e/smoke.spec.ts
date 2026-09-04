import { expect, test } from "@playwright/test";

test("jornada pública apresenta proposta e chamada de agendamento", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /sua agenda leve/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /área da psicóloga/i }).first()).toHaveAttribute("href", "/entrar?next=/app");
  await expect(page.getByText(/plano do projeto/i)).toHaveCount(0);
  await expect(page.getByRole("link", { name: /sou psicóloga/i })).toHaveCount(0);
  await expect(page.getByText(/área exclusiva da psicóloga/i)).toHaveCount(0);
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

test("UC01 e UC02 funcionam no modo demonstrativo", async ({ page }) => {
  await page.goto("/app/pacientes");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.getByRole("link", { name: /novo paciente/i }).click();
  await page.getByLabel(/nome completo/i).fill("Paciente de Teste");
  await page.getByLabel(/^e-mail$/i).fill("paciente.teste@example.com");
  await page.getByLabel(/whatsapp/i).fill("+55 43 99999-0000");
  await page.getByRole("button", { name: /salvar paciente/i }).click();
  await expect(page.getByText("Paciente de Teste")).toBeVisible();

  await page.goto("/app/agenda");
  await page.getByLabel("Paciente").selectOption({ label: "Paciente de Teste" });
  await page.getByLabel("Data").fill("2026-09-04");
  await page.getByLabel("Horário").fill("16:00");
  await page.getByRole("button", { name: /criar agendamento/i }).click();
  await expect(page.getByRole("status")).toContainText(/agendamento criado/i);

  await page.getByLabel("Paciente").selectOption({ label: "Paciente de Teste" });
  await page.getByLabel("Data").fill("2026-09-04");
  await page.getByLabel("Horário").fill("16:00");
  await page.getByRole("button", { name: /criar agendamento/i }).click();
  await expect(page.getByRole("status")).toContainText(/conflito/i);
});
