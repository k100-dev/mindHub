"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Check, Copy, LoaderCircle, Save, UserRound } from "lucide-react";
type Me = { email: string; profile: { name: string; phone: string; timezone: string }; roleProfile: { professional_name: string; crp: string; bio: string; public_slug: string; session_duration_minutes: number; deposit_amount: number; session_price: number; payment_instructions: string } };

function ProfileForm({ professional = false }: { professional?: boolean }) {
  const router = useRouter();
  const [me, setMe] = useState<Me | null>(null);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [copied, setCopied] = useState(false);
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    const abort = new AbortController();
    fetch("/api/me", { cache: "no-store", signal: abort.signal }).then(async response => {
      const body = await response.json();
      if (!response.ok) throw new Error(body.error?.message ?? "Não foi possível carregar seus dados.");
      setMe(body);
    }).catch(error => { if (!abort.signal.aborted) setMessage(error.message); });
    return () => abort.abort();
  }, [revision]);
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const values = { name: form.get("name"), phone: form.get("phone"), ...(professional ? {
      professionalName: form.get("professionalName"), bio: form.get("bio"), sessionDurationMinutes: Number(form.get("duration")),
      depositAmount: Number(form.get("deposit")), sessionPrice: Number(form.get("price")), paymentInstructions: form.get("paymentInstructions"),
    } : {}) };
    if (professional && Number(form.get("deposit")) > Number(form.get("price"))) {
      setSuccess(false); setMessage("O sinal não pode ser maior que o preço da sessão."); return;
    }
    setSaving(true); setMessage(""); setSuccess(false);
    try {
      const response = await fetch("/api/me", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(values) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error?.message ?? "Não foi possível salvar.");
      setSuccess(true); setMessage("Perfil atualizado."); router.refresh();
    } catch (error) { setMessage(error instanceof Error ? error.message : "Confira sua conexão e tente novamente."); }
    finally { setSaving(false); }
  }
  async function copyLink() {
    try { await navigator.clipboard.writeText(`${location.origin}/p/${me?.roleProfile.public_slug}`); setCopied(true); }
    catch { setSuccess(false); setMessage("Não foi possível copiar. Selecione o endereço da agenda abaixo."); }
  }
  if (!me) return <div className="card max-w-4xl p-8" role="status">{message ? <><p>{message}</p><button className="button-secondary mt-4" onClick={() => { setMessage(""); setRevision(n => n + 1); }}>Tentar novamente</button></> : <span className="flex items-center gap-3 text-[#7b8b73]"><LoaderCircle size={18} className="animate-spin"/> Carregando seu perfil…</span>}</div>;
  return <form onSubmit={save} className="grid max-w-4xl gap-6">
    <section className="card p-5 sm:p-7"><div className="mb-6 flex items-center gap-3"><span className="grid size-11 place-items-center rounded-2xl bg-[#edf3e5] text-[#688653]"><UserRound size={22}/></span><div><h2 className="font-semibold">{professional ? "Seus dados" : "Sobre você"}</h2><p className="muted mt-1 text-sm">Mantenha seu contato atualizado.</p></div></div><div className="grid gap-5 sm:grid-cols-2">
      <label className="grid gap-2 text-sm font-semibold">{professional ? "Nome de acesso" : "Nome"}<input className="field" name="name" defaultValue={me.profile.name} required minLength={3} maxLength={120} autoComplete="name"/></label>
      <label className="grid gap-2 text-sm font-semibold">Telefone<input className="field" name="phone" type="tel" defaultValue={me.profile.phone} required autoComplete="tel" placeholder="(43) 99999-9999"/></label>
      <label className="grid gap-2 text-sm font-semibold sm:col-span-2">E-mail de acesso<input className="field !bg-[#f6f8f2]" type="email" value={me.email} readOnly/><span className="muted text-xs font-normal">Este é o e-mail que você usa para entrar.</span></label>
    </div></section>
    {professional && <><section className="card p-5 sm:p-7"><h2 className="font-semibold">Seu atendimento</h2><p className="muted mb-6 mt-2 text-sm leading-6">Defina a duração e os valores para novos agendamentos. Encontros já solicitados mantêm as condições anteriores.</p><div className="grid gap-5 sm:grid-cols-3"><label className="grid gap-2 text-sm font-semibold">Duração (minutos)<input className="field" name="duration" type="number" min="20" max="240" required defaultValue={me.roleProfile.session_duration_minutes}/></label><label className="grid gap-2 text-sm font-semibold">Preço da sessão (R$)<input className="field" name="price" type="number" min="0.01" step="0.01" required defaultValue={me.roleProfile.session_price}/></label><label className="grid gap-2 text-sm font-semibold">Valor do sinal (R$)<input className="field" name="deposit" type="number" min="0" step="0.01" required defaultValue={me.roleProfile.deposit_amount}/></label></div><label className="mt-6 grid gap-2 text-sm font-semibold">Instruções de pagamento<textarea className="field min-h-28 py-3" name="paymentInstructions" maxLength={1500} defaultValue={me.roleProfile.payment_instructions} placeholder="Informe como pagar o sinal, a chave Pix e o nome do beneficiário."/><span className="muted text-xs font-normal leading-6">Aparecem nos detalhes do agendamento para orientar o paciente. Você confere o pagamento e registra o recebimento no atendimento.</span></label></section>
    <section className="card p-5 sm:p-7"><h2 className="mb-6 font-semibold">Sua apresentação</h2><div className="grid gap-5 sm:grid-cols-2"><label className="grid gap-2 text-sm font-semibold">Nome profissional<input className="field" name="professionalName" defaultValue={me.roleProfile.professional_name} required minLength={3}/></label><label className="grid gap-2 text-sm font-semibold">CRP cadastrado<input className="field !bg-[#f6f8f2]" value={me.roleProfile.crp || "Não informado"} readOnly/></label><label className="grid gap-2 text-sm font-semibold sm:col-span-2">Apresentação<textarea className="field min-h-28 py-3" name="bio" defaultValue={me.roleProfile.bio} maxLength={1200}/></label><div className="sm:col-span-2"><label className="grid gap-2 text-sm font-semibold" htmlFor="agenda-address">Endereço da agenda</label><div className="mt-2 flex flex-wrap gap-2"><input id="agenda-address" className="field !bg-[#f6f8f2] sm:flex-1" value={`/p/${me.roleProfile.public_slug}`} readOnly/><button type="button" className="button-secondary" onClick={copyLink}>{copied?<Check size={17}/>:<Copy size={17}/>} {copied?"Copiado":"Copiar link"}</button></div></div></div></section></>}
    {message && <p role="status" className={`rounded-xl p-4 text-sm ${success ? "bg-emerald-50 text-emerald-900" : "bg-amber-50 text-amber-900"}`}>{message}</p>}
    <button className="button-primary justify-self-start" disabled={saving}>{saving?<LoaderCircle className="animate-spin" size={17}/>:<Save size={17}/>} {saving?"Salvando…":"Salvar perfil"}</button>
  </form>;
}
export function ProfessionalProfileForm() { return <ProfileForm professional/>; }
export function PatientProfileForm() { return <ProfileForm/>; }
