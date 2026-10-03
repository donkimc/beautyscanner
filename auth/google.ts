import { createHash } from "node:crypto";

// Google OAuth 2.0 authorization-code flow with PKCE. Server-side only.

const AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const USERINFO_URL = "https://openidconnect.googleapis.com/v1/userinfo";

export function isConfigured(env = process.env): boolean {
  return Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET && env.AUTH_SECRET);
}

// Behind Railway's proxy the public origin comes from forwarded headers unless AUTH_URL is set.
export function originOf(req: Request, env = process.env): string {
  if (env.AUTH_URL) return env.AUTH_URL.replace(/\/$/, "");
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? new URL(req.url).host;
  const proto = req.headers.get("x-forwarded-proto") ?? new URL(req.url).protocol.replace(":", "");
  return `${proto}://${host}`;
}

export const challengeFor = (verifier: string) => createHash("sha256").update(verifier).digest("base64url");

export function buildAuthUrl(opts: { clientId: string; redirectUri: string; state: string; verifier: string }): string {
  const u = new URL(AUTH_URL);
  u.search = new URLSearchParams({
    client_id: opts.clientId,
    redirect_uri: opts.redirectUri,
    response_type: "code",
    scope: "openid email profile",
    state: opts.state,
    code_challenge: challengeFor(opts.verifier),
    code_challenge_method: "S256",
    prompt: "select_account",
  }).toString();
  return u.toString();
}

export interface GoogleProfile {
  sub: string;
  email: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
}

export async function fetchProfile(opts: {
  code: string;
  verifier: string;
  redirectUri: string;
  clientId: string;
  clientSecret: string;
}): Promise<GoogleProfile> {
  const tokenRes = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code: opts.code,
      client_id: opts.clientId,
      client_secret: opts.clientSecret,
      redirect_uri: opts.redirectUri,
      grant_type: "authorization_code",
      code_verifier: opts.verifier,
    }),
  });
  if (!tokenRes.ok) throw new Error(`token exchange failed (${tokenRes.status})`);
  const { access_token } = (await tokenRes.json()) as { access_token?: string };
  if (!access_token) throw new Error("no access token");
  const infoRes = await fetch(USERINFO_URL, { headers: { authorization: `Bearer ${access_token}` } });
  if (!infoRes.ok) throw new Error(`userinfo failed (${infoRes.status})`);
  return (await infoRes.json()) as GoogleProfile;
}
