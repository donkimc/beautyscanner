import { rankCandidates } from "../../../../retailer/match";
import { NaverError, naverConfigured, searchNaver } from "../../../../retailer/naver";
import { adminOr404, isResponse } from "../_guard";

// Search Naver Shopping for a product. Returns ranked candidates (the best is only a suggestion).
export async function GET(req: Request) {
  const admin = adminOr404(req);
  if (isResponse(admin)) return admin;
  const u = new URL(req.url);
  const query = (u.searchParams.get("query") ?? "").trim();
  const brand = (u.searchParams.get("brand") ?? "").trim() || undefined;
  if (!naverConfigured()) return Response.json({ error: "not_configured" }, { status: 503 });
  if (!query) return Response.json({ error: "bad_request" }, { status: 400 });
  try {
    const candidates = await searchNaver(query, { display: 15 });
    return Response.json({ candidates: rankCandidates({ name: query, brand }, candidates) }, { headers: { "cache-control": "no-store" } });
  } catch (e) {
    const code = e instanceof NaverError ? e.code : "server";
    return Response.json({ error: code }, { status: code === "quota" ? 429 : code === "auth" ? 502 : code === "bad_request" ? 400 : 502 });
  }
}
