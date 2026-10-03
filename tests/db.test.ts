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
