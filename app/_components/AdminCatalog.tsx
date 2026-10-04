"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CONCERNS, type Concern, type Product, type Step } from "../../lib/products";
import { guessStep } from "../../retailer/match";
import { useI18n } from "./I18nProvider";
import ProductImage from "./ProductImage";

interface Cand { naverProductId: string; title: string; image: string; link: string; price: number; mall: string; brand: string; maker: string; category: string[]; score: number; suggested: boolean }
type Info = Record<string, { approved: boolean; price: number; mall: string; at: string }>;

const input = "w-full rounded-xl border-[1.5px] border-border bg-bg px-3 py-2.5 text-sm outline-none focus:border-accent";
const btn = "rounded-xl border-[1.5px] border-border px-3 py-2 text-sm font-semibold transition hover:border-accent disabled:opacity-50";
const btnPrimary = "rounded-xl bg-ink px-3 py-2 text-sm font-semibold text-bg transition active:scale-[0.99] disabled:opacity-50";

// ------------------------------------------------------------------ search Naver and pick a result
function SearchPanel({ initialQuery, brand, pickLabel, onPick, onClose }: { initialQuery: string; brand?: string; pickLabel: string; onPick: (c: Cand) => Promise<void> | void; onClose?: () => void }) {
  const { m } = useI18n();
  const errors = m.admin.errors as Record<string, string>;
  const [q, setQ] = useState(initialQuery);
  const [state, setState] = useState<"idle" | "loading">("idle");
  const [error, setError] = useState("");
  const [results, setResults] = useState<Cand[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  async function search() {
    setState("loading"); setError(""); setResults(null);
    const res = await fetch(`/api/admin/naver?query=${encodeURIComponent(q)}${brand ? `&brand=${encodeURIComponent(brand)}` : ""}`).catch(() => null);
    const data = await res?.json().catch(() => null);
    setState("idle");
    if (!res?.ok) return setError(errors[data?.error] ?? m.admin.failed);
    setResults(data.candidates);
  }

  return (
    <div className="mt-3 rounded-2xl bg-surface-soft p-3.5">
      <form onSubmit={(e) => { e.preventDefault(); search(); }} className="flex gap-2">
        <input className={input} value={q} onChange={(e) => setQ(e.target.value)} aria-label={m.admin.search} />
        <button className={btnPrimary} disabled={state === "loading" || !q.trim()}>{state === "loading" ? m.admin.searching : m.admin.search}</button>
      </form>
      {error && <p role="alert" className="mt-2 text-xs text-danger">{error}</p>}
      {results && results.length === 0 && <p className="mt-2 text-xs text-ink-soft">{m.admin.noResults}</p>}
      <ul className="mt-3 space-y-2.5">
        {results?.map((c) => (
          <li key={c.naverProductId + c.link} className="flex gap-3 rounded-xl bg-surface p-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={c.image} alt="" referrerPolicy="no-referrer" loading="lazy" className="size-16 shrink-0 rounded-lg border border-border object-cover" />
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-semibold leading-snug">{c.title}</p>
              <p className="mt-0.5 text-xs text-ink-soft">{c.price.toLocaleString()}원 · {c.mall || "—"}{c.brand ? ` · ${c.brand}` : ""}</p>
              <p className="mt-0.5 text-[11px] text-ink-faint">
                {m.admin.score} {Math.min(100, Math.round(c.score * 100))}%{c.suggested && <span className="ml-2 rounded-full bg-accent-soft px-2 py-0.5 font-semibold text-accent">{m.admin.suggested}</span>}
              </p>
              <button className={`${btnPrimary} mt-2`} disabled={busy !== null} onClick={async () => { setBusy(c.link); await onPick(c); setBusy(null); }}>{pickLabel}</button>
            </div>
          </li>
        ))}
      </ul>
      {onClose && <button className="mt-3 text-xs text-ink-soft underline" onClick={onClose}>{m.admin.close}</button>}
    </div>
  );
}

// ------------------------------------------------------------------ one product
function Row({ p, info, naverReady }: { p: Product; info?: Info[string]; naverReady: boolean }) {
  const { m, locale } = useI18n();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState("");
  const linked = info?.approved;
  const name = locale === "en" ? p.en.name : p.name;

  async function call(url: string, init: RequestInit) {
    const res = await fetch(url, { ...init, headers: { "content-type": "application/json" } }).catch(() => null);
    const data = await res?.json().catch(() => null);
    return { ok: Boolean(res?.ok), data };
  }
  async function pick(c: Cand) {
    const r = await call("/api/admin/listings", { method: "POST", body: JSON.stringify({ productId: p.id, candidate: c }) });
    setMsg(r.ok ? m.admin.saved : (m.admin.errors as Record<string, string>)[r.data?.error] ?? m.admin.failed);
    if (r.ok) { setOpen(false); router.refresh(); }
  }

  return (
    <li className="rounded-product border-[1.5px] border-border p-3.5">
      <div className="flex gap-3">
        <ProductImage product={p} locale={locale} className="size-16 shrink-0 rounded-xl border border-border" />
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-bold leading-snug">{name}</p>
          <p className="mt-0.5 text-[11px] text-ink-faint">
            <span className={`mr-1.5 rounded-full px-2 py-0.5 font-semibold ${p.real ? "bg-accent-soft text-accent" : "bg-surface-soft text-ink-soft"}`}>{p.real ? m.admin.real : m.admin.sample}</span>
            {p.id} · {p.step}
          </p>
          <p className="mt-1 text-xs text-ink-soft">{linked ? m.admin.linked(`${p.price.toLocaleString()}원`, info!.mall || "—", info!.at) : m.admin.notLinked}</p>
        </div>
      </div>
      <div className="mt-2.5 flex flex-wrap items-center gap-2">
        <button className={btn} disabled={!naverReady} onClick={() => setOpen((o) => !o)}>{m.admin.find}</button>
        {linked && <button className={btn} onClick={async () => { const r = await call("/api/admin/listings/refresh", { method: "POST", body: JSON.stringify({ productId: p.id }) }); setMsg(r.ok ? m.admin.refreshed(r.data.updated.length, r.data.missing.length) : m.admin.failed); router.refresh(); }}>{m.admin.refresh}</button>}
        {linked && <button className={btn} onClick={async () => { await call(`/api/admin/listings?productId=${p.id}`, { method: "DELETE" }); router.refresh(); }}>{m.admin.unlink}</button>}
        {/^n[a-z0-9]{3,12}$/.test(p.id) && <button className="text-xs text-danger underline" onClick={async () => { if (window.confirm(m.admin.removeConfirm)) { await call(`/api/admin/products?id=${p.id}`, { method: "DELETE" }); router.refresh(); } }}>{m.admin.remove}</button>}
        {msg && <span role="status" className="text-xs text-accent">{msg}</span>}
      </div>
      {open && <SearchPanel initialQuery={p.name} brand={p.brand} pickLabel={m.admin.use} onPick={pick} onClose={() => setOpen(false)} />}
    </li>
  );
}

// ------------------------------------------------------------------ add a real product
const STEPS: Step[] = ["cleanser", "toner", "serum", "moisturizer", "sunscreen"];
const GRADES = ["unrated", "clinical", "multiple", "brand", "emerging"] as const;

function AddProduct() {
  const { m } = useI18n();
  const router = useRouter();
  const f = m.admin.form;
  const errors = m.admin.errors as Record<string, string>;
  const [cand, setCand] = useState<Cand | null>(null);
  const [form, setForm] = useState({ name: "", nameEn: "", brand: "", step: "" as Step | "", concerns: [] as Concern[], texture: "light", time: "both", price: 0, grade: "unrated", evidence: "", evidenceEn: "", fragranceFree: false, vegan: false, sensitiveSafe: false });
  const [msg, setMsg] = useState("");

  const choose = (c: Cand) => {
    setCand(c); setMsg("");
    setForm((x) => ({ ...x, name: c.title.slice(0, 100), nameEn: c.title.slice(0, 100), brand: c.brand || c.maker, price: c.price, step: guessStep(c.category, c.title) ?? "" }));
  };
  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => setForm((x) => ({ ...x, [k]: v }));

  async function save() {
    const res = await fetch("/api/admin/products", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ product: form, candidate: cand }) }).catch(() => null);
    const data = await res?.json().catch(() => null);
    if (!res?.ok) return setMsg(errors[data?.error] ?? m.admin.failed);
    setMsg(m.admin.saved); setCand(null); router.refresh();
  }

  const label = "mb-1 block text-xs font-semibold text-ink-soft";
  return (
    <section className="rounded-card bg-surface p-5 shadow-phone">
      <h2 className="font-display text-xl font-semibold">{m.admin.add}</h2>
      <p className="mt-1 text-xs text-ink-soft">{m.admin.addSub}</p>
      {!cand ? (
        <SearchPanel initialQuery="" pickLabel={m.admin.create} onPick={choose} />
      ) : (
        <div className="mt-3 space-y-3">
          <div className="flex gap-3 rounded-xl bg-surface-soft p-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={cand.image} alt="" referrerPolicy="no-referrer" className="size-16 shrink-0 rounded-lg border border-border object-cover" />
            <p className="text-xs">{cand.title}<br /><span className="text-ink-soft">{cand.price.toLocaleString()}원 · {cand.mall}</span></p>
          </div>
          <div><label className={label}>{f.name}</label><input className={input} value={form.name} onChange={(e) => set("name", e.target.value)} /></div>
          <div><label className={label}>{f.nameEn}</label><input className={input} value={form.nameEn} onChange={(e) => set("nameEn", e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={label}>{f.brand}</label><input className={input} value={form.brand} onChange={(e) => set("brand", e.target.value)} /></div>
            <div><label className={label}>{f.price}</label><input className={input} type="number" value={form.price} onChange={(e) => set("price", Number(e.target.value))} /></div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div><label className={label}>{f.step}</label>
              <select className={input} value={form.step} onChange={(e) => set("step", e.target.value as Step)}>
                <option value="">—</option>{STEPS.map((s) => <option key={s} value={s}>{m.result.steps[s]}</option>)}
              </select></div>
            <div><label className={label}>{f.texture}</label>
              <select className={input} value={form.texture} onChange={(e) => set("texture", e.target.value)}><option value="light">{m.product.attrs.light}</option><option value="rich">{m.product.attrs.rich}</option></select></div>
            <div><label className={label}>{f.time}</label>
              <select className={input} value={form.time} onChange={(e) => set("time", e.target.value)}><option value="both">{m.product.time.both}</option><option value="am">{m.product.time.am}</option><option value="pm">{m.product.time.pm}</option></select></div>
          </div>
          <fieldset>
            <legend className={label}>{f.concerns}</legend>
            <div className="flex flex-wrap gap-2">
              {CONCERNS.map((c) => {
                const on = form.concerns.includes(c);
                return <button key={c} type="button" aria-pressed={on} onClick={() => set("concerns", on ? form.concerns.filter((x) => x !== c) : [...form.concerns, c])} className={`rounded-full border-[1.5px] px-3 py-1.5 text-xs transition ${on ? "border-accent bg-accent-soft text-accent" : "border-border"}`}>{m.result.concerns[c]}</button>;
              })}
            </div>
          </fieldset>
          <div className="flex flex-wrap gap-4 text-sm">
            {([["fragranceFree", f.fragranceFree], ["vegan", f.vegan], ["sensitiveSafe", f.lowIrritation]] as const).map(([k, l]) => (
              <label key={k} className="flex items-center gap-2"><input type="checkbox" className="accent-accent" checked={form[k]} onChange={(e) => set(k, e.target.checked)} />{l}</label>
            ))}
          </div>
          <div><label className={label}>{f.grade}</label>
            <select className={input} value={form.grade} onChange={(e) => set("grade", e.target.value)}>{GRADES.map((g) => <option key={g} value={g}>{m.result.grades[g]}</option>)}</select></div>
          <div><label className={label}>{f.evidence}</label><textarea className={input} rows={2} value={form.evidence} onChange={(e) => set("evidence", e.target.value)} /></div>
          <div><label className={label}>{f.evidenceEn}</label><textarea className={input} rows={2} value={form.evidenceEn} onChange={(e) => set("evidenceEn", e.target.value)} /></div>
          <div className="flex items-center gap-3">
            <button className={btnPrimary} onClick={save}>{f.save}</button>
            <button className="text-sm text-ink-soft underline" onClick={() => setCand(null)}>{m.admin.close}</button>
          </div>
        </div>
      )}
      {msg && <p role="status" className="mt-2 text-xs text-accent">{msg}</p>}
    </section>
  );
}

// ------------------------------------------------------------------ page
export default function AdminCatalog({ products, info, naverReady, hideSamples }: { products: Product[]; info: Info; naverReady: boolean; hideSamples: boolean }) {
  const { m } = useI18n();
  const router = useRouter();
  const [msg, setMsg] = useState("");
  const real = products.filter((p) => p.real);
  const samples = products.filter((p) => !p.real);

  return (
    <div className="space-y-5">
      <p className={`rounded-2xl border border-dashed px-4 py-3 text-sm ${naverReady ? "border-accent bg-accent-soft text-ink" : "border-warn bg-warn-soft text-ink"}`}>
        {naverReady ? `✓ ${m.admin.naverOn}` : `⚠ ${m.admin.naverOff}`}
      </p>

      <section className="rounded-card bg-surface p-5 shadow-phone">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-display text-xl font-semibold">{m.admin.products} ({real.length}{hideSamples ? "" : ` + ${samples.length}`})</h2>
          <button className={btn} disabled={!naverReady} onClick={async () => { const r = await fetch("/api/admin/listings/refresh", { method: "POST", headers: { "content-type": "application/json" }, body: "{}" }).catch(() => null); const d = await r?.json().catch(() => null); setMsg(r?.ok ? m.admin.refreshed(d.updated.length, d.missing.length) : m.admin.failed); router.refresh(); }}>{m.admin.refreshAll}</button>
        </div>
        {msg && <p role="status" className="mt-2 text-xs text-accent">{msg}</p>}
        {hideSamples && <p className="mt-2 text-xs text-ink-soft">{m.admin.hideSamples}</p>}
        <ul className="mt-4 space-y-3">
          {[...real, ...samples].map((p) => <Row key={p.id} p={p} info={info[p.id]} naverReady={naverReady} />)}
        </ul>
      </section>

      <AddProduct />
    </div>
  );
}
