@AGENTS.md

# Project rules

- Products and evidence in `lib/products.ts` are **sample data**. Do not present them as real, and never invent studies, citations, or evidence grades.
- Rules in `lib/recommend.ts` choose products. The AI (`agent/explainer.ts`) only rephrases supplied data; it must never pick products or grades.
- Every user-facing string goes in `i18n/messages.ts` for **both** `ko` and `en` (a test enforces identical structure). Product text needs both languages in `lib/products.ts`; legal text in `content/legal.ts`.
- Anything that needs consent must go through `useConsent().ensure([...])` (popup when needed). Bump the version in `consent/purposes.ts` when wording or scope changes.
- API keys and secrets are server-side only. Never read `process.env` in client (`"use client"`) files, never import `db/`, `email/`, `auth/google`, or `i18n/server` from client components, and never commit `.env*` (except `.env.example`).
- Never add a production fallback that reveals a login link on screen; email login must go through the email provider.
- Use parameterized SQL only (`db/`). Post-login redirects must go through `safeNext` in `auth/session.ts`.
- Style with Tailwind utilities. Keep the look of the original design pages: paper background, plum ink, pink-magenta accent, Newsreader / Karla / IBM Plex Mono with Pretendard and Noto Serif KR as Korean fallbacks. Colors (light and dark) and radii come from `design/tokens.json`; run `npm run tokens` after editing it (a test checks `app/tokens.css` is in sync). Do not hardcode colors in components. Fonts must stay free for commercial use (SIL OFL).
- Respect the layer rules in `architecture/rules.json` (enforced by `tests/architecture.test.ts`); declare a new top-level folder there before using it.
- Keep the AD label next to every affiliate link and the "not a diagnosis" disclaimer on the result page.
- Run `npm run verify` (typecheck, tests, evals, build) before pushing.
