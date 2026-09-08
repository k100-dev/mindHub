import { expect, test } from "vitest";
import { isWebp, personalProfileSchema } from "./patient-profile";

test("perfil aceita remoção de todos os campos opcionais", () => {
  expect(personalProfileSchema.parse({ description: "", hobbies: [] })).toEqual({ description: "", hobbies: [] });
});
test("limita tamanho e quantidade de interesses", () => {
  expect(personalProfileSchema.safeParse({ description: "a".repeat(601), hobbies: [] }).success).toBe(false);
  expect(personalProfileSchema.safeParse({ description: "", hobbies: Array(13).fill("Cinema") }).success).toBe(false);
  expect(personalProfileSchema.safeParse({ description: "", hobbies: ["a".repeat(41)] }).success).toBe(false);
});
test("rejeita conteúdo disfarçado de imagem WebP", () => {
  expect(isWebp(new TextEncoder().encode("<svg></svg>"))).toBe(false);
  expect(isWebp(new Uint8Array())).toBe(false);
  expect(isWebp(new TextEncoder().encode("RIFF1234WEBP"))).toBe(true);
});
