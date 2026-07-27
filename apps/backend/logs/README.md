# Logs Service API

[Read more about the service](https://reloop.sh/docs/setup/backend/logs)

## Quick Links

- **Documentation**: [Setup Guide](https://reloop.sh/docs/setup/backend/logs)
- **Production API**: [API Base](https://api.reloop.sh/api/logs)
- **OpenAPI Spec**: [OpenAPI](https://reloop.sh/api/logs/openapi)

## Setup

For detailed setup and development instructions, please refer to the [Setup Guide](https://reloop.sh/docs/setup/backend/logs).

## Endpoints

- `GET /api/logs/v1/list` — list activity/audit logs
- `GET /api/logs/v1/:log_id` — get a single activity log
- `GET /api/logs/v1/emails` — list email delivery logs
- `GET /api/logs/v1/emails/stats` — email delivery stats

Activity logs are ingested via NATS (`log.created`) into PostgreSQL.

---

## Resources & Community

- **Docs**: [Documentation](https://reloop.sh/docs/setup/backend/logs)
- **Discovery**: [Discovery Spec](https://reloop.sh/api/logs/agent-card.json)
- **OpenAPI**: [OpenAPI Spec](https://reloop.sh/api/logs/openapi)
- **GitHub**: [Source Code](https://github.com/reloop-labs/reloop)
- **Support**: [Get Help](https://reloop.sh/support)
- **Discord**: [Join Chat](https://discord.gg/bHnkBcp7xR)
- **Twitter**: [Follow Us](https://x.com/reloophq)
- **Setup**: [Setup Guide](https://reloop.sh/docs/setup/backend/logs)
