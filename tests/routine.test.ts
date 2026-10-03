import assert from "node:assert/strict";
import { test } from "node:test";
import { PRODUCTS, hasBuyLink } from "../lib/products";
import { buildRoutine, type Answers } from "../lib/recommend";
import { dailyRoutine } from "../lib/routine";

const base: Answers = { skinType: "oily", concerns: ["pigmentation", "acne", "pores"], priority: "pores", budget: 150000, texture: "light", note: "" };
const byId = (id: string) => PRODUCTS.find((p) => p.id === id)!;

test("morning order is cleanser, toner, serum, moisturizer, sunscreen", () => {
  const r = dailyRoutine(["f1", "m1", "s1", "t1", "c1"].map(byId), "morning");
  assert.deepEqual(r.steps.map((s) => s.step), ["cleanser", "toner", "serum", "moisturizer", "sunscreen"]);
  assert.equal(r.notes.length, 0);
});

test("sunscreen is morning-only: it is skipped in the evening with a reason", () => {
  const r = dailyRoutine(["c1", "m1", "f1"].map(byId), "evening");
  assert.deepEqual(r.steps.map((s) => s.product.id), ["c1", "m1"]);
  assert.deepEqual(r.skipped.map((s) => [s.product.id, s.reason]), [["f1", "morningOnly"]]);
});

test("evening-only actives (retinal serum, BHA toner) are skipped in the morning", () => {
  const items = ["c1", "t2", "s3", "m1", "f1"].map(byId);
  const am = dailyRoutine(items, "morning");
  const pm = dailyRoutine(items, "evening");
  assert.deepEqual(am.skipped.map((s) => s.product.id), ["t2", "s3"]);
  assert.ok(am.skipped.every((s) => s.reason === "eveningOnly"));
  assert.deepEqual(pm.steps.map((s) => s.product.id), ["c1", "t2", "s3", "m1"]);
});

test("a morning routine with no sunscreen, or any routine with no moisturizer, gets a note", () => {
  assert.ok(dailyRoutine(["c1", "m1"].map(byId), "morning").notes.includes("noSunscreen"));
  assert.ok(dailyRoutine(["c1", "f1"].map(byId), "morning").notes.includes("noMoisturizer"));
  assert.ok(dailyRoutine(["f1"].map(byId), "evening").notes.includes("empty"));
});

test("morning and evening together cover every recommended product", () => {
  const items = buildRoutine(base).items;
  const am = dailyRoutine(items, "morning").steps.map((s) => s.product.id);
  const pm = dailyRoutine(items, "evening").steps.map((s) => s.product.id);
  assert.deepEqual(new Set([...am, ...pm]), new Set(items.map((p) => p.id)));
});

test("the total is the sum of the products used", () => {
  const r = dailyRoutine(["c1", "m1", "f1"].map(byId), "morning");
  assert.equal(r.total, 6900 + 14900 + 12000);
});

test("every product has a time of day, and no retailer link yet", () => {
  assert.ok(PRODUCTS.every((p) => ["am", "pm", "both"].includes(p.time)));
  assert.ok(PRODUCTS.every((p) => !hasBuyLink(p)));
  assert.ok(PRODUCTS.filter((p) => p.step === "sunscreen").every((p) => p.time === "am"));
});
