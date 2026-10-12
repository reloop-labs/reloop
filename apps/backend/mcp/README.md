# Reloop MCP

The official [Model Context Protocol](https://modelcontextprotocol.io) server for [Reloop](https://reloop.sh), open-source email infrastructure. It lets MCP clients and coding agents operate a Reloop organization through typed tools: read and manage contacts, contact properties, groups, and subscription channels, send transactional email and inspect what was sent, look up templates, and manage API keys and sending domains. The npm package is `reloop-mcp` and the binary is `reloop-mcp`; the source lives at [github.com/reloop-labs/reloop-mcp](https://github.com/reloop-labs/reloop-mcp). It implements MCP revision 2026-07-28 with the official TypeScript SDK v2 over stateless Streamable HTTP, and still serves 2025-era clients through the SDK's legacy compatibility layer.

## Transports

- **stdio** — the client spawns the server as a child process and talks to it over stdin/stdout. Use this for local clients such as Claude Code, Claude Desktop, Cursor, and Codex. The key comes from `RELOOP_API_KEY`.
- **Streamable HTTP** — one `POST /mcp` endpoint, stateless: no sessions, no sticky load balancing, horizontally scalable behind any load balancer. `GET /mcp/healthz` reports liveness (`GET /healthz` serves the same probe). This is the production and hosted model. Each client authenticates per request with a Better Auth OAuth token (Connect) or its own API key.

Legacy HTTP+SSE (two-endpoint transport) is not served.

## Connect with OAuth (Better Auth)

The HTTP transport is a Better Auth OAuth protected resource. OAuth-capable
clients discover it automatically: `GET /.well-known/oauth-protected-resource/mcp`
advertises the canonical resource (`RELOOP_MCP_RESOURCE`, default
`<RELOOP_BASE_URL>/mcp`) and the authorization server (`RELOOP_AUTH_ISSUER`,
default `<RELOOP_BASE_URL>/api/auth/v1`). Unauthenticated requests are
challenged with `WWW-Authenticate: Bearer ... resource_metadata=...` per
RFC 9728, so the client starts the browser authorize flow against the Reloop
auth server and presents the issued access token as
`Authorization: Bearer <oauth-token>`.

The MCP server forwards the token to Reloop, which verifies the JWT signature
against the auth server JWKS, checks issuer and audience, and resolves the
user's organization (the `x-organization-id` header selects one when the user
belongs to several). Reloop remains the authorization boundary: forged,
expired, or wrong-audience tokens fail at Reloop, not here.

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

Clients connect to `http://host:3000/mcp` and authenticate on every request:
a Better Auth OAuth access token as `Authorization: Bearer <token>` (Connect,
recommended), or a Reloop key as `Authorization: Bearer rl_prod_...` (or
`x-api-key: rl_prod_...`). `RELOOP_API_KEY` is not used by the HTTP transport.

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
| `RELOOP_MCP_RESOURCE` | `<base>/mcp` | Canonical MCP resource identifier; must match the auth server `MCP_RESOURCE` |
| `RELOOP_AUTH_ISSUER` | `<base>/api/auth/v1` | Better Auth issuer advertised in protected-resource metadata |
| `RELOOP_TIMEOUT_MS` | `30000` | Per-request upstream timeout, 1000 to 600000 |
| `HOST` | `127.0.0.1` | HTTP bind hostname |
| `PORT` | `3000` | HTTP bind port |
| `MCP_ALLOWED_HOSTS` | `*` | Comma-separated `Host` header allowlist; `*` or unset accepts any host |
| `MCP_ALLOWED_ORIGINS` | loopback origins | Comma-separated `Origin` header allowlist |
| `LOG_LEVEL` | `info` | `debug`, `info`, `warn`, `error`, or `silent` |

When `MCP_ALLOWED_HOSTS` is unset or `*`, the `Host` header is not validated; every request still needs an API key or OAuth token. Set it to restrict which hostnames the server answers on.

Embedding the handler in any fetch-based server:

```ts
import { createHttpHandler, createLogger, readConfig } from "reloop-mcp";

const config = readConfig(process.env);
const logger = createLogger({ level: config.logLevel });
const handler = createHttpHandler({ config, logger });

export default { fetch: (request: Request) => handler.fetch(request) };
```

## Authentication

Reloop API keys (`rl_prod_...`) are organization-scoped. Better Auth OAuth
access tokens are user-scoped and audience-bound to the MCP resource. The
server never stores a credential: it forwards the credential of the current
request to Reloop, and Reloop enforces authorization on every call.

- **OAuth (Connect)** — `Authorization: Bearer <oauth-token>` on the HTTP
  transport. Verified by Reloop via JWKS with issuer/audience checks, then
  mapped to the user's organization. This is the recommended path for shared
  and hosted deployments: no long-lived secrets on the client.
