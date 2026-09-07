"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";

export function PatientForm() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); setMessage("");
    const form = new FormData(event.currentTarget);
    const birthDate = String(form.get("birthDate") ?? "");
    try {
      const response = await fetch("/api/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.get("name"), email: form.get("email"), phone: form.get("phone"), ...(birthDate && { birthDate }) }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error?.message ?? "Não foi possível salvar.");
      setMessage("Paciente cadastrado e convite de acesso enviado.");
      router.push(`/app/pacientes/${body.patient.id}`); router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Não foi possível salvar.");
    } finally { setLoading(false); }
  }

  return <form onSubmit={submit} className="card grid max-w-3xl gap-5 p-6"><div className="grid gap-5 sm:grid-cols-2"><label className="grid gap-2 text-sm font-bold sm:col-span-2">Nome completo<input className="field" name="name" required minLength={3} /></label><label className="grid gap-2 text-sm font-bold">E-mail<input className="field" name="email" type="email" required /></label><label className="grid gap-2 text-sm font-bold">Telefone<input className="field" name="phone" type="tel" autoComplete="tel" placeholder="(43) 99999-9999" required /></label><label className="grid gap-2 text-sm font-bold">Data de nascimento<input className="field" name="birthDate" type="date" /></label></div><div className="rounded-xl bg-amber-50 p-4 text-sm leading-6 text-amber-900"><strong>Importante:</strong> não registre diagnóstico, evolução clínica ou qualquer conteúdo de prontuário.</div>{message && <p role="status" className="rounded-xl bg-sky-50 p-3 text-sm text-sky-900">{message}</p>}<button disabled={loading} className="button-primary justify-self-start">{loading && <LoaderCircle className="animate-spin" size={18} />}{loading ? "Salvando…" : "Salvar paciente"}</button></form>;
}
