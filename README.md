# beautyscanner

An MVP demo of an evidence-based skincare recommender for Korean users. A mobile-first landing page leads to a short survey that produces a budget-aware routine. Each product shows an evidence grade, a reason, and an AD-labelled buy link. Users can sign in with Google to save their routine.

> **Demo status:** products and evidence notes in `lib/products.ts` are fictional sample data (names start with "[샘플]"), buy links go nowhere, and the newsletter is a mock. Replace the data with cited records before any real launch.

Live demo (Railway): https://web-production-318ac.up.railway.app

## Pages

| Route | What it is |
|---|---|
| `/` | Mobile-first landing page: catch phrase, animated hero, **무료로 체험하기** (try out) and **로그인** (login) buttons, feature cards, and the mock newsletter |
| `/try` | The survey and result page. No account needed. |
| `/login` | Google sign-in with a required consent checkbox |
| `/api/auth/*` | Google OAuth start/callback, `me`, and `logout` |
| `/api/explain` | Writes the per-product explanations (AI or template) |

### Flow

1. **Try out (no account):** five tap-to-advance questions (skin type, concern, sensitivity, budget, steps) plus an optional note.
2. **Routine:** rules in `lib/recommend.ts` choose one product per step, swap in cheaper options to fit the budget, and warn about gaps (no cream, no sunscreen) or an unmet budget.
3. **Explanation:** the explainer agent (`agent/explainer.ts`) rewrites each product's curated evidence note into a short Korean reason. It never chooses products or grades. Without an API key, template text is used.
4. **Save:** logged-out users are asked to sign in with Google and return to their routine (answers are kept in the browser during the redirect). Logged-in users save the routine to **this device's** local storage. Saving to the account needs a database and is not built yet.

### Newsletter (mock)

The newsletter section validates the email and consent checkbox and shows a confirmation, but **stores and sends nothing**. It exists to show the design and flow.

### Evidence grades

| Color | Meaning |
|---|---|
| Green | Clinically validated (RCT / meta-analysis) |
| Magenta | Supported by multiple studies |
| Gray | Brand's own test (not independent research) |
| Amber | Emerging evidence / small studies |

Ingredient-level evidence is labelled as such. It does not guarantee a specific product's effect.

## Getting started

Requires Node 22+.

```bash
npm install
npm run dev        # http://localhost:3000
```

### Environment variables

Copy `.env.example` to `.env.local`. Keys are read on the server only; never commit them.

| Variable | Required | Purpose |
|---|---|---|
| `GOOGLE_CLIENT_ID` | For login | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | For login | Google OAuth client secret |
| `AUTH_SECRET` | For login | Random string that signs the session cookie (`openssl rand -base64 32`) |
| `AUTH_URL` | No | Public site URL. If unset it is derived from the request, which works behind Railway's proxy. |
| `DEEPSEEK_API_KEY` | No | Enables AI-written explanations (DeepSeek). Without it the app uses template text. |
| `DEEPSEEK_MODEL` | No | Overrides the default model (`deepseek-chat`) |

Without the three Google/auth variables, `/login` shows a "not configured" message instead of redirecting.

### Setting up Google login

1. In [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials), create an **OAuth client ID** (type: Web application). Configure the consent screen if prompted.
2. Add **Authorized redirect URIs**:
   - `http://localhost:3000/api/auth/google/callback` (local)
   - `https://<your-railway-domain>/api/auth/google/callback` (production)
3. Put the client ID and secret in `.env.local` locally, or in the Railway service's **Variables**, together with a new `AUTH_SECRET`.
4. Redeploy, open `/login`, tick the consent box, and sign in.

How it works: authorization-code flow with PKCE and a `state` check. After Google confirms the user, the server sets a signed, HttpOnly, SameSite=Lax session cookie (7 days). There is no database; the cookie holds the user's Google ID, email, and name. Post-login redirects only accept same-site relative paths.

## Styling and design tokens

The UI uses **Tailwind CSS v4** (`@tailwindcss/postcss`). Colors and radii live in `design/tokens.json`; `npm run tokens` generates `app/tokens.css`, a Tailwind `@theme` block, so utilities like `bg-bg`, `text-ink`, `text-grade-clinical`, and `rounded-card` come from the tokens. Animations (float, bob, scan, pop, rise, shimmer) are defined in `app/globals.css` and respect `prefers-reduced-motion`.

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
app/            Next.js UI: landing, /try survey, /login, API routes, shared components
auth/           Google OAuth helpers and the signed-cookie session (server-side)
lib/            Product data and the rules-based recommender
agent/          Explainer: prompt, guardrails, output validation
design/         Design tokens (tokens.json) -> app/tokens.css
evals/          Scenario evals for the recommender and guardrails
tests/          Unit tests, including architecture-boundary checks
architecture/   Layer rules (rules.json) and a diagram (diagram.mmd)
plan/           Decisions, milestones, risks (plan.json)
scripts/        Token generation
```

Import directions between folders are defined in `architecture/rules.json` and enforced by `tests/architecture.test.ts`.

## AI guardrails

The explainer accepts a model sentence only if it passes every check; otherwise it falls back to a template:

- no diagnosis or treatment wording (e.g. "진단", "치료", "완치");
- no percentages that are not present in the product's evidence note;
- length limit.

The model receives only the survey fields and the curated product records, never names or emails.

## Deployment

Deployed on Railway from this repository's `claude/compassionate-franklin-blpqqa` branch. `railway.json` sets the build (Railpack), start command, and a health check on `/`. Add the environment variables above under the service's Variables. CI (`.github/workflows/ci.yml`) runs `npm run verify` on every push.

## Roadmap

See `plan/plan.json`. Next steps:

- Configure Google OAuth credentials on Railway and test real sign-in (login is built and tested locally, but not yet verified against Google).
- Real products and evidence with citations (sources: PubMed, MFDS public data, brand test pages).
- Save routines to the account (Railway Postgres).
- A retailer adapter (Coupang Partners / Naver Shopping API) behind a swappable interface.

## Privacy and compliance notes

- Survey answers can be health-related sensitive information under Korea's PIPA. Collect explicit, separate consent and keep data minimal.
- Sending answers to DeepSeek is an overseas transfer; the login consent text mentions it, but have a Korean privacy lawyer review before real users sign up.
- The session cookie stores the user's Google email and name. Add a privacy policy and an account-deletion path before launch.
- Keep the AD label next to every affiliate link, and do not let affiliate income influence evidence grades.
- A real newsletter needs separate opt-in consent for advertising messages and an unsubscribe path; the current one is a mock.
- This tool does not diagnose or treat any condition.
