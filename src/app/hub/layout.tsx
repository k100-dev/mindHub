import { HubShell } from "@/components/hub-shell";
import { redirect } from "next/navigation";
import { requireActivePatient } from "@/lib/authz";

export default async function PatientHubLayout({ children }: { children: React.ReactNode }) {
  const auth = await requireActivePatient();
  if (!auth) redirect("/entrar?next=/hub");
  return <HubShell>{children}</HubShell>;
}
