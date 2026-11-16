// Keep public configuration shared between the browser and server clients.
export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
export const supabasePublicKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || "";

export const hasSupabaseConfig = Boolean(supabaseUrl && supabasePublicKey);
