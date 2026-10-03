import type { Locale } from "./locale";

const ko = {
  brand: "뷰티스캐너",
  common: { login: "로그인", logout: "로그아웃", back: "← 이전", home: "← 처음으로", restart: "다시 하기", cancel: "취소", continue: "계속", demo: "데모 버전 · 제품과 근거는 샘플 데이터입니다", disclaimer: "이 서비스는 진단이나 치료를 대체하지 않아요. 증상이 지속되면 피부과 전문의와 상담하세요.", language: "언어", won: "원", close: "닫기" },
  nav: { terms: "이용약관", privacy: "개인정보처리방침", security: "보안", account: "내 계정" },
  landing: {
    eyebrow: "과학적 근거 기반 스킨케어",
    title1: "광고 말고,", titleAccent: "근거", title2: "로 고르는 내 스킨케어",
    words: ["건조함", "트러블", "색소·잡티", "주름·탄력"],
    subPre: "", subPost: " 고민에 맞는 루틴을", sub2: "예산 안에서, 이유까지 알려드려요.",
    try: "무료로 체험하기 →", hint: "설문 5문항 · 가입 없이 결과 확인",
    features: [
      { title: "근거 등급 표시", body: "임상 검증부터 브랜드 자체 시험까지, 신뢰도가 다르면 다르다고 표시해요." },
      { title: "예산에 맞춘 루틴", body: "3단계·5단계, 내 예산 안에서 빠진 단계까지 짚어드려요." },
      { title: "솔직한 광고 표기", body: "구매 링크에는 AD를 붙이고, 광고가 근거 등급을 바꾸지 않아요." },
    ],
  },
  newsletter: {
    label: "NEWSLETTER · 데모", title: "매주 한 번, 근거 리포트", body: "성분 하나를 골라 연구가 실제로 말하는 것만 정리해 드려요.",
    sampleLabel: "샘플 · 이번 주 리포트 #1", sampleTitle: "히알루론산, 정말 속건조에 효과가 있을까?", sampleBody: "성분 수준 근거와 제품 수준 근거를 나눠서 살펴봅니다. (샘플 문구)",
    placeholder: "you@example.com", submit: "구독하기",
    badEmail: "올바른 이메일 주소를 입력해 주세요.", needConsent: "구독하려면 수신 동의가 필요해요.",
    done: "✓ 구독 신청이 접수된 것처럼 보여드렸어요. 데모라서 이메일은 저장되거나 발송되지 않습니다.",
  },
  survey: {
    step: (i: number, n: number) => `질문 ${i} / ${n}`,
    questions: [
      { key: "skinType", title: "피부 타입이 어떻게 되세요?", sub: "가장 가깝다고 느끼는 타입을 선택해주세요", options: [{ label: "건성", value: "dry" }, { label: "지성", value: "oily" }, { label: "복합성", value: "combo" }, { label: "민감성", value: "sensitive" }] },
      { key: "concern", title: "가장 신경 쓰이는 고민은요?", sub: "가장 먼저 개선하고 싶은 하나를 골라주세요", options: [{ label: "건조함·수분", value: "dryness" }, { label: "트러블", value: "acne" }, { label: "색소·잡티", value: "pigmentation" }, { label: "주름·탄력", value: "aging" }] },
      { key: "sensitive", title: "화장품에 따갑거나 붉어진 적이 있나요?", sub: "자극이 될 수 있는 제품은 빼고 골라드려요", options: [{ label: "자주 있어요", value: true }, { label: "거의 없어요", value: false }] },
      { key: "budget", title: "선호하는\n예산대는?", sub: "제품 구매 시 기준이 되는 가격대예요", options: [{ label: "3만원 이하", value: 30000 }, { label: "3~7만원", value: 70000 }, { label: "7~15만원", value: 150000 }, { label: "15만원 이상", value: 1000000 }] },
      { key: "steps", title: "어느 정도 단계를 원하세요?", sub: "원하는 루틴 길이를 골라주세요", options: [{ label: "간단하게 3단계", value: 3 }, { label: "꼼꼼하게 5단계", value: 5 }] },
    ],
    noteLabel: "마지막 · 선택사항", noteTitle: "피부에 대해 더 알려주실 게 있나요?", notePlaceholder: "예: 레티놀 쓰면 붉어져요 / 환절기에 특히 건조해요", seeRoutine: "내 루틴 보기",
    building: "루틴을 만드는 중…", consentDeclined: "맞춤 추천을 위해 설문 정보 수집 동의가 필요해요.",
  },
  result: {
    label: (n: number) => `맞춤 루틴 · ${n} STEP`, title: "당신을 위한 추천",
    budgetLine: (band: string, total: string, ai: boolean) => `예산대 ${band} · 합계 ${total}원${ai ? " · AI 설명" : ""}`,
    warnings: { budget: "예산 내에서 구성하기 어려워 일부 제품이 예산을 넘어요.", noCream: "크림이 빠져 있어 밀봉력이 약할 수 있어요.", noSunscreen: "선크림이 없어요. 낮 루틴에는 꼭 필요해요.", missing: (n: number) => `조건에 맞는 제품이 없어 ${n}단계를 채우지 못했어요.` },
    steps: { cleanser: "클렌저", toner: "토너", serum: "세럼", moisturizer: "크림", sunscreen: "선크림" },
    evidence: "근거", buy: "구매하러 가기 ↗", ad: "AD",
    grades: { clinical: "임상적으로 검증됨", multiple: "다수 연구 뒷받침", brand: "브랜드 자체 시험", emerging: "근거 신흥 단계" },
    fine: "성분 수준의 근거는 제품 자체의 효과를 보장하지 않습니다. 이 서비스는 진단이나 치료를 대체하지 않으며, 증상이 지속되면 피부과 전문의와 상담하세요. 구매 링크는 광고(AD)를 포함할 수 있습니다.",
    save: "루틴 저장하기", saveLogin: "로그인하고 루틴 저장하기", saved: "저장됨 ✓", savedHint: "계정에 저장되었어요. 내 계정에서 다시 볼 수 있어요.", saveFailed: "저장하지 못했어요. 잠시 후 다시 시도해 주세요.",
    why: (concern: string, band: string) => `'${concern}' 고민과 예산대(${band})에 맞춰 골랐어요.`,
    concerns: { dryness: "건조함", acne: "트러블", pigmentation: "색소·잡티", aging: "노화 징후" },
  },
  login: {
    label: "LOGIN", title: "로그인 · 회원가입", sub: "이메일로 확인 링크를 보내드려요. 링크를 누르면 바로 로그인되고, 처음이라면 계정이 만들어져요.",
    email: "이메일", send: "확인 메일 받기", or: "또는", google: "Google로 계속하기", tryAnyway: "로그인 없이도 체험해 보기",
    sent: "확인 메일을 보냈어요", sentBody: (e: string) => `${e} 로 보낸 메일의 링크를 눌러 로그인을 완료하세요. 링크는 15분 동안 유효해요.`,
    devLink: "개발 모드: 메일 대신 아래 링크로 로그인할 수 있어요.", resend: "다른 이메일 사용", spam: "메일이 안 보이면 스팸함을 확인해 주세요.",
    errors: {
      not_configured: "이 로그인 방법은 아직 서버에 설정되지 않았어요.", email_not_configured: "이메일 발송이 아직 설정되지 않았어요.", denied: "로그인이 취소되었어요.",
      invalid_state: "로그인 세션이 만료되었어요. 다시 시도해 주세요.", unverified_email: "인증된 이메일이 필요해요.", signin_failed: "로그인 중 문제가 생겼어요. 잠시 후 다시 시도해 주세요.",
      bad_email: "올바른 이메일 주소를 입력해 주세요.", rate_limited: "요청이 너무 많아요. 한 시간 뒤에 다시 시도해 주세요.", send_failed: "메일을 보내지 못했어요. 잠시 후 다시 시도해 주세요.", consent: "이용약관 및 개인정보 수집에 동의해야 해요.",
    },
  },
  verify: { title: "로그인 확인", body: "아래 버튼을 눌러 로그인을 완료하세요.", confirm: "로그인 완료", working: "확인하는 중…", invalid: "링크가 만료되었거나 이미 사용되었어요. 새 확인 메일을 받아 주세요.", back: "로그인으로 돌아가기" },
  account: {
    title: "내 계정", routines: "저장한 루틴", none: "아직 저장한 루틴이 없어요.", tryNow: "루틴 만들기", delete: "삭제", total: "합계",
    data: "내 데이터", export: "내 데이터 내려받기", deleteAccount: "계정과 모든 데이터 삭제", deleteConfirm: "계정, 저장한 루틴, 동의 기록이 모두 삭제되며 되돌릴 수 없어요. 계속할까요?", deleted: "계정이 삭제되었어요.",
  },
  consent: {
    title: "동의가 필요해요", intro: "아래 항목에 동의하면 계속할 수 있어요. 언제든 철회할 수 있어요.", agree: "동의하고 계속", decline: "동의하지 않음", withdraw: "동의 철회", give: "동의하기", required: "필수", optional: "선택", version: "버전", read: "전문 보기",
    purposes: {
      terms: { label: "이용약관 및 개인정보 처리 동의", body: "서비스 이용약관과 개인정보처리방침을 읽고 동의합니다. 로그인에 필요한 이메일과 이름을 수집·이용합니다." },
      sensitive: { label: "피부 설문 정보 수집·이용 동의 (민감정보 포함)", body: "피부 타입, 고민, 민감성 등 건강과 관련될 수 있는 정보를 맞춤 루틴을 제공하는 목적으로만 수집·이용합니다. 동의하지 않으면 맞춤 추천을 받을 수 없어요." },
      ai: { label: "AI 설명 생성을 위한 국외 이전 동의", body: "추천 이유를 쓰기 위해 설문 항목(이름·이메일 제외)이 AI 제공사(DeepSeek, 중국 소재 서버)로 전송될 수 있어요. 동의하지 않으면 AI 대신 기본 설명이 표시돼요." },
      marketing: { label: "광고성 정보(뉴스레터) 수신 동의", body: "근거 리포트 등 광고성 정보를 이메일로 받는 데 동의합니다. 언제든 수신을 거부할 수 있어요." },
    },
  },
  footer: { legalNote: "법률 문서는 초안 템플릿입니다." },
  legal: { updated: "최종 수정일", draft: "이 문서는 서비스 초안 템플릿이며 법률 자문이 아닙니다. 정식 출시 전 변호사의 검토를 받으세요.", contents: "목차" },
};

