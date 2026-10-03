import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { toCss } from "../design/css";
import tokens from "../design/tokens.json";

test("app/tokens.css is in sync with design/tokens.json (run npm run tokens)", () => {
  assert.equal(readFileSync(new URL("../app/tokens.css", import.meta.url), "utf8"), toCss());
});

test("light and dark themes define exactly the same tokens", () => {
  assert.deepEqual(Object.keys(tokens.dark), Object.keys(tokens.light));
});

test("the palette matches the original design pages (paper background, plum ink, pink accent)", () => {
  assert.equal(tokens.light.bg, "oklch(0.97 0.008 90)");
  assert.equal(tokens.light.ink, "oklch(0.22 0.03 320)");
  assert.equal(tokens.light.accent, "oklch(0.5 0.14 350)");
  assert.equal(tokens.light["accent-soft"], "oklch(0.94 0.03 350)");
  assert.equal(tokens.dark.bg, "oklch(0.17 0.014 300)");
  assert.equal(tokens.dark.accent, "oklch(0.74 0.13 350)");
});

test("evidence grade colors are distinct in both themes", () => {
  for (const theme of [tokens.light, tokens.dark]) {
    const g = [theme["grade-clinical"], theme["grade-multiple"], theme["grade-brand"], theme["grade-emerging"], theme["grade-unrated"]];
    assert.equal(new Set(g).size, g.length);
  }
});

test("globals.css uses the original fonts, with Korean fallbacks", () => {
  const css = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");
  for (const f of ["Karla", "Newsreader", "IBM Plex Mono", "Pretendard", "Noto Serif KR"]) assert.ok(css.includes(f), f);
});
