#!/usr/bin/env bash

set -euo pipefail

# ==========================
# ASCII banner
# ==========================
reloop_banner() {
cat <<'BANNER'
 _____  ______  _
|  __ \|  ____|| |
| |__) | |__   | |     ___   ___   _ __  ___
|  _  /|  __|  | |    / _ \ / _ \ | '__|/ __|
| | \ \| |____ | |___| (_) | (_) || |   \__ \
|_|  \_\______||______\___/ \___/ |_|   |___/

BANNER
}

# ==========================
# Step + spinner helpers
# ==========================
TOTAL_STEPS=8
CURRENT_STEP=0

step() {
  CURRENT_STEP=$((CURRENT_STEP + 1))
  echo
  echo "=== Step ${CURRENT_STEP}/${TOTAL_STEPS}: $* ==="
}

spinner() {
  local pid=$1
  local msg=$2
  local sp='|/-\'
  local i=0
  printf "%s " "$msg"
  while kill -0 "$pid" 2>/dev/null; do
    printf "\r%s %s" "$msg" "${sp:i++%${#sp}:1}"
    sleep 0.1
  done
  printf "\r%s ✓\n" "$msg"
}

# ==========================
# OS detection and root dir
# ==========================
OS_NAME="$(uname -s)"
IS_MAC=false
[[ "$OS_NAME" == "Darwin" ]] && IS_MAC=true

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
# repo root is four levels up from apps/frontend/web/public
ROOT_DIR="$(cd "$SCRIPT_DIR/../../../.." && pwd)"
cd "$ROOT_DIR"

# sed portable replace (Linux/macOS)
sed_in_place() {
  local search=$1
  local replace=$2
  local file=$3
  if $IS_MAC; then
    sed -i '' -e "s/${search}/${replace}/g" "$file"
  else
    sed -i -e "s/${search}/${replace}/g" "$file"
  fi
}

# ==========================
# 1) Prerequisites
# ==========================
reloop_banner

step "Checking prerequisites"

