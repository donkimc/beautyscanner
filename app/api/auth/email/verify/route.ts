import { originOf } from "../../../../../auth/google";
import { SESSION_COOKIE, SESSION_TTL_SECONDS, authSecret, cookieHeader, createToken, safeNext, type SessionUser } from "../../../../../auth/session";
import { consumeLoginToken, upsertUser } from "../../../../../db/users";

// Consumes the single-use token (POST only, so link prefetchers can't use it up) and starts the session.
export async function POST(req: Request) {
  const { token, next } = (await req.json().catch(() => ({}))) as { token?: string; next?: string };
  const email = token ? await consumeLoginToken(token) : null;
  if (!email) return Response.json({ error: "invalid" }, { status: 400 });
  const user = await upsertUser(email, null, null);
  const session: SessionUser = { uid: user.id, email: user.email, name: user.name ?? user.email.split("@")[0] };
  const secure = originOf(req).startsWith("https");
  return Response.json(
    { ok: true, next: safeNext(next) },
    { headers: { "set-cookie": cookieHeader(SESSION_COOKIE, createToken(session, authSecret(), SESSION_TTL_SECONDS), SESSION_TTL_SECONDS, secure) } },
  );
}
