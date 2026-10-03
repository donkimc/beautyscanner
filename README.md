# beautyscanner

An MVP demo of an evidence-based skincare recommender for Korean users. A short survey produces a budget-aware routine. Each product shows an evidence grade, a reason, and an AD-labelled buy link.

> **Demo status:** products and evidence notes in `lib/products.ts` are fictional sample data (names start with "[샘플]"), buy links go nowhere, and signup is a mock modal. Replace the data with cited records before any real launch.

Live demo (Railway): https://web-production-318ac.up.railway.app

## How it works

1. **Survey (no account needed):** five tap-to-advance questions (skin type, concern, sensitivity, budget, number of steps) plus an optional free-text note.
2. **Routine:** plain rules in `lib/recommend.ts` choose one product per step, swap in cheaper options to fit the budget, and warn about gaps (no cream, no sunscreen) or an unmet budget.
3. **Explanation:** an AI agent (`agent/explainer.ts`) rewrites each product's curated evidence note into a short Korean reason. It never chooses products or evidence grades. Without an API key, template text is used.
4. **Save:** a demo signup modal with a required consent checkbox. Real login is not connected.

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
| `DEEPSEEK_API_KEY` | No | Enables AI-written explanations (DeepSeek). Without it the app uses template text. |
| `DEEPSEEK_MODEL` | No | Overrides the default model (`deepseek-chat`). |

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
app/            Next.js UI (survey, result page) and /api/explain route
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

Deployed on Railway from this repository's `claude/compassionate-franklin-blpqqa` branch. `railway.json` sets the build (Railpack), start command, and a health check on `/`. Add `DEEPSEEK_API_KEY` under the service's Variables to enable AI explanations.

CI (`.github/workflows/ci.yml`) runs `npm run verify` on every push.

## Roadmap

See `plan/plan.json`. Next steps:

- Real products and evidence with citations (sources: PubMed, MFDS public data, brand test pages).
- Real login and saved routines (Auth.js + Railway Postgres; Google first, Kakao after app approval).
- A retailer adapter (Coupang Partners / Naver Shopping API) behind a swappable interface.

## Privacy and compliance notes

- Survey answers can be health-related sensitive information under Korea's PIPA. Collect explicit, separate consent and keep data minimal.
- Sending answers to DeepSeek is an overseas transfer; disclose it in the consent text and have a Korean privacy lawyer review before real users sign up.
- Keep the AD label next to every affiliate link, and do not let affiliate income influence evidence grades.
- This tool does not diagnose or treat any condition.
