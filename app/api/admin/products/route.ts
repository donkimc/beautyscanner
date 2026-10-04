import { loadCatalog, invalidateCatalog } from "../../../../catalog/load";
import { saveCatalogProduct, setCatalogProductActive, upsertListing } from "../../../../db/catalog";
import { isAllowedImage, isHttpUrl, newProductId, parseNewProduct } from "../../../../lib/catalog";
import { adminOr404, isResponse } from "../_guard";

// Add a real product (its attributes, and optionally the Naver listing it was picked from).
export async function POST(req: Request) {
  const admin = adminOr404(req);
  if (isResponse(admin)) return admin;
  const body = (await req.json().catch(() => ({}))) as { product?: unknown; candidate?: Record<string, unknown> };
  const parsed = parseNewProduct(body.product);
  if (!parsed.ok) return Response.json({ error: parsed.error }, { status: 400 });
  const id = newProductId((await loadCatalog()).map((p) => p.id));
  await saveCatalogProduct(id, parsed.product);
  const c = body.candidate;
  if (c && typeof c === "object") {
    const image = typeof c.image === "string" ? c.image : "";
    const link = typeof c.link === "string" ? c.link : "";
    const price = Number(c.price);
    if (!isAllowedImage(image, process.env.NAVER_IMAGE_HOSTS ?? "") || !isHttpUrl(link) || !Number.isInteger(price) || price <= 0) {
      return Response.json({ error: "bad_candidate", id }, { status: 400 });
    }
    const s = (v: unknown, n = 120) => (typeof v === "string" ? v.slice(0, n) : null);
    await upsertListing({
      product_id: id, naver_product_id: s(c.naverProductId, 40), title: s(c.title, 300) ?? parsed.product.name, image_url: image, link, price,
      mall: s(c.mall), brand: s(c.brand), maker: s(c.maker), category: Array.isArray(c.category) ? c.category.join(" > ").slice(0, 200) : null,
      approved: true, approved_by: admin.email,
    });
  }
  invalidateCatalog();
  return Response.json({ ok: true, id });
}

export async function DELETE(req: Request) {
  const admin = adminOr404(req);
  if (isResponse(admin)) return admin;
  const id = new URL(req.url).searchParams.get("id") ?? "";
  if (!/^n[a-z0-9]{3,12}$/.test(id)) return Response.json({ error: "bad_request" }, { status: 400 }); // only admin-added products can be removed here
  await setCatalogProductActive(id, false);
  invalidateCatalog();
  return Response.json({ ok: true });
}
