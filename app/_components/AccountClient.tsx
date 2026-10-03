"use client";

import { useRouter } from "next/navigation";
import { PURPOSES } from "../../consent/purposes";
import { useConsent } from "./ConsentProvider";
import { useI18n } from "./I18nProvider";

export function DeleteRoutine({ id }: { id: string }) {
  const { m } = useI18n();
  const router = useRouter();
  return (
    <button
      className="text-sm text-danger underline"
      onClick={async () => { await fetch(`/api/routines?id=${id}`, { method: "DELETE" }); router.refresh(); }}
    >
      {m.account.delete}
    </button>
  );
}

export function AccountData() {
  const { m } = useI18n();
  const { store, has, withdraw, ensure } = useConsent();
  const router = useRouter();

  async function removeAccount() {
    if (!window.confirm(m.account.deleteConfirm)) return;
    await fetch("/api/account", { method: "DELETE" });
    try { localStorage.removeItem("bs_consent"); localStorage.removeItem("bs_answers"); } catch { /* ignore */ }
    window.location.assign("/");
  }

  return (
    <div className="space-y-5">
      <ul className="space-y-2">
        {PURPOSES.map((p) => (
          <li key={p} className="flex items-start justify-between gap-3 rounded-2xl border border-border p-3 text-sm">
            <span>
              <span className="font-semibold">{m.consent.purposes[p].label}</span>
              <span className="mt-0.5 block text-xs text-ink-soft">{has(p) ? "✓" : store[p] ? "✕" : "–"} {store[p]?.at?.slice(0, 10) ?? ""}</span>
            </span>
            {has(p) ? (
              <button className="shrink-0 text-xs underline" onClick={() => withdraw(p)}>{m.consent.withdraw}</button>
            ) : (
              <button className="shrink-0 text-xs underline" onClick={() => ensure([p])}>{m.consent.give}</button>
            )}
          </li>
        ))}
      </ul>
      <div className="grid gap-2">
        <a href="/api/account/export" className="rounded-button border border-border bg-surface py-3 text-center font-semibold">{m.account.export}</a>
        <button onClick={removeAccount} className="rounded-button border border-danger/40 py-3 font-semibold text-danger">{m.account.deleteAccount}</button>
        <button onClick={async () => { await fetch("/api/auth/logout", { method: "POST" }); router.push("/"); router.refresh(); }} className="py-2 text-sm text-ink-soft">{m.common.logout}</button>
      </div>
    </div>
  );
}