- **API key (fallback)** — `RELOOP_API_KEY` for stdio; `Authorization: Bearer`
  or `x-api-key` per request for HTTP. Use it for local single-user setups and
  for clients without OAuth discovery.

Requests without a JWT-shaped bearer or a plausibly shaped key are rejected
with `401` and an RFC 9728 `WWW-Authenticate` challenge naming the protected
resource metadata. Keys and tokens never appear in logs or tool output, except the newly issued secret that `create_api_key` and `rotate_api_key` return once.

## Tools

### `list_contacts`

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

### `get_contact`

Get one contact by ID or by exact email address. Pass exactly one of `id` or `email`. Use this to check whether a contact already exists (for example before create_contact) or to read the current properties before update_contact. Returns a `contact_not_found` error when no contact matches.

Read-only: yes · Destructive: no · Idempotent: yes · Open world: no

| Input | Type | Required | Description |
|---|---|---|---|
| `id` | string | no | Contact ID as returned by Reloop, for example con_123456789 |
| `email` | string | no | Email address |

Returns: `contact`

### `create_contact`

Create a new contact in the Reloop organization. Fails with `contact_already_exists` if the email is already a contact; use get_contact first when unsure. Optionally set name, subscription status (defaults to subscribed), custom properties, group memberships, and channel subscriptions. Creating a contact does not send any email.

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

### `update_contact`

Update an existing contact by ID. Only the fields you pass change, except `properties`, which replaces the contact's entire property set: read the current properties with get_contact and pass the full merged object to keep existing values. Use get_contact to resolve an email address to an ID first.

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

### `delete_contact`

Permanently delete a contact by ID. This cannot be undone and removes the contact from all groups and channels. To stop emailing someone without deleting their record, prefer update_contact with status "unsubscribed". Use get_contact to resolve an email to an ID and confirm the right record first.

Read-only: no · Destructive: yes · Idempotent: yes · Open world: no

| Input | Type | Required | Description |
|---|---|---|---|
| `id` | string | yes | Contact ID as returned by Reloop, for example con_123456789 |

Returns: `deleted`, `id`

### `list_properties`

List the custom contact property definitions of the authenticated Reloop organization: each key, its type, and its fallback value, with offset pagination. Use this before create_contact or update_contact to learn which `properties` keys exist and whether they hold strings or numbers.

Read-only: yes · Destructive: no · Idempotent: yes · Open world: no

| Input | Type | Required | Description |
|---|---|---|---|
| `page` | integer | no | 1-based page number |
| `limit` | integer | no | Properties per page, 1 to 100 |
| `search` | string | no | Case-insensitive substring to match against the property name |
| `type` | string \| number | no | Only return properties of this type |

Returns: `properties`, `pagination`

### `create_property`

Define a new custom contact property, such as company_name or plan_seats. Contacts can then store a value for it under that key in `properties`. Fails with `property_already_exists` when the name is taken; use list_properties first when unsure.

Read-only: no · Destructive: no · Idempotent: no · Open world: no

| Input | Type | Required | Description |
|---|---|---|---|
| `name` | string | yes | Property key used in contact properties and as a template variable, for example company_name |
| `type` | string \| number | yes | string or number |
| `fallbackValue` | string | no | Value used in emails when a contact has no value for this property |

Returns: `property`

### `update_property`

Change the fallback value of a contact property by ID, or clear it with null. The name and type cannot be changed; to rename, create a new property and migrate contact values with update_contact.

Read-only: no · Destructive: no · Idempotent: yes · Open world: no

| Input | Type | Required | Description |
|---|---|---|---|
| `id` | string | yes | Property ID as returned by list_properties, for example prop_123456789 |
| `fallbackValue` | string or null | yes |  |

Returns: `property`

### `delete_property`

Delete a contact property definition by ID. Use list_properties to confirm the right property first.

Read-only: no · Destructive: yes · Idempotent: yes · Open world: no

| Input | Type | Required | Description |
|---|---|---|---|
| `id` | string | yes | Property ID as returned by list_properties, for example prop_123456789 |

Returns: `deleted`, `id`

### `list_groups`

List the contact groups of the authenticated Reloop organization with offset pagination. Groups are internal segments for organizing contacts (for example Beta testers or Enterprise customers); contacts never see them. Use this to find a group ID before list_group_contacts, add_contact_to_group, or create_contact with groupIds.

Read-only: yes · Destructive: no · Idempotent: yes · Open world: no

| Input | Type | Required | Description |
|---|---|---|---|
| `page` | integer | no | 1-based page number |
| `limit` | integer | no | Groups per page, 1 to 100 |
| `search` | string | no | Case-insensitive substring to match against the group name |

Returns: `groups`, `pagination`

### `get_group`

Get one contact group by ID. Returns a `group_not_found` error when no group matches; use list_groups to find the ID. Use list_group_contacts for its members.

Read-only: yes · Destructive: no · Idempotent: yes · Open world: no

