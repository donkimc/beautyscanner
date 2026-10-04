import { EXPLAINER, buildPrompt, parseExplanations, templateExplanation } from "../../../agent/explainer";
import { isLocale, type Locale } from "../../../i18n/locale";
import { loadCatalog } from "../../../catalog/load";
import { parseAnswers } from "../../../lib/recommend";

// `allowAi` is true only if the user consented to the overseas AI transfer.
export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { answers?: unknown; productIds?: string[]; locale?: string; allowAi?: boolean };
  const answers = parseAnswers(body.answers);
  if (!answers || !Array.isArray(body.productIds)) return Response.json({ error: "bad_request" }, { status: 400 });
  const locale: Locale = isLocale(body.locale) ? body.locale : "ko";
  const products = (await loadCatalog()).filter((p) => body.productIds!.includes(p.id));
  const templates = Object.fromEntries(products.map((p) => [p.id, templateExplanation(answers, p, locale)]));
  const key = process.env.DEEPSEEK_API_KEY;
  if (!key || !body.allowAi) return Response.json({ ai: false, explanations: templates });

  try {
    const res = await fetch(EXPLAINER.endpoint, {
      method: "POST",
      headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
      body: JSON.stringify({
        model: process.env.DEEPSEEK_MODEL ?? EXPLAINER.defaultModel,
        max_tokens: EXPLAINER.maxTokens,
        response_format: { type: "json_object" },
        messages: [{ role: "user", content: buildPrompt(answers, products, locale) }],
      }),
    });
    if (!res.ok) throw new Error(`API ${res.status}`);
    const data = await res.json();
    const text: string = data.choices?.[0]?.message?.content ?? "{}";
    return Response.json({ ai: true, explanations: parseExplanations(text, answers, products, locale) });
  } catch {
    return Response.json({ ai: false, explanations: templates });
  }
}
