# Inbound MTA Service

[Read more about the service](https://reloop.sh/docs/setup/backend/inbound)

KumoMTA instance dedicated to **receiving inbound email** at `inbound.reloop.sh`.

## Overview

This service handles the MX side of the email infrastructure — accepting mail from external senders, validating recipients, scanning for spam, and forwarding to the inbox service via NATS.

## 🚀 Setup

For detailed setup and development instructions, please refer to the [Setup Guide](https://reloop.sh/docs/setup/backend/inbound).

## Architecture

```
External Sender → Port 25 (SMTP) → Recipient Check → RSpamD Scan → NATS → Inbox Service
```

## Ports

| Port | Purpose |
|------|---------|
| 25   | SMTP inbound (open MX) |
| 8030 | HTTP health checks (host-mapped from container port 8000) |

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `INBOUND_HOSTNAME` | `inbound.reloop.sh` | EHLO hostname |
| `NATS_URL` | `reloop-nats:4222` | NATS server URL |
| `KUMOMTA_RSPAMD_URL` | `http://reloop-rspamd:11333/checkv2` | RSpamD scan endpoint |
| `KUMOMTA_CHECK_RECIPIENT_URL` | `http://host.docker.internal:8011/api/domain` | Recipient validation endpoint |
| `NODE_ENV` | `production` | Environment |

## DNS Requirements (Production)

- **A Record**: `inbound.reloop.sh` → server IP
- **MX Records**: Customer domains should point MX to `inbound.reloop.sh`

---

## 🔗 Resources & Community

- 📚 **Docs**: [Documentation](https://reloop.sh/docs/setup/backend/inbound)
- 🐙 **GitHub**: [Source Code](https://github.com/reloop-labs/reloop)
- 🆘 **Support**: [Get Help](https://reloop.sh/support)
- 💬 **Discord**: [Join Chat](https://discord.gg/bHnkBcp7xR)
- 🐦 **Twitter**: [Follow Us](https://x.com/reloophq)
- 🛠️ **Setup**: [Setup Guide](https://reloop.sh/docs/setup/backend/inbound)
