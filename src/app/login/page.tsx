import type { Metadata } from "next";
import AuthForm from "@/components/auth/AuthForm";
import { safeNext } from "@/lib/auth-errors";

export const metadata: Metadata = { title: "Sign in", robots: { index: false } };

export default async function LoginPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const next = safeNext(Array.isArray(sp.next) ? sp.next[0] : sp.next);
  return <AuthForm mode="login" next={next} linkError={sp.error === "auth_link"} />;
}