| Input | Type | Required | Description |
|---|---|---|---|
| `id` | string | yes | Group ID as returned by Reloop, for example grp_123456789 |

Returns: `group`

### `create_group`

Create an empty contact group. Fails with `group_already_exists` when a group with that name exists; use list_groups first when unsure. Add members afterwards with add_contact_to_group, or pass the group ID in create_contact's groupIds.

Read-only: no · Destructive: no · Idempotent: no · Open world: no

| Input | Type | Required | Description |
|---|---|---|---|
| `name` | string | yes | Group name, up to 50 characters |

Returns: `group`

### `update_group`

Rename a contact group by ID. Members are unchanged. Fails with `group_already_exists` when another group already has that name.

Read-only: no · Destructive: no · Idempotent: yes · Open world: no

| Input | Type | Required | Description |
|---|---|---|---|
| `id` | string | yes | Group ID as returned by Reloop, for example grp_123456789 |
| `name` | string | yes | New group name |

Returns: `group`

### `delete_group`

Delete a contact group by ID. The contacts themselves are kept; they only lose this membership. Use get_group to confirm the right group first.

Read-only: no · Destructive: yes · Idempotent: yes · Open world: no

| Input | Type | Required | Description |
|---|---|---|---|
| `id` | string | yes | Group ID as returned by Reloop, for example grp_123456789 |

Returns: `deleted`, `id`

### `list_group_contacts`

List the contacts that belong to one group, with offset pagination. Use `search` for a case-insensitive substring match on the email address and `status` to filter by subscription state. Items are lean: use get_contact for a member's groups and channels.

Read-only: yes · Destructive: no · Idempotent: yes · Open world: no

| Input | Type | Required | Description |
|---|---|---|---|
| `id` | string | yes | Group ID as returned by Reloop, for example grp_123456789 |
| `page` | integer | no | 1-based page number |
| `limit` | integer | no | Contacts per page, 1 to 100 |
| `search` | string | no | Case-insensitive substring to match against contact email addresses |
| `status` | subscribed \| unsubscribed \| blocked | no | Only return members with this subscription status |

Returns: `group`, `contacts`, `pagination`, `counts`

### `add_contact_to_group`

Add an existing contact to a group, identified by `contactId` or by `email` (exactly one). Adding a contact that is already a member changes nothing. The contact must already exist: create it with create_contact first, which can also take groupIds directly. Fails with `not_found` when the group or contact does not exist.

Read-only: no · Destructive: no · Idempotent: yes · Open world: no

| Input | Type | Required | Description |
|---|---|---|---|
| `groupId` | string | yes | Group ID as returned by Reloop, for example grp_123456789 |
| `contactId` | string | no | Contact ID as returned by Reloop, for example con_123456789 |
| `email` | string | no | Email address of an existing contact, instead of contactId |

Returns: `contactId`, `groupId`, `groupName`

### `remove_contact_from_group`

Remove a contact from a group, identified by `contactId` or by `email` (exactly one). The contact itself is kept, with its other groups and channel subscriptions; removing a non-member changes nothing. Fails with `not_found` when the group or contact does not exist.

Read-only: no · Destructive: no · Idempotent: yes · Open world: no

| Input | Type | Required | Description |
|---|---|---|---|
| `groupId` | string | yes | Group ID as returned by Reloop, for example grp_123456789 |
| `contactId` | string | no | Contact ID as returned by Reloop, for example con_123456789 |
| `email` | string | no | Email address of an existing contact, instead of contactId |

Returns: `contactId`, `groupId`, `groupName`

### `list_channels`

List the subscription channels of the authenticated Reloop organization with their subscriber counts, with offset pagination. Channels are the email topics contacts can subscribe to or unsubscribe from on their preference page (for example Product updates or Newsletter). Use this to find a channel ID for send_email's channelId, list_contacts' channelId filter, or set_channel_subscription.

Read-only: yes · Destructive: no · Idempotent: yes · Open world: no

| Input | Type | Required | Description |
|---|---|---|---|
| `page` | integer | no | 1-based page number |
| `limit` | integer | no | Channels per page, 1 to 100 |

Returns: `channels`, `pagination`

### `get_channel`

Get one subscription channel by ID. Returns a `channel_not_found` error when no channel matches; use list_channels to find the ID. Use list_contacts with channelId to see its subscribers.

Read-only: yes · Destructive: no · Idempotent: yes · Open world: no

| Input | Type | Required | Description |
|---|---|---|---|
| `id` | string | yes | Channel ID as returned by Reloop, for example chn_123456789 |

Returns: `channel`

### `create_channel`

Create a subscription channel. Defaults to `opt_in` and `private`. Fails with `channel_already_exists` when a channel with that name exists; use list_channels first when unsure. Enroll contacts with set_channel_subscription or create_contact's channels.

