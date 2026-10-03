"use client";

import { useState } from "react";
import { useConsent } from "./ConsentProvider";
import { useI18n } from "./I18nProvider";

// Mock newsletter: validates, asks for marketing consent, and shows a confirmation. Stores and sends nothing.
export default function Newsletter() {
  const { m } = useI18n();
  const { ensure } = useConsent();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError(m.newsletter.badEmail);
    if (!(await ensure(["marketing"]))) return setError(m.newsletter.needConsent);
    setError("");
    setDone(true);
  }

  return (
    <section id="newsletter" className="rounded-card bg-surface p-6 shadow-phone">
      <p className="eyebrow">{m.newsletter.label}</p>
      <h2 className="mt-1 font-display text-xl font-semibold">{m.newsletter.title}</h2>
      <p className="mt-1 text-sm text-ink-soft">{m.newsletter.body}</p>

      <div className="mt-4 rounded-2xl bg-accent-soft p-4">
        <p className="text-[11px] font-semibold text-accent">{m.newsletter.sampleLabel}</p>
        <p className="mt-1 text-sm font-semibold">{m.newsletter.sampleTitle}</p>
        <p className="mt-1 text-xs text-ink-soft">{m.newsletter.sampleBody}</p>
      </div>

      {done ? (
        <p role="status" className="mt-4 rounded-2xl bg-warn-soft border border-dashed border-warn p-4 text-sm text-ink">{m.newsletter.done}</p>
      ) : (
        <form onSubmit={submit} className="mt-4 space-y-3" noValidate>
          <input
            type="email" inputMode="email" autoComplete="email" placeholder={m.newsletter.placeholder} value={email}
            onChange={(e) => setEmail(e.target.value)} aria-label="email"
            className="w-full rounded-button border-[1.5px] border-border bg-bg px-4 py-3 text-base outline-none focus:border-accent"
          />
          {error && <p role="alert" className="text-sm text-danger">{error}</p>}
          <button className="w-full rounded-button bg-ink py-3.5 font-semibold text-bg active:scale-[0.99]">{m.newsletter.submit}</button>
        </form>
      )}
    </section>
  );
}
