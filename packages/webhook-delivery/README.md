# `@reloop/webhook-delivery`

Pure helpers for Reloop outbound webhooks:

- Canonical envelope `{ id, type, created_at, data }`
- HMAC-SHA256 signing (`Reloop-Signature`)
- SSRF-safe HTTP POST with DNS pin + timeout
- Fixed retry schedule (7 attempts)

Used by `be-workflow` (dispatcher + worker) and `be-webhook` (manual replay enqueue).
