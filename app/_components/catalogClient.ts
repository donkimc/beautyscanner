import type { Product } from "../../lib/products";

// The catalog as the browser sees it (built-in + admin-added products, with approved Naver listings applied).
let cached: Promise<Product[] | null> | null = null;

export function loadClientCatalog(): Promise<Product[] | null> {
  cached ??= fetch("/api/catalog")
    .then(async (r) => (r.ok ? ((await r.json()).products as Product[]) : null))
    .catch(() => null);
  return cached;
}
