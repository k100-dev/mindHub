"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";

export function SignOutButton({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  async function signOut() {
    await createClient()?.auth.signOut();
    router.replace("/"); router.refresh();
  }
  return <button type="button" onClick={signOut} className={compact ? "grid size-10 place-items-center rounded-xl text-current hover:bg-black/5" : "button-secondary"} aria-label="Sair da conta"><LogOut size={18} />{!compact && "Sair"}</button>;
}
