"use server";
import { z } from "zod";
import { getSupabaseServerClient, hasSupabaseConfig } from "@/lib/supabase/server";

export interface NewsletterState { ok: boolean; message: string }

const schema = z.string().trim().toLowerCase().email().max(200);

export async function subscribe(_prev: NewsletterState | null, formData: FormData): Promise<NewsletterState> {
  const parsed = schema.safeParse(formData.get("email"));
  if (!parsed.success) return { ok: false, message: "Enter a valid email address." };
  if (!hasSupabaseConfig) return { ok: false, message: "Subscriptions are not set up yet. Please try again later." };
  try {
  const { error } = await getSupabaseServerClient()
    .rpc("subscribe_newsletter", { address: parsed.data });
  if (error?.code === "23505") return { ok: true, message: "You're subscribed. Thank you." };
  if (error) {
    console.error("Newsletter subscription failed:", error.code);
    return { ok: false, message: "Could not subscribe right now. Please try again." };
  }
  return { ok: true, message: "You're subscribed. Thank you." };
  } catch { return { ok: false, message: "Could not connect. Please try again." }; }
}
