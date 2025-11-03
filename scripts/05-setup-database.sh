#!/usr/bin/env bash

# Setup Database
# This script starts infrastructure services and runs database migrations

set -euo pipefail

# Source common functions
source "$(dirname "$0")/common.sh"

# Load configuration
# shellcheck disable=SC1091
[[ -f .env ]] && source .env

step "Setting up database"

log_info "Starting infrastructure services..."
($DC -f docker-compose.prod.yml up -d reloop-postgres reloop-redis reloop-clickhouse) &
spinner $! "Starting infrastructure services"

log_info "Waiting for PostgreSQL to be ready..."
timeout=60
counter=0
while ! docker exec reloop-postgres pg_isready -U "${POSTGRES_USER:-reloop}" -d "${POSTGRES_DB:-reloop}" >/dev/null 2>&1; do
  sleep 1
  counter=$((counter + 1))
  if [[ $counter -ge $timeout ]]; then
    log_error "PostgreSQL did not become ready in time."
    exit 1
  fi
done

log_success "PostgreSQL is ready"

log_info "Running database migrations..."
# Wait a bit more for PostgreSQL to be fully ready
sleep 2
(bun run db:push || log_warning "Migration failed - check logs") &
spinner $! "Running database migrations"

log_success "Database setup complete"

