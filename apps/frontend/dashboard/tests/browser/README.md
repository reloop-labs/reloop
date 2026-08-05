# Dashboard browser tests (auth E2E)

Real-backend Playwright suite for dashboard auth (email OTP login/signup, redirects, session, sign-out).

These tests hit the **local stack** through Caddy. They do **not** start services and do **not** mock `/api/**`.

## Prerequisites

1. Local infra (Caddy, Postgres, Redis, NATS, …): `local/bootstrap.sh`
2. Auth service with `DEFAULT_OTP=888888` (see `apps/backend/auth/.env.dev`):

   ```bash
   bun run be:auth:dev
   ```

3. Dashboard:

   ```bash
   bun run fe:dashboard:dev
   ```

4. Confirm:

   - https://local.reloop.sh/dashboard/login
   - Auth cookies only work on `local.reloop.sh` (not bare `localhost:3001`)

## One-time browser install

From this package:

```bash
bunx playwright install chromium
```

## Run

```bash
# All browser tests
bun run test:browser

# Auth suite only
bun run test:browser:auth

# Onboarding suite only
bun run test:browser:onboarding

# Interactive UI mode
bun run test:browser:ui

# Headed Chromium
bunx playwright test tests/browser/auth.e2e.ts --headed
```

### Environment

| Variable | Default | Purpose |
|----------|---------|---------|
| `DASHBOARD_E2E_BASE_URL` | `https://local.reloop.sh/dashboard` | Full dashboard base (alias: `PLAYWRIGHT_BASE_URL`) |
| `E2E_DEFAULT_OTP` | `888888` | Must match auth `DEFAULT_OTP` |

## Prerequisites for onboarding suite

In addition to auth + dashboard:

- **API key service** (`be-api-key` / port 8012) — step 4 generates a real key
- Domain service is **not** required for the default path (tests **Skip** domain)

## What is covered

### Auth (`auth.e2e.ts`)

- Login / signup social step UI
- Email validation
- Anonymous protected-route → login redirect
- Email OTP happy path (login + signup) → `/onboarding` for new users
- Invalid OTP error
- Session survives reload; sign-out via Better Auth API → login

### Onboarding (`onboarding.e2e.ts`)

Routing rule under test:

| State | Destination |
|-------|-------------|
| New account (no org) | `/onboarding` |
| Finished workspace creation (has org) | dashboard home `/` |

Coverage:

- New signup always lands on onboarding step 1
- Create organization → step 2 (Add Domain)
- Skip domain → step 4 (API key) — does not require domain service
- Full skip-domain path → dashboard home (`{email}'s Account` + org name)
- After onboarding, re-login goes to **dashboard**, not onboarding
- Anonymous `/onboarding` → login

## Out of scope (for now)

- Google / GitHub OAuth (external IdP)
- Real domain add + DNS verify (step 2/3 without skip)
- Dashboard route crawl / smoke inventory
