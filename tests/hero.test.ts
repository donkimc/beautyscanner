import assert from "node:assert/strict";
import { test } from "node:test";
import { SLIDES } from "../app/_components/hero/ProductArt";
import { messages } from "../i18n/messages";

test("the hero carousel has one slide per routine step, in routine order", () => {
  assert.deepEqual(SLIDES.map((s) => s.step), ["cleanser", "toner", "serum", "moisturizer", "sunscreen"]);
});

test("neighbouring slides (including the wrap-around) never share a background", () => {
  SLIDES.forEach((s, i) => assert.notEqual(s.bg, SLIDES[(i + 1) % SLIDES.length].bg, s.step));
});

test("carousel labels exist in both languages", () => {
  for (const l of ["ko", "en"] as const) {
    assert.ok(messages[l].landing.carouselLabel.length > 0);
    assert.ok(messages[l].landing.slideLabel(2, 5).length > 0);
  }
});
