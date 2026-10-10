# Reloop MCP

The official [Model Context Protocol](https://modelcontextprotocol.io) server for [Reloop](https://reloop.sh), open-source email infrastructure. It lets MCP clients and coding agents operate a Reloop organization through typed tools: read and manage contacts, and send transactional email. The npm package is `reloop-mcp` and the binary is `reloop-mcp`; the source lives at [github.com/reloop-labs/reloop-mcp](https://github.com/reloop-labs/reloop-mcp). It implements MCP revision 2026-07-28 with the official TypeScript SDK v2 over stateless Streamable HTTP, and still serves 2025-era clients through the SDK's legacy compatibility layer.

## Transports

- **stdio** — the client spawns the server as a child process and talks to it over stdin/stdout. Use this for local clients such as Claude Code, Claude Desktop, Cursor, and Codex. The key comes from `RELOOP_API_KEY`.
- **Streamable HTTP** — one `POST /mcp` endpoint, stateless: no sessions, no sticky load balancing, horizontally scalable behind any load balancer. `GET /mcp/healthz` reports liveness (`GET /healthz` serves the same probe). This is the production and hosted model, and each client sends its own API key on every request.

Legacy HTTP+SSE (two-endpoint transport) is not served.

## Quick start (stdio)

Create an API key in the Reloop dashboard under **API keys**, then point your client at the server.

Claude Code:

```bash
claude mcp add reloop --env RELOOP_API_KEY=rl_prod_your_key -- npx -y reloop-mcp
```

Claude Desktop (`claude_desktop_config.json`) and Cursor (`.cursor/mcp.json`) share the same JSON:

```json
{ "mcpServers": { "reloop": { "command": "npx", "args": ["-y", "reloop-mcp"], "env": { "RELOOP_API_KEY": "rl_prod_your_key" } } } }
```

Codex (`~/.codex/config.toml`):

```toml
[mcp_servers.reloop]
command = "npx"
args = ["-y", "reloop-mcp"]
env = { RELOOP_API_KEY = "rl_prod_your_key" }
```

Any other stdio client: run `npx -y reloop-mcp` (or `bunx reloop-mcp`) with `RELOOP_API_KEY` in the environment.

## Self-hosted Reloop

Set `RELOOP_BASE_URL` to the origin of your installation. Nothing is hardwired to `reloop.sh` beyond the default.

```json
{ "mcpServers": { "reloop": { "command": "npx", "args": ["-y", "reloop-mcp"], "env": { "RELOOP_API_KEY": "rl_prod_your_key", "RELOOP_BASE_URL": "https://mail.example.com" } } } }
```

## Remote server (Streamable HTTP)

```bash
bunx reloop-mcp --transport http --host 0.0.0.0 --port 3000
```

The standalone HTTP server requires Bun. Node users run the Docker image or embed the exported fetch handler.

Clients connect to `http://host:3000/mcp` and send their own Reloop key on every request as `Authorization: Bearer rl_prod_...` (or `x-api-key: rl_prod_...`). `RELOOP_API_KEY` is not used by the HTTP transport.

```bash
docker build -t reloop/mcp .
docker run --rm -p 3000:3000 -e RELOOP_BASE_URL=https://mail.example.com reloop/mcp
```

```bash
curl -s http://127.0.0.1:3000/mcp/healthz
```

```json
{ "status": "ok", "name": "reloop", "version": "0.1.0" }
```

| Variable | Default | Meaning |
|---|---|---|
| `RELOOP_BASE_URL` | `https://reloop.sh` | Origin of the Reloop instance |
| `RELOOP_TIMEOUT_MS` | `30000` | Per-request upstream timeout, 1000 to 600000 |
| `HOST` | `127.0.0.1` | HTTP bind hostname |
| `PORT` | `3000` | HTTP bind port |
| `MCP_ALLOWED_HOSTS` | loopback names | Comma-separated `Host` header allowlist |
| `MCP_ALLOWED_ORIGINS` | loopback origins | Comma-separated `Origin` header allowlist |
| `LOG_LEVEL` | `info` | `debug`, `info`, `warn`, `error`, or `silent` |

When the server binds to a non-loopback host and `MCP_ALLOWED_HOSTS` is empty, the `Host` header is not validated. Behind a proxy, set it to the public hostname.

Embedding the handler in any fetch-based server:

```ts
import { createHttpHandler, createLogger, readConfig } from "reloop-mcp";

const config = readConfig(process.env);
const logger = createLogger({ level: config.logLevel });
const handler = createHttpHandler({ config, logger });

export default { fetch: (request: Request) => handler.fetch(request) };
```

## Authentication

Reloop API keys (`rl_prod_...`) are organization-scoped. The server never stores a key: it forwards the key of the current request to Reloop as an `x-api-key` header, and Reloop enforces authorization on every call.

- **stdio** — the key comes from `RELOOP_API_KEY` in the process environment.
- **HTTP** — each request carries its own key as a bearer token or `x-api-key` header. Requests without a plausibly shaped key are rejected with `401` before any upstream call.

OAuth is not offered yet. Keys never appear in logs or tool output.

## Tools

### `contacts_list`

List contacts in the authenticated Reloop organization, newest first, with offset pagination. Use `search` for a case-insensitive substring match on the email address and `status` to filter by subscription state. Use this to look up recipients or audit the audience before creating, updating, or emailing contacts. Results are paginated: check `pagination.hasMore` and request the next `page` instead of raising `limit` beyond 100.

Read-only: yes · Destructive: no · Idempotent: yes · Open world: no

| Input | Type | Required | Description |
|---|---|---|---|
| `page` | integer | no | 1-based page number |
| `limit` | integer | no | Contacts per page, 1 to 100 |
| `search` | string | no | Case-insensitive substring to match against contact email addresses |
| `status` | subscribed \| unsubscribed \| blocked | no | Only return contacts with this subscription status |
| `channelId` | string | no | Only return contacts enrolled in this channel |

Returns: `contacts`, `pagination`, `counts`

### `contacts_get`

Get one contact by ID or by exact email address. Pass exactly one of `id` or `email`. Use this to check whether a contact already exists (for example before contacts_create) or to read the current properties before contacts_update. Returns a `contact_not_found` error when no contact matches.

Read-only: yes · Destructive: no · Idempotent: yes · Open world: no

| Input | Type | Required | Description |
|---|---|---|---|
| `id` | string | no | Contact ID as returned by Reloop, for example con_123456789 |
| `email` | string | no | Email address |

Returns: `contact`

### `contacts_create`

Create a new contact in the Reloop organization. Fails with `contact_already_exists` if the email is already a contact; use contacts_get first when unsure. Optionally set name, subscription status (defaults to subscribed), custom properties, group memberships, and channel subscriptions. Creating a contact does not send any email.

Read-only: no · Destructive: no · Idempotent: no · Open world: no

| Input | Type | Required | Description |
|---|---|---|---|
| `email` | string | yes | Email address |
| `firstName` | string | no |  |
| `lastName` | string | no |  |
| `status` | subscribed \| unsubscribed \| blocked | no | Subscription status; defaults to subscribed |
| `properties` | object | no | Custom contact properties as key/value pairs. Keys are lowercase letters, digits, and underscores. |
| `groupIds` | array of string | no | IDs of groups to add the contact to |
| `channels` | array of object | no | Channels to enroll the contact in |

Returns: `contact`

### `contacts_update`

Update an existing contact by ID. Only the fields you pass change, except `properties`, which replaces the contact's entire property set: read the current properties with contacts_get and pass the full merged object to keep existing values. Use contacts_get to resolve an email address to an ID first.

Read-only: no · Destructive: no · Idempotent: yes · Open world: no

| Input | Type | Required | Description |
|---|---|---|---|
| `id` | string | yes | Contact ID as returned by Reloop, for example con_123456789 |
| `email` | string | no | Email address |
| `firstName` | string | no |  |
| `lastName` | string | no |  |
| `status` | subscribed \| unsubscribed \| blocked | no |  |
| `properties` | object | no | Custom contact properties as key/value pairs. Keys are lowercase letters, digits, and underscores. |

Returns: `contact`

### `contacts_delete`

Permanently delete a contact by ID. This cannot be undone and removes the contact from all groups and channels. To stop emailing someone without deleting their record, prefer contacts_update with status "unsubscribed". Use contacts_get to resolve an email to an ID and confirm the right record first.

Read-only: no · Destructive: yes · Idempotent: yes · Open world: no

| Input | Type | Required | Description |
|---|---|---|---|
| `id` | string | yes | Contact ID as returned by Reloop, for example con_123456789 |

Returns: `deleted`, `id`

### `email_send`

Send a transactional email through Reloop. This delivers real email to the recipients immediately (or at `scheduledAt`) and cannot be recalled, so confirm the sender, recipients, subject, and body before calling. `from` must use a sending domain that is verified in the Reloop organization; otherwise the call fails with `not_found` or a DNS `validation_error`. Provide `html` and/or `text`, or a `template` with variables. Returns the email log `id` for later inspection. Do not use this for bulk or marketing sends to many contacts.

Read-only: no · Destructive: yes · Idempotent: no · Open world: yes

| Input | Type | Required | Description |
|---|---|---|---|
| `from` | string | yes | Sender, on a verified sending domain: user@example.com or Jane Doe <user@example.com> |
| `to` | string or array of string | yes | Recipient address or list of up to 50 addresses |
| `subject` | string | yes | Subject line |
| `text` | string | no | Plain-text body |
| `html` | string | no | HTML body |
| `cc` | string or array of string | no |  |
| `bcc` | string or array of string | no |  |
| `replyTo` | string or array of string | no | Reply-To address or addresses |
| `headers` | object | no | Extra message headers. Standard envelope headers cannot be set here. |
| `tags` | array of object | no | Key/value tags attached to the email for filtering and analytics |
| `template` | object | no | Reloop template to render instead of, or merged with, html/text |
| `scheduledAt` | string | no | ISO 8601 timestamp to send at instead of immediately; must be in the future |
| `channelId` | string | no | Subscription channel this email belongs to, for preference management |

Returns: `id`, `messageId`, `status`, `timestamp`

## Errors

Every failed call returns `isError: true` and no `structuredContent`; the text content is a JSON document with an `error` object (structured content must match the tool's output schema, so errors travel in the text block):

```json
{ "error": { "code": "rate_limited", "message": "Too many requests", "why": "Organization send limit reached", "fix": "Wait retryAfterSeconds seconds (or a minute) and retry.", "status": 429, "retryable": true, "retryAfterSeconds": 42 } }
```

| Code | When | Can be retryable |
|---|---|---|
| `validation_error` | Input failed schema validation, or Reloop returned 400/422 (including a failed sending-domain DNS check) | no |
| `unauthorized` | The API key is missing, malformed, or rejected (401) | no |
| `forbidden` | The key is valid but not allowed to perform the operation (403) | no |
| `not_found` / `contact_not_found` | The contact, template, or sending domain does not exist (404) | no |
| `conflict` / `contact_already_exists` | The resource already exists (409) | no |
| `rate_limited` | A Reloop rate limit was hit (429) | yes, after `retryAfterSeconds` |
| `quota_exceeded` | The organization's email quota is exhausted (402) | no |
| `upstream_error` | Reloop returned 5xx | only for reads |
| `network_error` | The Reloop instance could not be reached | only for reads |
| `timeout` | Reloop did not answer within `RELOOP_TIMEOUT_MS` | only for reads |
| `malformed_response` | The response was not JSON, usually a wrong `RELOOP_BASE_URL` | no |
| `internal_error` | A bug in this server | no |

Writes (`contacts_create`, `email_send`) are never marked retryable after a timeout or network failure: the request may already have reached Reloop, and the email may already have been sent. Check the current state before repeating a write.

## Security

- Credentials are per request. The HTTP transport takes the caller's key from the request; nothing is stored, cached, or shared between requests.
- API keys are redacted from every log line, and email content is never logged.
- `Host` and `Origin` headers are validated on the MCP endpoint to block DNS-rebinding attacks from a browser.
- The API key shape is checked before any upstream call, so malformed credentials never leave the process.
- Request bodies are capped at 8 MB and upstream responses at 16 MB; record inputs are capped at 100 keys, recipients at 50.
- `RELOOP_BASE_URL` is trusted server configuration and is never a tool parameter, so a model cannot redirect traffic to another host.
- Reloop remains the authorization boundary: a key without access to an operation fails at Reloop, not here.
- Destructive tools carry `destructiveHint` so clients can ask for confirmation. `email_send` sends real email that cannot be recalled, and `contacts_delete` cannot be undone.

## Development

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

`bun scripts/render-tools.ts` regenerates the Tools section above; `test/docs.test.ts` fails if the README drifts from the tool definitions. For manual testing:

```bash
npx @modelcontextprotocol/inspector bun src/cli.ts
```

## Versioning

This package follows semantic versioning. Tool names, input and output field names, and error codes are the public contract: renaming or removing any of them is a breaking change and lands only in a major release.

## License

Apache-2.0.
