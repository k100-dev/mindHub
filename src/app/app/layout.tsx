import { DashboardShell } from "@/components/dashboard-shell";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseConfig } from "@/lib/env";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  if (hasSupabaseConfig()) {
    const supabase = await createClient();
    const { data: { user } } = await supabase!.auth.getUser();
    if (!user) redirect("/entrar?next=/app");
    const { data: profile } = await supabase!.from("profiles").select("role,status").eq("user_id", user.id).single();
    if (profile?.role !== "PSYCHOLOGIST" || profile.status !== "ACTIVE") redirect("/entrar?status=pending");
  }
  return <DashboardShell>{children}</DashboardShell>;
}
