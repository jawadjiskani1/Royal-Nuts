"use server";
import { contactSchema } from "@/lib/validation";
import { getSupabaseServerClient, hasSupabaseConfig } from "@/lib/supabase/server";

export interface ContactState { ok: boolean; message: string }
export async function sendContact(_prev: ContactState | null, formData: FormData): Promise<ContactState> {
  if (formData.get("website")) return { ok: false, message: "Your message could not be sent." };
  const parsed = contactSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0].message };
  if (!hasSupabaseConfig) return { ok: false, message: "The contact form is temporarily unavailable. Please use the contact links." };
  try {
    const { error } = await getSupabaseServerClient().rpc("submit_contact_message", { details: parsed.data });
    if (error) {
      console.error("Contact submission failed:", error.code);
      return { ok: false, message: error.code === "P0001" ? "Too many messages. Please try again in an hour." : "Your message could not be saved. Please try again or use the contact links." };
    }
    return { ok: true, message: "Your message has been received. We will reply using the contact details you provided." };
  } catch { return { ok: false, message: "Could not connect. Please try again." }; }
}
