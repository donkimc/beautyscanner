import { sessionFrom } from "../../../../auth/session";

export async function GET(req: Request) {
  const user = sessionFrom(req);
  return Response.json(
    { user: user ? { email: user.email, name: user.name, picture: user.picture } : null },
    { headers: { "cache-control": "no-store" } },
  );
}