Read-only: no · Destructive: no · Idempotent: no · Open world: no

| Input | Type | Required | Description |
|---|---|---|---|
| `name` | string | yes | Channel name |
| `description` | string | no | What subscribers receive on this channel |
| `defaultSubscription` | opt_in \| opt_out | no | opt_in: contacts receive this channel until they unsubscribe. opt_out: contacts receive it only after opting in |
| `visibility` | private \| public | no | public channels appear on the contact's email preference page; private channels are internal |

Returns: `channel`

### `update_channel`

Update a subscription channel by ID: name, description, default subscription, or visibility. Only the fields you pass change. Changing `defaultSubscription` affects contacts enrolled from now on, not existing subscriptions. Fails with `channel_already_exists` when another channel already has the new name.

Read-only: no · Destructive: no · Idempotent: yes · Open world: no

| Input | Type | Required | Description |
|---|---|---|---|
| `id` | string | yes | Channel ID as returned by Reloop, for example chn_123456789 |
| `name` | string | no | New channel name |
| `description` | string | no | What subscribers receive on this channel |
| `defaultSubscription` | opt_in \| opt_out | no | opt_in: contacts receive this channel until they unsubscribe. opt_out: contacts receive it only after opting in |
| `visibility` | private \| public | no | public channels appear on the contact's email preference page; private channels are internal |

Returns: `channel`

### `delete_channel`

Delete a subscription channel by ID, together with every contact's subscription to it. The contacts themselves are kept. Use get_channel to confirm the right channel first.

Read-only: no · Destructive: yes · Idempotent: yes · Open world: no

| Input | Type | Required | Description |
|---|---|---|---|
| `id` | string | yes | Channel ID as returned by Reloop, for example chn_123456789 |

Returns: `deleted`, `id`

### `set_channel_subscription`

Subscribe (`opt_in`) or unsubscribe (`opt_out`) an existing contact on one channel, identified by `contactId` or by `email` (exactly one). Enrolls the contact if they were never on the channel; setting the state they already have changes nothing. Only change a subscription when the contact asked for it or the user has their consent: opting someone back in after they unsubscribed can violate anti-spam law. Fails with `not_found` when the channel or contact does not exist.

Read-only: no · Destructive: no · Idempotent: yes · Open world: no

| Input | Type | Required | Description |
|---|---|---|---|
| `channelId` | string | yes | Channel ID as returned by Reloop, for example chn_123456789 |
| `contactId` | string | no | Contact ID as returned by Reloop, for example con_123456789 |
| `email` | string | no | Email address of an existing contact, instead of contactId |
| `subscription` | opt_in \| opt_out | yes | opt_in to receive this channel, opt_out to stop receiving it |

Returns: `contactId`, `channelId`, `channelName`, `subscription`, `status`

### `send_email`

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

### `list_emails`

List emails sent by the authenticated Reloop organization, newest first, with offset pagination. Covers API, SMTP, campaign, and automation sends. Filter by `recipient` (exact address), `status`, sending `domain`, a `search` on subject or sender, or a time window. Use this to answer whether an email reached someone, then get_email for its delivery events.

Read-only: yes · Destructive: no · Idempotent: yes · Open world: no

| Input | Type | Required | Description |
|---|---|---|---|
| `page` | integer | no | 1-based page number |
| `limit` | integer | no | Emails per page, 1 to 100 |
| `recipient` | string | no | Only emails sent to exactly this address |
| `status` | pending \| sent \| delivered \| opened \| clicked \| bounced \| failed \| spam \| archived | no | Only emails whose latest status is this |
| `domain` | string | no | Only emails sent from this domain, for example send.example.com |
| `search` | string | no | Case-insensitive substring to match against the subject or sender address; use recipient to filter by recipient |
| `since` | string | no | Only emails created at or after this ISO 8601 timestamp |
| `until` | string | no | Only emails created at or before this ISO 8601 timestamp |

Returns: `emails`, `pagination`

### `get_email`

Get one sent email by its log ID, with its delivery timeline (`events` such as delivered, opened, clicked, bounced) and the error message when delivery failed. Bodies are omitted unless `includeBody` is true, because HTML bodies can be large. Returns an `email_not_found` error when no email matches.

Read-only: yes · Destructive: no · Idempotent: yes · Open world: no

| Input | Type | Required | Description |
|---|---|---|---|
| `id` | string | yes | Email log ID, as returned by send_email or list_emails |
| `includeBody` | boolean | no | Also return the text and HTML bodies |

Returns: `email`

### `get_email_stats`

Get sending statistics for the organization over a time window: totals plus a per-day (or per-hour) series of sent, delivered, opened, bounced, complaint, and unsubscribe counts, with the delivery rate. Optionally limit to one sending domain by ID (from list_domains). Use this to judge deliverability or spot a bounce spike; use list_emails to inspect individual emails.

