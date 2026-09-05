import { z } from "zod";
import { handleRouteError, jsonError } from "@/lib/api";
import { requireUser } from "@/lib/authz";

const schema = z.object({
  name: z.string().trim().min(3).max(120).optional(),
  phone: z.string().regex(/^\+?[1-9]\d{9,14}$/).optional(),
  timezone: z.string().min(3).max(60).optional(),
  professionalName: z.string().trim().min(3).max(120).optional(),
  bio: z.string().max(1200).optional(),
  publicSlug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(80).optional(),
  sessionDurationMinutes: z.number().int().min(20).max(240).optional(),
  depositAmount: z.number().min(0).max(100000).optional(),
});

export async function GET() {
  const auth = await requireUser();
  if (!auth) return jsonError("Autenticação necessária.", 401);
  const { data: profile } = await auth.supabase.from("profiles").select("*").eq("user_id", auth.user.id).single();
  const { data: roleProfile } = profile?.role === "PSYCHOLOGIST"
    ? await auth.supabase.from("psychologist_profiles").select("*").eq("user_id", auth.user.id).single()
    : await auth.supabase.from("patient_profiles").select("*").eq("user_id", auth.user.id).single();
  return Response.json({ profile, roleProfile, email: auth.user.email }, { headers: { "Cache-Control": "private, no-store" } });
}

export async function PATCH(request: Request) {
  try {
    const auth = await requireUser();
    if (!auth) return jsonError("Autenticação necessária.", 401);
    const input = schema.parse(await request.json());
    const profilePatch = { ...(input.name && { name: input.name }), ...(input.phone && { phone: input.phone }), ...(input.timezone && { timezone: input.timezone }) };
    if (Object.keys(profilePatch).length) await auth.supabase.from("profiles").update(profilePatch).eq("user_id", auth.user.id);
    const professionalPatch = { ...(input.professionalName && { professional_name: input.professionalName }), ...(input.bio !== undefined && { bio: input.bio }), ...(input.publicSlug && { public_slug: input.publicSlug }), ...(input.sessionDurationMinutes && { session_duration_minutes: input.sessionDurationMinutes }), ...(input.depositAmount !== undefined && { deposit_amount: input.depositAmount }) };
    if (Object.keys(professionalPatch).length) {
      const { error } = await auth.supabase.from("psychologist_profiles").update(professionalPatch).eq("user_id", auth.user.id);
      if (error) return jsonError("Slug já utilizado ou dados inválidos.", 409);
    }
    return Response.json({ updated: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
