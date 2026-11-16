import Link from "next/link";

export default function Section({ title, href, linkLabel, children, tone = "light" }: {
  title: string; href?: string; linkLabel?: string; children: React.ReactNode; tone?: "light" | "dark" | "white";
}) {
  const bg = tone === "dark" ? "bg-forest text-cream" : tone === "white" ? "bg-white" : "";
  return (
    <section className={`py-16 ${bg}`}>
      <div className="container-page">
        <div className="mb-8 flex items-end justify-between gap-4">
          <h2 className={`text-3xl sm:text-4xl ${tone === "dark" ? "!text-cream" : ""}`}>{title}</h2>
          {href && <Link href={href} className="shrink-0 text-sm font-medium underline decoration-gold underline-offset-4 hover:text-gold-dark">{linkLabel ?? "View all"}</Link>}
        </div>
        {children}
      </div>
    </section>
  );
}
