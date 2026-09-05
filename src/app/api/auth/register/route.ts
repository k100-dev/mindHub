import { createClient } from "@/lib/supabase/server";
import { env } from "@/lib/env";
import { handleRouteError, jsonError } from "@/lib/api";
import { patientRegistrationSchema } from "@/lib/validation";
import { safeInternalPath } from "@/lib/routes";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = patientRegistrationSchema.parse(body);
    const supabase = await createClient();
    if (!supabase) return jsonError("Supabase ainda não foi configurado.", 503);
    const { data: result, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        emailRedirectTo: `${env.NEXT_PUBLIC_APP_URL}/auth/callback?next=${encodeURIComponent(safeInternalPath(body.next, "/hub"))}`,
        data: { role: "PATIENT", name: data.name, phone: data.phone },
      },
    });
    if (error) {
      if (error.message.toLowerCase().includes("already")) return jsonError("Este e-mail já está cadastrado.", 409);
      return jsonError("Não foi possível criar a conta.", 400);
    }
    return Response.json({ userId: result.user?.id, status: "ACTIVE" }, { status: 201 });
  } catch (error) { return handleRouteError(error); }
}
