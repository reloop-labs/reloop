# Contacts and campaigns list improvements

## Purpose

This document proposes a focused implementation plan for the Contacts and Campaigns lists. It records the current behavior observed on `upstream/main` at `0cdfd8011faed051b5a3304a6981ef469f35c58c`, the technical gaps, the files likely to change, and acceptance criteria. This PR adds the proposal only; it does not change application behavior.

## Evaluation and technical rationale

The review focused on whether list controls affect the records shown, whether the table exposes fields useful for routine operations, and whether the list query scales beyond its initial page. The strongest issues are correctness and data loading: a filter must produce the result its UI promises, and pagination/search should run against the complete server-side dataset rather than a bounded client-side sample.

### Contacts

The status control is backed by a URL array, so it can hold more than one selected status. `ContactList` passes a status to the query only when exactly one value is selected. With multiple selected values it sends an empty status, which removes the status predicate; the displayed list can therefore include records outside the selected statuses. The contacts list endpoint currently accepts a single status and applies equality. The UI and API need one explicit shared contract.

The current list is also a basic operational view. Contact data already includes properties, groups/channels and subscription timestamps in the domain, but the list has no optional way to expose useful custom fields or subscription activity without opening each record. Any engagement metrics should be added only if the backend can provide them as a page-level aggregate; querying per contact would create an N+1 pattern and make list latency grow with page size.

### Campaigns

The campaign client requests `limit=100`; `CampaignsPage` then searches, filters and paginates that returned array in memory. The backend list controller already accepts `page`, `limit`, `search` and one `status`, and returns a total. Moving list state to that endpoint removes the 100-row ceiling and lets the UI display a total that corresponds to the active query. Multi-status selection must be represented consistently in the request and backend predicate.

The campaign model already contains recipient, sent, delivered, opened and clicked counts, while the table currently exposes only a subset of campaign execution information. Adding carefully labeled delivery/open/click columns can make the list more actionable without introducing a separate per-row request. Rates should define their denominator and show an unavailable/empty state when there is no eligible denominator; zero must not be presented as a measured rate when data is absent.

## Proposed tasks

### P0 — Make contact status filtering match the selected values

**Change**

- Define a typed multi-status query contract for contact listing, using OR semantics (`status IN (...)`) for the selected statuses.
- Pass all selected statuses from the URL-backed filter through the contacts query hook and API request.
- Apply the same predicate to returned rows and any status counts used by the list; reset the page when the selection changes.
- Preserve the unfiltered behavior when no statuses are selected.

**Likely files**

- `apps/frontend/dashboard/src/features/contacts/components/contacts/contact-list.tsx`
- `apps/frontend/dashboard/src/features/contacts/hooks/use-contacts-query.ts`
- `apps/frontend/dashboard/src/features/contacts/filters/status-filter-chip.tsx`
- `apps/backend/contacts/src/routes/contact/list-contacts/list-contacts.controllers.ts`
- `apps/backend/contacts/src/routes/contact/list-contacts/list-contacts.route.ts`
- `apps/backend/contacts/src/model/contact.model.ts` and `apps/backend/contacts/src/types/contact.type.ts`
- Related contact query/request types and focused tests adjacent to those modules.

**Acceptance criteria**

- Selecting one status returns only that status.
- Selecting two statuses returns the union of those statuses and excludes the remaining status.
- Clearing all statuses returns the full list.
- URL state, pagination reset, and list count stay in sync with the filter.

### P1 — Make campaign search, filtering and pagination server-side

**Change**

- Expand `listCampaigns` to accept page, page size, search text and selected statuses, and return `{ campaigns, total, page, limit }` (or the repository's established equivalent).
- Replace `limit=100` plus local filtering/slicing with query-keyed server requests.
- Extend the backend list controller and route validation to accept multiple statuses while preserving organization scoping and deterministic ordering.
- Reset the page when search, status or page size changes; keep query state in the URL.
- Confirm/introduce suitable indexes only after checking the actual query plan and existing indexes; do not add speculative indexes.

**Likely files**

- `apps/frontend/dashboard/src/features/campaigns/campaigns-api.ts`
- `apps/frontend/dashboard/src/features/campaigns/campaigns-page.tsx`
- `apps/frontend/dashboard/src/features/campaigns/campaigns-provider.tsx`
- Campaign list query hooks/types and `apps/frontend/dashboard/src/features/campaigns/components/table-footer.tsx`
- `apps/backend/campaigns/src/routes/campaign/campaign.controllers.ts`
- `apps/backend/campaigns/src/routes/campaign/campaign.routes.ts`
- `apps/backend/campaigns/src/model/campaign.model.ts`
- Campaign list query tests.

**Acceptance criteria**

- Search and status selection apply to the complete organization-scoped dataset, including records beyond the first 100.
- Returned total matches the active filters; page boundaries do not duplicate or omit rows under stable data.
- Search/status/page are represented in URL state and changing filters returns to page one.
- Ordering is deterministic when created timestamps tie.

### P2 — Improve the information available in each list row

**Change**

- Contacts: consider optional columns for subscription/update dates and selected custom properties. Reuse the existing column-visibility preference where possible. Keep engagement statistics out of the initial scope unless a single aggregate query can return them efficiently and with clear freshness/availability semantics.
- Campaigns: expose delivered, opened and clicked counts alongside recipient/sent counts; optionally expose rates with documented denominators. Preserve existing column visibility behavior and provide compact labels/tooltips for the definitions.
- Ensure missing metrics, pre-send campaigns and zero denominators render distinctly from measured zero values.

**Likely files**

- `apps/frontend/dashboard/src/features/contacts/components/contacts/contact-table.tsx`
- `apps/frontend/dashboard/src/features/contacts/components/contacts/contact-list.tsx`
- Contact list DTO/query types and, only if required, the contacts list controller/query.
- `apps/frontend/dashboard/src/features/campaigns/components/campaign-table.tsx`
- `apps/frontend/dashboard/src/features/campaigns/campaign-types.ts`
- Campaign response mapping in `apps/backend/campaigns/src/routes/campaign/campaign.controllers.ts`, if the list response does not already include the counters.

**Acceptance criteria**

- Columns remain readable at common desktop widths and are usable on smaller screens.
- Optional columns follow the current visibility preference mechanism.
- Metric names, numerator/denominator, and empty-data behavior are documented in the UI.
- Contact engagement data, if later added, is page-batched and does not issue one request/query per row.

## Suggested delivery order

1. Fix the contact multi-status contract and add focused API/UI coverage.
2. Move campaign list filtering and pagination to the existing paginated backend endpoint; add coverage for more than 100 rows and status combinations.
3. Add only the table columns whose response data and metric definitions are verified.

Keep the work split into reviewable changes if the campaign query/API contract and table metrics expand beyond the scope of the first two correctness tasks. Capture query latency and row counts before adding indexes or engagement aggregates.

## Validation expected for implementation

- Unit/API tests for status combinations, organization scoping, total counts, and page boundaries.
- Frontend tests for URL-state behavior, page reset on filter changes, empty states and metric rendering.
- A fixture or seeded scenario with more than 100 campaigns to prove server-side search and pagination.
- `git diff --check`, relevant package checks, and a manual review of narrow and wide table layouts.
