// Usage: npm run seed (needs SUPABASE_SERVICE_ROLE_KEY in .env.local)
import { config } from "dotenv";
config({ path: ".env.local" });
import { createClient } from "@supabase/supabase-js";
import { SAMPLE_PRODUCTS } from "../src/lib/sample-products";

async function main() {
  const { NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
  if (!NEXT_PUBLIC_SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  }
  const supabase = createClient(NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
  const rows = SAMPLE_PRODUCTS.map((product) => ({
    id: product.id,
    active: product.active,
    data: product
  }));
  const { error } = await supabase.from("products").upsert(rows, { onConflict: "id", ignoreDuplicates: true });
  if (error) throw error;
  console.log(`Imported missing starter products (${SAMPLE_PRODUCTS.length} checked); existing products were preserved.`);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
