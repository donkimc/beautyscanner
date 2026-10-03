import { sessionFrom } from "../../../auth/session";
import { recordConsents } from "../../../db/consents";
import { CONSENT_VERSIONS, isPurpose } from "../../../consent/purposes";

// Audit log of consent decisions. Failures here never block the user (the client keeps its own record).
export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { items?: { purpose: string; granted: boolean }[]; anonId?: string };
  const user = sessionFrom(req);
  const items = (body.items ?? []).filter((i) => isPurpose(i.purpose)).map((i) => ({ purpose: i.purpose, version: CONSENT_VERSIONS[i.purpose as keyof typeof CONSENT_VERSIONS], granted: Boolean(i.granted) }));
  if (!items.length) return Response.json({ ok: true });
  try {
    await recordConsents(items, { userId: user?.uid, email: user?.email, anonId: typeof body.anonId === "string" ? body.anonId.slice(0, 64) : undefined });
  } catch {
    /* logged best-effort */
  }
  return Response.json({ ok: true });
}
