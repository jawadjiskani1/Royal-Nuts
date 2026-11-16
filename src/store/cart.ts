"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

// Display data only. Prices are re-read from the database on the server
// at checkout, so editing localStorage cannot change what a customer pays.
export interface CartLine {
  productId: string;
  variantId: string;
  name: string;
  slug: string;
  variantLabel: string;
  price: number;
  image?: string;
  quantity: number;
}

interface CartState {
  lines: CartLine[];
  open: boolean;
  add: (line: Omit<CartLine, "quantity">, qty?: number) => void;
  setQty: (variantId: string, qty: number) => void;
  remove: (variantId: string) => void;
  clear: () => void;
  setOpen: (open: boolean) => void;
}

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      open: false,
      add: (line, qty = 1) =>
        set((s) => {
          const existing = s.lines.find((l) => l.variantId === line.variantId);
          const lines = existing
            ? s.lines.map((l) => l.variantId === line.variantId ? { ...l, quantity: Math.min(l.quantity + qty, 50) } : l)
            : [...s.lines, { ...line, quantity: qty }];
          return { lines, open: true };
        }),
      setQty: (variantId, qty) =>
        set((s) => ({
          lines: qty <= 0
            ? s.lines.filter((l) => l.variantId !== variantId)
            : s.lines.map((l) => l.variantId === variantId ? { ...l, quantity: Math.min(qty, 50) } : l)
        })),
      remove: (variantId) => set((s) => ({ lines: s.lines.filter((l) => l.variantId !== variantId) })),
      clear: () => set({ lines: [] }),
      setOpen: (open) => set({ open })
    }),
    { name: "royal-nuts-cart", partialize: (s) => ({ lines: s.lines }) }
  )
);

export const cartCount = (lines: CartLine[]) => lines.reduce((n, l) => n + l.quantity, 0);
export const cartSubtotal = (lines: CartLine[]) => lines.reduce((n, l) => n + l.price * l.quantity, 0);
