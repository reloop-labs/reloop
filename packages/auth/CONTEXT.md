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

**AuthContext**:
The lean identity resolved by shared middleware for a request: user, organization (when required), role, and auth type (session or API key).

**Platform Admin**:
A Reloop operator identity (`super-admin` role), distinct from organization roles (owner / admin / member).
