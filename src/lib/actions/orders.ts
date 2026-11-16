"use server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { getSupabaseSessionClient } from "@/lib/supabase/session";
import { checkoutSchema, orderLinesSchema } from "@/lib/validation";

export async function placeOrder(items: unknown, formData: FormData, requestId: string) {
  const customer = checkoutSchema.safeParse(Object.fromEntries(formData));
  const lines = orderLinesSchema.safeParse(items);
  if (!customer.success) return { ok: false as const, message: customer.error.issues[0].message };
  if (!lines.success || !z.uuid().safeParse(requestId).success) return { ok: false as const, message: "Please check your cart and try again." };
  try {
    const supabase = await getSupabaseSessionClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return { ok: false as const, message: "Please sign in again before placing your order." };
    const { data, error } = await supabase.rpc("place_order", { customer: customer.data, cart_items: lines.data, request_key: requestId });
    if (error) {
      console.error("Order placement failed:", error.code);
      const allowed = ["One or more products are no longer available.", "An item is out of stock or its price is not set.", "Not enough stock. Please update your cart.", "Please verify your email before ordering."];
      return { ok: false as const, message: allowed.includes(error.message) ? error.message : "Your order could not be placed. Please try again later." };
    }
    if (!data?.id) return { ok: false as const, message: "We could not confirm your order. Please try again using the same cart." };
    revalidatePath("/account"); revalidatePath("/shop");
    return { ok: true as const, id: String(data.id), total: Number(data.total) };
  } catch { return { ok: false as const, message: "Could not connect. Retry to check or complete this order safely." }; }
}
