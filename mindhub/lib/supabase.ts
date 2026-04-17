import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Configure NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY (ou NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) no arquivo .env.",
  );
}

export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

export const createSupabaseServerClient = () => {
  return createClient(supabaseUrl, supabaseAnonKey);
};