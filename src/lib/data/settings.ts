import "server-only";
import { cache } from "react";
import { site, safeSocialUrl } from "@/lib/site";
import { getSupabaseServerClient, hasSupabaseConfig } from "@/lib/supabase/server";

export const getStoreSettings = cache(async () => {
  const defaults = { phone: site.phone, email: site.email, address: site.address, whatsapp: site.whatsapp, instagram: site.instagram, facebook: site.facebook, shippingFee: 0 };
  if (!hasSupabaseConfig) return defaults;
  try {
    const { data, error } = await getSupabaseServerClient().from("store_settings").select("phone,email,address,whatsapp,instagram,facebook,shipping_fee").eq("id", 1).maybeSingle();
    if (error || !data) return defaults;
    return {
      phone: data.phone || defaults.phone, email: data.email || defaults.email,
      address: data.address || defaults.address,
      whatsapp: (data.whatsapp || defaults.whatsapp).replace(/\D/g, ""),
      instagram: safeSocialUrl(data.instagram || defaults.instagram, "instagram.com"),
      facebook: safeSocialUrl(data.facebook || defaults.facebook, "facebook.com"),
      shippingFee: Number(data.shipping_fee)
    };
  } catch { return defaults; }
});
