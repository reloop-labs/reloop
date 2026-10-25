# AGENTS.md

Instructions for AI coding agents working in the Reloop monorepo. Reloop is open-source email infrastructure: email API, SMTP relay, campaigns, automations, webhooks and agent inboxes. Hosted at https://reloop.sh; product docs at https://reloop.sh/docs (index for agents: https://reloop.sh/llms.txt).

## Layout

- `apps/backend/*`: one Bun + [Elysia](https://elysiajs.com) service per domain (`auth`, `mail`, `domain`, `contacts`, `template`, `workflow`, `webhook`, `inbox`, `campaigns`, `logs`, ...). Each serves under `/api/<service>` and publishes its OpenAPI spec at `/api/<service>/openapi/json`.
- `apps/backend/mcp`: the product MCP server (`reloop-mcp`). It has its own [AGENTS.md](apps/backend/mcp/AGENTS.md) with stricter rules; read it before touching that package.
- `apps/frontend/web`: marketing site (Next.js), including agent discovery files (`llms.txt`, `.md` twins, `/.well-known/*`, `/openapi.json`).
- `apps/frontend/docs`: documentation site (Next.js, served under `/docs`) and the docs MCP server at `/docs/mcp`.
- `apps/frontend/dashboard`: the logged-in app.
- `packages/*`: shared code (`auth`, `db`, `bus`, `ui`, `pricing`, `email-templates`, ...).

## Setup

```bash
bun setup     # bootstrap local stack (needs Bun 1.3+, Docker, mkcert)
bun dev       # run everything
```

Full guide: https://reloop.sh/docs/setup

## Rules

- Bun workspaces; use `bun`, not npm, pnpm or yarn.
- TypeScript strict. No `any`. Explicit types on exported functions.
- Format and lint with Biome: `bun run check` before committing (a Husky hook also runs it).
- Do not import one backend service from another. Share code through `packages/*` or the event bus (NATS).
- New backend endpoints need OpenAPI annotations (`detail` with `summary` and `description`) on the Elysia route; the public API reference and `/openapi.json` are generated from them.
- Errors returned by services are JSON (`message`, `why`, `fix`, `link`).
- The Next.js apps run a newer Next.js than most training data; read `node_modules/next/dist/docs/` before using an unfamiliar API.
- Never commit secrets. API keys start with `rl_`.

## Commits and PRs

Conventional Commits with a scope, for example `fix(webhook): stop retry loop on 5xx`. Branch from `main` with a `feat/`, `fix/`, `docs/`, `refactor/` or `chore/` prefix. See [CONTRIBUTING.md](CONTRIBUTING.md).
