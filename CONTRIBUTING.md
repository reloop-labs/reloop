# Contributing to Reloop

Thanks for taking the time to contribute. Reloop is open source and we welcome bug reports, feature requests, documentation improvements, and code contributions.

---

## Table of Contents

- [Before You Start](#before-you-start)
- [Reporting Bugs](#reporting-bugs)
- [Requesting Features](#requesting-features)
- [Development Setup](#development-setup)
- [Branch Conventions](#branch-conventions)
- [Commit Message Format](#commit-message-format)
- [Pull Request Process](#pull-request-process)
- [Code Style](#code-style)
- [Community](#community)

---

## Before You Start

- **Check existing issues** — your bug or idea may already be tracked.
- **Open an issue first** for any significant change (new feature, architectural change, or large refactor). This avoids wasted effort if the direction doesn't fit the project.
- Small fixes (typos, docs, obvious bugs) can go straight to a PR.

---

## Reporting Bugs

[Open a GitHub issue](https://github.com/reloop-labs/reloop/issues/new) and include:

1. **What happened** — a clear description of the bug
2. **Steps to reproduce** — the exact steps to trigger it
3. **Expected behaviour** — what you expected to see
4. **Environment** — OS, Bun version, Docker version, and which service(s) are affected
5. **Logs** — any relevant error output or stack traces

---

## Requesting Features

[Open a GitHub issue](https://github.com/reloop-labs/reloop/issues/new) and describe:

1. **The problem** you're trying to solve (not just the solution)
2. **Your proposed solution** and any alternatives you considered
3. **Who it helps** — use cases and audience

---

## Development Setup

Follow the [Setup Guide](https://reloop.sh/docs/setup) to run Reloop locally. The short version:

```bash
git clone https://github.com/reloop-labs/reloop.git
cd reloop
bun install
bun docker:up
bun db:push
bun db:seed
bun env:setup
bun dev
```

See [reloop.sh/docs/setup](https://reloop.sh/docs/setup) for the full walkthrough including port references, per-service setup, and environment configuration.

---

## Branch Conventions

Branch off `main` and use a descriptive name with a type prefix:

| Prefix | Use for |
|---|---|
| `feat/` | New features |
| `fix/` | Bug fixes |
| `docs/` | Documentation only |
| `refactor/` | Code changes with no feature or fix |
| `chore/` | Tooling, CI, dependency updates |
| `test/` | Adding or updating tests |

**Examples:**
```
feat/contact-import-csv
fix/webhook-retry-deadlock
docs/self-host-setup
```

---

## Commit Message Format

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <short description>

[optional body]

[optional footer]
```

**Types:** `feat`, `fix`, `docs`, `refactor`, `chore`, `test`, `perf`

**Scope** is the service or area affected (e.g. `email`, `auth`, `dashboard`, `docs`).

**Examples:**
```
feat(contacts): add CSV bulk import endpoint
fix(webhook): prevent infinite retry loop on 5xx responses
docs(setup): add Windows hosts file instructions
chore(deps): bump drizzle-orm to 0.44.3
```

Keep the subject line under 72 characters and use the imperative mood ("add", not "added" or "adds").

---

## Pull Request Process

1. **Fork** the repository and create your branch from `main`
2. **Make your changes** — keep commits focused and atomic
3. **Run checks** before pushing:
   ```bash
   bun run check   # lint + format (Biome)
   ```
4. **Open a PR** against the `main` branch
5. **Fill in the PR description** — what changed, why, and how to test it
6. **Link the related issue** using `Closes #<issue-number>` in the PR body
7. A maintainer will review your PR. Address any feedback and push additional commits to the same branch

> [!NOTE]
> PRs without a linked issue (for significant changes) or a clear description may be closed without review.

---

## Code Style

Reloop uses [Biome](https://biomejs.dev/) for linting and formatting across the entire monorepo.

```bash
bun run check        # check and auto-fix
```

A Husky pre-commit hook runs this automatically. If you bypass it, CI will catch failures.

**General guidelines:**
- TypeScript strict mode is enforced — avoid `any`
- Prefer explicit types on public function signatures
- Keep service boundaries clean — don't import across backend services directly; use the event bus (NATS) or shared packages
- New backend endpoints should include OpenAPI/Swagger annotations via Elysia decorators

---

## Community

Have questions before contributing? Reach out:

- 💬 **Discord** — [discord.gg/bHnkBcp7xR](https://discord.gg/bHnkBcp7xR) — best place for real-time discussion
- 🐙 **GitHub Issues** — [github.com/reloop-labs/reloop/issues](https://github.com/reloop-labs/reloop/issues)
- 🐦 **Twitter/X** — [@reloophq](https://x.com/reloophq)
