import assert from "node:assert/strict";
import { test } from "node:test";
import { buildAuthUrl, challengeFor, isConfigured, originOf } from "../auth/google";
import { cookieHeader, createToken, readCookie, safeNext, verifyToken } from "../auth/session";

const secret = "test-secret";

test("a signed token round-trips", () => {
  const t = createToken({ email: "a@b.co" }, secret, 60);
  assert.equal(verifyToken<{ email: string }>(t, secret)?.email, "a@b.co");
});

test("tampered, wrong-secret and expired tokens are rejected", () => {
  const t = createToken({ email: "a@b.co" }, secret, 60, 1_000_000);
  const [body, sig] = t.split(".");
  const forged = Buffer.from(JSON.stringify({ email: "evil@x.co", exp: 9_999_999_999 })).toString("base64url");
  assert.equal(verifyToken(`${forged}.${sig}`, secret, 1_000_000), null);
  assert.equal(verifyToken(t, "other-secret", 1_000_000), null);
  assert.equal(verifyToken(t, secret, 1_000_000 + 61_000), null);
  assert.equal(verifyToken(undefined, secret), null);
  assert.equal(verifyToken(`${body}`, secret), null);
});

test("empty secret never validates", () => {
  assert.equal(verifyToken(createToken({}, "", 60), "", Date.now()), null);
});

test("safeNext blocks open redirects", () => {
  assert.equal(safeNext("/try?resume=1"), "/try?resume=1");
  for (const bad of ["https://evil.com", "//evil.com", "/\\evil.com", "javascript:alert(1)", "", null, undefined]) {
    assert.equal(safeNext(bad as string | null | undefined), "/", String(bad));
  }
});

test("cookies are HttpOnly and SameSite=Lax, Secure only on https", () => {
  assert.match(cookieHeader("a", "b", 10, true), /HttpOnly; SameSite=Lax; Max-Age=10; Secure$/);
  assert.doesNotMatch(cookieHeader("a", "b", 10, false), /Secure/);
  assert.equal(readCookie("x=1; bs_session=abc; y=2", "bs_session"), "abc");
});

test("Google auth URL uses code flow with PKCE and state", () => {
  const url = new URL(buildAuthUrl({ clientId: "cid", redirectUri: "https://x.app/cb", state: "st", verifier: "ver" }));
  assert.equal(url.origin + url.pathname, "https://accounts.google.com/o/oauth2/v2/auth");
  assert.equal(url.searchParams.get("response_type"), "code");
  assert.equal(url.searchParams.get("state"), "st");
  assert.equal(url.searchParams.get("code_challenge"), challengeFor("ver"));
  assert.equal(url.searchParams.get("code_challenge_method"), "S256");
  assert.equal(url.searchParams.get("redirect_uri"), "https://x.app/cb");
});

test("login is configured only when all three secrets exist", () => {
  assert.equal(isConfigured({ GOOGLE_CLIENT_ID: "a", GOOGLE_CLIENT_SECRET: "b", AUTH_SECRET: "c" } as never), true);
  assert.equal(isConfigured({ GOOGLE_CLIENT_ID: "a", GOOGLE_CLIENT_SECRET: "b" } as never), false);
});

test("public origin comes from AUTH_URL, else forwarded headers", () => {
  const req = new Request("http://localhost:8080/x", { headers: { "x-forwarded-host": "app.up.railway.app", "x-forwarded-proto": "https" } });
  assert.equal(originOf(req, {} as never), "https://app.up.railway.app");
  assert.equal(originOf(req, { AUTH_URL: "https://custom.kr/" } as never), "https://custom.kr");
});

test("production without AUTH_SECRET has no usable secret; development gets a stable per-process one", async () => {
  const { authSecret } = await import("../auth/session");
  const env = process.env as Record<string, string | undefined>;
  const saved = { s: env.AUTH_SECRET, n: env.NODE_ENV };
  try {
    delete env.AUTH_SECRET;
    env.NODE_ENV = "production";
    assert.equal(authSecret(), "");
    env.NODE_ENV = "development";
    assert.ok(authSecret().length >= 32);
    assert.equal(authSecret(), authSecret());
    env.AUTH_SECRET = "explicit";
    assert.equal(authSecret(), "explicit");
  } finally {
    if (saved.s === undefined) delete env.AUTH_SECRET; else env.AUTH_SECRET = saved.s;
    env.NODE_ENV = saved.n;
  }
});
