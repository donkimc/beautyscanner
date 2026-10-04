// Naver Shopping Search API client (https://developers.naver.com/docs/serviceapi/search/shopping/shopping.md).
// Needs NAVER_CLIENT_ID and NAVER_CLIENT_SECRET (server-side only). Returns normalized candidates; a human approves one.

export interface Candidate {
  naverProductId: string;
  title: string;
  /** Product image on Naver's image CDN. */
  image: string;
  /** Product page on Naver Shopping. */
  link: string;
  /** Lowest price (KRW). */
  price: number;
  mall: string;
  brand: string;
  maker: string;
  category: string[];
  productType: number;
}

export type NaverErrorCode = "not_configured" | "auth" | "quota" | "bad_request" | "server" | "network";
export class NaverError extends Error {
  constructor(public code: NaverErrorCode, message: string) {
    super(message);
  }
}

type Env = Record<string, string | undefined>;

// Pasted keys often carry stray spaces, newlines or quotes; header values with those are rejected as bad credentials.
const clean = (v: string | undefined) => (v ?? "").trim().replace(/^["']|["']$/g, "").trim();

export const naverConfigured = (env: Env = process.env) => Boolean(clean(env.NAVER_CLIENT_ID) && clean(env.NAVER_CLIENT_SECRET));

const ENTITIES: Record<string, string> = { "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&#39;": "'", "&apos;": "'", "&nbsp;": " " };

// Titles come back with <b> highlight tags and HTML entities.
export function stripHtml(s: string): string {
  return s.replace(/<[^>]*>/g, "").replace(/&(?:amp|lt|gt|quot|apos|nbsp|#39);/g, (e) => ENTITIES[e] ?? e).replace(/\s+/g, " ").trim();
}

const str = (v: unknown) => (typeof v === "string" ? v : "");

export function normalizeItem(raw: unknown): Candidate | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const price = Number.parseInt(str(r.lprice), 10);
  const image = str(r.image);
  const link = str(r.link);
  const title = stripHtml(str(r.title));
  if (!title || !image.startsWith("http") || !link.startsWith("http") || !Number.isFinite(price) || price <= 0) return null;
  return {
    naverProductId: str(r.productId),
    title,
    image,
    link,
    price,
    mall: stripHtml(str(r.mallName)),
    brand: stripHtml(str(r.brand)),
    maker: stripHtml(str(r.maker)),
    category: [r.category1, r.category2, r.category3, r.category4].map(str).filter(Boolean),
    productType: Number.parseInt(str(r.productType), 10) || 0,
  };
}

export interface SearchOptions {
  display?: number;
  start?: number;
  sort?: "sim" | "date" | "asc" | "dsc";
  env?: Env;
  fetchImpl?: typeof fetch;
}

export async function searchNaver(query: string, opts: SearchOptions = {}): Promise<Candidate[]> {
  const env = opts.env ?? process.env;
  if (!naverConfigured(env)) throw new NaverError("not_configured", "NAVER_CLIENT_ID / NAVER_CLIENT_SECRET are not set");
  const q = query.trim().slice(0, 100);
  if (!q) throw new NaverError("bad_request", "empty query");

  const url = new URL("/v1/search/shop.json", env.NAVER_API_BASE ?? "https://openapi.naver.com");
  url.searchParams.set("query", q);
  url.searchParams.set("display", String(Math.min(30, Math.max(1, opts.display ?? 10))));
  url.searchParams.set("start", String(Math.min(1000, Math.max(1, opts.start ?? 1))));
  url.searchParams.set("sort", opts.sort ?? "sim");
  url.searchParams.set("exclude", "used:rental:cbshop"); // no used, rental or overseas-purchase listings

  let res: Response;
  try {
    res = await (opts.fetchImpl ?? fetch)(url, {
      headers: { "X-Naver-Client-Id": clean(env.NAVER_CLIENT_ID), "X-Naver-Client-Secret": clean(env.NAVER_CLIENT_SECRET) },
      signal: AbortSignal.timeout(8000),
    });
  } catch {
    throw new NaverError("network", "could not reach the Naver API");
  }
  if (res.status === 401 || res.status === 403) throw new NaverError("auth", "Naver rejected the client id / secret");
  if (res.status === 429) throw new NaverError("quota", "Naver API daily quota exceeded");
  if (res.status === 400) throw new NaverError("bad_request", "Naver rejected the request");
  if (!res.ok) throw new NaverError("server", `Naver API error (${res.status})`);

  const body = (await res.json().catch(() => null)) as { items?: unknown[] } | null;
  return (body?.items ?? []).map(normalizeItem).filter((c): c is Candidate => c !== null);
}
