import { timingSafeEqual } from "node:crypto";
import { refreshListings } from "../../../../catalog/refresh";

// Called daily by a scheduler (e.g. a Railway cron job): `curl -X POST -H "authorization: Bearer $CRON_SECRET" <site>/api/cron/refresh-listings`.
export async function POST(req: Request) {
  const secret = process.env.CRON_SECRET ?? "";
  const given = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  const a = Buffer.from(given);
  const b = Buffer.from(secret);
  if (!secret || a.length !== b.length || !timingSafeEqual(a, b)) return new Response(null, { status: 404 });
  return Response.json(await refreshListings());
}
