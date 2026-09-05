import { z } from "zod";
import { handleRouteError, jsonError } from "@/lib/api";
import { requireActivePsychologist } from "@/lib/authz";

const rule = z.object({ weekday: z.number().int().min(0).max(6), startsAt: z.string().regex(/^\d{2}:\d{2}$/), endsAt: z.string().regex(/^\d{2}:\d{2}$/), enabled: z.boolean() });
const schema = z.object({ rules: z.array(rule).length(7), sessionDurationMinutes: z.number().int().min(20).max(240).default(60) });

export async function GET() {
  const auth = await requireActivePsychologist();
  if (!auth) return jsonError("Acesso restrito.", 403);
  const { data, error } = await auth.supabase.from("availability_rules").select("id,weekday,starts_at,ends_at,session_duration_minutes").eq("psychologist_id", auth.user.id).eq("active", true).order("weekday");
  if (error) return jsonError("Não foi possível carregar a disponibilidade.", 500);
  return Response.json({ rules: data ?? [] }, { headers: { "Cache-Control": "private, no-store" } });
}

export async function PUT(request: Request) {
  try {
    const auth = await requireActivePsychologist();
    if (!auth) return jsonError("Acesso restrito.", 403);
    const input = schema.parse(await request.json());
    if (input.rules.some((item) => item.enabled && item.startsAt >= item.endsAt)) return jsonError("Há um intervalo de horário inválido.", 422);
    const today = new Date().toISOString().slice(0, 10);
    const { error: disableError } = await auth.supabase.from("availability_rules").update({ active: false }).eq("psychologist_id", auth.user.id).eq("active", true);
    if (disableError) return jsonError("Não foi possível substituir as regras atuais.", 500);
    const active = input.rules.filter((item) => item.enabled).map((item) => ({ psychologist_id: auth.user.id, weekday: item.weekday, starts_at: item.startsAt, ends_at: item.endsAt, session_duration_minutes: input.sessionDurationMinutes, valid_from: today, active: true }));
    const { error } = active.length ? await auth.supabase.from("availability_rules").insert(active) : { error: null };
    if (error) return jsonError("Não foi possível salvar a disponibilidade.", 409);
    return Response.json({ saved: active.length });
  } catch (error) { return handleRouteError(error); }
}