export type Messages = typeof ko;

const en: Messages = {
  brand: "BeautyScanner",
  common: { login: "Log in", logout: "Log out", back: "← Back", home: "← Home", restart: "Start over", cancel: "Cancel", continue: "Continue", demo: "Demo · products and evidence are sample data", disclaimer: "This service does not replace diagnosis or treatment. If symptoms persist, see a dermatologist.", language: "Language", won: "KRW", close: "Close" },
  nav: { terms: "Terms of Service", privacy: "Privacy Policy", security: "Security", account: "My account" },
  landing: {
    eyebrow: "EVIDENCE-BASED SKINCARE",
    title1: "Skip the ads.", titleAccent: "Evidence", title2: " picks your skincare.",
    words: ["dryness", "breakouts", "dark spots", "fine lines"],
    subPre: "A routine for ", subPost: ",", sub2: "within your budget, with the reasons.",
    try: "Try it free →", hint: "5 questions · results without signing up",
    features: [
      { title: "Evidence grades", body: "From clinical trials to a brand's own tests, we label how strong each claim really is." },
      { title: "Routines within budget", body: "3 or 5 steps, and we flag missing steps for your budget." },
      { title: "Honest ad labels", body: "Buy links carry an AD tag, and ads never change an evidence grade." },
    ],
  },
  newsletter: {
    label: "NEWSLETTER · DEMO", title: "One evidence report a week", body: "We pick one ingredient and summarize only what the research actually says.",
    sampleLabel: "Sample · this week's report #1", sampleTitle: "Does hyaluronic acid really help inner dryness?", sampleBody: "We separate ingredient-level evidence from product-level evidence. (sample text)",
    placeholder: "you@example.com", submit: "Subscribe",
    badEmail: "Please enter a valid email address.", needConsent: "We need your consent to subscribe.",
    done: "✓ Your subscription looks received. This is a demo: your email is not stored or sent anywhere.",
  },
  survey: {
    step: (i: number, n: number) => `Question ${i} / ${n}`,
    questions: [
      { key: "skinType", title: "What's your skin type?", sub: "Pick the type that feels closest", options: [{ label: "Dry", value: "dry" }, { label: "Oily", value: "oily" }, { label: "Combination", value: "combo" }, { label: "Sensitive", value: "sensitive" }] },
      { key: "concern", title: "What bothers you most?", sub: "Pick the one you'd like to improve first", options: [{ label: "Dryness / hydration", value: "dryness" }, { label: "Breakouts", value: "acne" }, { label: "Dark spots", value: "pigmentation" }, { label: "Fine lines / firmness", value: "aging" }] },
      { key: "sensitive", title: "Has a product ever stung or turned your skin red?", sub: "We'll leave out products that may irritate", options: [{ label: "Often", value: true }, { label: "Rarely", value: false }] },
      { key: "budget", title: "Your preferred price range?", sub: "The price range you usually shop in", options: [{ label: "Under ₩30,000", value: 30000 }, { label: "₩30,000–70,000", value: 70000 }, { label: "₩70,000–150,000", value: 150000 }, { label: "Over ₩150,000", value: 1000000 }] },
      { key: "steps", title: "How many steps do you want?", sub: "Choose how long your routine should be", options: [{ label: "Simple: 3 steps", value: 3 }, { label: "Thorough: 5 steps", value: 5 }] },
    ],
    noteLabel: "Last · optional", noteTitle: "Anything else about your skin?", notePlaceholder: "e.g. Retinol makes me red / very dry when seasons change", seeRoutine: "See my routine",
    building: "Building your routine…", consentDeclined: "We need your consent to process your survey answers to personalize recommendations.",
  },
  result: {
    label: (n: number) => `YOUR ROUTINE · ${n} STEPS`, title: "Recommended for you",
    budgetLine: (band: string, total: string, ai: boolean) => `Price range ${band} · total ₩${total}${ai ? " · AI explanations" : ""}`,
    warnings: { budget: "We couldn't fit this within your budget, so some products exceed it.", noCream: "No moisturizer is included, so the seal may be weak.", noSunscreen: "No sunscreen is included. You need it for a daytime routine.", missing: (n: number) => `No matching product for ${n} step(s), so they were left out.` },
    steps: { cleanser: "Cleanser", toner: "Toner", serum: "Serum", moisturizer: "Moisturizer", sunscreen: "Sunscreen" },
    evidence: "Evidence", buy: "Buy ↗", ad: "AD",
    grades: { clinical: "Clinically validated", multiple: "Multiple studies", brand: "Brand's own test", emerging: "Emerging evidence" },
    fine: "Ingredient-level evidence does not guarantee the effect of a specific product. This service does not replace diagnosis or treatment; if symptoms persist, see a dermatologist. Buy links may contain ads (AD).",
    save: "Save routine", saveLogin: "Log in to save routine", saved: "Saved ✓", savedHint: "Saved to your account. You can view it in My account.", saveFailed: "Couldn't save. Please try again shortly.",
    why: (concern: string, band: string) => `Chosen for "${concern}" in the ${band} price range.`,
    concerns: { dryness: "dryness", acne: "breakouts", pigmentation: "dark spots", aging: "signs of aging" },
  },
  login: {
    label: "LOG IN", title: "Log in or sign up", sub: "We email you a confirmation link. Click it to log in instantly; if you're new, we create your account.",
    email: "Email", send: "Email me a link", or: "or", google: "Continue with Google", tryAnyway: "Try it without logging in",
    sent: "Check your email", sentBody: (e: string) => `Click the link we sent to ${e} to finish logging in. It's valid for 15 minutes.`,
    devLink: "Dev mode: no email was sent. Use this link to log in.", resend: "Use a different email", spam: "If you don't see it, check your spam folder.",
    errors: {
      not_configured: "This login method isn't configured on the server yet.", email_not_configured: "Email sending isn't configured yet.", denied: "Login was cancelled.",
      invalid_state: "Your login session expired. Please try again.", unverified_email: "A verified email is required.", signin_failed: "Something went wrong signing in. Please try again shortly.",
      bad_email: "Please enter a valid email address.", rate_limited: "Too many requests. Please try again in an hour.", send_failed: "We couldn't send the email. Please try again shortly.", consent: "You must agree to the terms and data collection.",
    },
  },
  verify: { title: "Confirm login", body: "Press the button below to finish logging in.", confirm: "Finish logging in", working: "Confirming…", invalid: "This link has expired or was already used. Please request a new email.", back: "Back to login" },
  account: {
    title: "My account", routines: "Saved routines", none: "No saved routines yet.", tryNow: "Build a routine", delete: "Delete", total: "Total",
    data: "My data", export: "Download my data", deleteAccount: "Delete account and all data", deleteConfirm: "Your account, saved routines and consent records will be permanently deleted. Continue?", deleted: "Your account was deleted.",
  },
  consent: {
    title: "We need your consent", intro: "Agree to the items below to continue. You can withdraw consent at any time.", agree: "Agree and continue", decline: "Don't agree", withdraw: "Withdraw", give: "Give consent", required: "Required", optional: "Optional", version: "Version", read: "Read in full",
    purposes: {
      terms: { label: "Terms of Service and personal data processing", body: "I have read and agree to the Terms of Service and Privacy Policy. We collect and use your email and name to let you log in." },
      sensitive: { label: "Collection and use of skin survey data (may include sensitive information)", body: "We collect your skin type, concerns and sensitivity, which may relate to health, only to provide your personalized routine. Without consent we can't personalize recommendations." },
      ai: { label: "Overseas transfer for AI-written explanations", body: "To write the reasons, your survey fields (never your name or email) may be sent to an AI provider (DeepSeek, servers in China). Without consent you'll see standard explanations instead." },
      marketing: { label: "Receive marketing emails (newsletter)", body: "I agree to receive marketing emails such as evidence reports. You can opt out at any time." },
    },
  },
  footer: { legalNote: "Legal documents are draft templates." },
  legal: { updated: "Last updated", draft: "This document is a draft template, not legal advice. Have a lawyer review it before launch.", contents: "Contents" },
};

export const messages: Record<Locale, Messages> = { ko, en };
