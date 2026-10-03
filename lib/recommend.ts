import { PRODUCTS, type Concern, type Product, type SkinType, type Step } from "./products";

export interface Answers {
  skinType: SkinType;
  concern: Concern;
  sensitive: boolean;
  budget: number;
  steps: 3 | 5;
  note: string;
}

export type Warning = { code: "budget" | "noCream" | "noSunscreen" } | { code: "missing"; n: number };

export interface Routine {
  items: Product[];
  total: number;
  warnings: Warning[];
}

const GRADE_RANK = { clinical: 3, multiple: 2, emerging: 1, brand: 0 } as const;

function score(p: Product, a: Answers): number {
  let s = GRADE_RANK[p.grade];
  if (p.concerns.includes(a.concern)) s += 3;
  if (p.skinTypes.includes(a.skinType)) s += 2;
  return s;
}

export function buildRoutine(a: Answers): Routine {
  const steps: Step[] =
    a.steps === 5
      ? ["cleanser", "toner", "serum", "moisturizer", "sunscreen"]
      : ["cleanser", "moisturizer", "sunscreen"];

  const candidates = steps.map((step) =>
    PRODUCTS.filter((p) => p.step === step && (!a.sensitive || p.sensitiveSafe))
      .sort((x, y) => score(y, a) - score(x, a) || x.price - y.price),
  );
  const picks = candidates.map((c) => 0);
  const warnings: Warning[] = [];
  const total = () => picks.reduce((sum, i, k) => sum + (candidates[k][i]?.price ?? 0), 0);

  // Swap in cheaper alternatives (largest saving first) until within budget.
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
