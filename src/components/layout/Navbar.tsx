"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Logo from "@/components/ui/Logo";
import SearchBox from "@/components/layout/SearchBox";
import AccountMenu from "@/components/auth/AccountMenu";
import { friendlyAuthError } from "@/lib/auth-errors";
import { useAuth } from "@/components/auth/AuthProvider";
import { CATEGORIES } from "@/lib/categories";
import type { SearchItem } from "@/lib/data/products";
import { cartCount, useCart } from "@/store/cart";

export default function Navbar({ searchItems }: { searchItems: SearchItem[] }) {
  const router = useRouter();
  const [authError, setAuthError] = useState("");
  const [menu, setMenu] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const lines = useCart((s) => s.lines);
  const setOpen = useCart((s) => s.setOpen);
  const { user, loading, signOut } = useAuth();

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const count = mounted ? cartCount(lines) : 0;

  return (
    <header className={`sticky top-0 z-40 border-b border-gold/40 bg-cream/95 backdrop-blur transition-shadow ${scrolled ? "shadow-md" : ""}`}>
      <div className="container-page flex h-16 items-center gap-3 sm:gap-4">
        <button className="lg:hidden p-2 -ml-2" aria-label={menu ? "Close menu" : "Open menu"} aria-expanded={menu}
          onClick={() => setMenu((m) => !m)}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d={menu ? "M6 6l12 12M18 6L6 18" : "M3 6h18M3 12h18M3 18h18"} />
          </svg>
        </button>
        <Logo />

        <div className="mx-auto hidden max-w-md flex-1 md:block">
          <SearchBox items={searchItems} id="nav-search" />
        </div>

        <nav className="ml-auto hidden items-center gap-6 text-sm font-medium lg:flex" aria-label="Main">
          <Link href="/shop" className="hover:text-gold-dark">Shop</Link>
          <Link href="/shop?category=gift-boxes" className="hover:text-gold-dark">Gift boxes</Link>
          <Link href="/contact" className="hover:text-gold-dark">Contact</Link>
        </nav>

        <div className="ml-auto flex items-center gap-1 sm:gap-2 lg:ml-0">
          <AccountMenu />
          <button onClick={() => setOpen(true)} aria-label={`Open cart, ${count} items`} className="relative p-2">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M5 8h14l-1.2 11.2a1 1 0 0 1-1 .8H7.200a1 1 0 0 1-1-.8L5 8zM9 8V6a3 3 0 0 1 6 0v2" />
            </svg>
            {count > 0 && (
              <span key={count} className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 animate-pop-in items-center justify-center rounded-full bg-gold px-1 text-xs font-bold text-navy">
                {count}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Category strip */}
      <nav aria-label="Categories" className="hidden border-t border-gold/20 lg:block">
        <ul className="container-page flex gap-6 overflow-x-auto py-2 text-sm">
          {CATEGORIES.map((c) => (
            <li key={c.slug} className="shrink-0">
              <Link href={`/shop?category=${c.slug}`} className="text-ink/80 hover:text-gold-dark">{c.name}</Link>
            </li>
          ))}
        </ul>
      </nav>

      {menu && (
        <div className="max-h-[calc(100dvh-4rem)] animate-pop-in overflow-y-auto border-t border-gold/30 bg-cream lg:hidden">
          <div className="container-page pt-3 md:hidden">
            <SearchBox items={searchItems} id="m-search" placeholder="Search products" onNavigate={() => setMenu(false)} />
          </div>

          <div className="container-page flex gap-2 pt-3 sm:hidden">
            {loading ? null : user ? (
              <>
                <Link href="/account" onClick={() => setMenu(false)} className="btn-navy flex-1 !py-2">My account</Link>
                <button className="btn-outline-dark flex-1 !py-2" onClick={async () => { setAuthError(""); try { await signOut(); setMenu(false); router.push("/"); } catch (error) { setAuthError(friendlyAuthError(error)); } }}>Sign out</button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setMenu(false)} className="btn-outline-dark flex-1 !py-2">Sign in</Link>
                <Link href="/signup" onClick={() => setMenu(false)} className="btn-navy flex-1 !py-2">Sign up</Link>
              </>
            )}
          </div>

          {authError && <p role="alert" className="container-page mt-3 text-sm text-red-700">{authError}</p>}
          <ul className="container-page grid grid-cols-2 gap-x-4 py-3 text-sm">
            <li className="py-2"><Link href="/shop" onClick={() => setMenu(false)} className="font-semibold">All products</Link></li>
            <li className="py-2"><Link href="/contact" onClick={() => setMenu(false)}>Contact us</Link></li>
            {CATEGORIES.map((c) => (
              <li key={c.slug} className="py-2">
                <Link href={`/shop?category=${c.slug}`} onClick={() => setMenu(false)}>{c.name}</Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
}
