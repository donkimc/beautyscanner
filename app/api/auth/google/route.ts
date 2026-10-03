import { buildAuthUrl, isConfigured, originOf } from "../../../../auth/google";
import { OAUTH_COOKIE, authSecret, cookieHeader, createToken, randomString, safeNext } from "../../../../auth/session";

// Starts Google sign-in: sets a short-lived signed cookie (state + PKCE verifier + next) and redirects.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const origin = originOf(req);
  if (!isConfigured()) return Response.redirect(`${origin}/login?error=not_configured`, 302);

  const state = randomString();
  const verifier = randomString(32);
  const next = safeNext(url.searchParams.get("next"));
  const cookie = createToken({ state, verifier, next }, authSecret(), 600);
  const location = buildAuthUrl({
    clientId: process.env.GOOGLE_CLIENT_ID!,
    redirectUri: `${origin}/api/auth/google/callback`,
    state,
    verifier,
  });
  return new Response(null, {
    status: 302,
    headers: { location, "set-cookie": cookieHeader(OAUTH_COOKIE, cookie, 600, origin.startsWith("https")) },
  });
}
