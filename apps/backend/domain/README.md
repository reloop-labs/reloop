# Domain Service API

This service provides CRUD operations for domain management following ElysiaJS best practices.

## API Endpoints

### Base URL
```
/api/domain/domains
```

### Endpoints

#### 1. Create Domain
- **POST** `/api/domain/domains`
- **Body**: Domain creation data
- **Response**: Created domain object

#### 2. Get Domain
- **GET** `/api/domain/domains/:domain`
- **Response**: Domain object

#### 3. Update Domain
- **PUT** `/api/domain/domains/:domain`
- **Body**: Domain update data
- **Response**: Updated domain object

#### 4. Delete Domain
- **DELETE** `/api/domain/domains/:domain`
- **Response**: Success message

#### 5. List Domains
- **GET** `/api/domain/domains`
- **Query Parameters**:
  - `page` (optional): Page number (default: 1)
  - `limit` (optional): Items per page (default: 10, max: 100)
  - `active` (optional): Filter by active status
  - `organizationId` (optional): Filter by organization
  - `userId` (optional): Filter by user
- **Response**: Paginated list of domains

#### 6. Search Domains
- **GET** `/api/domain/domains/search/:term`
- **Query Parameters**:
  - `page` (optional): Page number (default: 1)
  - `limit` (optional): Items per page (default: 10, max: 100)
  - `active` (optional): Filter by active status
- **Response**: Paginated list of matching domains

#### 7. Check Domain Exists
- **HEAD** `/api/domain/domains/:domain`
- **Response**: 200 if exists, 404 if not

## Data Models

### Domain Object
```typescript
{
  domain: string;
  organizationId: string;
  userId: string;
  mailboxes: number;
  mailboxQuota: number;
  quota: number;
  rateLimit: number | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### Create Domain Request
```typescript
{
  domain: string;
  organizationId: string;
  userId: string;
  mailboxes: number;
  mailboxQuota: number;
  quota: number;
  rateLimit?: number;
  active: boolean;
}
```

### Update Domain Request
```typescript
{
  mailboxes?: number;
  mailboxQuota?: number;
  quota?: number;
  rateLimit?: number;
  active?: boolean;
}
```

## Error Responses

- **400**: Invalid domain format
- **404**: Domain not found
- **409**: Domain already exists
- **401**: Unauthorized access

## Documentation

Interactive API documentation is available at:
```
http://localhost:3000/api/domain/docs
```

## Architecture

The service follows ElysiaJS best practices with a feature-based folder structure:

- **Models** (`src/models/domain.ts`): Data validation and type definitions
- **Services** (`src/services/domain.ts`): Business logic and database operations
- **Controllers** (`src/controllers/domain.ts`): HTTP routing and request handling
- **Main App** (`src/index.ts`): Application setup and route integration
