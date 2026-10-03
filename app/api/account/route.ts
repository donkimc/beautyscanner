import { originOf } from "../../../auth/google";
import { SESSION_COOKIE, cookieHeader, sessionFrom } from "../../../auth/session";
import { deleteUser } from "../../../db/users";

// Deletes the account and, through ON DELETE CASCADE, its routines and consent records.
export async function DELETE(req: Request) {
  const user = sessionFrom(req);
  if (!user) return Response.json({ error: "unauthorized" }, { status: 401 });
  await deleteUser(user.uid);
  const secure = originOf(req).startsWith("https");
  return Response.json({ ok: true }, { headers: { "set-cookie": cookieHeader(SESSION_COOKIE, "", 0, secure) } });
}
