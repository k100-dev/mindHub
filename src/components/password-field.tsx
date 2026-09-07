"use client";

import { useId, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export function PasswordField({ name = "password", label = "Senha", autoComplete = "new-password", minLength = 10 }: { name?: string; label?: string; autoComplete?: string; minLength?: number }) {
  const id = useId();
  const [visible, setVisible] = useState(false);
  return <div className="grid gap-2 text-sm font-bold"><label htmlFor={id}>{label}</label><div className="relative"><input id={id} className="field !pr-12" name={name} type={visible ? "text" : "password"} required minLength={minLength} maxLength={72} autoComplete={autoComplete} /><button type="button" className="absolute inset-y-0 right-0 grid w-12 place-items-center rounded-r-xl text-[#54756f]" aria-label={`${visible ? "Ocultar" : "Mostrar"} ${label.toLowerCase()}`} aria-pressed={visible} onClick={() => setVisible(!visible)}>{visible ? <EyeOff size={20} /> : <Eye size={20} />}</button></div></div>;
}
