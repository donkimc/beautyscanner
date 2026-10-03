import type { Locale } from "../i18n/locale";

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
}

export const hasBuyLink = (p: Product) => p.url !== "" && p.url !== "#";

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
  { id: "c1", name: "[샘플] 약산성 젤 클렌저", step: "cleanser", price: 6900, concerns: ["dryness", "acne", "redness"], skinTypes: all, texture: "light", fragranceFree: true, vegan: true, sensitiveSafe: true, grade: "brand", evidence: "브랜드 자체 피부자극 시험 결과(샘플 문구).", en: { name: "[Sample] Mild-acid gel cleanser", evidence: "Brand's own skin-irritation test (sample text)." }, time: "both", url: "#" },
  { id: "c2", name: "[샘플] 세라마이드 크림 클렌저", step: "cleanser", price: 8900, concerns: ["dryness", "aging", "redness"], skinTypes: ["dry", "sensitive", "unsure"], texture: "rich", fragranceFree: true, vegan: false, sensitiveSafe: true, grade: "emerging", evidence: "소규모 연구에서 세정 후 수분 손실 감소 경향(샘플 문구).", en: { name: "[Sample] Ceramide cream cleanser", evidence: "A small study suggests less water loss after cleansing (sample text)." }, time: "both", url: "#" },
  { id: "t1", name: "[샘플] 히알루론산 토너", step: "toner", price: 12900, concerns: ["dryness", "aging"], skinTypes: all, texture: "light", fragranceFree: true, vegan: true, sensitiveSafe: true, grade: "multiple", evidence: "히알루론산의 보습 효과는 여러 연구에서 보고됨. 성분 수준의 근거이며 제품 단독 시험은 아님(샘플 문구).", en: { name: "[Sample] Hyaluronic acid toner", evidence: "Hyaluronic acid's hydrating effect is reported in several studies. This is ingredient-level evidence, not a test of this product (sample text)." }, time: "both", url: "#" },
  { id: "t2", name: "[샘플] BHA 스무딩 토너", step: "toner", price: 9900, concerns: ["acne", "pores", "pigmentation"], skinTypes: ["oily", "combo", "unsure"], texture: "light", fragranceFree: false, vegan: true, sensitiveSafe: false, grade: "multiple", evidence: "살리실산(BHA)의 여드름 개선은 다수 연구 보고. 성분 수준 근거(샘플 문구).", en: { name: "[Sample] BHA smoothing toner", evidence: "Salicylic acid (BHA) is reported to improve acne in multiple studies. Ingredient-level evidence (sample text)." }, time: "pm", url: "#" },
  { id: "s1", name: "[샘플] 저분자 히알루론산 세럼", step: "serum", price: 12900, concerns: ["dryness"], skinTypes: all, texture: "light", fragranceFree: true, vegan: true, sensitiveSafe: true, grade: "multiple", evidence: "다수 연구가 히알루론산의 피부 수분 개선을 보고(성분 수준, 샘플 문구).", en: { name: "[Sample] Low-molecular hyaluronic acid serum", evidence: "Multiple studies report improved skin hydration from hyaluronic acid (ingredient-level, sample text)." }, time: "both", url: "#" },
  { id: "s2", name: "[샘플] 나이아신아마이드 10% 세럼", step: "serum", price: 15000, concerns: ["pigmentation", "acne", "pores"], skinTypes: ["oily", "combo", "dry", "unsure"], texture: "light", fragranceFree: true, vegan: true, sensitiveSafe: false, grade: "clinical", evidence: "나이아신아마이드는 RCT·메타분석에서 색소 및 피지 개선 보고(성분 수준, 샘플 문구).", en: { name: "[Sample] Niacinamide 10% serum", evidence: "Niacinamide shows improvements in pigmentation and oil in RCTs and meta-analyses (ingredient-level, sample text)." }, time: "both", url: "#" },
  { id: "s3", name: "[샘플] 레티날 0.1% 세럼", step: "serum", price: 19000, concerns: ["aging", "pigmentation"], skinTypes: ["dry", "oily", "combo", "unsure"], texture: "rich", fragranceFree: false, vegan: false, sensitiveSafe: false, grade: "clinical", evidence: "레티노이드 계열은 노화 징후 개선에 대한 RCT 근거가 풍부(성분 수준, 샘플 문구). 자극 가능성 있음.", en: { name: "[Sample] Retinal 0.1% serum", evidence: "Retinoids have substantial RCT evidence for signs of aging (ingredient-level, sample text). May cause irritation." }, time: "pm", url: "#" },
  { id: "m1", name: "[샘플] 세라마이드 장벽 크림", step: "moisturizer", price: 14900, concerns: ["dryness", "aging", "redness"], skinTypes: ["dry", "sensitive", "combo", "unsure"], texture: "rich", fragranceFree: true, vegan: false, sensitiveSafe: true, grade: "multiple", evidence: "세라마이드 함유 보습제는 장벽 회복 연구 다수(성분 수준, 샘플 문구).", en: { name: "[Sample] Ceramide barrier cream", evidence: "Ceramide-containing moisturizers have many barrier-repair studies (ingredient-level, sample text)." }, time: "both", url: "#" },
  { id: "m2", name: "[샘플] 가벼운 수분 젤크림", step: "moisturizer", price: 9900, concerns: ["acne", "dryness", "pores"], skinTypes: ["oily", "combo", "unsure"], texture: "light", fragranceFree: false, vegan: true, sensitiveSafe: true, grade: "brand", evidence: "브랜드 자체 사용자 평가(샘플 문구). 독립 연구 아님.", en: { name: "[Sample] Light hydrating gel cream", evidence: "Brand's own user rating (sample text). Not independent research." }, time: "both", url: "#" },
  { id: "f1", name: "[샘플] 무기자차 선크림 SPF50+", step: "sunscreen", price: 12000, concerns: ["pigmentation", "aging", "dryness", "acne", "redness"], skinTypes: all, texture: "rich", fragranceFree: true, vegan: true, sensitiveSafe: true, grade: "clinical", evidence: "자외선 차단은 색소·광노화 예방에 대한 근거가 확립됨. 제품 SPF/PA는 공인 시험 표기 기준(샘플 문구).", en: { name: "[Sample] Mineral sunscreen SPF50+", evidence: "Sun protection against pigmentation and photoaging is well established. Product SPF/PA follows certified test labelling (sample text)." }, time: "am", url: "#" },
  { id: "f2", name: "[샘플] 유기자차 선에센스 SPF50+", step: "sunscreen", price: 9500, concerns: ["pigmentation", "aging", "acne"], skinTypes: ["oily", "combo", "dry", "unsure"], texture: "light", fragranceFree: false, vegan: true, sensitiveSafe: false, grade: "clinical", evidence: "자외선 차단 일반 근거 확립. 일부 민감 피부에는 자극 가능(샘플 문구).", en: { name: "[Sample] Chemical sun essence SPF50+", evidence: "General sun-protection evidence is established. May irritate some sensitive skin (sample text)." }, time: "am", url: "#" },
  { id: "t3", name: "[샘플] 병풀 진정 토너", step: "toner", price: 13900, concerns: ["redness", "acne", "dryness"], skinTypes: all, texture: "light", fragranceFree: true, vegan: true, sensitiveSafe: true, grade: "emerging", evidence: "병풀 추출물의 진정 효과는 소규모 연구 단계(성분 수준, 샘플 문구).", en: { name: "[Sample] Centella calming toner", evidence: "Centella extract's soothing effect is at the small-study stage (ingredient-level, sample text)." }, time: "both", url: "#" },
  { id: "s4", name: "[샘플] 병풀 시카 진정 세럼", step: "serum", price: 16900, concerns: ["redness", "acne"], skinTypes: all, texture: "light", fragranceFree: true, vegan: true, sensitiveSafe: true, grade: "emerging", evidence: "병풀 성분의 홍조 완화는 초기 연구 단계(성분 수준, 샘플 문구).", en: { name: "[Sample] Centella calming serum", evidence: "Centella's effect on redness is at an early research stage (ingredient-level, sample text)." }, time: "both", url: "#" },
  // ---- Real products, taken from the original evening-routine page. Prices marked approxPrice are estimates to verify;
  // evidence grades are those of the original page where it gave one, otherwise "unrated" until reviewed with citations.
  { id: "r1", real: true, name: "비플레인 녹두 약산성 클렌징폼", step: "cleanser", price: 13000, approxPrice: true, concerns: ["acne", "pores", "redness"], skinTypes: all, texture: "light", fragranceFree: false, vegan: false, sensitiveSafe: true, grade: "unrated", evidence: "근거 검토 중이에요. 제품 설명(원본 페이지): 메이크업·노폐물 제거, 약산성으로 장벽 자극 최소화.", en: { name: "Beplain Mung Bean pH-Balanced Cleansing Foam", evidence: "Evidence under review. Product description (original page): removes makeup and impurities; mildly acidic to minimize barrier irritation." }, time: "both", image: "/products/beplain.jpg", url: "#" },
  { id: "r2", real: true, name: "에스네이처 아쿠아 오아시스 토너", step: "toner", price: 19900, approxPrice: true, concerns: ["dryness"], skinTypes: all, texture: "light", fragranceFree: false, vegan: false, sensitiveSafe: false, grade: "multiple", evidence: "멀티 분자량 히알루론산으로 보습 층을 보강(원본 페이지 설명). 히알루론산의 보습 효과는 여러 연구에서 보고됨. 성분 수준의 근거이며 제품 단독 시험은 아님. 인용 출처 추가 필요.", en: { name: "S.Nature Aqua Oasis Toner", evidence: "Multi-molecular-weight hyaluronic acid reinforces the hydration layer (original page). Hyaluronic acid's hydrating effect is reported in several studies; this is ingredient-level evidence, not a test of this product. Citations still to be added." }, time: "both", image: "/products/snature.jpg", url: "#" },
  { id: "r3", real: true, name: "토리든 다이브인 저분자 히알루론산 세럼", step: "serum", price: 16900, concerns: ["dryness"], skinTypes: all, texture: "light", fragranceFree: false, vegan: false, sensitiveSafe: false, grade: "multiple", evidence: "저분자 히알루론산으로 즉각적인 수분 공급(원본 페이지 설명). 히알루론산의 보습 효과는 여러 연구에서 보고됨. 성분 수준의 근거이며 제품 단독 시험은 아님. 인용 출처 추가 필요.", en: { name: "Torriden DIVE-IN Low-Molecular Hyaluronic Acid Serum", evidence: "Low-molecular hyaluronic acid for instant hydration (original page). Hyaluronic acid's hydrating effect is reported in several studies; this is ingredient-level evidence, not a test of this product. Citations still to be added." }, time: "both", url: "#" },
  { id: "r4", real: true, name: "아누아 PDRN 세럼", step: "serum", price: 28000, approxPrice: true, concerns: ["aging"], skinTypes: all, texture: "light", fragranceFree: false, vegan: false, sensitiveSafe: false, grade: "unrated", evidence: "근거 검토 중이에요. 제품 설명(원본 페이지): 탄력·재생 집중 케어.", en: { name: "Anua PDRN Serum", evidence: "Evidence under review. Product description (original page): firmness and renewal care." }, time: "both", url: "#" },
  { id: "r5", real: true, name: "토니모리 세라마이드 모찌 토너", step: "toner", price: 16000, approxPrice: true, concerns: ["dryness"], skinTypes: all, texture: "rich", fragranceFree: false, vegan: false, sensitiveSafe: false, grade: "unrated", evidence: "근거 검토 중이에요. 제품 설명(원본 페이지): 되직한 세라마이드 토너로 수분 밀봉.", en: { name: "TonyMoly Ceramide Mochi Toner", evidence: "Evidence under review. Product description (original page): a thick ceramide toner that seals in moisture." }, time: "both", image: "/products/tonymoly.jpg", url: "#" },
];

// Display text in the viewer's language (Korean is the base record).
export function localized(p: Product, locale: Locale): { name: string; evidence: string } {
  return locale === "en" ? p.en : { name: p.name, evidence: p.evidence };
}
