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
