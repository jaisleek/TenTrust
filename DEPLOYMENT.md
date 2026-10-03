# Production API and environment setup

This guide lists the external services used by the current app and the exact variable names their owners need to configure. Add secrets in the provider dashboard for the service that consumes them. Never put a private key in a `VITE_` variable, a frontend `.env` file, or source control.

## Services and API keys

| Service | Used for | Environment variables | Where they belong |
| --- | --- | --- | --- |
| Supabase | Frontend sign-in, screening records, consent, payment state | `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` | Netlify frontend; the same project URL and anon key also go in Render as `SUPABASE_URL`, `SUPABASE_ANON_KEY` |
| Supabase | Trusted backend writes to screening records and bundle credits | `SUPABASE_SERVICE_ROLE_KEY` | Render only; never Netlify or browser code |
| Flutterwave | Screening checkout and payment verification | `FLW_SECRET_KEY`, `FLW_WEBHOOK_SECRET` | Render backend only; the current flow creates and verifies checkout on the server |
| Mono | Credit bureau requests and bank account linking | `MONO_SECRET_KEY`, `MONO_BASE_URL`, `VITE_MONO_PUBLIC_KEY`, `MONO_WEBHOOK_SECRET` | Secret key and webhook secret on Render; public key on Netlify; base URL on Render |
| Prembly Identitypass | BVN/NIN identity checks | `PREMBLY_SECRET_KEY`, `PREMBLY_APP_ID`, `PREMBLY_BASE_URL`, `PREMBLY_WEBHOOK_SECRET` | Render backend only |
| Google Gemini | AI assistant and rent estimate endpoints | `GEMINI_API_KEY` | Private environment of the serverless or Node service hosting those endpoints; never Vite/Netlify frontend variables |

## Netlify frontend

Set these in the Netlify environment settings for each deploy context:

| Variable | Value |
| --- | --- |
| `VITE_SUPABASE_URL` | `https://elsvzazxshrqzwtuappy.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon/publishable key |
| `VITE_API_BASE_URL` | Render API origin, for example `https://YOUR_RENDER_API_DOMAIN`, with no trailing slash |
| `VITE_MONO_PUBLIC_KEY` | Mono public key for the environment, if the standalone tenant verification page is used |

All `VITE_` settings are visible in the compiled app. Only use public/publishable keys here. After changing a Netlify setting, trigger a new frontend deploy because Vite embeds these values at build time.

## Render FastAPI backend

Set these in the Render service environment:

| Variable | Value or action |
| --- | --- |
| `ENVIRONMENT` | `production` |
| `PORT` | Provided by Render |
| `HOST` | `0.0.0.0` |
| `PAYMENT_PROVIDER` | `flutterwave` |
| `SUPABASE_URL` | `https://elsvzazxshrqzwtuappy.supabase.co` |
| `SUPABASE_ANON_KEY` | Supabase anon/publishable key, used to validate the signed-in user's JWT |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service-role/secret key; backend only |
| `FLW_SECRET_KEY` | Flutterwave secret key for the chosen environment |
| `FLW_WEBHOOK_SECRET` | Secret hash configured for Flutterwave webhooks |
| `PAYMENT_CALLBACK_URL` | `https://YOUR_NETLIFY_DOMAIN/dashboard?tab=verify-tenant` |
| `PUBLIC_APP_URL` | `https://YOUR_NETLIFY_DOMAIN` |
| `ALLOWED_ORIGINS` | Exact frontend origin(s), comma-separated, with no wildcard; e.g. `https://YOUR_NETLIFY_DOMAIN` |
| `SCREENING_PRICES_CONFIRMED` | Keep `false` until the owner approves launch prices; set `true` only for production checkout after approval |
| `SCREENING_CONSENT_VERSION` | Version label recorded with tenant consent; bump when consent wording changes |
| `MONO_SECRET_KEY` | Mono secret key, required only before enabling credit or bank checks |
| `MONO_BASE_URL` | `https://api.withmono.com`; use Mono's supplied sandbox URL for sandbox credentials if applicable |
| `MONO_WEBHOOK_SECRET` | Shared secret used by the Mono webhook endpoint, if that endpoint is configured |
| `MONO_CREDIT_CHECKS_ENABLED` | Keep `false` until real Mono credentials and checks are validated |
| `PREMBLY_SECRET_KEY` | Prembly Identitypass API key |
| `PREMBLY_APP_ID` | Prembly app ID, if issued for the account |
| `PREMBLY_BASE_URL` | Production API origin; use Prembly's sandbox origin with sandbox credentials |
| `PREMBLY_WEBHOOK_SECRET` | Shared secret used by the Prembly webhook endpoint, if that endpoint is configured |
| `PREMBLY_CHECKS_ENABLED` | Keep `false` until real identity checks are configured and validated |

The Render blueprint declares the provider keys as unsynchronized secrets, so the owner enters them directly in Render. Do not commit a live `.env` file.

### Flutterwave setup

Register this webhook in Flutterwave:

`https://YOUR_RENDER_API_DOMAIN/api/payments/flutterwave/webhook`

Use the same webhook Secret Hash as `FLW_WEBHOOK_SECRET`. Keep test credentials in staging. Use live credentials in production; the backend rejects test Flutterwave keys for production checkout.

### Optional Paystack alternative

If the owner chooses Paystack instead, set `PAYMENT_PROVIDER=paystack`, then configure `PAYSTACK_SECRET_KEY` on Render and register `https://YOUR_RENDER_API_DOMAIN/api/payments/paystack/webhook`. The live backend checks that the production secret is not a test key.

## AI endpoints

The AI assistant and rent estimator read `GEMINI_API_KEY` on the server. The repository currently has `api/chat.ts` and `api/estimate.ts` handlers plus local routes in `server.ts`; `netlify.toml` currently configures only static publishing and SPA routing. Before relying on AI features in production, deploy those handlers through a supported serverless-functions adapter or a Node service, then set `GEMINI_API_KEY` in that service's private environment. Netlify frontend `VITE_` variables are not a safe place for this key.

## Local development

Copy `.env.example` to the frontend's local `.env` and `backend/.env.example` to `backend/.env`. Use sandbox provider keys only. Run the SQL migrations in `supabase/migrations/` before using the screening service.

The Basic package needs Supabase, a configured payment provider, and confirmed prices in production. Standard, Premium, and Founding Member remain unavailable until their identity and credit providers are enabled and working. Provider failures do not create a successful result or sample report.
