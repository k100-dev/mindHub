import { z } from "zod";
import { handleRouteError, jsonError } from "@/lib/api";
import { requireActivePsychologist } from "@/lib/authz";

const schema = z.object({
  weekday: z.number().int().min(0).max(6),
  startsAt: z.string().regex(/^\d{2}:\d{2}$/),
  endsAt: z.string().regex(/^\d{2}:\d{2}$/),
  sessionDurationMinutes: z.number().int().min(20).max(240),
  validFrom: z.iso.date(),
  validUntil: z.iso.date().nullable().optional(),
  active: z.boolean().default(true),
});

export async function PUT(request: Request, { params }: RouteContext<"/api/availability-rules/[id]">) {
  try {
    const auth = await requireActivePsychologist();
    if (!auth) return jsonError("Acesso restrito.", 403);
    const input = schema.parse(await request.json());
    if (input.startsAt >= input.endsAt) return jsonError("O início deve ser anterior ao fim.", 422);
    const { id } = await params;
    const payload = { psychologist_id: auth.user.id, weekday: input.weekday, starts_at: input.startsAt, ends_at: input.endsAt, session_duration_minutes: input.sessionDurationMinutes, valid_from: input.validFrom, valid_until: input.validUntil ?? null, active: input.active };
    const query = id === "new"
      ? auth.supabase.from("availability_rules").insert(payload)
      : auth.supabase.from("availability_rules").update(payload).eq("id", id).eq("psychologist_id", auth.user.id);
    const { error } = await query;
    if (error) return jsonError("Não foi possível salvar a disponibilidade.", 409);
    return Response.json({ saved: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
