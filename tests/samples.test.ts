import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { PRODUCTS, CONCERNS, SKIN_TYPES, type Step } from "../lib/products";
import { SAMPLE_PRODUCTS } from "../lib/samples";

const STEPS: Step[] = ["cleanser", "toner", "serum", "moisturizer", "sunscreen"];

test("sample products are fictional: labelled, unrated, no buy link, ids unique, ko and en text", () => {
  assert.ok(SAMPLE_PRODUCTS.length >= 200);
  assert.equal(new Set(PRODUCTS.map((p) => p.id)).size, PRODUCTS.length);
  for (const p of SAMPLE_PRODUCTS) {
    assert.ok(p.name.startsWith("[샘플]") && p.en.name.startsWith("[Sample]"), p.id);
    assert.equal(p.grade, "unrated", p.id);
    assert.equal(p.url, "#", p.id);
    assert.ok(!p.real, p.id);
  }
});

test("every sample product has its generated picture (run scripts/gen-images.ts)", () => {
  for (const p of SAMPLE_PRODUCTS) assert.ok(existsSync(join(process.cwd(), "public", p.image!)), `${p.id} → ${p.image}`);
});

test("every step covers every skin type and concern, with light and rich options", () => {
  for (const step of STEPS) {
    const list = SAMPLE_PRODUCTS.filter((p) => p.step === step);
    for (const s of SKIN_TYPES) assert.ok(list.some((p) => p.skinTypes.includes(s)), `${step}/${s}`);
    assert.ok(list.some((p) => p.sensitiveSafe), `${step} (sensitive-safe)`);
    for (const c of CONCERNS) assert.ok(list.some((p) => p.concerns.includes(c)), `${step}/${c}`);
    assert.ok(list.some((p) => p.texture === "light") && list.some((p) => p.texture === "rich"), step);
    assert.ok(list.some((p) => p.fragranceFree) && list.some((p) => p.vegan), step);
  }
});
