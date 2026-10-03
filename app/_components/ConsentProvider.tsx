"use client";

import Link from "next/link";
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { CONSENT_VERSIONS, REQUIRED, granted, decided, type ConsentStore, type Purpose } from "../../consent/purposes";
import { useI18n } from "./I18nProvider";

const STORE_KEY = "bs_consent";
const ANON_KEY = "bs_anon";

interface Api {
  /** Resolves true if every purpose is (or becomes) granted. Shows the consent popup only when needed. */
  ensure(purposes: Purpose[], opts?: { skipIfDeclined?: boolean }): Promise<boolean>;
  has(purpose: Purpose): boolean;
  withdraw(purpose: Purpose): void;
  store: ConsentStore;
  anonId(): string;
}

const Ctx = createContext<Api | null>(null);
export const useConsent = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("ConsentProvider missing");
  return c;
};

function readStore(): ConsentStore {
  try { return JSON.parse(localStorage.getItem(STORE_KEY) ?? "{}") as ConsentStore; } catch { return {}; }
}
function anon(): string {
  try {
    let id = localStorage.getItem(ANON_KEY);
    if (!id) { id = crypto.randomUUID(); localStorage.setItem(ANON_KEY, id); }
    return id;
  } catch { return "unknown"; }
}

export function ConsentProvider({ children }: { children: ReactNode }) {
  const { m } = useI18n();
  const [store, setStore] = useState<ConsentStore>({});
  const [pending, setPending] = useState<Purpose[] | null>(null);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const resolver = useRef<((ok: boolean) => void) | null>(null);
  const storeRef = useRef<ConsentStore>({});

  useEffect(() => { const s = readStore(); storeRef.current = s; setStore(s); }, []);

  const commit = useCallback((items: { purpose: Purpose; granted: boolean }[]) => {
    const next: ConsentStore = { ...storeRef.current };
    const at = new Date().toISOString();
    for (const i of items) next[i.purpose] = { granted: i.granted, version: CONSENT_VERSIONS[i.purpose], at };
    storeRef.current = next;
    setStore(next);
    try { localStorage.setItem(STORE_KEY, JSON.stringify(next)); } catch { /* storage unavailable */ }
    fetch("/api/consent", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ items, anonId: anon() }) }).catch(() => {});
  }, []);

  const ensure = useCallback<Api["ensure"]>((purposes, opts) => {
    const s = storeRef.current;
    if (purposes.every((p) => granted(s, p))) return Promise.resolve(true);
    if (opts?.skipIfDeclined && purposes.every((p) => decided(s, p))) return Promise.resolve(false);
    const need = purposes.filter((p) => !granted(s, p));
    setChecked({});
    setPending(need);
    return new Promise<boolean>((resolve) => { resolver.current = resolve; });
  }, []);

  const finish = (ok: boolean) => {
    if (pending) commit(pending.map((purpose) => ({ purpose, granted: ok })));
    setPending(null);
    resolver.current?.(ok);
    resolver.current = null;
  };

  const api: Api = {
    ensure,
    has: (p) => granted(store, p),
    withdraw: (p) => commit([{ purpose: p, granted: false }]),
    store,
    anonId: anon,
  };
  const allChecked = pending?.every((p) => checked[p]) ?? false;

  return (
    <Ctx.Provider value={api}>
      {children}
      {pending && (
        <div className="fixed inset-0 z-50 grid items-end bg-ink/50 p-0 sm:place-items-center sm:p-4" role="dialog" aria-modal="true" aria-labelledby="consent-title">
          <div className="max-h-[92dvh] w-full overflow-y-auto rounded-t-card bg-card p-6 sm:max-w-md sm:rounded-card">
            <h2 id="consent-title" className="font-display text-xl font-bold">{m.consent.title}</h2>
            <p className="mt-1 text-sm text-muted">{m.consent.intro}</p>
            <div className="mt-4 space-y-3">
              {pending.map((p) => (
                <label key={p} className="flex gap-3 rounded-2xl border border-line p-3">
                  <input type="checkbox" className="mt-1 size-4 shrink-0 accent-sage" checked={Boolean(checked[p])} onChange={(e) => setChecked((c) => ({ ...c, [p]: e.target.checked }))} />
                  <span className="text-sm">
                    <span className="font-semibold">{m.consent.purposes[p].label}</span>
                    <span className={`ml-2 rounded-full px-2 py-0.5 text-[11px] ${REQUIRED[p] ? "bg-brand-soft text-brand" : "bg-sage-soft text-sage"}`}>{REQUIRED[p] ? m.consent.required : m.consent.optional}</span>
                    <span className="mt-1 block text-muted">{m.consent.purposes[p].body}</span>
                    {p === "terms" && (
                      <span className="mt-1 block text-xs">
                        <Link href="/terms" target="_blank" className="underline">{m.nav.terms}</Link> · <Link href="/privacy" target="_blank" className="underline">{m.nav.privacy}</Link>
                      </span>
                    )}
                    <span className="mt-1 block text-[11px] text-muted/80">{m.consent.version} {CONSENT_VERSIONS[p]}</span>
                  </span>
                </label>
              ))}
            </div>
            <div className="mt-5 grid gap-2">
              <button disabled={!allChecked} onClick={() => finish(true)} className="rounded-button bg-ink py-3.5 font-semibold text-bg transition enabled:active:scale-[0.99] disabled:opacity-40">{m.consent.agree}</button>
              <button onClick={() => finish(false)} className="py-2 text-sm text-muted">{m.consent.decline}</button>
            </div>
          </div>
        </div>
      )}
    </Ctx.Provider>
  );
}
