import { refreshListings } from "../../../../../catalog/refresh";
import { adminOr404, isResponse } from "../../_guard";

// Re-reads the price and photo of approved listings from Naver (all of them, or one product).
export async function POST(req: Request) {
  const admin = adminOr404(req);
  if (isResponse(admin)) return admin;
  const { productId } = (await req.json().catch(() => ({}))) as { productId?: unknown };
  return Response.json(await refreshListings(typeof productId === "string" ? productId : undefined));
}
