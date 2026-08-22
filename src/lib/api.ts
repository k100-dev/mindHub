import { ZodError } from "zod";

export function jsonError(message: string, status: number, details?: unknown) {
  return Response.json({ error: { message, details } }, { status });
}

export function handleRouteError(error: unknown) {
  if (error instanceof ZodError) {
    return jsonError("Dados inválidos.", 422, error.flatten());
  }
  if (error instanceof SyntaxError) return jsonError("JSON inválido.", 400);
  console.error("route_error", error instanceof Error ? error.message : "unknown");
  return jsonError("Não foi possível concluir a operação.", 500);
}