Read-only: yes · Destructive: no · Idempotent: yes · Open world: no

| Input | Type | Required | Description |
|---|---|---|---|
| `since` | string | no | Start of the window as an ISO 8601 timestamp |
| `until` | string | no | End of the window as an ISO 8601 timestamp |
| `interval` | day \| hour | no | Bucket size of the series |
| `domainId` | string | no | Only count emails sent from this domain ID |

Returns: `totals`, `series`

### `resend_email`

Send a previously sent email again, by its log ID, with the same sender, recipients, subject, and body. This delivers a real, new email immediately and cannot be recalled, so confirm with the user first; check list_emails or get_email to make sure the original did not already arrive. Returns the new email log `id`. Fails with `email_not_found` when the ID does not exist.

Read-only: no · Destructive: yes · Idempotent: no · Open world: yes

| Input | Type | Required | Description |
|---|---|---|---|
| `id` | string | yes | Email log ID, as returned by send_email or list_emails |

Returns: `id`, `messageId`, `status`, `timestamp`

### `list_templates`

List the email templates of the authenticated Reloop organization with their subject, sender, status, and variables, with offset pagination. Use this to find a template ID and the variables it expects before send_email with `template`.

Read-only: yes · Destructive: no · Idempotent: yes · Open world: no

| Input | Type | Required | Description |
|---|---|---|---|
| `page` | integer | no | 1-based page number |
| `limit` | integer | no | Templates per page, 1 to 100 |

Returns: `templates`, `pagination`

### `get_template`

Get one email template by ID: its subject, sender, status, and the variables it expects. The visual editor content is not returned; use send_test_email to see the rendered result. Returns a `template_not_found` error when no template matches.

Read-only: yes · Destructive: no · Idempotent: yes · Open world: no

| Input | Type | Required | Description |
|---|---|---|---|
| `id` | string | yes | Template ID as returned by list_templates |

Returns: `template`

### `send_test_email`

Render a template with the given variables and send it as a test to one address, usually the user's own, to preview it in a real inbox. This sends a real email. Use send_email with `template` for real recipients.

Read-only: no · Destructive: yes · Idempotent: no · Open world: yes

| Input | Type | Required | Description |
|---|---|---|---|
| `templateId` | string | yes | Template ID as returned by list_templates |
| `to` | string | yes | Single address to receive the test |
| `fromEmail` | string | no | Sender on a verified domain; defaults to the template's sender |
| `subject` | string | no | Subject override; defaults to the template's subject |
| `variables` | object | no | Values substituted into the template. FIRST_NAME, LAST_NAME, EMAIL, and UNSUBSCRIBE_URL are reserved and filled by Reloop. |

Returns: `sent`

### `list_api_keys`

List the API keys of the authenticated Reloop organization, newest first, with offset pagination. Secrets are never returned here; each key shows only its `start` prefix. Use `search` to match on the key name or prefix and `enabled` to filter by state. Use this to find a key ID before get_api_key, update_api_key, rotate_api_key, enable_api_key, disable_api_key, or delete_api_key.

Read-only: yes · Destructive: no · Idempotent: yes · Open world: no

| Input | Type | Required | Description |
|---|---|---|---|
| `page` | integer | no | 1-based page number |
| `limit` | integer | no | API keys per page, 1 to 100 |
| `search` | string | no | Case-insensitive substring to match against the key name or prefix |
| `enabled` | boolean | no | Only return enabled (true) or disabled (false) keys |

Returns: `apiKeys`, `pagination`

### `get_api_key`

Get one API key by ID: its name, enabled state, usage count, last use, and creator. The secret is never returned. Returns an `api_key_not_found` error when no key matches; use list_api_keys to find the ID.

Read-only: yes · Destructive: no · Idempotent: yes · Open world: no

| Input | Type | Required | Description |
|---|---|---|---|
| `id` | string | yes | API key ID as returned by Reloop |

Returns: `apiKey`

### `create_api_key`

Create a new organization-wide Reloop API key. The response contains the full secret `key`, which Reloop shows only once: hand it to the user immediately and tell them to store it in a secret manager; it cannot be read back later. Do not write the key into source code, logs, or chat history beyond what the user asked for.

Read-only: no · Destructive: no · Idempotent: no · Open world: no

| Input | Type | Required | Description |
|---|---|---|---|
| `name` | string | yes | Human-readable name for the key, for example Production server |

Returns: `apiKey`

### `update_api_key`

Rename an API key by ID. The secret and enabled state are unchanged; use rotate_api_key to replace the secret and enable_api_key or disable_api_key to change its state.

Read-only: no · Destructive: no · Idempotent: yes · Open world: no

| Input | Type | Required | Description |
|---|---|---|---|
| `id` | string | yes | API key ID as returned by Reloop |
| `name` | string | yes | Human-readable name for the key, for example Production server |

Returns: `apiKey`

