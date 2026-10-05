import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { GET as adminNaver } from "../app/api/admin/naver/route";
import { DELETE as listingDelete, POST as listingPost } from "../app/api/admin/listings/route";
import { POST as refreshPost } from "../app/api/admin/listings/refresh/route";
import { DELETE as productDelete, POST as productPost } from "../app/api/admin/products/route";
import { POST as cronPost } from "../app/api/cron/refresh-listings/route";
import { GET as catalogGet } from "../app/api/catalog/route";
import { SESSION_COOKIE, authSecret, createToken } from "../auth/session";
import { isAdminEmail } from "../auth/admin";
import { invalidateCatalog, loadCatalog } from "../catalog/load";
import { refreshListings } from "../catalog/refresh";
import { listListings } from "../db/catalog";
import { applyListing, isAllowedImage, isOwnImage, mergeCatalog, parseNewProduct, type Listing } from "../lib/catalog";
import { PRODUCTS } from "../lib/products";
import { buildRoutine } from "../lib/recommend";

const realFetch = globalThis.fetch;
const saved = { ...process.env };
afterEach(() => { globalThis.fetch = realFetch; process.env = { ...saved }; invalidateCatalog(); });

const listing = (o: Partial<Listing> = {}): Listing => ({ productId: "r1", naverProductId: "9", title: "비플레인 클렌징폼", imageUrl: "https://shopping-phinf.pstatic.net/x.jpg", link: "https://search.shopping.naver.com/catalog/9", price: 12500, mall: "네이버", approved: true, fetchedAt: "2026-10-04T00:00:00.000Z", ...o });
const r1 = () => PRODUCTS.find((p) => p.id === "r1")!;

test("an approved listing supplies the photo, quoted price and a plain (non-AD) retailer link", () => {
  const p = applyListing(r1(), listing());
  assert.equal(p.image, "https://shopping-phinf.pstatic.net/x.jpg");
  assert.equal(p.price, 12500);
  assert.equal(p.approxPrice, false);
  assert.equal(p.urlKind, "retailer");
  assert.equal(p.priceSource, "naver");
  assert.deepEqual(applyListing(r1(), listing({ approved: false })), r1());
});

test("the merged catalog adds admin products, applies listings, and can hide samples", () => {
  const extra = { ...PRODUCTS[0], id: "nabc123", real: true, name: "새 제품" };
  const merged = mergeCatalog([extra, { ...PRODUCTS[0], id: "c01" }], [listing()]);
  assert.equal(merged.length, PRODUCTS.length + 1); // the duplicate id c1 is ignored
  assert.equal(merged.find((p) => p.id === "r1")!.price, 12500);
  assert.ok(merged.some((p) => p.id === "nabc123"));
  assert.ok(mergeCatalog([extra], [], { hideSamples: true }).every((p) => p.real));
});

test("the recommender can run on a merged catalog (the real price changes the routine total)", () => {
  const a = { skinType: "dry", concerns: ["dryness"], priority: "hydration", budget: 150000, texture: "light", note: "" } as const;
  const base = buildRoutine({ ...a, concerns: [...a.concerns] });
  const cheaper = buildRoutine({ ...a, concerns: [...a.concerns] }, mergeCatalog([], [listing({ productId: "r3", price: 1000 })]));
  assert.ok(cheaper.total < base.total);
});

test("images may only come from Naver's CDN", () => {
  assert.equal(isAllowedImage("https://shopping-phinf.pstatic.net/a.jpg"), true);
  assert.equal(isAllowedImage("https://evil.example.com/a.jpg"), false);
  assert.equal(isAllowedImage("https://pstatic.net.evil.com/a.jpg"), false);
  assert.equal(isAllowedImage("http://shopping-phinf.pstatic.net/a.jpg"), false);
  assert.equal(isAllowedImage("javascript:alert(1)"), false);
  assert.equal(isAllowedImage("http://localhost:4010/a.jpg", "localhost"), true);
});

test("new product input is validated", () => {
  const ok = { name: "새 제품", step: "serum", concerns: ["dryness"], texture: "light", time: "both", price: 15000 };
  const r = parseNewProduct(ok);
  assert.ok(r.ok && r.product.real && r.product.grade === "unrated" && r.product.en.name === "새 제품");
  for (const [bad, field] of [[{ ...ok, name: "" }, "name"], [{ ...ok, step: "x" }, "step"], [{ ...ok, concerns: [] }, "concerns"], [{ ...ok, concerns: ["nope"] }, "concerns"], [{ ...ok, texture: "x" }, "texture"], [{ ...ok, time: "x" }, "time"], [{ ...ok, price: 5 }, "price"], [{ ...ok, grade: "gold" }, "grade"]] as const) {
    const res = parseNewProduct(bad);
    assert.ok(!res.ok && res.error === field, field);
  }
  assert.equal(parseNewProduct(null).ok, false);
});

