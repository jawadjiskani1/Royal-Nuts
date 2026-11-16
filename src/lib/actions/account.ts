"use server";
import { revalidatePath } from "next/cache";
import { getSupabaseSessionClient } from "@/lib/supabase/session";
import { profileSchema } from "@/lib/validation";

export async function saveProfile(formData: FormData) {
  const parsed = profileSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0].message };
  try {
    const supabase = await getSupabaseSessionClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return { ok: false, message: "Please sign in again to save your profile." };
    const { error } = await supabase.from("profiles").upsert({ id: user.id, ...parsed.data });
    if (error) {
      console.error("Profile save failed:", error.code);
      return { ok: false, message: "Your details could not be saved. Please try again later." };
    }
    revalidatePath("/account"); revalidatePath("/checkout");
    return { ok: true, message: "Your details have been saved." };
  } catch { return { ok: false, message: "Could not connect. Please try again." }; }
}
