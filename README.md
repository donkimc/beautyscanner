# beautyscanner (MVP demo)

Survey -> budget-aware skincare routine with evidence grades, buy links (AD-labelled) and a demo signup modal.

- Products and evidence in `lib/products.ts` are **fictional sample data**.
- Rules in `lib/recommend.ts` choose the routine; the AI (`app/api/explain/route.ts`) only rephrases supplied data.
- Set `DEEPSEEK_API_KEY` (server-side only) to enable AI explanations; otherwise template text is used.

```
npm install
npm run dev
```
