import type { Product } from "../lib/products";
import type { Answers } from "../lib/recommend";

// The explainer agent only rephrases data it is given. It never chooses products or evidence grades.

export const EXPLAINER = {
  provider: "deepseek",
  endpoint: "https://api.deepseek.com/chat/completions",
  defaultModel: "deepseek-chat",
  maxTokens: 800,
  maxChars: 220,
  bannedTerms: ["진단", "치료", "완치", "처방", "치유", "의학적으로 입증"],
} as const;

const CONCERN: Record<Answers["concern"], string> = {
  dryness: "건조함",
  acne: "트러블",
  pigmentation: "색소·잡티",
  aging: "노화 징후",
};

export function concernLabel(c: Answers["concern"]): string {
  return CONCERN[c];
}

export function buildPrompt(a: Answers, products: Product[]): string {
  const data = products.map((p) => ({ id: p.id, name: p.name, step: p.step, grade: p.grade, evidence: p.evidence }));
  return `사용자 설문: 피부타입=${a.skinType}, 고민=${a.concern}, 민감성=${a.sensitive}, 예산=${a.budget}원, 추가메모="${a.note.slice(0, 200)}"
제품 목록(JSON): ${JSON.stringify(data)}

각 제품이 이 사용자에게 왜 맞는지 한국어 1~2문장으로 설명하세요.
규칙: 제공된 evidence 외의 연구·수치를 지어내지 말 것. 진단·치료 표현 금지. 근거가 성분 수준이면 그렇게 밝힐 것.
JSON만 출력: {"<id>": "설명", ...}`;
}

export function templateExplanation(a: Answers, p: Pick<Product, "evidence">): string {
  return `'${CONCERN[a.concern]}' 고민과 예산 ${a.budget.toLocaleString()}원 이하 조건에 맞춰 골랐어요. ${p.evidence}`;
}

// A model sentence is accepted only if it passes every guardrail.
export function isSafe(text: string, evidence: string): boolean {
  if (text.length === 0 || text.length > EXPLAINER.maxChars) return false;
  if (EXPLAINER.bannedTerms.some((t) => text.includes(t))) return false;
  const figures = text.match(/\d+(\.\d+)?\s*%/g) ?? [];
  return figures.every((f) => evidence.includes(f.replace(/\s/g, "")));
}

export function parseExplanations(raw: string, a: Answers, products: Product[]): Record<string, string> {
  let parsed: Record<string, unknown> = {};
  try {
    parsed = JSON.parse(raw.slice(raw.indexOf("{"), raw.lastIndexOf("}") + 1));
  } catch {
    /* fall through to templates */
  }
  return Object.fromEntries(
    products.map((p) => {
      const t = parsed[p.id];
      return [p.id, typeof t === "string" && isSafe(t, p.evidence) ? t : templateExplanation(a, p)];
    }),
  );
}
