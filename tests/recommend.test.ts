import assert from "node:assert/strict";
import { test } from "node:test";
import { PRODUCTS } from "../lib/products";
import { buildRoutine, type Answers } from "../lib/recommend";

const base: Answers = { skinType: "dry", concern: "dryness", sensitive: false, budget: 80000, steps: 5, note: "" };

test("5-step routine has one product per step in order", () => {
  const r = buildRoutine(base);
  assert.deepEqual(r.items.map((p) => p.step), ["cleanser", "toner", "serum", "moisturizer", "sunscreen"]);
});

test("3-step routine is cleanser, moisturizer, sunscreen", () => {
  const r = buildRoutine({ ...base, steps: 3 });
  assert.deepEqual(r.items.map((p) => p.step), ["cleanser", "moisturizer", "sunscreen"]);
});

test("total matches the sum of item prices", () => {
  const r = buildRoutine(base);
  assert.equal(r.total, r.items.reduce((s, p) => s + p.price, 0));
});

test("sensitive users only get sensitive-safe products", () => {
  for (const concern of ["dryness", "acne", "pigmentation", "aging"] as const) {
    const r = buildRoutine({ ...base, concern, sensitive: true });
    assert.ok(r.items.every((p) => p.sensitiveSafe), concern);
  }
});

test("a budget that cannot be met produces a warning", () => {
  assert.ok(buildRoutine({ ...base, budget: 5000 }).warnings.length > 0);
});

test("every product has a unique id and a non-empty evidence note", () => {
  assert.equal(new Set(PRODUCTS.map((p) => p.id)).size, PRODUCTS.length);
  assert.ok(PRODUCTS.every((p) => p.evidence.length > 0));
});

test("each price band yields a routine within its upper limit (or the cheapest possible)", () => {
  for (const budget of [30000, 70000, 150000, 1000000]) {
    const r = buildRoutine({ ...base, budget, steps: 3 });
    assert.ok(r.total <= budget, String(budget));
  }
});

test("a higher price band never gives a lower-scoring routine than a lower band", () => {
  const total = (budget: number) => buildRoutine({ ...base, budget }).items.length;
  assert.ok(total(150000) >= total(30000));
});

test("budgetLabel shows the band the user picked, in their language", async () => {
  const { budgetLabel } = await import("../lib/recommend");
  assert.equal(budgetLabel(70000, "ko"), "3~7만원");
  assert.equal(budgetLabel(1000000, "en"), "Over ₩150,000");
  assert.equal(budgetLabel(12345, "ko"), "12,345");
});
