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

Only users with `user.role === "admin"` (Better Auth platform role) can access:

- Console UI (`/console`)
- Admin API (`/api/admin/v1/*`)
- Credits top-up (`POST /api/credits/v1/topup`)

Org-level `member.role = admin` is **not** sufficient.
