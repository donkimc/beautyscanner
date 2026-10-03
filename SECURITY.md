# Security

This file covers how to report a vulnerability and what the project does to protect users. The same information is shown to users on the `/security` page (in Korean and English).

## Reporting a vulnerability

Email **privacy@example.com** (replace with a real address before launch) with steps to reproduce. Please do not open a public issue for a security problem. We respect good-faith research and will not take legal action as long as you do not access other users' data or disrupt the service.

## What the app does

- **No passwords.** Login is an emailed confirmation link or Google.
- **Email login links** are random 256-bit tokens, valid for 15 minutes and usable once. Only a SHA-256 hash is stored. Consumption is an atomic `UPDATE ... WHERE used_at IS NULL AND expires_at > now()`, and it only happens on a `POST` (the link page requires a button press), so email scanners that pre-open links cannot use the token up.
- **Rate limit:** at most 5 login emails per address per hour. Responses never reveal whether an account exists.
- **Google login** uses the authorization-code flow with `state` validation and PKCE; unverified Google emails are rejected.
- **Sessions** are HMAC-SHA256-signed cookies: `HttpOnly`, `SameSite=Lax`, `Secure` over HTTPS, 7-day expiry, verified with a constant-time comparison.
- **Open redirects** are prevented: post-login paths must be same-site relative paths (`safeNext`).
- **Secrets** (`AUTH_SECRET`, API keys, `DATABASE_URL`) are read only on the server and never sent to the browser. A test fails if a client component reads `process.env`.
- **SQL** uses parameterized queries only.
- **Data minimization and deletion:** only what the features need is stored; deleting an account cascades to routines and consent records. Users can download their data from `/account`.
- **Consent:** each purpose (terms, sensitive survey data, overseas AI transfer, marketing) is recorded with a version; changing the wording means bumping the version so users are asked again.
- **AI:** only survey fields (never name or email) are sent, and only with consent. Output must pass guardrails (no medical claims, no invented figures) or a template is shown.
- **Tests** for authentication, tokens, the database layer, consent, architecture boundaries and guardrails run on every push (`npm run verify`).

## Not done yet

- No external security audit or penetration test.
- No two-factor authentication.
- No application-level encryption of stored data (relies on the host's encryption at rest).
- Login-request rate limiting is per email address only, not per IP.

## Operating notes

- Set `AUTH_SECRET` in production. Without it the server refuses email login, and Google login stays disabled.
- Rotate `AUTH_SECRET` to invalidate every session. Rotate API keys if they may have leaked.
