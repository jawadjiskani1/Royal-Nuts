"use client";
import { useActionState } from "react";
import { subscribe, type NewsletterState } from "@/lib/actions/newsletter";

export default function NewsletterForm() {
  const [state, action, pending] = useActionState<NewsletterState | null, FormData>(subscribe, null);
  return (
    <form action={action} className="mx-auto mt-6 flex max-w-md flex-col gap-3 sm:flex-row sm:flex-wrap">
      <label htmlFor="nl-email" className="sr-only">Email address</label>
      <input id="nl-email" name="email" type="email" required placeholder="Your email address" className="input flex-1" />
      <button className="btn-gold" disabled={pending}>{pending ? "Subscribing" : "Subscribe"}</button>
      {state && (
        <p role="status" className={`text-sm sm:basis-full ${state.ok ? "text-gold-light" : "text-red-300"}`}>{state.message}</p>
      )}
    </form>
  );
}
