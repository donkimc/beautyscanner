import assert from "node:assert/strict";
import { test } from "node:test";
import { PRODUCTS, hasBuyLink } from "../lib/products";
import { buildRoutine, type Answers } from "../lib/recommend";
import { dailyRoutine } from "../lib/routine";

const base: Answers = { skinType: "oily", concerns: ["pigmentation", "acne", "pores"], priority: "pores", budget: 150000, texture: "light", note: "" };
const byId = (id: string) => PRODUCTS.find((p) => p.id === id)!;

test("morning order is cleanser, toner, serum, moisturizer, sunscreen", () => {
  const r = dailyRoutine(["f01", "m01", "s01", "t01", "c01"].map(byId), "morning");
  assert.deepEqual(r.steps.map((s) => s.step), ["cleanser", "toner", "serum", "moisturizer", "sunscreen"]);
  assert.equal(r.notes.length, 0);
});

test("sunscreen is morning-only: it is skipped in the evening with a reason", () => {
  const r = dailyRoutine(["c01", "m01", "f01"].map(byId), "evening");
  assert.deepEqual(r.steps.map((s) => s.product.id), ["c01", "m01"]);
  assert.deepEqual(r.skipped.map((s) => [s.product.id, s.reason]), [["f01", "morningOnly"]]);
});

test("evening-only actives (retinal serum, BHA toner) are skipped in the morning", () => {
  const items = ["c01", "t06", "s11", "m01", "f01"].map(byId);
  const am = dailyRoutine(items, "morning");
  const pm = dailyRoutine(items, "evening");
  assert.deepEqual(am.skipped.map((s) => s.product.id), ["t06", "s11"]);
  assert.ok(am.skipped.every((s) => s.reason === "eveningOnly"));
  assert.deepEqual(pm.steps.map((s) => s.product.id), ["c01", "t06", "s11", "m01"]);
});

test("a morning routine with no sunscreen, or any routine with no moisturizer, gets a note", () => {
  assert.ok(dailyRoutine(["c01", "m01"].map(byId), "morning").notes.includes("noSunscreen"));
  assert.ok(dailyRoutine(["c01", "f01"].map(byId), "morning").notes.includes("noMoisturizer"));
  assert.ok(dailyRoutine(["f01"].map(byId), "evening").notes.includes("empty"));
});

test("morning and evening together cover every recommended product", () => {
  const items = buildRoutine(base).items;
  const am = dailyRoutine(items, "morning").steps.map((s) => s.product.id);
  const pm = dailyRoutine(items, "evening").steps.map((s) => s.product.id);
  assert.deepEqual(new Set([...am, ...pm]), new Set(items.map((p) => p.id)));
});

test("the total is the sum of the products used", () => {
  const r = dailyRoutine(["c01", "m01", "f01"].map(byId), "morning");
  assert.equal(r.total, 6200 + 13400 + 10800);
});

test("every product has a time of day, and no retailer link yet", () => {
  assert.ok(PRODUCTS.every((p) => ["am", "pm", "both"].includes(p.time)));
  assert.ok(PRODUCTS.every((p) => !hasBuyLink(p)));
  assert.ok(PRODUCTS.filter((p) => p.step === "sunscreen").every((p) => p.time === "am"));
});
