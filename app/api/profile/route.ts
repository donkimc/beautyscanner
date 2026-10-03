import { sessionFrom } from "../../../auth/session";
import { getProfileAnswers, saveProfileAnswers, updateName } from "../../../db/profile";
import { getUser } from "../../../db/users";
import { parseAnswers } from "../../../lib/recommend";

const noStore = { "cache-control": "no-store" };

export async function GET(req: Request) {
  const session = sessionFrom(req);
  const user = session && (await getUser(session.uid));
  if (!session || !user) return Response.json({ error: "unauthorized" }, { status: 401 });
  return Response.json({ name: user.name, email: user.email, answers: parseAnswers(await getProfileAnswers(user.id)) }, { headers: noStore });
}

// Edit the saved info: the display name and/or the skin profile (survey answers).
export async function PUT(req: Request) {
  const user = sessionFrom(req);
  if (!user) return Response.json({ error: "unauthorized" }, { status: 401 });
  const body = (await req.json().catch(() => ({}))) as { name?: unknown; answers?: unknown };
  let changed = false;
  if (body.name !== undefined) {
    const name = typeof body.name === "string" ? body.name.trim() : "";
    if (name.length < 1 || name.length > 60) return Response.json({ error: "bad_name" }, { status: 400 });
    await updateName(user.uid, name);
    changed = true;
  }
  if (body.answers !== undefined) {
    const answers = parseAnswers(body.answers);
    if (!answers) return Response.json({ error: "bad_answers" }, { status: 400 });
    await saveProfileAnswers(user.uid, answers);
    changed = true;
  }
  if (!changed) return Response.json({ error: "bad_request" }, { status: 400 });
  return Response.json({ ok: true });
}
