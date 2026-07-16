# Reloop Dashboard V1 (TanStack Start)

TanStack Start rebuild of the Reloop dashboard. Mounted at **`/dashboard`** (same public base path as the Next.js app).

## Run

From the monorepo root:

```bash
bun install
bun run fe:dashboard:dev
```

Or in this package:

```bash
bun run dev
```

Dev server: [http://localhost:3001/dashboard/](http://localhost:3001/dashboard/)  
Via Caddy: [https://local.reloop.sh/dashboard/](https://local.reloop.sh/dashboard/)

## Auth routes (current)

| Path | Description |
|------|-------------|
| `/dashboard` | Entry — redirects unauthenticated users to login |
| `/dashboard/login` | Email OTP + Google / GitHub login |
| `/dashboard/signup` | Email OTP + Google / GitHub signup |
| `/dashboard/onboarding` | Full 4-step onboarding wizard |
| `/dashboard/invite` | Placeholder (org invite accept) |

Auth client is `@reloop/auth/client` (Better Auth at `/api/auth/v1/`). UI components come from `@reloop/ui` and tokens from `@reloop/tailwind`.

**Data fetching:** use **TanStack Query** only — no SWR. Query client is wired via `@tanstack/react-router-ssr-query` in `src/router.tsx`. Shared keys live in `src/lib/query-keys.ts`.

Full email/social flows need the Reloop API / auth backend reachable from the browser origin (or a reverse proxy), same as the existing Next dashboard.

## Component layout

- **Routes stay thin** — `src/routes/*` only declare the route, search validation, and the page component.
- **Feature folders** group related files (e.g. `login/`, `signup/`) — no nested folder per component.
- **Shared auth** pieces live flat under `features/auth/`.

```
src/routes/                         # thin route wiring only
src/features/auth/
  auth-shell.tsx
  auth-session-loader.tsx
  verify-otp.tsx
  use-auth-step-direction.ts
  use-redirect-if-authenticated.ts
  login/
    login-page.tsx
    login-form.tsx
    social-login.tsx
  signup/
    signup-page.tsx
    signup-form.tsx
    social-signup.tsx
src/features/home/home-page.tsx
src/features/dashboard/
  dashboard-shell.tsx
  main-sidebar.tsx
  sidebar-items.tsx
  navigation.ts
  use-sidebar-collapse.ts
src/features/settings/
  settings-shell.tsx          # shared narrow column for settings routes
  theme/
    theme-page.tsx
    theme-toggle.tsx
    sidebar-layout-icon.tsx
src/features/onboarding/...
src/features/invite/invite-page.tsx
```

## Scripts

```bash
bun run dev              # Vite + TanStack Start
bun run generate-routes  # Regenerate routeTree.gen.ts
bun run typecheck
bun run build
bun run test
```
