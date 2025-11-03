# Reloop VPS Setup Scripts

Modular setup scripts for deploying Reloop on a VPS.

## Quick Start

Run the main setup script:

```bash
./scripts/setup.sh
```

This will run all setup steps in order.

## Modular Structure

The setup is split into modular scripts that can be run independently:

### `common.sh`
Shared functions and variables used by all scripts:
- OS detection
- Helper functions (spinner, logging, etc.)
- Directory setup

### `00-install-dependencies.sh`
**Purpose**: Install prerequisites
- Checks system requirements (RAM, disk space)
- Installs Bun runtime
- Installs Docker and Docker Compose
- Ensures Docker daemon is running

**Run independently**: `bash scripts/00-install-dependencies.sh`

### `01-collect-config.sh`
**Purpose**: Collect user configuration
- Prompts for domain name
- Prompts for SSL email (Let's Encrypt)
- Collects or generates passwords:
  - PostgreSQL password
  - Redis password
  - Better Auth secret

**Run independently**: `bash scripts/01-collect-config.sh`

### `02-setup-project.sh`
**Purpose**: Setup project dependencies
- Installs npm/bun dependencies
- Builds packages (optional, will build in Docker too)

**Run independently**: `bash scripts/02-setup-project.sh`

### `03-configure-env.sh`
**Purpose**: Generate environment files
- Creates main `.env` file
- Creates service-specific `.env` files for each backend service
- Configures all environment variables

**Run independently**: `bash scripts/03-configure-env.sh`

### `04-generate-configs.sh`
**Purpose**: Generate configuration files
- Creates data directories
- Generates `Caddyfile` for reverse proxy
- Generates `docker-compose.prod.yml` with all services

**Run independently**: `bash scripts/04-generate-configs.sh`

### `05-setup-database.sh`
**Purpose**: Setup database and infrastructure
- Starts PostgreSQL, Redis, and ClickHouse
- Waits for PostgreSQL to be ready
- Runs database migrations

**Run independently**: `bash scripts/05-setup-database.sh`

### `06-deploy-services.sh`
**Purpose**: Deploy all services
- Pulls pre-built Docker images from Docker Hub
- Builds services without pre-built images
- Starts all services via Docker Compose

**Run independently**: `bash scripts/06-deploy-services.sh`

### `07-health-checks.sh`
**Purpose**: Verify service health
- Checks PostgreSQL health
- Checks Redis health
- Checks ClickHouse health
- Verifies backend services are responding

**Run independently**: `bash scripts/07-health-checks.sh`

### `08-summary.sh`
**Purpose**: Display final summary
- Configures firewall (optional)
- Displays access URLs
- Shows useful commands
- Provides next steps

**Run independently**: `bash scripts/08-summary.sh`

## Running Individual Steps

You can run individual scripts if you need to re-run a specific step:

```bash
# Re-configure environment
bash scripts/03-configure-env.sh

# Re-deploy services
bash scripts/06-deploy-services.sh

# Check health
bash scripts/07-health-checks.sh
```

## Prerequisites

- Linux or macOS
- Root/sudo access (for installing Docker)
- Internet connection
- At least 4GB RAM (8GB+ recommended)
- At least 20GB disk space (50GB+ recommended)

## Configuration

Configuration is collected interactively and stored in:
- `.env` - Main environment file
- `apps/backend/*/.env` - Service-specific environment files

## Services Deployed

### Infrastructure
- PostgreSQL (port 5432)
- Redis (port 6379)
- ClickHouse (ports 8123, 9000)
- Grafana (port 3400)
- Loki
- Caddy reverse proxy (ports 80, 443)

### Backend Services
- Auth (`reloopsh/be-auth:latest`)
- Domain (`reloopsh/be-domain:latest`)
- API Key (`reloopsh/be-api-key:latest`)
- Webhook (built locally)
- Audience (built locally)
- Mail (`reloopsh/be-mail:latest`)
- TraceHub (built locally)
- Inngest (built locally)

### Frontend Services
- Web (`reloopsh/fe-web:latest`)
- Dashboard (`reloopsh/fe-dashboard:latest`)
- Admin (`reloopsh/fe-admin:latest`)
- Docs (`reloopsh/fe-docs:latest`)
- Dev (`reloopsh/fe-dev:latest`)

## Troubleshooting

### Script fails at a specific step
1. Check the error message
2. Run that specific script independently to debug
3. Fix the issue
4. Re-run from that step forward

### Services not starting
```bash
# Check logs
docker compose -f docker-compose.prod.yml logs [service-name]

# Check all logs
docker compose -f docker-compose.prod.yml logs

# Restart a service
docker compose -f docker-compose.prod.yml restart [service-name]
```

### Database migration fails
```bash
# Check PostgreSQL logs
docker compose -f docker-compose.prod.yml logs reloop-postgres

# Manually run migration
bun run db:push
```

## Maintenance Commands

```bash
# View service status
docker compose -f docker-compose.prod.yml ps

# Stop all services
docker compose -f docker-compose.prod.yml down

# Update services
git pull
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d --build

# View logs
docker compose -f docker-compose.prod.yml logs -f [service-name]
```

## Notes

- All scripts use `set -euo pipefail` for strict error handling
- Scripts are designed to be idempotent (safe to re-run)
- Configuration persists in `.env` files between runs
- Services use pre-built Docker images when available for faster deployment

