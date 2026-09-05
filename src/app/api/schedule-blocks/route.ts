import { z } from "zod";
import { handleRouteError, jsonError } from "@/lib/api";
import { requireActivePsychologist } from "@/lib/authz";

const schema = z.object({ startsAt: z.iso.datetime({ offset: true }), endsAt: z.iso.datetime({ offset: true }), reason: z.string().trim().min(3).max(300) });

export async function GET() {
  const auth = await requireActivePsychologist();
  if (!auth) return jsonError("Acesso restrito.", 403);
  const { data, error } = await auth.supabase.from("schedule_blocks").select("id,starts_at,ends_at,administrative_reason").eq("psychologist_id", auth.user.id).eq("active", true).gte("ends_at", new Date().toISOString()).order("starts_at");
  if (error) return jsonError("Não foi possível carregar os bloqueios.", 500);
  return Response.json({ blocks: data ?? [] }, { headers: { "Cache-Control": "private, no-store" } });
}

export async function DELETE(request: Request) {
  const auth = await requireActivePsychologist();
  if (!auth) return jsonError("Acesso restrito.", 403);
  const id = new URL(request.url).searchParams.get("id");
  if (!id || !z.uuid().safeParse(id).success) return jsonError("Bloqueio inválido.", 422);
  const { error } = await auth.supabase.from("schedule_blocks").update({ active: false }).eq("id", id).eq("psychologist_id", auth.user.id);
  if (error) return jsonError("Não foi possível remover o bloqueio.", 500);
  return Response.json({ removed: true });
}

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
