import { DashboardShell } from "@/components/dashboard-shell";
import { redirect } from "next/navigation";
import { requireActivePsychologist } from "@/lib/authz";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const auth = await requireActivePsychologist();
  if (!auth) redirect("/entrar?next=/app");
  return <DashboardShell name={auth.professional.professional_name}>{children}</DashboardShell>;
}
