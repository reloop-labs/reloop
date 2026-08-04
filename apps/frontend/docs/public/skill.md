---
name: reloop
description: >
  Use Reloop email infrastructure: authenticate with x-api-key (rl_ prefix),
  send mail, manage API keys, domains, contacts, webhooks, and templates.
  Use when integrating Reloop, creating or rotating API keys, or sending
  transactional email via API or SMTP.
license: MIT
metadata:
  author: reloop-labs
  docs: https://reloop.sh/docs
  llms: https://reloop.sh/docs/llms.txt
  llms-full: https://reloop.sh/docs/llms-full.txt
---

# Reloop

Reloop is email infrastructure for developers: transactional and marketing email, real-time webhooks, inbound processing, and analytics. SDKs cover Node.js, Python, PHP, Ruby, Go, Rust, Java, .NET, and a CLI.

## Documentation index

- Curated index: https://reloop.sh/docs/llms.txt
- Full corpus: https://reloop.sh/docs/llms-full.txt
- Semantic sitemap: https://reloop.sh/docs/sitemap.md
- Prefer markdown: append `.md` to any docs URL (e.g. https://reloop.sh/docs/learn/api-keys.md)

## Authentication

- Header: `x-api-key: <secret>`
- Key prefix: `rl_`
- Full secret is shown **once** at create or rotate; Reloop stores a hash and cannot redisplay the secret
- Same key works for REST (`x-api-key`) and SMTP (use the secret as the password)
- Store secrets in environment variables or a secret manager; never commit them

Primary guides:

- Agent API Keys: https://reloop.sh/docs/learn/ai/api-keys.md
- Dashboard walkthrough: https://reloop.sh/docs/learn/api-keys
- API reference (API keys): https://reloop.sh/docs/api/api-key/

## Capabilities

### API keys

Create, list, get, update (name), rotate, disable, enable, and delete organization API keys.

| Action | Method | Path |
|--------|--------|------|
| Create | POST | /api/api-key/v1/ |
| List | GET | /api/api-key/v1/ |
| Get | GET | /api/api-key/v1/:api_key_id |
| Update | PATCH | /api/api-key/v1/:api_key_id |
| Rotate | POST | /api/api-key/v1/rotate/:api_key_id |
| Disable | POST | /api/api-key/v1/disable/:api_key_id |
| Enable | POST | /api/api-key/v1/enable/:api_key_id |
| Delete | DELETE | /api/api-key/v1/:api_key_id |

Base URL: `https://reloop.sh`

- **Disable** pauses the key (requests return 401); re-enable later
- **Delete** permanently revokes the key; irreversible

### Email

- Send single and batch emails (up to 100 per batch request where supported)
- REST and SMTP
- Installable agent skill collection: `npx skills add reloop/reloop-skills`
- Skill overview: https://reloop.sh/docs/integrations/agent-skills/reloop-skill

### Domains, contacts, webhooks, templates

- Domains: create, verify DNS, configure sending/receiving
- Contacts, groups, properties, channels
- Webhooks for delivery and engagement events
- Templates for reusable content

See the API reference and learn sections in llms.txt.

### Product MCP (API actions)

Package `reloop-mcp` exposes Reloop API tools to MCP clients:

```bash
npx -y reloop-mcp
# env: RELOOP_API_KEY=rl_...
```

Docs: https://reloop.sh/docs/integrations/ai-tools/mcp-server

### Docs MCP (documentation search)

Search and retrieve Reloop documentation:

- Endpoint: https://reloop.sh/docs/mcp
- Discovery: https://reloop.sh/docs/.well-known/mcp.json

## Related installable skills

```bash
npx skills add reloop/reloop-skills
```

Includes:

- **Reloop** — send and manage email via the API
- **Agent Email Inbox** — inbound email for agents
- **Email Best Practices** — deliverability and compliance guidance

## Constraints

- Do not invent endpoints or fields not in the API reference
- Prefer markdown docs (`.md`), llms.txt, and llms-full.txt over scraping HTML
- Never log or commit full API key secrets
- Copy secrets immediately on create/rotate; they cannot be retrieved again
