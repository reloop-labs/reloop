#!/bin/bash
set -e

CERT_DIR="/opt/kumomta/etc/certs"
mkdir -p "$CERT_DIR"

DOMAIN="${SMTP_HOSTNAME:-${HOSTNAME:-smtp.reloop.sh}}"
DOMAIN=$(echo "$DOMAIN" | sed -e 's|^[^/]*//||' -e 's|/.*$||' -e 's|:.*$||')
EMAIL="${LETSENCRYPT_EMAIL:-admin@${DOMAIN}}"

# 1. Check if Traefik acme.json is mounted (auto-sync with Coolify's Traefik)
if [ -f "/traefik/acme.json" ]; then
    echo "[TLS] Found /traefik/acme.json, checking for $DOMAIN certificate..."
    if command -v jq >/dev/null 2>&1; then
        jq -r --arg dom "$DOMAIN" '.[]?.Certificates[]? | select(.domain.main == $dom or (.domain.sans[]? // "" == $dom)) | .certificate' /traefik/acme.json | head -n 1 | base64 -d > "$CERT_DIR/fullchain.pem" 2>/dev/null || true
        jq -r --arg dom "$DOMAIN" '.[]?.Certificates[]? | select(.domain.main == $dom or (.domain.sans[]? // "" == $dom)) | .key' /traefik/acme.json | head -n 1 | base64 -d > "$CERT_DIR/privkey.pem" 2>/dev/null || true
    fi
fi

# 2. If certificates are missing and AUTO_LETSENCRYPT=true, auto-generate via certbot
if [ ! -s "$CERT_DIR/fullchain.pem" ] || [ ! -s "$CERT_DIR/privkey.pem" ]; then
    if [ "$AUTO_LETSENCRYPT" = "true" ] && command -v certbot >/dev/null 2>&1 && [ "$DOMAIN" != "localhost" ] && [ "$DOMAIN" != "local.reloop.sh" ]; then
        echo "[TLS] Auto-requesting Let's Encrypt certificate for $DOMAIN ($EMAIL)..."
        certbot certonly --standalone \
            --non-interactive \
            --agree-tos \
            --email "$EMAIL" \
            --preferred-challenges http \
            -d "$DOMAIN" || echo "[TLS] Standalone certbot challenge failed"

        if [ -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
            cp "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" "$CERT_DIR/fullchain.pem"
            cp "/etc/letsencrypt/live/$DOMAIN/privkey.pem" "$CERT_DIR/privkey.pem"
            echo "[TLS] Successfully installed Let's Encrypt certificate for $DOMAIN"
        fi
    fi
fi

# Ensure correct permissions for kumod user
chown -R kumod:kumod "$CERT_DIR" 2>/dev/null || true
chmod 644 "$CERT_DIR/fullchain.pem" 2>/dev/null || true
chmod 600 "$CERT_DIR/privkey.pem" 2>/dev/null || true

# Execute CMD or start kumod
if [ "$#" -eq 0 ]; then
    exec /opt/kumomta/sbin/kumod --policy /opt/kumomta/etc/policy/init.lua --user kumod
else
    exec "$@"
fi
