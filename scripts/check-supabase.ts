import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
config({ path: ".env.local" });

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !key) throw new Error("Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY) to .env.local.");
  const parsedUrl = new URL(url);
  if (!/^https?:$/.test(parsedUrl.protocol) || parsedUrl.pathname !== "/" || parsedUrl.search || parsedUrl.hash) {
    throw new Error("Use the base Supabase project URL without /rest/v1, query parameters or fragments.");
  }
  let secretKey = key.startsWith("sb_secret_");
  if (key.startsWith("eyJ")) {
    try { secretKey ||= JSON.parse(Buffer.from(key.split(".")[1], "base64url").toString()).role === "service_role"; } catch { /* The server validates malformed keys. */ }
  }
  if (secretKey) throw new Error("Use a public publishable/anon key, never a secret or service-role key in NEXT_PUBLIC_ variables.");
  const timedFetch: typeof fetch = (input, init) => fetch(input, { ...init, signal: AbortSignal.timeout(15000) });
  const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false }, global: { fetch: timedFetch } });
  const { count, error } = await supabase.from("products").select("id", { count: "exact", head: true }).eq("active", true);
  if (error) throw new Error(`Database check failed (${error.code || "network"}). Verify the base project URL, public key and schema.`);
  console.log(`Database connected. ${count ?? 0} active products visible to the storefront.`);
  if (!count) console.log("Add real products in Table Editor, or temporarily configure SUPABASE_SERVICE_ROLE_KEY and run npm run seed for placeholders.");
  const authResponse = await timedFetch(new URL("/auth/v1/settings", url), { headers: { apikey: key } });
  if (!authResponse.ok) throw new Error(`Auth settings request failed (${authResponse.status}).`);
  const auth = await authResponse.json();
  if (!auth.external?.email || auth.disable_signup) throw new Error("Enable email/password signups in Supabase Authentication settings.");
  console.log(`Email signup enabled; email confirmation ${auth.mailer_autoconfirm ? "disabled" : "required"}. Google provider ${auth.external?.google ? "enabled" : "disabled"}.`);
  const settings = await supabase.from("store_settings").select("id,shipping_fee").eq("id", 1).maybeSingle();
  if (settings.error || !settings.data) throw new Error("Store settings are missing. Run the latest supabase/schema.sql in SQL Editor.");
  for (const [name, args] of [
    ["submit_contact_message", { details: { email: "invalid" } }],
    ["subscribe_newsletter", { address: "invalid" }]
  ] as const) {
    const { error: rpcError } = await supabase.rpc(name, args);
    if (rpcError?.code !== "22023") throw new Error(`${name} is missing or invalid. Run the latest supabase/schema.sql. Check used invalid input and saved no data.`);
  }
  const { error: orderError } = await supabase.rpc("place_order", { customer: {}, cart_items: [], request_key: crypto.randomUUID() });
  if (orderError?.code !== "42501") throw new Error("Order function is missing or anonymous execution is not blocked. Apply the latest schema.");
  const { error: contactsError } = await supabase.from("contact_messages").select("id").limit(1);
  if (contactsError?.code !== "42501") throw new Error("Contact message privacy could not be verified.");
  console.log("Contact/newsletter validation, store settings, anonymous-order blocking and contact privacy verified. No data was created.");
}
main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Supabase check failed.");
  process.exitCode = 1;
});