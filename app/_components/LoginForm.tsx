"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useConsent } from "./ConsentProvider";
import { useI18n } from "./I18nProvider";

export default function LoginForm({ next, initialError }: { next: string; initialError?: string }) {
  const { m, locale } = useI18n();
  const { ensure, anonId } = useConsent();
  const errors = m.login.errors as Record<string, string>;
  const [email, setEmail] = useState("");
  const [error, setError] = useState(initialError ?? "");
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [devLink, setDevLink] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [google, setGoogle] = useState(false);

  useEffect(() => { fetch("/api/config").then((r) => r.json()).then((c) => setGoogle(Boolean(c.google))).catch(() => {}); }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return setError("bad_email");
    if (!(await ensure(["terms"]))) return setError("consent");
    setBusy(true);
    try {
      const res = await fetch("/api/auth/email/start", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, locale, next, consentTerms: true, anonId: anonId() }),
      });
      const data = await res.json();
      if (!res.ok) return setError(data.error ?? "send_failed");
      setSentTo(email.trim());
      setDevLink(data.devLink ?? null);
    } catch {
      setError("send_failed");
    } finally {
      setBusy(false);
    }
  }

  async function withGoogle() {
    if (await ensure(["terms"])) window.location.assign(`/api/auth/google?next=${encodeURIComponent(next)}`);
    else setError("consent");
  }

  if (sentTo)
    return (
      <div role="status" className="space-y-3">
        <h2 className="font-display text-xl font-bold">{m.login.sent}</h2>
        <p className="text-sm text-muted">{m.login.sentBody(sentTo)}</p>
        <p className="text-xs text-muted">{m.login.spam}</p>
        {devLink && (
          <p className="rounded-2xl bg-warn-bg p-3 text-sm text-warn-ink">
            {m.login.devLink}
            <br />
            <Link href={devLink} className="break-all underline">{devLink}</Link>
          </p>
        )}
        <button className="text-sm text-muted underline" onClick={() => { setSentTo(null); setDevLink(null); }}>{m.login.resend}</button>
      </div>
    );

  return (
    <div className="space-y-4">
      {error && <p role="alert" className="rounded-2xl bg-warn-bg p-3 text-sm text-warn-ink">{errors[error] ?? errors.signin_failed}</p>}
      <form onSubmit={submit} className="space-y-3" noValidate>
        <label className="block text-sm font-semibold" htmlFor="email">{m.login.email}</label>
        <input
          id="email" type="email" inputMode="email" autoComplete="email" placeholder="you@example.com" value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-button border-[1.5px] border-line bg-bg px-4 py-3 text-base outline-none focus:border-ink"
        />
        <button disabled={busy} className="w-full rounded-button bg-ink py-3.5 font-semibold text-bg active:scale-[0.99] disabled:opacity-60">
          {busy ? "…" : m.login.send}
        </button>
      </form>
      {google && (
        <>
          <p className="text-center text-xs text-muted">{m.login.or}</p>
          <button type="button" onClick={withGoogle} className="flex w-full items-center justify-center gap-3 rounded-button border border-ink/15 bg-card py-3.5 font-semibold active:scale-[0.99]">
            <svg viewBox="0 0 48 48" className="size-5" aria-hidden>
              <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.2C12.4 13.6 17.7 9.5 24 9.5z" />
              <path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.4c-.5 2.9-2.2 5.3-4.6 7l7.1 5.5c4.3-4 6.9-9.9 6.9-17z" />
              <path fill="#FBBC05" d="M10.5 28.6a14.5 14.5 0 0 1 0-9.2l-7.9-6.2a24 24 0 0 0 0 21.6l7.9-6.2z" />
              <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.1-5.5c-2 1.4-4.6 2.3-8.8 2.3-6.3 0-11.6-4.1-13.5-9.9l-7.9 6.2C6.5 42.6 14.6 48 24 48z" />
            </svg>
            {m.login.google}
          </button>
        </>
      )}
    </div>
  );
}
