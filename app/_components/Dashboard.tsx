"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { PRODUCTS, hasBuyLink, localized } from "../../lib/products";
import type { Answers } from "../../lib/recommend";
import { notifyCartChanged } from "./cartClient";
import { useI18n } from "./I18nProvider";
import ProductImage from "./ProductImage";

const input = "w-full rounded-button border-[1.5px] border-border bg-bg px-4 py-3 text-base outline-none focus:border-accent";
const primary = "rounded-button bg-ink px-5 py-3 text-sm font-semibold text-bg transition active:scale-[0.99] disabled:opacity-60";
const ghost = "rounded-button border-[1.5px] border-border px-5 py-3 text-sm font-semibold transition hover:border-accent";

// ---------------------------------------------------------------- name + email
export function ProfileCard({ name, email }: { name: string; email: string }) {
  const { m } = useI18n();
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(name);
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");

  async function save() {
    setState("saving");
    const res = await fetch("/api/profile", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify({ name: value }) }).catch(() => null);
    if (!res?.ok) return setState("error");
    setState("saved"); setEditing(false); notifyCartChanged(); router.refresh();
  }

  return (
    <div>
      <dl className="space-y-3 text-sm">
        <div>
          <dt className="eyebrow-faint">{m.dashboard.name}</dt>
          {editing ? (
            <dd className="mt-1.5"><input className={input} value={value} maxLength={60} onChange={(e) => setValue(e.target.value)} aria-label={m.dashboard.name} /></dd>
          ) : (
            <dd className="mt-0.5 text-base font-semibold">{name}</dd>
          )}
        </div>
        <div>
          <dt className="eyebrow-faint">{m.dashboard.email}</dt>
          <dd className="mt-0.5 break-all text-ink-soft">{email}</dd>
        </div>
      </dl>
      <div className="mt-4 flex items-center gap-2">
        {editing ? (
          <>
            <button className={primary} disabled={state === "saving" || value.trim().length < 1} onClick={save}>{state === "saving" ? m.dashboard.saving : m.dashboard.save}</button>
            <button className={ghost} onClick={() => { setEditing(false); setValue(name); setState("idle"); }}>{m.dashboard.cancel}</button>
          </>
        ) : (
          <button className={ghost} onClick={() => setEditing(true)}>{m.dashboard.edit}</button>
        )}
        {state === "saved" && <span role="status" className="text-xs text-accent">{m.dashboard.saved}</span>}
        {state === "error" && <span role="alert" className="text-xs text-danger">{m.dashboard.saveFailed}</span>}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- saved skin profile (survey answers)
export function SkinProfile({ answers }: { answers: Answers | null }) {
  const { m } = useI18n();
  const router = useRouter();
  const qs = m.survey.questions;
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Answers | null>(answers);
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");

  if (!answers || !draft)
    return (
      <div className="space-y-3">
        <p className="text-sm text-ink-soft">{m.dashboard.noSkin}</p>
        <Link href="/try" className={`${primary} inline-block`}>{m.dashboard.takeSurvey}</Link>
      </div>
    );

  const valueOf = (a: Answers, key: string) => (a as unknown as Record<string, unknown>)[key];
  const labels = (a: Answers, q: (typeof qs)[number]) => {
    const v = valueOf(a, q.key);
    const picked = Array.isArray(v) ? v : [v];
    return q.options.filter((o) => picked.includes(o.value)).map((o) => o.label).join(", ");
  };
  const toggle = (q: (typeof qs)[number], value: string | number | boolean) =>
    setDraft((d) => {
      if (!d) return d;
      const cur = valueOf(d, q.key);
      if (q.type === "multi") {
        const list = Array.isArray(cur) ? (cur as unknown[]) : [];
        const next = list.includes(value) ? list.filter((x) => x !== value) : [...list, value];
        return { ...d, [q.key]: next.length ? next : list } as Answers; // keep at least one concern
      }
      return { ...d, [q.key]: value } as Answers;
    });

  async function save() {
    setState("saving");
    const res = await fetch("/api/profile", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify({ answers: draft }) }).catch(() => null);
    if (!res?.ok) return setState("error");
    setState("saved"); setEditing(false); router.refresh();
  }

  function recommend() {
    try { localStorage.setItem("bs_answers", JSON.stringify(answers)); } catch { /* storage unavailable */ }
    window.location.assign("/try?resume=1");
  }

  return (
    <div>
      <p className="mb-3 text-xs text-ink-soft">{m.dashboard.skinSub}</p>
      {editing ? (
        <div className="space-y-4">
          {qs.map((q) => (
            <fieldset key={q.key}>
              <legend className="mb-1.5 text-sm font-semibold">{q.title.replace(/\n/g, " ")}</legend>
              <div className="flex flex-wrap gap-2">
                {q.options.map((o) => {
                  const cur = valueOf(draft, q.key);
                  const on = Array.isArray(cur) ? cur.includes(o.value) : cur === o.value;
                  return (
                    <button
                      key={o.label} type="button" aria-pressed={on} onClick={() => toggle(q, o.value)}
                      className={`rounded-full border-[1.5px] px-3.5 py-1.5 text-sm transition ${on ? "border-accent bg-accent-soft text-accent" : "border-border hover:border-accent"}`}
                    >
                      {o.label}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          ))}
          <div className="flex items-center gap-2">
            <button className={primary} disabled={state === "saving"} onClick={save}>{state === "saving" ? m.dashboard.saving : m.dashboard.save}</button>
            <button className={ghost} onClick={() => { setEditing(false); setDraft(answers); setState("idle"); }}>{m.dashboard.cancel}</button>
            {state === "error" && <span role="alert" className="text-xs text-danger">{m.dashboard.saveFailed}</span>}
          </div>
        </div>
      ) : (
        <>
          <dl className="divide-y divide-border rounded-2xl bg-surface-soft px-4">
            {qs.map((q) => (
              <div key={q.key} className="flex justify-between gap-4 py-2.5 text-[13px]">
                <dt className="shrink-0 font-semibold text-ink-soft">{q.title.replace(/\n/g, " ")}</dt>
                <dd className="text-right font-medium">{labels(answers, q)}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button className={ghost} onClick={() => setEditing(true)}>{m.dashboard.edit}</button>
            <button className={primary} onClick={recommend}>{m.dashboard.recommend}</button>
            {state === "saved" && <span role="status" className="text-xs text-accent">{m.dashboard.saved}</span>}
          </div>
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------- shopping cart
interface Item { productId: string; qty: number; routine: "morning" | "evening" | null }

export function CartList({ initial }: { initial: Item[] }) {
  const { m, locale } = useI18n();
  const [items, setItems] = useState(initial);
  const rows = items.flatMap((i) => { const p = PRODUCTS.find((x) => x.id === i.productId); return p ? [{ ...i, p }] : []; });
  const total = rows.reduce((s, r) => s + r.p.price * r.qty, 0);
  const won = (n: number) => `${n.toLocaleString()}${locale === "ko" ? m.common.won : " KRW"}`;

  async function change(productId: string, qty: number) {
    const q = Math.min(9, Math.max(1, qty));
    setItems((cur) => cur.map((i) => (i.productId === productId ? { ...i, qty: q } : i)));
    await fetch("/api/cart", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ productId, qty: q }) }).catch(() => {});
    notifyCartChanged();
  }
  async function remove(productId: string) {
    setItems((cur) => cur.filter((i) => i.productId !== productId));
    await fetch(`/api/cart?productId=${encodeURIComponent(productId)}`, { method: "DELETE" }).catch(() => {});
    notifyCartChanged();
  }
  async function clear() {
    setItems([]);
    await fetch("/api/cart", { method: "DELETE" }).catch(() => {});
    notifyCartChanged();
  }

  if (rows.length === 0)
    return (
      <div className="space-y-3">
        <p className="text-sm font-semibold">{m.cart.empty}</p>
        <p className="text-sm text-ink-soft">{m.cart.emptyHint}</p>
        <Link href="/try" className={`${primary} inline-block`}>{m.account.tryNow}</Link>
      </div>
    );

  return (
    <div>
      <ul className="space-y-3">
        {rows.map(({ p, qty, routine }) => {
          const text = localized(p, locale);
          return (
            <li key={p.id} className="rounded-product border-[1.5px] border-border p-3.5">
              <div className="flex gap-3">
                <Link href={`/products/${p.id}`} className="shrink-0"><ProductImage product={p} locale={locale} className="size-16 rounded-xl border border-border" /></Link>
                <div className="min-w-0 flex-1">
                  <p className="eyebrow-faint !text-[10.5px]">{m.result.steps[p.step]}{routine ? ` · ${m.cart.from[routine]}` : ""}</p>
                  <Link href={`/products/${p.id}`} className="mt-0.5 block text-sm font-bold leading-snug hover:text-accent">{text.name}</Link>
                  <p className="mt-1 text-sm">{won(p.price)} <span className="text-ink-faint">× {qty}</span> <span className="font-semibold">= {won(p.price * qty)}</span></p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1" role="group" aria-label={m.cart.qty}>
                  <button className="size-8 rounded-full border border-border text-base disabled:opacity-40" disabled={qty <= 1} onClick={() => change(p.id, qty - 1)} aria-label="−">−</button>
                  <span className="w-7 text-center text-sm font-semibold" aria-live="polite">{qty}</span>
                  <button className="size-8 rounded-full border border-border text-base disabled:opacity-40" disabled={qty >= 9} onClick={() => change(p.id, qty + 1)} aria-label="+">+</button>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Link href={`/products/${p.id}`} className="underline">{m.cart.viewProduct}</Link>
                  {hasBuyLink(p) ? (
                    <a href={p.url} target="_blank" rel="sponsored noopener noreferrer" className="font-semibold text-accent">{m.cart.buy}</a>
                  ) : (
                    <span className="text-xs text-ink-faint">{m.cart.noLink}</span>
                  )}
                  <button className="text-danger underline" onClick={() => remove(p.id)}>{m.cart.remove}</button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
      <p className="mt-4 flex items-baseline justify-between border-t border-border pt-3 text-sm">
        <span className="text-ink-soft">{m.cart.total}</span>
        <span className="text-lg font-bold">{won(total)}</span>
      </p>
      <p className="mt-2 text-xs text-ink-soft">{m.cart.note}</p>
      <button className="mt-3 text-sm text-ink-soft underline" onClick={clear}>{m.cart.clear}</button>
    </div>
  );
}
