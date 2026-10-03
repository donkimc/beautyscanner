import assert from "node:assert/strict";
import { test } from "node:test";
import { GET as cartGet, POST as cartPost, PATCH as cartPatch, DELETE as cartDelete } from "../app/api/cart/route";
import { GET as profileGet, PUT as profilePut } from "../app/api/profile/route";
import { POST as routinesPost } from "../app/api/routines/route";
import { GET as meGet } from "../app/api/auth/me/route";
import { GET as exportGet } from "../app/api/account/export/route";
import { SESSION_COOKIE, authSecret, createToken } from "../auth/session";
import { upsertUser } from "../db/users";
import type { Answers } from "../lib/recommend";

// Calls the route handlers directly, with a real signed session cookie.
async function asUser(email: string) {
  const u = await upsertUser(email);
  const token = createToken({ uid: u.id, email: u.email, name: "T" }, authSecret(), 600);
  return (path: string, init: RequestInit & { json?: unknown } = {}) =>
    new Request(`http://x.test${path}`, {
      method: init.method ?? "GET",
      headers: { cookie: `${SESSION_COOKIE}=${token}`, "content-type": "application/json" },
      body: init.json === undefined ? undefined : JSON.stringify(init.json),
    });
}
const anon = (path: string, method = "GET", json?: unknown) => new Request(`http://x.test${path}`, { method, headers: { "content-type": "application/json" }, body: json === undefined ? undefined : JSON.stringify(json) });
const answers: Answers = { skinType: "dry", concerns: ["dryness"], priority: "hydration", budget: 70000, texture: "light", note: "" };

test("cart, profile and routines need a login", async () => {
  for (const res of [await cartGet(anon("/api/cart")), await cartPost(anon("/api/cart", "POST", { productIds: ["c1"] })), await cartPatch(anon("/api/cart", "PATCH", {})), await cartDelete(anon("/api/cart", "DELETE")), await profileGet(anon("/api/profile")), await profilePut(anon("/api/profile", "PUT", { name: "x" })), await routinesPost(anon("/api/routines", "POST", {})), await exportGet(anon("/api/account/export"))]) {
    assert.equal(res.status, 401);
  }
});

test("cart: add, list, change quantity, remove, empty", async () => {
  const req = await asUser("cart-api@x.co");
  assert.equal((await cartPost(req("/api/cart", { method: "POST", json: { productIds: ["c1", "t1"], routine: "evening" } }))).status, 200);
  let items = (await (await cartGet(req("/api/cart"))).json()).items;
  assert.deepEqual(items.map((i: { productId: string; routine: string }) => [i.productId, i.routine]).sort(), [["c1", "evening"], ["t1", "evening"]]);
  await cartPatch(req("/api/cart", { method: "PATCH", json: { productId: "c1", qty: 3 } }));
  items = (await (await cartGet(req("/api/cart"))).json()).items;
  assert.equal(items.find((i: { productId: string }) => i.productId === "c1").qty, 3);
  assert.equal((await (await meGet(req("/api/auth/me"))).json()).cartCount, 4);
  await cartDelete(req("/api/cart?productId=c1", { method: "DELETE" }));
  assert.equal((await (await cartGet(req("/api/cart"))).json()).items.length, 1);
  await cartDelete(req("/api/cart", { method: "DELETE" }));
  assert.equal((await (await cartGet(req("/api/cart"))).json()).items.length, 0);
});

test("cart rejects unknown products, bad quantities and oversized requests", async () => {
  const req = await asUser("cart-bad@x.co");
  for (const json of [{ productIds: ["nope"] }, { productIds: [] }, { productIds: "c1" }, { productIds: Array(11).fill("c1") }, {}]) {
    assert.equal((await cartPost(req("/api/cart", { method: "POST", json }))).status, 400);
  }
  assert.equal((await cartPatch(req("/api/cart", { method: "PATCH", json: { productId: "c1", qty: "3" } }))).status, 400);
  assert.equal((await cartPatch(req("/api/cart", { method: "PATCH", json: { productId: "nope", qty: 3 } }))).status, 400);
  assert.equal((await cartDelete(req("/api/cart?productId=nope", { method: "DELETE" }))).status, 400);
});

test("users only see their own cart", async () => {
  const a = await asUser("iso-a@x.co");
  const b = await asUser("iso-b@x.co");
  await cartPost(a("/api/cart", { method: "POST", json: { productIds: ["c1"] } }));
  assert.equal((await (await cartGet(b("/api/cart"))).json()).items.length, 0);
});

test("profile: edit the name and the saved answers, with validation", async () => {
  const req = await asUser("profile-api@x.co");
  assert.equal((await (await profileGet(req("/api/profile"))).json()).answers, null);
  assert.equal((await profilePut(req("/api/profile", { method: "PUT", json: { name: "  Mina  ", answers } }))).status, 200);
  const p = await (await profileGet(req("/api/profile"))).json();
  assert.equal(p.name, "Mina");
  assert.deepEqual(p.answers, answers);
  assert.equal((await profilePut(req("/api/profile", { method: "PUT", json: { name: "" } }))).status, 400);
  assert.equal((await profilePut(req("/api/profile", { method: "PUT", json: { name: "x".repeat(61) } }))).status, 400);
  assert.equal((await profilePut(req("/api/profile", { method: "PUT", json: { answers: { skinType: "dry" } } }))).status, 400);
  assert.equal((await profilePut(req("/api/profile", { method: "PUT", json: {} }))).status, 400);
});

test("saving a routine also saves the profile, and the export includes cart and profile", async () => {
  const req = await asUser("save-api@x.co");
  const res = await routinesPost(req("/api/routines", { method: "POST", json: { answers, productIds: ["c1", "m1"], total: 21800 } }));
  assert.equal(res.status, 200);
  assert.deepEqual((await (await profileGet(req("/api/profile"))).json()).answers, answers);
  await cartPost(req("/api/cart", { method: "POST", json: { productIds: ["c1"] } }));
  const exported = await (await exportGet(req("/api/account/export"))).json();
  assert.deepEqual(Object.keys(exported).sort(), ["cart", "consents", "exportedAt", "profile", "routines", "user"]);
  assert.equal(exported.cart.length, 1);
});
