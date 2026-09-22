# Launch Submitter (local)

Isolated sidecar under `tools/launch-submitter/`. **Does not modify Reloop app or package logic.** First goal: submit Reloop to free directories.

Surfaces (same core):

| Surface | How |
|---------|-----|
| CLI | `bun run src/cli.ts …` |
| MCP | `bun run src/mcp.ts` (stdio for Cursor) |
| HTTP + UI | `bun run src/http.ts` → http://127.0.0.1:8787 |

## Setup

```bash
cd tools/launch-submitter
bun install
bunx playwright install chromium
```

## CLI

```bash
bun run src/cli.ts products
bun run src/cli.ts directories
bun run src/cli.ts plan --product reloop
bun run src/cli.ts run --product reloop --dry-run
bun run src/cli.ts login          # sign into sites once (persistent profile)
bun run src/cli.ts run --product reloop --only saashub,launching-next
bun run src/cli.ts status
bun run src/cli.ts resume         # after captcha / login
```

On captcha/login/paywall the runner pauses, shows a macOS notification, plays a short sound, and waits for `resume`.

## MCP (Cursor)

Add to Cursor MCP settings (project or user):

```json
{
  "mcpServers": {
    "launch-submitter": {
      "command": "bun",
      "args": ["run", "/ABS/PATH/TO/reloop/tools/launch-submitter/src/mcp.ts"]
    }
  }
}
```

Tools: `list_products`, `list_directories`, `plan_submissions`, `run_submissions`, `get_status`, `resume_submission`.

Example chat: “Plan free directory submissions for product reloop, then dry-run.”

## UI

Uses Reloop design system packages (`@reloop/ui`, `@reloop/tailwind`) for the operator console — buttons, table, badges, alerts, logo. That is **UI kit only**, not Reloop product/business logic (no dashboard app, no Reloop APIs). The runner still does not change Reloop apps.

```bash
# terminal 1 — API (default :8787)
bun run src/http.ts

# terminal 2 — Reloop-styled UI (Vite)
bun run ui
open http://localhost:5173
```

If 5173 is busy, Vite picks the next port (e.g. 5174) — use the URL it prints.

Plan / Dry run / Run all / Resume from the browser. When status is `needs_human`, a warning alert appears (plus OS notification + sound).

## Data layout

- `products/*.json` — product packs (start with `reloop.json`)
- `directories/*.json` — free-only playbooks (~94 from the [public launch list](https://x.com/hridoyreh/status/2101574360385360122); selectors may need retuning)
- `directories/_skipped-paid.json` — BetaList, Microlaunch, GetApp (no simple free lane)
- `data/browser-profile/` — persistent Chromium profile (gitignored)
- `data/runs/` — run JSON + screenshots (gitignored)

To re-add from the 94 list after edits: `bun run scripts/add-94-list.ts` (skips files that already exist).

## Adding a directory

1. Copy an existing file in `directories/`.
2. Set `pricing: "free"` only.
3. Fill `steps` (`goto`, `fill`, `click`, `humanGate`, …).
4. `bun run src/cli.ts plan --product reloop` then a targeted `--only` run.

## Isolation rules

- All code stays in this folder.
- No imports from Reloop runtime packages.
- Reloop is just another product pack (`products/reloop.json`).
