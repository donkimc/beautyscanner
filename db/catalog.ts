import { query } from "./client";

export interface ListingRow {
  product_id: string;
  naver_product_id: string | null;
  title: string;
  image_url: string;
  link: string;
  price: number;
  mall: string | null;
  brand: string | null;
  maker: string | null;
  category: string | null;
  approved: boolean;
  approved_by: string | null;
  fetched_at: string;
}

export const listListings = () => query<ListingRow>(`SELECT * FROM product_listings ORDER BY product_id`);

export async function upsertListing(l: Omit<ListingRow, "fetched_at"> & { fetched_at?: string }): Promise<void> {
  await query(
    `INSERT INTO product_listings (product_id, naver_product_id, title, image_url, link, price, mall, brand, maker, category, approved, approved_by, fetched_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12, COALESCE($13::timestamptz, now()))
     ON CONFLICT (product_id) DO UPDATE SET naver_product_id=EXCLUDED.naver_product_id, title=EXCLUDED.title, image_url=EXCLUDED.image_url, link=EXCLUDED.link,
       price=EXCLUDED.price, mall=EXCLUDED.mall, brand=EXCLUDED.brand, maker=EXCLUDED.maker, category=EXCLUDED.category,
       approved=EXCLUDED.approved, approved_by=EXCLUDED.approved_by, fetched_at=EXCLUDED.fetched_at`,
    [l.product_id, l.naver_product_id, l.title, l.image_url, l.link, l.price, l.mall, l.brand, l.maker, l.category, l.approved, l.approved_by, l.fetched_at ?? null],
  );
}

export const deleteListing = (productId: string) => query(`DELETE FROM product_listings WHERE product_id = $1`, [productId]);

// ---- products added through the admin page (the code-defined ones live in lib/products.ts)
export interface CatalogRow { id: string; data: unknown; active: boolean }

export const listCatalogProducts = () => query<CatalogRow>(`SELECT id, data, active FROM catalog_products ORDER BY created_at`);

export async function saveCatalogProduct(id: string, data: unknown): Promise<void> {
  await query(
    `INSERT INTO catalog_products (id, data) VALUES ($1, $2::jsonb)
     ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, active = true, updated_at = now()`,
    [id, JSON.stringify(data)],
  );
}

export const setCatalogProductActive = (id: string, active: boolean) => query(`UPDATE catalog_products SET active = $2, updated_at = now() WHERE id = $1`, [id, active]);
