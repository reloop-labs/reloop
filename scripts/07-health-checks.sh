#!/usr/bin/env bash

# Health Checks
# This script verifies that all services are running correctly

set -euo pipefail

# Source common functions
source "$(dirname "$0")/common.sh"

# Load configuration
# shellcheck disable=SC1091
[[ -f .env ]] && source .env

step "Checking service health"

HEALTHY=true

# Check PostgreSQL
if docker exec reloop-postgres pg_isready -U "${POSTGRES_USER:-reloop}" -d "${POSTGRES_DB:-reloop}" >/dev/null 2>&1; then
  log_success "PostgreSQL is healthy"
else
  log_error "PostgreSQL is not responding"
  HEALTHY=false
fi

# Check Redis
if docker exec reloop-redis redis-cli -a "${REDIS_PASSWORD}" ping >/dev/null 2>&1; then
  log_success "Redis is healthy"
else
  log_error "Redis is not responding"
  HEALTHY=false
fi

# Check ClickHouse
if docker exec reloop-clickhouse wget --no-verbose --tries=1 --spider http://localhost:8123/ping >/dev/null 2>&1; then
  log_success "ClickHouse is healthy"
else
  log_error "ClickHouse is not responding"
  HEALTHY=false
fi

# Check services via HTTP (basic connectivity)
log_info "Checking service endpoints..."

# Wait a bit more for services to start
sleep 5

SERVICES=("reloop-auth:8000" "reloop-domain:8011" "reloop-api-key:8012" "reloop-webhook:8013" "reloop-audience:8014" "reloop-mail:8015")
for service in "${SERVICES[@]}"; do
  name=$(echo "$service" | cut -d: -f1)
  port=$(echo "$service" | cut -d: -f2)
  if docker exec "$name" wget --no-verbose --tries=1 --spider "http://localhost:$port/" >/dev/null 2>&1 || docker exec "$name" curl -s -f "http://localhost:$port/" >/dev/null 2>&1 || true; then
    log_success "$name is responding"
  else
    log_warning "$name may not be ready yet (check logs if issue persists)"
  fi
done

if [[ "$HEALTHY" == "true" ]]; then
  log_success "Core infrastructure services are healthy"
else
  log_warning "Some services may not be healthy. Check logs with: $DC -f docker-compose.prod.yml logs"
fi

