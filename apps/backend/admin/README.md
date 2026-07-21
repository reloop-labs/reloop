# Reloop Platform Admin (backend) + Console (frontend)

Operator tooling for Reloop Labs / self-hosted instance owners.

## Apps

| App | Path | Port | URL |
|---|---|---|---|
| Frontend (Console) | `apps/frontend/console` | 3002 | `/console` |
| Backend (Admin) | `apps/backend/admin` | 8024 | `/api/admin` |

## Bootstrap a platform admin

1. Sign up normally (dashboard or console login).
2. Promote your user:

```bash
bun run apps/backend/admin/scripts/promote-admin.ts you@example.com
```

3. Optionally lock public signup with `DISABLE_SIGNUP=true` on the auth service.

## Dev

```bash
bun run fe:console:dev
bun run be:admin:dev
```

Or include them via root `bun run dev` / `frontend:dev` / `backend:dev`.

## Security model

Only users with `user.role === "super-admin"` (Better Auth platform role) can access:

- Console UI (`/console`)
- Admin API (`/api/admin/v1/*`)
- Credits top-up (`POST /api/credits/v1/topup`)

Org-level `member.role = admin` is **not** sufficient.

## Operator console features

- **⌘K / Ctrl+K** — global search (users, orgs, domains) + quick actions + page jump
- **Overview** — attention queue, usage-ranked quick actions, clickable KPIs, recent audit
- **User hub** — `/users/:id` (orgs, credits, support threads, ban / promote / impersonate)
- **Support side panel** — top-up, impersonate, open user/org hub, failed emails, suspend
- Sidebar: Overview, Support, Audit, Organizations, Users.
- Domains, emails, and credit ledgers live on **org hubs** (utility routes `/domains`, `/emails`, `/credits` remain for deep links from Overview / hubs).
- Deep links: `/domains?status=failed`, `/emails?status=bounced`, `/credits?organizationId=…`, `/organizations?status=suspended`, `/users?q=…`, `/support?c=…`
- Quick-action order is personal (localStorage) based on frequency + recency
