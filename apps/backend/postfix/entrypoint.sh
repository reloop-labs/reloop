#!/bin/bash

# Multi-domain Postfix + OpenDKIM Mail Server
# Supports comma-separated domains via MAIL_DOMAINS environment variable
# Falls back to single MAIL_DOMAIN for backwards compatibility

# Parse domains - support both MAIL_DOMAINS (comma-separated) and legacy MAIL_DOMAIN
if [ -n "$MAIL_DOMAINS" ]; then
    IFS=',' read -ra DOMAINS <<< "$MAIL_DOMAINS"
else
    DOMAINS=("${MAIL_DOMAIN:-localhost}")
fi

# Primary domain for Postfix hostname
PRIMARY_DOMAIN="${DOMAINS[0]}"
DKIM_SELECTOR="${DKIM_SELECTOR:-default}"

echo "==========================================="
echo "  Postfix + DKIM Multi-Domain Mail Server"
echo "  Primary Domain: $PRIMARY_DOMAIN"
echo "  All Domains: ${DOMAINS[*]}"
echo "  DKIM Selector: $DKIM_SELECTOR"
echo "==========================================="

# ----- DKIM SETUP FOR ALL DOMAINS -----
mkdir -p /etc/opendkim/keys
chown -R opendkim:opendkim /etc/opendkim
chmod 700 /etc/opendkim/keys

# Clear existing config files
> /etc/opendkim/KeyTable
> /etc/opendkim/SigningTable

# Initialize TrustedHosts with localhost
cat > /etc/opendkim/TrustedHosts << EOF
127.0.0.1
localhost
EOF

# Generate DKIM keys and config for each domain
for DOMAIN in "${DOMAINS[@]}"; do
    # Trim whitespace
    DOMAIN=$(echo "$DOMAIN" | tr -d '[:space:]')

    echo ""
    echo "--- Setting up DKIM for: $DOMAIN ---"

    DKIM_KEY_DIR="/etc/opendkim/keys/$DOMAIN"
    mkdir -p "$DKIM_KEY_DIR"

    # Generate DKIM keys if they don't exist
    if [ ! -f "$DKIM_KEY_DIR/$DKIM_SELECTOR.private" ]; then
        echo "Generating DKIM keys for $DOMAIN..."
        opendkim-genkey -b 2048 -d "$DOMAIN" -D "$DKIM_KEY_DIR" -s "$DKIM_SELECTOR" -v
        chown -R opendkim:opendkim "$DKIM_KEY_DIR"
        chmod 600 "$DKIM_KEY_DIR/$DKIM_SELECTOR.private"
        echo "DKIM keys generated for $DOMAIN!"
    else
        echo "Using existing DKIM keys for $DOMAIN"
    fi

    # Add to KeyTable: selector._domainkey.domain domain:selector:/path/to/key
    echo "$DKIM_SELECTOR._domainkey.$DOMAIN $DOMAIN:$DKIM_SELECTOR:$DKIM_KEY_DIR/$DKIM_SELECTOR.private" >> /etc/opendkim/KeyTable

    # Add to SigningTable: *@domain selector._domainkey.domain
    echo "*@$DOMAIN $DKIM_SELECTOR._domainkey.$DOMAIN" >> /etc/opendkim/SigningTable

    # Add domain and subdomain to TrustedHosts
    echo "$DOMAIN" >> /etc/opendkim/TrustedHosts
    echo "*.$DOMAIN" >> /etc/opendkim/TrustedHosts
done

chown -R opendkim:opendkim /etc/opendkim

# Configure OpenDKIM
cat > /etc/opendkim.conf << EOF
Syslog                  yes
LogWhy                  yes
UMask                   007
Mode                    sv
Canonicalization        relaxed/relaxed
KeyTable                /etc/opendkim/KeyTable
SigningTable            refile:/etc/opendkim/SigningTable
ExternalIgnoreList      /etc/opendkim/TrustedHosts
InternalHosts           /etc/opendkim/TrustedHosts
Socket                  inet:8891@localhost
PidFile                 /run/opendkim/opendkim.pid
UserID                  opendkim
EOF

