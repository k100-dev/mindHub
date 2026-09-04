"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { StatusBadge } from "@/components/status-badge";
import { initialDemoWorkspace, loadDemoWorkspace, saveDemoWorkspace, type DemoWorkspace } from "@/lib/demo-workspace";

export function PatientsWorkspace() {
  const [workspace, setWorkspace] = useState<DemoWorkspace>(initialDemoWorkspace);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("TODOS");

  useEffect(() => {
    queueMicrotask(() => setWorkspace(loadDemoWorkspace()));
  }, []);

  const patients = useMemo(() => workspace.patients.filter((patient) => {
    const matchesQuery = [patient.name, patient.email, patient.phone].join(" ").toLowerCase().includes(query.toLowerCase());
    return matchesQuery && (status === "TODOS" || patient.status === status);
  }), [query, status, workspace.patients]);

  function toggleStatus(id: string) {
    const next = {
      ...workspace,
      patients: workspace.patients.map((patient) => patient.id === id
        ? { ...patient, status: patient.status === "ATIVO" ? "INATIVO" : "ATIVO" }
        : patient),
    } as DemoWorkspace;
    setWorkspace(next);
    saveDemoWorkspace(next);
  }

  return <section className="card overflow-hidden">
    <div className="flex flex-col gap-3 border-b border-[#e5ebee] p-4 sm:flex-row">
      <label className="relative flex-1"><Search size={18} className="absolute left-3 top-3.5 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} className="field !pl-10" placeholder="Buscar por nome, telefone ou e-mail" aria-label="Buscar pacientes" /></label>
      <select value={status} onChange={(event) => setStatus(event.target.value)} className="field sm:w-44" aria-label="Filtrar status"><option value="TODOS">Todos</option><option value="ATIVO">Ativos</option><option value="INATIVO">Inativos</option></select>
    </div>
    <p className="border-b border-[#e9eef0] bg-emerald-50 px-4 py-3 text-xs font-bold text-emerald-900">Demonstração funcional: alterações ficam salvas neste navegador.</p>
    <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-[#f6f8f9] text-xs uppercase tracking-wide text-[#6b7a8e]"><tr><th className="p-4">Paciente</th><th className="p-4">Contato</th><th className="p-4">Consultas</th><th className="p-4">Status</th><th className="p-4 text-right">Ações</th></tr></thead><tbody className="divide-y divide-[#e9eef0]">
      {patients.map((patient) => <tr key={patient.id} className="hover:bg-[#f9fbfb]"><td className="p-4 font-extrabold">{patient.name}</td><td className="p-4"><p>{patient.email}</p><p className="muted mt-1">{patient.phone}</p></td><td className="p-4">{patient.appointments}</td><td className="p-4"><StatusBadge status={patient.status} /></td><td className="p-4 text-right"><div className="flex justify-end gap-3"><button type="button" onClick={() => toggleStatus(patient.id)} className="font-extrabold text-[#516378]">{patient.status === "ATIVO" ? "Inativar" : "Reativar"}</button><Link href={`/app/pacientes/${patient.id}`} className="font-extrabold text-[#117f72]">Ver perfil</Link></div></td></tr>)}
      {!patients.length && <tr><td colSpan={5} className="p-8 text-center text-[#66758d]">Nenhum paciente encontrado.</td></tr>}
    </tbody></table></div>
  </section>;
}
