import type { Metadata } from "next";
import ContactForm from "@/components/contact/ContactForm";
import { getStoreSettings } from "@/lib/data/settings";
import { whatsappLink } from "@/lib/site";

export const metadata: Metadata = { title: "Contact us" };
export default async function ContactPage() {
  const settings = await getStoreSettings();
  const wa = whatsappLink("Hello Royal Nuts, I have a question.", settings.whatsapp);
  return (
    <div className="container-page py-12 sm:py-16">
      <h1 className="text-4xl">Get in touch</h1>
      <p className="mt-3 max-w-xl text-ink/70">Questions about our dry fruits, gifts or a bulk order? Send us a message and we will get back to you.</p>
      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_2fr]">
        <aside className="space-y-6 border border-gold/30 bg-white p-6">
          <h2 className="text-2xl">Royal Nuts</h2>
          {settings.phone && <p><a href={`tel:${settings.phone.replace(/[^\d+]/g, "")}`} className="underline decoration-gold">{settings.phone}</a></p>}
          {settings.email && <p><a href={`mailto:${settings.email}`} className="break-all underline decoration-gold">{settings.email}</a></p>}
          {settings.address && <p className="text-sm text-ink/70">{settings.address}</p>}
          {wa && <a href={wa} target="_blank" rel="noopener noreferrer" className="btn-navy">Chat on WhatsApp</a>}
          {(settings.instagram || settings.facebook) && <div><h2 className="text-xl">Follow Royal Nuts</h2><div className="mt-3 flex flex-wrap gap-4 text-sm">
            {settings.instagram && <a href={settings.instagram} target="_blank" rel="noopener noreferrer" className="underline decoration-gold">Instagram</a>}
            {settings.facebook && <a href={settings.facebook} target="_blank" rel="noopener noreferrer" className="underline decoration-gold">Facebook</a>}
          </div></div>}
        </aside>
        <section className="border border-gold/30 bg-white p-6 sm:p-8" aria-labelledby="message-title"><h2 id="message-title" className="mb-6 text-2xl">Send us a message</h2><ContactForm /></section>
      </div>
    </div>
  );
}
