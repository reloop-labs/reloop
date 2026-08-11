# Validation Service API

Public email-address validation: disposable domains, role addresses and free
consumer providers. Powers the [temp email checker](https://reloop.sh/tools/temp-email-checker).

## 🔗 Quick Links

- 📚 **Documentation**: [Setup Guide](https://reloop.sh/docs/setup/backend/validation)
- 🌐 **Production API**: [API Base](https://reloop.sh/api/validation)
- 📜 **OpenAPI Spec**: [OpenAPI](https://reloop.sh/api/validation/openapi)

## Endpoints

| Method | Path | Purpose |
|---|---|---|
| `POST` | `/api/validation/v1/check` | Check an address or bare domain |
| `GET` | `/api/validation/v1/check?email=…` | Same, for links and `curl` |

```bash
curl -X POST https://local.reloop.sh/api/validation/v1/check \
  -H 'content-type: application/json' \
  -d '{"email":"you@mailinator.com"}'
```

```json
{
  "input": "you@mailinator.com",
  "kind": "email",
  "domain": "mailinator.com",
  "verdict": "disposable",
  "isDisposable": true,
  "disposableMatch": { "kind": "exact", "domain": "mailinator.com" },
  "isRoleAddress": false,
  "isFreeProvider": false,
  "signals": { "syntax": "pass", "disposable": "fail", "role": "pass", "freeProvider": "pass" }
}
```

Verdicts are `invalid`, `disposable`, `risky` (a real but shared team inbox) or
`deliverable`. Detection logic and the domain catalogue live in
[`@reloop/email-validation`](../../../packages/email-validation).

## How it differs from the other services

- **Public.** No API key, no session, no `auth: true` macro — the checker takes
  no account. Abuse is handled by a per-IP limiter (60 requests/minute,
  failing open if Redis is down).
- **Open CORS.** Safe here specifically because the endpoint accepts no
  credentials and returns nothing user-specific.
- **No User-Agent requirement on `/v1/check`.** Server-side fetch clients send
  no UA by default and this endpoint is meant to be called from other people's
  applications.
- **Stateless.** No Postgres, no NATS. Redis backs rate limiting only.
- **Nothing is stored.** Addresses are never written anywhere, and only the
  domain and verdict reach the logs — never the local part. The tool page
  promises this, so keep it true when adding code here.

## Dev

```bash
bun run be:validation:dev
```

Or via root `bun run dev` / `bun run backend:dev`. Serves on **8026**, proxied
at `/api/validation` (see `local/Caddyfile`).

The service loads ~210k domains into memory at boot (~60ms, ~25MB). `/health`
reports `catalogueSize` and fails if the catalogue is empty.

## Refreshing the catalogue

```bash
bun run --filter=@reloop/email-validation refresh
```

See the [package README](../../../packages/email-validation/README.md).

---

## 🔗 Resources & Community

- 📚 **Docs**: [Documentation](https://reloop.sh/docs/setup/backend/validation)
- 🤖 **Discovery**: [Discovery Spec](https://reloop.sh/api/validation/agent-card.json)
- 📖 **OpenAPI**: [OpenAPI Spec](https://reloop.sh/api/validation/openapi)
- 🐙 **GitHub**: [Source Code](https://github.com/reloop-labs/reloop)
- 🆘 **Support**: [Get Help](https://reloop.sh/support)
- 💬 **Discord**: [Join Chat](https://discord.gg/bHnkBcp7xR)
- 🐦 **Twitter**: [Follow Us](https://x.com/reloophq)
