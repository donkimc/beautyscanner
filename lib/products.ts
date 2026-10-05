import type { Locale } from "../i18n/locale";
import { SAMPLE_PRODUCTS } from "./samples";

// DEMO DATA ONLY: fictional products and placeholder evidence notes.
// Replace with curated, cited records before any real launch.

export type Step = "cleanser" | "toner" | "serum" | "moisturizer" | "sunscreen";
// "unrated" = real product whose evidence has not been reviewed yet (shown honestly as "evidence under review").
export type Grade = "clinical" | "multiple" | "brand" | "emerging" | "unrated";
// Survey vocabularies (the values stored in answers; labels live in i18n/messages.ts).
export const SKIN_TYPES = ["dry", "oily", "combo", "sensitive", "unsure"] as const;
export const CONCERNS = ["acne", "pores", "pigmentation", "aging", "redness", "dryness"] as const;
export const PRIORITIES = ["tone", "hydration", "soothing", "firmness", "pores"] as const;
export const TEXTURES = ["light", "rich", "fragrance_free", "low_irritation", "vegan_clean"] as const;
export type SkinType = (typeof SKIN_TYPES)[number];
export type Concern = (typeof CONCERNS)[number];
export type Priority = (typeof PRIORITIES)[number];
export type Texture = (typeof TEXTURES)[number];

// What each "top priority" answer is trying to improve.
export const PRIORITY_TARGETS: Record<Priority, Concern[]> = {
  tone: ["pigmentation"],
  hydration: ["dryness"],
  soothing: ["acne", "redness"],
  firmness: ["aging"],
  pores: ["pores"],
};

export interface Product {
  id: string;
  name: string;
  step: Step;
  price: number;
  concerns: Concern[];
  skinTypes: SkinType[];
  /** Feel on the skin: used for the lightweight / rich texture preference. */
  texture: "light" | "rich";
  fragranceFree: boolean;
  vegan: boolean;
  /** Low-irritation: suitable for sensitive skin. */
  sensitiveSafe: boolean;
  grade: Grade;
  evidence: string;
  en: { name: string; evidence: string };
  /** Part of the day this product suits: sunscreen is morning-only; strong exfoliants and retinoids are evening-only. */
  time: "am" | "pm" | "both";
  /** A real product (not sample data). Real products show their listing photo, a price note and retailer search links. */
  real?: boolean;
  /** The price is approximate / a "from" price: shown with "~" and must be verified before launch. */
  approxPrice?: boolean;
  /** Photo: a file under public/products/ (e.g. "/products/s1.webp") or an https URL. Leave unset to show the illustration. */
  image?: string;
  /** Retailer / affiliate link. "#" means no link yet. */
  url: string;
  /** "affiliate" links carry the AD label; a plain "retailer" link (e.g. the Naver Shopping page) does not. */
  urlKind?: "affiliate" | "retailer";
  retailer?: string;
  brand?: string;
  /** Where the price comes from and when it was fetched (e.g. Naver Shopping lowest price). */
  priceSource?: "naver" | "manual";
  priceDate?: string;
}

export const hasBuyLink = (p: Product) => p.url !== "" && p.url !== "#";

// Only affiliate links carry the AD label; a plain retailer link (e.g. the Naver Shopping page) does not.
export const isAffiliate = (p: Product) => hasBuyLink(p) && p.urlKind !== "retailer";

// Plain search links on the retailer sites (no affiliate tracking, so not ads). Only for real products.
export function retailerSearchLinks(p: Product): { naver: string; coupang: string } | null {
  if (!p.real) return null;
  const q = encodeURIComponent(p.name);
  return { naver: `https://search.shopping.naver.com/search/all?query=${q}`, coupang: `https://www.coupang.com/np/search?q=${q}` };
}

export const STEP_LABEL: Record<Step, string> = {
  cleanser: "클렌저",
  toner: "토너",
  serum: "세럼",
  moisturizer: "크림",
  sunscreen: "선크림",
};

// Grade colors live in design/tokens.json (grade-*); the English/Korean labels live in i18n/messages.ts.
export const GRADE_LABEL: Record<Grade, { label: string }> = {
  clinical: { label: "임상적으로 검증됨" },
  multiple: { label: "다수 연구 뒷받침" },
  brand: { label: "브랜드 자체 시험" },
  emerging: { label: "근거 신흥 단계" },
  unrated: { label: "근거 검토 중" },
};

