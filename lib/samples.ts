import type { Concern, Product, SkinType, Step } from "./products";

// SAMPLE DATA ONLY. Every product below is fictional: invented brands, invented prices, no real study, no evidence grade.
// They exist so the recommender has realistic choices for every survey answer. Pictures are AI-generated illustrations of
// generic packaging with a made-up brand label (see scripts/gen-images.ts). Hide them all with HIDE_SAMPLES=1 once real products exist.

const ALL: SkinType[] = ["dry", "oily", "combo", "sensitive", "unsure"];
const DRY_SENS: SkinType[] = ["dry", "sensitive", "combo", "unsure"];
const OILY: SkinType[] = ["oily", "combo", "unsure"];
const NOT_SENS: SkinType[] = ["dry", "oily", "combo", "unsure"];

interface Formula {
  ko: string;
  en: string;
  /** What the picture shows, e.g. "gel cleanser". */
  item: string;
  containers: string[];
  concerns: Concern[];
  skinTypes: SkinType[];
  texture: "light" | "rich";
  sensitiveSafe: boolean;
  /** false = scented formula (the product is never fragrance-free). */
  fragranceOk: boolean;
  /** true = may contain an animal-derived ingredient (never vegan). */
  animal?: boolean;
  time: "am" | "pm" | "both";
  price: number;
}

interface Brand { ko: string; en: string; mult: number; vegan: boolean; clean: boolean }

// Invented names. Any resemblance to a real brand is a coincidence.
const BRANDS: Brand[] = [
  { ko: "하늘담", en: "Haneuldam", mult: 0.9, vegan: true, clean: true },
  { ko: "아침결", en: "Achimgyeol", mult: 1.0, vegan: false, clean: true },
  { ko: "솔빛", en: "Solbit", mult: 1.15, vegan: true, clean: false },
  { ko: "물결담", en: "Mulgyeoldam", mult: 0.8, vegan: false, clean: false },
  { ko: "봄뜰", en: "Bomddeul", mult: 1.3, vegan: true, clean: true },
  { ko: "이슬결", en: "Iseulgyeol", mult: 1.0, vegan: true, clean: true },
  { ko: "숲담", en: "Supdam", mult: 1.5, vegan: true, clean: true },
  { ko: "달결", en: "Dalgyeol", mult: 0.85, vegan: false, clean: true },
  { ko: "은결", en: "Eungyeol", mult: 1.2, vegan: false, clean: false },
  { ko: "윤담", en: "Yundam", mult: 1.7, vegan: true, clean: true },
];

