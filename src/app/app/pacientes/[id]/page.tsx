import { PatientDetailWorkspace } from "@/components/patient-detail-workspace";
export default async function PatientPage({ params }: PageProps<"/app/pacientes/[id]">) { const { id } = await params; return <PatientDetailWorkspace id={id} />; }
