import { CONCERNS, PRODUCTS, SKIN_TYPES, type Concern, type Grade, type Product, type Step } from "./products";

// Merges the product catalog: code-defined products + products added in the admin page + approved retailer listings.

export interface Listing {
  productId: string;
  naverProductId: string | null;
  title: string;
  imageUrl: string;
  link: string;
  price: number;
  mall: string | null;
  approved: boolean;
  fetchedAt: string;
}

// Images may only come from Naver's image CDN (plus hosts added through NAVER_IMAGE_HOSTS, used for tests).
export function isAllowedImage(url: string, extraHosts = ""): boolean {
  try {
    const u = new URL(url);
    if (u.protocol !== "https:" && !(extraHosts && u.protocol === "http:")) return false;
    const hosts = ["pstatic.net", "naver.net", ...extraHosts.split(",").map((h) => h.trim()).filter(Boolean)];
    return hosts.some((h) => u.hostname === h || u.hostname.endsWith(`.${h}`));
  } catch {
    return false;
  }
}

// A photo the owner supplied: a file committed under public/products/ (never a third-party address).
export const isOwnImage = (path: string) => /^\/products\/[A-Za-z0-9._-]+\.(jpe?g|png|webp)$/i.test(path);

export const isHttpUrl = (url: string) => /^https?:\/\//i.test(url) && (() => { try { return Boolean(new URL(url)); } catch { return false; } })();

// An approved listing supplies the real photo, price and link (a plain retailer link, so no AD label).
export function applyListing(p: Product, l: Listing): Product {
  if (!l.approved) return p;
  const naver = Boolean(l.naverProductId);
  return { ...p, image: l.imageUrl || p.image, url: l.link, urlKind: "retailer", retailer: naver ? "네이버쇼핑" : l.mall || "쇼핑몰", price: l.price, approxPrice: false, priceSource: naver ? "naver" : "manual", priceDate: l.fetchedAt };
}

export function mergeCatalog(extra: Product[], listings: Listing[], opts: { hideSamples?: boolean } = {}): Product[] {
  const byId = new Map(listings.map((l) => [l.productId, l]));
  const all = [...PRODUCTS, ...extra.filter((e) => !PRODUCTS.some((p) => p.id === e.id))];
  return all
    .filter((p) => !opts.hideSamples || p.real)
    .map((p) => (byId.has(p.id) ? applyListing(p, byId.get(p.id)!) : p));
}

// ---- products added by an admin

const STEP_LIST: Step[] = ["cleanser", "toner", "serum", "moisturizer", "sunscreen"];
const GRADES: Grade[] = ["clinical", "multiple", "brand", "emerging", "unrated"];
const bool = (v: unknown) => v === true;

export type ParseResult = { ok: true; product: Omit<Product, "id"> } | { ok: false; error: string };

export function parseNewProduct(raw: unknown): ParseResult {
  if (!raw || typeof raw !== "object") return { ok: false, error: "bad_request" };
  const r = raw as Record<string, unknown>;
  const text = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
  const name = text(r.name, 120);
  if (!name) return { ok: false, error: "name" };
  if (!STEP_LIST.includes(r.step as Step)) return { ok: false, error: "step" };
  if (!Array.isArray(r.concerns) || r.concerns.length < 1 || !r.concerns.every((c) => (CONCERNS as readonly string[]).includes(c as string))) return { ok: false, error: "concerns" };
  if (r.texture !== "light" && r.texture !== "rich") return { ok: false, error: "texture" };
  if (r.time !== "am" && r.time !== "pm" && r.time !== "both") return { ok: false, error: "time" };
  const grade = (r.grade ?? "unrated") as Grade;
  if (!GRADES.includes(grade)) return { ok: false, error: "grade" };
  const price = Number(r.price);
  if (!Number.isInteger(price) || price < 100 || price > 2_000_000) return { ok: false, error: "price" };
  const evidence = text(r.evidence, 500) || "근거 검토 중이에요.";
  const evidenceEn = text(r.evidenceEn, 500) || "Evidence under review.";
  return {
    ok: true,
    product: {
      name, step: r.step as Step, price, real: true, brand: text(r.brand, 60) || undefined,
      concerns: [...new Set(r.concerns as Concern[])], skinTypes: [...SKIN_TYPES], texture: r.texture, fragranceFree: bool(r.fragranceFree), vegan: bool(r.vegan),
      sensitiveSafe: bool(r.sensitiveSafe), grade, evidence, en: { name: text(r.nameEn, 120) || name, evidence: evidenceEn }, time: r.time, url: "#",
    },
  };
}

export const newProductId = (existing: string[]): string => {
  let id: string;
  do id = `n${Math.random().toString(36).slice(2, 8)}`; while (existing.includes(id));
  return id;
};
