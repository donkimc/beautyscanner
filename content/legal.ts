import type { Locale } from "../i18n/locale";

// Draft legal text matched to what the app actually does. NOT legal advice: have counsel review before launch.
// Replace CONTACT_EMAIL (and the operator name) before going live.

export const CONTACT_EMAIL = "privacy@example.com";
export const LEGAL_UPDATED = "2026-10-03";

export interface Section { h: string; p?: string[]; ul?: string[] }
export interface Doc { title: string; intro?: string; sections: Section[] }
export type DocId = "terms" | "privacy" | "security";

const terms: Record<Locale, Doc> = {
  ko: {
    title: "이용약관",
    intro: "뷰티스캐너(이하 '서비스')를 이용해 주셔서 감사합니다. 서비스를 이용하면 이 약관에 동의한 것으로 봅니다.",
    sections: [
      { h: "1. 서비스 내용", p: ["서비스는 설문 답변을 바탕으로 스킨케어 루틴을 추천하고, 제품별 근거 등급과 구매 링크를 제공합니다.", "현재 서비스는 데모 버전이며, 표시되는 제품과 근거는 샘플 데이터일 수 있습니다."] },
      { h: "2. 의료 조언이 아님", p: ["서비스의 모든 정보는 일반적인 참고용이며 진단, 치료, 처방을 대체하지 않습니다. 증상이 지속되거나 악화되면 피부과 전문의와 상담하세요.", "'근거 등급'은 공개된 연구의 수준을 단순화한 표시이며, 특정 제품의 효과를 보장하지 않습니다. 성분 수준의 근거는 제품 자체의 효과를 의미하지 않습니다."] },
      { h: "3. 계정", ul: ["이메일 확인 링크 또는 Google 계정으로 가입·로그인할 수 있습니다.", "만 14세 이상만 가입할 수 있습니다.", "계정 보안은 이용자 본인이 관리해야 하며, 타인에게 확인 링크를 공유하지 마세요."] },
      { h: "4. 광고 및 제휴 링크", p: ["구매 링크에는 제휴(광고) 링크가 포함될 수 있으며 'AD'로 표시합니다. 제휴 수익은 근거 등급에 영향을 주지 않습니다."] },
      { h: "5. 이용자의 의무", ul: ["서비스를 부정하게 이용하거나 시스템을 방해하지 않습니다.", "자동화된 수단으로 대량 접속하거나 데이터를 수집하지 않습니다.", "타인의 정보를 도용하지 않습니다."] },
      { h: "6. 지식재산권", p: ["서비스의 디자인, 문구, 소프트웨어에 대한 권리는 운영자에게 있습니다. 제3자 상표와 제품 정보는 각 권리자에게 속합니다."] },
      { h: "7. 책임의 제한", p: ["서비스는 '있는 그대로' 제공되며, 법이 허용하는 범위에서 운영자는 추천 제품의 사용 결과, 제3자 사이트의 내용, 서비스 중단으로 인한 손해에 대해 책임을 지지 않습니다. 다만 고의 또는 중대한 과실이 있는 경우는 제외합니다."] },
      { h: "8. 계정 삭제와 해지", p: ["'내 계정'에서 언제든 계정과 모든 데이터를 삭제할 수 있습니다. 운영자는 약관을 위반한 계정을 제한하거나 해지할 수 있습니다."] },
      { h: "9. 약관의 변경", p: ["약관을 변경하는 경우 시행 7일 전에 서비스에 공지합니다. 이용자에게 불리한 변경은 다시 동의를 받습니다."] },
      { h: "10. 준거법과 분쟁", p: ["이 약관은 대한민국 법률에 따르며, 분쟁은 관할 법원에서 해결합니다."] },
    ],
  },
  en: {
    title: "Terms of Service",
    intro: "Thank you for using BeautyScanner (the “Service”). By using the Service you agree to these terms.",
    sections: [
      { h: "1. What the Service does", p: ["The Service recommends skincare routines from your survey answers and shows an evidence grade and buy links for each product.", "The Service is currently a demo; displayed products and evidence may be sample data."] },
      { h: "2. Not medical advice", p: ["Everything in the Service is general information and does not replace diagnosis, treatment or prescription. If symptoms persist or worsen, see a dermatologist.", "An “evidence grade” is a simplified label of the level of published research. It does not guarantee any product's effect, and ingredient-level evidence does not mean the product itself works."] },
      { h: "3. Accounts", ul: ["You can sign up or log in with an emailed confirmation link or a Google account.", "You must be at least 14 years old.", "You are responsible for your account security; do not share your confirmation link."] },
      { h: "4. Ads and affiliate links", p: ["Buy links may be affiliate (advertising) links and are labelled “AD”. Affiliate revenue never influences evidence grades."] },
      { h: "5. Your responsibilities", ul: ["Do not misuse the Service or interfere with its systems.", "Do not scrape or access it in bulk by automated means.", "Do not use another person's information."] },
      { h: "6. Intellectual property", p: ["The Service's design, text and software belong to the operator. Third-party trademarks and product information belong to their owners."] },
      { h: "7. Limitation of liability", p: ["The Service is provided “as is”. To the extent permitted by law, the operator is not liable for results of using recommended products, content of third-party sites, or losses from service interruptions, except in cases of intent or gross negligence."] },
      { h: "8. Deleting your account and termination", p: ["You can delete your account and all data at any time under “My account”. The operator may restrict or terminate accounts that violate these terms."] },
      { h: "9. Changes", p: ["We will announce changes in the Service 7 days before they take effect, and ask for your consent again for changes that are unfavorable to you."] },
      { h: "10. Governing law", p: ["These terms are governed by the laws of the Republic of Korea; disputes are resolved by the competent court."] },
    ],
  },
};

