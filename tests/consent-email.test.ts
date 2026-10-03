import assert from "node:assert/strict";
import { test } from "node:test";
import { CONSENT_VERSIONS, PURPOSES, REQUIRED, decided, granted, isPurpose } from "../consent/purposes";
import { loginEmail } from "../email/templates";
import { messages } from "../i18n/messages";

test("every consent purpose has text in both languages", () => {
  for (const p of PURPOSES) {
    for (const l of ["ko", "en"] as const) {
      assert.ok(messages[l].consent.purposes[p].label && messages[l].consent.purposes[p].body, `${l}.${p}`);
    }
  }
});

test("terms and sensitive data are required; AI transfer and marketing are optional", () => {
  assert.deepEqual(REQUIRED, { terms: true, sensitive: true, ai: false, marketing: false });
});

test("a consent decided under an old version is asked again", () => {
  const old = { sensitive: { granted: true, version: "1999-01-01", at: "x" } };
  assert.equal(granted(old, "sensitive"), false);
  assert.equal(decided(old, "sensitive"), false);
  const current = { sensitive: { granted: true, version: CONSENT_VERSIONS.sensitive, at: "x" } };
  assert.equal(granted(current, "sensitive"), true);
  const declined = { ai: { granted: false, version: CONSENT_VERSIONS.ai, at: "x" } };
  assert.equal(decided(declined, "ai"), true);
  assert.equal(granted(declined, "ai"), false);
});

test("only known purposes are accepted", () => {
  assert.equal(isPurpose("marketing"), true);
  assert.equal(isPurpose("anything"), false);
});

test("login email is localized, contains the link, and escapes it", () => {
  const link = 'https://x.app/auth/verify?token=a"b&next=%2F';
  const ko = loginEmail("ko", link, 15);
  const en = loginEmail("en", link, 15);
  assert.match(ko.subject, /로그인/);
  assert.match(en.subject, /login/i);
  assert.ok(ko.text.includes(link) && en.text.includes(link));
  assert.ok(!en.html.includes('a"b') && en.html.includes("&quot;"));
  assert.match(en.text, /15 minutes/);
});
