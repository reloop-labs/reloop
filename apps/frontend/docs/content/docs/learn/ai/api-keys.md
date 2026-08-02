# API Keys (agent guide)

> Prefer this guide over the human dashboard page at `/docs/learn/api-keys`. Use a language-specific file below for runnable SDK samples.

## Auth

- Send `x-api-key: <secret>` on every request.
- Secrets are prefixed with `rl_`.
- Store secrets in env vars / a secret manager. Never commit them.
- The full secret is returned **once** on create and rotate. Reloop stores a hash; it cannot be retrieved again.

## Rules

- **Disable** pauses the key (requests return 401); you can re-enable later.
- **Delete** permanently revokes the key; irreversible.
- API keys work for REST (`x-api-key`) and SMTP (password = secret).
- Creating or managing keys requires an existing authenticated API key.

## Endpoints

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

## Language guides

- [Node](./api-keys.node.md)
- [cURL](./api-keys.curl.md)
- [Python](./api-keys.python.md)
- [PHP](./api-keys.php.md)
- [Java](./api-keys.java.md)
- [.NET](./api-keys.dotnet.md)
- [Go](./api-keys.go.md)
- [Rust](./api-keys.rust.md)
- [Ruby](./api-keys.ruby.md)

## Dashboard (humans)

Dashboard UI walkthrough (GIFs, tabs): [/docs/learn/api-keys](https://reloop.sh/docs/learn/api-keys)
