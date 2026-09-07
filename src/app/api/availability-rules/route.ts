import { z } from "zod";
import { handleRouteError, jsonError } from "@/lib/api";
import { requireActivePsychologist } from "@/lib/authz";
import { createAdminClient } from "@/lib/supabase/admin";

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
    const admin = createAdminClient();
    if (!admin) return jsonError("Agenda temporariamente indisponível.", 503);
    const { error } = await admin.rpc("save_weekly_availability", { p_professional: auth.user.id, p_rules: input.rules });
    if (error) return jsonError("Não foi possível salvar a disponibilidade.", 409);
    return Response.json({ saved: input.rules.filter((item) => item.enabled).length });
  } catch (error) { return handleRouteError(error); }
}
