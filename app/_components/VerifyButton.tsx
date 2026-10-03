"use client";

import Link from "next/link";
import { useState } from "react";
import { useI18n } from "./I18nProvider";

export default function VerifyButton({ token, next }: { token: string; next: string }) {
  const { m } = useI18n();
  const [state, setState] = useState<"idle" | "working" | "invalid">("idle");

  async function confirm() {
    setState("working");
    const res = await fetch("/api/auth/email/verify", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ token, next }) }).catch(() => null);
    if (!res?.ok) return setState("invalid");
    const data = await res.json();
    window.location.assign(data.next ?? "/");
  }

  if (state === "invalid")
    return (
      <div className="space-y-3">
        <p role="alert" className="rounded-2xl bg-warn-bg p-3 text-sm text-warn-ink">{m.verify.invalid}</p>
        <Link href="/login" className="block rounded-button border border-ink/15 bg-card py-3 text-center font-semibold">{m.verify.back}</Link>
      </div>
    );
  return (
    <button onClick={confirm} disabled={state === "working"} className="w-full rounded-button bg-ink py-3.5 font-semibold text-bg active:scale-[0.99] disabled:opacity-60">
      {state === "working" ? m.verify.working : m.verify.confirm}
    </button>
  );
}
