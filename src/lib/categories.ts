import type { CategorySlug } from "./types";

export interface Category { slug: CategorySlug; name: string; image: string }

// Images live in /public/categories (illustrated placeholders; swap for photos any time).
export const CATEGORIES: Category[] = [
  { slug: "almonds", name: "Almonds", image: "/categories/almonds.svg" },
  { slug: "cashews", name: "Cashews", image: "/categories/cashews.svg" },
  { slug: "pistachios", name: "Pistachios", image: "/categories/pistachios.svg" },
  { slug: "walnuts", name: "Walnuts", image: "/categories/walnuts.svg" },
  { slug: "raisins", name: "Raisins", image: "/categories/raisins.svg" },
  { slug: "dates", name: "Dates", image: "/categories/dates.svg" },
  { slug: "figs", name: "Figs", image: "/categories/figs.svg" },
  { slug: "peanuts", name: "Peanuts", image: "/categories/peanuts.svg" },
  { slug: "mixed-nuts", name: "Mixed Nuts", image: "/categories/mixed-nuts.svg" },
  { slug: "gift-boxes", name: "Premium Gift Boxes", image: "/categories/gift-boxes.svg" }
];

export const categoryName = (slug: string) =>
  CATEGORIES.find((c) => c.slug === slug)?.name ?? slug;
