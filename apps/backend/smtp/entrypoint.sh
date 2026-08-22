#!/bin/bash
set -e

CERT_DIR="/opt/kumomta/etc/certs"
mkdir -p "$CERT_DIR"

DOMAIN="${SMTP_HOSTNAME:-${HOSTNAME:-smtp.reloop.sh}}"
DOMAIN=$(echo "$DOMAIN" | sed -e 's|^[^/]*//||' -e 's|/.*$||' -e 's|:.*$||')
EMAIL="${LETSENCRYPT_EMAIL:-admin@${DOMAIN}}"

# 1. Search for Coolify/Traefik acme.json or Caddy certificates
ACME_FILES=(
    "/traefik/acme.json"
    "/traefik/traefik/acme.json"
    "/data/coolify/proxy/acme.json"
    "/data/coolify/proxy/traefik/acme.json"
    "/certs/acme.json"
)

for acme_file in "${ACME_FILES[@]}"; do
    if [ -f "$acme_file" ]; then
        echo "[TLS] Found $acme_file, extracting certificates for $DOMAIN..."
        if command -v jq >/dev/null 2>&1; then
            cert_b64=$(jq -r --arg dom "$DOMAIN" '.. | objects | select(.Certificates?) | .Certificates[]? | select(.domain.main == $dom or ((.domain.sans[]? // "") == $dom)) | .certificate' "$acme_file" 2>/dev/null | head -n 1)
            key_b64=$(jq -r --arg dom "$DOMAIN" '.. | objects | select(.Certificates?) | .Certificates[]? | select(.domain.main == $dom or ((.domain.sans[]? // "") == $dom)) | .key' "$acme_file" 2>/dev/null | head -n 1)
            if [ -n "$cert_b64" ] && [ "$cert_b64" != "null" ] && [ -n "$key_b64" ] && [ "$key_b64" != "null" ]; then
                echo "$cert_b64" | base64 -d > "$CERT_DIR/fullchain.pem"
                echo "$key_b64" | base64 -d > "$CERT_DIR/privkey.pem"
                echo "[TLS] Successfully extracted Let's Encrypt certificate for $DOMAIN from $acme_file"
                break
            fi
        fi
    fi
done

# 2. Check for Caddy certificate paths (if Coolify is using Caddy proxy)
CADDY_CERT_PATHS=(
    "/traefik/caddy/certificates/acme-v02.api.letsencrypt.org-directory/$DOMAIN/$DOMAIN.crt"
    "/data/coolify/proxy/caddy/certificates/acme-v02.api.letsencrypt.org-directory/$DOMAIN/$DOMAIN.crt"
)
for caddy_cert in "${CADDY_CERT_PATHS[@]}"; do
    caddy_key="${caddy_cert%.crt}.key"
    if [ -f "$caddy_cert" ] && [ -f "$caddy_key" ]; then
        cp "$caddy_cert" "$CERT_DIR/fullchain.pem"
        cp "$caddy_key" "$CERT_DIR/privkey.pem"
        echo "[TLS] Successfully copied Caddy Let's Encrypt certificate for $DOMAIN"
        break
    fi
done

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
