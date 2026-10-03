import { EXPLAINER, buildPrompt, parseExplanations, templateExplanation } from "../../../agent/explainer";
import { PRODUCTS } from "../../../lib/products";
import type { Answers } from "../../../lib/recommend";

export async function POST(req: Request) {
  const { answers, productIds } = (await req.json()) as { answers: Answers; productIds: string[] };
  const products = PRODUCTS.filter((p) => productIds.includes(p.id));
  const templates = Object.fromEntries(products.map((p) => [p.id, templateExplanation(answers, p)]));
  const key = process.env.DEEPSEEK_API_KEY;
  if (!key) return Response.json({ ai: false, explanations: templates });

  try {
    const res = await fetch(EXPLAINER.endpoint, {
      method: "POST",
      headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
      body: JSON.stringify({
        model: process.env.DEEPSEEK_MODEL ?? EXPLAINER.defaultModel,
        max_tokens: EXPLAINER.maxTokens,
        response_format: { type: "json_object" },
        messages: [{ role: "user", content: buildPrompt(answers, products) }],
      }),
    });
    if (!res.ok) throw new Error(`API ${res.status}`);
    const data = await res.json();
    const text: string = data.choices?.[0]?.message?.content ?? "{}";
    return Response.json({ ai: true, explanations: parseExplanations(text, answers, products) });
  } catch {
    return Response.json({ ai: false, explanations: templates });
  }
}