### `rotate_api_key`

Replace the secret of an API key while keeping its ID. The old secret stops working immediately, so every service still using it will fail until it is updated; if this MCP server authenticates with that same key, it will lose access too. The response contains the new secret `key`, shown only once: hand it to the user immediately.

Read-only: no · Destructive: yes · Idempotent: no · Open world: no

| Input | Type | Required | Description |
|---|---|---|---|
| `id` | string | yes | API key ID as returned by Reloop |

Returns: `apiKey`

### `enable_api_key`

Re-enable a disabled API key by ID so requests made with its existing secret are accepted again. Enabling an already enabled key changes nothing.

Read-only: no · Destructive: no · Idempotent: yes · Open world: no

| Input | Type | Required | Description |
|---|---|---|---|
| `id` | string | yes | API key ID as returned by Reloop |

Returns: `apiKey`

### `disable_api_key`

Disable an API key by ID without deleting it. Every request made with it is rejected until enable_api_key is called, so services using it stop working; if this MCP server authenticates with that same key, it will lose access too. Prefer this over delete_api_key when the key may be needed again.

Read-only: no · Destructive: yes · Idempotent: yes · Open world: no

| Input | Type | Required | Description |
|---|---|---|---|
| `id` | string | yes | API key ID as returned by Reloop |

Returns: `apiKey`

### `delete_api_key`

Permanently delete an API key by ID. This cannot be undone: every request made with it is rejected from now on, and if this MCP server authenticates with that same key, it will lose access too. Prefer disable_api_key when the key may be needed again. Use get_api_key to confirm the right key first.

Read-only: no · Destructive: yes · Idempotent: yes · Open world: no

| Input | Type | Required | Description |
|---|---|---|---|
| `id` | string | yes | API key ID as returned by Reloop |

Returns: `deleted`, `id`

### `list_domains`

List the sending domains of the authenticated Reloop organization with their verification status and settings, with offset pagination. Use this to pick a verified `from` domain before send_email (only `active` domains can send) or to find a domain ID. DNS records are omitted here; use get_domain for them.

Read-only: yes · Destructive: no · Idempotent: yes · Open world: no

| Input | Type | Required | Description |
|---|---|---|---|
| `page` | integer | no | 1-based page number |
| `limit` | integer | no | Domains per page, 1 to 100 |
| `search` | string | no | Case-insensitive substring to match against the domain name |
| `status` | pending \| verifying \| active \| suspended \| failed | no | Only return domains with this verification status |

Returns: `domains`, `pagination`

### `get_domain`

Get one sending domain by ID, including the DNS records the user must add at their DNS provider and the verification status of each. Use this to show setup instructions or to diagnose why a domain is not `active`. Returns a `domain_not_found` error when no domain matches; use list_domains to find the ID.

Read-only: yes · Destructive: no · Idempotent: yes · Open world: no

| Input | Type | Required | Description |
|---|---|---|---|
| `id` | string | yes | Domain ID as returned by Reloop, for example dom_123456789 |

Returns: `domain`

### `create_domain`

Add a sending domain to the Reloop organization. The domain starts as `pending` and cannot send until verified: show the user the returned `dnsRecords` to add at their DNS provider, then call verify_domain. Fails with `domain_already_exists` if the domain is already registered, or `quota_exceeded` when the plan's domain limit is reached. Settings default to sending, receiving, click and open tracking enabled, and opportunistic TLS.

Read-only: no · Destructive: no · Idempotent: no · Open world: no

| Input | Type | Required | Description |
|---|---|---|---|
| `domain` | string | yes | Domain or subdomain to send from, for example send.example.com. A dedicated subdomain keeps the root domain's reputation separate. |
| `clickTracking` | boolean | no | Rewrite links to track clicks |
| `openTracking` | boolean | no | Embed a pixel to track opens |
| `sendingEmail` | boolean | no | Allow sending email from this domain |
| `receivingEmail` | boolean | no | Accept inbound email for this domain; requires an MX record |
| `tls` | opportunistic \| enforced | no | opportunistic uses TLS when the receiver supports it; enforced refuses to deliver without it |

Returns: `domain`

### `update_domain`

Change the settings of a sending domain by ID: sending, receiving, click tracking, open tracking, or TLS mode. Only the fields you pass change. Enabling receiving or tracking can add DNS records the user must create; check `dnsRecords` in the result and call verify_domain afterwards. The domain name itself cannot be changed.

Read-only: no · Destructive: no · Idempotent: yes · Open world: no

| Input | Type | Required | Description |
|---|---|---|---|
| `id` | string | yes | Domain ID as returned by Reloop, for example dom_123456789 |
| `clickTracking` | boolean | no | Rewrite links to track clicks |
| `openTracking` | boolean | no | Embed a pixel to track opens |
| `sendingEmail` | boolean | no | Allow sending email from this domain |
| `receivingEmail` | boolean | no | Accept inbound email for this domain; requires an MX record |
| `tls` | opportunistic \| enforced | no | opportunistic uses TLS when the receiver supports it; enforced refuses to deliver without it |

