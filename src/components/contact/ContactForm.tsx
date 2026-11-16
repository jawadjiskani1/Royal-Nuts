"use client";
import { useActionState, useEffect, useRef } from "react";
import { sendContact } from "@/lib/actions/contact";

export default function ContactForm() {
  const [state, action, pending] = useActionState(sendContact, null);
  const form = useRef<HTMLFormElement>(null);
  useEffect(() => { if (state?.ok) form.current?.reset(); }, [state]);
  return (
    <form ref={form} action={action} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div><label htmlFor="contact-name" className="mb-1 block text-sm">Your name</label><input id="contact-name" name="name" autoComplete="name" required minLength={2} maxLength={100} className="input" /></div>
        <div><label htmlFor="contact-email" className="mb-1 block text-sm">Email</label><input id="contact-email" name="email" type="email" autoComplete="email" required maxLength={200} className="input" /></div>
      </div>
      <div><label htmlFor="contact-phone" className="mb-1 block text-sm">Phone (optional)</label><input id="contact-phone" name="phone" type="tel" autoComplete="tel" maxLength={30} className="input" /></div>
      <div><label htmlFor="contact-subject" className="mb-1 block text-sm">Subject</label><input id="contact-subject" name="subject" required minLength={3} maxLength={150} className="input" /></div>
      <div><label htmlFor="contact-message" className="mb-1 block text-sm">Message</label><textarea id="contact-message" name="message" required minLength={10} maxLength={4000} rows={5} className="input" /></div>
      <div className="hidden" aria-hidden="true"><label htmlFor="contact-website">Website</label><input id="contact-website" name="website" tabIndex={-1} autoComplete="off" /></div>
      {state && <p role={state.ok ? "status" : "alert"} className={`border p-3 text-sm ${state.ok ? "border-forest/20 text-forest" : "border-red-200 text-red-800"}`}>{state.message}</p>}
      <button className="btn-navy" disabled={pending}>{pending ? "Sending..." : "Send message"}</button>
    </form>
  );
}
