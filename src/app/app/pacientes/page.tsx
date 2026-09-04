import Link from "next/link";
import { PageHeading } from "@/components/page-heading";
import { PatientsWorkspace } from "@/components/patients-workspace";

export default function PatientsPage() {
  return <><PageHeading title="Pacientes" description="Cadastros e histórico administrativo vinculados à sua conta." action={<Link href="/app/pacientes/novo" className="button-primary">+ Novo paciente</Link>} /><PatientsWorkspace /></>;
}
