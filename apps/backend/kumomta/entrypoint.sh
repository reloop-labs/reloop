#!/bin/bash

# KumoMTA Entrypoint script
# Sets up DKIM keys and TLS certificates based on environment variables

# Parse domains
if [ -n "$MAIL_DOMAINS" ]; then
    IFS=',' read -ra DOMAINS <<< "$MAIL_DOMAINS"
else
    DOMAINS=("${MAIL_DOMAIN:-localhost}")
fi

PRIMARY_DOMAIN="${DOMAINS[0]}"
DKIM_SELECTOR="${DKIM_SELECTOR:-default}"

echo "==========================================="
# Updated the name from Postfix to KumoMTA
echo "  KumoMTA Multi-Domain Mail Server"
echo "  Primary Domain: $PRIMARY_DOMAIN"
echo "  All Domains: ${DOMAINS[*]}"
echo "  DKIM Selector: $DKIM_SELECTOR"
echo "==========================================="

# ----- DKIM SETUP -----
mkdir -p /opt/kumomta/etc/dkim

for DOMAIN in "${DOMAINS[@]}"; do
    DOMAIN=$(echo "$DOMAIN" | tr -d '[:space:]')
    DOMAIN_DIR="/opt/kumomta/etc/dkim/$DOMAIN"
    mkdir -p "$DOMAIN_DIR"

    # Generate DKIM keys if they don't exist
    if [ ! -f "$DOMAIN_DIR/$DKIM_SELECTOR.key" ]; then
        echo "Generating DKIM keys for $DOMAIN..."
        openssl genrsa -out "$DOMAIN_DIR/$DKIM_SELECTOR.key" 2048
        openssl rsa -in "$DOMAIN_DIR/$DKIM_SELECTOR.key" -pubout -out "$DOMAIN_DIR/$DKIM_SELECTOR.pub"

        # Create a simplified .txt file for DNS records (similar to opendkim-genkey)
        PUB_KEY=$(openssl rsa -in "$DOMAIN_DIR/$DKIM_SELECTOR.key" -pubout -outform DER | openssl base64 -A)
        echo "v=DKIM1; k=rsa; p=$PUB_KEY" > "$DOMAIN_DIR/$DKIM_SELECTOR.txt"

        chmod 600 "$DOMAIN_DIR/$DKIM_SELECTOR.key"
        echo "DKIM keys generated for $DOMAIN!"
    fi
done

# ----- TLS SETUP -----
TLS_DIR="/opt/kumomta/etc/tls"
mkdir -p "$TLS_DIR"

if [ ! -f "$TLS_DIR/server.key" ]; then
    echo "Generating TLS certificate..."
    openssl req -new -x509 -days 3650 -nodes \
        -out "$TLS_DIR/server.crt" \
        -keyout "$TLS_DIR/server.key" \
        -subj "/CN=mail.$PRIMARY_DOMAIN/O=$PRIMARY_DOMAIN/C=US" 2>/dev/null
    chmod 600 "$TLS_DIR/server.key"
    echo "TLS certificate generated!"
fi

# ----- PRINT DNS RECORDS -----
echo ""
echo "==========================================="
echo "  DNS RECORDS FOR ALL DOMAINS"
echo "==========================================="

for DOMAIN in "${DOMAINS[@]}"; do
    DOMAIN=$(echo "$DOMAIN" | tr -d '[:space:]')
    echo ""
    echo "--- $DOMAIN ---"
    echo ""
    echo "DKIM Record:"
    echo "  Type: TXT"
    echo "  Name: $DKIM_SELECTOR._domainkey.$DOMAIN"
    echo "  Value: $(cat "/opt/kumomta/etc/dkim/$DOMAIN/$DKIM_SELECTOR.txt")"
done
echo "==========================================="
echo ""

# Start KumoMTA
echo "Starting KumoMTA..."
exec /opt/kumomta/sbin/kumod --policy /opt/kumomta/etc/policy/init.lua
