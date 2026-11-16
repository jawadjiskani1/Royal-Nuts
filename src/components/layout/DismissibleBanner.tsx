"use client";
import { useEffect, useState } from "react";

const KEY = "royal-nuts-preview-banner-dismissed";

/** Preview-mode notice the owner can close. Stays closed for the rest of the browser session. */
export default function DismissibleBanner({ children }: { children: React.ReactNode }) {
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    try { if (sessionStorage.getItem(KEY) === "1") setHidden(true); } catch { /* storage blocked: keep showing */ }
  }, []);
  if (hidden) return null;
  return (
    <div className="relative bg-gold-light/60 py-2 pl-4 pr-12 text-center text-xs text-navy">
      {children}
      <button aria-label="Dismiss notice" className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:text-gold-dark"
        onClick={() => { setHidden(true); try { sessionStorage.setItem(KEY, "1"); } catch { /* ignore */ } }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 6l12 12M18 6L6 18" /></svg>
      </button>
    </div>
  );
}
