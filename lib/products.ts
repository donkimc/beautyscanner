import type { Locale } from "../i18n/locale";

// DEMO DATA ONLY: fictional products and placeholder evidence notes.
// Replace with curated, cited records before any real launch.

export type Step = "cleanser" | "toner" | "serum" | "moisturizer" | "sunscreen";
export type Grade = "clinical" | "multiple" | "brand" | "emerging";
export type Concern = "dryness" | "acne" | "pigmentation" | "aging";
export type SkinType = "dry" | "oily" | "combo" | "sensitive";

export interface Product {
  id: string;
  name: string;
  step: Step;
  price: number;
  concerns: Concern[];
  skinTypes: SkinType[];
  sensitiveSafe: boolean;
  grade: Grade;
  evidence: string;
  en: { name: string; evidence: string };
  url: string;
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
};

const all: SkinType[] = ["dry", "oily", "combo", "sensitive"];

export const PRODUCTS: Product[] = [
  { id: "c1", name: "[샘플] 약산성 젤 클렌저", step: "cleanser", price: 6900, concerns: ["dryness", "acne"], skinTypes: all, sensitiveSafe: true, grade: "brand", evidence: "브랜드 자체 피부자극 시험 결과(샘플 문구).", en: { name: "[Sample] Mild-acid gel cleanser", evidence: "Brand's own skin-irritation test (sample text)." }, url: "#" },
  { id: "c2", name: "[샘플] 세라마이드 크림 클렌저", step: "cleanser", price: 8900, concerns: ["dryness", "aging"], skinTypes: ["dry", "sensitive"], sensitiveSafe: true, grade: "emerging", evidence: "소규모 연구에서 세정 후 수분 손실 감소 경향(샘플 문구).", en: { name: "[Sample] Ceramide cream cleanser", evidence: "A small study suggests less water loss after cleansing (sample text)." }, url: "#" },
  { id: "t1", name: "[샘플] 히알루론산 토너", step: "toner", price: 12900, concerns: ["dryness", "aging"], skinTypes: all, sensitiveSafe: true, grade: "multiple", evidence: "히알루론산의 보습 효과는 여러 연구에서 보고됨. 성분 수준의 근거이며 제품 단독 시험은 아님(샘플 문구).", en: { name: "[Sample] Hyaluronic acid toner", evidence: "Hyaluronic acid's hydrating effect is reported in several studies. This is ingredient-level evidence, not a test of this product (sample text)." }, url: "#" },
  { id: "t2", name: "[샘플] BHA 스무딩 토너", step: "toner", price: 9900, concerns: ["acne", "pigmentation"], skinTypes: ["oily", "combo"], sensitiveSafe: false, grade: "multiple", evidence: "살리실산(BHA)의 여드름 개선은 다수 연구 보고. 성분 수준 근거(샘플 문구).", en: { name: "[Sample] BHA smoothing toner", evidence: "Salicylic acid (BHA) is reported to improve acne in multiple studies. Ingredient-level evidence (sample text)." }, url: "#" },
  { id: "s1", name: "[샘플] 저분자 히알루론산 세럼", step: "serum", price: 12900, concerns: ["dryness"], skinTypes: all, sensitiveSafe: true, grade: "multiple", evidence: "다수 연구가 히알루론산의 피부 수분 개선을 보고(성분 수준, 샘플 문구).", en: { name: "[Sample] Low-molecular hyaluronic acid serum", evidence: "Multiple studies report improved skin hydration from hyaluronic acid (ingredient-level, sample text)." }, url: "#" },
  { id: "s2", name: "[샘플] 나이아신아마이드 10% 세럼", step: "serum", price: 15000, concerns: ["pigmentation", "acne"], skinTypes: ["oily", "combo", "dry"], sensitiveSafe: false, grade: "clinical", evidence: "나이아신아마이드는 RCT·메타분석에서 색소 및 피지 개선 보고(성분 수준, 샘플 문구).", en: { name: "[Sample] Niacinamide 10% serum", evidence: "Niacinamide shows improvements in pigmentation and oil in RCTs and meta-analyses (ingredient-level, sample text)." }, url: "#" },
  { id: "s3", name: "[샘플] 레티날 0.1% 세럼", step: "serum", price: 19000, concerns: ["aging", "pigmentation"], skinTypes: ["dry", "oily", "combo"], sensitiveSafe: false, grade: "clinical", evidence: "레티노이드 계열은 노화 징후 개선에 대한 RCT 근거가 풍부(성분 수준, 샘플 문구). 자극 가능성 있음.", en: { name: "[Sample] Retinal 0.1% serum", evidence: "Retinoids have substantial RCT evidence for signs of aging (ingredient-level, sample text). May cause irritation." }, url: "#" },
  { id: "m1", name: "[샘플] 세라마이드 장벽 크림", step: "moisturizer", price: 14900, concerns: ["dryness", "aging"], skinTypes: ["dry", "sensitive", "combo"], sensitiveSafe: true, grade: "multiple", evidence: "세라마이드 함유 보습제는 장벽 회복 연구 다수(성분 수준, 샘플 문구).", en: { name: "[Sample] Ceramide barrier cream", evidence: "Ceramide-containing moisturizers have many barrier-repair studies (ingredient-level, sample text)." }, url: "#" },
  { id: "m2", name: "[샘플] 가벼운 수분 젤크림", step: "moisturizer", price: 9900, concerns: ["acne", "dryness"], skinTypes: ["oily", "combo"], sensitiveSafe: true, grade: "brand", evidence: "브랜드 자체 사용자 평가(샘플 문구). 독립 연구 아님.", en: { name: "[Sample] Light hydrating gel cream", evidence: "Brand's own user rating (sample text). Not independent research." }, url: "#" },
  { id: "f1", name: "[샘플] 무기자차 선크림 SPF50+", step: "sunscreen", price: 12000, concerns: ["pigmentation", "aging", "dryness", "acne"], skinTypes: all, sensitiveSafe: true, grade: "clinical", evidence: "자외선 차단은 색소·광노화 예방에 대한 근거가 확립됨. 제품 SPF/PA는 공인 시험 표기 기준(샘플 문구).", en: { name: "[Sample] Mineral sunscreen SPF50+", evidence: "Sun protection against pigmentation and photoaging is well established. Product SPF/PA follows certified test labelling (sample text)." }, url: "#" },
  { id: "f2", name: "[샘플] 유기자차 선에센스 SPF50+", step: "sunscreen", price: 9500, concerns: ["pigmentation", "aging", "acne"], skinTypes: ["oily", "combo", "dry"], sensitiveSafe: false, grade: "clinical", evidence: "자외선 차단 일반 근거 확립. 일부 민감 피부에는 자극 가능(샘플 문구).", en: { name: "[Sample] Chemical sun essence SPF50+", evidence: "General sun-protection evidence is established. May irritate some sensitive skin (sample text)." }, url: "#" },
];

// Display text in the viewer's language (Korean is the base record).
export function localized(p: Product, locale: Locale): { name: string; evidence: string } {
  return locale === "en" ? p.en : { name: p.name, evidence: p.evidence };
}
