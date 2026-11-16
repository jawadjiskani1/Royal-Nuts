import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { supabaseUrl, supabasePublicKey, hasSupabaseConfig } from "./config";

export async function getSupabaseSessionClient() {
  if (!hasSupabaseConfig) throw new Error("Supabase is not configured.");
  const cookieStore = await cookies();
  return createServerClient(supabaseUrl, supabasePublicKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll(values) {
        // Server Components cannot set cookies. The proxy handles refreshes.
        try {
          values.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch { /* Cookies are writable in actions and route handlers. */ }
      }
    }
  });
}
