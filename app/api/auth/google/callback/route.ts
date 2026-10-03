import { fetchProfile, isConfigured, originOf } from "../../../../../auth/google";
import { upsertUser } from "../../../../../db/users";
import {
  OAUTH_COOKIE, SESSION_COOKIE, SESSION_TTL_SECONDS, authSecret, cookieHeader, createToken, readCookie, verifyToken,
  type SessionUser,
} from "../../../../../auth/session";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const origin = originOf(req);
  const secure = origin.startsWith("https");
  const fail = (reason: string) => {
    const headers = new Headers({ location: `${origin}/login?error=${reason}` });
    headers.append("set-cookie", cookieHeader(OAUTH_COOKIE, "", 0, secure));
    return new Response(null, { status: 302, headers });
  };

  if (!isConfigured()) return fail("not_configured");
  if (url.searchParams.get("error")) return fail("denied");

  const saved = verifyToken<{ state: string; verifier: string; next: string }>(
    readCookie(req.headers.get("cookie"), OAUTH_COOKIE),
    authSecret(),
  );
  const code = url.searchParams.get("code");
  if (!saved || !code || saved.state !== url.searchParams.get("state")) return fail("invalid_state");

  try {
    const p = await fetchProfile({
      code,
      verifier: saved.verifier,
      redirectUri: `${origin}/api/auth/google/callback`,
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    });
    if (!p.email || p.email_verified === false) return fail("unverified_email");
    const dbUser = await upsertUser(p.email, p.name ?? null, null);
    const user: SessionUser = { uid: dbUser.id, email: dbUser.email, name: dbUser.name ?? p.name ?? p.email.split("@")[0], picture: p.picture };
    const headers = new Headers({ location: `${origin}${saved.next}` });
    headers.append("set-cookie", cookieHeader(SESSION_COOKIE, createToken(user, authSecret(), SESSION_TTL_SECONDS), SESSION_TTL_SECONDS, secure));
    headers.append("set-cookie", cookieHeader(OAUTH_COOKIE, "", 0, secure));
    return new Response(null, { status: 302, headers });
  } catch {
    return fail("signin_failed");
  }
}
