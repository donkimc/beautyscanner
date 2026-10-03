import assert from "node:assert/strict";
import { test } from "node:test";
import { DOCS } from "../content/legal";
import { fromAcceptLanguage, resolveLocale } from "../i18n/locale";
import { messages } from "../i18n/messages";
import { PRODUCTS, localized } from "../lib/products";

test("browser language picks Korean or English, honoring q-weights", () => {
  assert.equal(fromAcceptLanguage("ko-KR,ko;q=0.9,en;q=0.8"), "ko");
  assert.equal(fromAcceptLanguage("en-US,en;q=0.9,ko;q=0.8"), "en");
  assert.equal(fromAcceptLanguage("en;q=0.5, ko;q=0.9"), "ko");
  assert.equal(fromAcceptLanguage("ja-JP,ja;q=0.9"), "en");
  assert.equal(fromAcceptLanguage("ja,en;q=0.5"), "en");
  assert.equal(fromAcceptLanguage(null), "ko");
  assert.equal(fromAcceptLanguage("fr;q=0.9, ko;q=0"), "en");
});

test("an explicit language cookie wins over the browser setting", () => {
  assert.equal(resolveLocale("en", "ko-KR"), "en");
  assert.equal(resolveLocale("ko", "en-US"), "ko");
  assert.equal(resolveLocale("zz", "en-US"), "en");
  assert.equal(resolveLocale(undefined, "ko-KR"), "ko");
});

function shape(v: unknown): unknown {
  if (Array.isArray(v)) return [v.length, ...(v.length ? [shape(v[0])] : [])];
  if (v && typeof v === "object") return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, shape(x)]));
  return typeof v;
}

test("English and Korean messages have identical structure", () => {
  assert.deepEqual(shape(messages.en), shape(messages.ko));
});

test("survey option values match across languages", () => {
  const values = (l: "ko" | "en") => messages[l].survey.questions.map((q) => q.options.map((o) => o.value));
  assert.deepEqual(values("en"), values("ko"));
});

test("no message is empty", () => {
  const walk = (v: unknown, path: string) => {
    // Korean puts nothing before the rotating word, so that one field is intentionally empty.
    if (typeof v === "string") assert.ok(v.length > 0 || path === "messages.ko.landing.subPre", path);
    else if (Array.isArray(v)) v.forEach((x, i) => walk(x, `${path}[${i}]`));
    else if (v && typeof v === "object") Object.entries(v).forEach(([k, x]) => walk(x, `${path}.${k}`));
  };
  for (const [loc, m] of Object.entries(messages)) walk(m, `messages.${loc}`);
});

test("every product has English text", () => {
  for (const p of PRODUCTS) {
    assert.ok(p.en.name.length > 0 && p.en.evidence.length > 0, p.id);
    assert.equal(localized(p, "en").name, p.en.name);
    assert.equal(localized(p, "ko").name, p.name);
  }
});

test("legal documents exist in both languages with the same section count", () => {
  for (const id of ["terms", "privacy", "security"] as const) {
    assert.equal(DOCS[id].en.sections.length, DOCS[id].ko.sections.length, id);
    assert.ok(DOCS[id].en.sections.every((s) => s.h && (s.p?.length || s.ul?.length)), id);
  }
});

test("privacy policy discloses every processor the app uses", () => {
  const text = JSON.stringify(DOCS.privacy.en);
  for (const name of ["Railway", "Resend", "Google", "DeepSeek"]) assert.ok(text.includes(name), name);
});