const privacy: Record<Locale, Doc> = {
  ko: {
    title: "개인정보처리방침",
    intro: "서비스는 개인정보 보호법에 따라 이용자의 개인정보를 보호합니다. 필요한 때마다 동의를 따로 받고, 동의 기록을 보관합니다.",
    sections: [
      { h: "1. 수집하는 항목", ul: [
        "계정: 이메일, 이름(Google 로그인 시 Google이 제공하는 이름), 언어 설정",
        "피부 설문 정보(민감정보에 해당할 수 있음): 피부 타입, 고민, 민감성, 예산, 단계 수, 자유 메모",
        "저장한 루틴: 설문 답변, 추천 제품 목록, 합계 금액",
        "저장한 피부 정보(마지막 설문 답변)와 이름: 대시보드에서 수정할 수 있습니다",
        "장바구니: 담은 제품, 수량, 어느 루틴에서 담았는지",
        "동의 기록: 동의 항목, 버전, 동의 여부, 일시",
        "로그인 확인용 임시 토큰(암호화 해시만 저장, 15분 후 만료)",
      ] },
      { h: "2. 수집·이용 목적", ul: ["회원 가입, 로그인, 본인 확인", "맞춤 스킨케어 루틴 제공 및 저장", "추천 이유 설명 생성(선택, AI)", "뉴스레터 발송(선택, 별도 동의 시)", "서비스 보안 및 부정 이용 방지"] },
      { h: "3. 보유 및 이용 기간", ul: ["계정, 저장한 루틴, 피부 정보, 장바구니: 계정 삭제 시까지(삭제하면 함께 삭제됩니다)", "로그인 확인 토큰: 만료 또는 사용 후 즉시 무효", "동의 기록: 계정 삭제 시 함께 삭제. 비회원 동의 기록은 식별 정보 없이 보관", "법령에 따라 보관해야 하는 정보는 해당 기간 동안 보관"] },
      { h: "4. 제3자 제공 및 처리 위탁(국외 이전 포함)", ul: [
        "Railway(호스팅·데이터베이스): 서비스 운영과 데이터 저장 (서버 위치: 싱가포르 리전)",
        "Resend(이메일 발송): 로그인 확인 메일 발송을 위해 이메일 주소 전달",
        "Google(로그인): 이용자가 Google로 로그인을 선택한 경우",
        "네이버(상품 사진·가격): 상품 사진은 네이버 이미지 서버에서 불러오며, 이때 이용자의 IP 주소 등 접속 정보가 네이버에 전달될 수 있습니다. 설문 답변은 네이버에 전달되지 않습니다.",
        "DeepSeek(AI 설명 생성, 서버: 중국, 선택): 이름과 이메일을 제외한 설문 항목이 전송됩니다. 'AI 설명을 위한 국외 이전' 동의를 한 경우에만 전송하며, 동의하지 않아도 서비스를 이용할 수 있습니다.",
        "법령에 근거한 요청이 있는 경우를 제외하고, 이용자 동의 없이 개인정보를 제3자에게 판매하거나 제공하지 않습니다.",
      ] },
      { h: "5. 이용자의 권리", p: ["이용자는 언제든지 개인정보의 열람, 정정, 삭제, 처리 정지와 동의 철회를 요구할 수 있습니다.", "'내 계정'에서 데이터 내려받기와 계정 삭제를 직접 할 수 있고, 아래 연락처로도 요청할 수 있습니다."] },
      { h: "6. 쿠키와 브라우저 저장소", ul: ["bs_session: 로그인 유지(필수, HttpOnly, 7일)", "bs_lang: 언어 선택(필수 기능)", "브라우저 저장소: 동의 상태, 설문 답변(결과 복원용), 익명 식별자(동의 기록용)", "광고·추적용 쿠키는 사용하지 않습니다."] },
      { h: "7. 만 14세 미만", p: ["서비스는 만 14세 이상을 대상으로 하며, 만 14세 미만 아동의 개인정보는 수집하지 않습니다."] },
      { h: "8. 안전성 확보 조치", p: ["전송 구간 암호화(HTTPS), 세션 쿠키 보호(HttpOnly, SameSite), 단일 사용 로그인 토큰, 접근 최소화, 동의 기록 관리 등을 시행합니다. 자세한 내용은 '보안' 페이지를 참고하세요."] },
      { h: "9. 개인정보 보호 문의", p: [`개인정보 보호 책임자 연락처: ${CONTACT_EMAIL} (출시 전에 실제 연락처로 교체하세요)`] },
      { h: "10. 방침의 변경", p: ["방침이 바뀌면 시행 전에 서비스에 공지하고, 중요한 변경은 다시 동의를 받습니다."] },
    ],
  },
  en: {
    title: "Privacy Policy",
    intro: "We protect your personal data in line with Korea's Personal Information Protection Act. We ask for consent separately whenever needed and keep a record of it.",
    sections: [
      { h: "1. Data we collect", ul: [
        "Account: email, name (from Google if you use Google login), language setting",
        "Skin survey data (may be sensitive): skin type, concern, sensitivity, budget, number of steps, free-text note",
        "Saved routines: survey answers, recommended product list, total price",
        "Saved skin profile (your latest survey answers) and name: editable on your dashboard",
        "Shopping cart: products, quantities, and which routine they were added from",
        "Consent records: purpose, version, whether granted, timestamp",
        "Temporary login tokens (only a hash is stored; expires after 15 minutes)",
      ] },
      { h: "2. Why we use it", ul: ["Sign-up, login and identity confirmation", "Providing and saving your personalized routine", "Writing explanations for recommendations (optional, AI)", "Sending the newsletter (optional, with separate consent)", "Service security and abuse prevention"] },
      { h: "3. Retention", ul: ["Account, saved routines, skin profile and cart: until you delete your account (they are deleted with it)", "Login tokens: invalid once used or expired", "Consent records: deleted with your account; guest consent records are kept without identifying information", "Information we must keep by law is kept for the legally required period"] },
      { h: "4. Sharing and processors (including overseas transfer)", ul: [
        "Railway (hosting and database): to run the service and store data (server region: Singapore)",
        "Resend (email delivery): your email address is passed on to send login emails",
        "Google (login): only if you choose to log in with Google",
        "Naver (product photos and prices): product photos load from Naver's image servers, so your IP address and similar connection details may reach Naver. Your survey answers are never sent to Naver.",
        "DeepSeek (AI explanations, servers in China, optional): survey fields without your name and email are sent. We send them only if you consent to “overseas transfer for AI explanations”; you can use the service without it.",
        "We do not sell your personal data or provide it to third parties without consent, except where the law requires.",
      ] },
      { h: "5. Your rights", p: ["You can ask at any time to access, correct, delete or restrict processing of your data, and to withdraw consent.", "Under “My account” you can download your data and delete your account yourself; you can also contact us below."] },
      { h: "6. Cookies and browser storage", ul: ["bs_session: keeps you logged in (essential, HttpOnly, 7 days)", "bs_lang: your language choice (essential feature)", "Browser storage: consent status, survey answers (to restore your result), an anonymous ID (for consent records)", "We do not use advertising or tracking cookies."] },
      { h: "7. Children under 14", p: ["The service is for people aged 14 and over, and we do not collect personal data from children under 14."] },
      { h: "8. Security measures", p: ["We use encryption in transit (HTTPS), protected session cookies (HttpOnly, SameSite), single-use login tokens, access minimization and consent record keeping. See the Security page for details."] },
      { h: "9. Privacy contact", p: [`Privacy contact: ${CONTACT_EMAIL} (replace with a real address before launch)`] },
      { h: "10. Changes", p: ["We will announce changes in the service before they take effect and ask for consent again for material changes."] },
    ],
  },
};

