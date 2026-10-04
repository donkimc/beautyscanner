import { listListings, upsertListing } from "../db/catalog";
import { searchNaver, NaverError, type Candidate } from "../retailer/naver";
import { invalidateCatalog } from "./load";

export interface RefreshSummary { updated: string[]; missing: string[]; errors: string[]; stopped?: "quota" | "auth" | "not_configured" }

// Naver has no "get by id" call, so we search by the listing's title and pick the same productId.
export async function refreshListings(only?: string, search: typeof searchNaver = searchNaver): Promise<RefreshSummary> {
  const out: RefreshSummary = { updated: [], missing: [], errors: [] };
  const rows = (await listListings()).filter((l) => l.approved && l.naver_product_id && (!only || l.product_id === only));
  for (const l of rows) {
    let found: Candidate | undefined;
    try {
      const results = await search(l.title, { display: 30 });
      found = results.find((c) => c.naverProductId && c.naverProductId === l.naver_product_id);
    } catch (e) {
      if (e instanceof NaverError && (e.code === "quota" || e.code === "auth" || e.code === "not_configured")) { out.stopped = e.code; break; }
      out.errors.push(l.product_id);
      continue;
    }
    if (!found) { out.missing.push(l.product_id); continue; }
    await upsertListing({ ...l, image_url: found.image, link: found.link, price: found.price, title: found.title, mall: found.mall || l.mall });
    out.updated.push(l.product_id);
  }
  invalidateCatalog();
  return out;
}
