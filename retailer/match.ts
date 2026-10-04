import type { Candidate } from "./naver";

// Suggests which Naver listing is the product we mean. It only ranks; a person still approves the match.

const tokens = (s: string): string[] =>
  (s.toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? []).filter((t) => t.length >= 2);

// Bundles, refills, minis and samples are different products from the one asked for.
const BUNDLE = /세트|기획|증정|1\+1|2\+1|\d+\s*개입|\d+\s*입|리필|미니|샘플|set\b|refill|mini/iu;

export interface Ranked extends Candidate {
  score: number;
  suggested: boolean;
}

export function scoreCandidate(query: { name: string; brand?: string }, c: Candidate): number {
  const q = tokens(query.name);
  if (q.length === 0) return 0;
  const titleTokens = new Set(tokens(c.title));
  let score = q.filter((t) => titleTokens.has(t)).length / q.length; // how much of the product name appears in the title
  const brand = (query.brand ?? "").toLowerCase().trim();
  if (brand && `${c.brand} ${c.maker} ${c.title}`.toLowerCase().includes(brand)) score += 0.25;
  if (BUNDLE.test(c.title) && !BUNDLE.test(query.name)) score -= 0.3;
  if (c.category.length > 0) score += c.category[0].includes("화장품") ? 0.1 : -0.3; // we only sell cosmetics
  return Math.round(score * 100) / 100;
}

export function rankCandidates(query: { name: string; brand?: string }, list: Candidate[]): Ranked[] {
  const ranked = list.map((c) => ({ ...c, score: scoreCandidate(query, c), suggested: false })).sort((a, b) => b.score - a.score || a.price - b.price);
  if (ranked[0] && ranked[0].score >= 0.6) ranked[0].suggested = true;
  return ranked;
}

// Guesses the routine step from a Naver category path and title, to pre-fill the "add product" form.
export function guessStep(category: string[], title: string): "cleanser" | "toner" | "serum" | "moisturizer" | "sunscreen" | null {
  const t = `${category.join(" ")} ${title}`.toLowerCase();
  if (/선크림|선케어|선스크린|선블록|자외선|sun\s?(cream|screen|block)|spf/.test(t)) return "sunscreen";
  if (/클렌징|클렌저|세안|폼클렌|cleans/.test(t)) return "cleanser";
  if (/세럼|앰플|에센스|serum|ampoule|essence/.test(t)) return "serum";
  if (/크림|로션|수분크림|moistur|cream|lotion/.test(t)) return "moisturizer";
  if (/토너|스킨\/토너|스킨|토닉|toner/.test(t)) return "toner";
  return null;
}
