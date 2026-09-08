"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type FormEvent, type ChangeEvent } from "react";
import { Camera, Check, LoaderCircle, Plus, Save, Trash2, UserRound, X } from "lucide-react";
import { PatientProfileForm } from "@/components/profile-settings";

const suggestions = ["Leitura", "Música", "Cinema", "Caminhadas", "Culinária", "Viagens", "Arte", "Esportes"];

async function preparePhoto(file: File): Promise<Blob> {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 10 * 1024 * 1024) {
    throw new Error("Escolha uma foto JPG, PNG ou WebP de até 10 MB.");
  }
  const bitmap = await createImageBitmap(file);
  try {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 512;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Não foi possível preparar esta foto.");
    const side = Math.min(bitmap.width, bitmap.height);
    context.drawImage(bitmap, (bitmap.width - side) / 2, (bitmap.height - side) / 2, side, side, 0, 0, 512, 512);
    return await new Promise<Blob>((resolve, reject) => canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error("Não foi possível preparar esta foto.")), "image/webp", 0.85));
  } finally { bitmap.close(); }
}

export function PatientPersonalProfile() {
  const [tab, setTab] = useState("personal");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [hobbies, setHobbies] = useState<string[]>([]);
  const [hobby, setHobby] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [revision, setRevision] = useState(0);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [saving, setSaving] = useState(false);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [pendingPhoto, setPendingPhoto] = useState<Blob | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const abort = new AbortController();
    fetch("/api/me", { cache: "no-store", signal: abort.signal }).then(async response => {
      const body = await response.json();
      if (!response.ok || !body.profile || !body.roleProfile) throw new Error("Não foi possível carregar seu perfil.");
      setName(body.profile.name); setDescription(body.roleProfile.description ?? ""); setHobbies(body.roleProfile.hobbies ?? []); setLoaded(true);
    }).catch(error => { if (!abort.signal.aborted) setMessage(error.message); });
    fetch("/api/me/avatar", { cache: "no-store", signal: abort.signal }).then(response => { if (response.ok) setPhoto(`/api/me/avatar?v=${Date.now()}`); }).catch(() => {});
    return () => abort.abort();
  }, [revision]);
  useEffect(() => { return () => { if (preview) URL.revokeObjectURL(preview); }; }, [preview]);

  function addHobby(value: string) {
    const clean = value.trim();
    if (!clean) return;
    if (clean.length > 40 || hobbies.length >= 12) { setSuccess(false); setMessage("Adicione até 12 hobbies, com até 40 caracteres cada."); return; }
    if (!hobbies.some(item => item.toLocaleLowerCase() === clean.toLocaleLowerCase())) setHobbies(current => [...current, clean]);
    setHobby(""); setMessage("");
  }

  async function choosePhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]; event.target.value = "";
    if (!file) return;
    setPhotoBusy(true); setMessage(""); setSuccess(false);
    try { const blob = await preparePhoto(file); setPendingPhoto(blob); setPreview(URL.createObjectURL(blob)); }
    catch (error) { setMessage(error instanceof Error ? error.message : "Não foi possível abrir a foto."); }
    finally { setPhotoBusy(false); }
  }

  async function updatePhoto(remove = false) {
    setPhotoBusy(true); setMessage(""); setSuccess(false);
    try {
      const form = new FormData(); if (pendingPhoto) form.set("photo", pendingPhoto, "avatar.webp");
      const response = await fetch("/api/me/avatar", { method: remove ? "DELETE" : "POST", ...(remove ? {} : { body: form }) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error?.message ?? "Não foi possível atualizar sua foto.");
      setPhoto(remove ? null : `/api/me/avatar?v=${Date.now()}`); setPendingPhoto(null); setPreview(null);
      setSuccess(true); setMessage(remove ? "Foto removida." : "Foto atualizada.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Confira sua conexão e tente novamente."); }
    finally { setPhotoBusy(false); }
  }

  async function save(event: FormEvent) {
    event.preventDefault(); setSaving(true); setMessage(""); setSuccess(false);
    const remaining = hobby.trim();
    const values = remaining && !hobbies.some(item => item.toLowerCase() === remaining.toLowerCase()) ? [...hobbies, remaining] : hobbies;
    try {
      const response = await fetch("/api/me/personal", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ description, hobbies: values }) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error?.message ?? "Não foi possível salvar sua apresentação.");
      setDescription(body.description); setHobbies(body.hobbies); setHobby(""); setSuccess(true); setMessage("Apresentação salva.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Confira sua conexão e tente novamente."); }
    finally { setSaving(false); }
  }

  return <div className="max-w-4xl">
    <nav className="filter-pills mb-6" aria-label="Seções do perfil">{[{ id: "personal", label: "Foto e apresentação" }, { id: "contact", label: "Dados de contato" }].map(item => <button type="button" key={item.id} aria-pressed={tab === item.id} onClick={() => setTab(item.id)}>{item.label}</button>)}</nav>
    <div hidden={tab !== "contact"}><PatientProfileForm /></div>
    <div hidden={tab !== "personal"}>
      {!loaded ? <section className="card p-7" role="status">{message || "Carregando seu perfil…"}{message && <button type="button" className="button-secondary mt-4" onClick={() => { setMessage(""); setRevision(value => value + 1); }}>Tentar novamente</button>}</section> : <>
        <section className="card mb-6 overflow-hidden"><div className="profile-banner px-6 py-5"><p className="eyebrow">Meu perfil</p><h2 className="mt-2 font-serif text-2xl text-[#294837]">{name}</h2><p className="muted mt-2 text-sm">Seu espaço, com a sua identidade.</p></div><div className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center">
          <div className="relative grid size-28 shrink-0 place-items-center overflow-hidden rounded-full border-4 border-white bg-[#e8f0e3] text-[#5c7b50] shadow-sm">{preview || photo ? <Image src={preview || photo!} alt="Sua foto de perfil" fill sizes="112px" unoptimized className="object-cover" onError={() => { if (!preview) setPhoto(null); }}/> : <UserRound size={44} strokeWidth={1.4}/>}</div>
          <div><h3 className="font-semibold">Foto de perfil</h3><p className="muted mb-4 mt-2 text-sm">JPG, PNG ou WebP, até 10 MB. A imagem será centralizada em um recorte quadrado.</p><input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp" aria-label="Escolher foto de perfil" className="sr-only" onChange={choosePhoto} disabled={photoBusy}/><div className="flex flex-wrap gap-2"><button type="button" className="button-secondary" disabled={photoBusy} onClick={() => fileInput.current?.click()}>{photoBusy ? <LoaderCircle size={17} className="animate-spin"/> : <Camera size={17}/>} {photo ? "Trocar foto" : "Escolher foto"}</button>{photo && !preview && <button type="button" className="button-secondary" disabled={photoBusy} onClick={() => updatePhoto(true)}><Trash2 size={16}/> Remover foto</button>}{preview && <><button type="button" className="button-primary" disabled={photoBusy} onClick={() => updatePhoto()}><Check size={17}/> Usar esta foto</button><button type="button" className="button-secondary" disabled={photoBusy} onClick={() => { setPreview(null); setPendingPhoto(null); }}>Cancelar</button></>}</div></div>
        </div></section>
        <form onSubmit={save} className="card grid gap-6 p-6 sm:p-7"><div><h2 className="font-semibold">Sua apresentação</h2><p className="muted mt-2 text-sm leading-6">Foto, descrição e hobbies são opcionais e ficam no seu perfil privado.</p></div>
          <div className="grid gap-2 text-sm font-semibold"><label htmlFor="profile-description">Sobre você</label><textarea id="profile-description" className="field min-h-32 py-3" value={description} onChange={event => setDescription(event.target.value)} maxLength={600} placeholder="Conte um pouco sobre você e o que gosta de fazer."/><span className="muted text-right text-xs font-normal">{description.length}/600</span></div>
          <div><label htmlFor="profile-hobby" className="text-sm font-semibold">Hobbies e interesses</label><p className="muted mb-3 mt-2 text-sm">Escolha sugestões ou adicione os seus. Até 12 interesses.</p><div className="flex flex-wrap gap-2">{hobbies.map(item => <button key={item} type="button" className="interest-chip is-selected" onClick={() => setHobbies(current => current.filter(value => value !== item))} aria-label={`Remover ${item}`}>{item}<X size={14}/></button>)}</div><div className="my-3 flex gap-2"><input id="profile-hobby" className="field" value={hobby} onChange={event => setHobby(event.target.value)} maxLength={40} placeholder="Ex.: Fotografia" onKeyDown={event => { if (event.key === "Enter") { event.preventDefault(); addHobby(hobby); } }}/><button type="button" className="button-secondary shrink-0" aria-label="Adicionar hobby" disabled={!hobby.trim() || hobbies.length >= 12} onClick={() => addHobby(hobby)}><Plus size={18}/></button></div><div className="flex flex-wrap gap-2">{suggestions.filter(item => !hobbies.some(value => value.toLowerCase() === item.toLowerCase())).map(item => <button key={item} type="button" className="interest-chip" disabled={hobbies.length >= 12} onClick={() => addHobby(item)}><Plus size={14}/>{item}</button>)}</div></div>
          <button type="submit" className="button-primary justify-self-start" disabled={saving}>{saving ? <LoaderCircle size={17} className="animate-spin"/> : <Save size={17}/>} {saving ? "Salvando…" : "Salvar apresentação"}</button>
        </form>
        {message && <p role={success ? "status" : "alert"} className={`mt-4 rounded-xl p-4 text-sm ${success ? "bg-emerald-50 text-emerald-900" : "bg-amber-50 text-amber-900"}`}>{message}</p>}
      </>}
    </div>
  </div>;
}
