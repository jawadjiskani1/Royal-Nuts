"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { cartSubtotal, useCart } from "@/store/cart";
import { formatPKR } from "@/lib/format";
import { placeOrder } from "@/lib/actions/orders";
import type { CustomerProfile } from "@/lib/account-types";

export default function CheckoutForm({ profile, email, verified, shippingFee, userId }: { profile: CustomerProfile; email: string; verified: boolean; shippingFee: number; userId: string }) {
  const router = useRouter();
  const { lines, clear } = useCart();
  const [mounted, setMounted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [complete, setComplete] = useState<{ id: string; total: number } | null>(null);
  useEffect(() => setMounted(true), []);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (busy) return;
    setBusy(true); setError("");
    const formData = new FormData(event.currentTarget);
    try {
      // Persist the request key across reloads. Retrying an uncertain response cannot create another order.
      const fingerprint = JSON.stringify({ userId, lines: lines.map(({ productId, variantId, quantity }) => ({ productId, variantId, quantity })), customer: Object.fromEntries(formData) });
      const pending = sessionStorage.getItem("royal-nuts-order-request");
      let request = pending ? JSON.parse(pending) as { fingerprint: string; id: string } : null;
      if (!request || request.fingerprint !== fingerprint) request = { fingerprint, id: crypto.randomUUID() };
      sessionStorage.setItem("royal-nuts-order-request", JSON.stringify(request));
      const result = await placeOrder(lines.map(({ productId, variantId, quantity }) => ({ productId, variantId, quantity })), formData, request.id);
      if (!result.ok) { setError(result.message); return; }
      setComplete({ id: result.id, total: result.total }); clear();
      sessionStorage.removeItem("royal-nuts-order-request"); router.refresh();
    } catch { setError("Could not confirm your order. Please retry; your request is protected against duplicates."); }
    finally { setBusy(false); }
  }
  if (!mounted) return <div className="container-page py-16" role="status">Loading checkout...</div>;
  if (complete) return <div className="container-page py-16"><section className="mx-auto max-w-xl border border-gold bg-white p-8 text-center"><h1 className="text-3xl">Thank you for your order</h1><p className="mt-4">Your cash-on-delivery order has been received.</p><p className="mt-2 font-semibold">Amount due on delivery: {formatPKR(complete.total)}</p><p className="mt-4 break-all text-xs text-ink/60">Order reference: {complete.id}</p><Link href="/account" className="btn-navy mt-6">View your orders</Link></section></div>;
  if (!lines.length) return <div className="container-page py-16 text-center"><h1 className="text-3xl">Your cart is empty</h1><Link href="/shop" className="btn-navy mt-6">Browse the shop</Link></div>;
  return (
    <div className="container-page py-12"><h1 className="text-4xl">Checkout</h1><p className="mt-3 text-sm text-ink/70">Signed in as {email}. Pay cash when your order arrives.</p>
      {!verified && <p role="alert" className="mt-6 border border-gold p-4 text-sm">Please confirm your email before placing an order. <Link href="/account" className="underline">Manage your account</Link></p>}
      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[1.3fr_1fr]">
        <form onSubmit={submit} className="space-y-4 border border-gold/30 bg-white p-6">
          <h2 className="text-2xl">Delivery details</h2>
          <div><label htmlFor="delivery-name" className="mb-1 block text-sm">Full name</label><input id="delivery-name" name="full_name" autoComplete="name" defaultValue={profile.full_name ?? ""} required minLength={2} maxLength={100} className="input" /></div>
          <div><label htmlFor="delivery-phone" className="mb-1 block text-sm">Phone</label><input id="delivery-phone" name="phone" type="tel" autoComplete="tel" defaultValue={profile.phone ?? ""} required minLength={7} maxLength={30} className="input" /></div>
          <div><label htmlFor="delivery-city" className="mb-1 block text-sm">City</label><input id="delivery-city" name="city" autoComplete="address-level2" defaultValue={profile.city ?? ""} required minLength={2} maxLength={100} className="input" /></div>
          <div><label htmlFor="delivery-address" className="mb-1 block text-sm">Street address</label><textarea id="delivery-address" name="address" autoComplete="street-address" defaultValue={profile.address ?? ""} required minLength={10} maxLength={500} rows={3} className="input" /></div>
          <div><label htmlFor="delivery-notes" className="mb-1 block text-sm">Delivery notes (optional)</label><textarea id="delivery-notes" name="notes" maxLength={1000} rows={2} className="input" /></div>
          <p className="text-sm text-ink/70">Payment method: <strong>Cash on delivery</strong></p>
          {error && <p role="alert" className="border border-red-200 p-3 text-sm text-red-800">{error}</p>}
          <button disabled={busy || !verified} className="btn-navy w-full">{busy ? "Placing your order..." : "Place cash-on-delivery order"}</button>
        </form>
        <aside className="border border-gold/30 bg-white p-6"><h2 className="text-2xl">Order summary</h2><ul className="mt-5 space-y-4 text-sm">{lines.map((line) => <li key={`${line.productId}:${line.variantId}`} className="flex justify-between gap-4"><span>{line.name} ? {line.variantLabel} ? {line.quantity}</span><span className="shrink-0">{formatPKR(line.price * line.quantity)}</span></li>)}</ul><div className="mt-5 space-y-2 border-t border-gold/30 pt-4 text-sm"><p className="flex justify-between"><span>Subtotal</span><span>{formatPKR(cartSubtotal(lines))}</span></p><p className="flex justify-between"><span>Delivery</span><span>{shippingFee ? formatPKR(shippingFee) : "Free"}</span></p><p className="flex justify-between font-semibold"><span>Estimated total</span><span>{formatPKR(cartSubtotal(lines) + shippingFee)}</span></p></div><p className="mt-4 text-xs text-ink/60">Prices and availability are checked when you place your order. The confirmation shows your final total.</p><button onClick={() => useCart.getState().setOpen(true)} className="mt-4 text-sm underline decoration-gold">Edit your cart</button></aside>
      </div>
    </div>
  );
}
