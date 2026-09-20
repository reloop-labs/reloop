# Security Policy

The Reloop team takes security seriously — Reloop handles email sending, receiving, API keys, webhooks, and multi-tenant data, so a vulnerability here can have outsized impact. Thank you for reporting responsibly.

> **Do not open a public GitHub issue for a suspected vulnerability.** Use one of the private channels below.

## Supported Versions

Reloop is pre-1.0 and moves fast. Security fixes are applied to `main` and released forward.

| Version | Supported with security updates |
|---|---|
| `main` (latest) | ✅ |
| Latest tagged release | ✅ (patched via `main`; please retest on `main` before reporting) |
| Older releases / forks | ❌ — please upgrade and retest |

If you are self-hosting, pull the latest `main` or the latest tagged release before reporting — your issue may already be fixed.

## Reporting a Vulnerability

**Preferred (private, tracked):** [GitHub Private Vulnerability Reporting](https://github.com/reloop-labs/reloop/security/advisories/new) — click **Report a vulnerability** on the [Security tab](https://github.com/reloop-labs/reloop/security).

**Alternative:** email **reloop.sh@gmail.com** with subject `[SECURITY] <short description>`.

Encrypted reports are welcome — request our PGP key in your initial email and we will reply with it.

### What to include

1. **Description** — what is broken and why it matters
2. **Impact** — what an attacker can do (e.g. read another tenant's mail, bypass auth, SSRF to internal metadata, stored XSS, open redirect enabling phishing)
3. **Affected scope** — service/app/package, commit SHA or version, configuration (self-hosted vs. hosted)
4. **Reproduction** — step-by-step instructions, ideally against a local stack (`bun setup` / `bun dev`), plus a minimal PoC (request, payload, script)
5. **Logs / output** — relevant responses, stack traces (redact secrets and PII)
6. **Suggested fix** (optional) — if you have one

One issue per report, please. If you are unsure whether something is a vulnerability, report it anyway — we would rather triage a non-issue than miss a real one.

### Our commitment

- **Acknowledge** within **3 business days**
- **Triage and severity assessment** within **7 days**, with an estimated fix timeline
- **Fix and coordinated disclosure** within **90 days** of the report — we will keep you updated if a fix needs longer (e.g. coordinated dependency or migration work)
- We will credit you in the advisory / release notes unless you ask to stay anonymous

Severity is assessed using CVSS as a guide, weighted by Reloop-specific impact: tenant isolation bypass, authentication/authorization bypass, SSRF / local file read, arbitrary email sending or spoofing via Reloop, stored XSS affecting other users, and secrets exposure are treated as high severity.

### Coordinated disclosure

Please give us a reasonable window to fix the issue before any public disclosure, and do not disclose it to third parties in the meantime. We will notify you when a fix is released so we can publish details together (typically via a [GitHub Security Advisory](https://github.com/reloop-labs/reloop/security/advisories) and the CHANGELOG).

## Scope

### In scope

- This repository (`reloop-labs/reloop` on the default branch):
  - Backend services (`apps/backend/*`) — auth, API keys, mail/SMTP, inbox, webhooks, uploads, templates, workflows, domains, contacts, campaigns
  - Frontend apps (`apps/frontend/*`) — web, dashboard, console, docs, links
  - Shared packages (`packages/*`) — auth/session handling, webhook delivery, email validation
  - Self-host installer and Docker configuration (`install/`, Dockerfiles, compose files)
- Vulnerability classes we care about most in this codebase:
  - Broken access control / cross-tenant data access (org switching, API keys, session cache)
  - Authentication or session flaws
  - SSRF (webhook delivery, attachment fetch, link probes, render/template fetch, tracking redirects)
  - Local file read / path traversal, command injection (template rendering, SMTP Lua policy)
  - Stored / reflected XSS (template editor, inbox thread view, campaign content)
  - Open redirects enabling phishing via tracking / auth / link endpoints
  - Secrets exposure, insecure defaults in self-host setup

### Out of scope

- Third-party services and dependencies without a working PoC against Reloop itself (report upstream; a `bun outdated` version number alone is not a report)
- Social engineering, phishing, physical attacks, or attacks requiring a compromised maintainer account or developer machine
- Volumetric DDoS
- Email deliverability / reputation outcomes (spam-folder placement, SPF/DKIM/DMARC scoring of third-party domains) without a Reloop code flaw
- Findings from automated scanners without a demonstrated, in-scope impact
- `packages/email-validation/data/upstream/domains.txt` data staleness (use the disposable-domains sync issue template instead)
- Vulnerabilities in a self-hosted deployment caused by operator misconfiguration (exposed Docker socket, weak secrets, missing TLS) — see hardening guidance below
- The hosted `reloop.sh` production environment as a test target (see ground rules)

There is currently **no paid bug-bounty program**. We offer public credit and our thanks.

## Ground rules

Because Reloop *is* email infrastructure, reckless testing can harm others. When researching:

1. **Test locally.** Use `bun setup` / `bun dev` or the self-host installer on your own machine/VPS — not the hosted `reloop.sh` service.
2. **Do not send spam or phishing**, probe third-party inboxes, or attempt delivery to addresses you do not control.
3. **Do not access, modify, or exfiltrate anyone else's data** — stop at proof of access (e.g. show the query returned a row from another tenant; do not dump it).
4. **Do not degrade availability** — no load testing, no mail loops, no mass webhook triggers.
5. **Do not run automated scanners** against hosted infrastructure.
6. Delete any data you obtained beyond what is needed for the report, and include a note that you did so.

Reports that follow these rules will not result in action against your GitHub account. If you are ever unsure, ask at reloop.sh@gmail.com before proceeding.

## If you self-host Reloop

- Keep your deployment on the latest release and rotate secrets after upgrading if a security advisory says so
- Generate strong production secrets (the installer does this — do not reuse dev defaults), keep `.env` / compose secrets out of git and backups
- Terminate TLS correctly (the installer provisions certificates — do not expose backend ports directly)
- Restrict ingress to admin/workbench/debug endpoints; never expose Docker, NATS, Postgres, or Redis to the internet
- Treat API keys like passwords: least-privilege scopes, per-integration keys, revoke on team changes

## Related

- Bug reports (non-security): [CONTRIBUTING.md](CONTRIBUTING.md#reporting-bugs)
- Changelog with security fixes: [CHANGELOG.md](CHANGELOG.md)
- Self-hosting guide: [https://reloop.sh/docs/self-host/vps](https://reloop.sh/docs/self-host/vps)
