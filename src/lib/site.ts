// Default store identity. Public database settings can override contact values.
const value = (s?: string) => (s ?? "").trim();
const digits = (s?: string) => value(s).replace(/\D/g, "");

export function safeSocialUrl(raw: string | undefined, host: string): string {
  const input = value(raw);
  if (!input) return "";
  try {
    const url = new URL(/^https?:\/\//i.test(input) ? input : `https://${input}`);
    return url.protocol === "https:" && !url.username && !url.password &&
      (url.hostname === host || url.hostname.endsWith(`.${host}`)) ? url.href : "";
  } catch { return ""; }
}

export const site = {
  name: "Royal Nuts",
  slogan: "Eat Healthy. Stay Royal.",
  altSlogan: "Taste the Royal Goodness.",
  url: value(process.env.NEXT_PUBLIC_SITE_URL) || "http://localhost:3000",
  whatsapp: digits(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER),
  phone: value(process.env.NEXT_PUBLIC_CONTACT_PHONE),
  email: value(process.env.NEXT_PUBLIC_CONTACT_EMAIL),
  address: value(process.env.NEXT_PUBLIC_STORE_ADDRESS),
  instagram: safeSocialUrl(process.env.NEXT_PUBLIC_INSTAGRAM_URL, "instagram.com"),
  facebook: safeSocialUrl(process.env.NEXT_PUBLIC_FACEBOOK_URL, "facebook.com"),
  heroImage: value(process.env.NEXT_PUBLIC_HERO_IMAGE)
};

export const whatsappLink = (text?: string, number = site.whatsapp) =>
  number
    ? `https://wa.me/${number}${text ? `?text=${encodeURIComponent(text)}` : ""}`
    : "";
