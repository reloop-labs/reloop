# Architecture

## Layers

```
cli.ts / lib.ts          entry points
transports/              stdio, streamable http
server/create-server.ts  McpServer factory
tools/                   MCP surface: schemas, descriptions, annotations
reloop/                  Reloop HTTP API client
errors/ config/ auth/ observability/   shared primitives
```

Dependencies point downward only. `reloop/` knows nothing about MCP; `tools/` knows nothing about transports; `transports/` knows nothing about individual tools.

## Transport independence

`createReloopServer({ api })` is the only place tools are registered. `serveStdio` and `createMcpHandler` both call it, so the two transports cannot drift: a tool added once is served everywhere. Neither transport knows which tools exist.

## Per-request `ReloopApi`

The Reloop credential is not a property of the process, it is a property of the caller. Over HTTP each request carries its own key, so the MCP handler factory builds a fresh `ReloopApi` per request and the server never holds a key. Over stdio the key comes from the environment and is fixed for the process lifetime, so one `ReloopApi` is built at startup. The same `createReloopServer` factory serves both because the credential enters through the API object rather than through configuration.

## Statelessness

The HTTP transport runs `createMcpHandler(..., { legacy: "stateless" })`: no sessions, no server-side per-client state, no sticky routing. Any instance can serve any request, so scaling is a matter of adding replicas behind a plain load balancer. `GET /mcp/healthz` is the liveness probe (`GET /healthz` serves the same probe).

## Why its own HTTP client

The `reloop-email` SDK cannot express what a server needs: no request timeout, no `AbortSignal`, and no control over the `User-Agent` header that Reloop requires. `src/reloop/client.ts` is about 130 lines of `fetch` with a timeout, header construction, JSON handling, and error mapping — the same reasoning that led `reloop-cli` to its own client.

## Why no MCP web framework

`@modelcontextprotocol/hono` and the Express adapter exist to bridge frameworks that do not speak web-standard `Request`/`Response`. Bun serves `fetch` handlers natively, so the adapter would only add a dependency. `createHttpHandler` returns a plain `fetch(request)` function, exported from `lib.ts`, which mounts unchanged in Bun, Workers, Deno, Hono, or Next.

## Authentication

Reloop authenticates with organization-scoped API keys (`rl_prod_...`) sent as `x-api-key`. Over stdio the key comes from `RELOOP_API_KEY`; over HTTP it comes from `Authorization: Bearer` or `x-api-key` on each request. The shape of the key is validated before any upstream call so malformed credentials never leave the process, and Reloop itself remains the authorization boundary.

OAuth is not implemented. Reloop has no OAuth authorization server, and API keys are the platform credential; the MCP specification's authorization section is optional for API-key resource servers. The 401 response deliberately sends `WWW-Authenticate: Bearer realm="reloop"` **without** a `resource_metadata` parameter, so OAuth-capable clients do not start a discovery flow that cannot succeed.

## Error model

Everything upstream becomes a `ReloopError` with a stable `code`, a `message`, and optional `why`, `fix`, `status`, `retryAfterSeconds`, and `fields`. `registerTools` catches it and returns `isError: true` whose text content is a JSON `{ error }` document (never `structuredContent`, which clients validate against the output schema), so a model gets a machine-readable code and a human-readable next step instead of a stack trace.

`retryable` is computed from the HTTP status and from whether the request was idempotent. Writes without an idempotency key — `contacts_create` and `email_send` — are never retryable after a timeout or a network failure, because the request may have reached Reloop and the email may already be out.

## No resources, no prompts

Tools with output schemas already return structured, typed data, which is what read access needs. MCP resources would add a second read path over per-credential data that cannot be cached or shared between clients, for no extra capability. Prompts would encode opinions about how a model should phrase its work; that belongs to the client, not to an infrastructure server.

## No elicitation on destructive tools

`email_send` and `contacts_delete` are irreversible, and the MCP elicitation flow would be the natural confirmation mechanism. Client support for it is not universal, and a tool that requires an unsupported feature is simply unusable on those clients. The current safety layer is `destructiveHint` on the annotations plus descriptions that state the consequence in the first sentence, which every client can act on. Revisit once the major clients implement elicitation.

## Where Tasks would fit

MCP Tasks cover operations that outlive a single call: the tool returns a handle and the client polls. Nothing here needs it — every Reloop call returns in one round trip, and a scheduled send returns its log ID immediately. A future long-running operation (a bulk import, a campaign send) would return a task handle from its tool without changing any layer below `tools/`.
