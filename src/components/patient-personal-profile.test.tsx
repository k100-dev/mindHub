import { afterEach, expect, test, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PatientPersonalProfile } from "./patient-personal-profile";

vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

function mockApi(fail = false) {
  const fetcher = vi.fn(async (url: string, options?: RequestInit) => {
    if (url === "/api/me/avatar") return new Response(null, { status: 404 });
    if (options?.method === "PATCH") return fail
      ? Response.json({ error: { message: "Não foi possível salvar." } }, { status: 400 })
      : Response.json(JSON.parse(String(options.body)));
    return Response.json({ email: "test@example.invalid", profile: { name: "Perfil de Teste", phone: "+5543999999999" }, roleProfile: { description: "Minha apresentação", hobbies: ["Leitura"] } });
  });
  vi.stubGlobal("fetch", fetcher);
  return fetcher;
}

test("edita apresentação, remove hobby e salva um interesse digitado", async () => {
  const fetcher = mockApi(); const user = userEvent.setup(); render(<PatientPersonalProfile/>);
  const description = await screen.findByLabelText("Sobre você");
  await user.clear(description); await user.type(description, "Gosto de fotografia.");
  await user.click(screen.getByRole("button", { name: "Remover Leitura" }));
  await user.type(screen.getByLabelText("Hobbies e interesses"), "Fotografia");
  await user.click(screen.getByRole("button", { name: "Salvar apresentação" }));
  await screen.findByText("Apresentação salva.");
  expect(fetcher).toHaveBeenCalledWith("/api/me/personal", expect.objectContaining({ body: JSON.stringify({ description: "Gosto de fotografia.", hobbies: ["Fotografia"] }) }));
});

test("mantém edições ao alternar seções e permite apagar a descrição", async () => {
  mockApi(); const user = userEvent.setup(); render(<PatientPersonalProfile/>);
  const description = await screen.findByLabelText("Sobre você");
  await user.clear(description);
  await user.click(screen.getByRole("button", { name: "Dados de contato" }));
  await user.click(screen.getByRole("button", { name: "Foto e apresentação" }));
  expect(description).toHaveValue("");
  await user.click(screen.getByRole("button", { name: "Salvar apresentação" }));
  await screen.findByText("Apresentação salva.");
});

test("falha no salvamento mantém conteúdo e mostra erro", async () => {
  mockApi(true); const user = userEvent.setup(); render(<PatientPersonalProfile/>);
  await screen.findByLabelText("Sobre você");
  await user.click(screen.getByRole("button", { name: "Salvar apresentação" }));
  await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("Não foi possível salvar."));
  expect(screen.getByLabelText("Sobre você")).toHaveValue("Minha apresentação");
});
