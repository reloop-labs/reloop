#!/bin/bash

# Use environment variable or default domain
DOMAIN="${MAIL_DOMAIN:-localhost}"
DKIM_SELECTOR="${DKIM_SELECTOR:-default}"

echo "==========================================="
echo "  Postfix + DKIM Mail Server"
echo "  Domain: $DOMAIN"
echo "  DKIM Selector: $DKIM_SELECTOR"
echo "==========================================="

# ----- DKIM SETUP -----
DKIM_KEY_DIR="/etc/opendkim/keys/$DOMAIN"
mkdir -p "$DKIM_KEY_DIR"

# Generate DKIM keys if they don't exist
if [ ! -f "$DKIM_KEY_DIR/$DKIM_SELECTOR.private" ]; then
    echo ""
    echo "Generating DKIM keys..."
    opendkim-genkey -b 2048 -d "$DOMAIN" -D "$DKIM_KEY_DIR" -s "$DKIM_SELECTOR" -v
    chown -R opendkim:opendkim /etc/opendkim
    chmod 600 "$DKIM_KEY_DIR/$DKIM_SELECTOR.private"
    echo "DKIM keys generated!"
fi

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

# Create KeyTable
echo "$DKIM_SELECTOR._domainkey.$DOMAIN $DOMAIN:$DKIM_SELECTOR:$DKIM_KEY_DIR/$DKIM_SELECTOR.private" > /etc/opendkim/KeyTable

# Create SigningTable
echo "*@$DOMAIN $DKIM_SELECTOR._domainkey.$DOMAIN" > /etc/opendkim/SigningTable

# Create TrustedHosts
cat > /etc/opendkim/TrustedHosts << EOF
127.0.0.1
localhost
$DOMAIN
*.$DOMAIN
EOF

chown -R opendkim:opendkim /etc/opendkim

# Create PID directory
mkdir -p /run/opendkim
chown opendkim:opendkim /run/opendkim

# ----- POSTFIX SETUP -----
postconf -e "myhostname=mail.$DOMAIN"
postconf -e "mydomain=$DOMAIN"
postconf -e "myorigin=\$mydomain"
postconf -e "inet_interfaces=all"
postconf -e "inet_protocols=ipv4"
postconf -e "mydestination=\$myhostname, localhost.\$mydomain, localhost, \$mydomain"
postconf -e "mynetworks=127.0.0.0/8 [::1]/128 172.16.0.0/12 192.168.0.0/16 10.0.0.0/8"
postconf -e "maillog_file=/dev/stdout"

# DKIM milter configuration
postconf -e "milter_protocol=6"
postconf -e "milter_default_action=accept"
postconf -e "smtpd_milters=inet:localhost:8891"
postconf -e "non_smtpd_milters=inet:localhost:8891"

# Relay restrictions
postconf -e "smtpd_relay_restrictions=permit_mynetworks, reject_unauth_destination"

# Create mail directory
mkdir -p /var/mail

# Generate aliases database
newaliases 2>/dev/null || true

echo ""
echo "==========================================="
echo "  DKIM DNS RECORD (add this to your DNS):"
echo "==========================================="
echo ""
echo "Type: TXT"
echo "Name: $DKIM_SELECTOR._domainkey.$DOMAIN"
echo "Value:"
cat "$DKIM_KEY_DIR/$DKIM_SELECTOR.txt" 2>/dev/null | sed 's/.*"p=/v=DKIM1; k=rsa; p=/' | tr -d '"\n\t ' | sed 's/)$//'
echo ""
echo ""
echo "==========================================="
echo "  DMARC DNS RECORD (add this to your DNS):"
echo "==========================================="
echo ""
echo "Type: TXT"
echo "Name: _dmarc.$DOMAIN"
echo "Value: v=DMARC1; p=quarantine; rua=mailto:dmarc@$DOMAIN"
echo ""
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
