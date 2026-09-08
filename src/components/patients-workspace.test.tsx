import { afterEach, expect, test, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PatientsWorkspace } from "./patients-workspace";

afterEach(() => { cleanup(); vi.unstubAllGlobals(); });
test("combina busca e status e permite limpar os dois filtros", async () => {
  vi.stubGlobal("fetch", vi.fn(async () => Response.json({ patients: [
    { patient_id: "a", status: "ATIVO", appointments: 1, profile: { name: "Ana Teste", phone: "123" } },
    { patient_id: "b", status: "INATIVO", appointments: 0, profile: { name: "Bruno Teste", phone: "456" } },
  ] })));
  const user = userEvent.setup(); render(<PatientsWorkspace/>);
  await screen.findByText("2 paciente(s) encontrado(s)");
  await user.click(screen.getByRole("button", { name: /Inativos/ }));
  await screen.findByText("1 paciente(s) encontrado(s)");
  await user.type(screen.getByRole("textbox", { name: "Buscar pacientes" }), "Ana");
  await screen.findByText("0 paciente(s) encontrado(s)");
  await user.click(screen.getByRole("button", { name: "Limpar filtros" }));
  await screen.findByText("2 paciente(s) encontrado(s)");
  expect(screen.getByRole("textbox", { name: "Buscar pacientes" })).toHaveValue("");
});
