import Link from "next/link";
import type { Product } from "@/lib/types";
import { startingPrice } from "@/lib/data/products";
import { formatPKR } from "@/lib/format";
import { categoryName } from "@/lib/categories";
import ProductImage from "@/components/ui/ProductImage";

export default function ProductCard({ product }: { product: Product }) {
  const price = startingPrice(product);
  const discounted = product.variants.some((v) => v.compareAtPrice && v.compareAtPrice > v.price && v.price > 0);
  const soldOut = product.variants.every((v) => v.stock <= 0);

  return (
    <article className="group flex h-full flex-col border border-gold/30 bg-white transition-shadow hover:shadow-md">
      <Link href={`/product/${product.slug}`} className="relative block">
        <ProductImage src={product.images[0]} alt={product.name} zoomOnHover className="aspect-square w-full" />
        <div className="absolute left-2 top-2 flex flex-col gap-1">
          {product.isSample && <span className="bg-navy px-2 py-0.5 text-xs text-cream">Sample</span>}
          {discounted && <span className="bg-gold px-2 py-0.5 text-xs font-semibold text-navy">Sale</span>}
        </div>
      </Link>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <p className="text-xs text-ink/60">{categoryName(product.category)}</p>
        <h3 className="text-lg leading-snug">
          <Link href={`/product/${product.slug}`} className="hover:text-gold-dark">{product.name}</Link>
        </h3>
        <p className="mt-auto pt-2 text-sm">
          {price !== null
            ? <><span className="text-ink/60">From </span><span className="font-semibold">{formatPKR(price)}</span></>
            : <span className="text-ink/60">Price not set yet</span>}
        </p>
        {soldOut && price !== null && <p className="text-xs text-red-700">Out of stock</p>}
        <Link href={`/product/${product.slug}`} className="btn-outline-dark mt-3 !py-2">Choose size</Link>
      </div>
    </article>
  );
}
