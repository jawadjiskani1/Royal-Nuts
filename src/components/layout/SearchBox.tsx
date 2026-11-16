"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { SearchItem } from "@/lib/data/products";
import { categoryName } from "@/lib/categories";
import { formatPKR } from "@/lib/format";

/** Search field with live product suggestions. Still submits to /shop?q= as a normal form. */
export default function SearchBox({ items, id, placeholder = "Search almonds, dates, gift boxes", onNavigate }: {
  items: SearchItem[]; id: string; placeholder?: string; onNavigate?: () => void;
}) {
  const router = useRouter();
  const listId = useId();
  const wrap = useRef<HTMLDivElement>(null);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (needle.length < 1) return [];
    return items.filter((i) => i.text.includes(needle)).slice(0, 6);
  }, [q, items]);

  useEffect(() => {
    const onDown = (e: MouseEvent) => { if (!wrap.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const go = (href: string) => { setOpen(false); setQ(""); onNavigate?.(); router.push(href); };
  const expanded = open && q.trim().length > 0;

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") { setOpen(false); setActive(-1); return; }
    if (!results.length) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setOpen(true); setActive((a) => (a + 1) % results.length); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => (a <= 0 ? results.length - 1 : a - 1)); }
    else if (e.key === "Enter" && active >= 0) { e.preventDefault(); go(`/product/${results[active].slug}`); }
  }

  return (
    <div ref={wrap} className="relative">
      <form action="/shop" role="search" onSubmit={() => { setOpen(false); onNavigate?.(); }}>
        <label htmlFor={id} className="sr-only">Search products</label>
        <input id={id} name="q" type="search" autoComplete="off" value={q} placeholder={placeholder} className="input"
          role="combobox" aria-expanded={expanded} aria-controls={listId} aria-autocomplete="list"
          aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
          onChange={(e) => { setQ(e.target.value); setOpen(true); setActive(-1); }}
          onFocus={() => setOpen(true)} onKeyDown={onKeyDown} />
      </form>

      {expanded && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 animate-pop-in border border-gold/40 bg-white shadow-lg">
          {results.length > 0 ? (
            <ul id={listId} role="listbox" aria-label="Product suggestions">
              {results.map((r, i) => (
                <li key={r.slug} id={`${listId}-${i}`} role="option" aria-selected={i === active}>
                  <button type="button" onMouseEnter={() => setActive(i)} onClick={() => go(`/product/${r.slug}`)}
                    className={`flex w-full items-center gap-3 px-3 py-2 text-left ${i === active ? "bg-gold/15" : "hover:bg-gold/10"}`}>
                    <span className="relative h-11 w-11 shrink-0 overflow-hidden bg-cream-dark">
                      {r.image && <Image src={r.image} alt="" fill sizes="44px" className="object-cover" unoptimized={r.image.endsWith(".svg")} />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{r.name}</span>
                      <span className="block truncate text-xs text-ink/60">{categoryName(r.category)}</span>
                    </span>
                    <span className="shrink-0 text-xs text-ink/70">{r.price !== null ? formatPKR(r.price) : ""}</span>
                  </button>
                </li>
              ))}
              <li role="presentation" className="border-t border-gold/20">
                <button type="button" onClick={() => go(`/shop?q=${encodeURIComponent(q.trim())}`)} className="w-full px-3 py-2.5 text-left text-xs font-medium text-navy hover:bg-gold/10">
                  See all results for &ldquo;{q.trim()}&rdquo;
                </button>
              </li>
            </ul>
          ) : (
            <p id={listId} role="status" className="px-3 py-3 text-sm text-ink/70">No products match &ldquo;{q.trim()}&rdquo;. Try another word.</p>
          )}
        </div>
      )}
    </div>
  );
}