Returns: `domain`

### `verify_domain`

Check the DNS records of a sending domain by ID. If every record is already in place the domain becomes `active` immediately and `verified` is true. Otherwise the status is `verifying` and Reloop keeps re-checking in the background while DNS propagates, which can take minutes to hours; call get_domain later to see the outcome and which records still fail.

Read-only: no · Destructive: no · Idempotent: yes · Open world: yes

| Input | Type | Required | Description |
|---|---|---|---|
| `id` | string | yes | Domain ID as returned by Reloop, for example dom_123456789 |

Returns: `id`, `status`, `verified`

### `delete_domain`

Permanently delete a sending domain by ID, with its DNS configuration and signing keys. This cannot be undone: email can no longer be sent from addresses on it, inbound mail for it stops, and adding it again generates new DNS records the user must re-create. Use get_domain to confirm the right domain first.

Read-only: no · Destructive: yes · Idempotent: yes · Open world: no

| Input | Type | Required | Description |
|---|---|---|---|
| `id` | string | yes | Domain ID as returned by Reloop, for example dom_123456789 |

Returns: `deleted`, `id`

### `list_smtp_providers`

List the organization's own SMTP servers (bring your own SMTP) with the sending domains relayed through each and the last connection test result. Passwords are never returned. `limit` is the plan's cap on providers (null means unlimited).

Read-only: yes · Destructive: no · Idempotent: yes · Open world: no

Returns: `providers`, `limit`

### `create_smtp_provider`

Connect the user's own SMTP server (SendGrid, Postmark, Microsoft 365, their own Postfix…) and route a sending domain through it in one step. Reloop adds the domain automatically if it is not there yet; it needs no DNS records and can send immediately with all normal Reloop checks, logs, tracking, and webhooks. The connection is tested right away; check `status` and `lastError` in the result. Fails with `quota_exceeded` when the plan's provider limit is reached.

Read-only: no · Destructive: no · Idempotent: no · Open world: yes

| Input | Type | Required | Description |
|---|---|---|---|
| `domain` | string | yes | Domain the user sends from (the part after @ in From). Reloop adds it automatically if missing; no DNS records are needed when relaying. |
| `host` | string | yes | SMTP server hostname, for example smtp.sendgrid.net |
| `port` | integer | yes | SMTP server port, usually 587 |
| `security` | starttls \| none | no | starttls requires STARTTLS with a valid certificate (ports 587, 25, 2525). none is plaintext and only allowed on self-hosted Reloop. Port 465 implicit TLS is not supported. |
| `username` | string | yes | SMTP login |
| `password` | string | yes | SMTP password |
| `name` | string | no | Label for the server; defaults to the domain |

Returns: `provider`

### `update_smtp_provider`

Change an SMTP provider by ID, or route one more sending domain through it with `domain` (added to Reloop automatically). Only the fields you pass change; omit `password` to keep the stored one. Changing connection details resets `status` to unverified, so call test_smtp_provider afterwards.

Read-only: no · Destructive: no · Idempotent: yes · Open world: no

| Input | Type | Required | Description |
|---|---|---|---|
| `id` | string | yes | SMTP provider ID as returned by Reloop, for example smtp_123456789 |
| `domain` | string | no | Domain the user sends from (the part after @ in From). Reloop adds it automatically if missing; no DNS records are needed when relaying. |
| `name` | string | no |  |
| `host` | string | no | SMTP server hostname, for example smtp.sendgrid.net |
| `port` | integer | no | SMTP server port, usually 587 |
| `security` | starttls \| none | no | starttls requires STARTTLS with a valid certificate (ports 587, 25, 2525). none is plaintext and only allowed on self-hosted Reloop. Port 465 implicit TLS is not supported. |
| `username` | string | no |  |
| `password` | string | no | New password; omit to keep the stored one |

Returns: `provider`

### `test_smtp_provider`

Connect to an SMTP provider by ID, negotiate STARTTLS, and log in. Pass `to` to also deliver a real test email so the user can confirm it lands. Returns `ok` and the server's `error` message when it fails, and stores the result on the provider.

Read-only: no · Destructive: no · Idempotent: yes · Open world: yes

| Input | Type | Required | Description |
|---|---|---|---|
| `id` | string | yes | SMTP provider ID as returned by Reloop, for example smtp_123456789 |
| `to` | string | no | Send a real test email to this address |

Returns: `ok`, `error`, `provider`

### `delete_smtp_provider`

Permanently delete an SMTP provider by ID and its stored credentials. Domains that were added only for it are removed; domains that also have Reloop DNS records go back to sending through Reloop and need those records verified. Use list_smtp_providers to confirm the right provider first.