const F = (f: Formula) => f;
const FORMULAS: Record<Step, Formula[]> = {
  cleanser: [
    F({ ko: "약산성 젤 클렌저", en: "mild-acid gel cleanser", item: "gel cleanser", containers: ["tube", "pump bottle"], concerns: ["dryness", "acne", "redness"], skinTypes: ALL, texture: "light", sensitiveSafe: true, fragranceOk: true, time: "both", price: 6900 }),
    F({ ko: "세라마이드 크림 클렌저", en: "ceramide cream cleanser", item: "cream cleanser", containers: ["tube", "pump bottle"], concerns: ["dryness", "aging", "redness"], skinTypes: ["dry", "sensitive", "unsure"], texture: "rich", sensitiveSafe: true, fragranceOk: true, time: "both", price: 8900 }),
    F({ ko: "녹차 폼 클렌저", en: "green tea foam cleanser", item: "foaming cleanser", containers: ["tube", "pump bottle"], concerns: ["acne", "pores"], skinTypes: OILY, texture: "light", sensitiveSafe: true, fragranceOk: false, time: "both", price: 7500 }),
    F({ ko: "클레이 포어 클렌저", en: "clay pore cleanser", item: "clay cleanser", containers: ["tube", "jar"], concerns: ["pores", "acne"], skinTypes: ["oily", "combo"], texture: "light", sensitiveSafe: false, fragranceOk: true, time: "both", price: 8500 }),
    F({ ko: "클렌징 밤", en: "cleansing balm", item: "cleansing balm", containers: ["jar", "tub"], concerns: ["dryness"], skinTypes: ALL, texture: "rich", sensitiveSafe: true, fragranceOk: true, time: "pm", price: 11000 }),
    F({ ko: "효소 파우더 워시", en: "enzyme powder wash", item: "powder wash", containers: ["jar", "small canister"], concerns: ["pigmentation", "pores"], skinTypes: NOT_SENS, texture: "light", sensitiveSafe: false, fragranceOk: false, time: "pm", price: 9500 }),
  ],
  toner: [
    F({ ko: "히알루론산 토너", en: "hyaluronic acid toner", item: "toner", containers: ["bottle with screw cap", "pump bottle"], concerns: ["dryness", "aging"], skinTypes: ALL, texture: "light", sensitiveSafe: true, fragranceOk: true, time: "both", price: 11900 }),
    F({ ko: "BHA 스무딩 토너", en: "BHA smoothing toner", item: "exfoliating toner", containers: ["bottle with screw cap", "pump bottle"], concerns: ["acne", "pores", "pigmentation"], skinTypes: OILY, texture: "light", sensitiveSafe: false, fragranceOk: false, time: "pm", price: 9900 }),
    F({ ko: "병풀 진정 토너", en: "centella calming toner", item: "toner", containers: ["bottle with screw cap", "pump bottle"], concerns: ["redness", "acne", "dryness"], skinTypes: ALL, texture: "light", sensitiveSafe: true, fragranceOk: true, time: "both", price: 12900 }),
    F({ ko: "세라마이드 모찌 토너", en: "ceramide mochi toner", item: "thick toner", containers: ["wide bottle", "jar"], concerns: ["dryness", "aging"], skinTypes: DRY_SENS, texture: "rich", sensitiveSafe: true, fragranceOk: true, time: "both", price: 14900 }),
    F({ ko: "PHA 부드러운 각질 토너", en: "PHA gentle exfoliating toner", item: "exfoliating toner", containers: ["bottle with screw cap", "pump bottle"], concerns: ["pores", "pigmentation"], skinTypes: ALL, texture: "light", sensitiveSafe: false, fragranceOk: true, time: "pm", price: 12500 }),
    F({ ko: "나이아신아마이드 브라이트닝 토너", en: "niacinamide brightening toner", item: "toner", containers: ["bottle with screw cap", "pump bottle"], concerns: ["pigmentation", "pores"], skinTypes: NOT_SENS, texture: "light", sensitiveSafe: true, fragranceOk: true, time: "both", price: 11500 }),
    F({ ko: "쌀겨 보습 에센스 토너", en: "rice bran moisture essence toner", item: "essence toner", containers: ["wide bottle", "bottle with screw cap"], concerns: ["dryness", "pigmentation"], skinTypes: ALL, texture: "rich", sensitiveSafe: true, fragranceOk: true, time: "both", price: 13500 }),
  ],
  serum: [
    F({ ko: "저분자 히알루론산 세럼", en: "low-molecular hyaluronic serum", item: "serum", containers: ["dropper bottle", "pump bottle"], concerns: ["dryness"], skinTypes: ALL, texture: "light", sensitiveSafe: true, fragranceOk: true, time: "both", price: 12900 }),
    F({ ko: "나이아신아마이드 10% 세럼", en: "niacinamide 10% serum", item: "serum", containers: ["dropper bottle", "pump bottle"], concerns: ["pigmentation", "acne", "pores"], skinTypes: NOT_SENS, texture: "light", sensitiveSafe: false, fragranceOk: true, time: "both", price: 15000 }),
    F({ ko: "레티날 0.1% 세럼", en: "retinal 0.1% serum", item: "serum", containers: ["airless pump bottle", "dropper bottle"], concerns: ["aging", "pigmentation"], skinTypes: NOT_SENS, texture: "rich", sensitiveSafe: false, fragranceOk: false, time: "pm", price: 19000 }),
    F({ ko: "병풀 시카 진정 세럼", en: "centella cica calming serum", item: "serum", containers: ["dropper bottle", "pump bottle"], concerns: ["redness", "acne"], skinTypes: ALL, texture: "light", sensitiveSafe: true, fragranceOk: true, time: "both", price: 16900 }),
    F({ ko: "비타민C 15% 세럼", en: "vitamin C 15% serum", item: "serum", containers: ["dark dropper bottle", "airless pump bottle"], concerns: ["pigmentation", "aging"], skinTypes: NOT_SENS, texture: "light", sensitiveSafe: false, fragranceOk: false, time: "both", price: 18000 }),
    F({ ko: "순한 비타민C 유도체 세럼", en: "gentle vitamin C derivative serum", item: "serum", containers: ["dropper bottle", "pump bottle"], concerns: ["pigmentation"], skinTypes: ALL, texture: "light", sensitiveSafe: true, fragranceOk: true, time: "both", price: 17500 }),
    F({ ko: "펩타이드 탄력 세럼", en: "peptide firming serum", item: "serum", containers: ["dropper bottle", "airless pump bottle"], concerns: ["aging"], skinTypes: ALL, texture: "rich", sensitiveSafe: true, fragranceOk: true, time: "both", price: 21000 }),
    F({ ko: "아젤라산 10% 세럼", en: "azelaic acid 10% serum", item: "serum", containers: ["tube", "pump bottle"], concerns: ["acne", "redness", "pigmentation"], skinTypes: OILY, texture: "light", sensitiveSafe: false, fragranceOk: true, time: "both", price: 16500 }),
    F({ ko: "세라마이드 장벽 앰플", en: "ceramide barrier ampoule", item: "ampoule", containers: ["dropper bottle", "small pump bottle"], concerns: ["dryness", "redness"], skinTypes: DRY_SENS, texture: "rich", sensitiveSafe: true, fragranceOk: true, time: "both", price: 18900 }),
    F({ ko: "트라넥삼산 톤 세럼", en: "tranexamic acid tone serum", item: "serum", containers: ["dropper bottle", "pump bottle"], concerns: ["pigmentation"], skinTypes: ALL, texture: "light", sensitiveSafe: true, fragranceOk: true, time: "both", price: 17000 }),
    F({ ko: "콜라겐 탄력 앰플", en: "collagen firming ampoule", item: "ampoule", containers: ["dropper bottle", "small pump bottle"], concerns: ["aging", "dryness"], skinTypes: ALL, texture: "rich", sensitiveSafe: true, fragranceOk: false, animal: true, time: "both", price: 22000 }),
  ],
  moisturizer: [
    F({ ko: "세라마이드 장벽 크림", en: "ceramide barrier cream", item: "face cream", containers: ["jar", "tube"], concerns: ["dryness", "aging", "redness"], skinTypes: DRY_SENS, texture: "rich", sensitiveSafe: true, fragranceOk: true, time: "both", price: 14900 }),
    F({ ko: "가벼운 수분 젤크림", en: "light hydrating gel cream", item: "gel cream", containers: ["jar", "tube"], concerns: ["acne", "dryness", "pores"], skinTypes: OILY, texture: "light", sensitiveSafe: true, fragranceOk: true, time: "both", price: 9900 }),
    F({ ko: "병풀 진정 크림", en: "centella calming cream", item: "face cream", containers: ["jar", "tube"], concerns: ["redness", "acne"], skinTypes: ALL, texture: "light", sensitiveSafe: true, fragranceOk: true, time: "both", price: 13500 }),
    F({ ko: "히알루론산 수분 크림", en: "hyaluronic hydrating cream", item: "face cream", containers: ["jar", "tube"], concerns: ["dryness"], skinTypes: ALL, texture: "light", sensitiveSafe: true, fragranceOk: true, time: "both", price: 12500 }),
    F({ ko: "나이아신아마이드 톤 크림", en: "niacinamide tone cream", item: "face cream", containers: ["jar", "tube"], concerns: ["pigmentation", "pores"], skinTypes: NOT_SENS, texture: "light", sensitiveSafe: true, fragranceOk: true, time: "both", price: 13900 }),
    F({ ko: "펩타이드 탄력 크림", en: "peptide firming cream", item: "face cream", containers: ["jar", "airless pump jar"], concerns: ["aging"], skinTypes: ALL, texture: "rich", sensitiveSafe: true, fragranceOk: true, time: "both", price: 23000 }),
    F({ ko: "스쿠알란 영양 크림", en: "squalane nourishing cream", item: "rich face cream", containers: ["jar", "tub"], concerns: ["dryness", "aging"], skinTypes: ["dry", "sensitive", "unsure"], texture: "rich", sensitiveSafe: true, fragranceOk: true, time: "both", price: 16500 }),
    F({ ko: "레티놀 나이트 크림", en: "retinol night cream", item: "night cream", containers: ["jar", "airless pump jar"], concerns: ["aging", "pigmentation"], skinTypes: NOT_SENS, texture: "rich", sensitiveSafe: false, fragranceOk: false, animal: true, time: "pm", price: 21000 }),
    F({ ko: "오일프리 수분 로션", en: "oil-free moisture lotion", item: "lotion", containers: ["pump bottle", "tube"], concerns: ["pores", "acne", "dryness"], skinTypes: OILY, texture: "light", sensitiveSafe: true, fragranceOk: true, time: "both", price: 9500 }),
  ],
  sunscreen: [
    F({ ko: "무기자차 선크림 SPF50+", en: "mineral sunscreen SPF50+", item: "sunscreen", containers: ["tube", "squeeze bottle"], concerns: ["pigmentation", "aging", "dryness", "acne", "redness"], skinTypes: ALL, texture: "rich", sensitiveSafe: true, fragranceOk: true, time: "am", price: 12000 }),
    F({ ko: "유기자차 선에센스 SPF50+", en: "chemical sun essence SPF50+", item: "sun essence", containers: ["tube", "squeeze bottle"], concerns: ["pigmentation", "aging", "acne"], skinTypes: NOT_SENS, texture: "light", sensitiveSafe: false, fragranceOk: false, time: "am", price: 9500 }),
    F({ ko: "순한 무기자차 선로션", en: "gentle mineral sun lotion", item: "sunscreen", containers: ["tube", "pump bottle"], concerns: ["redness", "dryness", "pigmentation"], skinTypes: ALL, texture: "rich", sensitiveSafe: true, fragranceOk: true, time: "am", price: 13500 }),
    F({ ko: "가벼운 선젤", en: "lightweight sun gel", item: "sun gel", containers: ["tube", "squeeze bottle"], concerns: ["acne", "pores", "pigmentation"], skinTypes: OILY, texture: "light", sensitiveSafe: true, fragranceOk: true, time: "am", price: 10500 }),
    F({ ko: "톤업 선크림", en: "tone-up sunscreen", item: "sunscreen", containers: ["tube", "squeeze bottle"], concerns: ["pigmentation", "aging"], skinTypes: ALL, texture: "light", sensitiveSafe: false, fragranceOk: false, time: "am", price: 11500 }),
    F({ ko: "수분 선크림", en: "hydrating sunscreen", item: "sunscreen", containers: ["tube", "pump bottle"], concerns: ["dryness", "aging", "pigmentation"], skinTypes: DRY_SENS, texture: "rich", sensitiveSafe: true, fragranceOk: true, time: "am", price: 12900 }),
    F({ ko: "선스틱", en: "sun stick", item: "sunscreen stick", containers: ["stick"], concerns: ["pigmentation", "aging"], skinTypes: ALL, texture: "light", sensitiveSafe: true, fragranceOk: true, time: "am", price: 14500 }),
  ],
};