test("admins come from ADMIN_EMAILS only", () => {
  assert.equal(isAdminEmail("A@x.co", { ADMIN_EMAILS: " a@x.co, b@x.co " }), true);
  assert.equal(isAdminEmail("c@x.co", { ADMIN_EMAILS: "a@x.co" }), false);
  assert.equal(isAdminEmail("a@x.co", {}), false);
  assert.equal(isAdminEmail(null, { ADMIN_EMAILS: "a@x.co" }), false);
});

const cookie = (email: string) => `${SESSION_COOKIE}=${createToken({ uid: "00000000-0000-0000-0000-000000000000", email, name: "A" }, authSecret(), 600)}`;
const req = (path: string, email: string | null, method = "GET", json?: unknown) =>
  new Request(`http://x.test${path}`, { method, headers: { ...(email ? { cookie: cookie(email) } : {}), "content-type": "application/json" }, body: json === undefined ? undefined : JSON.stringify(json) });
const naverItem = (o: Record<string, unknown> = {}) => ({ title: "<b>비플레인</b> 녹두 약산성 클렌징폼", link: "https://search.shopping.naver.com/catalog/9", image: "https://shopping-phinf.pstatic.net/x.jpg", lprice: "11900", mallName: "네이버", productId: "9", productType: "1", brand: "비플레인", maker: "비플레인", category1: "화장품/미용", ...o });
const stubNaver = (items: unknown[], status = 200) => { globalThis.fetch = (async () => new Response(JSON.stringify({ items }), { status })) as typeof fetch; };

test("admin endpoints answer 404 to guests and to non-admins", async () => {
  process.env.ADMIN_EMAILS = "admin@x.co";
  const calls: [string, () => Promise<Response>][] = [
    ["search", () => adminNaver(req("/api/admin/naver?query=x", null))],
    ["listing", () => listingPost(req("/api/admin/listings", "user@x.co", "POST", {}))],
    ["unlink", () => listingDelete(req("/api/admin/listings?productId=r1", "user@x.co", "DELETE"))],
    ["refresh", () => refreshPost(req("/api/admin/listings/refresh", "user@x.co", "POST", {}))],
    ["product", () => productPost(req("/api/admin/products", "user@x.co", "POST", {}))],
  ];
  for (const [name, call] of calls) assert.equal((await call()).status, 404, name);
});

test("admin: search Naver, approve a listing, and the public catalog shows it", async () => {
  Object.assign(process.env, { ADMIN_EMAILS: "admin@x.co", NAVER_CLIENT_ID: "id", NAVER_CLIENT_SECRET: "s" });
  stubNaver([naverItem(), naverItem({ productId: "10", title: "비플레인 녹두 클렌징폼 기획세트 1+1", lprice: "20000" })]);
  const search = await adminNaver(req("/api/admin/naver?query=" + encodeURIComponent("비플레인 녹두 약산성 클렌징폼") + "&brand=" + encodeURIComponent("비플레인"), "admin@x.co"));
  const { candidates } = await search.json();
  assert.equal(candidates[0].naverProductId, "9");
  assert.equal(candidates[0].suggested, true);

  const approve = await listingPost(req("/api/admin/listings", "admin@x.co", "POST", { productId: "r1", candidate: candidates[0] }));
  assert.equal(approve.status, 200);
  const { products } = await (await catalogGet()).json();
  const r1p = products.find((p: { id: string }) => p.id === "r1");
  assert.equal(r1p.price, 11900);
  assert.equal(r1p.image, "https://shopping-phinf.pstatic.net/x.jpg");
  assert.equal(r1p.urlKind, "retailer");

  assert.equal((await listingDelete(req("/api/admin/listings?productId=r1", "admin@x.co", "DELETE"))).status, 200);
  assert.equal((await (await catalogGet()).json()).products.find((p: { id: string }) => p.id === "r1").price, 13000);
});

test("admin: search reports a missing key, bad input and Naver failures", async () => {
  process.env.ADMIN_EMAILS = "admin@x.co";
  delete process.env.NAVER_CLIENT_ID;
  assert.equal((await adminNaver(req("/api/admin/naver?query=x", "admin@x.co"))).status, 503);
  Object.assign(process.env, { NAVER_CLIENT_ID: "id", NAVER_CLIENT_SECRET: "s" });
  assert.equal((await adminNaver(req("/api/admin/naver?query=", "admin@x.co"))).status, 400);
  stubNaver([], 429);
  assert.equal((await adminNaver(req("/api/admin/naver?query=x", "admin@x.co"))).status, 429);
});

