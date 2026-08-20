# @reloop/email-validation

Disposable, role and free-provider detection for email addresses. Pure
in-memory lookups — no network calls, no database, no I/O beyond reading the
vendored catalogue once per process.

Used by the [tools service](../../apps/backend/tools) behind
`/api/tools`, and available to any other service that wants to reject
throwaway addresses at the point they arrive.

## Usage

```ts
import { evaluate, warmCatalogue } from "@reloop/email-validation";

// Optional: pay the ~60ms catalogue parse at boot instead of on first request.
warmCatalogue();

const result = evaluate("someone@mailinator.com");

result.verdict;          // "disposable"
result.isDisposable;     // true
result.disposableMatch;  // { kind: "exact", domain: "mailinator.com" }
result.isRoleAddress;    // false
result.isFreeProvider;   // false
```

`evaluate` accepts a full address or a bare domain, and tolerates the wrappers
people paste: `mailto:` links, `<angle brackets>`, surrounding whitespace,
mixed case, and a trailing FQDN root dot.

### It returns facts, not prose

`EvaluationResult` carries no user-facing copy. That is deliberate: the
marketing tool, a signup guard and an API error all need different wording for
the same finding, and baking one voice into the package would force the others
to unpick it. Callers own presentation.

### Verdicts

| Verdict | Meaning |
|---|---|
| `invalid` | Failed RFC 5322 shape checks — nothing was looked up |
| `disposable` | Domain is a known throwaway mailbox provider |
| `risky` | Deliverable, but a shared team inbox rather than a person |
| `deliverable` | No disposable or role signals |

`disposable` outranks `risky`: a throwaway role address is still throwaway.

## Data

```text
data/
  upstream/   vendored from BillionVerify/disposable — refresh script overwrites
  local/      Reloop's curation — the refresh script never touches this
```

| File | Contents |
|---|---|
| `upstream/domains.txt` | ~210k exact disposable domains |
| `upstream/wildcards.txt` | Wildcard suffixes (currently empty upstream) |
| `upstream/exceptions.txt` | Upstream allowlist |
| `local/wildcards.txt` | Our wildcard suffixes |
| `local/exceptions.txt` | Our allowlist — where false-positive fixes go |
| `local/free-providers.txt` | Consumer mailbox providers |
| `local/role-local-parts.txt` | Shared-inbox local parts |

The split matters: a refresh must never silently drop an allowlist entry added
for a real customer. When a legitimate domain is wrongly flagged, add it to
`local/exceptions.txt` — never edit the vendored upstream file.

Lookup order is **exceptions → exact → wildcard**, matching upstream's
contract. The allowlist wins outright.

Wildcard entries match the base domain and every subdomain: `*.foo.example`
covers `foo.example` and `a.b.foo.example`, but not `notfoo.example` — matching
is on label boundaries, not raw string suffixes. Note that a subdomain of an
*exactly* listed domain is **not** flagged; only the listed host is known-bad,
and guessing further is how real mail gets blocked.

## Refreshing the catalogue

```bash
bun run --filter=@reloop/email-validation refresh            # fetch and write
bun run --filter=@reloop/email-validation refresh --dry-run  # show the diff only
```

Prints an added/removed summary per file and commits nothing. It refuses to
overwrite `domains.txt` with fewer than 100k entries, so a truncated download
or an error page cannot quietly gut the catalogue.

Upstream refreshes hourly; this vendored copy moves when someone runs the
script. Re-run it periodically and commit `data/upstream/`.

## Cost

~210k domains: **~60ms** to parse, **~25MB** of heap, O(1) exact lookups and
O(labels) wildcard lookups. The sets are built once per process on first use.

## Attribution

Catalogue data comes from
[BillionVerify/disposable](https://github.com/BillionVerify/disposable) (MIT).
Full notice in [`data/upstream/NOTICE.md`](data/upstream/NOTICE.md).
