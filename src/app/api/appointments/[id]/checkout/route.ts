import { jsonError } from "@/lib/api";
export async function POST() { return jsonError("O pagamento é conferido manualmente pela profissional. Consulte as instruções no agendamento.", 503); }
