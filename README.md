# beautyscanner

An MVP demo of an evidence-based skincare recommender, in **Korean and English**. A mobile-first landing page leads to a short survey that produces a budget-aware routine. Each product shows an evidence grade, a reason, and an AD-labelled buy link. Users can sign up with an emailed confirmation link (or Google) to save routines.

> **Demo status:** the 200 sample products in `lib/samples.ts` are fictional (invented brands, names start with "[Sample]" / "[샘플]", no evidence grade) and their pictures are AI-generated, **buy links are placeholders (no retailer or Coupang integration exists yet) and real product photos exist for three of the five real products, the rest use illustrations**, the newsletter is a mock, and the legal pages are draft templates that need a lawyer's review.

Live demo (Railway): https://web-production-318ac.up.railway.app

## Pages

| Route | What it is |
|---|---|
| `/` | Mobile-first landing page: catch phrase, animated hero, **Try it free** and **Log in** buttons, feature cards, mock newsletter |
| `/try` | The 5-question survey (same questions as the original page) and the result page. No account needed. |
| `/login` | Sign up / log in: email confirmation link, plus Google if configured |
| `/auth/verify` | Confirmation page the emailed link opens; a button press completes login |
| `/account` | **Dashboard** for registered users: shopping cart, editable saved info (name and skin profile), saved routines, consent management, data download, account deletion |
| `/admin/catalog` | **Admin** (only the emails in `ADMIN_EMAILS`; 404 for everyone else): find a product on Naver Shopping, approve its listing, add real products, refresh prices |
| `/products/[id]` | A product's own page: picture, price, evidence, attributes, add to cart, retailer link |
| `/terms`, `/privacy`, `/security` | Legal and security pages (draft) in both languages |
| `/api/*` | `auth/*`, `consent`, `routines`, `cart`, `profile`, `account`, `explain`, `config`, `catalog`, `admin/*`, `cron/*` |

## Features

### Languages
Korean and English. The language follows the phone/browser `Accept-Language` setting (Korean or English; any other language falls back to English; no header means Korean). A **한 / EN** switch overrides it and is remembered in a cookie. All UI text lives in `i18n/messages.ts`; product text has both languages in `lib/products.ts`; legal text is in `content/legal.ts`. A test fails if the two languages drift apart.

### Sign-up and login
Passwordless. Enter an email, accept the terms in the popup, and we email a link. Opening it shows a **Finish logging in** button (so email scanners that pre-open links can't use it up); pressing it logs you in, creating the account the first time. Links are single use and expire after 15 minutes. Google login is optional and appears only when configured. Sessions are signed HttpOnly cookies (7 days). See `SECURITY.md`.

### Consent popups
A bottom-sheet popup appears **whenever consent is needed**, listing only what is missing, with unchecked boxes:

| Purpose | Asked when | Required |
|---|---|---|
| `terms` | Before sending a login link or using Google | Yes |
| `sensitive` | Before the first survey answer is recorded | Yes |
| `ai` | Before AI explanations, only if AI is enabled on the server | No (declining uses template text) |
| `marketing` | When subscribing to the newsletter | No |

Each decision is stored in the browser and logged server-side (`consents` table) with a version. Bump the version in `consent/purposes.ts` when the wording changes and users are asked again. Users can withdraw consent in `/account`.

### The survey (same five questions as the original page)
| # | Question | Type | Options |
|---|---|---|---|
| 1 | 피부 타입은 무엇인가요? / What's your skin type? | single | 건성, 지성, 복합성, 민감성, 잘 모르겠음 |
| 2 | 가장 신경 쓰이는 피부 고민은? / Which concerns bother you most? | **multiple** (Next button) | 여드름·트러블, 모공, 색소침착, 주름·탄력, 홍조, 건조함 |
| 3 | 가장 먼저 개선하고 싶은 것은? / What to improve first? | single (**top priority**) | 피부 톤 개선, 수분 채우기, 트러블 진정, 탄력 케어, 모공 관리 |
| 4 | 선호하는 예산대는? / Preferred price range? | single | 3만원 이하, 3~7만원, 7~15만원, 15만원 이상 |
| 5 | 선호하는 제형이 있나요? / Texture preference? | single (**texture preference**) | 가벼운 제형, 리치한 제형, 무향 제품, 저자극 제품, 비건·클린뷰티 |

Wording, subtitles, options and icons follow the original page (tests lock the Korean text). An optional free-text note follows question 5.

How the answers drive the routine (`lib/recommend.ts`):
- **Concerns (multiple):** each ticked concern adds to a product's score if the product covers it.
- **Top priority:** the products that address it (tone → pigmentation, hydration → dryness, soothing → acne/redness, firmness → aging, pores → pores) get the largest bonus.
- **Price range:** the band's upper limit caps the routine total (30000 / 70000 / 150000 / 1000000 = no limit); the result shows the band picked. Up to 3만원 gives the short 3-step routine, anything above the full 5 steps.
- **Texture:** lightweight / rich favors products with that feel; fragrance-free and vegan restrict choices whenever such products exist for the step; low-irritation excludes products that may irritate.
- **Sensitivity is derived**, not asked: sensitive skin, a redness concern, or a low-irritation preference all exclude irritating products.
- Answers are validated on the server (`parseAnswers`); answers saved in an older format are ignored.

### From recommendation to a morning / evening routine
After the recommendation, **"아침·저녁 루틴 만들기"** turns the recommended products into a personalized routine for the morning or the evening (tabs, same look as the original evening-routine page): numbered steps in application order, a picture per step, a short how-to tip, and a total. It follows simple rules in `lib/routine.ts`:
- Every product has a time of day: sunscreen is morning-only; strong exfoliants and retinoids (e.g. the BHA toner and the retinal serum) are evening-only; the rest suit both.
- A product that suits the other time of day is left out, with the reason shown ("evening-only, so it's left out of the morning routine").
- An amber note appears when the routine has no moisturizer, or a morning routine has no sunscreen.
The routine's products can be added to the shopping cart in one tap (recorded as coming from the morning or evening routine), as can any single product or the whole recommendation.

### Shopping cart and dashboard (registered users)
- **Cart:** `cart_items` table; add from a recommendation card, the routine view or a product page; change quantity (1–9), remove, empty. The header shows a cart icon with the item count. A guest who taps "add to cart" is sent to log in and the products are added right after (the choice is remembered in the browser until then). The cart is a shopping list, not a checkout: nobody pays here; each item links to its **product page** and to the retailer's page (**the retailer links don't exist yet**, so the button says "buy link coming soon").
- **Dashboard (`/account`):** the cart; **My skin profile** (the last saved survey answers, editable in place, with "get recommendations from this"); **My info** (editable name; the header updates immediately); saved routines (linked to product pages); consent management; data download and deletion. Saving a routine also saves the skin profile.

