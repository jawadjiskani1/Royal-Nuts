import type { Metadata } from "next";
import { Fraunces, Figtree } from "next/font/google";
import "./globals.css";
import { site } from "@/lib/site";
import { getSearchIndex } from "@/lib/data/products";
import { AuthProvider } from "@/components/auth/AuthProvider";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CartDrawer from "@/components/cart/CartDrawer";
import WhatsAppButton from "@/components/layout/WhatsAppButton";
import BackToTop from "@/components/layout/BackToTop";

// Read current database products on each request, including navigation search.
export const dynamic = "force-dynamic";

const serif = Fraunces({ subsets: ["latin"], variable: "--font-serif", display: "swap" });
const sans = Figtree({ subsets: ["latin"], variable: "--font-sans", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: "Royal Nuts | Premium Dry Fruits Online in Pakistan", template: "%s | Royal Nuts" },
  description:
    "Buy premium dry fruits online in Pakistan: almonds, cashews, pistachios, walnuts, dates and gift boxes from Royal Nuts.",
  openGraph: { siteName: "Royal Nuts", type: "website", locale: "en_PK" }
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const searchItems = await getSearchIndex();
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`}>
      <body>
        <AuthProvider>
          <AnnouncementBar />
          <Navbar searchItems={searchItems} />
          <main id="main">{children}</main>
          <Footer />
          <CartDrawer />
          <WhatsAppButton />
          <BackToTop />
        </AuthProvider>
      </body>
    </html>
  );
}
