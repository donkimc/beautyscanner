import assert from "node:assert/strict";
import { test } from "node:test";
import { buildPrompt, isSafe, parseExplanations, templateExplanation } from "../agent/explainer";
import { PRODUCTS } from "../lib/products";
import type { Answers } from "../lib/recommend";

const a: Answers = { skinType: "dry", concerns: ["dryness", "redness"], priority: "hydration", budget: 30000, texture: "light", note: "" };
const products = PRODUCTS.slice(0, 2);

test("prompt forbids invented evidence and includes only supplied products", () => {
  const p = buildPrompt(a, products);
  assert.ok(p.includes("지어내지 말 것"));
  assert.ok(p.includes(products[0].id) && !p.includes(PRODUCTS[5].id));
});

test("guardrails reject diagnosis wording and invented percentages", () => {
  assert.equal(isSafe("아토피를 치료해요", ""), false);
  assert.equal(isSafe("87% 개선", "보습 효과"), false);
  assert.equal(isSafe("보습에 도움이 돼요", "보습 효과"), true);
});

test("malformed model output falls back to templates for every product", () => {
  const out = parseExplanations("not json", a, products);
  for (const p of products) assert.equal(out[p.id], templateExplanation(a, p));
});

test("unsafe model sentences are replaced, safe ones kept", () => {
  const raw = JSON.stringify({ [products[0].id]: "완치돼요", [products[1].id]: "건조한 피부에 어울려요." });
  const out = parseExplanations(raw, a, products);
  assert.equal(out[products[0].id], templateExplanation(a, products[0]));
  assert.equal(out[products[1].id], "건조한 피부에 어울려요.");
});

test("the prompt describes every new survey answer", () => {
  const p = buildPrompt(a, products, "en");
  for (const part of ["concerns=[dryness, redness]", "top_priority=hydration", "texture_preference=light", "price_range=\"Under ₩30,000\""]) assert.ok(p.includes(part), part);
});

test("the template explanation names the ticked concerns and the top priority", () => {
  assert.match(templateExplanation(a, products[0], "en"), /dryness, redness[\s\S]*add hydration/);
  assert.match(templateExplanation(a, products[0], "ko"), /건조함, 홍조[\s\S]*수분 채우기/);
});
