# Auth Service

This is the authentication service built with Elysia.js and Better Auth.

## Quick Start with Docker

### Option 1: Using Docker Compose (Recommended)

1. Navigate to the auth service directory:
   ```bash
   cd apps/backend/auth
   ```

2. Run the service with Docker Compose:
   ```bash
   docker-compose up --build
   ```

This will start:
- PostgreSQL database on port 5432
- Auth service on port 3000

### Option 2: Using Docker directly

1. Build the Docker image:
   ```bash
   docker build -f apps/backend/auth/Dockerfile -t auth-service .
   ```

2. Run the container with environment variables:
   ```bash
   docker run -p 3000:3000 \
     -e DATABASE_URL="postgresql://user:password@host:5432/db" \
     -e BETTER_AUTH_SECRET="your-secret-key" \
     auth-service
   ```

## Environment Variables

Copy `env.example` to `.env` and configure the following variables:

- `DATABASE_URL`: PostgreSQL connection string
- `BETTER_AUTH_SECRET`: Secret key for JWT tokens (required)
- `GOOGLE_CLIENT_ID`: Google OAuth client ID (optional)
- `GOOGLE_CLIENT_SECRET`: Google OAuth client secret (optional)
- `GITHUB_CLIENT_ID`: GitHub OAuth client ID (optional)
- `GITHUB_CLIENT_SECRET`: GitHub OAuth client secret (optional)

## API Endpoints

- `GET /api/status`: Health check endpoint
- `GET /api/auth/docs`: OpenAPI documentation
- All auth endpoints are available under `/api/auth/*`

## Development

For local development without Docker:

1. Install dependencies:
   ```bash
   bun install
   ```

2. Set up environment variables (copy from `env.example`)

3. Run the development server:
   ```bash
   bun run dev
   ```
