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
- **Never log, print, or return an API key**, not in an error message, not in a debug field. `redact` in `src/observability/log.ts` is the backstop, not the plan.
- **stdout belongs to the stdio protocol.** All logging goes to stderr.
- **Read the backend route before adding a tool.** The Reloop monorepo is the contract; do not guess field names.
- **Ship only what is asked.** No speculative tools, options, or abstractions.

## Commands

```bash
bun install
bun run dev
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
- Auth header is `x-api-key`. A non-empty `User-Agent` is required or Reloop answers 400.
- Error bodies are `{ message, why, fix, link? }`. 429 adds a `retryAfter` body field and a `retry-after` header; rate-limit headers are `ratelimit-limit`, `ratelimit-remaining`, `ratelimit-reset`.
- Pagination is offset based: `page` (1-based) and `limit` (max 100).
- Contacts: `properties` on update **replaces** the whole property set, so read before writing. There is no bulk route; `contacts_get` by email is a `search` on `/api/contacts/list` plus an exact match.
- Mail: `POST /api/mail/v1/send` has **no idempotency key**. A timeout or network failure may still have delivered the email, which is why writes are never marked `retryable`.

## Tool conventions

- Names are `<resource>_<verb>` with a plural resource: `contacts_list`, `contacts_get`, `email_send`.
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
