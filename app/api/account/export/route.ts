import { sessionFrom } from "../../../../auth/session";
import { listConsents } from "../../../../db/consents";
import { listRoutines } from "../../../../db/routines";
import { getUser } from "../../../../db/users";

// Lets users download everything we store about them.
export async function GET(req: Request) {
  const session = sessionFrom(req);
  const user = session && (await getUser(session.uid));
  if (!session || !user) return Response.json({ error: "unauthorized" }, { status: 401 });
  const data = { user, routines: await listRoutines(user.id), consents: await listConsents(user.id), exportedAt: new Date().toISOString() };
  return new Response(JSON.stringify(data, null, 2), {
    headers: { "content-type": "application/json", "content-disposition": 'attachment; filename="beautyscanner-data.json"', "cache-control": "no-store" },
  });
}
