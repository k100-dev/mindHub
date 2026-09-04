import { demoAppointments, demoPatients } from "@/lib/demo-data";

export type DemoPatient = (typeof demoPatients)[number];
export type DemoAppointment = (typeof demoAppointments)[number] & { patientId?: string };

export type DemoWorkspace = {
  patients: DemoPatient[];
  appointments: DemoAppointment[];
};

const STORAGE_KEY = "mindhub.demo.workspace.v1";

export function initialDemoWorkspace(): DemoWorkspace {
  return {
    patients: demoPatients.map((patient) => ({ ...patient })),
    appointments: demoAppointments.map((appointment) => ({
      ...appointment,
      patientId: demoPatients.find((patient) => patient.name === appointment.patient)?.id,
    })),
  };
}
export function loadDemoWorkspace(): DemoWorkspace {
  if (typeof window === "undefined") return initialDemoWorkspace();
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored ? (JSON.parse(stored) as DemoWorkspace) : initialDemoWorkspace();
  } catch {
    return initialDemoWorkspace();
  }
}

export function saveDemoWorkspace(workspace: DemoWorkspace) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(workspace));
  window.dispatchEvent(new CustomEvent("mindhub:demo-workspace"));
}

export function createDemoPatient(input: { name: string; email: string; phone: string }) {
  const workspace = loadDemoWorkspace();
  if (workspace.patients.some((patient) => patient.email.toLowerCase() === input.email.toLowerCase())) {
    throw new Error("Já existe um paciente com este e-mail na demonstração.");
  }
  const patient: DemoPatient = {
    id: `demo-${Date.now()}`,
    name: input.name,
    email: input.email,
    phone: input.phone,
    status: "ATIVO",
    appointments: 0,
  };
  saveDemoWorkspace({ ...workspace, patients: [patient, ...workspace.patients] });
  return patient;
}