### Real products and product pictures
The catalog has **5 real products** taken from the original evening-routine page (ids `r1`–`r5`: Beplain mung bean cleansing foam, S.Nature Aqua Oasis toner, Torriden DIVE-IN hyaluronic serum, Anua PDRN serum, TonyMoly ceramide mochi toner) plus **sample products** (`[샘플]`, fictional) that fill the gaps (moisturizer, sunscreen, more choices). Real products are preferred by the recommender when they fit.

Pictures go through `ProductImage` (`app/_components/ProductImage.tsx`): the product's own photo (`image` in `lib/products.ts`, a file under `public/products/`) when it has one, otherwise a clean illustration of that kind of product.

The 200 fictional sample products (`lib/samples.ts`: 30 cleansers, 35 toners, 55 serums, 45 creams, 35 sunscreens) use AI-generated pictures in `public/products/demo/` (generic packaging with a made-up brand label; the product page says the picture is AI-generated). They were made once with `npm run gen:images`; the script skips pictures that already exist and needs `ATLAS_API_KEY` in a git-ignored `.env.local`. Never use these pictures for real products.
- Photos for **Beplain, S.Nature and TonyMoly** come from the original page's product photos (clean product shots).
- **Torriden and Anua use the illustration for now**: the original page's images are retailer promo shots (Torriden's is an ad banner with a "No. 1 serum" claim; Anua's shows a celebrity model), which don't belong on an evidence-first site. Add a clean packshot as `public/products/<name>.jpg` and set `image` to switch.
- Product photos belong to their brands/sellers: confirm you may use them commercially, or take images from the retailer's official API (Coupang Partners, Naver Shopping) once connected.

