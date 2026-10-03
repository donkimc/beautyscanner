import { originOf } from "../../../../auth/google";
import { SESSION_COOKIE, cookieHeader } from "../../../../auth/session";

export async function POST(req: Request) {
  const secure = originOf(req).startsWith("https");
  return Response.json({ ok: true }, { headers: { "set-cookie": cookieHeader(SESSION_COOKIE, "", 0, secure) } });
}
