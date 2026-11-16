import type { Metadata } from "next";
import Link from "next/link";
import ProductCard from "@/components/product/ProductCard";
import { CATEGORIES, categoryName } from "@/lib/categories";
import { queryProducts, type ProductQuery } from "@/lib/data/products";

export const revalidate = 60;

type SP = Promise<Record<string, string | string[] | undefined>>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
const num = (v?: string) => (v && /^\d+$/.test(v) ? Number(v) : undefined);
const SORTS = ["featured", "price-asc", "price-desc", "name"] as const;

export async function generateMetadata({ searchParams }: { searchParams: SP }): Promise<Metadata> {
  const sp = await searchParams;
  const cat = one(sp.category);
  const name = cat ? categoryName(cat) : null;
  return {
    title: name ? `Buy ${name} Online in Pakistan` : "Shop Premium Dry Fruits Online in Pakistan",
    description: name
      ? `Shop ${name.toLowerCase()} online from Royal Nuts. Choose your pack size and pay on delivery anywhere in Pakistan.`
      : "Browse almonds, cashews, pistachios, walnuts, dates, raisins, figs and gift boxes from Royal Nuts."
  };
}

export default async function ShopPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const q = one(sp.q)?.trim().slice(0, 80) || undefined;
  const category = CATEGORIES.some((c) => c.slug === one(sp.category)) ? one(sp.category) : undefined;
  const sortRaw = one(sp.sort);
  const sort = (SORTS as readonly string[]).includes(sortRaw ?? "") ? (sortRaw as ProductQuery["sort"]) : "featured";
  const min = num(one(sp.min)), max = num(one(sp.max));
  const page = num(one(sp.page)) ?? 1;

  const { items, total, pages, page: current } = await queryProducts({ q, category, min, max, sort, page });

  const href = (over: Record<string, string | undefined>) => {
    const p = new URLSearchParams();
    const base = { q, category, sort: sort === "featured" ? undefined : sort, min: min?.toString(), max: max?.toString(), ...over };
    Object.entries(base).forEach(([k, v]) => v && p.set(k, v));
    const s = p.toString();
    return s ? `/shop?${s}` : "/shop";
  };

  return (
    <div className="container-page py-10">
      <h1 className="text-4xl">{category ? categoryName(category) : "All products"}</h1>
      <p className="mt-1 text-sm text-ink/60">{total} {total === 1 ? "product" : "products"}{q ? ` matching "${q}"` : ""}</p>

      <nav aria-label="Browse by category" className="-mx-4 mt-5 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
        {[{ slug: undefined as string | undefined, name: "All" }, ...CATEGORIES].map((c) => {
          const active = (category ?? undefined) === c.slug;
          return (
            <Link key={c.slug ?? "all"} href={href({ category: c.slug, page: undefined })} aria-current={active ? "page" : undefined}
              className={`shrink-0 border px-4 py-1.5 text-sm transition-colors ${active ? "border-navy bg-navy text-cream" : "border-navy/25 bg-white hover:border-gold-dark hover:bg-gold/10"}`}>
              {c.name}
            </Link>
          );
        })}
      </nav>

      <div className="mt-8 grid gap-8 lg:grid-cols-[16rem_1fr]">
        <aside>
          <form action="/shop" className="space-y-5 border border-gold/30 bg-white p-4">
            <div>
              <label htmlFor="q" className="mb-1 block text-sm font-medium">Search</label>
              <input id="q" name="q" defaultValue={q} className="input" placeholder="Product name" />
            </div>
            <div>
              <label htmlFor="category" className="mb-1 block text-sm font-medium">Category</label>
              <select id="category" name="category" defaultValue={category ?? ""} className="input">
                <option value="">All categories</option>
                {CATEGORIES.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
              </select>
            </div>
            <fieldset>
              <legend className="mb-1 text-sm font-medium">Price (Rs)</legend>
              <div className="flex gap-2">
                <input name="min" type="number" min={0} defaultValue={min} placeholder="Min" aria-label="Minimum price" className="input" />
                <input name="max" type="number" min={0} defaultValue={max} placeholder="Max" aria-label="Maximum price" className="input" />
              </div>
            </fieldset>
            <div>
              <label htmlFor="sort" className="mb-1 block text-sm font-medium">Sort by</label>
              <select id="sort" name="sort" defaultValue={sort} className="input">
                <option value="featured">Featured</option>
                <option value="price-asc">Price: low to high</option>
                <option value="price-desc">Price: high to low</option>
                <option value="name">Name</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button className="btn-navy flex-1">Apply filters</button>
              <Link href="/shop" className="btn-outline-dark">Reset</Link>
            </div>
          </form>
        </aside>

        <div>
          {items.length === 0 ? (
            <div className="border border-gold/30 bg-white p-10 text-center">
              <p className="font-serif text-2xl text-navy">No products found</p>
              <p className="mt-2 text-sm text-ink/70">Try a different search or clear your filters. Products without a price are hidden when a price filter is on.</p>
              <Link href="/shop" className="btn-navy mt-5">Clear filters</Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">{items.map((p) => <ProductCard key={p.id} product={p} />)}</div>
          )}

          {pages > 1 && (
            <nav aria-label="Pagination" className="mt-10 flex items-center justify-center gap-2">
              {current > 1 && <Link className="btn-outline-dark !py-2" href={href({ page: String(current - 1) })}>Previous</Link>}
              <span className="px-3 text-sm">Page {current} of {pages}</span>
              {current < pages && <Link className="btn-outline-dark !py-2" href={href({ page: String(current + 1) })}>Next</Link>}
            </nav>
          )}
        </div>
      </div>
    </div>
  );
}
