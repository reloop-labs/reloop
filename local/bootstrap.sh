#!/usr/bin/env bash
set -euo pipefail

# Reloop local one-command setup.
# Usage: bun setup [--start] [--force] [--skip-docker] [--skip-hosts] [--skip-tls] [--with-edge]

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

COMPOSE_FILE="local/docker-compose.yml"
CERT_DIR="$ROOT/local/certs"
CERT_FILE="$CERT_DIR/local.reloop.sh.pem"
KEY_FILE="$CERT_DIR/local.reloop.sh-key.pem"

START=0
FORCE=0
SKIP_DOCKER=0
SKIP_HOSTS=0
SKIP_TLS=0
WITH_EDGE=0

for arg in "$@"; do
  case "$arg" in
    --start) START=1 ;;
    --force) FORCE=1 ;;
    --skip-docker) SKIP_DOCKER=1 ;;
    --skip-hosts) SKIP_HOSTS=1 ;;
    --skip-tls) SKIP_TLS=1 ;;
    --with-edge) WITH_EDGE=1 ;;
    -h|--help)
      cat <<'EOF'
Reloop local setup

Usage:
  bun setup [options]

Options:
  --start         Start the full stack with bun dev after setup
  --force         Re-run bun install even if node_modules exists
  --skip-docker   Skip docker compose up and db:push
  --skip-hosts    Skip /etc/hosts entry
  --skip-tls      Skip mkcert TLS generation (certs must already exist)
  --with-edge     Also start optional smtp/inbound (ports 25/465/587)
  -h, --help      Show this help
EOF
      exit 0
      ;;
    *)
      echo "Unknown option: $arg (try --help)"
      exit 1
      ;;
  esac
done

step=0
total=8

next() {
  step=$((step + 1))
  echo ""
  echo "=================================================="
  echo "Next ($step/$total): $1"
  echo "=================================================="
}

info() { echo "  → $1"; }
ok() { echo "  ✓ $1"; }
warn() { echo "  ! $1"; }
fail() { echo "  ✗ $1" >&2; exit 1; }

require_certs() {
  if [ ! -f "$CERT_FILE" ] || [ ! -f "$KEY_FILE" ]; then
    fail "TLS certs missing at local/certs/local.reloop.sh.pem (and -key.pem).
    Generate them with mkcert, or re-run without --skip-tls:
      brew install mkcert   # macOS
      mkcert -install
      mkdir -p local/certs
      mkcert -cert-file local/certs/local.reloop.sh.pem \\
        -key-file local/certs/local.reloop.sh-key.pem \\
        local.reloop.sh \"*.local.reloop.sh\""
  fi
}

echo ""
echo "Reloop local setup"
echo "This will prepare https://local.reloop.sh for end-to-end development."
echo ""

# ---------------------------------------------------------------------------
# 1. Prerequisites
# ---------------------------------------------------------------------------
next "Check prerequisites (Bun + Docker + mkcert)"

if ! command -v bun >/dev/null 2>&1; then
  fail "Bun is not installed. Install from https://bun.sh/get (v1.3.0+), then re-run bun setup."
fi

BUN_VERSION="$(bun --version)"
info "Found Bun v${BUN_VERSION}"

MAJOR="$(echo "$BUN_VERSION" | cut -d. -f1)"
MINOR="$(echo "$BUN_VERSION" | cut -d. -f2)"
if [ "$MAJOR" -lt 1 ] || { [ "$MAJOR" -eq 1 ] && [ "$MINOR" -lt 3 ]; }; then
  fail "Bun v1.3.0+ required (found v${BUN_VERSION}). Upgrade: https://bun.sh/get"
fi
ok "Bun version OK"

if ! command -v docker >/dev/null 2>&1; then
  fail "Docker is not installed. Install Docker Desktop from https://www.docker.com/products/docker-desktop/ then re-run bun setup."
fi
ok "Docker CLI found"

if [ "$SKIP_DOCKER" -eq 0 ]; then
  if ! docker info >/dev/null 2>&1; then
    warn "Docker daemon is not running. Waiting up to 60s for Docker Desktop…"
    waited=0
    while [ "$waited" -lt 60 ]; do
      if docker info >/dev/null 2>&1; then
        break
      fi
      sleep 2
      waited=$((waited + 2))
    done
    if ! docker info >/dev/null 2>&1; then
      fail "Docker daemon is still not running. Open Docker Desktop, wait until it is ready, then re-run bun setup."
    fi
  fi
  ok "Docker daemon is running"
fi

if [ "$SKIP_TLS" -eq 0 ]; then
  if ! command -v mkcert >/dev/null 2>&1; then
    fail "mkcert is required to generate local TLS certs.
    Install:
      macOS:  brew install mkcert
      Linux:  see https://github.com/FiloSottile/mkcert#installation
    Then re-run bun setup."
  fi
  ok "mkcert found"
else
  info "mkcert check skipped (--skip-tls); verifying existing certs…"
  require_certs
  ok "Existing TLS certs found"
fi

# ---------------------------------------------------------------------------
# 2. Hosts
# ---------------------------------------------------------------------------
next "Map local.reloop.sh in /etc/hosts"

if [ "$SKIP_HOSTS" -eq 1 ]; then
  info "Skipped (--skip-hosts)"
elif grep -Eq '^[[:space:]]*127\.0\.0\.1[[:space:]]+local\.reloop\.sh([[:space:]]|$)' /etc/hosts 2>/dev/null; then
  ok "Hosts entry already present"
