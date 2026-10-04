import { sessionFrom } from "../../../auth/session";
import { saveProfileAnswers } from "../../../db/profile";
import { deleteRoutine, listRoutines, saveRoutine } from "../../../db/routines";
import { loadCatalog } from "../../../catalog/load";
import { parseAnswers } from "../../../lib/recommend";

export async function GET(req: Request) {
  const user = sessionFrom(req);
  if (!user) return Response.json({ error: "unauthorized" }, { status: 401 });
  return Response.json({ routines: await listRoutines(user.uid) }, { headers: { "cache-control": "no-store" } });
}

export async function POST(req: Request) {
  const user = sessionFrom(req);
  if (!user) return Response.json({ error: "unauthorized" }, { status: 401 });
  const body = (await req.json().catch(() => ({}))) as { answers?: unknown; productIds?: string[]; total?: number };
  const answers = parseAnswers(body.answers);
  const { productIds, total } = body;
  const known = new Set((await loadCatalog()).map((p) => p.id));
  if (!answers || !Array.isArray(productIds) || !productIds.length || productIds.length > 10 || !productIds.every((id) => known.has(id)) || typeof total !== "number") {
    return Response.json({ error: "bad_request" }, { status: 400 });
  }
  const row = await saveRoutine(user.uid, answers, productIds, Math.round(total));
  await saveProfileAnswers(user.uid, answers); // the dashboard shows (and lets you edit) the latest answers
  return Response.json({ ok: true, id: row.id });
}

export async function DELETE(req: Request) {
  const user = sessionFrom(req);
  if (!user) return Response.json({ error: "unauthorized" }, { status: 401 });
  const id = new URL(req.url).searchParams.get("id") ?? "";
  if (!/^[0-9a-f-]{36}$/.test(id)) return Response.json({ error: "bad_request" }, { status: 400 });
  await deleteRoutine(user.uid, id);
  return Response.json({ ok: true });
}
