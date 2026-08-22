import { AuthShell } from "@/components/auth-shell";
import { RecoveryForm } from "@/components/auth-form";

export const metadata = { title: "Recuperar senha" };
export default function RecoveryPage() { return <AuthShell title="Recuperar senha" subtitle="Enviaremos um link seguro se o e-mail estiver cadastrado."><RecoveryForm /></AuthShell>; }