Real products also show a **price note** (a "~" / "약" before estimated prices; only Torriden's price is quoted from the original page; the rest are estimates to verify), **retailer search links** (Coupang, Naver Shopping: plain search links, not affiliate links, so no AD label), and an evidence grade: S.Nature and Torriden carry the original page's "multiple studies" (ingredient-level, citations still to be added); the others are **"evidence under review"** (`unrated`) until reviewed.

### Real product data from Naver Shopping
Photos, prices and links for real products come from the **Naver Shopping search API** (the official API, no scraping), reviewed by a person:
1. **Search** (`/admin/catalog`, admins only): the admin searches Naver for a product; `retailer/match.ts` ranks the results (name-token match, brand, penalizes bundles/refills/minis and non-cosmetics) and marks the best as "suggested", but never links anything on its own.
2. **Approve:** picking a result stores it in `product_listings` (`approved`). From then on the product shows Naver's **photo** (hotlinked from Naver's image CDN; only `pstatic.net` / `naver.net` hosts are accepted), its **quoted lowest price** (no more "~") with the date, and a **"네이버쇼핑에서 보기"** link. It is a plain retailer link, so it carries **no AD label**; affiliate links (`urlKind: "affiliate"`) do.
3. **Add real products:** from a chosen Naver result the admin fills in the details the recommender needs (step, concerns, texture, time of day, fragrance-free / vegan / low-irritation, evidence grade and note). They are saved in `catalog_products` and join the catalog immediately. Built-in products can be linked but not deleted from the page.
4. **Keep prices current:** "refresh" re-reads each approved listing (Naver has no lookup by id, so it searches by the listing's title and matches the same product id). Run it daily with a scheduler, e.g. a Railway cron job: `curl -X POST -H "Authorization: Bearer $CRON_SECRET" https://<site>/api/cron/refresh-listings`.
5. **Retire the samples:** once real products cover every step, set `HIDE_SAMPLES=1`.

The catalog the site uses = built-in products + admin-added products + approved listings (`lib/catalog.ts`, loaded server-side by `catalog/load.ts`, served to the browser at `/api/catalog`; the recommender runs on it). Naver gives shop data only: **evidence grades, ingredient lists and studies still come from your own research** (use `unrated` until reviewed).

To try the admin page without keys: `npm run mock:naver` (a local stand-in for the API) and start the app with `NAVER_API_BASE=http://localhost:4010 NAVER_IMAGE_HOSTS=localhost NAVER_CLIENT_ID=x NAVER_CLIENT_SECRET=y ADMIN_EMAILS=you@example.com`.

### Routine rules and explanations
Rules in `lib/recommend.ts` choose one product per step, swap in cheaper options to fit the price range, and warn about gaps (no cream, no sunscreen) or an unmet budget. The explainer agent (`agent/explainer.ts`) rewrites each product's curated evidence note into a short reason in the user's language. It never chooses products or grades, and its output must pass guardrails or a template is used.

### Newsletter (mock)
Validates the email and asks for marketing consent, then shows a confirmation. It **stores and sends nothing**.

### Evidence grades
| Color | Meaning |
|---|---|
| Green | Clinically validated (RCT / meta-analysis) |
| Blue | Supported by multiple studies |
| Gray | Brand's own test (not independent research) |
| Amber | Emerging evidence / small studies |

Ingredient-level evidence is labelled as such. It does not guarantee a specific product's effect.

## Getting started

Requires Node 22+.

```bash
npm install
npm run dev        # http://localhost:3000
```

With no `DATABASE_URL`, development and tests use an in-memory PGlite database (data resets on restart). With no email provider, the login link is shown on screen instead of being emailed, so you can try the whole flow locally with no setup.

### Environment variables

Copy `.env.example` to `.env.local`. Secrets are read on the server only; never commit them.

| Variable | Needed for | Purpose |
|---|---|---|
| `DATABASE_URL` | Production | Postgres connection string (Railway: `${{Postgres.DATABASE_URL}}`) |
| `AUTH_SECRET` | Production | Signs session cookies (`openssl rand -base64 32`). Production refuses login without it. |
| `RESEND_API_KEY`, `EMAIL_FROM` | Email login in production | [Resend](https://resend.com) API key and a sender on a domain you verified there |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Google login (optional) | OAuth client; redirect URI `<origin>/api/auth/google/callback` |
| `DEEPSEEK_API_KEY`, `DEEPSEEK_MODEL` | AI explanations (optional) | Without a key, template text is used |
| `NAVER_CLIENT_ID`, `NAVER_CLIENT_SECRET` | Real product data | Naver Developers app with the Search API |
| `ADMIN_EMAILS` | Admin page | Comma-separated login emails allowed into `/admin/catalog` |
| `CRON_SECRET` | Daily price refresh | Bearer secret for `/api/cron/refresh-listings` |
| `HIDE_SAMPLES` | Optional | `1` hides the fictional sample products |
| `AUTH_URL` | Optional | Public site URL; derived from the request when unset |

In production, email login returns an error until `RESEND_API_KEY` and `EMAIL_FROM` are set. There is deliberately no "show the link on screen" fallback in production, because that would let anyone log in as any email address. (Resend's `onboarding@resend.dev` test sender can only mail the account owner, which is enough for trying it yourself.)

## Design

The visual system is taken from the two original design pages (the survey-interaction page and the evening-routine page), so this site looks like them:

- **Colors** (OKLCH, in `design/tokens.json`): warm paper background `oklch(0.97 0.008 90)`, white surfaces, plum-tinted ink `oklch(0.22 0.03 320)`, **pink-magenta accent** `oklch(0.5 0.14 350)` with a soft pink `oklch(0.94 0.03 350)` for selected states, and an amber `warn` for notes. There is a matching **dark mode** (follows the phone/system setting). Evidence grades: green (clinical), pink-magenta (multiple studies), gray (brand's own test), amber (emerging).
- **Fonts** (all SIL Open Font License, free for commercial use, self-hosted through npm): **Newsreader** for headlines, **Karla** for body text, **IBM Plex Mono** for small uppercase labels. These have no Korean glyphs, so Korean text falls back to **Pretendard** (body, labels) and **Noto Serif KR** (headlines).
- **Shapes:** 1.5px bordered option cards that turn pink on hover/tap, a dark "next" button, a dashed amber note for warnings, large 36px rounded cards with a soft shadow and 1px ring.
- `npm run tokens` generates `app/tokens.css` (light and dark CSS variables plus a Tailwind v4 `@theme inline` block), so utilities such as `bg-bg`, `text-ink-soft`, `border-border`, `bg-accent-soft`, `text-grade-clinical`, `rounded-card` follow the theme.
- Animations (float, bob, scan, pop, rise, shimmer) are in `app/globals.css` and respect `prefers-reduced-motion`.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` / `npm start` | Production build and server |
| `npm run typecheck` | TypeScript check |
| `npm test` | Unit tests (`tests/`) |
| `npm run eval` | Scenario evals (`evals/cases.json`); exits non-zero on failure |
| `npm run tokens` | Regenerate `app/tokens.css` from `design/tokens.json` |
| `npm run gen:images` | One-off: make the missing sample-product pictures with Atlas Cloud (`--dry-run`, `--ids`, `--limit`; needs `ATLAS_API_KEY` in `.env.local`) |
| `npm run verify` | Typecheck, tests, evals, and build (what CI runs) |

## Project structure

```
app/            Next.js UI, pages (incl. dashboard and product pages), API routes, shared components
auth/           Signed-cookie sessions and Google OAuth (server-side)
db/             Postgres access (Railway) or in-memory PGlite; schema, users, tokens, consents, routines
email/          Login email templates and the Resend sender
i18n/           Korean/English messages and language detection
consent/        Consent purposes and versions
content/        Terms, privacy and security text (both languages)
lib/            Product data, the rules-based recommender, the morning/evening routine rules, catalog merge and price formatting
catalog/        Server-side catalog loader (built-in + admin products + approved listings) and the price refresh
retailer/       Naver Shopping API client and the listing matcher
agent/          Explainer: prompt, guardrails, output validation
design/         Design tokens -> app/tokens.css
evals/          Scenario evals for the recommender and guardrails
tests/          Unit tests, including architecture-boundary checks
architecture/   Layer rules (rules.json) and a diagram (diagram.mmd)
plan/           Decisions, milestones, risks (plan.json)
scripts/        Token generation, sample-picture generation (gen-images.ts)
```

Import directions between folders are defined in `architecture/rules.json` and enforced by `tests/architecture.test.ts`.

## Database

Tables are created automatically on first use (`db/schema.ts`): `users`, `login_tokens` (hashed, single use), `consents` (audit log), `routines`, `profiles` (latest survey answers), `cart_items`. Deleting a user cascades to everything they own.

## Deployment

Deployed on Railway from this repository's `claude/compassionate-franklin-blpqqa` branch: a `web` service and a `Postgres` service in one project. `railway.json` sets the build (Railpack), start command, and a health check on `/`. CI (`.github/workflows/ci.yml`) runs `npm run verify` on every push.

## Roadmap

See `plan/plan.json`. Next steps:

- Set `RESEND_API_KEY` and `EMAIL_FROM` on Railway (needs a verified sender domain), then test real email login.
- Optionally add Google OAuth credentials.
- Replace sample products with cited evidence (PubMed, MFDS public data, brand test pages).
- Have a lawyer review the legal pages and add a real contact address (`content/legal.ts`).
- Retailer adapter (Coupang Partners / Naver Shopping API).

## Privacy and compliance notes

- Survey answers can be health-related sensitive information under Korea's PIPA. The app collects separate, explicit consent before recording them.
- Sending survey fields to DeepSeek is an overseas transfer; it happens only with the `ai` consent and never includes name or email.
- Consents given before signup are logged under an anonymous ID and are not linked to the account afterwards (the `terms` consent given at login is linked).
- A real newsletter needs separate advertising-message consent and an unsubscribe path; the current one is a mock.
- Keep the AD label next to every affiliate link, and do not let affiliate income influence evidence grades.
- This tool does not diagnose or treat any condition.
