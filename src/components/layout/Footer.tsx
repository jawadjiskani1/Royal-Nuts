import Link from "next/link";
import Logo from "@/components/ui/Logo";
import { site as identity, whatsappLink } from "@/lib/site";
import { CATEGORIES } from "@/lib/categories";

import { getStoreSettings } from "@/lib/data/settings";

export default async function Footer() {
  const site = { ...identity, ...await getStoreSettings() };
  const wa = whatsappLink(undefined, site.whatsapp);
  return (
    <footer className="mt-24 bg-navy text-cream/80">
      <div className="container-page grid gap-10 py-14 md:grid-cols-4">
        <div className="md:col-span-1">
          <Logo light />
          <p className="mt-4 text-sm">{site.slogan}</p>
        </div>
        <div>
          <h2 className="font-serif text-lg !text-gold">Shop</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {CATEGORIES.slice(0, 6).map((c) => (
              <li key={c.slug}><Link className="hover:text-gold" href={`/shop?category=${c.slug}`}>{c.name}</Link></li>
            ))}
            <li><Link className="hover:text-gold" href="/shop">All products</Link></li>
          </ul>
        </div>
        <div>
          <h2 className="font-serif text-lg !text-gold">Contact</h2>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link href="/contact" className="hover:text-gold">Contact us</Link></li>
            {site.phone && <li>Phone: <a className="hover:text-gold" href={`tel:${site.phone.replace(/[^\d+]/g, "")}`}>{site.phone}</a></li>}
            {site.email && <li>Email: <a className="hover:text-gold" href={`mailto:${site.email}`}>{site.email}</a></li>}
            {site.address && <li>{site.address}</li>}
            {wa && <li><a className="hover:text-gold" href={wa} target="_blank" rel="noopener noreferrer">Chat on WhatsApp</a></li>}
            {!site.phone && !site.email && !site.address && !wa && (
              <li><Link href="/contact" className="hover:text-gold">Send us a message</Link></li>
            )}
          </ul>
        </div>
        <div>
          <h2 className="font-serif text-lg !text-gold">Follow</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {site.instagram && <li><a className="hover:text-gold" href={site.instagram} target="_blank" rel="noopener noreferrer">Instagram</a></li>}
            {site.facebook && <li><a className="hover:text-gold" href={site.facebook} target="_blank" rel="noopener noreferrer">Facebook</a></li>}
            {!site.instagram && !site.facebook && <li><Link href="/contact" className="hover:text-gold">Stay in touch</Link></li>}
          </ul>
        </div>
      </div>
      <div className="border-t border-gold/20 py-4 text-center text-xs text-cream/60">
        &copy; {new Date().getFullYear()} Royal Nuts. All rights reserved.
      </div>
    </footer>
  );
}
