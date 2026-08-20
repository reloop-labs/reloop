# Template Service

Backend service for managing email templates with drag-and-drop builder support.

## 🔗 Quick Links

- 📚 **Documentation**: [Developer Docs](https://reloop.sh/dev/template-service)
- 🌐 **Production API**: [API Base](https://reloop.sh/api/template)
- 📜 **OpenAPI Spec**: [OpenAPI](https://reloop.sh/api/template/openapi)

## API Endpoints

- `GET /api/template/` - Health check
- `GET /api/template/v1/list` - List templates
- `GET /api/template/v1/:id` - Get template by ID
- `GET /api/template/v1/:id/thumbnail` - PNG preview of the latest saved HTML
- `POST /api/template/v1/create` - Create template
- `POST /api/template/v1/html-to-image` - Convert HTML to a PNG/JPEG/WebP
- `PUT /api/template/v1/:id` - Update template
- `DELETE /api/template/v1/:id` - Delete template
- `POST /api/template/v1/:id/duplicate` - Duplicate template

## 🚀 Setup

For detailed setup and development instructions, please refer to the [Setup Guide](https://reloop.sh/docs/setup/backend/template).

HTML-to-image uses a background Chromium process. Locally:

```bash
bunx playwright install chromium
```

In Docker the service uses Alpine’s `chromium` package via `CHROMIUM_PATH`.

---

## 🔗 Resources & Community

- 📚 **Docs**: [Documentation](https://reloop.sh/docs/setup/backend/template)
- 🤖 **Discovery**: [Discovery Spec](https://reloop.sh/api/template/agent-card.json)
- 📖 **OpenAPI**: [OpenAPI Spec](https://reloop.sh/api/template/openapi)
- 🐙 **GitHub**: [Source Code](https://github.com/reloop-labs/reloop)
- 🆘 **Support**: [Get Help](https://reloop.sh/support)
- 💬 **Discord**: [Join Chat](https://discord.gg/bHnkBcp7xR)
- 🐦 **Twitter**: [Follow Us](https://x.com/reloophq)
- 🛠️ **Setup**: [Setup Guide](https://reloop.sh/docs/setup/backend/template)
