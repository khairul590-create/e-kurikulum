import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (import.meta.env.DEV && (!url || !anon)) {
  console.error(
    "VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY tiada. Salin .env.local.example -> .env.local",
  );
}

export const supabase = createClient(url ?? "", anon ?? "", {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
