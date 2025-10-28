# Port Mapping Documentation

This document provides a comprehensive overview of all port allocations used across the Reloop platform. All ports are hardcoded and do not use environment variables.

## Port Allocation Strategy

### Frontend Services (3000-3099)
| Service | Port | Purpose | Location |
|---------|------|---------|----------|
| Web | 3000 | Main website and landing pages | `apps/frontend/web` |
| Dashboard | 3001 | User dashboard interface | `apps/frontend/dashboard` |
| Admin | 3002 | Admin panel and management | `apps/frontend/admin` |
| Docs | 3003 | Documentation site | `apps/frontend/docs` |
| Dev | 3004 | Development documentation | `apps/frontend/dev` |

### Backend Services (8000-8099)
| Service | Port | Purpose | Location |
|---------|------|---------|----------|
| Auth | 8000 | Authentication and authorization | `apps/backend/auth` |
| Domain | 8011 | Domain management service | `apps/backend/domain` |
| Webhook | 8013 | Webhook handling service | `apps/backend/webhook` |
| Audience | 8014 | Audience management service | `apps/backend/audience` |
| Mail | 8015 | Email service | `apps/backend/mail` |

### Infrastructure Services
| Service | Port(s) | Purpose | Location |
|---------|---------|---------|----------|
| PostgreSQL | 5432 | Primary database | `local/docker-compose.yml` |
| Redis | 6379 | Caching and sessions | `local/docker-compose.yml` |
| ClickHouse | 8123, 9000 | Analytics database | `local/docker-compose.yml` |
| Grafana | 3400 | Monitoring dashboard | `local/docker-compose.yml` |
| Loki | 3100 | Log aggregation | `local/docker-compose.yml` |
| Mailpit | 1025, 8025 | Email testing (SMTP, Web UI) | `local/docker-compose.yml` |
| Caddy | 80, 443 | Reverse proxy (HTTP, HTTPS) | `local/Caddyfile` |

### Mail Services
| Service | Port(s) | Purpose | Location |
|---------|---------|---------|----------|
| Postfix | 25, 465, 587 | SMTP server | `apps/backend/postfix` |
| Dovecot | 110, 143, 993, 995 | IMAP/POP3 server | `apps/backend/dovecot` |
| Rspamd | 11332, 11333, 11334 | Spam filtering | `apps/backend/rspamd` |

## Port Conflict Resolution

### Rules
1. **Frontend services** use ports 3000-3099
2. **Backend services** use ports 8000-8099
3. **Infrastructure services** use standard ports (5432, 6379, etc.)
4. **Mail services** use standard mail ports (25, 110, 143, etc.)
5. **No environment variables** - all ports are hardcoded

### Conflict Prevention
- Frontend and backend services are in separate port ranges
- Infrastructure services use well-known standard ports
- Mail services use standard email protocol ports
- All ports are documented and centralized in this file

## Service Communication

### Frontend to Backend
- Frontend services communicate with backend services through the Caddy reverse proxy
- Caddy routes `/api/*` requests to appropriate backend services
- Backend services are accessible via `http://localhost:8000-8015`

### Internal Communication
- Services communicate using service names in Docker environments
- Direct localhost communication for local development
- All inter-service communication is documented in service-specific README files

## Development Setup

### Starting All Services
```bash
# Start infrastructure services
cd local && docker-compose up -d

# Start frontend services (in separate terminals)
cd apps/frontend/web && bun dev
cd apps/frontend/dashboard && bun dev
cd apps/frontend/admin && bun dev
cd apps/frontend/docs && bun dev
cd apps/frontend/dev && bun dev

# Start backend services (in separate terminals)
cd apps/backend/auth && bun dev
cd apps/backend/domain && bun dev
cd apps/backend/webhook && bun dev
cd apps/backend/audience && bun dev
cd apps/backend/mail && bun dev
```

### Service URLs
- **Web**: http://localhost:3000
- **Dashboard**: http://localhost:3001
- **Admin**: http://localhost:3002
- **Docs**: http://localhost:3003
- **Dev**: http://localhost:3004
- **Auth API**: http://localhost:8000/api/auth
- **Domain API**: http://localhost:8011/api/domain
- **Webhook API**: http://localhost:8013/api/webhook
- **Audience API**: http://localhost:8014/api/audience
- **Mail API**: http://localhost:8015/api/mail

## Troubleshooting

### Port Already in Use
```bash
# Check what's using a port
lsof -i :PORT_NUMBER

# Kill the process
kill -9 <PID>
```

### Service Not Starting
1. Check if the port is available
2. Verify the service is running in the correct directory
3. Check service logs for errors
4. Ensure all dependencies are installed

## Notes

- **No PORT environment variables** - all ports are hardcoded in source code
- **Docker containers** expose the same internal and external ports
- **Caddy reverse proxy** handles routing between frontend and backend
- **Service discovery** is handled through hardcoded port mappings
- **Development and production** use the same port assignments

## Contributing

When adding new services:
1. Choose an appropriate port from the available ranges
2. Update this documentation
3. Add the service to the Caddyfile if it needs reverse proxy routing
4. Update any relevant README files
5. Test port conflicts before committing

---

*Last updated: $(date)*
*This file should be updated whenever port assignments change.*
