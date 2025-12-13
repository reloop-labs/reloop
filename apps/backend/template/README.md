# Template Service

Backend service for managing email templates with drag-and-drop builder support.

## API Endpoints

- `GET /api/template/` - Health check
- `GET /api/template/v1/list` - List templates
- `GET /api/template/v1/:id` - Get template by ID
- `POST /api/template/v1/create` - Create template
- `PUT /api/template/v1/:id` - Update template
- `DELETE /api/template/v1/:id` - Delete template
- `POST /api/template/v1/:id/duplicate` - Duplicate template

## Development

```bash
bun run dev
```

## Build

```bash
bun run build
```
