import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

export async function getProfessional(slug?: string) {
  const admin = createAdminClient();
  if (!admin) return null;
  let query = admin.from("psychologist_profiles").select("user_id,professional_name,public_slug,session_duration_minutes,session_price,deposit_amount,payment_instructions").eq("verification_status", "VERIFIED");
  if (slug) query = query.eq("public_slug", slug);
  const { data, error } = await query.order("created_at").limit(1).maybeSingle();
  return error ? null : data;
}
