import "server-only";

import { createClient, getCurrentUser } from "@/lib/supabase/server";
import { env } from "@/lib/env";
import { ISADORA_SLUG } from "@/lib/mindhub";

export async function requireUser() {
  const supabase = await createClient();
  const user = await getCurrentUser();
  if (!supabase || !user) return null;
  return { supabase, user };
}

export async function requireActivePatient() {
  const auth = await requireUser();
  if (!auth) return null;
  const { data: profile } = await auth.supabase
    .from("profiles")
    .select("role,status,name")
    .eq("user_id", auth.user.id)
    .maybeSingle();
  if (profile?.role !== "PATIENT" || profile.status !== "ACTIVE") return null;
  return { ...auth, profile };
}

export async function requireActivePsychologist() {
  const auth = await requireUser();
  if (!auth?.user.email) return null;
  const allowedEmails = env.PSYCHOLOGIST_ALLOWLIST.split(",").map((value) => value.trim().toLowerCase()).filter(Boolean);
  if (!allowedEmails.includes(auth.user.email.toLowerCase())) return null;
  const [{ data: profile }, { data: professional }] = await Promise.all([
    auth.supabase.from("profiles").select("role,status,name").eq("user_id", auth.user.id).maybeSingle(),
    auth.supabase.from("psychologist_profiles").select("professional_name,public_slug,verification_status").eq("user_id", auth.user.id).maybeSingle(),
  ]);
  if (
    profile?.role !== "PSYCHOLOGIST" || profile.status !== "ACTIVE" ||
    professional?.verification_status !== "VERIFIED" || professional.public_slug !== ISADORA_SLUG
  ) return null;
  return { ...auth, profile, professional };
}

export function maskPhone(phone: string) {
  const clean = phone.replace(/\D/g, "");
  return clean.length > 4 ? `${"*".repeat(clean.length - 4)}${clean.slice(-4)}` : "****";
}
