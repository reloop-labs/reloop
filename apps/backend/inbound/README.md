# Inbound MTA Service

KumoMTA instance dedicated to **receiving inbound email** at `inbound.reloop.sh`.

## Overview

This service handles the MX side of the email infrastructure — accepting mail from external senders, validating recipients, scanning for spam, and forwarding to the inbox service via NATS.

## Architecture

```
External Sender → Port 25 (SMTP) → Recipient Check → RSpamD Scan → NATS → Inbox Service
```

## Ports

| Port | Purpose |
|------|---------|
| 25   | SMTP inbound (open MX) |
| 8000 | HTTP health checks |

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
