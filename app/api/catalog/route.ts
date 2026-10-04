import { loadCatalog } from "../../../catalog/load";

// The public catalog (products with approved Naver photo, price and link applied). The browser runs the recommender on it.
export async function GET() {
  return Response.json({ products: await loadCatalog() }, { headers: { "cache-control": "public, max-age=30, s-maxage=30" } });
}
