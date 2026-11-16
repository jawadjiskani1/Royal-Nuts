import "server-only";

import { createClient } from "@supabase/supabase-js";

import { supabaseUrl as url, supabasePublicKey as anonKey } from "./config";
export { hasSupabaseConfig } from "./config";

export function getSupabaseServerClient() {
  if (!url || !anonKey) throw new Error("Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY).");
  return createClient(url, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
}
