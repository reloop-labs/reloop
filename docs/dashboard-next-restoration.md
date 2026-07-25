# Dashboard Next.js restoration

## Frozen baseline

- Base branch: `origin/main`
- Start SHA: `56e5fb2bc8be2eb393138742d13fdc4d8e10810b`
- Historical baseline before the TanStack Start migration:
  `2b9d2a090`
- Commits audited since the historical baseline: 281
- Migration strategy: forward counter-migration; the start SHA must remain an
  ancestor of the restoration branch.

The current `src/features` tree is the source of truth. Historical Next.js
files may be consulted for framework structure or surviving behavior, but
intermediate product implementations must not be restored.

## Commit-ledger dispositions

The adjacent `dashboard-next-commit-ledger.tsv` contains one row for every
audited commit. Its attention level maps to the migration workflow:

| Attention | Disposition |
| --- | --- |
| 0 | Preserved by ancestry or superseded in the frozen tree |
| 1 | Mechanical framework port |
| 2 | Semantic parity scenario |
| 3 | Blocking migration requirement |

Mixed frontend/backend commits retain their backend, database, API, and shared
contract changes unchanged.

## Preservation fingerprints

The frozen tree was fingerprinted before the counter-migration. Directory
fingerprints are SHA-256 hashes of a path-sorted manifest containing each
file's Git mode, blob ID, and repository-relative path.

| Scope | Frozen Git tree/blob | Frozen manifest SHA-256 | Restoration manifest SHA-256 |
| --- | --- | --- | --- |
| `src/features` | `e564d55f272912558f32ed0309aa05fc9b7116d3` | `ad77968588ca75b1d49ffaf1ac7019a66ae55d28f140c642b519142c7f5b6a70` | `4fe4d36a6628008773af995a045339491bd8760c417c860d61635bed9e659cdc` |
| `src/components` | `9e7505c4c931b6d5cb3502fd7e2941b73db213a5` | `259de85417e9194e4a7640bc997f91a982ae5adc213867795f409d22266350c1` | `d99b2777cb159c48cf64d935370419f9224929538c34559b4d2e2675bc068f6a` |
| `src/styles.css` | `7767ecb6fc5c708ee414cd893225330b1383a2f8` | `2691d53facd2eed263f9c324ff4040f0abf919482796d1ee5149c048696d36d0` | unchanged |
| `public` | `3d3abff31c60d43445228ba5a9982f5101743b20` | `ae84ff07a112ee3c7cbd64f4ad7e5ceb02dcc5c08ff707e59a92266139a61a58` | unchanged |

The source review found 108 files whose only change is the mechanical
`@tanstack/react-router` → `#/lib/navigation` import replacement. The reviewed
exceptions are limited to:

- `NEXT_PUBLIC_*` environment access in API samples and template
  collaboration;
- direct Nuqs query-parameter access for login, signup, and invite;
- Domain Connect callback restoration in domain detail and onboarding;
- the hydration-safe loading indicator;
- strict Next TypeScript narrowing in inbox, API-key, CSV/contact, and template
  code;
- focused migration tests.

No backend controller, database migration, API path, schema, query key, shared
contract, global stylesheet, or public asset changed.

## Semantic parity evidence

All 77 attention-level-2 ledger rows map to evidence through their `tags`
column. A row can map to more than one gate.

| Ledger tag | Required evidence |
| --- | --- |
| `UNIVERSAL_REACT` | Start SHA remains an ancestor; preservation fingerprint/diff review; dashboard TypeScript and Vitest |
| `ROUTER_LAYOUT` | 59-route contract; App Router provider-lifetime tests; production anonymous deep-link and browser-history suite |
| `CLIENT_SSR` | Next prerender of all 63 generated entries; hydration-random and timer-cleanup tests; browser suite rejects console/page errors |
| `ENV_BUILD_DEPLOY` | unset and explicit `NEXT_PUBLIC_*` builds; standalone image health/static/deep-link smoke |
| `SHARED_BACKEND` | zero diff under `apps/backend` and `packages`; browser tests intercept rather than mutate backend APIs |
| `TEST_DOCS` | consolidated SHA-validated commit ledger and route-contract documentation |

