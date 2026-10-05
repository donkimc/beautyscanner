# BeautyScanner: project handoff

Status as of 2026-10-05. Branch `claude/compassionate-franklin-blpqqa` (repo `donkimc/beautyscanner`). This file records what exists, what was decided, what is blocked, and what to do next. Read `CLAUDE.md` (project rules), `README.md` and `SECURITY.md` too.

## What the product is

A Korean/English, evidence-based skincare recommendation MVP. A visitor answers 5 questions (skin type, concerns (multi-select), top priority, budget, texture preference), gets a rules-based product routine, then a personalised morning/evening routine. Registered users get a dashboard (editable saved profile) and a shopping list (not a checkout; no payment).

Stack: Next.js 16 (App Router), TypeScript, Tailwind v4, Postgres on Railway (`pg`; in-memory PGlite in dev and tests), own auth (HMAC session cookie, Google OAuth + PKCE, passwordless email login via Resend). Live URL: `https://web-production-318ac.up.railway.app`.

## Done

- Landing page (mobile first, animation, Login and Try buttons), survey with the 5 original questions, result cards with photos, routine view, cart, dashboard, product pages, legal pages (terms, privacy, security: drafts, need a lawyer), mock newsletter.
- ko/en by phone language (`i18n/`), consent popups (`consent/purposes.ts`), design tokens from the original pages (`design/tokens.json`).
- Rules in `lib/recommend.ts` choose products; the AI explainer (`agent/explainer.ts`, DeepSeek, optional) only rephrases.
- Catalog: 200 fictional "[샘플]" products (`lib/samples.ts`, generated from formulas; unrated, no buy links, AI-generated pictures in `public/products/demo/`) plus 5 real ones (`r1` to `r5`), merged with admin-added products and approved listings (`catalog/load.ts`).
- Admin page `/admin/catalog` (admin emails only, 404 for others): link a real product to a link, price and own photo.
  - **Manual entry (use this now):** "직접 입력" on a product row sets link, price, store and optional photo path (only files under `public/products/`). "새 실제 상품 추가" can start from a blank form.
  - Naver Shopping search and approval pipeline (`retailer/naver.ts`, `retailer/match.ts`, `catalog/refresh.ts`) exists and is tested against a mock, but is unusable for new apps (see Blocked).
- Latest changes this session: Naver credentials are trimmed before use; landing shows "내 대시보드" when signed in; `/login` redirects when already signed in; manual listings and blank product form.
- Checks: `npm run verify` (typecheck, 108 tests, 14 evals, build) passed at the last push.

## Blocked or learned (do not repeat these dead ends)

- **Email login failed on production** with Resend "Domain not verified" because `EMAIL_FROM` used a `gmail.com` address. Fix: `EMAIL_FROM=BeautyScanner <onboarding@resend.dev>` (delivers only to the Resend account owner's email) or verify a domain you own in Resend. Login worked afterwards.
- **Naver Shopping search is not available to new applications.** The old developers.naver.com console refuses to add 검색 ("신규로 등록할 수 없는 API"), and NAVER API HUB offers no shopping product search (only news, blog, local, 지식iN, cafe, encyclopedia, image, adult-term, typo, web document, plus Data Lab trend APIs). Keys from API HUB for those APIs cannot call `shop.json`.
- **Coupang Open API** needs a business number. **Coupang Partners** (affiliate): the individual track exists, but the user's account showed "현재 가입이 불가능한 계정입니다" (cause unknown; contact Partners support or try another verified account).
- **11st Open API** is used with a seller ID; conditions for a non-seller are unknown (ask 11st). Becoming a seller only for data access is not recommended.
- **No scraping.** `CLAUDE.md` forbids it; terms, copyright and blocking make it a poor idea. Decision: stay with manual entry for the MVP.
- The cloud sandbox cannot reach Railway, Naver, Atlas Cloud, or retail sites, and has no browser tools. A local Claude Code session may.

## Next steps

1. Open `/admin/catalog` and enter real data for the 5 real products (link, price, own photo) and add real moisturizer and sunscreen products; then set `HIDE_SAMPLES=true` in Railway.
2. Optional: bulk import from a spreadsheet (one row per product).
3. Done (2026-10-05): 200 fictional demo products with AI pictures. Pictures: `openai/gpt-image-1-mini` at low quality via Atlas Cloud (`npm run gen:images`, about $0.80 in total). Flux Schnell errors on Atlas Cloud (server-side bug), so it is not used. Labels on the packaging show a made-up brand; some letters are garbled by the cheap model. Old ids (`c1`, `t1`, ...) are gone, so saved carts or routines that used them no longer match. Delete the Atlas key from `.env.local` when done.
4. Affiliate links: once the user has a Coupang Partners (or other) link, add an "affiliate link" checkbox to the manual form so the AD label and disclosure appear (AD only on real affiliate links).
5. Make the admin banner actually test the Naver key if the Naver client is ever revived (today it only shows that variables are set).
6. Before launch: lawyer review of legal pages and a real contact address (currently `privacy@example.com`), evidence review with real citations for any graded product, verify a sending domain in Resend, optional Google OAuth credentials, link pre-signup consents to the account.

## Running locally

```
git clone -b claude/compassionate-franklin-blpqqa https://github.com/donkimc/beautyscanner.git ~/project/beautyscanner
cd ~/project/beautyscanner && npm install
cp .env.example .env.local   # fill only what you need; never commit secrets
npm run dev                  # http://localhost:3000
npm run verify               # run before pushing
```

Without `DATABASE_URL`, `AUTH_SECRET` and email keys the app uses an in-memory database and a dev-only login link (never shown in production).

## Railway variables (set by the owner, never in the repo)

`DATABASE_URL`, `AUTH_SECRET`, `RESEND_API_KEY`, `EMAIL_FROM`, `ADMIN_EMAILS` (must equal the admin's login email), optional `GOOGLE_CLIENT_ID/SECRET`, `DEEPSEEK_API_KEY`, `HIDE_SAMPLES`, `CRON_SECRET`. `NAVER_CLIENT_ID/SECRET` are unused for now.
