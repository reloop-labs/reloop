<div align="center">

<img src="apps/frontend/web/src/app/icon0.svg" alt="Reloop logo" width="64" height="64">

# Reloop

**Open-source email infrastructure — send, receive, and manage emails at scale.**

Self-host on your own servers or use the hosted service from Reloop Labs.\
No vendor lock-in. Full transparency. Sub-900ms delivery latency.

[![License](https://img.shields.io/github/license/reloop-labs/reloop?style=flat-square)](LICENSE)
[![GitHub Stars](https://img.shields.io/github/stars/reloop-labs/reloop?style=flat-square)](https://github.com/reloop-labs/reloop)
[![Discord](https://img.shields.io/badge/Discord-Join%20Chat-5865F2?style=flat-square&logo=discord&logoColor=white)](https://discord.gg/bHnkBcp7xR)
[![Twitter](https://img.shields.io/badge/Twitter-Follow-000000?style=flat-square&logo=x&logoColor=white)](https://x.com/reloophq)

[Website](https://reloop.sh) · [Documentation](https://reloop.sh/docs) · [Hosted Sign-up](https://reloop.sh/dashboard/signup) · [Discord Community](https://discord.gg/bHnkBcp7xR)

</div>

---

## What is Reloop?

Reloop gives you the same capabilities as SendGrid, Mailchimp, Resend, and Loops — but the codebase is open source and fully self-hostable.

- **Transactional email** — REST API and SMTP relay for programmatic sending
- **Email campaigns** — broadcast and sequence campaigns with audience segmentation
- **Inbound email** — receive, parse, and process incoming mail at your own domain
- **Email templates** — a visual drag-and-drop editor built for developers and marketers
- **Real-time analytics** — open rates, click rates, bounces, and delivery events powered by ClickHouse
- **Webhooks** — push delivery events to your own endpoints the moment they happen
- **Contacts & lists** — manage subscribers, tags, and suppression lists
- **Workflows** — automate multi-step email sequences triggered by user actions
- **API keys & auth** — granular API key management with team-level permissions

Use Reloop as a **hosted service** (Reloop Labs handles the infrastructure) or **self-host** on Docker, Kubernetes, or bare metal. Same APIs. Same features. Your choice.

---

## Why Reloop?

| | Reloop | SendGrid / Mailchimp / Resend |
|---|---|---|
| Open source | ✅ | ❌ |
| Self-hostable | ✅ | ❌ |
| Vendor lock-in | ❌ None | ✅ Locked in |
| Delivery latency | ~900ms | Varies |
| Transparent pricing | ✅ | ❌ |
| Data stays on your servers | ✅ (self-hosted) | ❌ |

---

---

## Quick Start

```bash
git clone https://github.com/reloop-labs/reloop.git
cd reloop
```

For full setup instructions — prerequisites, environment config, Docker services, database setup, and per-service commands — see the **[Setup Guide →](https://reloop.sh/docs/setup)**

| Setup Doc | Description |
|---|---|
| [Setup overview](https://reloop.sh/docs/setup) | Full step-by-step local setup |
| [Architecture overview](https://reloop.sh/docs/setup/overview) | Monorepo layout and tech stack |
| [Port reference](https://reloop.sh/docs/setup/port) | All local ports and gateway routes |
| [Backend services](https://reloop.sh/docs/setup/backend/auth) | Per-service setup guides |
| [Frontend apps](https://reloop.sh/docs/setup/frontend/web) | Web, dashboard, docs, links |

---

## Hosted Service

Don't want to manage infrastructure? [Sign up for Reloop](https://reloop.sh/dashboard/signup) — a fully managed hosted version of this exact codebase. Same features, zero ops overhead.

---

## Contributing

Read [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on reporting bugs, requesting features, branch conventions, commit format, and the pull request process.

---

## Community & Support

- 💬 **Discord** — [Join the community](https://discord.gg/bHnkBcp7xR)
- 🐦 **Twitter/X** — [Follow @reloophq](https://x.com/reloophq)
- 🐙 **GitHub Issues** — [Report bugs or request features](https://github.com/reloop-labs/reloop/issues)
- 📚 **Documentation** — [reloop.sh/docs](https://reloop.sh/docs)
- 🆘 **Support** — [reloop.sh/support](https://reloop.sh/support)

---

## License

Reloop is open source under the [Business Source License](LICENSE).

---

<div align="center">

Built by [Reloop Labs](https://reloop.sh) · Give us a ⭐ if Reloop saves you from vendor lock-in.

</div>
