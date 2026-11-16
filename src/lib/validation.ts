import { z } from "zod";

export const emailSchema = z.string().trim().toLowerCase().email().max(200);
export const profileSchema = z.object({
  full_name: z.string().trim().min(2, "Enter your full name.").max(100),
  phone: z.string().trim().max(30).refine((s) => !s || /^\+?[\d\s()-]{7,30}$/.test(s), "Enter a valid phone number."),
  address: z.string().trim().max(500),
  city: z.string().trim().max(100)
});
export const contactSchema = z.object({
  name: z.string().trim().min(2, "Enter your name.").max(100),
  email: emailSchema,
  phone: z.string().trim().max(30),
  subject: z.string().trim().min(3, "Enter a subject.").max(150),
  message: z.string().trim().min(10, "Please write at least 10 characters.").max(4000)
});
export const checkoutSchema = z.object({
  full_name: z.string().trim().min(2, "Enter your full name.").max(100),
  phone: z.string().trim().regex(/^\+?[\d\s()-]{7,30}$/, "Enter a valid delivery phone number."),
  address: z.string().trim().min(10, "Enter your full delivery address.").max(500),
  city: z.string().trim().min(2, "Enter your city.").max(100),
  notes: z.string().trim().max(1000)
});
export const orderLinesSchema = z.array(z.object({
  productId: z.string().min(1).max(200),
  variantId: z.string().min(1).max(200),
  quantity: z.number().int().min(1).max(50)
})).min(1).max(50).refine((lines) => new Set(lines.map((line) => `${line.productId}:${line.variantId}`)).size === lines.length, "Your cart contains duplicate items.");
