# Auth

Identity, sessions, API keys, and access control for Reloop.

## Language

**Organization Invitation**:
An invitation for a person to join an existing organization (team), issued by a member with invite permission.
_Avoid_: Signup invite, platform invite, invite code (those referred to a never-launched account-creation gate; removed — see `docs/adr/0001-remove-platform-signup-invites.md`)

**Session**:
A signed-in browser identity backed by Better Auth cookies, optionally validated via a short-TTL cache.

**API Key**:
A long-lived credential for programmatic access, scoped to a user and organization.

### API Key planes

| Plane | Owner | Responsibility |
|-------|--------|----------------|
| **Data plane (verify)** | `@reloop/auth` (`apikey/validate`, credential cache) | Extract → format gate → hash → cache → DB (`enabled`, not expired) → lean AuthContext |
| **Control plane (manage)** | `apps/backend/api-key` (`createApiKeyCredential`) | create / rotate / enable / disable / delete / update; fail-closed cache invalidate on revoke |

Secrets are stored **hashed** (SHA-256). Plaintext is returned only on create/rotate. Verify cache is **acceleration only**; revoke (disable/delete/rotate) **fail-closed** clears cache. Default cache TTL is 30 days; writes also cap TTL by `expiresAt` when set.

**Enforced on verify today:** format, hash match, `enabled`, `expiresAt` (when non-null).

**Not enforced on verify (schema/API metadata only until product owns them):** `permissions`, per-key `rateLimit*`, `remaining`, `refill*`. Management rate limits use a separate Redis namespace on the control plane.

**Better Auth `apiKey` plugin:** loaded on the auth server for schema compatibility (`defaultPrefix: "rl"`). Product create/rotate/validate go through Reloop modules (`rl_prod` prefix + custom lifecycle). Do not use BA endpoints as a second writer of credential material.

**AuthContext**:
The lean identity resolved by shared request-auth middleware for a request: `userId`, `organizationId` (when required), `platformRole`, and `authType` (`session` | `apikey` | `internal`). Optional `apiKeyId` when authenticated via API Key. Profile fields (`userEmail` / `userName` / `userImage`) appear only on profile-capable macros (`authSupport`, `authCollab`).

**platformRole**:
The Better Auth platform user role on AuthContext (`user` or Platform Admin `super-admin`). Not an organization membership role (owner / admin / member).

**Platform Admin**:
A Reloop operator identity (`super-admin` role), distinct from organization roles (owner / admin / member).

**Internal service auth**:
Service-to-service authentication via headers `x-internal-secret`, `x-user-id`, and `x-organization-id`. Produces AuthContext with `authType: internal`. Enabled only when the request-auth plugin is configured with `internalSecret`.

## Request-auth macros

| Macro | Behavior |
|-------|----------|
| `auth` | Session or API Key; fail-closed organization |
| `authSession` | Session only; fail-closed organization (rejects API keys) |
| `authNoOrg` | Session or API Key; organization optional |
| `authKey` | API Key only; fail-closed organization |
| `authAdmin` | Session; Platform Admin required |
| `authInternal` | Internal headers only |
| `authKeyInternal` | API Key, then internal |
| `authSupport` | Session; org optional; `isPlatformAdmin` + optional profile |
| `authCollab` | Session or API Key; fail-closed org; profile fields |

Mail composes pure resolvers for API key → internal → session (no package triple macro).
