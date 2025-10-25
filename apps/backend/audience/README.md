# Audience Service

A comprehensive audiences management service built with Elysia, providing full CRUD operations, bulk import, advanced search, and status management for audience groups and individual audiences.

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
- **Multi-field Search**: Search across email, name, phone, and metadata
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
- `POST /v1/audiences` - Create audience
- `GET /v1/audiences` - List audiences
- `GET /v1/audiences/:id` - Get audience
- `PUT /v1/audiences/:id` - Update audience
- `DELETE /v1/audiences/:id` - Delete audience
- `POST /v1/audiences/bulk-import` - Bulk import audiences
- `POST /v1/audiences/:id/subscribe` - Subscribe audience
- `POST /v1/audiences/:id/unsubscribe` - Unsubscribe audience
- `GET /v1/audiences/search` - Advanced search audiences

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
- `audience`: Individual audience records with metadata

## Authentication

All endpoints require authentication via the auth middleware, which validates user sessions and organization membership.

## Development

```bash
# Install dependencies
bun install

# Run in development mode
bun run dev

# Build for production
bun run build

# Start production server
bun run start
```

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
