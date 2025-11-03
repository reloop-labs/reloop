#!/usr/bin/env bash

# Configure Environment
# This script generates all environment files for services

set -euo pipefail

# Source common functions
source "$(dirname "$0")/common.sh"

# Load configuration from previous step
# shellcheck disable=SC1091
[[ -f .env ]] && source .env
export DOMAIN SSL_EMAIL PG_PASSWORD REDIS_PASSWORD BETTER_AUTH_SECRET CLICKHOUSE_PASSWORD GF_SECURITY_ADMIN_PASSWORD

step "Generating environment configuration"

# Ensure directories exist
mkdir -p apps/backend/{auth,domain,api-key,webhook,audience,mail,inngest,tracehub}

# Generate main .env file
cat > .env <<EOF
# Domain Configuration
DOMAIN=$DOMAIN
SSL_EMAIL=$SSL_EMAIL

# Database Configuration
PG_URL=postgresql://reloop:$PG_PASSWORD@reloop-postgres:5432/reloop
POSTGRES_DB=reloop
POSTGRES_USER=reloop
POSTGRES_PASSWORD=$PG_PASSWORD

# Redis Configuration
REDIS_URL=redis://:$REDIS_PASSWORD@reloop-redis:6379
REDIS_HOST=reloop-redis
REDIS_PORT=6379
REDIS_PASSWORD=$REDIS_PASSWORD

# Better Auth Configuration
BETTER_AUTH_SECRET=$BETTER_AUTH_SECRET
BETTER_AUTH_URL=https://$DOMAIN

# ClickHouse Configuration
CLICKHOUSE_URL=http://reloop-clickhouse:8123
CLICKHOUSE_DB=reloop
CLICKHOUSE_USER=default
CLICKHOUSE_PASSWORD=$CLICKHOUSE_PASSWORD

# Grafana Configuration
GF_SECURITY_ADMIN_PASSWORD=$GF_SECURITY_ADMIN_PASSWORD

# Service URLs (internal)
AUTH_SERVICE_URL=http://reloop-auth:8000
DOMAIN_SERVICE_URL=http://reloop-domain:8011
API_KEY_SERVICE_URL=http://reloop-api-key:8012
WEBHOOK_SERVICE_URL=http://reloop-webhook:8013
AUDIENCE_SERVICE_URL=http://reloop-audience:8014
MAIL_SERVICE_URL=http://reloop-mail:8015
TRACEHUB_SERVICE_URL=http://reloop-tracehub:8016
INNGEST_SERVICE_URL=http://reloop-inngest:8017

# Frontend URLs (internal)
WEB_URL=http://reloop-web:3000
DASHBOARD_URL=http://reloop-dashboard:3001
ADMIN_URL=http://reloop-admin:3002
DOCS_URL=http://reloop-docs:3003
DEV_URL=http://reloop-dev:3004

# Environment
NODE_ENV=production
EOF

# Generate service-specific .env files
cat > apps/backend/auth/.env <<EOF
PG_URL=postgresql://reloop:$PG_PASSWORD@reloop-postgres:5432/reloop
BETTER_AUTH_SECRET=$BETTER_AUTH_SECRET
BETTER_AUTH_URL=https://$DOMAIN
REDIS_HOST=reloop-redis
REDIS_PORT=6379
REDIS_PASSWORD=$REDIS_PASSWORD
NODE_ENV=production
HOSTNAME=0.0.0.0
PORT=8000
EOF

cat > apps/backend/domain/.env <<EOF
PG_URL=postgresql://reloop:$PG_PASSWORD@reloop-postgres:5432/reloop
REDIS_HOST=reloop-redis
REDIS_PORT=6379
REDIS_PASSWORD=$REDIS_PASSWORD
NODE_ENV=production
HOSTNAME=0.0.0.0
PORT=8011
EOF

cat > apps/backend/api-key/.env <<EOF
PG_URL=postgresql://reloop:$PG_PASSWORD@reloop-postgres:5432/reloop
REDIS_HOST=reloop-redis
REDIS_PORT=6379
REDIS_PASSWORD=$REDIS_PASSWORD
NODE_ENV=production
HOSTNAME=0.0.0.0
PORT=8012
EOF

cat > apps/backend/webhook/.env <<EOF
PG_URL=postgresql://reloop:$PG_PASSWORD@reloop-postgres:5432/reloop
REDIS_HOST=reloop-redis
REDIS_PORT=6379
REDIS_PASSWORD=$REDIS_PASSWORD
NODE_ENV=production
HOSTNAME=0.0.0.0
PORT=8013
EOF

cat > apps/backend/audience/.env <<EOF
PG_URL=postgresql://reloop:$PG_PASSWORD@reloop-postgres:5432/reloop
REDIS_HOST=reloop-redis
REDIS_PORT=6379
REDIS_PASSWORD=$REDIS_PASSWORD
NODE_ENV=production
HOSTNAME=0.0.0.0
PORT=8014
EOF

cat > apps/backend/mail/.env <<EOF
PG_URL=postgresql://reloop:$PG_PASSWORD@reloop-postgres:5432/reloop
REDIS_HOST=reloop-redis
REDIS_PORT=6379
REDIS_PASSWORD=$REDIS_PASSWORD
NODE_ENV=production
HOSTNAME=0.0.0.0
PORT=8015
EOF

cat > apps/backend/inngest/.env <<EOF
PG_URL=postgresql://reloop:$PG_PASSWORD@reloop-postgres:5432/reloop
REDIS_HOST=reloop-redis
REDIS_PORT=6379
REDIS_PASSWORD=$REDIS_PASSWORD
NODE_ENV=production
HOSTNAME=0.0.0.0
PORT=8017
INNGEST_SIGNING_KEY=$(generate_secret)
EOF

cat > apps/backend/tracehub/.env <<EOF
CLICKHOUSE_URL=http://reloop-clickhouse:8123
CLICKHOUSE_DB=reloop
CLICKHOUSE_USER=default
CLICKHOUSE_PASSWORD=$CLICKHOUSE_PASSWORD
NODE_ENV=production
HOSTNAME=0.0.0.0
PORT=8016
EOF

log_success "Environment files generated"

