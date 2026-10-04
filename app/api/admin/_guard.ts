import { isAdminEmail } from "../../../auth/admin";
import { sessionFrom } from "../../../auth/session";

// Admin endpoints answer 404 to everyone else, so they don't reveal that an admin area exists.
export function adminOr404(req: Request): { email: string } | Response {
  const user = sessionFrom(req);
  if (!user || !isAdminEmail(user.email)) return new Response(null, { status: 404 });
  return { email: user.email };
}
export const isResponse = (v: unknown): v is Response => v instanceof Response;
