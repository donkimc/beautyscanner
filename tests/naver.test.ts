import assert from "node:assert/strict";
import { test } from "node:test";
import { rankCandidates, scoreCandidate } from "../retailer/match";
import { NaverError, naverConfigured, normalizeItem, searchNaver, stripHtml, type Candidate } from "../retailer/naver";

const env = { NAVER_CLIENT_ID: "id", NAVER_CLIENT_SECRET: "secret" };
const item = (o: Record<string, unknown> = {}) => ({
  title: "<b>토리든</b> 다이브인 저분자 히알루론산 세럼 50ml", link: "https://search.shopping.naver.com/catalog/1", image: "https://shopping-phinf.pstatic.net/a.jpg",
  lprice: "16900", hprice: "", mallName: "네이버", productId: "100", productType: "1", brand: "토리든", maker: "토리든", category1: "화장품/미용", category2: "스킨케어", category3: "에센스/앰플", category4: "", ...o,
});
const fakeFetch = (status: number, body: unknown) => (async () => new Response(JSON.stringify(body), { status })) as unknown as typeof fetch;

test("html tags and entities are stripped from titles", () => {
  assert.equal(stripHtml("<b>토리든</b> A&amp;B &quot;세럼&quot;"), '토리든 A&B "세럼"');
});

test("an item is normalized; incomplete or free ones are dropped", () => {
  const c = normalizeItem(item())!;
  assert.equal(c.title, "토리든 다이브인 저분자 히알루론산 세럼 50ml");
  assert.equal(c.price, 16900);
  assert.deepEqual(c.category, ["화장품/미용", "스킨케어", "에센스/앰플"]);
  assert.equal(normalizeItem(item({ lprice: "0" })), null);
  assert.equal(normalizeItem(item({ image: "" })), null);
  assert.equal(normalizeItem(item({ link: "javascript:alert(1)" })), null);
  assert.equal(normalizeItem(null), null);
});

test("search sends the keys and a safe query, and returns normalized candidates", async () => {
  let seen: { url: URL; headers: Record<string, string> } | null = null;
  const f = (async (url: URL, init: RequestInit) => { seen = { url, headers: init.headers as Record<string, string> }; return new Response(JSON.stringify({ items: [item(), { bad: true }] })); }) as unknown as typeof fetch;
  const out = await searchNaver("  토리든 세럼  ", { env, fetchImpl: f, display: 500 });
  assert.equal(out.length, 1);
  assert.equal(seen!.url.pathname, "/v1/search/shop.json");
  assert.equal(seen!.url.searchParams.get("query"), "토리든 세럼");
  assert.equal(seen!.url.searchParams.get("display"), "30");
  assert.equal(seen!.url.searchParams.get("exclude"), "used:rental:cbshop");
  assert.equal(seen!.headers["X-Naver-Client-Id"], "id");
  assert.equal(seen!.headers["X-Naver-Client-Secret"], "secret");
});

test("errors are mapped to clear codes", async () => {
  const code = async (p: Promise<unknown>) => { try { await p; return "ok"; } catch (e) { return e instanceof NaverError ? e.code : "other"; } };
  assert.equal(await code(searchNaver("x", { env: {}, fetchImpl: fakeFetch(200, {}) })), "not_configured");
  assert.equal(await code(searchNaver("   ", { env, fetchImpl: fakeFetch(200, {}) })), "bad_request");
  assert.equal(await code(searchNaver("x", { env, fetchImpl: fakeFetch(401, {}) })), "auth");
  assert.equal(await code(searchNaver("x", { env, fetchImpl: fakeFetch(429, {}) })), "quota");
  assert.equal(await code(searchNaver("x", { env, fetchImpl: fakeFetch(500, {}) })), "server");
  assert.equal(await code(searchNaver("x", { env, fetchImpl: (async () => { throw new Error("down"); }) as unknown as typeof fetch })), "network");
  assert.equal(naverConfigured(env), true);
  assert.equal(naverConfigured({ NAVER_CLIENT_ID: "id" }), false);
});

const cand = (o: Partial<Candidate>): Candidate => ({ naverProductId: "1", title: "", image: "https://x/a.jpg", link: "https://x", price: 10000, mall: "", brand: "", maker: "", category: ["화장품/미용"], productType: 1, ...o });

test("matching ranks the right listing first and penalizes bundles and non-cosmetics", () => {
  const q = { name: "토리든 다이브인 저분자 히알루론산 세럼", brand: "토리든" };
  const ranked = rankCandidates(q, [
    cand({ naverProductId: "bundle", title: "토리든 다이브인 저분자 히알루론산 세럼 기획세트 1+1", brand: "토리든", price: 20000 }),
    cand({ naverProductId: "right", title: "토리든 다이브인 저분자 히알루론산 세럼 50ml", brand: "토리든", price: 16900 }),
    cand({ naverProductId: "other", title: "아누아 PDRN 세럼", brand: "아누아" }),
    cand({ naverProductId: "food", title: "토리든 다이브인 저분자 히알루론산 세럼 맛", category: ["식품"] }),
  ]);
  assert.equal(ranked[0].naverProductId, "right");
  assert.equal(ranked[0].suggested, true);
  assert.ok(ranked.find((r) => r.naverProductId === "bundle")!.score < ranked[0].score);
  assert.ok(ranked.find((r) => r.naverProductId === "food")!.score < ranked.find((r) => r.naverProductId === "bundle")!.score);
  assert.equal(ranked.filter((r) => r.suggested).length, 1);
});

test("a poor best match is not suggested", () => {
  const ranked = rankCandidates({ name: "비플레인 녹두 약산성 클렌징폼" }, [cand({ title: "전혀 다른 제품 이름" })]);
  assert.equal(ranked[0].suggested, false);
  assert.equal(scoreCandidate({ name: "" }, cand({ title: "x" })), 0);
});

import { guessStep } from "../retailer/match";

test("the routine step is guessed from the category and title", () => {
  assert.equal(guessStep(["화장품/미용", "스킨케어", "클렌징폼"], "비플레인 녹두 클렌징폼"), "cleanser");
  assert.equal(guessStep(["화장품/미용", "스킨케어", "스킨/토너"], "에스네이처 아쿠아 오아시스 토너"), "toner");
  assert.equal(guessStep(["화장품/미용", "스킨케어", "에센스/앰플"], "토리든 세럼"), "serum");
  assert.equal(guessStep(["화장품/미용", "스킨케어", "수분크림"], "세라마이드 크림"), "moisturizer");
  assert.equal(guessStep(["화장품/미용", "선케어", "선크림"], "무기자차 SPF50+"), "sunscreen");
  assert.equal(guessStep(["화장품/미용"], "정체불명"), null);
});
