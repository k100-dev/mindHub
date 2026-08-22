import { z } from "zod";
import { handleRouteError, jsonError } from "@/lib/api";
import { requireActivePsychologist } from "@/lib/authz";

const schema = z.object({ startsAt: z.iso.datetime({ offset: true }), endsAt: z.iso.datetime({ offset: true }), reason: z.string().trim().min(3).max(300) });

export async function POST(request: Request) {
  try {
    const auth = await requireActivePsychologist();
    if (!auth) return jsonError("Acesso restrito.", 403);
    const input = schema.parse(await request.json());
    if (new Date(input.startsAt) >= new Date(input.endsAt)) return jsonError("Intervalo inválido.", 422);
    const { data, error } = await auth.supabase.from("schedule_blocks").insert({ psychologist_id: auth.user.id, starts_at: input.startsAt, ends_at: input.endsAt, administrative_reason: input.reason }).select().single();
    if (error) return jsonError("Não foi possível criar o bloqueio.", 409);
    return Response.json({ block: data }, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
