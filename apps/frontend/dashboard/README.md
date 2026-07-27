# Reloop Dashboard (Next.js)

Main Reloop workspace app — campaigns, contacts, templates, analytics, and settings. Mounted at **`/dashboard`**.

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
| `/dashboard/verify` | Email OTP and magic-link verification |
| `/dashboard/onboarding` | Full 4-step onboarding wizard |
| `/dashboard/invite` | Placeholder (org invite accept) |

Auth client is `@reloop/auth/client` (Better Auth at `/api/auth/v1/`). UI components come from `@reloop/ui` and tokens from `@reloop/tailwind`.

**Data fetching:** use **TanStack Query** only — no SWR. The query client is provided by the root App Router layout. Shared keys live in `src/lib/query-keys.ts`.

Full email/social flows need the Reloop API / auth backend reachable from the browser origin (or a reverse proxy).

## Component layout

- **Routes stay thin** — `src/app/*` owns layouts, metadata, and page wrappers while product code remains in `src/features/*`.
- **Feature folders** group related files (e.g. `login/`, `signup/`) — no nested folder per component.
- **Shared auth** pieces live flat under `features/auth/`.

```
src/app/                            # thin App Router wiring only
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
  navigation.ts
  page-placeholder.tsx
  page-header/                # top bar chrome
    page-header.tsx
    organization-switcher.tsx
    user-dropdown.tsx
    user-avatar.tsx
    theme-toggle.tsx
    use-active-organization.ts
  sidebar/                    # left nav (main + settings)
    main-sidebar.tsx
    sidebar-items.tsx
    settings-sidebar-items.tsx
    use-sidebar-collapse.ts
src/features/settings/
  settings-shell.tsx
  settings-placeholder-page.tsx
  theme/
    theme-page.tsx
    theme-toggle.tsx
    sidebar-layout-icon.tsx
  security/
    security-page.tsx
    connected-accounts.tsx
    session-management.tsx
    security-utils.tsx
    session-icons.tsx
  profile/
    profile-page.tsx
    account-header.tsx
    account-profile-picture.tsx
    account-danger-zone.tsx
  workspace/
    workspace-page.tsx
    workspace-header.tsx
    workspace-logo-upload.tsx
    workspace-danger-zone.tsx
  teams/
    teams-page.tsx
    team-list.tsx
    team-filter-dropdown.tsx
    invite-modal.tsx
    invite-dropdown.tsx
    member-dropdown.tsx
    change-role-modal.tsx
    remove-member-modal.tsx
    revoke-invite-modal.tsx
  billing/
    billing-page.tsx
    plans-page.tsx
    switch-plan-modal.tsx
    use-billing-usage.ts
    request-support.ts
  usage/
    usage-page.tsx
    usage-section.tsx
  use-org-permissions.ts
src/features/onboarding/...
src/features/invite/invite-page.tsx
src/features/smtp/
  smtp-page.tsx
  smtp-code-panel.tsx
  smtp-code-examples.ts
src/features/integrations/
  integrations-page.tsx
  catalog.ts
src/features/api-keys/
  api-keys-page.tsx
  api-key-list.tsx
  api-key-table.tsx
  create-api-key-modal/
  …
src/hooks/use-api-language.ts
```

## Scripts

```bash
bun run dev              # Next.js with Turbopack on port 3001
bun run check:migration  # lint and format-check the Next migration surface
bun run typecheck
bun run test
bun run build
bun run test:browser     # production standalone route/parity suite
```