else
  info "Adding 127.0.0.1 local.reloop.sh (may prompt for sudo)"
  if echo "127.0.0.1 local.reloop.sh" | sudo tee -a /etc/hosts >/dev/null; then
    ok "Hosts entry added"
  else
    fail "Could not update /etc/hosts. Add this line manually, then re-run: 127.0.0.1 local.reloop.sh"
  fi
fi

# ---------------------------------------------------------------------------
# 3. TLS
# ---------------------------------------------------------------------------
next "Ensure local TLS certs for Caddy (mkcert)"

if [ "$SKIP_TLS" -eq 1 ]; then
  info "Skipped generation (--skip-tls)"
  require_certs
  ok "Using existing certs in local/certs/"
elif [ -f "$CERT_FILE" ] && [ -f "$KEY_FILE" ]; then
  ok "TLS certs already exist in local/certs/"
else
  mkdir -p "$CERT_DIR"
  info "Installing local CA (may prompt for sudo)…"
  mkcert -install
  info "Generating cert for local.reloop.sh and *.local.reloop.sh…"
  mkcert -cert-file "$CERT_FILE" -key-file "$KEY_FILE" local.reloop.sh "*.local.reloop.sh"
  ok "TLS certs written to local/certs/"
fi

# ---------------------------------------------------------------------------
# 4. Dependencies
# ---------------------------------------------------------------------------
next "Install workspace dependencies"

if [ "$FORCE" -eq 1 ] || [ ! -d "$ROOT/node_modules" ]; then
  info "Running bun install…"
  bun install
  ok "Dependencies installed"
else
  ok "node_modules present (use --force to reinstall)"
fi

# ---------------------------------------------------------------------------
# 5. Environment files
# ---------------------------------------------------------------------------
next "Populate .env files from .env.dev templates"

bash "$ROOT/local/setup.sh"
ok "Environment files ready"

# ---------------------------------------------------------------------------
# 6. Docker
# ---------------------------------------------------------------------------
next "Start Docker infrastructure"

if [ "$SKIP_DOCKER" -eq 1 ]; then
  info "Skipped (--skip-docker)"
else
  info "Starting core services (Postgres, Redis, Caddy, Mailpit, …)…"
  if ! bun docker:up; then
    fail "Core Docker services failed to start.
    Free conflicting ports (80, 443, 5432, 6379, 9010, 4222) and re-run.
    See: https://reloop.sh/docs/setup/port"
  fi
  ok "Core containers started"

  # Optional KumoMTA edge — ports 25/465/587 often conflict; never abort setup
  if [ "$WITH_EDGE" -eq 1 ]; then
    info "Starting optional smtp/inbound edge (--with-edge)…"
    if bun docker:up:edge; then
      ok "Edge mail services started (smtp + inbound)"
    else
      warn "Edge mail services (smtp/inbound) did not start — local dashboard e2e still works via Mailpit."
      warn "Common cause: ports 25, 465, or 587 already in use. Retry later with: bun docker:up:edge"
    fi
  else
    info "Skipped smtp/inbound edge (use --with-edge or bun docker:up:edge when needed)"
  fi
fi

# ---------------------------------------------------------------------------
# 7. Wait for Postgres
# ---------------------------------------------------------------------------
next "Wait for Postgres to become healthy"

if [ "$SKIP_DOCKER" -eq 1 ]; then
  info "Skipped (--skip-docker)"
else
  info "Polling reloop-postgres (up to 120s)…"
  waited=0
  until docker compose -f "$COMPOSE_FILE" exec -T reloop-postgres pg_isready -U reloop -d reloop >/dev/null 2>&1; do
    if [ "$waited" -ge 120 ]; then
      fail "Postgres did not become healthy in time. Check: docker compose -f $COMPOSE_FILE ps"
    fi
    sleep 2
    waited=$((waited + 2))
  done
  ok "Postgres is ready"
fi

# ---------------------------------------------------------------------------
# 8. Database schema
# ---------------------------------------------------------------------------
next "Apply database schema (bun db:push)"

if [ "$SKIP_DOCKER" -eq 1 ]; then
  info "Skipped (--skip-docker). Run bun db:push yourself when Postgres is up."
else
  bun db:push
  ok "Schema applied"
fi

# ---------------------------------------------------------------------------
# Summary
# ---------------------------------------------------------------------------
echo ""
echo "=================================================="
echo "Setup complete"
echo "=================================================="
echo ""
echo "  App:        https://local.reloop.sh"
echo "  Dashboard:  https://local.reloop.sh/dashboard"
echo "  Docs:       https://local.reloop.sh/docs"
echo "  Console:    https://local.reloop.sh/console"
echo "  Mailpit:    http://localhost:8025"
echo "  MinIO:      http://localhost:9001  (reloop / reloop123)"
echo ""
echo "  Local OTP for signup/login: 888888"
echo "  Use https://local.reloop.sh (not localhost) so auth cookies work."
echo ""
echo "  Optional edge SMTP/MX: bun docker:up:edge   (or: bun setup --with-edge)"
echo ""

if [ "$START" -eq 1 ]; then
  echo "Starting bun dev…"
  echo ""
  exec bun dev
fi

echo "Next: start the stack with:"
echo "  bun dev"
echo ""
echo "Or re-run setup and start in one step:"
echo "  bun setup --start"
echo ""
