# Dashboard

[Read more about the app](https://reloop.sh/docs/setup/frontend/dashboard)

## 🔗 Quick Links

- 📚 **Documentation**: [Documentation](https://reloop.sh/docs/setup/frontend/dashboard)
- 🌐 **Live App**: [Live](https://reloop.sh/dashboard)

## 🚀 Setup

For detailed setup and development instructions, please refer to the [Setup Guide](https://reloop.sh/docs/setup/frontend/dashboard).

## Chatwoot widget

To enable the Chatwoot live chat widget in the dashboard, set (no spaces around `=`):

- `NEXT_PUBLIC_CHATWOOT_BASE_URL` (example: `https://chatwoot.reloop.sh`)
- `NEXT_PUBLIC_CHATWOOT_WEBSITE_TOKEN` (from Chatwoot → Settings → Inboxes → Website inbox)

Restart the dev server after changing env vars.

In Chatwoot → Inbox → **Settings**, set **Website domain** to the exact origin you use:

- Local dev: `https://local.reloop.sh`
- Production: `https://reloop.sh`

If the domain does not match, the chat bubble will not appear.

---

## 🔗 Resources & Community

- 📚 **Docs**: [Documentation](https://reloop.sh/docs/setup/frontend/dashboard)
- 🐙 **GitHub**: [Source Code](https://github.com/reloop-labs/reloop)
- 🆘 **Support**: [Get Help](https://reloop.sh/support)
- 💬 **Discord**: [Join Chat](https://discord.gg/bHnkBcp7xR)
- 🐦 **Twitter**: [Follow Us](https://x.com/reloophq)
- 🛠️ **Setup**: [Setup Guide](https://reloop.sh/docs/setup/frontend/dashboard)
