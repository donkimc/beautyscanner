# beautyscanner

An MVP demo of an evidence-based skincare recommender, in **Korean and English**. A mobile-first landing page leads to a short survey that produces a budget-aware routine. Each product shows an evidence grade, a reason, and an AD-labelled buy link. Users can sign up with an emailed confirmation link (or Google) to save routines.

> **Demo status:** products and evidence notes in `lib/products.ts` are fictional sample data (names start with "[Sample]" / "[샘플]"), buy links go nowhere, the newsletter is a mock, and the legal pages are draft templates that need a lawyer's review.

Live demo (Railway): https://web-production-318ac.up.railway.app

## Pages

| Route | What it is |
|---|---|
| `/` | Mobile-first landing page: catch phrase, an auto-sliding illustrated product carousel, **Try it free** and **Log in** buttons, feature cards, mock newsletter |
| `/try` | Survey and result page. No account needed. |
| `/login` | Sign up / log in: email confirmation link, plus Google if configured |
| `/auth/verify` | Confirmation page the emailed link opens; a button press completes login |
| `/account` | Saved routines, consent management, data download, account deletion |
| `/terms`, `/privacy`, `/security` | Legal and security pages (draft) in both languages |
| `/api/*` | `auth/*`, `consent`, `routines`, `account`, `explain`, `config` |

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

### Routine and explanations
Rules in `lib/recommend.ts` choose one product per step, swap in cheaper options to fit the budget, and warn about gaps (no cream, no sunscreen) or an unmet budget. The explainer agent (`agent/explainer.ts`) rewrites each product's curated evidence note into a short reason in the user's language. It never chooses products or grades, and its output must pass guardrails or a template is used.

### Hero carousel
Five hand-drawn, unbranded SVG product illustrations (cleanser, toner, serum, moisturizer, sunscreen: one per routine step) slide every 2 seconds with a 0.7 s ease. The loop is seamless, it pauses while a finger or mouse is on it, supports swipe and tappable dots, and stops auto-sliding for users who prefer reduced motion. Art is in `app/_components/hero/ProductArt.tsx` and uses only design-token colors; the carousel is `app/_components/HeroCarousel.tsx`.

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
| `AUTH_URL` | Optional | Public site URL; derived from the request when unset |

In production, email login returns an error until `RESEND_API_KEY` and `EMAIL_FROM` are set. There is deliberately no "show the link on screen" fallback in production, because that would let anyone log in as any email address. (Resend's `onboarding@resend.dev` test sender can only mail the account owner, which is enough for trying it yourself.)

## Design

**Sage & Clay**, chosen from 2026 beauty-web trends (muted luxury: warm neutrals, sage, clay/dusty rose; serif headlines with a clean sans body):

- Colors and radii live in `design/tokens.json`; `npm run tokens` generates `app/tokens.css`, a Tailwind v4 `@theme` block (so `bg-bg`, `text-ink`, `text-brand`, `bg-sage-soft`, `text-grade-clinical`, `rounded-card`, … are utilities).
- Fonts (all SIL Open Font License, free for commercial use): **Pretendard** (body, Korean + Latin), **Noto Serif KR** and **Fraunces** (headlines), self-hosted through npm packages.
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
| `npm run verify` | Typecheck, tests, evals, and build (what CI runs) |

## Project structure

```
app/            Next.js UI, pages, API routes, shared components
auth/           Signed-cookie sessions and Google OAuth (server-side)
db/             Postgres access (Railway) or in-memory PGlite; schema, users, tokens, consents, routines
email/          Login email templates and the Resend sender
i18n/           Korean/English messages and language detection
consent/        Consent purposes and versions
content/        Terms, privacy and security text (both languages)
lib/            Product data and the rules-based recommender
agent/          Explainer: prompt, guardrails, output validation
design/         Design tokens -> app/tokens.css
evals/          Scenario evals for the recommender and guardrails
tests/          Unit tests, including architecture-boundary checks
architecture/   Layer rules (rules.json) and a diagram (diagram.mmd)
plan/           Decisions, milestones, risks (plan.json)
scripts/        Token generation
```

Import directions between folders are defined in `architecture/rules.json` and enforced by `tests/architecture.test.ts`.

## Database

Tables are created automatically on first use (`db/schema.ts`): `users`, `login_tokens` (hashed, single use), `consents` (audit log), `routines`. Deleting a user cascades to routines and consents.

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
