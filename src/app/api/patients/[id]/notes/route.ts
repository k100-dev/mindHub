import { z } from "zod";
import { handleRouteError, jsonError } from "@/lib/api";
import { requireActivePsychologist } from "@/lib/authz";
import { createAdminClient } from "@/lib/supabase/admin";

async function relationship(psychologistId: string, patientId: string) {
  const admin = createAdminClient();
  if (!admin) return { admin: null, link: null };
  const { data: link } = await admin.from("psychologist_patients").select("id").eq("psychologist_id", psychologistId).eq("patient_id", patientId).maybeSingle();
  return { admin, link };
}

export async function GET(_: Request, { params }: RouteContext<"/api/patients/[id]/notes">) {
  const auth = await requireActivePsychologist(); if (!auth) return jsonError("Acesso restrito.", 403);
  const { id } = await params; const { admin, link } = await relationship(auth.user.id, id);
  if (!admin) return jsonError("Serviço temporariamente indisponível.", 503); if (!link) return jsonError("Paciente não encontrado.", 404);
  const { data, error } = await admin.from("patient_notes").select("id,administrative_content,created_at").eq("psychologist_patient_id", link.id).order("created_at", { ascending: false });
  if (error) return jsonError("Não foi possível carregar as observações.", 500);
  return Response.json({ notes: data ?? [] }, { headers: { "Cache-Control": "private, no-store" } });
}

export async function POST(request: Request, { params }: RouteContext<"/api/patients/[id]/notes">) {
  try {
    const auth = await requireActivePsychologist(); if (!auth) return jsonError("Acesso restrito.", 403);
    const { id } = await params; const { admin, link } = await relationship(auth.user.id, id);
    if (!admin) return jsonError("Serviço temporariamente indisponível.", 503); if (!link) return jsonError("Paciente não encontrado.", 404);
    const { content } = z.object({ content: z.string().trim().min(3).max(2000) }).parse(await request.json());
    const { data, error } = await admin.from("patient_notes").insert({ psychologist_patient_id: link.id, author_id: auth.user.id, administrative_content: content }).select("id,administrative_content,created_at").single();
    if (error) return jsonError("Não foi possível registrar a observação.", 500);
    return Response.json({ note: data }, { status: 201 });
  } catch (error) { return handleRouteError(error); }
}
