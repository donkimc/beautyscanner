import { originOf } from "../../../../../auth/google";
import { TOKEN_TTL_MINUTES, createLoginToken, isEmail, normalizeEmail } from "../../../../../db/users";
import { recordConsents } from "../../../../../db/consents";
import { loginEmail } from "../../../../../email/templates";
import { emailConfigured, sendEmail } from "../../../../../email/send";
import { isLocale } from "../../../../../i18n/locale";
import { authSecret, safeNext } from "../../../../../auth/session";
import { CONSENT_VERSIONS } from "../../../../../consent/purposes";

// Sign-up and login are the same flow: we email a single-use link; clicking it confirms the address.
export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { email?: string; locale?: string; next?: string; consentTerms?: boolean; anonId?: string };
  const email = normalizeEmail(body.email ?? "");
  const locale = isLocale(body.locale) ? body.locale : "ko";
  if (!isEmail(email)) return Response.json({ error: "bad_email" }, { status: 400 });
  if (body.consentTerms !== true) return Response.json({ error: "consent" }, { status: 400 });

  if (!authSecret()) return Response.json({ error: "not_configured" }, { status: 503 });
  const production = process.env.NODE_ENV === "production";
  if (production && !emailConfigured()) return Response.json({ error: "email_not_configured" }, { status: 503 });

  const token = await createLoginToken(email);
  if (!token) return Response.json({ error: "rate_limited" }, { status: 429 });

  await recordConsents([{ purpose: "terms", version: CONSENT_VERSIONS.terms, granted: true }], { email, anonId: body.anonId });

  const link = `${originOf(req)}/auth/verify?token=${encodeURIComponent(token)}&next=${encodeURIComponent(safeNext(body.next))}`;
  if (!emailConfigured()) {
    // Development only: no mail provider, so hand the link back instead of sending it.
    console.log(`[dev] login link for ${email}: ${link}`);
    return Response.json({ ok: true, devLink: link });
  }
  const mail = loginEmail(locale, link, TOKEN_TTL_MINUTES);
  if (!(await sendEmail({ to: email, ...mail }))) return Response.json({ error: "send_failed" }, { status: 502 });
  return Response.json({ ok: true });
}
