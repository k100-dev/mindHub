"use client";

import { useEffect, useState, type FormEvent } from "react";
type Block = { id: string; starts_at: string; ends_at: string; administrative_reason: string };
export function ScheduleBlockEditor() {
  const [busy, setBusy] = useState(false);
  const [blocks, setBlocks] = useState<Block[]>([]); const [message, setMessage] = useState("");
  useEffect(() => { fetch("/api/schedule-blocks", { cache: "no-store" }).then(async (response) => ({ response, body: await response.json() })).then(({ response, body }) => response.ok ? setBlocks(body.blocks) : setMessage(body.error?.message ?? "Não foi possível carregar.")).catch(() => setMessage("Não foi possível conectar. Recarregue para tentar novamente.")); }, []);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const element = event.currentTarget; const form = new FormData(element);
    const date = String(form.get("date")); const startsAt = `${date}T${String(form.get("start"))}:00-03:00`; const endsAt = `${date}T${String(form.get("end"))}:00-03:00`;
    if (startsAt >= endsAt) { setMessage("O fim do bloqueio deve ser depois do início."); return; }
    setMessage(""); setBusy(true);
    try {
      const response = await fetch("/api/schedule-blocks", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ startsAt, endsAt, reason: form.get("reason") }) });
      const body = await response.json(); if (!response.ok) throw new Error(body.error?.message ?? "Não foi possível criar.");
      setBlocks(current => [...current, body.block].sort((a,b) => a.starts_at.localeCompare(b.starts_at)));
      setMessage("Período bloqueado."); element.reset();
    } catch (error) { setMessage(error instanceof Error ? error.message : "Não foi possível conectar. Tente novamente."); }
    finally { setBusy(false); }
  }
  async function remove(id: string) {
    setBusy(true); setMessage("");
    try {
      const response = await fetch(`/api/schedule-blocks?id=${id}`, { method: "DELETE" }); const body = await response.json();
      if (!response.ok) throw new Error(body.error?.message ?? "Não foi possível remover.");
      setBlocks(current => current.filter(block => block.id !== id)); setMessage("Bloqueio removido.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Não foi possível conectar. Tente novamente."); }
    finally { setBusy(false); }
  }
  return <div className="card p-5"><h2 className="font-extrabold">Bloquear período</h2><form onSubmit={submit}><label className="mt-4 grid gap-2 text-sm font-bold">Data<input required name="date" type="date" className="field" /></label><div className="mt-3 grid grid-cols-2 gap-3"><label className="grid gap-2 text-sm font-bold">Início<input required name="start" type="time" className="field" /></label><label className="grid gap-2 text-sm font-bold">Fim<input required name="end" type="time" className="field" /></label></div><label className="mt-3 grid gap-2 text-sm font-bold">Motivo administrativo<input required minLength={3} maxLength={300} name="reason" className="field" /></label><button disabled={busy} className="button-secondary mt-4 w-full">{busy ? "Aguarde…" : "Adicionar bloqueio"}</button></form>{message && <p role="status" className="mt-3 rounded-xl bg-sky-50 p-3 text-sm text-sky-900">{message}</p>}{blocks.length > 0 && <div className="mt-4 grid gap-2"><p className="text-xs font-extrabold uppercase tracking-wide text-[#66758d]">Bloqueios ativos</p>{blocks.map((block) => <div key={block.id} className="rounded-xl border border-[#e5ebee] p-3 text-sm"><div className="flex justify-between gap-3"><span><strong>{new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short", timeZone: "America/Sao_Paulo" }).format(new Date(block.starts_at))}</strong></span><button type="button" disabled={busy} onClick={() => remove(block.id)} className="font-bold text-red-700">Remover</button></div><p className="muted mt-1">{block.administrative_reason}</p></div>)}</div>}</div>;
}
