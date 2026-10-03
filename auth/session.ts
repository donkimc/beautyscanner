import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

// Stateless signed-cookie session (HMAC-SHA256). No database needed for the MVP.

export const SESSION_COOKIE = "bs_session";
export const OAUTH_COOKIE = "bs_oauth";
export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

export interface SessionUser {
  uid: string;
  email: string;
  name: string;
  picture?: string;
}

// Reads and verifies the session cookie from a request.
export function sessionFromHeader(cookie: string | null): SessionUser | null {
  return verifyToken<SessionUser>(readCookie(cookie, SESSION_COOKIE), authSecret());
}

export const sessionFrom = (req: Request): SessionUser | null => sessionFromHeader(req.headers.get("cookie"));

const b64 = (s: string | Buffer) => Buffer.from(s).toString("base64url");

function sign(body: string, secret: string): string {
  return createHmac("sha256", secret).update(body).digest("base64url");
}

export function createToken(payload: object, secret: string, ttlSeconds: number, now = Date.now()): string {
  const body = b64(JSON.stringify({ ...payload, exp: Math.floor(now / 1000) + ttlSeconds }));
  return `${body}.${sign(body, secret)}`;
}

export function verifyToken<T>(token: string | undefined, secret: string, now = Date.now()): T | null {
  if (!token || !secret) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = sign(body, secret);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const data = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as T & { exp: number };
    return data.exp > Math.floor(now / 1000) ? data : null;
  } catch {
    return null;
  }
}

export function readCookie(header: string | null, name: string): string | undefined {
  return header
    ?.split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${name}=`))
    ?.slice(name.length + 1);
}

export function cookieHeader(name: string, value: string, maxAge: number, secure: boolean): string {
  return `${name}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure ? "; Secure" : ""}`;
}

export function randomString(bytes = 24): string {
  return randomBytes(bytes).toString("base64url");
}

// Only same-site relative paths are allowed as post-login redirects.
export function safeNext(next: string | null | undefined): string {
  return next && next.startsWith("/") && !next.startsWith("//") && !next.includes("\\") ? next : "/";
}

// Production must set AUTH_SECRET. In development a random per-process secret is used so login works out of the box.
export function authSecret(): string {
  if (process.env.AUTH_SECRET) return process.env.AUTH_SECRET;
  if (process.env.NODE_ENV === "production") return "";
  const g = globalThis as unknown as { __bsDevSecret?: string };
  return (g.__bsDevSecret ??= randomString(32));
}
