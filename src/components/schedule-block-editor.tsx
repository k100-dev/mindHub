"use client";

import { useEffect, useState, type FormEvent } from "react";

type ScheduleBlock = { id: string; date: string; start: string; end: string; reason: string };
const STORAGE_KEY = "mindhub.demo.schedule-blocks.v1";

function loadBlocks(): ScheduleBlock[] {
  try { return JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]") as ScheduleBlock[]; }
  catch { return []; }
}
export function ScheduleBlockEditor() {
  const [blocks, setBlocks] = useState<ScheduleBlock[]>([]);
  const [message, setMessage] = useState("");
  useEffect(() => { queueMicrotask(() => setBlocks(loadBlocks())); }, []);

  function persist(next: ScheduleBlock[]) {
    setBlocks(next); window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const date = String(form.get("date")); const start = String(form.get("start")); const end = String(form.get("end"));
    if (end <= start) return setMessage("O horário final deve ser posterior ao inicial.");
    persist([...blocks, { id: `block-${Date.now()}`, date, start, end, reason: String(form.get("reason")) }]);
    setMessage("Período bloqueado na demonstração."); event.currentTarget.reset();
  }

  return <div className="card p-5"><h2 className="font-extrabold">Bloquear período</h2><form onSubmit={submit}><label className="mt-4 grid gap-2 text-sm font-bold">Data<input required name="date" type="date" className="field" /></label><div className="mt-3 grid grid-cols-2 gap-3"><label className="grid gap-2 text-sm font-bold">Início<input required name="start" type="time" className="field" /></label><label className="grid gap-2 text-sm font-bold">Fim<input required name="end" type="time" className="field" /></label></div><label className="mt-3 grid gap-2 text-sm font-bold">Motivo administrativo<input required name="reason" className="field" placeholder="Ex.: evento pessoal" /></label><button className="button-secondary mt-4 w-full">Adicionar bloqueio</button></form>{message && <p role="status" className="mt-3 rounded-xl bg-sky-50 p-3 text-sm font-bold text-sky-900">{message}</p>}{blocks.length > 0 && <div className="mt-4 grid gap-2"><p className="text-xs font-extrabold uppercase tracking-wide text-[#66758d]">Bloqueios registrados</p>{blocks.map((block) => <div key={block.id} className="rounded-xl border border-[#e5ebee] p-3 text-sm"><div className="flex justify-between gap-3"><span><strong>{block.date}</strong> · {block.start}–{block.end}</span><button type="button" onClick={() => persist(blocks.filter((item) => item.id !== block.id))} className="font-bold text-red-700">Remover</button></div><p className="muted mt-1">{block.reason}</p></div>)}</div>}</div>;
}
