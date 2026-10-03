import { SESSION_COOKIE, authSecret, readCookie, verifyToken, type SessionUser } from "../../../../auth/session";

export async function GET(req: Request) {
  const user = verifyToken<SessionUser>(readCookie(req.headers.get("cookie"), SESSION_COOKIE), authSecret());
  return Response.json(
    { user: user ? { email: user.email, name: user.name, picture: user.picture } : null },
    { headers: { "cache-control": "no-store" } },
  );
}
