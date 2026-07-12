# Domain Docs

How the engineering skills should consume this repo's domain documentation when exploring the codebase.

This is a **multi-context** monorepo: contexts live under `apps/backend/*`, `apps/frontend/*`, and `packages/*`, coordinated by a root `CONTEXT-MAP.md`.

## Before exploring, read these

- **`CONTEXT-MAP.md`** at the repo root if it exists — it points at one `CONTEXT.md` per context. Read each one relevant to the topic.
- **`CONTEXT.md`** inside the specific context you're working in (e.g. `apps/backend/auth/CONTEXT.md`, `packages/db/CONTEXT.md`).
- **`docs/adr/`** at the root — system-wide decisions. Also check context-scoped `apps/*/<service>/docs/adr/` and `packages/<pkg>/docs/adr/` for decisions local to the area you're about to work in.

If any of these files don't exist, **proceed silently**. Don't flag their absence; don't suggest creating them upfront. The `/domain-modeling` skill (reached via `/grill-with-docs` and `/improve-codebase-architecture`) creates them lazily when terms or decisions actually get resolved.

## File structure

Multi-context repo (root `CONTEXT-MAP.md` points at per-context `CONTEXT.md` files):

```
/
├── CONTEXT-MAP.md
├── docs/adr/                              ← system-wide decisions
├── apps/
│   ├── backend/
│   │   ├── auth/
│   │   │   ├── CONTEXT.md
│   │   │   └── docs/adr/                  ← context-specific decisions
│   │   └── inbox/
│   │       ├── CONTEXT.md
│   │       └── docs/adr/
│   └── frontend/
│       └── dashboard/
│           └── CONTEXT.md
└── packages/
    ├── db/
    │   └── CONTEXT.md
    └── auth/
        └── CONTEXT.md
```

## Use the glossary's vocabulary

When your output names a domain concept (in an issue title, a refactor proposal, a hypothesis, a test name), use the term as defined in the relevant `CONTEXT.md`. Don't drift to synonyms the glossary explicitly avoids.

If the concept you need isn't in the glossary yet, that's a signal — either you're inventing language the project doesn't use (reconsider) or there's a real gap (note it for `/domain-modeling`).

## Flag ADR conflicts

If your output contradicts an existing ADR, surface it explicitly rather than silently overriding:

> _Contradicts ADR-0007 (event-sourced orders) — but worth reopening because…_
