import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { env, getSupabasePublicKey, hasSupabaseConfig } from "@/lib/env";

export async function createClient() {
  if (!hasSupabaseConfig()) return null;
  const cookieStore = await cookies();

  return createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL!,
    getSupabasePublicKey()!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (items) => {
          try {
            items.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Server Components não podem sempre persistir cookies; o proxy renova a sessão.
          }
        },
      },
    },
  );
}

export async function getCurrentUser() {
  const supabase = await createClient();
  if (!supabase) return null;
  const { data, error } = await supabase.auth.getUser();
  if (error) return null;
  return data.user;
}
