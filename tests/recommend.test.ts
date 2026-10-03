import assert from "node:assert/strict";
import { test } from "node:test";
import { CONCERNS, PRIORITIES, PRODUCTS, SKIN_TYPES, TEXTURES } from "../lib/products";
import { BUDGETS, budgetLabel, buildRoutine, isSensitive, parseAnswers, stepsFor, type Answers } from "../lib/recommend";
import { messages } from "../i18n/messages";

const base: Answers = { skinType: "dry", concerns: ["dryness"], priority: "hydration", budget: 150000, texture: "light", note: "" };
const picked = (a: Answers) => buildRoutine(a).items.map((p) => p.id);

test("a budget above 3만원 gets the full 5-step routine, in order", () => {
  assert.deepEqual(buildRoutine(base).items.map((p) => p.step), ["cleanser", "toner", "serum", "moisturizer", "sunscreen"]);
});

test("a 3만원-or-less budget gets the short 3-step routine", () => {
  assert.deepEqual(stepsFor({ ...base, budget: 30000 }), ["cleanser", "moisturizer", "sunscreen"]);
  assert.deepEqual(buildRoutine({ ...base, budget: 30000 }).items.map((p) => p.step), ["cleanser", "moisturizer", "sunscreen"]);
});

test("total matches the sum of item prices", () => {
  const r = buildRoutine(base);
  assert.equal(r.total, r.items.reduce((s, p) => s + p.price, 0));
});

test("every price band yields a routine within its upper limit", () => {
  for (const budget of BUDGETS) assert.ok(buildRoutine({ ...base, budget }).total <= budget, String(budget));
});

test("an unmeetable budget produces a warning", () => {
  assert.ok(buildRoutine({ ...base, budget: 5000 } as Answers).warnings.length > 0);
});

test("sensitivity is derived: sensitive skin, redness, or a low-irritation preference", () => {
  assert.equal(isSensitive({ ...base, skinType: "sensitive" }), true);
  assert.equal(isSensitive({ ...base, concerns: ["acne", "redness"] }), true);
  assert.equal(isSensitive({ ...base, texture: "low_irritation" }), true);
  assert.equal(isSensitive(base), false);
});

test("sensitive users only get low-irritation products", () => {
  for (const a of [{ ...base, skinType: "sensitive" as const }, { ...base, concerns: ["redness" as const] }, { ...base, texture: "low_irritation" as const }]) {
    assert.ok(buildRoutine(a).items.every((p) => p.sensitiveSafe));
  }
});

test("multiple concerns: each ticked concern pulls in products that cover it", () => {
  const onlyAcne = picked({ ...base, concerns: ["acne"], priority: "soothing" });
  const acneAndPores = buildRoutine({ ...base, concerns: ["acne", "pores"], priority: "pores" }).items;
  assert.ok(acneAndPores.some((p) => p.concerns.includes("pores")));
  assert.notDeepEqual(onlyAcne, picked({ ...base, concerns: ["aging"], priority: "firmness" }));
});

test("top priority steers the pick: tone brings in the pigmentation serum", () => {
  assert.ok(picked({ ...base, concerns: ["pigmentation"], priority: "tone", skinType: "oily" }).includes("s2"));
  assert.ok(picked({ ...base, concerns: ["dryness"], priority: "hydration" }).includes("s1"));
});

test("texture: fragrance-free and vegan are honored whenever options exist", () => {
  assert.ok(buildRoutine({ ...base, texture: "fragrance_free" }).items.every((p) => p.fragranceFree));
  assert.ok(buildRoutine({ ...base, texture: "vegan_clean" }).items.every((p) => p.vegan));
});

test("texture: lightweight vs rich changes the moisturizer", () => {
  const cream = (texture: "light" | "rich") => buildRoutine({ ...base, concerns: ["dryness"], texture }).items.find((p) => p.step === "moisturizer")!;
  assert.equal(cream("light").texture, "light");
  assert.equal(cream("rich").texture, "rich");
});

test("'not sure' skin type still gives a full routine", () => {
  assert.equal(buildRoutine({ ...base, skinType: "unsure" }).items.length, 5);
});

test("every product has a unique id, evidence, and both languages", () => {
  assert.equal(new Set(PRODUCTS.map((p) => p.id)).size, PRODUCTS.length);
  assert.ok(PRODUCTS.every((p) => p.evidence.length > 0 && p.en.name.length > 0));
});

test("parseAnswers accepts a valid answer set and normalizes it", () => {
  const a = parseAnswers({ ...base, concerns: ["dryness", "dryness", "acne"], note: "x".repeat(500) });
  assert.deepEqual(a?.concerns, ["dryness", "acne"]);
  assert.equal(a?.note.length, 200);
});

test("parseAnswers rejects old-format, empty and tampered answers", () => {
  assert.equal(parseAnswers(null), null);
  assert.equal(parseAnswers({ skinType: "dry", concern: "dryness", sensitive: false, budget: 50000, steps: 5, note: "" }), null);
  assert.equal(parseAnswers({ ...base, concerns: [] }), null);
  assert.equal(parseAnswers({ ...base, concerns: ["nope"] }), null);
  assert.equal(parseAnswers({ ...base, budget: 123 }), null);
  assert.equal(parseAnswers({ ...base, texture: "spicy" }), null);
  assert.equal(parseAnswers({ ...base, priority: undefined }), null);
});

test("survey option values in both languages match the answer vocabularies", () => {
  const vals = (l: "ko" | "en", key: string) => messages[l].survey.questions.find((q) => q.key === key)!.options.map((o) => o.value);
  for (const l of ["ko", "en"] as const) {
    assert.deepEqual(vals(l, "skinType"), [...SKIN_TYPES]);
    assert.deepEqual(vals(l, "concerns"), [...CONCERNS]);
    assert.deepEqual(vals(l, "priority"), [...PRIORITIES]);
    assert.deepEqual(vals(l, "budget"), [...BUDGETS]);
    assert.deepEqual(vals(l, "texture"), [...TEXTURES]);
  }
});

test("budgetLabel shows the band the user picked, in their language", () => {
  assert.equal(budgetLabel(70000, "ko"), "3~7만원");
  assert.equal(budgetLabel(1000000, "en"), "Over ₩150,000");
});
