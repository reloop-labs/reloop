# Audience Service

A comprehensive audiences management service built with Elysia, providing full CRUD operations, bulk import, advanced search, and status management for audience groups and individual audiences.

## 🔗 Quick Links

- 📚 **Documentation**: [Developer Docs](https://reloop.sh/)
- 🌐 **Production API**: [API Base](https://reloop.sh/api/contacts)
- 📜 **OpenAPI Spec**: [OpenAPI](https://reloop.sh/api/contacts/openapi)

## Features

### Audience Groups
- **Create**: Create new audience groups with name and description
- **Read**: Get single audience group or list all with filtering
- **Update**: Update audience group name and description
- **Delete**: Soft delete audience groups

### Audience
- **Create**: Add individual audiences to groups
- **Read**: Get single audience or list with advanced filtering
- **Update**: Update audience information and group membership
- **Delete**: Remove audiences from groups

### Bulk Operations
- **Bulk Import**: Import up to 1000 audiences at once
- **Duplicate Handling**: Automatic detection and reporting of duplicates
- **Error Reporting**: Detailed error messages for failed imports

### Status Management
- **Subscribe**: Dedicated endpoint to subscribe audiences
- **Unsubscribe**: Dedicated endpoint to unsubscribe audiences
- **Status Tracking**: Track subscription status and timestamps

### Advanced Search
- **Multi-field Search**: Search across email and name
- **Filtering**: Filter by status, group, organization
- **Pagination**: Efficient pagination for large datasets

## API Endpoints

### Audience Groups
- `POST /v1/audience-groups` - Create audience group
- `GET /v1/audience-groups` - List audience groups
- `GET /v1/audience-groups/:id` - Get audience group
- `PUT /v1/audience-groups/:id` - Update audience group
- `DELETE /v1/audience-groups/:id` - Delete audience group

### Audience
- `POST /v1/audience` - Create audience
- `GET /v1/audience` - List audiences
- `GET /v1/audience/:id` - Get audience
- `PUT /v1/audience/:id` - Update audience
- `DELETE /v1/audience/:id` - Delete audience
- `POST /v1/audience/bulk-import` - Bulk import audiences
- `POST /v1/audience/:id/subscribe` - Subscribe audience
- `POST /v1/audience/:id/unsubscribe` - Unsubscribe audience
- `GET /v1/audience/search` - Advanced search audiences

## Architecture

The service follows the same patterns as the domain service:

- **Controllers**: Business logic and database operations
- **Routes**: HTTP endpoint definitions with validation
- **Models**: Request/response validation schemas
- **Types**: TypeScript type definitions
- **Middleware**: Authentication and service initialization

## Database Schema

Uses the existing audience schema from `@reloop/db`:
- `audience_group`: Groups for organizing audiences
- `audience`: Individual audience records

## Authentication

All endpoints require authentication via the auth middleware, which validates user sessions and organization membership.

## 🚀 Setup

For detailed setup and development instructions, please refer to the [Setup Guide](https://reloop.sh/docs/setup/backend/contacts).

## Environment Variables

- `PORT`: Service port (default: 3001)
- `BASE_URL`: Base URL for auth service communication
- `NODE_ENV`: Environment mode

## Service Integration

The service integrates with:
- **Database**: PostgreSQL via Drizzle ORM
- **Cache**: Redis for performance optimization
- **Auth**: Better Auth for authentication
- **Logging**: Structured logging with context

---

## 🔗 Resources & Community

- 📚 **Docs**: [Documentation](https://reloop.sh/docs/setup/backend/contacts)
- 🤖 **Discovery**: [Discovery Spec](https://reloop.sh/api/contacts/agent-card.json)
- 📖 **OpenAPI**: [OpenAPI Spec](https://reloop.sh/api/contacts/openapi)
- 🐙 **GitHub**: [Source Code](https://github.com/reloop-labs/reloop)
- 🆘 **Support**: [Get Help](https://reloop.sh/support)
- 💬 **Discord**: [Join Chat](https://discord.gg/reloop)
- 🐦 **Twitter**: [Follow Us](https://x.com/reloophq)
- 🛠️ **Setup**: [Setup Guide](https://reloop.sh/docs/setup/backend/contacts)
