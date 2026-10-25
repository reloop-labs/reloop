---
title: "Reloop agent authentication"
description: "How AI agents get credentials for the Reloop MCP server and REST API: OAuth 2.1 discovery, dynamic client registration, device flow, and API keys."
canonical: "https://reloop.sh/auth.md"
---

# Reloop agent authentication

You are an agent. Reloop has two protected surfaces, and each takes a different credential:

| Surface | URL | Credential |
| --- | --- | --- |
| Product MCP server | `https://reloop.sh/mcp` | OAuth 2.1 access token, or a Reloop API key |
| REST API | `https://reloop.sh/api/<service>/v1/...` ([OpenAPI](https://reloop.sh/openapi.json)) | Reloop API key (`rl_` prefix) |

The docs MCP server (`https://reloop.sh/docs/mcp`), `/llms.txt`, `/openapi.json` and every `.md` page are public and need no credentials.

Follow the steps in order.

## Step 1: Discover

Call the MCP endpoint without credentials. The `401` carries the Protected Resource Metadata (PRM, RFC 9728) URL in `WWW-Authenticate`:

```http
POST /mcp HTTP/1.1
Host: reloop.sh

HTTP/1.1 401 Unauthorized
WWW-Authenticate: Bearer realm="reloop", resource_metadata="https://reloop.sh/.well-known/oauth-protected-resource/mcp"
```

### 1a. Protected Resource Metadata

```http
GET https://reloop.sh/.well-known/oauth-protected-resource/mcp
```

```json
{
  "resource": "https://reloop.sh/mcp",
  "authorization_servers": ["https://reloop.sh/api/auth/v1"],
  "scopes_supported": ["openid", "profile", "email"],
  "bearer_methods_supported": ["header"]
}
```

### 1b. Authorization Server metadata

Fetch the RFC 8414 document for the issuer in `authorization_servers`. Both locations work:

- `https://reloop.sh/.well-known/oauth-authorization-server/api/auth/v1`
- `https://reloop.sh/api/auth/v1/.well-known/oauth-authorization-server`

The fields you need:

| Field | Value |
| --- | --- |
| `issuer` | `https://reloop.sh/api/auth/v1` |
| `authorization_endpoint` | `https://reloop.sh/api/auth/v1/oauth2/authorize` |
| `token_endpoint` | `https://reloop.sh/api/auth/v1/oauth2/token` |
| `registration_endpoint` | `https://reloop.sh/api/auth/v1/oauth2/register` |
| `device_authorization_endpoint` | `https://reloop.sh/api/auth/v1/device/code` |
| `revocation_endpoint` | `https://reloop.sh/api/auth/v1/oauth2/revoke` |
| `code_challenge_methods_supported` | `["S256"]` |
| `grant_types_supported` | `authorization_code`, `refresh_token`, `client_credentials`, `urn:ietf:params:oauth:grant-type:device_code` |
| `client_id_metadata_document_supported` | `true` |

OpenID Connect discovery is also published at `https://reloop.sh/.well-known/openid-configuration`.

## Step 2: Pick a method

1. **You can open a browser for the user** (desktop MCP clients such as Claude, Cursor, VS Code): use OAuth authorization code with PKCE. Go to Step 3.
2. **You run headless and a human can approve on another device** (CLI, remote agent): use the OAuth device flow. Go to Step 4.
3. **The user already has, or can create, an API key**: skip OAuth and go to Step 6 with the key. This is the only option for the REST API.

Reloop does not support the WorkOS `agent_auth` profile yet: there is no `identity_endpoint`, and `anonymous`, `identity_assertion` (ID-JAG) and `service_auth` registration are not available. Every Reloop credential belongs to a human-owned organization, so a person must approve the agent once.

## Step 3: Register

Register a client with Dynamic Client Registration (RFC 7591), or use a Client ID Metadata Document URL as your `client_id`:

```http
POST https://reloop.sh/api/auth/v1/oauth2/register
Content-Type: application/json

{
  "client_name": "My Agent",
  "redirect_uris": ["http://127.0.0.1:33418/callback"],
  "grant_types": ["authorization_code", "refresh_token"],
  "token_endpoint_auth_method": "none"
}
```

The response holds your `client_id`. Then send the user to `authorization_endpoint` with `response_type=code`, your `client_id` and `redirect_uri`, `scope=openid profile email offline_access`, `resource=https://reloop.sh/mcp`, and a PKCE `code_challenge` (`S256`). The user signs in to Reloop and approves.

## Step 4: Claim

For headless agents, the human claims the agent with the device flow (RFC 8628):

```http
POST https://reloop.sh/api/auth/v1/device/code
Content-Type: application/x-www-form-urlencoded

client_id=<client_id>&scope=openid profile email offline_access
```

Show the user the returned `verification_uri` and `user_code` in one message. They open the link, sign in, and enter the code. Poll `token_endpoint` with `grant_type=urn:ietf:params:oauth:grant-type:device_code` and the `device_code`, honoring `interval`. Until the user approves you get `authorization_pending`; back off on `slow_down`; restart if you get `expired_token`.

## Step 5: Exchange

Exchange the authorization code (Step 3) for tokens:

```http
POST https://reloop.sh/api/auth/v1/oauth2/token
Content-Type: application/x-www-form-urlencoded

grant_type=authorization_code&code=<code>&redirect_uri=<redirect_uri>&client_id=<client_id>&code_verifier=<verifier>&resource=https://reloop.sh/mcp
```

The response is a standard OAuth token response: `access_token`, `token_type: "Bearer"`, `expires_in`, and a `refresh_token` when you asked for `offline_access`. Refresh with `grant_type=refresh_token`.

## Step 6: Use the access_token

MCP server, with an OAuth token or an API key:

```http
POST https://reloop.sh/mcp
Authorization: Bearer <access_token or rl_ API key>
```

REST API, with an API key:

```http
GET https://reloop.sh/api/domain/v1/list
x-api-key: rl_...
```

`Authorization: Bearer rl_...` also works on the REST API. API keys are created in the dashboard at https://reloop.sh/dashboard/api-keys or with `POST /api/api-key/v1/`. The full secret is shown once; store it in an environment variable or secret manager. See https://reloop.sh/docs/learn/ai/api-keys.md.

## Errors

All errors are JSON.

| Status | Body | What to do |
| --- | --- | --- |
| `401` | `{"error":"unauthorized", ...}` on `/mcp`, `{"message":"Authentication required"}` on REST | No or bad credential. On `/mcp`, follow `WWW-Authenticate` back to Step 1. |
| `401` | disabled or deleted API key | Ask the user for a new key; do not retry. |
| `403` | `{"message": ..., "why": ..., "fix": ...}` | The key or token lacks access to that organization or domain. |
| `400` | `{"error":"invalid_grant"}` from `token_endpoint` | Code, device code or refresh token expired or was revoked. Restart at Step 3 or 4. |
| `429` | rate limited | Wait for `Retry-After`, then retry. |

## Revocation

- OAuth tokens: `POST https://reloop.sh/api/auth/v1/oauth2/revoke` with `token=<access_or_refresh_token>` and your `client_id` (RFC 7009).
- API keys: disable with `POST /api/api-key/v1/disable/:api_key_id`, or delete with `DELETE /api/api-key/v1/:api_key_id`. Requests with a disabled or deleted key return `401`.

## More

- Product skill: https://reloop.sh/skill.md
- MCP setup guide: https://reloop.sh/docs/integrations/ai-tools/mcp-server
- Site index: https://reloop.sh/llms.txt
