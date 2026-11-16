import Link from "next/link";

// TEMPORARY placeholder logo. To use your real logo, drop it in /public/logo.png
// and replace the <svg> block with <Image src="/logo.png" ... />.
export default function Logo({ light = false }: { light?: boolean }) {
  const text = light ? "text-cream" : "text-navy";
  return (
    <Link href="/" aria-label="Royal Nuts home" className="flex items-center gap-2.5">
      <svg width="34" height="38" viewBox="0 0 34 38" aria-hidden="true">
        <path d="M3 37V16C3 7 9.5 2 17 2s14 5 14 14v21" fill="none" stroke="#D4AF65" strokeWidth="2" />
        <path d="M9 37V17c0-5.5 3.5-9 8-9s8 3.500 8 9v20" fill="#D4AF65" opacity=".25" />
        <circle cx="17" cy="22" r="4" fill="#D4AF65" />
      </svg>
      <span className={`font-serif text-xl font-semibold leading-none ${text}`}>
        Royal Nuts
      </span>
    </Link>
  );
}
