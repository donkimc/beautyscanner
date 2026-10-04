import { listCatalogProducts, listListings } from "../db/catalog";
import { mergeCatalog, type Listing } from "../lib/catalog";
import { PRODUCTS, type Product } from "../lib/products";

// The catalog the site uses on the server: code products + admin-added products, with approved Naver listings applied.
// Cached for a few seconds; call invalidateCatalog() after any write.

// Kept on globalThis so every route bundle (and hot reloads in development) shares one cache, and invalidation reaches all of them.
const g = globalThis as unknown as { __bsCatalog?: { at: number; value: Product[] } | null };
const TTL_MS = 10_000;

export const samplesHidden = () => process.env.HIDE_SAMPLES === "1";

export const invalidateCatalog = () => { g.__bsCatalog = null; };

export async function loadCatalog(): Promise<Product[]> {
  const hit = g.__bsCatalog;
  if (hit && Date.now() - hit.at < TTL_MS) return hit.value;
  try {
    const [rows, listingRows] = await Promise.all([listCatalogProducts(), listListings()]);
    const extra = rows.filter((r) => r.active).map((r) => ({ ...(r.data as Omit<Product, "id">), id: r.id }) as Product);
    const listings: Listing[] = listingRows.map((l) => ({
      productId: l.product_id, naverProductId: l.naver_product_id, title: l.title, imageUrl: l.image_url, link: l.link,
      price: l.price, mall: l.mall, approved: l.approved, fetchedAt: new Date(l.fetched_at).toISOString(),
    }));
    const value = mergeCatalog(extra, listings, { hideSamples: samplesHidden() });
    g.__bsCatalog = { at: Date.now(), value };
    return value;
  } catch {
    return PRODUCTS; // the database is unreachable: fall back to the built-in catalog
  }
}

export async function findProduct(id: string): Promise<Product | undefined> {
  return (await loadCatalog()).find((p) => p.id === id);
}
