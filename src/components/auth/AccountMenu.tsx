"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { friendlyAuthError } from "@/lib/auth-errors";
import { useAuth } from "@/components/auth/AuthProvider";

/** Desktop account control for the navbar: sign in / sign up links, or an avatar dropdown. */
export default function AccountMenu() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => { if (!wrap.current?.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDown); document.removeEventListener("keydown", onKey); };
  }, [open]);

  if (loading) return <div className="hidden h-9 w-28 sm:block" aria-hidden="true" />;

  if (!user) {
    return (
      <div className="hidden items-center gap-2 sm:flex">
        <Link href="/login" className="px-2 py-2 text-sm font-medium hover:text-gold-dark">Sign in</Link>
        <Link href="/signup" className="btn-navy !px-4 !py-2">Sign up</Link>
      </div>
    );
  }

  const label = user.user_metadata.full_name || user.email || "Account";
  const initial = label.trim().charAt(0).toUpperCase();

  return (
    <div ref={wrap} className="relative hidden sm:block">
      <button onClick={() => setOpen((o) => !o)} aria-haspopup="menu" aria-expanded={open} aria-label={`Account menu for ${label}`}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-navy text-sm font-semibold text-gold hover:bg-navy-700">
        {initial}
      </button>
      {open && (
        <div role="menu" className="absolute right-0 top-full z-50 mt-2 w-56 animate-pop-in border border-gold/40 bg-white shadow-lg">
          <div className="border-b border-gold/20 px-4 py-3">
            <p className="truncate text-sm font-medium">{user.user_metadata.full_name || "Your account"}</p>
            <p className="truncate text-xs text-ink/60">{user.email}</p>
          </div>
          <Link role="menuitem" href="/account" onClick={() => setOpen(false)} className="block px-4 py-2.5 text-sm hover:bg-gold/10">My account</Link>
          <button role="menuitem" className="block w-full px-4 py-2.5 text-left text-sm hover:bg-gold/10"
            onClick={async () => {
              setError("");
              try { await signOut(); setOpen(false); router.push("/"); }
              catch (error) { setError(friendlyAuthError(error)); }
            }}>
            Sign out
          </button>
          {error && <p role="alert" className="px-4 pb-3 text-xs text-red-700">{error}</p>}
        </div>
      )}
    </div>
  );
}
