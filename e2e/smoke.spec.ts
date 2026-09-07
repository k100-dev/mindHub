import { expect, test } from "@playwright/test";

test("página pública apresenta o produto e protege a agenda", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /seu horário, com clareza e privacidade/i })).toBeVisible();
  await expect(page.getByText(/sua agenda de cuidado/i)).toBeVisible();
  await expect(page.getByRole("link", { name: /agendar atendimento/i })).toHaveAttribute("href", /cadastro\/paciente\?next=/);
  await expect(page.getByText(/CRP|São Paulo|psicologia clínica|horários disponíveis|demonstração|MVP/i)).toHaveCount(0);
  await expect(page.locator("img, svg[role=img]")).toHaveCount(0);
});

test("perfil público direciona ao acesso sem renderizar slots", async ({ page }) => {
  await page.goto("/p/dra-isadora-bezerra");
  await expect(page.getByRole("heading", { name: /atendimento com Isadora Bezerra/i })).toBeVisible();
  await expect(page.getByText(/agenda não é exibida publicamente/i)).toBeVisible();
  await expect(page.getByRole("button", { name: /\d{2}:\d{2}/ })).toHaveCount(0);
});

test("rotas privadas fecham sem Supabase ou sessão e preservam next", async ({ page, request }) => {
  await page.goto("/app");
  await expect(page).toHaveURL(/\/entrar\?next=(%2F|\/)app/);
  await page.goto("/hub");
  await expect(page).toHaveURL(/\/entrar\?next=(%2F|\/)hub/);
  await page.goto("/p/dra-isadora-bezerra/horarios");
  await expect(page).toHaveURL(/\/entrar\?next=/);
  const slots = await request.get("/api/public/psychologists/dra-isadora-bezerra/slots");
  expect(slots.status()).toBe(401);
});

test("cadastro profissional e painel acadêmico não são públicos", async ({ request }) => {
  expect((await request.get("/cadastro/psicologa")).status()).toBe(404);
  expect((await request.get("/projeto")).status()).toBe(404);
  expect((await request.post("/api/auth/psychologists/register", { data: {} })).status()).toBe(404);
});

test("cadastro de paciente e recuperação têm os campos necessários", async ({ page }) => {
  await page.goto("/cadastro/paciente");
  await expect(page.getByLabel(/nome completo/i)).toBeVisible();
  await expect(page.getByLabel(/^e-mail$/i)).toBeVisible();
  await expect(page.getByLabel(/^telefone$/i)).toBeVisible();
  await page.goto("/auth/atualizar-senha");
  await expect(page.getByLabel(/^nova senha$/i)).toBeVisible();
  await expect(page.getByLabel(/^confirmar senha$/i)).toBeVisible();
});

test("layout não cria rolagem horizontal, inclusive com texto ampliado", async ({ page }) => {
  await page.goto("/");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  await page.addStyleTag({ content: "html { font-size: 200% !important; }" });
  await expect(page.getByRole("heading", { name: /seu horário, com clareza e privacidade/i })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
});
