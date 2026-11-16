"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { friendlyAuthError } from "@/lib/auth-errors";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const { user, loading, configured } = useAuth();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("Use at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setError("Supabase isn't configured yet.");
      return;
    }

    setBusy(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;
      router.replace("/account");
      router.refresh();
    } catch (error) { setError(friendlyAuthError(error)); }
    finally { setBusy(false); }
  }

  return (
    <div className="container-page py-10 sm:py-16">
      <section className="mx-auto max-w-lg border border-gold/40 bg-white p-6 sm:p-10">
        <h1 className="text-3xl">Choose a new password</h1>
        {loading ? (
          <p className="mt-4 text-sm text-ink/70" role="status">Checking your reset link…</p>
        ) : !configured ? (
          <p className="mt-4 text-sm text-ink/70">Connect Supabase to update your password.</p>
        ) : !user ? (
          <p className="mt-4 text-sm text-ink/70">
            This reset link is invalid or expired. Request a new one from the{" "}
            <Link href="/login" className="underline decoration-gold underline-offset-4">sign-in page</Link>.
          </p>
        ) : (
          <form onSubmit={submit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="password" className="mb-1 block text-sm font-medium">New password</label>
              <input id="password" type="password" autoComplete="new-password" required minLength={8}
                value={password} onChange={(event) => setPassword(event.target.value)} className="input" />
            </div>
            <div>
              <label htmlFor="confirm" className="mb-1 block text-sm font-medium">Confirm new password</label>
              <input id="confirm" type="password" autoComplete="new-password" required minLength={8}
                value={confirm} onChange={(event) => setConfirm(event.target.value)} className="input" />
            </div>
            {error && <p role="alert" className="border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p>}
            <button type="submit" disabled={busy} className="btn-navy w-full">
              {busy ? "Updating password…" : "Update password"}
            </button>
          </form>
        )}
      </section>
    </div>
  );
}
