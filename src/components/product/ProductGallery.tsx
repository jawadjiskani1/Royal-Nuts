"use client";
import { useState } from "react";
import ProductImage from "@/components/ui/ProductImage";

/** Main image with hover zoom (mouse only) and clickable thumbnails when there are several photos. */
export default function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const [index, setIndex] = useState(0);
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);
  const list = images.length ? images : [undefined];
  const current = list[Math.min(index, list.length - 1)];

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse" || !current) return;
    const r = e.currentTarget.getBoundingClientRect();
    setZoom({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
  };

  return (
    <div>
      <div className={`relative aspect-square w-full overflow-hidden border border-gold/30 ${current ? "cursor-zoom-in" : ""}`}
        onPointerMove={onMove} onPointerLeave={() => setZoom(null)}>
        <div className="h-full w-full transition-transform duration-150 ease-out"
          style={zoom ? { transform: "scale(1.9)", transformOrigin: `${zoom.x}% ${zoom.y}%` } : undefined}>
          <ProductImage key={current ?? "none"} src={current} alt={name} priority sizes="(min-width:1024px) 40rem, 100vw" className="h-full w-full" />
        </div>
      </div>

      {list.length > 1 && (
        <ul className="mt-3 grid grid-cols-5 gap-2" aria-label="Product photos">
          {list.slice(0, 5).map((src, i) => (
            <li key={src ?? i}>
              <button type="button" onClick={() => setIndex(i)} aria-label={`Show photo ${i + 1} of ${list.length}`} aria-current={i === index}
                className={`block w-full border-2 ${i === index ? "border-navy" : "border-gold/30 hover:border-gold-dark"}`}>
                <ProductImage src={src} alt={`${name} view ${i + 1}`} sizes="8rem" className="aspect-square w-full" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
