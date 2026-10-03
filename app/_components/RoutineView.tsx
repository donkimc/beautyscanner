"use client";

import Link from "next/link";
import { useState } from "react";
import { priceText, totalText } from "../../lib/price";
import { localized, type Product } from "../../lib/products";
import { DAY_TIMES, dailyRoutine, type DayTime } from "../../lib/routine";
import AddToCart from "./AddToCart";
import { useI18n } from "./I18nProvider";
import ProductImage from "./ProductImage";

// The personalized morning / evening routine built from the recommended products
// (same look as the original evening-routine page: numbered steps on a dashed line, a photo per step, an amber note).
export default function RoutineView({
  items, bandLabel, initialTime = "morning", onBack, beforeLogin,
}: {
  items: Product[];
  bandLabel: string;
  initialTime?: DayTime;
  onBack: () => void;
  beforeLogin: () => void;
}) {
  const { m, locale } = useI18n();
  const [time, setTime] = useState<DayTime>(initialTime);
  const r = dailyRoutine(items, time);
  const ids = r.steps.map((s) => s.product.id);

  return (
    <section className="overflow-hidden rounded-card bg-surface shadow-phone">
      <div role="tablist" className="grid grid-cols-2 gap-2 p-3">
        {DAY_TIMES.map((t) => (
          <button
            key={t} role="tab" aria-selected={t === time} onClick={() => setTime(t)}
            className={`rounded-2xl border-[1.5px] px-3 py-2.5 text-left transition ${t === time ? "border-accent bg-accent-soft" : "border-border bg-surface hover:border-accent"}`}
          >
            <span className="block text-sm font-semibold">{m.routine.tab[t]}</span>
            <span className="block text-[11.5px] text-ink-faint">{m.routine.tabSub[t]}</span>
          </button>
        ))}
      </div>

      <div className="border-b border-border px-6 pb-5 pt-3 text-center">
        <p className="eyebrow">{m.routine.label(r.steps.length)}</p>
        <h1 className="mt-2 font-display text-2xl font-semibold">{m.routine.title[time]}</h1>
        <p className="mt-1.5 text-[13px] text-ink-soft">{m.routine.sub(bandLabel)}</p>
      </div>

      <ol className="flex flex-col px-5 py-4">
        {r.steps.map(({ step, product }, i) => {
          const text = localized(product, locale);
          return (
            <li key={product.id} className="relative flex gap-3.5 px-1 py-4">
              {i < r.steps.length - 1 && <span aria-hidden className="absolute bottom-[-4px] left-[17px] top-16 border-l-[1.5px] border-dashed border-border" />}
              <span className="z-10 flex size-[26px] shrink-0 items-center justify-center rounded-full bg-ink font-mono text-xs font-semibold text-bg">{i + 1}</span>
              <Link href={`/products/${product.id}`} className="shrink-0">
                <ProductImage product={product} locale={locale} className="size-14 rounded-[14px] border border-border" />
              </Link>
              <div className="min-w-0 flex-1 pt-0.5">
                <p className="eyebrow-faint !text-[10.5px]">{m.result.steps[step]}</p>
                <Link href={`/products/${product.id}`} className="mt-0.5 block text-sm font-bold leading-snug hover:text-accent">{text.name}</Link>
                <p className="mt-1 text-xs leading-relaxed text-ink-soft">{m.routine.tips[step][time]}</p>
                <p className="mt-1 text-xs font-semibold">{priceText(product, locale)}</p>
              </div>
            </li>
          );
        })}
      </ol>

      {r.skipped.length > 0 && (
        <ul className="mx-5 mb-3 space-y-1 text-xs text-ink-soft">
          {r.skipped.map((s) => <li key={s.product.id}>• {m.routine.skipped[s.reason](localized(s.product, locale).name)}</li>)}
        </ul>
      )}

      {r.notes.map((n) => (
        <p key={n} className="mx-5 mb-3 rounded-[14px] border border-dashed border-warn bg-warn-soft px-4 py-3.5 text-xs leading-relaxed text-ink">⚠ {m.routine.notes[n]}</p>
      ))}

      <div className="space-y-3 border-t border-border px-6 pb-6 pt-4">
        <p className="flex items-baseline justify-between text-sm">
          <span className="text-ink-soft">{m.routine.total}</span>
          <span className="font-bold">{totalText(r.steps, locale)}</span>
        </p>
        {ids.length > 0 && (
          <AddToCart
            productIds={ids} routine={time} wide label={m.routine.addRoutine} beforeLogin={beforeLogin} loginNext="/try?resume=1"
            className="w-full rounded-button bg-ink py-3.5 font-semibold text-bg transition active:scale-[0.99] disabled:opacity-60"
          />
        )}
        <button className="block w-full py-1 text-center text-sm text-ink-soft underline" onClick={() => setTime(time === "morning" ? "evening" : "morning")}>{m.routine.other}</button>
        <button className="block w-full py-1 text-center text-sm text-ink-soft" onClick={onBack}>{m.routine.back}</button>
      </div>
    </section>
  );
}
