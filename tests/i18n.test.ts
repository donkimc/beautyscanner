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

test("survey option values and types match across languages", () => {
  const values = (l: "ko" | "en") => messages[l].survey.questions.map((q) => [q.key, q.type, q.icon, q.options.map((o) => o.value)]);
  assert.deepEqual(values("en"), values("ko"));
});

test("no message is empty", () => {
  const walk = (v: unknown, path: string) => {
    // Intentionally empty: Korean puts nothing before the rotating word; sunscreen has no evening tip (it isn't used at night).
    const allowedEmpty = path === "messages.ko.landing.subPre" || path.endsWith("routine.tips.sunscreen.evening");
    if (typeof v === "string") assert.ok(v.length > 0 || allowedEmpty, path);
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
  for (const name of ["Railway", "Resend", "Google", "DeepSeek", "Naver"]) assert.ok(text.includes(name), name);
});

test("price bands match the original survey page exactly", () => {
  const q = (l: "ko" | "en") => messages[l].survey.questions.find((x) => x.key === "budget")!;
  assert.deepEqual(q("ko").options.map((o) => o.label), ["3만원 이하", "3~7만원", "7~15만원", "15만원 이상"]);
  assert.equal(q("ko").title.replace("\n", " "), "선호하는 예산대는?");
  assert.equal(q("ko").sub, "제품 구매 시 기준이 되는 가격대예요");
  assert.deepEqual(q("ko").options.map((o) => o.value), [30000, 70000, 150000, 1000000]);
});

test("the five survey questions match the original page's wording", () => {
  const ko = messages.ko.survey.questions;
  assert.deepEqual(ko.map((q) => q.key), ["skinType", "concerns", "priority", "budget", "texture"]);
  assert.deepEqual(ko.map((q) => q.type), ["single", "multi", "single", "single", "single"]);
  assert.deepEqual(ko.map((q) => q.title.replace("\n", " ")), ["피부 타입은 무엇인가요?", "가장 신경 쓰이는 피부 고민은?", "가장 먼저 개선하고 싶은 것은?", "선호하는 예산대는?", "선호하는 제형이 있나요?"]);
  assert.deepEqual(ko[0].options.map((o) => o.label), ["건성", "지성", "복합성", "민감성", "잘 모르겠음"]);
  assert.deepEqual(ko[1].options.map((o) => o.label), ["여드름·트러블", "모공", "색소침착", "주름·탄력", "홍조", "건조함"]);
  assert.deepEqual(ko[2].options.map((o) => o.label), ["피부 톤 개선", "수분 채우기", "트러블 진정", "탄력 케어", "모공 관리"]);
  assert.deepEqual(ko[4].options.map((o) => o.label), ["가벼운 제형", "리치한 제형", "무향 제품", "저자극 제품", "비건·클린뷰티"]);
  assert.deepEqual(ko.map((q) => q.sub), ["가장 가깝다고 느끼는 타입을 선택해주세요", "해당하는 항목을 모두 선택해주세요", "우선순위 하나만 골라주세요", "제품 구매 시 기준이 되는 가격대예요", "사용감을 기준으로 골라주세요"]);
});
