export type CategorySlug =
  | "almonds" | "cashews" | "pistachios" | "walnuts" | "raisins"
  | "dates" | "figs" | "peanuts" | "mixed-nuts" | "gift-boxes";

export interface Variant {
  id: string;
  label: string;        // "250g", "500g", "1kg"
  grams: number;
  price: number;        // PKR. 0 = not set yet
  compareAtPrice?: number;
  stock: number;
  sku?: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  category: CategorySlug;
  images: string[];
  shortDescription: string;
  description: string;
  ingredients: string;
  storage: string;
  nutrition?: string;
  variants: Variant[];
  featured: boolean;
  bestSeller: boolean;
  active: boolean;
  isSample: boolean;    // true = placeholder data to be replaced by the owner
}
