import assert from "node:assert/strict";
import { test } from "node:test";
import { recordConsents, listConsents } from "../db/consents";
import { listRoutines, saveRoutine } from "../db/routines";
import { consumeLoginToken, createLoginToken, deleteUser, upsertUser, MAX_TOKENS_PER_HOUR } from "../db/users";

// Runs against in-memory PGlite (no DATABASE_URL in tests).

test("login tokens are single use", async () => {
  const t = await createLoginToken("Single@Use.com");
  assert.ok(t);
  assert.equal(await consumeLoginToken(t!), "single@use.com");
  assert.equal(await consumeLoginToken(t!), null);
});

test("unknown and malformed tokens are rejected", async () => {
  assert.equal(await consumeLoginToken("nope"), null);
  assert.equal(await consumeLoginToken(""), null);
});

test("token creation is rate limited per email", async () => {
  let last: string | null = "x";
  for (let i = 0; i <= MAX_TOKENS_PER_HOUR; i++) last = await createLoginToken("limit@x.co");
  assert.equal(last, null);
});

test("upsert keeps one user per email and links earlier consents", async () => {
  await recordConsents([{ purpose: "terms", version: "v1", granted: true }], { email: "link@x.co", anonId: "a1" });
  const a = await upsertUser("Link@X.co", "Name");
  const b = await upsertUser("link@x.co");
  assert.equal(a.id, b.id);
  const consents = await listConsents(a.id);
  assert.equal(consents.length, 1);
});

test("routines are saved per user and deleted with the account", async () => {
  const u = await upsertUser("routine@x.co");
  await saveRoutine(u.id, { skinType: "dry" }, ["c1", "t1"], 19800);
  assert.equal((await listRoutines(u.id)).length, 1);
  await deleteUser(u.id);
  assert.equal((await listRoutines(u.id)).length, 0);
});

import { addToCart, cartCount, clearCart, listCart, removeFromCart, setQty } from "../db/cart";
import { getProfileAnswers, saveProfileAnswers, updateName } from "../db/profile";

test("the profile keeps the latest answers and an editable name", async () => {
  const u = await upsertUser("profile@x.co");
  assert.equal(await getProfileAnswers(u.id), null);
  await saveProfileAnswers(u.id, { skinType: "dry" });
  await saveProfileAnswers(u.id, { skinType: "oily" });
  assert.deepEqual(await getProfileAnswers(u.id), { skinType: "oily" });
  await updateName(u.id, "Mina");
  assert.equal((await upsertUser("profile@x.co")).name, "Mina");
});

test("the cart adds once per product, clamps quantity, removes and clears", async () => {
  const u = await upsertUser("cart@x.co");
  await addToCart(u.id, ["c1", "t1", "c1"], "morning");
  await addToCart(u.id, ["c1"], "evening"); // already there: untouched
  assert.deepEqual((await listCart(u.id)).map((r) => [r.product_id, r.qty, r.routine]).sort(), [["c1", 1, "morning"], ["t1", 1, "morning"]]);
  await setQty(u.id, "c1", 4);
  await setQty(u.id, "t1", 99);
  assert.deepEqual((await listCart(u.id)).map((r) => [r.product_id, r.qty]).sort(), [["c1", 4], ["t1", 9]]);
  assert.equal(await cartCount(u.id), 13);
  await removeFromCart(u.id, "c1");
  assert.equal((await listCart(u.id)).length, 1);
  await clearCart(u.id);
  assert.equal(await cartCount(u.id), 0);
});

test("a cart and profile belong to one user and are deleted with the account", async () => {
  const a = await upsertUser("own-a@x.co");
  const b = await upsertUser("own-b@x.co");
  await addToCart(a.id, ["c1"], null);
  await saveProfileAnswers(a.id, { x: 1 });
  assert.equal((await listCart(b.id)).length, 0);
  assert.equal(await getProfileAnswers(b.id), null);
  await deleteUser(a.id);
  assert.equal((await listCart(a.id)).length, 0);
  assert.equal(await getProfileAnswers(a.id), null);
});
