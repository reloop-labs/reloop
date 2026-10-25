# AGENTS.md

Source of truth for agents working in this repository.

## What this is

`reloop-mcp` is the official Model Context Protocol server for [Reloop](https://reloop.sh), open-source email infrastructure. The npm package is `reloop-mcp` and the binary is `reloop-mcp`. It is an API client: it talks to a Reloop instance over HTTP with an organization API key and exposes typed MCP tools.

This is **not** the marketing and documentation MCP server at `reloop.sh/mcp`. That one answers questions about Reloop; this one operates a Reloop organization.

## Hard rules

- **Zero comments.** No `//`, no `/* */`, no JSDoc, no TODOs, in any file. Names carry the meaning.
- **No `any`, no `@ts-ignore`, no unexplained casts, no dead code.** Tabs, double quotes, Biome formatting.
- **API client only.** Never add server code, database access, or Postgres queries. Everything goes through the Reloop HTTP API.
- **Only two runtime dependencies:** `@modelcontextprotocol/server` and `zod`. Adding a third needs a very good reason.
- **Never log, print, or return an API key**, not in an error message, not in a debug field. `redact` in `src/observability/log.ts` is the backstop, not the plan. The one exception is the newly issued secret that `create_api_key` and `rotate_api_key` return once, in the tool result only.
- **stdout belongs to the stdio protocol.** All logging goes to stderr.
- **Read the backend route before adding a tool.** The Reloop monorepo is the contract; do not guess field names.
- **Ship only what is asked.** No speculative tools, options, or abstractions.

## Commands

```bash
bun install
bun run dev        # HTTP via .env (local: cp .env.dev .env → https://local.reloop.sh/mcp)
bun run dev:stdio
bun run dev:http
bun run lint
bun run format
bun run typecheck
bun test
bun run build
bun scripts/render-tools.ts
```

## Request flow

```
cli.ts
  → config/env.ts          read and validate the environment
  → transports/stdio.ts    key from RELOOP_API_KEY, one api for the process
    transports/http.ts     key per request, one api per request
  → server/create-server.ts
  → tools/define.ts        registerTools, error to CallToolResult
  → tools/<resource>/<verb>.ts
  → reloop/<resource>.ts
  → reloop/client.ts       fetch, timeout, headers, error mapping
```

## Verified Reloop facts

- The base URL is a bare origin (default `https://reloop.sh`); services mount at `/api/<service>`.
- Auth header is `x-api-key` for API keys and `Authorization: Bearer` for Better Auth OAuth tokens. A non-empty `User-Agent` is required or Reloop answers 400.
- Error bodies are `{ code, message, why?, fix?, link }`, plus `errors: [{ path, message }]` on `validation_error` (422). `code` is stable (`unauthorized`, `not_found`, `conflict`, `rate_limited`, ...). Every response carries `ratelimit-limit`, `ratelimit-remaining` and `ratelimit-reset`; 429 adds `retry-after`, and some endpoints add a `retryAfter` body field.
- Pagination is offset based: `page` (1-based) and `limit` (max 100).
- Contacts: the contact routes are served both unversioned (`/api/contacts/list`) and under `/api/contacts/v1/`. This server uses the unversioned paths so it keeps working against self-hosted instances that predate the `/v1` aliases. `properties` on update **replaces** the whole property set, so read before writing. There is no bulk route; `get_contact` by email is a `search` on `/api/contacts/list` plus an exact match.
- Email logs: `GET /api/logs/v1/emails` (filters `recipient`, `status`, `domain`, `search` on subject or sender, `start_date`, `end_date`), `/emails/:id`, `/emails/stats` (parallel arrays per date). Resend is `POST /api/mail/v1/resend/:id` and returns the send response.
- Templates: `/api/template/v1/list`, `/:id`, `POST /:id/test`, `POST /create`, `POST /:id/versions`. Responses carry editor `content` blocks that tools drop. Sends use the latest version with `isMajor: true`, so a template is only sendable after a published version with `renderedHtml` exists. A single `{ type: "html", html }` content block is what the editor imports on first open. Send-time substitution only matches `{{{name}}}`.
- Properties: `/api/contacts/v1/properties/{list,create,:id}`. `PATCH` only accepts `fallbackValue`; name and type are immutable.
- Groups and channels: CRUD lives under `/api/contacts/v1/groups` and `/api/contacts/v1/channels`; membership lives on contact routes: `POST`/`DELETE /api/contacts/group/:id` (idempotent, body `contact_id` or `email`) and `PATCH /api/contacts/channel/:id`, an idempotent upsert of the subscription. `POST /api/contacts/channel/:id` returns 409 on an unchanged state, so tools use the PATCH. None of these create the contact.
- API keys: routes live under `/api/api-key/v1`; the collection is `/api/api-key/v1/` with a trailing slash, and state changes are `POST /rotate|enable|disable/:id`. Only create and rotate return the plaintext `key`.
- Domains: routes live under `/api/domain/v1` (`/list`, `/create`, `/:id`, `POST /verify/:id`). Verify returns `active` synchronously when DNS already resolves, otherwise `verifying` while a background job retries.
- SMTP providers (bring your own SMTP): routes live under `/api/domain/v1/smtp-providers` (`GET`/`POST`, `PATCH`/`DELETE /:id`, `POST /:id/test`). Create takes a sending `domain` and adds it automatically with no DNS; passwords are write-only.
- Mail: `POST /api/mail/v1/send` accepts an `Idempotency-Key` header, but this server does not send one. A timeout or network failure may still have delivered the email, which is why writes are never marked `retryable`.

## Tool conventions

- Names are `<verb>_<noun>`, singular for one record and plural for collections: `list_contacts`, `get_contact`, `send_email`.
- Tool inputs are camelCase and are mapped to the API's field names inside `run` (`replyTo` → `reply_to`, `scheduledAt` → `scheduled_at`).
- Every tool has a title, a description written for a model, all four annotations, an input schema, and an output schema.
- Failures are thrown as `ReloopError`; `registerTools` turns them into `isError` results whose text block is a JSON `{ error }` document; never put an error in `structuredContent`, clients validate it against the output schema.
- List tools take `page` and `limit` and return a `pagination` object.

## Adding a resource

1. Read the backend routes and model in the Reloop monorepo.
2. Add the paths to `src/reloop/endpoints.ts`.
3. Add the request and response types to `src/reloop/types.ts`.
4. Add `src/reloop/<resource>.ts` with a thin API class.
5. Wire it into `src/reloop/api.ts`.
6. Add `src/tools/<resource>/*.ts` and any shared `schemas.ts`.
7. Append the tools to `src/tools/index.ts`.
8. Add tests under `test/`.
9. Run `bun scripts/render-tools.ts` and paste the output into the README's Tools section.
10. Confirm `test/docs.test.ts` passes.

## Tests

- No network. Upstream Reloop is a mocked `fetch` (`mockReloop` in `test/helpers.ts`).
- HTTP transport tests run in process against `handler.fetch`.
- stdio tests spawn the CLI as a real child process.

## Commits

Lowercase messages prefixed `feat:`, `fix:`, `chore:`, `docs:`, or `refactor:`. No trailers, no co-authors, no attribution of any kind. Commit only when explicitly asked to commit those specific changes.