if ! command -v docker >/dev/null 2>&1; then
  if $IS_MAC; then
    echo "Docker is not installed. Please install Docker Desktop for Mac and re-run."
    exit 1
  else
    echo "Docker not found. Attempting to install (Linux)."
    (curl -fsSL https://get.docker.com -o get-docker.sh && sh get-docker.sh) &
    spinner $! "Installing Docker"
  fi
fi

if docker compose version >/dev/null 2>&1; then
  DC="docker compose"
elif command -v docker-compose >/dev/null 2>&1; then
  DC="docker-compose"
else
  if $IS_MAC; then
    echo "Docker Compose not found. Please install Docker Desktop (includes Compose)."
    exit 1
  else
    echo "Docker Compose not found. Installing v2."
    (sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" \
      -o /usr/local/bin/docker-compose && sudo chmod +x /usr/local/bin/docker-compose) &
    spinner $! "Installing Docker Compose"
    DC="docker-compose"
  fi
fi

# Ensure docker is running
if ! docker info >/dev/null 2>&1; then
  echo "Docker daemon is not running. Please start Docker and re-run."
  exit 1
fi

echo "Prerequisites OK"

# ==========================
# 2) Collect inputs
# ==========================
step "Collecting domain and SSL email"

DOMAIN=${DOMAIN:-}
SSL_EMAIL=${SSL_EMAIL:-}

if [[ -z "${DOMAIN}" ]]; then
  read -r -p "Enter your domain (e.g., example.com): " DOMAIN
fi
if [[ -z "${DOMAIN}" ]]; then
  echo "Domain is required for production."
  exit 1
fi

if [[ -z "${SSL_EMAIL}" ]]; then
  read -r -p "Enter your email for SSL (Let's Encrypt): " SSL_EMAIL
fi
if [[ -z "${SSL_EMAIL}" ]]; then
  echo "SSL email is required for certificate issuance."
  exit 1
fi

echo "Using DOMAIN=$DOMAIN, SSL_EMAIL=$SSL_EMAIL"

# ==========================
# 3) Create storage directories
# ==========================
step "Provisioning data directories"

mkdir -p docker-data/{postgres,redis,rspamd,vmail,postfix,dovecot,caddy,ssl}
mkdir -p docker-data/rspamd/dkim
mkdir -p docker-data/{postfix,dovecot,rspamd}/logs

echo "Directories ready"

# ==========================
# 4) DKIM permissions
# ==========================
step "Setting DKIM directory ownership"

if command -v sudo >/dev/null 2>&1; then
  (sudo chown -R 11333:11333 docker-data/rspamd/dkim || true) &
  spinner $! "Applying ownership 11333:11333 to docker-data/rspamd/dkim"
else
  echo "sudo not available; skipping chown"
fi

# ==========================
# 5) Materialize .env and Caddyfile
# ==========================
step "Preparing environment and proxy config"

# .env
if [[ ! -f .env ]]; then
  if [[ -f env.example.mail ]]; then
    cp env.example.mail .env
  else
    touch .env
  fi
fi

if ! grep -q '^DOMAIN=' .env; then
  echo "DOMAIN=$DOMAIN" >> .env
else
  sed_in_place '^DOMAIN=.*' "DOMAIN=$DOMAIN" .env
fi

# Caddyfile
if [[ -f Caddyfile ]]; then
  # make a backup only once
  cp -n Caddyfile Caddyfile.bak 2>/dev/null || true
  sed_in_place 'EMAIL' "$SSL_EMAIL" Caddyfile
  sed_in_place 'localhost' "$DOMAIN" Caddyfile
else
  cat > Caddyfile <<EOF
${DOMAIN} {
    tls ${SSL_EMAIL}

    handle /dashboard* {
        reverse_proxy reloop-dashboard:3000
    }

    handle /dev* {
        reverse_proxy reloop-dev:3000
    }

    handle /docs* {
        reverse_proxy reloop-docs:3000
    }

    handle /admin* {
        reverse_proxy reloop-admin:3000
    }

    handle {
        reverse_proxy reloop-web:3000
    }
}
EOF
fi

echo ".env and Caddyfile ready"

# ==========================
# 6) Firewall (Linux only)
# ==========================
step "Configuring firewall (Linux only)"

if ! $IS_MAC; then
  if command -v ufw >/dev/null 2>&1; then
    echo "Applying UFW rules..."
    ( \
      sudo ufw allow 22/tcp && \
      sudo ufw allow 25/tcp && \
      sudo ufw allow 465/tcp && \
      sudo ufw allow 587/tcp && \
      sudo ufw allow 143/tcp && \
      sudo ufw allow 993/tcp && \
      sudo ufw allow 110/tcp && \
      sudo ufw allow 995/tcp && \
      sudo ufw allow 80/tcp  && \
      sudo ufw allow 443/tcp \
    ) &
    spinner $! "Opening required ports"

    read -r -p "Expose Postgres(5432) and Redis(6379) externally? (y/N): " EXPOSE_DB
    if [[ "${EXPOSE_DB,,}" == "y" ]]; then
      (sudo ufw allow 5432/tcp && sudo ufw allow 6379/tcp) &
      spinner $! "Opening 5432, 6379"
    fi

    sudo ufw --force enable || true
  else
    echo "ufw not found; skipping"
  fi
else
  echo "macOS detected; skipping firewall"
fi

# ==========================
# 7) Launch stack
# ==========================
step "Starting containers"

if [[ ! -f docker-compose.setup.yml ]]; then
  echo "docker-compose.setup.yml not found in $ROOT_DIR"
  exit 1
fi

($DC -f docker-compose.setup.yml up -d) &
spinner $! "Bringing up services"

echo "Waiting for services to settle..."
sleep 12

# ==========================
# 8) Summary
# ==========================
step "Summary and next steps"

$DC -f docker-compose.setup.yml ps || true

echo
echo "Reloop is starting. Visit:"
echo "  https://$DOMAIN/           (Web)"
echo "  https://$DOMAIN/dashboard  (Dashboard)"
echo "  https://$DOMAIN/dev        (Dev)"
echo "  https://$DOMAIN/docs       (Docs)"
echo "  https://$DOMAIN/admin      (Admin)"
echo
echo "Mail endpoints:"
echo "  SMTP:   $DOMAIN:25   | SMTPS:  $DOMAIN:465 | Submission: $DOMAIN:587"
echo "  IMAP:   $DOMAIN:143  | IMAPS:  $DOMAIN:993"
echo "  POP3:   $DOMAIN:110  | POP3S:  $DOMAIN:995"
echo
echo "DKIM (after DNS ready):"
echo "  sudo rspamadm dkim_keygen -s mail -d $DOMAIN -k docker-data/rspamd/dkim/$DOMAIN/mail.private > docker-data/rspamd/dkim/$DOMAIN/mail.txt"
echo "  sudo chown -R 11333:11333 docker-data/rspamd/dkim/$DOMAIN/"
echo "  $DC -f docker-compose.setup.yml restart reloop-rspamd"
echo
echo "Useful commands:"
echo "  Logs:   $DC -f docker-compose.setup.yml logs -f"
echo "  Stop:   $DC -f docker-compose.setup.yml down"
echo "  Status: $DC -f docker-compose.setup.yml ps"
echo
echo "Done."


