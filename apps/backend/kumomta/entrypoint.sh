#!/bin/bash

# KumoMTA Entrypoint script
# All domain and DKIM configuration is now DB-driven via the mail service API.
# This script only handles server-level TLS setup and starts KumoMTA.

MAIL_HOSTNAME="${MAIL_HOSTNAME:-mail.localhost}"

echo "==========================================="
echo "  KumoMTA Mail Server"
echo "  Hostname: $MAIL_HOSTNAME"
echo "  Config: DB-driven (via mail service API)"
echo "==========================================="

# ----- TLS SETUP -----
TLS_DIR="/opt/kumomta/etc/tls"
mkdir -p "$TLS_DIR"

if [ ! -f "$TLS_DIR/server.key" ]; then
    echo "Generating self-signed TLS certificate..."
    openssl req -new -x509 -days 3650 -nodes \
        -out "$TLS_DIR/server.crt" \
        -keyout "$TLS_DIR/server.key" \
        -subj "/CN=$MAIL_HOSTNAME/O=KumoMTA/C=US" 2>/dev/null
    chmod 600 "$TLS_DIR/server.key"
    echo "TLS certificate generated!"
fi

# Start KumoMTA
echo ""
echo "Starting KumoMTA..."
echo "  DKIM keys: fetched from database at signing time"
echo "  Domains:   resolved dynamically per message"
echo ""
exec /opt/kumomta/sbin/kumod --policy /opt/kumomta/etc/policy/init.lua
