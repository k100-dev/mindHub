"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { PasswordField } from "@/components/password-field";
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
    try {
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
    } catch { setMessage("Não foi possível conectar. Confira sua conexão e tente novamente."); }
    finally { setLoading(false); }
  }

  return (
    <form onSubmit={submit} className="mt-7 grid gap-4">
      <label className="grid gap-2 text-sm font-bold">E-mail<input className="field" name="email" type="email" autoComplete="email" required placeholder="seu@email.com" /></label>
      <PasswordField autoComplete="current-password" minLength={1} />
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
      name: String(form.get("name")), email: String(form.get("email")), password: String(form.get("password")), phone: String(form.get("phone")), confirmation: String(form.get("confirmation")), next,
    };
    if (payload.password !== payload.confirmation) { setMessage("As senhas não coincidem. Confira os dois campos."); setLoading(false); return; }
    try {
      const response = await fetch("/api/auth/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error?.message ?? "Não foi possível criar a conta.");
      setSuccess(true); setMessage(body.requiresEmailConfirmation ? "Conta criada. Confira seu e-mail para confirmar o acesso." : "Conta criada. Você já pode entrar com seu e-mail e senha.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Não foi possível criar a conta."); }
    finally { setLoading(false); }
  }

  if (success) return <div className="mt-7 rounded-2xl bg-emerald-50 p-5 text-emerald-900"><p className="font-extrabold">Cadastro recebido</p><p className="mt-2 text-sm leading-6">{message}</p></div>;

  return (
    <form onSubmit={submit} className="mt-7 grid gap-4">
      <label className="grid gap-2 text-sm font-bold">Nome completo<input className="field" name="name" required minLength={3} autoComplete="name" /></label>
      <div className="grid gap-4 sm:grid-cols-2"><label className="grid gap-2 text-sm font-bold">E-mail<input className="field" name="email" type="email" required autoComplete="email" /></label><label className="grid gap-2 text-sm font-bold">Telefone<input className="field" name="phone" required type="tel" placeholder="(43) 99999-9999" autoComplete="tel" /></label></div>
      <PasswordField /><p className="muted -mt-2 text-xs">Use entre 10 e 72 caracteres.</p><PasswordField name="confirmation" label="Confirmar senha" />
      {message && <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-rose-900">{message}</p>}
      <button className="button-primary mt-1 w-full" disabled={loading}>{loading && <LoaderCircle size={18} className="animate-spin" />}{loading ? "Criando conta…" : "Criar conta"}</button>
    </form>
  );
}

export function RecoveryForm() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = new FormData(event.currentTarget); const client = createClient();
    if (!client) { setMessage("O acesso está temporariamente indisponível. Tente novamente em instantes."); return; }
    setLoading(true); setMessage("");
    try {
    const { error } = await client.auth.resetPasswordForEmail(String(form.get("email")), { redirectTo: `${location.origin}/auth/callback?next=${encodeURIComponent("/auth/atualizar-senha")}` });
    if (error) throw error;
    setMessage("Se o e-mail existir, enviaremos as instruções de recuperação.");
    } catch { setMessage("Não foi possível enviar agora. Tente novamente em instantes."); }
    finally { setLoading(false); }
  }
  return <form onSubmit={submit} className="mt-7 grid gap-4"><label className="grid gap-2 text-sm font-bold">E-mail<input className="field" name="email" type="email" required /></label>{message && <p className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-900">{message}</p>}<button className="button-primary w-full" disabled={loading}>{loading ? "Enviando…" : "Enviar instruções"}</button></form>;
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
    try {
    // Administrative invitations use an implicit token pair; recovery uses PKCE.
    const tokens = new URLSearchParams(location.hash.slice(1));
    const accessToken = tokens.get("access_token"), refreshToken = tokens.get("refresh_token");
    if (accessToken && refreshToken) {
      const { error: sessionError } = await client.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
      history.replaceState(null, "", location.pathname + location.search);
      if (sessionError) { setMessage("O link expirou. Solicite um novo acesso."); return; }
    }
    const { error } = await client.auth.updateUser({ password });
    if (error) setMessage("O link expirou ou não foi possível atualizar a senha.");
    else { setDone(true); setMessage("Senha atualizada. Você já pode entrar."); }
    } catch { setMessage("Não foi possível conectar. Tente novamente."); }
    finally { setLoading(false); }
  }
  return <form onSubmit={submit} className="mt-7 grid gap-4"><PasswordField label="Nova senha" /><PasswordField name="confirmation" label="Confirmar senha" />{message && <p role="status" className={`rounded-xl p-3 text-sm ${done ? "bg-emerald-50 text-emerald-900" : "bg-amber-50 text-amber-900"}`}>{message}</p>}<button className="button-primary w-full" disabled={loading || done}>{loading ? "Atualizando…" : done ? "Senha atualizada" : "Atualizar senha"}</button></form>;
}