# Create PID directory
mkdir -p /run/opendkim
chown opendkim:opendkim /run/opendkim

# ----- POSTFIX SETUP -----
postconf -e "myhostname=mail.$PRIMARY_DOMAIN"
postconf -e "mydomain=$PRIMARY_DOMAIN"
postconf -e "myorigin=\$mydomain"
postconf -e "inet_interfaces=all"
postconf -e "inet_protocols=ipv4"
postconf -e "mydestination=\$myhostname, localhost.\$mydomain, localhost"
postconf -e "mynetworks=127.0.0.0/8 [::1]/128 172.16.0.0/12 192.168.0.0/16 10.0.0.0/8"
postconf -e "maillog_file=/dev/stdout"

# DKIM milter configuration
postconf -e "milter_protocol=6"
postconf -e "milter_default_action=accept"
postconf -e "smtpd_milters=inet:localhost:8891"
postconf -e "non_smtpd_milters=inet:localhost:8891"

# ----- TLS SETUP -----
TLS_DIR="/etc/postfix/tls"
mkdir -p "$TLS_DIR"

# Generate self-signed certificate if it doesn't exist
if [ ! -f "$TLS_DIR/server.key" ]; then
    echo ""
    echo "Generating TLS certificate..."
    openssl req -new -x509 -days 3650 -nodes \
        -out "$TLS_DIR/server.crt" \
        -keyout "$TLS_DIR/server.key" \
        -subj "/CN=mail.$PRIMARY_DOMAIN/O=$PRIMARY_DOMAIN/C=US" 2>/dev/null
    chmod 600 "$TLS_DIR/server.key"
    echo "TLS certificate generated!"
fi

# Enable TLS for outbound connections (opportunistic)
postconf -e "smtp_tls_security_level=may"
postconf -e "smtp_tls_loglevel=1"
postconf -e "smtp_tls_CAfile=/etc/ssl/certs/ca-certificates.crt"

# Enable TLS for inbound connections
postconf -e "smtpd_tls_security_level=may"
postconf -e "smtpd_tls_cert_file=$TLS_DIR/server.crt"
postconf -e "smtpd_tls_key_file=$TLS_DIR/server.key"
postconf -e "smtpd_tls_loglevel=1"

# Relay restrictions
postconf -e "smtpd_relay_restrictions=permit_mynetworks, reject_unauth_destination"

# Create mail directory
mkdir -p /var/mail

# Generate aliases database
newaliases 2>/dev/null || true

# ----- PRINT DNS RECORDS FOR ALL DOMAINS -----
echo ""
echo "==========================================="
echo "  DNS RECORDS FOR ALL DOMAINS"
echo "==========================================="

for DOMAIN in "${DOMAINS[@]}"; do
    DOMAIN=$(echo "$DOMAIN" | tr -d '[:space:]')
    DKIM_KEY_DIR="/etc/opendkim/keys/$DOMAIN"

    echo ""
    echo "--- $DOMAIN ---"
    echo ""
    echo "DKIM Record:"
    echo "  Type: TXT"
    echo "  Name: $DKIM_SELECTOR._domainkey.$DOMAIN"
    echo "  Value:"
    cat "$DKIM_KEY_DIR/$DKIM_SELECTOR.txt" 2>/dev/null | sed 's/.*"p=/v=DKIM1; k=rsa; p=/' | tr -d '"\n\t ' | sed 's/)$//'
    echo ""
    echo ""
    echo "DMARC Record:"
    echo "  Type: TXT"
    echo "  Name: _dmarc.$DOMAIN"
    echo "  Value: v=DMARC1; p=quarantine; rua=mailto:dmarc@$DOMAIN"
    echo ""
done

echo "==========================================="
echo ""
echo "Starting OpenDKIM..."
opendkim -x /etc/opendkim.conf &
sleep 2

echo "Starting Postfix..."
echo ""
echo "To send an email, use:"
echo "  docker exec -it postfix send-email"
echo ""

# Start Postfix in foreground
exec postfix start-fg
