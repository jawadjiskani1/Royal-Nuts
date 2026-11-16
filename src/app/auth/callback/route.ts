import { NextRequest, NextResponse } from "next/server";
import { getSupabaseSessionClient } from "@/lib/supabase/session";
import { safeNext } from "@/lib/auth-errors";

export async function GET(request: NextRequest) {
  const next = safeNext(request.nextUrl.searchParams.get("next"));
  const code = request.nextUrl.searchParams.get("code");
  if (code) {
    try {
      const supabase = await getSupabaseSessionClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) return new NextResponse(null, { status: 303, headers: { Location: next, "Cache-Control": "private, no-store" } });
    } catch { /* Render an actionable error without exposing auth tokens. */ }
  }
  return new NextResponse(null, { status: 303, headers: { Location: "/login?error=auth_link", "Cache-Control": "private, no-store" } });
}
