"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { friendlyAuthError } from "@/lib/auth-errors";
import { saveProfile } from "@/lib/actions/account";
import { formatPKR } from "@/lib/format";
import type { CustomerProfile, CustomerOrder } from "@/lib/account-types";

export default function AccountDashboard({ email, verified, profile, orders, loadError }: {
  email: string; verified: boolean; profile: CustomerProfile; orders: CustomerOrder[]; loadError: boolean;
}) {
  const router = useRouter();
  const { signOut, resendVerification } = useAuth();
  const [note, setNote] = useState<{ ok: boolean; message: string } | null>(null);
  const [busy, setBusy] = useState(false);
  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setNote(null);
    const formData = new FormData(event.currentTarget);
    try { setNote(await saveProfile(formData)); router.refresh(); }
    catch { setNote({ ok: false, message: "Could not save your details. Please try again." }); }
    finally { setBusy(false); }
  }
  async function out() {
    setBusy(true); setNote(null);
    try { await signOut(); router.replace("/login"); router.refresh(); }
    catch (error) { setNote({ ok: false, message: friendlyAuthError(error) }); }
    finally { setBusy(false); }
  }
  async function resend() {
    setBusy(true); setNote(null);
    try { await resendVerification(email); setNote({ ok: true, message: "Confirmation email requested. Please check your inbox." }); }
    catch (error) { setNote({ ok: false, message: friendlyAuthError(error) }); }
    finally { setBusy(false); }
  }
  return (
    <div className="container-page py-10 sm:py-14">
      <div className="flex flex-wrap items-center justify-between gap-4"><div><h1 className="text-4xl">Your account</h1><p className="mt-2 text-sm text-ink/70">Manage your details and view your orders.</p></div><button onClick={out} disabled={busy} className="btn-outline-dark">Sign out</button></div>
      {loadError && <p role="alert" className="mt-6 border border-gold bg-white p-4 text-sm">Some account details could not be loaded. Please refresh or try again later.</p>}
      {note && <p role={note.ok ? "status" : "alert"} className={`mt-6 border p-3 text-sm ${note.ok ? "border-forest/20 text-forest" : "border-red-200 text-red-800"}`}>{note.message}</p>}
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_1.3fr]">
        <section className="border border-gold/30 bg-white p-6" aria-labelledby="profile-title">
          <h2 id="profile-title" className="text-2xl">Your details</h2>
          <p className="mt-3 break-all text-sm">{email}</p><p className="mt-1 text-xs text-ink/60">{verified ? "Email verified" : "Email verification required"}</p>
          {!verified && <button onClick={resend} disabled={busy} className="mt-3 text-sm underline decoration-gold">Resend confirmation email</button>}
          <form onSubmit={save} className="mt-6 space-y-4">
            <div><label htmlFor="profile-name" className="mb-1 block text-sm">Full name</label><input id="profile-name" name="full_name" defaultValue={profile.full_name ?? ""} autoComplete="name" required minLength={2} maxLength={100} className="input" /></div>
            <div><label htmlFor="profile-phone" className="mb-1 block text-sm">Phone</label><input id="profile-phone" name="phone" defaultValue={profile.phone ?? ""} type="tel" autoComplete="tel" maxLength={30} className="input" /></div>
            <div><label htmlFor="profile-city" className="mb-1 block text-sm">City</label><input id="profile-city" name="city" defaultValue={profile.city ?? ""} autoComplete="address-level2" maxLength={100} className="input" /></div>
            <div><label htmlFor="profile-address" className="mb-1 block text-sm">Delivery address</label><textarea id="profile-address" name="address" defaultValue={profile.address ?? ""} autoComplete="street-address" maxLength={500} rows={3} className="input" /></div>
            <button disabled={busy} className="btn-navy">{busy ? "Please wait..." : "Save details"}</button>
          </form>
          <Link href="/update-password" className="mt-5 inline-block text-sm underline decoration-gold">Change password</Link>
        </section>
        <section aria-labelledby="orders-title"><h2 id="orders-title" className="text-2xl">Your orders</h2>
          {orders.length === 0 ? <div className="mt-4 border border-gold/30 bg-white p-6"><p className="text-sm text-ink/70">{loadError ? "Order history is temporarily unavailable." : "You have not placed an order yet."}</p><Link href="/shop" className="btn-navy mt-5">Browse the shop</Link></div> :
          <ul className="mt-4 space-y-4">{orders.map((order) => <li key={order.id} className="border border-gold/30 bg-white p-5">
            <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-sm font-semibold">Order {order.id.slice(0, 8).toUpperCase()}</p><p className="mt-1 text-xs text-ink/60">{new Date(order.created_at).toLocaleDateString("en-PK", { timeZone: "Asia/Karachi", dateStyle: "medium" })}</p></div><span className="bg-gold/20 px-3 py-1 text-xs capitalize">{order.status.replaceAll("_", " ")}</span></div>
            <ul className="mt-4 space-y-2 text-sm">{order.items.map((item) => <li key={`${item.productId}:${item.variantId}`} className="flex justify-between gap-3"><span>{item.name} ? {item.variantLabel} ? {item.quantity}</span><span className="shrink-0">{formatPKR(item.price * item.quantity)}</span></li>)}</ul>
            <div className="mt-4 border-t border-gold/20 pt-3 text-sm"><p className="flex justify-between"><span>Delivery</span><span>{Number(order.shipping_fee) === 0 ? "Free" : formatPKR(Number(order.shipping_fee))}</span></p><p className="mt-1 flex justify-between font-semibold"><span>Cash on delivery total</span><span>{formatPKR(Number(order.total))}</span></p></div>
            <p className="mt-3 break-all text-xs text-ink/50">Reference: {order.id}</p>
          </li>)}</ul>}
        </section>
      </div>
    </div>
  );
}
