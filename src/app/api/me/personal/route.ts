import { requireActivePatient } from "@/lib/authz";
import { handleRouteError, jsonError } from "@/lib/api";
import { personalProfileSchema } from "@/lib/patient-profile";

export async function PATCH(request: Request) {
  try {
    const auth = await requireActivePatient();
    if (!auth) return jsonError("Acesso de paciente necessário.", 401);
    const input = personalProfileSchema.parse(await request.json());
    const { data, error } = await auth.supabase.from("patient_profiles")
      .update(input).eq("user_id", auth.user.id).select("description,hobbies").single();
    if (error) return jsonError("Não foi possível salvar sua apresentação. Tente novamente.", 400);
    return Response.json(data, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) { return handleRouteError(error); }
}