const security: Record<Locale, Doc> = {
  ko: {
    title: "보안",
    intro: "서비스가 이용자 데이터를 어떻게 보호하는지, 그리고 아직 하지 못한 것을 솔직하게 정리했습니다.",
    sections: [
      { h: "우리가 하는 것", ul: [
        "모든 접속은 HTTPS로 암호화됩니다.",
        "비밀번호를 만들지도 저장하지도 않습니다. 로그인은 이메일 확인 링크 또는 Google로만 가능합니다.",
        "이메일 로그인 링크는 한 번만 쓸 수 있고 15분 후 만료되며, 데이터베이스에는 해시만 저장합니다. 링크를 열기만 해서는 로그인되지 않고, 버튼을 눌러야 완료됩니다(메일 보안 스캐너 대응).",
        "Google 로그인은 state 검증과 PKCE를 사용하는 인가 코드 방식입니다.",
        "로그인 세션은 서명된 HttpOnly, SameSite=Lax 쿠키로 유지되고 7일 후 만료됩니다.",
        "로그인 메일 요청은 이메일당 시간당 횟수를 제한합니다.",
        "비밀 키(API 키, 서명 키)는 서버 환경변수에만 있으며 브라우저로 전송되지 않습니다.",
        "로그인 후 이동 경로는 같은 사이트의 상대 경로만 허용합니다(오픈 리다이렉트 방지).",
        "동의 항목별 기록을 남기고, 계정 삭제 시 저장한 루틴과 동의 기록도 함께 삭제합니다.",
        "AI에는 이름과 이메일을 제외한 설문 항목만 보내며, AI 응답은 안전 규칙(의료 표현·임의 수치 차단)을 통과해야 표시됩니다.",
        "코드 변경마다 자동 테스트(인증, 보안 규칙 포함)를 실행합니다.",
      ] },
      { h: "아직 하지 못한 것", ul: ["외부 기관의 보안 감사나 침투 테스트를 받지 않았습니다.", "2단계 인증(2FA)은 아직 지원하지 않습니다.", "저장 데이터의 애플리케이션 수준 암호화는 하지 않으며, 호스팅 제공사의 저장 시 암호화에 의존합니다."] },
      { h: "취약점 신고", p: [`보안 취약점을 발견하면 ${CONTACT_EMAIL} 로 알려 주세요(출시 전에 실제 연락처로 교체). 재현 방법을 포함해 주시면 빠르게 확인하겠습니다.`, "선의의 보안 연구를 존중하며, 이용자 데이터에 접근하거나 서비스를 방해하지 않는 한 법적 조치를 하지 않습니다."] },
      { h: "침해 사고 대응", p: ["개인정보 침해를 인지하면 즉시 원인을 차단하고, 법령이 정한 기한과 방법에 따라 영향받은 이용자와 관계 기관에 지체 없이 알립니다."] },
    ],
  },
  en: {
    title: "Security",
    intro: "How the Service protects your data, and what we haven't done yet, stated plainly.",
    sections: [
      { h: "What we do", ul: [
        "All traffic is encrypted with HTTPS.",
        "We never create or store passwords. You log in only with an emailed confirmation link or Google.",
        "Email login links work once, expire after 15 minutes, and only a hash is stored in the database. Opening the link alone does not log you in; you must press a button (this defeats email security scanners that pre-open links).",
        "Google login uses the authorization-code flow with state validation and PKCE.",
        "Sessions use a signed HttpOnly, SameSite=Lax cookie that expires after 7 days.",
        "Login email requests are rate-limited per address per hour.",
        "Secrets (API keys, signing key) live only in server environment variables and are never sent to the browser.",
        "Post-login redirects accept only same-site relative paths (no open redirects).",
        "We keep per-purpose consent records, and deleting your account also deletes your saved routines and consent records.",
        "The AI receives only survey fields (never your name or email), and its output is shown only if it passes safety rules (no medical claims, no invented figures).",
        "Automated tests (including authentication and security rules) run on every code change.",
      ] },
      { h: "What we haven't done yet", ul: ["We have not had an external security audit or penetration test.", "Two-factor authentication (2FA) is not supported yet.", "We do not apply application-level encryption to stored data; we rely on the hosting provider's encryption at rest."] },
      { h: "Reporting a vulnerability", p: [`If you find a security issue, email ${CONTACT_EMAIL} (replace with a real address before launch). Include steps to reproduce and we will look into it quickly.`, "We respect good-faith security research and will not take legal action as long as you don't access user data or disrupt the service."] },
      { h: "Incident response", p: ["If we become aware of a personal data breach, we will contain it immediately and notify affected users and authorities without delay, within the deadlines and in the manner required by law."] },
    ],
  },
};

export const DOCS: Record<DocId, Record<Locale, Doc>> = { terms, privacy, security };