const PREFIX: Record<Step, string> = { cleanser: "c", toner: "t", serum: "s", moisturizer: "m", sunscreen: "f" };
const COLORS = ["white", "pale pink", "soft beige", "pale green", "light grey", "pale blue", "cream", "lavender", "amber glass", "frosted clear"];
const BACKDROPS = ["plain light grey", "soft pink", "white marble", "pale beige", "light wooden", "off-white"];
const VARIANTS = 5; // brands per formula

export interface SampleSpec { product: Product; /** Text prompt for the picture (generic packaging, no text or logo). */ prompt: string }

function build(): SampleSpec[] {
  const out: SampleSpec[] = [];
  (Object.keys(FORMULAS) as Step[]).forEach((step) => {
    FORMULAS[step].forEach((f, fi) => {
      for (let v = 0; v < VARIANTS; v++) {
        const brand = BRANDS[(fi * 3 + v * 2) % BRANDS.length];
        // The fourth variant is the opposite feel, named as such so the label stays honest.
        const flip = v === 3 && step !== "toner";
        const texture: "light" | "rich" = flip ? (f.texture === "light" ? "rich" : "light") : f.texture;
        const tag = flip ? { ko: texture === "light" ? " (가벼운 타입)" : " (리치 타입)", en: texture === "light" ? " (lightweight)" : " (rich)" } : { ko: "", en: "" };
        const id = `${PREFIX[step]}${String(fi * VARIANTS + v + 1).padStart(2, "0")}`;
        const price = Math.round((f.price * brand.mult) / 100) * 100;
        const n = fi * 7 + v * 3 + step.length;
        const container = f.containers[(fi + v) % f.containers.length];
        out.push({
          product: {
            id,
            name: `[샘플] ${brand.ko} ${f.ko}${tag.ko}`,
            step,
            price,
            concerns: f.concerns,
            skinTypes: f.skinTypes,
            texture,
            fragranceFree: f.fragranceOk && brand.clean,
            vegan: brand.vegan && !f.animal,
            sensitiveSafe: f.sensitiveSafe,
            grade: "unrated",
            evidence: "샘플 데이터예요. 실제 제품도 연구도 아니며, 근거 등급이 없어요.",
            en: { name: `[Sample] ${brand.en} ${f.en}${tag.en}`, evidence: "Sample data. Not a real product or study, and it has no evidence grade." },
            time: f.time,
            image: `/products/demo/${id}.jpg`,
            url: "#",
          },
          prompt: `Product photo of a ${COLORS[n % COLORS.length]} ${container} of skincare ${f.item}. A simple minimal label on the front reads "${brand.en}" in large letters and "${f.en}" in small letters below it, nothing else, no logo, no other text, no claims. No people, ${BACKDROPS[(n + fi) % BACKDROPS.length]} background, soft natural light, realistic photograph`,
        });
      }
    });
  });
  return out;
}

export const SAMPLE_SPECS: SampleSpec[] = build();
export const SAMPLE_PRODUCTS: Product[] = SAMPLE_SPECS.map((s) => s.product);
