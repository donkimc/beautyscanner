import { PRODUCTS } from "@/lib/products";
import type { Answers } from "@/lib/recommend";

// Explains already-chosen products. The model only rephrases the supplied
// data; it never chooses products or evidence grades.

const CONCERN: Record<string, string> = { dryness: "건조함", acne: "트러블", pigmentation: "색소·잡티", aging: "노화 징후" };

function fallback(a: Answers, name: string, evidence: string) {
  return `'${CONCERN[a.concern]}' 고민과 예산 ${a.budget.toLocaleString()}원 이하 조건에 맞춰 골랐어요. ${evidence}`;
}

export async function POST(req: Request) {
  const { answers, productIds } = (await req.json()) as { answers: Answers; productIds: string[] };
  const products = PRODUCTS.filter((p) => productIds.includes(p.id));
  const key = process.env.ANTHROPIC_API_KEY;

  if (!key) {
    return Response.json({
      ai: false,
      explanations: Object.fromEntries(products.map((p) => [p.id, fallback(answers, p.name, p.evidence)])),
    });
  }

  const prompt = `사용자 설문: 피부타입=${answers.skinType}, 고민=${answers.concern}, 민감성=${answers.sensitive}, 예산=${answers.budget}원, 추가메모="${answers.note.slice(0, 200)}"
제품 목록(JSON): ${JSON.stringify(products.map((p) => ({ id: p.id, name: p.name, step: p.step, grade: p.grade, evidence: p.evidence })))}

각 제품이 이 사용자에게 왜 맞는지 한국어 1~2문장으로 설명하세요.
규칙: 제공된 evidence 외의 연구·수치를 지어내지 말 것. 진단·치료 표현 금지. 근거가 성분 수준이면 그렇게 밝힐 것.
JSON만 출력: {"<id>": "설명", ...}`;

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL ?? "claude-sonnet-5-5",
        max_tokens: 800,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    if (!res.ok) throw new Error(`API ${res.status}`);
    const data = await res.json();
    const text: string = data.content?.[0]?.text ?? "{}";
    const parsed = JSON.parse(text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1));
    const explanations = Object.fromEntries(
      products.map((p) => [p.id, typeof parsed[p.id] === "string" ? parsed[p.id] : fallback(answers, p.name, p.evidence)]),
    );
    return Response.json({ ai: true, explanations });
  } catch {
    return Response.json({
      ai: false,
      explanations: Object.fromEntries(products.map((p) => [p.id, fallback(answers, p.name, p.evidence)])),
    });
  }
}
