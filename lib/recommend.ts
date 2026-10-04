import type { Locale } from "../i18n/locale";
import { messages } from "../i18n/messages";
import {
  CONCERNS, PRIORITIES, PRIORITY_TARGETS, PRODUCTS, SKIN_TYPES, TEXTURES,
  type Concern, type Priority, type Product, type SkinType, type Step, type Texture,
} from "./products";

// Upper limit of each price band in the survey (the last one means "no upper limit").
export const BUDGETS = [30000, 70000, 150000, 1000000] as const;

export interface Answers {
  skinType: SkinType;
  /** Multi-select: every concern the user ticked (at least one). */
  concerns: Concern[];
  /** The one thing to improve first. */
  priority: Priority;
  budget: number;
  texture: Texture;
  note: string;
}

export type Warning = { code: "budget" | "noCream" | "noSunscreen" } | { code: "missing"; n: number };

export interface Routine {
  items: Product[];
  total: number;
  warnings: Warning[];
}

const isOneOf = <T extends string>(list: readonly T[], v: unknown): v is T => typeof v === "string" && (list as readonly string[]).includes(v);

// Validates untrusted input (a request body, or answers restored from the browser). Returns null if it isn't a valid answer set.
export function parseAnswers(raw: unknown): Answers | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (!isOneOf(SKIN_TYPES, r.skinType) || !isOneOf(PRIORITIES, r.priority) || !isOneOf(TEXTURES, r.texture)) return null;
  if (!Array.isArray(r.concerns) || r.concerns.length < 1 || !r.concerns.every((c) => isOneOf(CONCERNS, c))) return null;
  if (typeof r.budget !== "number" || !(BUDGETS as readonly number[]).includes(r.budget)) return null;
  const note = typeof r.note === "string" ? r.note.slice(0, 200) : "";
  return { skinType: r.skinType, concerns: [...new Set(r.concerns as Concern[])], priority: r.priority, budget: r.budget, texture: r.texture, note };
}

// Sensitive skin, redness, or a "low-irritation" preference all mean: leave out products that may irritate.
export const isSensitive = (a: Answers) => a.skinType === "sensitive" || a.concerns.includes("redness") || a.texture === "low_irritation";

// A routine under ₩30,000 is the short 3-step version; anything above gets the full 5 steps.
export const stepsFor = (a: Answers): Step[] =>
  a.budget <= 30000 ? ["cleanser", "moisturizer", "sunscreen"] : ["cleanser", "toner", "serum", "moisturizer", "sunscreen"];

const GRADE_RANK = { clinical: 3, multiple: 2, emerging: 1, brand: 0, unrated: 0 } as const;

function score(p: Product, a: Answers): number {
  let s = GRADE_RANK[p.grade];
  if (p.real) s += 2; // prefer real products over sample data when they fit
  s += 2 * a.concerns.filter((c) => p.concerns.includes(c)).length;
  if (PRIORITY_TARGETS[a.priority].some((c) => p.concerns.includes(c))) s += 4;
  if (a.skinType !== "unsure" && p.skinTypes.includes(a.skinType)) s += 2;
  // A stated feel preference outweighs a small difference in evidence, but not a mismatch in concerns.
  if (a.texture === "light" || a.texture === "rich") s += p.texture === a.texture ? 5 : 0;
  return s;
}

// Keep only candidates that satisfy a preference, but never leave a step empty because of a mere preference.
const prefer = (list: Product[], ok: (p: Product) => boolean) => (list.some(ok) ? list.filter(ok) : list);

export function buildRoutine(a: Answers, catalog: Product[] = PRODUCTS): Routine {
  const steps = stepsFor(a);
  const sensitive = isSensitive(a);

  const candidates = steps.map((step) => {
    let c = catalog.filter((p) => p.step === step && (!sensitive || p.sensitiveSafe));
    if (a.texture === "fragrance_free") c = prefer(c, (p) => p.fragranceFree);
    if (a.texture === "vegan_clean") c = prefer(c, (p) => p.vegan);
    return c.sort((x, y) => score(y, a) - score(x, a) || x.price - y.price);
  });
  const picks = candidates.map(() => 0);
  const warnings: Warning[] = [];
  const total = () => picks.reduce((sum, i, k) => sum + (candidates[k][i]?.price ?? 0), 0);

  // Swap in cheaper alternatives (largest saving first) until within the price range's upper limit.
  while (total() > a.budget) {
    let best = -1;
    let saving = 0;
    candidates.forEach((c, k) => {
      const cur = c[picks[k]];
      const next = c[picks[k] + 1];
      if (cur && next && cur.price - next.price > saving) {
        saving = cur.price - next.price;
        best = k;
      }
    });
    if (best < 0) break;
    picks[best]++;
  }

  const items = candidates.flatMap((c, k) => (c[picks[k]] ? [c[picks[k]]] : []));
  const sum = items.reduce((s, p) => s + p.price, 0);
  if (sum > a.budget) warnings.push({ code: "budget" });
  if (!items.some((p) => p.step === "moisturizer")) warnings.push({ code: "noCream" });
  if (!items.some((p) => p.step === "sunscreen")) warnings.push({ code: "noSunscreen" });
  const missing = steps.length - items.length;
  if (missing > 0) warnings.push({ code: "missing", n: missing });
  return { items, total: sum, warnings };
}

// The price-range label shown to the user for a stored budget value (the upper limit of the chosen band).
export function budgetLabel(budget: number, locale: Locale): string {
  const q = messages[locale].survey.questions.find((x) => x.key === "budget");
  return q?.options.find((o) => o.value === budget)?.label ?? `${budget.toLocaleString()}`;
}
