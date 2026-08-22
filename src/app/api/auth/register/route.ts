import { createClient } from "@/lib/supabase/server";
import { env } from "@/lib/env";
import { handleRouteError, jsonError } from "@/lib/api";
import { patientRegistrationSchema, psychologistRegistrationSchema } from "@/lib/validation";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const role = body.role === "PSYCHOLOGIST" ? "PSYCHOLOGIST" : "PATIENT";
    const data = role === "PSYCHOLOGIST" ? psychologistRegistrationSchema.parse(body) : patientRegistrationSchema.parse(body);
    const supabase = await createClient();
    if (!supabase) return jsonError("Supabase ainda não foi configurado.", 503);
    const { data: result, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        emailRedirectTo: `${env.NEXT_PUBLIC_APP_URL}/auth/callback`,
        data: { role, name: data.name, phone: data.phone, ...(role === "PSYCHOLOGIST" ? { crp: "crp" in data ? data.crp : "" } : {}) },
      },
    });
    if (error) {
      if (error.message.toLowerCase().includes("already")) return jsonError("Este e-mail já está cadastrado.", 409);
      return jsonError("Não foi possível criar a conta.", 400);
    }
    let status = role === "PSYCHOLOGIST" ? "PENDING_REVIEW" : "ACTIVE";
    if (role === "PSYCHOLOGIST" && result.user?.id) {
      const allowlist = env.PSYCHOLOGIST_ALLOWLIST.split(",").map((item) => item.trim().toLowerCase()).filter(Boolean);
      if (allowlist.includes(data.email)) {
        const admin = createAdminClient();
        if (admin) {
          await admin.from("profiles").update({ status: "ACTIVE" }).eq("user_id", result.user.id);
          await admin.from("psychologist_profiles").update({ verification_status: "VERIFIED" }).eq("user_id", result.user.id);
          status = "ACTIVE";
        }
      }
    }
    return Response.json({ userId: result.user?.id, status }, { status: 201 });
  } catch (error) { return handleRouteError(error); }
}