Read-only: no · Destructive: yes · Idempotent: yes · Open world: no

| Input | Type | Required | Description |
|---|---|---|---|
| `id` | string | yes | SMTP provider ID as returned by Reloop, for example smtp_123456789 |

Returns: `deleted`, `id`

### `check_temp_email`

Check whether an email address or bare domain is disposable (a temp or throwaway inbox), a role address such as admin@ or support@, or from a free consumer provider, and whether its domain has MX records. Nothing is sent to the mailbox and nothing is stored. Use this before creating a contact or sending to an address you do not trust: treat `disposable` and `invalid` verdicts as reject, `risky` as review, and `deliverable` as safe. `riskScore` runs from 0 (safe) to 1 (throwaway).

Read-only: yes · Destructive: no · Idempotent: yes · Open world: yes

| Input | Type | Required | Description |
|---|---|---|---|
| `email` | string | yes | Email address or bare domain, for example you@mailinator.com |

Returns: `input`, `kind`, `domain`, `verdict`, `isValidSyntax`, `isDisposable`, `isRoleAddress`, `isFreeProvider`, `mxRecords`, `confidence`, `riskScore`, `flags`

### `check_domain_reputation`

Score the sender reputation of a domain from 0 to 100 with an A+ to F grade. It audits SPF, DKIM and DMARC, checks 7 domain blocklists live, and looks at domain age and DNS health (MX, A, NS, PTR, TLS). Nothing is sent and nothing is stored. Use this before sending from a domain, after changing its DNS, or when deliverability drops: each failing or warning entry in `checks` names the problem and often the current `record`, and `recommendations` lists the fixes in plain language. Treat `poor` and `critical` verdicts as not ready to send.

Read-only: yes · Destructive: no · Idempotent: yes · Open world: yes

| Input | Type | Required | Description |
|---|---|---|---|
| `domain` | string | yes | Root or sending domain without protocol or path, for example reloop.sh |

Returns: `domain`, `score`, `grade`, `verdict`, `verdictLabel`, `breakdown`, `checks`, `recommendations`

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
| `not_found` / `contact_not_found` / `property_not_found` / `group_not_found` / `channel_not_found` / `email_not_found` / `template_not_found` / `api_key_not_found` / `domain_not_found` | The resource does not exist (404) | no |
| `conflict` / `contact_already_exists` / `property_already_exists` / `group_already_exists` / `channel_already_exists` / `domain_already_exists` | The resource already exists (409) | no |
| `rate_limited` | A Reloop rate limit was hit (429) | yes, after `retryAfterSeconds` |
| `quota_exceeded` | The organization's email quota is exhausted (402) | no |
| `upstream_error` | Reloop returned 5xx | only for reads |
| `network_error` | The Reloop instance could not be reached | only for reads |
| `timeout` | Reloop did not answer within `RELOOP_TIMEOUT_MS` | only for reads |
| `malformed_response` | The response was not JSON, usually a wrong `RELOOP_BASE_URL` | no |
| `internal_error` | A bug in this server | no |

Writes without an idempotency key (`create_contact`, `create_property`, `create_group`, `create_channel`, `send_email`, `resend_email`, `send_test_email`, `create_api_key`, `rotate_api_key`, `create_domain`) are never marked retryable after a timeout or network failure: the request may already have reached Reloop, and the email may already have been sent. Check the current state before repeating a write.

## Security

- Credentials are per request. The HTTP transport takes the caller's key from the request; nothing is stored, cached, or shared between requests.
- API keys are redacted from every log line, and email content is never logged.
- `Host` and `Origin` headers are validated on the MCP endpoint to block DNS-rebinding attacks from a browser.
- The API key shape is checked before any upstream call, so malformed credentials never leave the process.
- Request bodies are capped at 8 MB and upstream responses at 16 MB; record inputs are capped at 100 keys, recipients at 50.
- `RELOOP_BASE_URL` is trusted server configuration and is never a tool parameter, so a model cannot redirect traffic to another host.
- Reloop remains the authorization boundary: a key without access to an operation fails at Reloop, not here.
- Destructive tools carry `destructiveHint` so clients can ask for confirmation. `send_email`, `resend_email`, and `send_test_email` send real email that cannot be recalled, `delete_contact`, `delete_property`, `delete_group`, `delete_channel`, `delete_api_key`, and `delete_domain` cannot be undone, and `rotate_api_key` and `disable_api_key` break every service using that key.

## Development

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

`bun scripts/render-tools.ts` regenerates the Tools section above; `test/docs.test.ts` fails if the README drifts from the tool definitions. For manual testing:

```bash
npx @modelcontextprotocol/inspector bun src/cli.ts
```

## Versioning

This package follows semantic versioning. Tool names, input and output field names, and error codes are the public contract: renaming or removing any of them is a breaking change and lands only in a major release.

## License

Apache-2.0.
