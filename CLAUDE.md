@AGENTS.md

# Project rules

- Products and evidence in `lib/products.ts` are **sample data**. Do not present them as real, and never invent studies, citations, or evidence grades.
- Rules in `lib/recommend.ts` choose products. The AI (`agent/explainer.ts`) only rephrases supplied data; it must never pick products or grades.
- API keys and secrets are server-side only. Never read `process.env` in client (`"use client"`) files, and never commit `.env*` (except `.env.example`).
- Style with Tailwind utilities. Colors and radii come from `design/tokens.json`; run `npm run tokens` after editing it (a test checks `app/tokens.css` is in sync).
- Respect the layer rules in `architecture/rules.json` (enforced by `tests/architecture.test.ts`); add a new top-level folder there before using it.
- Post-login redirects must go through `safeNext` in `auth/session.ts`.
- Keep the AD label next to every affiliate link and the "not a diagnosis" disclaimer on the result page.
- Run `npm run verify` (typecheck, tests, evals, build) before pushing.
