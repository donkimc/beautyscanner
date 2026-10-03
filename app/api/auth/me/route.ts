import { sessionFrom } from "../../../../auth/session";
import { cartCount } from "../../../../db/cart";
import { getUser } from "../../../../db/users";

export async function GET(req: Request) {
  const session = sessionFrom(req);
  // Use the current database record (so a renamed or deleted account is reflected); fall back to the cookie if the database is unreachable.
  let user = session;
  if (session) {
    try {
      const row = await getUser(session.uid);
      user = row ? { ...session, email: row.email, name: row.name ?? session.name } : null;
    } catch { /* keep the cookie's view */ }
  }
  const cart = user ? await cartCount(user.uid).catch(() => 0) : 0;
  return Response.json(
    { user: user ? { email: user.email, name: user.name, picture: user.picture } : null, cartCount: cart },
    { headers: { "cache-control": "no-store" } },
  );
}