test("admin: a listing with an image from another host is rejected", async () => {
  process.env.ADMIN_EMAILS = "admin@x.co";
  const bad = { ...naverItem(), image: "https://evil.example.com/x.jpg", price: 11900, naverProductId: "9" };
  assert.equal((await listingPost(req("/api/admin/listings", "admin@x.co", "POST", { productId: "r1", candidate: bad }))).status, 400);
  assert.equal((await listingPost(req("/api/admin/listings", "admin@x.co", "POST", { productId: "nope", candidate: { ...bad, image: "https://shopping-phinf.pstatic.net/x.jpg" } }))).status, 400);
  assert.equal((await listListings()).filter((l) => l.product_id === "r1").length, 0);
});

test("admin: add a product from a Naver candidate, then remove it", async () => {
  process.env.ADMIN_EMAILS = "admin@x.co";
  const candidate = { naverProductId: "55", title: "새 선크림", image: "https://shopping-phinf.pstatic.net/s.jpg", link: "https://search.shopping.naver.com/catalog/55", price: 14500, mall: "네이버", category: ["화장품/미용"] };
  const product = { name: "새 선크림", step: "sunscreen", concerns: ["pigmentation"], texture: "light", time: "am", price: 14500, sensitiveSafe: true };
  const created = await productPost(req("/api/admin/products", "admin@x.co", "POST", { product, candidate }));
  assert.equal(created.status, 200);
  const { id } = await created.json();
  const added = (await loadCatalog()).find((p) => p.id === id)!;
  assert.ok(added.real && added.image === candidate.image && added.price === 14500 && added.step === "sunscreen");
  assert.equal((await productPost(req("/api/admin/products", "admin@x.co", "POST", { product: { ...product, step: "x" } }))).status, 400);
  assert.equal((await productDelete(req(`/api/admin/products?id=${id}`, "admin@x.co", "DELETE"))).status, 200);
  assert.equal((await loadCatalog()).some((p) => p.id === id), false);
  assert.equal((await productDelete(req("/api/admin/products?id=r1", "admin@x.co", "DELETE"))).status, 400); // built-in products can't be removed here
});

test("refresh updates the price of an approved listing, reports missing ones, and stops on quota", async () => {
  Object.assign(process.env, { ADMIN_EMAILS: "admin@x.co", NAVER_CLIENT_ID: "id", NAVER_CLIENT_SECRET: "s" });
  stubNaver([naverItem()]);
  await listingPost(req("/api/admin/listings", "admin@x.co", "POST", { productId: "r1", candidate: { ...naverItem(), image: naverItem().image, price: 11900, naverProductId: "9", title: "비플레인 녹두 약산성 클렌징폼" } }));
  stubNaver([naverItem({ lprice: "10900" })]);
  let summary = await refreshListings("r1");
  assert.deepEqual(summary.updated, ["r1"]);
  assert.equal((await listListings()).find((l) => l.product_id === "r1")!.price, 10900);
  stubNaver([naverItem({ productId: "other" })]);
  summary = await refreshListings("r1");
  assert.deepEqual(summary.missing, ["r1"]);
  stubNaver([], 429);
  assert.equal((await refreshListings("r1")).stopped, "quota");
  await listingDelete(req("/api/admin/listings?productId=r1", "admin@x.co", "DELETE"));
});

test("the cron endpoint needs the secret", async () => {
  process.env.CRON_SECRET = "s3cret";
  const call = (auth?: string) => cronPost(new Request("http://x.test/api/cron/refresh-listings", { method: "POST", headers: auth ? { authorization: auth } : {} }));
  assert.equal((await call()).status, 404);
  assert.equal((await call("Bearer wrong")).status, 404);
  delete process.env.CRON_SECRET;
  assert.equal((await call("Bearer ")).status, 404);
  process.env.CRON_SECRET = "s3cret";
  assert.equal((await call("Bearer s3cret")).status, 200);
});

test("manual listings: only own photos, keep the existing photo when none is given", () => {
  assert.ok(isOwnImage("/products/beplain.jpg"));
  assert.ok(!isOwnImage("https://example.com/a.jpg"));
  assert.ok(!isOwnImage("/products/../secret.jpg"));
  const base = PRODUCTS.find((p) => p.real)!;
  const out = applyListing(base, { productId: base.id, naverProductId: null, title: base.name, imageUrl: "", link: "https://shop.example/p/1", price: 15000, mall: "내 스토어", approved: true, fetchedAt: "2026-10-04T00:00:00.000Z" });
  assert.equal(out.image, base.image);
  assert.equal(out.price, 15000);
  assert.equal(out.retailer, "내 스토어");
  assert.equal(out.priceSource, "manual");
});
