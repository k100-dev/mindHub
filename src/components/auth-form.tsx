"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/browser";

type RegistrationRole = "PATIENT" | "PSYCHOLOGIST";

export function LoginForm() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); setMessage("");
    const form = new FormData(event.currentTarget);
    const client = createClient();
    if (!client) { setMessage("Configure o Supabase para autenticar. A interface está em modo de demonstração."); setLoading(false); return; }
    const { data, error } = await client.auth.signInWithPassword({ email: String(form.get("email")), password: String(form.get("password")) });
    if (error) { setMessage("E-mail ou senha inválidos."); setLoading(false); return; }
    const role = data.user.user_metadata.role;
    router.push(role === "PATIENT" ? "/hub" : "/app"); router.refresh();
  }

  return (
    <form onSubmit={submit} className="mt-7 grid gap-4">
      <label className="grid gap-2 text-sm font-bold">E-mail<input className="field" name="email" type="email" autoComplete="email" required placeholder="seu@email.com" /></label>
      <label className="grid gap-2 text-sm font-bold">Senha<input className="field" name="password" type="password" autoComplete="current-password" required minLength={10} /></label>
      {message && <p role="alert" className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900">{message}</p>}
      <button className="button-primary mt-1 w-full" disabled={loading}>{loading && <LoaderCircle size={18} className="animate-spin" />}{loading ? "Entrando…" : "Entrar"}</button>
    </form>
  );
}

export function RegistrationForm({ role }: { role: RegistrationRole }) {
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); setMessage("");
    const form = new FormData(event.currentTarget);
    const payload = {
      role,
      name: String(form.get("name")), email: String(form.get("email")), password: String(form.get("password")), phone: String(form.get("phone")),
      ...(role === "PSYCHOLOGIST" ? { crp: String(form.get("crp")) } : {}),
    };
    try {
      const response = await fetch("/api/auth/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error?.message ?? "Não foi possível criar a conta.");
      setSuccess(true); setMessage("Conta criada. Confira seu e-mail para confirmar o acesso.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Não foi possível criar a conta."); }
    finally { setLoading(false); }
  }

  if (success) return <div className="mt-7 rounded-2xl bg-emerald-50 p-5 text-emerald-900"><p className="font-extrabold">Cadastro recebido</p><p className="mt-2 text-sm leading-6">{message}</p></div>;

  return (
    <form onSubmit={submit} className="mt-7 grid gap-4">
      <label className="grid gap-2 text-sm font-bold">Nome completo<input className="field" name="name" required minLength={3} autoComplete="name" /></label>
      <div className="grid gap-4 sm:grid-cols-2"><label className="grid gap-2 text-sm font-bold">E-mail<input className="field" name="email" type="email" required autoComplete="email" /></label><label className="grid gap-2 text-sm font-bold">WhatsApp<input className="field" name="phone" required placeholder="+5511999999999" autoComplete="tel" /></label></div>
      {role === "PSYCHOLOGIST" && <label className="grid gap-2 text-sm font-bold">CRP<input className="field" name="crp" required placeholder="06/123456" /></label>}
      <label className="grid gap-2 text-sm font-bold">Senha<input className="field" name="password" type="password" required minLength={10} autoComplete="new-password" /><span className="muted text-xs font-normal">Mínimo de 10 caracteres.</span></label>
      {role === "PSYCHOLOGIST" && <p className="rounded-xl bg-sky-50 p-3 text-xs leading-5 text-sky-900">O cadastro profissional fica pendente até a validação. Apenas a conta autorizada no ambiente de demonstração será ativada.</p>}
      {message && <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-rose-900">{message}</p>}
      <button className="button-primary mt-1 w-full" disabled={loading}>{loading && <LoaderCircle size={18} className="animate-spin" />}{loading ? "Criando conta…" : "Criar conta"}</button>
    </form>
  );
}

export function RecoveryForm() {
  const [message, setMessage] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = new FormData(event.currentTarget); const client = createClient();
    if (!client) { setMessage("Configure o Supabase para enviar o e-mail de recuperação."); return; }
    await client.auth.resetPasswordForEmail(String(form.get("email")), { redirectTo: `${location.origin}/auth/atualizar-senha` });
    setMessage("Se o e-mail existir, enviaremos as instruções de recuperação.");
  }
  return <form onSubmit={submit} className="mt-7 grid gap-4"><label className="grid gap-2 text-sm font-bold">E-mail<input className="field" name="email" type="email" required /></label>{message && <p className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-900">{message}</p>}<button className="button-primary w-full">Enviar instruções</button></form>;
}
