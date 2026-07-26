<div align="center">

<img src="apps/frontend/web/src/app/icon0.svg" alt="Reloop logo" width="64" height="64">

# Reloop

**Open-source email infrastructure — send, receive, and manage emails at scale.**

Self-host on your own servers or use the hosted service from Reloop Labs.\
No vendor lock-in. Full transparency. No proprietary black boxes.

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Bun](https://img.shields.io/badge/Bun-000000?style=for-the-badge&logo=bun&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
[![GitHub Stars](https://img.shields.io/github/stars/reloop-labs/reloop?style=for-the-badge)](https://github.com/reloop-labs/reloop)

[Website](https://reloop.sh) · [Documentation](https://reloop.sh/docs) · [Hosted Sign-up](https://reloop.sh/dashboard/signup) · [Discord](https://discord.gg/bHnkBcp7xR)

</div>

---

## What is Reloop?

Reloop gives you the same capabilities as SendGrid, Mailchimp, Resend, and Loops — but the codebase is open source and fully self-hostable.

- **Transactional email** — REST API and SMTP relay for programmatic sending
- **Email campaigns** — broadcast and sequence campaigns with audience segmentation
- **Inbound email** — receive, parse, and process incoming mail at your own domain
- **Email templates** — a visual drag-and-drop editor built for developers and marketers
- **Real-time analytics** — open rates, click rates, bounces, and delivery events stored in PostgreSQL
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
| Transparent pricing | ✅ | ❌ |
| Data stays on your servers | ✅ (self-hosted) | ❌ |

---

## Who This Is For

**Developers** who need a reliable email API without vendor lock-in — integrate via REST or SMTP, manage sending domains, and receive webhook events for every delivery state.

**DevOps and platform teams** who want full control over their email infrastructure — run Reloop on your own servers, inspect every component, and keep all data inside your network.

**Marketing and growth teams** who need campaign tools and audience management without depending on a proprietary SaaS platform that can change pricing or terms at any time.

---

## Quick Start

```bash
git clone https://github.com/reloop-labs/reloop.git
cd reloop
bun setup
bun dev
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

Reloop is also available as a fully managed hosted service from Reloop Labs — same codebase, zero infrastructure to run. [Sign up at reloop.sh](https://reloop.sh/dashboard/signup).

---

## Contributing

Read [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on reporting bugs, requesting features, branch conventions, commit format, and the pull request process.

---

## Community & Support

- 💬 **Discord** — [Join the community](https://discord.gg/bHnkBcp7xR)
- 🐦 **Twitter/X** — [Follow @reloophq](https://x.com/reloophq)
- 🐙 **GitHub Issues** — [Report bugs or request features](https://github.com/reloop-labs/reloop/issues)
- 📚 **Documentation** — [reloop.sh/docs](https://reloop.sh/docs)
- 📋 **Changelog** — [CHANGELOG.md](CHANGELOG.md)
- 🆘 **Support** — [reloop.sh/support](https://reloop.sh/support)

---

## License

Reloop is open source under the [Business Source License](LICENSE).

---

<div align="center">

Built by [Reloop Labs](https://reloop.sh) · Give us a ⭐ if Reloop saves you from vendor lock-in.

</div>
