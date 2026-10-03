import type { Locale } from "../i18n/locale";
import { messages } from "../i18n/messages";
import { localized, type Product } from "../lib/products";
import { budgetLabel, type Answers } from "../lib/recommend";

// The explainer agent only rephrases data it is given. It never chooses products or evidence grades.

export const EXPLAINER = {
  provider: "deepseek",
  endpoint: "https://api.deepseek.com/chat/completions",
  defaultModel: "deepseek-chat",
  maxTokens: 800,
  maxChars: 240,
  bannedTerms: ["진단", "치료", "완치", "처방", "치유", "의학적으로 입증", "cure", "cures", "treat ", "treats", "treatment", "diagnos", "heals", "clinically proven", "guarantee", "prescri"],
} as const;

export function concernLabel(c: Answers["concern"], locale: Locale): string {
  return messages[locale].result.concerns[c];
}

export function buildPrompt(a: Answers, products: Product[], locale: Locale = "ko"): string {
  const data = products.map((p) => ({ id: p.id, ...localized(p, locale), step: p.step, grade: p.grade }));
  const profile = `skinType=${a.skinType}, concern=${a.concern}, sensitive=${a.sensitive}, price_range="${budgetLabel(a.budget, locale)}", note="${a.note.slice(0, 200)}"`;
  if (locale === "en") {
    return `User survey: ${profile}
Products (JSON): ${JSON.stringify(data)}

For each product, explain in 1-2 English sentences why it suits this user.
Rules: never invent studies or numbers beyond the supplied evidence. No diagnosis or treatment wording. If the evidence is ingredient-level, say so.
Output JSON only: {"<id>": "explanation", ...}`;
  }
  return `사용자 설문: ${profile}
제품 목록(JSON): ${JSON.stringify(data)}

각 제품이 이 사용자에게 왜 맞는지 한국어 1~2문장으로 설명하세요.
규칙: 제공된 evidence 외의 연구·수치를 지어내지 말 것. 진단·치료 표현 금지. 근거가 성분 수준이면 그렇게 밝힐 것.
JSON만 출력: {"<id>": "설명", ...}`;
}

export function templateExplanation(a: Answers, p: Product, locale: Locale = "ko"): string {
  const m = messages[locale].result;
  return `${m.why(m.concerns[a.concern], budgetLabel(a.budget, locale))} ${localized(p, locale).evidence}`;
}

// A model sentence is accepted only if it passes every guardrail.
export function isSafe(text: string, evidence: string): boolean {
  if (text.length === 0 || text.length > EXPLAINER.maxChars) return false;
  const lower = text.toLowerCase();
  if (EXPLAINER.bannedTerms.some((t) => lower.includes(t))) return false;
  const figures = text.match(/\d+(\.\d+)?\s*%/g) ?? [];
  return figures.every((f) => evidence.includes(f.replace(/\s/g, "")));
}

export function parseExplanations(raw: string, a: Answers, products: Product[], locale: Locale = "ko"): Record<string, string> {
  let parsed: Record<string, unknown> = {};
  try {
    parsed = JSON.parse(raw.slice(raw.indexOf("{"), raw.lastIndexOf("}") + 1));
  } catch {
    /* fall through to templates */
  }
  return Object.fromEntries(
    products.map((p) => {
      const t = parsed[p.id];
      return [p.id, typeof t === "string" && isSafe(t, localized(p, locale).evidence) ? t : templateExplanation(a, p, locale)];
    }),
  );
}
