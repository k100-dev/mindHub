import { addDays, addMinutes, format } from "date-fns";
import { createAdminClient } from "@/lib/supabase/admin";
import { jsonError } from "@/lib/api";

export async function GET(request: Request, { params }: RouteContext<"/api/public/psychologists/[slug]/slots">) {
  const supabase = createAdminClient();
  if (!supabase) return jsonError("Supabase administrativo ainda não foi configurado.", 503);
  const { slug } = await params;
  const url = new URL(request.url);
  const from = url.searchParams.get("from") ? new Date(url.searchParams.get("from")!) : new Date();
  const to = url.searchParams.get("to") ? new Date(url.searchParams.get("to")!) : addDays(from, 14);
  if (Number.isNaN(from.valueOf()) || Number.isNaN(to.valueOf()) || to <= from || to.getTime() - from.getTime() > 31 * 86400000) {
    return jsonError("Intervalo inválido; consulte no máximo 31 dias.", 422);
  }
  const { data: professional } = await supabase
    .from("psychologist_profiles")
    .select("user_id,session_duration_minutes")
    .eq("public_slug", slug)
    .eq("verification_status", "VERIFIED")
    .maybeSingle();
  if (!professional) return jsonError("Perfil não encontrado.", 404);
  const [{ data: rules }, { data: blocks }, { data: appointments }] = await Promise.all([
    supabase.from("availability_rules").select("weekday,starts_at,ends_at,session_duration_minutes,valid_from,valid_until").eq("psychologist_id", professional.user_id).eq("active", true),
    supabase.from("schedule_blocks").select("starts_at,ends_at").eq("psychologist_id", professional.user_id).eq("active", true).lt("starts_at", to.toISOString()).gt("ends_at", from.toISOString()),
    supabase.from("appointments").select("starts_at,ends_at").eq("psychologist_id", professional.user_id).in("status", ["RESERVADO_TEMPORARIAMENTE", "AGUARDANDO_SINAL", "CONFIRMADO"]).lt("starts_at", to.toISOString()).gt("ends_at", from.toISOString()),
  ]);
  const busy = [...(blocks ?? []), ...(appointments ?? [])].map((item) => ({ start: new Date(item.starts_at), end: new Date(item.ends_at) }));
  const slots: { startsAt: string; endsAt: string }[] = [];
  for (let day = new Date(from); day <= to; day = addDays(day, 1)) {
    const dayKey = format(day, "yyyy-MM-dd");
    for (const rule of rules ?? []) {
      if (day.getDay() !== rule.weekday || dayKey < rule.valid_from || (rule.valid_until && dayKey > rule.valid_until)) continue;
      const [startHour, startMinute] = rule.starts_at.split(":").map(Number);
      const [endHour, endMinute] = rule.ends_at.split(":").map(Number);
      const start = new Date(`${dayKey}T${String(startHour).padStart(2, "0")}:${String(startMinute).padStart(2, "0")}:00-03:00`);
      const end = new Date(`${dayKey}T${String(endHour).padStart(2, "0")}:${String(endMinute).padStart(2, "0")}:00-03:00`);
      const duration = rule.session_duration_minutes ?? professional.session_duration_minutes;
      for (let cursor = start; addMinutes(cursor, duration) <= end; cursor = addMinutes(cursor, duration)) {
        const candidateEnd = addMinutes(cursor, duration);
        if (cursor > new Date() && !busy.some((item) => cursor < item.end && candidateEnd > item.start)) {
          slots.push({ startsAt: cursor.toISOString(), endsAt: candidateEnd.toISOString() });
        }
      }
    }
  }
  return Response.json({ psychologistId: professional.user_id, slots });
}
