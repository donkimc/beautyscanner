import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { toCss } from "../design/css";
import tokens from "../design/tokens.json";
import { GRADE_LABEL } from "../lib/products";

test("app/tokens.css is in sync with design/tokens.json (run npm run tokens)", () => {
  assert.equal(readFileSync(new URL("../app/tokens.css", import.meta.url), "utf8"), toCss());
});

test("evidence grade colors come from design tokens", () => {
  for (const [grade, color] of Object.entries(tokens.grade)) {
    assert.equal(GRADE_LABEL[grade as keyof typeof GRADE_LABEL].color, color);
  }
});

test("evidence grade colors are distinct", () => {
  const colors = Object.values(tokens.grade);
  assert.equal(new Set(colors).size, colors.length);
});
