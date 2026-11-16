import type { Metadata } from "next";
import { redirect } from "next/navigation";
import CheckoutForm from "@/components/cart/CheckoutForm";
import { getSupabaseSessionClient } from "@/lib/supabase/session";
import { hasSupabaseConfig } from "@/lib/supabase/config";
import { getStoreSettings } from "@/lib/data/settings";
import type { CustomerProfile } from "@/lib/account-types";

export const metadata: Metadata = { title: "Checkout", robots: { index: false } };
export default async function CheckoutPage() {
  if (!hasSupabaseConfig) redirect("/login?next=/checkout");
  const supabase = await getSupabaseSessionClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/checkout");
  const [{ data }, settings] = await Promise.all([
    supabase.from("profiles").select("full_name,phone,address,city").eq("id", user.id).maybeSingle(),
    getStoreSettings()
  ]);
  return <CheckoutForm profile={(data as CustomerProfile | null) ?? { full_name: user.user_metadata.full_name ?? "", phone: "", address: "", city: "" }} email={user.email ?? ""} verified={Boolean(user.email_confirmed_at)} shippingFee={settings.shippingFee} userId={user.id} />;
}
