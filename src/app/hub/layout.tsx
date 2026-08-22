import { HubShell } from "@/components/hub-shell";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseConfig } from "@/lib/env";

export default async function PatientHubLayout({ children }: { children: React.ReactNode }) {
  if (hasSupabaseConfig()) {
    const supabase = await createClient();
    const { data: { user } } = await supabase!.auth.getUser();
    if (!user) redirect("/entrar?next=/hub");
    const { data: profile } = await supabase!.from("profiles").select("role,status").eq("user_id", user.id).single();
    if (profile?.role !== "PATIENT" || profile.status !== "ACTIVE") redirect("/entrar");
  }
  return <HubShell>{children}</HubShell>;
}
