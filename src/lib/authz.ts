import "server-only";

import { createClient, getCurrentUser } from "@/lib/supabase/server";

export async function requireUser() {
  const supabase = await createClient();
  const user = await getCurrentUser();
  if (!supabase || !user) return null;
  return { supabase, user };
}

export async function requireActivePsychologist() {
  const auth = await requireUser();
  if (!auth) return null;
  const { data: profile } = await auth.supabase
    .from("profiles")
    .select("role,status")
    .eq("user_id", auth.user.id)
    .maybeSingle();
  if (profile?.role !== "PSYCHOLOGIST" || profile.status !== "ACTIVE") return null;
  return auth;
}

export function maskPhone(phone: string) {
  const clean = phone.replace(/\D/g, "");
  return clean.length > 4 ? `${"*".repeat(clean.length - 4)}${clean.slice(-4)}` : "****";
}
