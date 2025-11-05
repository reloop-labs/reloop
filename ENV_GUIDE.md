# Global Environment Variables Guide

This guide explains how to use the global environment file (`env.global`) across all Reloop services.

## Quick Start

1. **Copy the global env file to your service:**
   ```bash
   cp env.global apps/backend/auth/.env
   ```

2. **Edit the `.env` file** with your specific values:
   - Replace placeholder values (e.g., `your-domain.com`, `reloop123`)
   - Generate secure secrets using: `openssl rand -hex 32`
   - Adjust port numbers based on the service

3. **Remove unused variables** that your service doesn't need

## Service-Specific Ports

When copying to a service, update the `PORT` variable:

| Service | Port | Path |
|---------|------|------|
| Auth | 8000 | `apps/backend/auth/.env` |
| Domain | 8011 | `apps/backend/domain/.env` |
| API Key | 8012 | `apps/backend/api-key/.env` |
| Webhook | 8013 | `apps/backend/webhook/.env` |
| Audience | 8014 | `apps/backend/audience/.env` |
| Mail | 8015 | `apps/backend/mail/.env` |
| Tracehub | 8016 | `apps/backend/tracehub/.env` |
| Inngest | 8017 | `apps/backend/inngest/.env` |
| Web (Frontend) | 3000 | `apps/frontend/web/.env` |
| Dashboard (Frontend) | 3001 | `apps/frontend/dashboard/.env` |
| Admin (Frontend) | 3002 | `apps/frontend/admin/.env` |
| Docs (Frontend) | 3003 | `apps/frontend/docs/.env` |
| Dev (Frontend) | 3004 | `apps/frontend/dev/.env` |

## Common Workflows

### Setting Up a New Backend Service

```bash
# Copy global env
cp env.global apps/backend/your-service/.env

# Edit the file
nano apps/backend/your-service/.env

# Update:
# - PORT (see table above)
# - Database credentials (if different)
# - Service-specific variables
```

### Setting Up a Frontend Service

```bash
# Copy global env
cp env.global apps/frontend/your-app/.env

# Edit the file
nano apps/frontend/your-app/.env

# Update:
# - PORT (see table above)
# - NEXT_PUBLIC_* variables for your domain
# - Remove backend-specific variables
```

### Local Development vs Production

**Local Development:**
- Use `localhost` instead of service names
- Use `http://` instead of `https://`
- Example: `PG_URL=postgresql://reloop:reloop123@localhost:5432/reloop`

**Production:**
- Use actual domain names
- Use `https://` for secure connections
- Use Docker service names for internal communication
- Example: `PG_URL=postgresql://reloop:secure-password@reloop-postgres:5432/reloop`

## Generating Secure Secrets

Generate secure random secrets for sensitive values:

```bash
# Generate a 32-byte hex secret
openssl rand -hex 32

# Generate a 64-byte base64 secret
openssl rand -base64 64
```

Use these for:
- `BETTER_AUTH_SECRET`
- `INNGEST_SIGNING_KEY`
- `POSTGRES_PASSWORD`
- `REDIS_PASSWORD`
- `CLICKHOUSE_PASSWORD`

## Service-Specific Variables

### Auth Service
- `PG_URL` ✅
- `BETTER_AUTH_SECRET` ✅
- `BETTER_AUTH_URL` ✅
- `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD` ✅
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` (optional)
- `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` (optional)

### Mail Service
- `PG_URL` ✅
- `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD` ✅
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` ✅
- `BASE_URL` ✅

### Tracehub Service
- `CLICKHOUSE_URL` ✅
- `CLICKHOUSE_DB` ✅
- `CLICKHOUSE_USER` ✅
- `CLICKHOUSE_PASSWORD` ✅

### Inngest Service
- `PG_URL` ✅
- `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD` ✅
- `INNGEST_SIGNING_KEY` ✅
- `DNS_MONITORING_BATCH_SIZE` (optional)

### Frontend Services
- `NEXT_PUBLIC_WEB_URL` ✅
- `NEXT_PUBLIC_API_URL` ✅
- `NEXT_PUBLIC_DOCS_URL` (docs service only)
- `NEXT_PUBLIC_ANALYTICS_ID` (optional)

## Security Best Practices

1. **Never commit `.env` files** to version control
2. **Use strong, unique passwords** for each environment
3. **Rotate secrets regularly** in production
4. **Use environment-specific values** (dev/staging/prod)
5. **Restrict access** to `.env` files (chmod 600)
6. **Use secrets management** tools in production (e.g., AWS Secrets Manager, HashiCorp Vault)

## Troubleshooting

### Service can't connect to database
- Check if `PG_URL` uses correct host (localhost vs service name)
- Verify database credentials match your setup
- Ensure database service is running

### Service can't connect to Redis
- Check `REDIS_HOST` and `REDIS_PORT`
- Verify `REDIS_PASSWORD` matches Redis configuration
- Ensure Redis service is running

### Frontend can't reach backend API
- Check `NEXT_PUBLIC_API_URL` points to correct backend
- Verify CORS settings on backend
- Check network connectivity between services

## Additional Resources

- See individual service READMEs for service-specific requirements
- Check `scripts/03-configure-env.sh` for automated setup
- Review `local/docker-compose.yml` for local development setup

