"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { AppointmentStatus } from "@/lib/domain/appointments";

const actions: Partial<Record<AppointmentStatus, { status: AppointmentStatus; label: string }[]>> = {
  RESERVADO_TEMPORARIAMENTE: [{ status: "AGUARDANDO_SINAL", label: "Aguardar sinal" }, { status: "CANCELADO", label: "Cancelar" }],
  AGUARDANDO_SINAL: [{ status: "CONFIRMADO", label: "Confirmar" }, { status: "CANCELADO", label: "Cancelar" }],
  CONFIRMADO: [{ status: "REALIZADO", label: "Marcar realizado" }, { status: "NO_SHOW", label: "Registrar ausência" }, { status: "CANCELADO", label: "Cancelar" }, { status: "REMARCADO", label: "Remarcar" }],
};

export function AppointmentActions({ id, status }: { id: string; status: AppointmentStatus }) {
  const [message, setMessage] = useState(""); const [loading, setLoading] = useState(false); const router = useRouter();
  async function update(next: AppointmentStatus) { setLoading(true); setMessage(""); const response = await fetch(`/api/appointments/${id}/status`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: next, reason: `Atualização administrativa para ${next}` }) }); const body = await response.json(); setMessage(response.ok ? "Situação atualizada." : body.error?.message ?? "Não foi possível atualizar."); setLoading(false); if (response.ok) router.refresh(); }
  const available = actions[status] ?? [];
  if (!available.length) return <p className="muted text-sm">Este agendamento não possui ações pendentes.</p>;
  return <div><div className="flex flex-wrap gap-3">{available.map((action) => <button type="button" disabled={loading} onClick={() => update(action.status)} key={action.status} className="button-secondary">{action.label}</button>)}</div>{message && <p role="status" className="mt-3 rounded-xl bg-sky-50 p-3 text-sm text-sky-900">{message}</p>}</div>;
}
