#!/usr/bin/env bash

# Generate Configuration Files
# This script generates Caddyfile and docker-compose.prod.yml

set -euo pipefail

# Source common functions
source "$(dirname "$0")/common.sh"

# Load configuration
# shellcheck disable=SC1091
[[ -f .env ]] && source .env
export DOMAIN SSL_EMAIL

step "Generating configuration files"

# Create storage directories
log_info "Provisioning data directories..."
mkdir -p docker-data/{postgres,redis,clickhouse,grafana,loki,caddy,ssl}
mkdir -p docker-data/rspamd/{dkim,logs} || true
mkdir -p docker-data/{postfix,dovecot}/logs || true
mkdir -p docker-data/vmail || true

log_success "Directories ready"

# Generate Caddyfile
log_info "Generating Caddyfile..."
cat > Caddyfile <<EOF
$DOMAIN {
    tls $SSL_EMAIL

    # Frontend routes (most specific first)
    handle /dashboard* {
        reverse_proxy reloop-dashboard:3000 {
            header_up Host {host}
            header_up X-Forwarded-Proto {scheme}
            header_up X-Forwarded-For {remote}
        }
    }
    handle /admin* {
        reverse_proxy reloop-admin:3000 {
            header_up Host {host}
            header_up X-Forwarded-Proto {scheme}
            header_up X-Forwarded-For {remote}
        }
    }
    handle /docs* {
        reverse_proxy reloop-docs:3000 {
            header_up Host {host}
            header_up X-Forwarded-Proto {scheme}
            header_up X-Forwarded-For {remote}
        }
    }
    handle /dev* {
        reverse_proxy reloop-dev:3000 {
            header_up Host {host}
            header_up X-Forwarded-Proto {scheme}
            header_up X-Forwarded-For {remote}
        }
    }

    # API routes
    handle /api/auth* {
        reverse_proxy reloop-auth:8000 {
            header_up Host {host}
            header_up X-Forwarded-Proto {scheme}
            header_up X-Forwarded-For {remote}
        }
    }
    handle /api/api-key* {
        reverse_proxy reloop-api-key:8012 {
            header_up Host {host}
            header_up X-Forwarded-Proto {scheme}
            header_up X-Forwarded-For {remote}
        }
    }
    handle /api/domain* {
        reverse_proxy reloop-domain:8011 {
            header_up Host {host}
            header_up X-Forwarded-Proto {scheme}
            header_up X-Forwarded-For {remote}
        }
    }
    handle /api/webhook* {
        reverse_proxy reloop-webhook:8013 {
            header_up Host {host}
            header_up X-Forwarded-Proto {scheme}
            header_up X-Forwarded-For {remote}
        }
    }
    handle /api/audience* {
        reverse_proxy reloop-audience:8014 {
            header_up Host {host}
            header_up X-Forwarded-Proto {scheme}
            header_up X-Forwarded-For {remote}
        }
    }
    handle /api/mail* {
        reverse_proxy reloop-mail:8015 {
            header_up Host {host}
            header_up X-Forwarded-Proto {scheme}
            header_up X-Forwarded-For {remote}
        }
    }
    handle /api/tracehub* {
        reverse_proxy reloop-tracehub:8016 {
            header_up Host {host}
            header_up X-Forwarded-Proto {scheme}
            header_up X-Forwarded-For {remote}
        }
    }
    handle /api/inngest* {
        reverse_proxy reloop-inngest:8017 {
            header_up Host {host}
            header_up X-Forwarded-Proto {scheme}
            header_up X-Forwarded-For {remote}
        }
    }

    # Main app (catch-all - everything else)
    handle {
        reverse_proxy reloop-web:3000 {
            header_up Host {host}
            header_up X-Forwarded-Proto {scheme}
            header_up X-Forwarded-For {remote}
        }
    }
}
EOF

log_success "Caddyfile generated"

# Generate docker-compose.prod.yml
log_info "Generating production docker-compose.yml..."
# Using heredoc with variable substitution enabled
cat > docker-compose.prod.yml <<EOF
name: reloop-production

