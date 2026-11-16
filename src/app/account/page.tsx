import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AccountDashboard from "@/components/account/AccountDashboard";
import { getSupabaseSessionClient } from "@/lib/supabase/session";
import { hasSupabaseConfig } from "@/lib/supabase/config";
import type { CustomerProfile, CustomerOrder } from "@/lib/account-types";

export const metadata: Metadata = { title: "My account", robots: { index: false } };
export default async function AccountPage() {
  if (!hasSupabaseConfig) redirect("/login");
  const supabase = await getSupabaseSessionClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/account");
  const [profileResult, ordersResult] = await Promise.all([
    supabase.from("profiles").select("full_name,phone,address,city").eq("id", user.id).maybeSingle(),
    supabase.from("orders").select("id,created_at,status,total,shipping_fee,items").eq("user_id", user.id).order("created_at", { ascending: false }).limit(50)
  ]);
  return <AccountDashboard email={user.email ?? ""} verified={Boolean(user.email_confirmed_at)}
    profile={(profileResult.data as CustomerProfile | null) ?? { full_name: user.user_metadata.full_name ?? "", phone: "", address: "", city: "" }}
    orders={(ordersResult.data ?? []) as CustomerOrder[]} loadError={Boolean(profileResult.error || ordersResult.error)} />;
}
