#!/bin/bash
set -e

CERT_DIR="/opt/kumomta/etc/certs"
mkdir -p "$CERT_DIR"

DOMAIN="${SMTP_HOSTNAME:-${HOSTNAME:-smtp.reloop.sh}}"
DOMAIN=$(echo "$DOMAIN" | sed -e 's|^[^/]*//||' -e 's|/.*$||' -e 's|:.*$||')
EMAIL="${LETSENCRYPT_EMAIL:-admin@${DOMAIN}}"

# Every candidate certificate is compared and the one that expires last wins.
# acme.json can hold several entries for one domain (one per resolver, and
# old ones are kept), so taking the first match can install an expired cert
# even though Traefik itself serves the renewed one.
BEST_END=0
BEST_SOURCE=""
CANDIDATE_DIR=$(mktemp -d)

consider_cert() {
    local cert="$1" key="$2" source="$3" end end_epoch
    end=$(openssl x509 -noout -enddate -in "$cert" 2>/dev/null | cut -d= -f2)
    [ -n "$end" ] || return 0
    end_epoch=$(date -d "$end" +%s 2>/dev/null) || return 0
    echo "[TLS] Candidate from $source expires $end"
    if [ "$end_epoch" -gt "$BEST_END" ]; then
        cp "$cert" "$CERT_DIR/fullchain.pem"
        cp "$key" "$CERT_DIR/privkey.pem"
        BEST_END=$end_epoch
        BEST_SOURCE=$source
    fi
}

# 1. Coolify/Traefik acme.json
ACME_FILES=(
    "/traefik/acme.json"
    "/traefik/traefik/acme.json"
    "/data/coolify/proxy/acme.json"
    "/data/coolify/proxy/traefik/acme.json"
    "/certs/acme.json"
)

for acme_file in "${ACME_FILES[@]}"; do
    [ -f "$acme_file" ] && command -v jq >/dev/null 2>&1 || continue
    echo "[TLS] Found $acme_file, looking for $DOMAIN certificates..."
    n=0
    while read -r cert_b64 key_b64; do
        [ -n "$cert_b64" ] && [ "$cert_b64" != "null" ] && [ -n "$key_b64" ] && [ "$key_b64" != "null" ] || continue
        n=$((n + 1))
        echo "$cert_b64" | base64 -d > "$CANDIDATE_DIR/cert.pem"
        echo "$key_b64" | base64 -d > "$CANDIDATE_DIR/key.pem"
        consider_cert "$CANDIDATE_DIR/cert.pem" "$CANDIDATE_DIR/key.pem" "$acme_file #$n"
    done < <(jq -r --arg dom "$DOMAIN" '.. | objects | select(.Certificates?) | .Certificates[]? | select(.domain.main == $dom or ((.domain.sans // []) | index($dom))) | "\(.certificate) \(.key)"' "$acme_file" 2>/dev/null)
done

# 2. Caddy certificate files (<domain>.crt + .key). Caddy's data dir sits
# at different depths depending on how the proxy volume is mounted, so
# search the mounted proxy directories instead of fixed paths.
for root in /traefik /data/coolify/proxy /certs; do
    [ -d "$root" ] || continue
    while read -r caddy_cert; do
        caddy_key="${caddy_cert%.crt}.key"
        [ -f "$caddy_key" ] && consider_cert "$caddy_cert" "$caddy_key" "$caddy_cert"
    done < <(find "$root" -maxdepth 8 -type f -name "$DOMAIN.crt" -path "*/certificates/*" 2>/dev/null)
done

rm -rf "$CANDIDATE_DIR"

if [ "$BEST_END" -gt 0 ]; then
    echo "[TLS] Installed $DOMAIN certificate from $BEST_SOURCE, expires $(date -u -d "@$BEST_END")"
    if [ "$BEST_END" -le "$(date +%s)" ]; then
        echo "[TLS] WARNING: newest certificate found for $DOMAIN is already expired; check the proxy's renewal and that the mounted acme.json is the live one"
    fi
fi

# 3. If certificates are missing and AUTO_LETSENCRYPT=true, auto-generate via certbot
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
