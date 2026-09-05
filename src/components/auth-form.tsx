"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/browser";
import { destinationForRole } from "@/lib/routes";

export function LoginForm({ next }: { next?: string }) {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); setMessage("");
    const form = new FormData(event.currentTarget);
    const client = createClient();
    if (!client) { setMessage("O acesso está temporariamente indisponível."); setLoading(false); return; }
    const { error } = await client.auth.signInWithPassword({ email: String(form.get("email")), password: String(form.get("password")) });
    if (error) { setMessage("E-mail ou senha inválidos."); setLoading(false); return; }
    const response = await fetch("/api/me", { cache: "no-store" });
    const body = await response.json();
    if (!response.ok || body.profile?.status !== "ACTIVE" || !["PATIENT", "PSYCHOLOGIST"].includes(body.profile?.role)) {
      await client.auth.signOut();
      setMessage("Sua conta ainda não está liberada para acesso.");
      setLoading(false);
      return;
    }
    const destination = destinationForRole(body.profile.role, next);
    router.replace(destination); router.refresh();
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

export function RegistrationForm({ next }: { next?: string }) {
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); setMessage("");
    const form = new FormData(event.currentTarget);
    const payload = {
      name: String(form.get("name")), email: String(form.get("email")), password: String(form.get("password")), phone: String(form.get("phone")), next,
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
      <label className="grid gap-2 text-sm font-bold">Senha<input className="field" name="password" type="password" required minLength={10} autoComplete="new-password" /><span className="muted text-xs font-normal">Mínimo de 10 caracteres.</span></label>
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
    await client.auth.resetPasswordForEmail(String(form.get("email")), { redirectTo: `${location.origin}/auth/callback?next=${encodeURIComponent("/auth/atualizar-senha")}` });
    setMessage("Se o e-mail existir, enviaremos as instruções de recuperação.");
  }
  return <form onSubmit={submit} className="mt-7 grid gap-4"><label className="grid gap-2 text-sm font-bold">E-mail<input className="field" name="email" type="email" required /></label>{message && <p className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-900">{message}</p>}<button className="button-primary w-full">Enviar instruções</button></form>;
}

export function UpdatePasswordForm() {
  const [message, setMessage] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); setMessage("");
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password"));
    const confirmation = String(form.get("confirmation"));
    if (password.length < 10 || password !== confirmation) {
      setMessage(password.length < 10 ? "A senha deve ter pelo menos 10 caracteres." : "As senhas não coincidem.");
      setLoading(false); return;
    }
    const client = createClient();
    if (!client) { setMessage("O acesso está temporariamente indisponível."); setLoading(false); return; }
    const { error } = await client.auth.updateUser({ password });
    if (error) setMessage("O link expirou ou não foi possível atualizar a senha.");
    else { setDone(true); setMessage("Senha atualizada. Você já pode entrar."); }
    setLoading(false);
  }
  return <form onSubmit={submit} className="mt-7 grid gap-4"><label className="grid gap-2 text-sm font-bold">Nova senha<input className="field" name="password" type="password" minLength={10} required autoComplete="new-password" /></label><label className="grid gap-2 text-sm font-bold">Confirmar senha<input className="field" name="confirmation" type="password" minLength={10} required autoComplete="new-password" /></label>{message && <p role="status" className={`rounded-xl p-3 text-sm ${done ? "bg-emerald-50 text-emerald-900" : "bg-amber-50 text-amber-900"}`}>{message}</p>}<button className="button-primary w-full" disabled={loading || done}>{loading ? "Atualizando…" : done ? "Senha atualizada" : "Atualizar senha"}</button></form>;
}
