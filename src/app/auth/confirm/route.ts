import { NextRequest, NextResponse } from "next/server";
import { getSupabaseSessionClient } from "@/lib/supabase/session";
import { safeNext } from "@/lib/auth-errors";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const tokenHash = params.get("token_hash");
  const type = params.get("type");
  if (tokenHash && (type === "signup" || type === "recovery" || type === "email")) {
    try {
      const supabase = await getSupabaseSessionClient();
      const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
      if (!error) {
        const next = type === "recovery" ? "/update-password" : safeNext(params.get("next"));
        return new NextResponse(null, { status: 303, headers: { Location: next, "Cache-Control": "private, no-store" } });
      }
    } catch { /* Invalid and expired links use the same public error. */ }
  }
  return new NextResponse(null, { status: 303, headers: { Location: "/login?error=auth_link", "Cache-Control": "private, no-store" } });
}
