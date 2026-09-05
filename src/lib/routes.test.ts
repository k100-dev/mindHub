import { describe, expect, it } from "vitest";
import { destinationForRole, safeInternalPath } from "@/lib/routes";

describe("redirecionamentos internos", () => {
  it("rejeita origens externas e barras duplas", () => {
    expect(safeInternalPath("https://example.com", "/entrar")).toBe("/entrar");
    expect(safeInternalPath("//example.com", "/entrar")).toBe("/entrar");
    expect(safeInternalPath("/\\example.com", "/entrar")).toBe("/entrar");
  });

  it("preserva a agenda privada para paciente", () => {
    expect(destinationForRole("PATIENT", "/p/dra-isadora-bezerra/horarios?dia=1")).toBe("/p/dra-isadora-bezerra/horarios?dia=1");
    expect(destinationForRole("PATIENT", "/app")).toBe("/hub");
  });

  it("limita profissional ao painel", () => {
    expect(destinationForRole("PSYCHOLOGIST", "/app/agenda")).toBe("/app/agenda");
    expect(destinationForRole("PSYCHOLOGIST", "/hub")).toBe("/app");
  });
});
