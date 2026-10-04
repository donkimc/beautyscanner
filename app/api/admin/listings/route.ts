import { loadCatalog, invalidateCatalog } from "../../../../catalog/load";
import { deleteListing, listListings, upsertListing } from "../../../../db/catalog";
import { isAllowedImage, isHttpUrl, isOwnImage } from "../../../../lib/catalog";
import { adminOr404, isResponse } from "../_guard";

// A link, price and (optional) own photo typed in by the admin, for when Naver search isn't available.
async function manualListing(productId: unknown, m: Record<string, unknown>, email: string) {
  const known = (await loadCatalog()).find((p) => p.id === productId);
  const link = typeof m.link === "string" ? m.link.trim() : "";
  const price = Number(m.price);
  const image = typeof m.image === "string" ? m.image.trim() : "";
  const mall = typeof m.mall === "string" ? m.mall.trim().slice(0, 40) : "";
  if (!known || !isHttpUrl(link) || !Number.isInteger(price) || price < 100 || price > 2_000_000) return Response.json({ error: "bad_candidate" }, { status: 400 });
  if (image && !isOwnImage(image)) return Response.json({ error: "bad_image_host" }, { status: 400 });
  await upsertListing({
    product_id: known.id, naver_product_id: null, title: known.name, image_url: image, link, price,
    mall: mall || null, brand: known.brand ?? null, maker: null, category: null, approved: true, approved_by: email,
  });
  invalidateCatalog();
  return Response.json({ ok: true });
}

export async function GET(req: Request) {
  const admin = adminOr404(req);
  if (isResponse(admin)) return admin;
  return Response.json({ listings: await listListings() }, { headers: { "cache-control": "no-store" } });
}

// Approve a Naver listing for a product: this is what makes its photo, price and link appear on the site.
export async function POST(req: Request) {
  const admin = adminOr404(req);
  if (isResponse(admin)) return admin;
  const body = (await req.json().catch(() => ({}))) as { productId?: unknown; candidate?: Record<string, unknown>; manual?: Record<string, unknown> };
  if (body.manual && typeof body.manual === "object") return manualListing(body.productId, body.manual, admin.email);
  const c = body.candidate;
  const known = (await loadCatalog()).some((p) => p.id === body.productId);
  if (typeof body.productId !== "string" || !known || !c || typeof c !== "object") return Response.json({ error: "bad_request" }, { status: 400 });
  const price = Number(c.price);
  const title = typeof c.title === "string" ? c.title.trim().slice(0, 300) : "";
  const image = typeof c.image === "string" ? c.image : "";
  const link = typeof c.link === "string" ? c.link : "";
  if (!title || !Number.isInteger(price) || price <= 0 || !isHttpUrl(link)) return Response.json({ error: "bad_candidate" }, { status: 400 });
  if (!isAllowedImage(image, process.env.NAVER_IMAGE_HOSTS ?? "")) return Response.json({ error: "bad_image_host" }, { status: 400 });
  const s = (v: unknown, n = 120) => (typeof v === "string" ? v.slice(0, n) : null);
  await upsertListing({
    product_id: body.productId, naver_product_id: s(c.naverProductId, 40), title, image_url: image, link, price,
    mall: s(c.mall), brand: s(c.brand), maker: s(c.maker), category: Array.isArray(c.category) ? c.category.join(" > ").slice(0, 200) : null,
    approved: true, approved_by: admin.email,
  });
  invalidateCatalog();
  return Response.json({ ok: true });
}

export async function DELETE(req: Request) {
  const admin = adminOr404(req);
  if (isResponse(admin)) return admin;
  const id = new URL(req.url).searchParams.get("productId");
  if (!id) return Response.json({ error: "bad_request" }, { status: 400 });
  await deleteListing(id);
  invalidateCatalog();
  return Response.json({ ok: true });
}