services:
  # Infrastructure Services
  reloop-postgres:
    image: postgres:17-alpine
    container_name: reloop-postgres
    volumes:
      - ./docker-data/postgres:/var/lib/postgresql/data
    environment:
      POSTGRES_DB: \${POSTGRES_DB:-reloop}
      POSTGRES_USER: \${POSTGRES_USER:-reloop}
      POSTGRES_PASSWORD: \${POSTGRES_PASSWORD}
    ports:
      - "127.0.0.1:5432:5432"
    healthcheck:
      interval: 30s
      timeout: 10s
      retries: 3
      test: ["CMD", "pg_isready", "-U", "\${POSTGRES_USER:-reloop}", "-d", "\${POSTGRES_DB:-reloop}"]
    restart: unless-stopped
    networks:
      - reloop-network

  reloop-redis:
    image: redis:7-alpine
    container_name: reloop-redis
    command: redis-server --requirepass \${REDIS_PASSWORD}
    volumes:
      - ./docker-data/redis:/data
    ports:
      - "127.0.0.1:6379:6379"
    restart: unless-stopped
    networks:
      - reloop-network

  reloop-clickhouse:
    image: clickhouse/clickhouse-server:24.8-alpine
    container_name: reloop-clickhouse
    volumes:
      - ./docker-data/clickhouse:/var/lib/clickhouse
    environment:
      CLICKHOUSE_DB: \${CLICKHOUSE_DB:-reloop}
      CLICKHOUSE_DEFAULT_ACCESS_MANAGEMENT: 1
      CLICKHOUSE_PASSWORD: \${CLICKHOUSE_PASSWORD:-reloop123}
      CLICKHOUSE_USER: \${CLICKHOUSE_USER:-default}
    ulimits:
      nofile:
        soft: 262144
        hard: 262144
    cap_add:
      - SYS_NICE
      - NET_ADMIN
      - IPC_LOCK
    healthcheck:
      interval: 30s
      timeout: 10s
      retries: 3
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:8123/ping"]
    restart: unless-stopped
    networks:
      - reloop-network

  reloop-grafana:
    image: grafana/grafana:10.4.0
    container_name: reloop-grafana
    ports:
      - "127.0.0.1:3400:3000"
    volumes:
      - ./docker-data/grafana:/var/lib/grafana
      - ./local/grafana/provisioning:/etc/grafana/provisioning
      - ./local/grafana/dashboards:/var/lib/grafana/dashboards
    environment:
      GF_SECURITY_ADMIN_PASSWORD: \${GF_SECURITY_ADMIN_PASSWORD:-reloop123}
      GF_USERS_ALLOW_SIGN_UP: false
      GF_INSTALL_PLUGINS: grafana-clickhouse-datasource
    depends_on:
      - reloop-clickhouse
    restart: unless-stopped
    networks:
      - reloop-network

  reloop-loki:
    image: grafana/loki:2.9.0
    container_name: reloop-loki
    volumes:
      - ./docker-data/loki:/loki
      - ./local/grafana/config/loki-config.yaml:/etc/loki/local-config.yaml
    command: ["-config.file=/etc/loki/local-config.yaml"]
    restart: unless-stopped
    networks:
      - reloop-network

  reloop-proxy:
    image: caddy:2-alpine
    container_name: reloop-proxy
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile
      - ./docker-data/caddy:/data
      - ./docker-data/caddy:/config
    restart: unless-stopped
    networks:
      - reloop-network
    depends_on:
      - reloop-web
      - reloop-dashboard
      - reloop-admin
      - reloop-docs
      - reloop-dev
      - reloop-auth
      - reloop-domain
      - reloop-api-key
      - reloop-webhook
      - reloop-audience
      - reloop-mail
      - reloop-tracehub
      - reloop-inngest

  # Backend Services
  reloop-auth:
    image: reloopsh/be-auth:latest
    container_name: reloop-auth
    env_file:
      - apps/backend/auth/.env
    depends_on:
      reloop-postgres:
        condition: service_healthy
      reloop-redis:
        condition: service_started
    restart: unless-stopped
    networks:
      - reloop-network

  reloop-domain:
    image: reloopsh/be-domain:latest
    container_name: reloop-domain
    env_file:
      - apps/backend/domain/.env
    depends_on:
      reloop-postgres:
        condition: service_healthy
      reloop-redis:
        condition: service_started
    restart: unless-stopped
    networks:
      - reloop-network

  reloop-api-key:
    image: reloopsh/be-api-key:latest
    container_name: reloop-api-key
    env_file:
      - apps/backend/api-key/.env
    depends_on:
      reloop-postgres:
        condition: service_healthy
      reloop-redis:
        condition: service_started
    restart: unless-stopped
    networks:
      - reloop-network

  reloop-webhook:
    build:
      context: .
      dockerfile: apps/backend/webhook/Dockerfile
    container_name: reloop-webhook
    env_file:
      - apps/backend/webhook/.env
    depends_on:
      reloop-postgres:
        condition: service_healthy
      reloop-redis:
        condition: service_started
    restart: unless-stopped
    networks:
      - reloop-network

  reloop-audience:
    build:
      context: .
      dockerfile: apps/backend/audience/Dockerfile
    container_name: reloop-audience
    env_file:
      - apps/backend/audience/.env
    depends_on:
      reloop-postgres:
        condition: service_healthy
      reloop-redis:
        condition: service_started
    restart: unless-stopped
    networks:
      - reloop-network

  reloop-mail:
    image: reloopsh/be-mail:latest
    container_name: reloop-mail
    env_file:
      - apps/backend/mail/.env
    depends_on:
      reloop-postgres:
        condition: service_healthy
      reloop-redis:
        condition: service_started
    restart: unless-stopped
    networks:
      - reloop-network

  reloop-tracehub:
    build:
      context: .
      dockerfile: apps/backend/tracehub/Dockerfile
    container_name: reloop-tracehub
    env_file:
      - apps/backend/tracehub/.env
    depends_on:
      reloop-clickhouse:
        condition: service_healthy
    restart: unless-stopped
    networks:
      - reloop-network

  reloop-inngest:
    build:
      context: .
      dockerfile: apps/backend/inngest/Dockerfile
    container_name: reloop-inngest
    env_file:
      - apps/backend/inngest/.env
    depends_on:
      reloop-postgres:
        condition: service_healthy
      reloop-redis:
        condition: service_started
    restart: unless-stopped
    networks:
      - reloop-network

  # Frontend Services
  reloop-web:
    image: reloopsh/fe-web:latest
    container_name: reloop-web
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_API_URL=https://\${DOMAIN}
    restart: unless-stopped
    networks:
      - reloop-network

  reloop-dashboard:
    image: reloopsh/fe-dashboard:latest
    container_name: reloop-dashboard
    environment:
      - NODE_ENV=production
      - PORT=3000
      - NEXT_PUBLIC_API_URL=https://\${DOMAIN}
    restart: unless-stopped
    networks:
      - reloop-network

  reloop-admin:
    image: reloopsh/fe-admin:latest
    container_name: reloop-admin
    environment:
      - NODE_ENV=production
      - PORT=3000
      - NEXT_PUBLIC_API_URL=https://\${DOMAIN}
    restart: unless-stopped
    networks:
      - reloop-network

  reloop-docs:
    image: reloopsh/fe-docs:latest
    container_name: reloop-docs
    environment:
      - NODE_ENV=production
      - PORT=3000
      - NEXT_PUBLIC_API_URL=https://\${DOMAIN}
    restart: unless-stopped
    networks:
      - reloop-network

  reloop-dev:
    image: reloopsh/fe-dev:latest
    container_name: reloop-dev
    environment:
      - NODE_ENV=production
      - PORT=3000
      - NEXT_PUBLIC_API_URL=https://\${DOMAIN}
    restart: unless-stopped
    networks:
      - reloop-network

networks:
  reloop-network:
    driver: bridge
EOF

log_success "Production docker-compose.yml generated"

