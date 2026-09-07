import { describe, expect, it } from "vitest";
import { patientRegistrationSchema, phone } from "./validation";
describe("cadastro de paciente", () => {
  it("aceita telefone brasileiro formatado e normaliza para armazenamento", () => {
    expect(phone.parse("(43) 99999-1234")).toBe("+5543999991234");
    expect(phone.parse("+55 43 3333-1234")).toBe("+554333331234");
    expect(phone.safeParse("123").success).toBe(false);
  });
  it("recusa confirmação divergente no servidor", () => {
    const input = { name: "Paciente Teste", email: "teste@example.com", phone: "(43) 99999-1234", password: "UmaSenhaLonga123", confirmation: "OutraSenhaLonga" };
    expect(patientRegistrationSchema.safeParse(input).success).toBe(false);
    expect(patientRegistrationSchema.safeParse({ ...input, confirmation: input.password }).success).toBe(true);
  });
});
