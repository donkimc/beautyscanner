import type { Product, Step } from "./products";

// Turns the recommended products into a personalized morning or evening routine: the order to apply them,
// which ones wait for the other time of day, and what to watch for.

export type DayTime = "morning" | "evening";
export const DAY_TIMES: DayTime[] = ["morning", "evening"];

const ORDER: Step[] = ["cleanser", "toner", "serum", "moisturizer", "sunscreen"];

export interface DailyStep { step: Step; product: Product }
export interface SkippedStep { step: Step; product: Product; reason: "eveningOnly" | "morningOnly" }
export type DailyNote = "noMoisturizer" | "noSunscreen" | "empty";

export interface DailyRoutine {
  time: DayTime;
  steps: DailyStep[];
  skipped: SkippedStep[];
  notes: DailyNote[];
  total: number;
}

const suits = (p: Product, time: DayTime) => p.time === "both" || (time === "morning" ? p.time === "am" : p.time === "pm");

export function dailyRoutine(items: Product[], time: DayTime): DailyRoutine {
  const byOrder = (a: Product, b: Product) => ORDER.indexOf(a.step) - ORDER.indexOf(b.step);
  const used = items.filter((p) => suits(p, time)).sort(byOrder);
  const skipped = items
    .filter((p) => !suits(p, time))
    .sort(byOrder)
    .map((product): SkippedStep => ({ step: product.step, product, reason: product.time === "pm" ? "eveningOnly" : "morningOnly" }));

  const notes: DailyNote[] = [];
  if (used.length === 0) notes.push("empty");
  else {
    if (!used.some((p) => p.step === "moisturizer")) notes.push("noMoisturizer");
    if (time === "morning" && !used.some((p) => p.step === "sunscreen")) notes.push("noSunscreen");
  }
  return { time, steps: used.map((product) => ({ step: product.step, product })), skipped, notes, total: used.reduce((s, p) => s + p.price, 0) };
}
