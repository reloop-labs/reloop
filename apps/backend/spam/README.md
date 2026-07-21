# Spam Service

[Read more about the service](https://reloop.sh/docs/setup/backend/spam)

Rspamd instance dedicated to **scanning inbound email** for spam. The [inbound](../inbound) MTA POSTs raw messages to `/checkv2` and injects `X-Spam-*` headers from the response.

## Overview

This service runs Rspamd as a first-class Reloop backend — separate from the inbound MTA so scanners can scale and restart independently.

```
Inbound (KumoMTA) → HTTP POST /checkv2 → Spam (Rspamd) → score / action / symbols
```

## Ports

| Port | Purpose |
|------|---------|
| 11332 | Normal worker (scan) |
| 11333 | Controller / `/checkv2` scan endpoint |
| 11334 | Web UI / controller |

## Environment / wiring

Inbound points at this service via:

| Variable | Default |
|----------|---------|
| `KUMOMTA_RSPAMD_URL` | `http://reloop-spam:11333/checkv2` |

Rspamd uses Redis (`reloop-redis`) for learning and fuzzy storage. Local overrides live in `local.d/`.

## 🔗 Resources & Community

- 📚 **Docs**: [Documentation](https://reloop.sh/docs/setup/backend/spam)
- 🐙 **GitHub**: [Source Code](https://github.com/reloop-labs/reloop)
- 🆘 **Support**: [Get Help](https://reloop.sh/support)
- 💬 **Discord**: [Join Chat](https://discord.gg/bHnkBcp7xR)
- 🐦 **Twitter**: [Follow Us](https://x.com/reloophq)
- 🛠️ **Setup**: [Setup Guide](https://reloop.sh/docs/setup/backend/spam)