const all: SkinType[] = ["dry", "oily", "combo", "sensitive", "unsure"];

export const PRODUCTS: Product[] = [
  ...SAMPLE_PRODUCTS, // 200 fictional demo products (lib/samples.ts)
  // ---- Real products, taken from the original evening-routine page. Prices marked approxPrice are estimates to verify;
  // evidence grades are those of the original page where it gave one, otherwise "unrated" until reviewed with citations.
  { id: "r1", real: true, name: "비플레인 녹두 약산성 클렌징폼", step: "cleanser", price: 13000, approxPrice: true, concerns: ["acne", "pores", "redness"], skinTypes: all, texture: "light", fragranceFree: false, vegan: false, sensitiveSafe: true, grade: "unrated", evidence: "근거 검토 중이에요. 제품 설명(원본 페이지): 메이크업·노폐물 제거, 약산성으로 장벽 자극 최소화.", en: { name: "Beplain Mung Bean pH-Balanced Cleansing Foam", evidence: "Evidence under review. Product description (original page): removes makeup and impurities; mildly acidic to minimize barrier irritation." }, time: "both", url: "#" },
  { id: "r2", real: true, name: "에스네이처 아쿠아 오아시스 토너", step: "toner", price: 19900, approxPrice: true, concerns: ["dryness"], skinTypes: all, texture: "light", fragranceFree: false, vegan: false, sensitiveSafe: false, grade: "multiple", evidence: "멀티 분자량 히알루론산으로 보습 층을 보강(원본 페이지 설명). 히알루론산의 보습 효과는 여러 연구에서 보고됨. 성분 수준의 근거이며 제품 단독 시험은 아님. 인용 출처 추가 필요.", en: { name: "S.Nature Aqua Oasis Toner", evidence: "Multi-molecular-weight hyaluronic acid reinforces the hydration layer (original page). Hyaluronic acid's hydrating effect is reported in several studies; this is ingredient-level evidence, not a test of this product. Citations still to be added." }, time: "both", url: "#" },
  { id: "r3", real: true, name: "토리든 다이브인 저분자 히알루론산 세럼", step: "serum", price: 16900, concerns: ["dryness"], skinTypes: all, texture: "light", fragranceFree: false, vegan: false, sensitiveSafe: false, grade: "multiple", evidence: "저분자 히알루론산으로 즉각적인 수분 공급(원본 페이지 설명). 히알루론산의 보습 효과는 여러 연구에서 보고됨. 성분 수준의 근거이며 제품 단독 시험은 아님. 인용 출처 추가 필요.", en: { name: "Torriden DIVE-IN Low-Molecular Hyaluronic Acid Serum", evidence: "Low-molecular hyaluronic acid for instant hydration (original page). Hyaluronic acid's hydrating effect is reported in several studies; this is ingredient-level evidence, not a test of this product. Citations still to be added." }, time: "both", url: "#" },
  { id: "r4", real: true, name: "아누아 PDRN 세럼", step: "serum", price: 28000, approxPrice: true, concerns: ["aging"], skinTypes: all, texture: "light", fragranceFree: false, vegan: false, sensitiveSafe: false, grade: "unrated", evidence: "근거 검토 중이에요. 제품 설명(원본 페이지): 탄력·재생 집중 케어.", en: { name: "Anua PDRN Serum", evidence: "Evidence under review. Product description (original page): firmness and renewal care." }, time: "both", url: "#" },
  { id: "r5", real: true, name: "토니모리 세라마이드 모찌 토너", step: "toner", price: 16000, approxPrice: true, concerns: ["dryness"], skinTypes: all, texture: "rich", fragranceFree: false, vegan: false, sensitiveSafe: false, grade: "unrated", evidence: "근거 검토 중이에요. 제품 설명(원본 페이지): 되직한 세라마이드 토너로 수분 밀봉.", en: { name: "TonyMoly Ceramide Mochi Toner", evidence: "Evidence under review. Product description (original page): a thick ceramide toner that seals in moisture." }, time: "both", url: "#" },
];

// Display text in the viewer's language (Korean is the base record).
export function localized(p: Product, locale: Locale): { name: string; evidence: string } {
  return locale === "en" ? p.en : { name: p.name, evidence: p.evidence };
}
