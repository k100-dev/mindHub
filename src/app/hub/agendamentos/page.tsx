import Link from "next/link";
import { PageHeading } from "@/components/page-heading";
import { PatientAppointments } from "@/components/patient-appointments";
import { getPatientArea } from "@/lib/page-data";
export default async function PatientAppointmentsPage() {
  const data = await getPatientArea();
  if (!data) return null;
  return <><PageHeading title="Meus encontros" description="Acompanhe seus próximos passos e os encontros que já fizeram parte do caminho." action={<Link href="/hub/agendar" className="button-primary">Agendar encontro</Link>}/><PatientAppointments appointments={data.appointments} now={new Date().getTime()}/></>;
}