Rows describing behavior superseded in the frozen tree are resolved by their
ledger `migration_action`: the frozen final implementation remains
authoritative and the intermediate implementation is not resurrected.

## Blocking-commit implementation sign-off

The eight commits fetched after the original audit add one blocker, so this
restoration signs off 18 rather than the original 17.

| Commit | Requirement | Implementation evidence |
| --- | --- | --- |
| `66307826a` | Counter-migrate the framework without replay | Start SHA ancestry, Next foundation, zero forbidden runtime references |
| `0aeac9984` | Dependencies and public environment compatibility | Current dependency manifest, `NEXT_PUBLIC_*` mapping, shared auth fallback retained |
| `b9d55abff` | Arbitrary runtime port and health | Standalone `PORT`/`HOSTNAME`, `/dashboard/healthz`, container health check |
| `3db63e687` | Preserve `/dashboard` through the proxy | Existing non-stripping Caddy handler and prefixed deep-link/static browser checks |
| `d32f12ce1` | OTP/magic-link verification | `/verify` wrapper, string-preserving URL unit test, production route crawl |
| `9a0f8b40e` | Route/layout parity | Exact 59-route contract, 41 metadata exports, loading/error/not-found boundaries |
| `c186b5f61` | Inbox provider and draft lifetimes | Full-screen inbox layouts and nested mailbox provider contract |
| `649808641` | Reconcile stale Domain Connect detail behavior | Shared callback consumer installed on the live detail page |
| `c104005d6` | Preserve initial-load work | Shell-first dashboard skeleton, persistent organization provider, stable prerender/hydration |
| `65ffc0e96` | Dedicated API-key creation page | `/api-keys/create` App Router page and deep-link coverage |
| `fc9607b11` | Keep final DNS/onboarding UI | Frozen feature tree retained; no stale UI restored |
| `a3b30613e` | Preserve force-show/verifying DNS behavior | Frozen DNS banner retained unchanged |
| `1aa6b50b7` | Preserve final DNS action/navigation behavior | Frozen feature tree plus Next navigation adapter |
| `0ebfa6c01` | Preserve hold-to-delete behavior | Frozen component retained; only its navigation import changed |
| `9101c12b6` | Reconcile domain tabs and callback cleanup | Live detail feature plus tested callback-key cleanup |
| `c06c1dcf5` | Use current Next/Sharp resolution | Current catalog Next and lockfile Sharp resolution; production build |
| `02a63b576` | Preserve full-screen contact creation | Dedicated route with its own support AI panel and no dashboard chrome |
| `4146e8d77` | Preserve the final agent-inbox page | Dashboard route owns `AgentInboxProvider` and renders the frozen `AgentInboxPage` |

## Required parity gates

- Every canonical dashboard URL has an App Router page, redirect, or intentional
  compatibility redirect.
- Feature, style, and asset changes are limited to navigation, client
  boundaries, environment access, and explicitly recorded parity fixes.
- Search keys, dynamic parameters, history behavior, provider lifetimes,
  metadata, authentication redirects, streams, WebSockets, and browser storage
  retain their frozen-tree behavior.
- Production builds contain no TanStack Router/Start, Nitro, generated route
  tree, dashboard `VITE_*`, or `import.meta.env` runtime references.
- Standalone Docker and real ingress checks cover `/dashboard`, deep links,
  `/dashboard/_next`, `/dashboard/healthz`, unprefixed `/api`, runtime `PORT`,
  and runtime `HOSTNAME`.

The repository can enforce application, build, and container gates. The real
staging ingress, authentication providers, seeded backend flows, and both
deployed WebSocket endpoints remain mandatory pre-cutover checks because they
depend on deployment credentials and external state.

## Rollback

Deployment must publish an immutable image for the restoration SHA. Rollback
restores the previous immutable dashboard image and the previous ingress
configuration; no data rollback is required.
