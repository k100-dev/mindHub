import { requireActivePatient } from "@/lib/authz";
import { jsonError, handleRouteError } from "@/lib/api";
import { AVATAR_MAX_BYTES, isWebp } from "@/lib/patient-profile";

export async function GET() {
  const auth = await requireActivePatient();
  if (!auth) return jsonError("Acesso de paciente necessário.", 401);
  const { data, error } = await auth.supabase.storage.from("patient-avatars").download(`${auth.user.id}/avatar.webp`);
  if (error || !data) return new Response(null, { status: 404, headers: { "Cache-Control": "private, no-store" } });
  return new Response(data, { headers: { "Content-Type": "image/webp", "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" } });
}

export async function POST(request: Request) {
  try {
    const auth = await requireActivePatient();
    if (!auth) return jsonError("Acesso de paciente necessário.", 401);
    if (Number(request.headers.get("content-length")) > AVATAR_MAX_BYTES + 4096) return jsonError("A foto deve ter até 2 MB.", 413);
    const form = await request.formData();
    const file = form.get("photo");
    if (!(file instanceof File) || file.type !== "image/webp" || file.size > AVATAR_MAX_BYTES) return jsonError("Selecione uma foto válida de até 2 MB.", 400);
    const bytes = new Uint8Array(await file.arrayBuffer());
    if (!isWebp(bytes)) return jsonError("O arquivo não é uma foto válida.", 400);
    const { error } = await auth.supabase.storage.from("patient-avatars").upload(`${auth.user.id}/avatar.webp`, bytes, { contentType: "image/webp", upsert: true, cacheControl: "0" });
    if (error) return jsonError("Não foi possível salvar sua foto. Tente novamente.", 400);
    return Response.json({ updated: true });
  } catch (error) { return handleRouteError(error); }
}

export async function DELETE() {
  const auth = await requireActivePatient();
  if (!auth) return jsonError("Acesso de paciente necessário.", 401);
  const { error } = await auth.supabase.storage.from("patient-avatars").remove([`${auth.user.id}/avatar.webp`]);
  if (error) return jsonError("Não foi possível remover sua foto.", 400);
  return Response.json({ removed: true });
}
