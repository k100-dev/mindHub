import { jsonError } from "@/lib/api";

export function POST() {
  return jsonError("Cadastro profissional não disponível.", 404);
}
