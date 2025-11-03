#!/usr/bin/env bash

# Collect Configuration
# This script auto-generates all configuration values (passwords, domain, SSL email)

set -euo pipefail

# Source common functions
source "$(dirname "$0")/common.sh"

step "Generating configuration automatically"

# Load existing values if .env exists
if [[ -f .env ]]; then
  # shellcheck disable=SC1091
  source .env
fi

# Get hostname for domain/email detection
HOSTNAME=$(hostname -f 2>/dev/null || hostname 2>/dev/null || echo "localhost")

# Auto-generate or use existing domain
if [[ -z "${DOMAIN:-}" ]]; then
  if [[ "$HOSTNAME" != "localhost" && "$HOSTNAME" != "localhost.localdomain" ]]; then
    DOMAIN="$HOSTNAME"
    log_info "Auto-detected domain from hostname: $DOMAIN"
  else
    DOMAIN="localhost"
    log_info "Using default domain: $DOMAIN (update in .env if needed)"
  fi
fi

# Auto-generate SSL email if not set
if [[ -z "${SSL_EMAIL:-}" ]]; then
  # Try to get system email or generate a default
  SYSTEM_USER=${USER:-admin}
  SYSTEM_HOSTNAME=$HOSTNAME
  SSL_EMAIL="${SYSTEM_USER}@${SYSTEM_HOSTNAME}"
  log_info "Auto-generated SSL email: $SSL_EMAIL"
fi

# Auto-generate PostgreSQL password
if [[ -z "${PG_PASSWORD:-}" ]]; then
  PG_PASSWORD=$(generate_secret)
  log_info "Generated PostgreSQL password."
fi

# Auto-generate Redis password
if [[ -z "${REDIS_PASSWORD:-}" ]]; then
  REDIS_PASSWORD=$(generate_secret)
  log_info "Generated Redis password."
fi

# Auto-generate Better Auth secret
if [[ -z "${BETTER_AUTH_SECRET:-}" ]]; then
  BETTER_AUTH_SECRET=$(generate_secret)
  log_info "Generated Better Auth secret."
fi

# Auto-generate ClickHouse password
if [[ -z "${CLICKHOUSE_PASSWORD:-}" ]]; then
  CLICKHOUSE_PASSWORD=$(generate_secret)
  log_info "Generated ClickHouse password."
fi

# Auto-generate Grafana admin password
if [[ -z "${GF_SECURITY_ADMIN_PASSWORD:-}" ]]; then
  GF_SECURITY_ADMIN_PASSWORD=$(generate_secret)
  log_info "Generated Grafana admin password."
fi

# Export for use in other scripts
export DOMAIN SSL_EMAIL PG_PASSWORD REDIS_PASSWORD BETTER_AUTH_SECRET CLICKHOUSE_PASSWORD GF_SECURITY_ADMIN_PASSWORD

log_success "Configuration generated:"
log_info "  Domain: $DOMAIN"
log_info "  SSL Email: $SSL_EMAIL"
log_info "  PostgreSQL password: [auto-generated]"
log_info "  Redis password: [auto-generated]"
log_info "  Better Auth secret: [auto-generated]"
log_info "  ClickHouse password: [auto-generated]"
log_info "  Grafana admin password: [auto-generated]"

