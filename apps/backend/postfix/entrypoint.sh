#!/bin/bash

# Use environment variable or default domain
DOMAIN="${MAIL_DOMAIN:-localhost}"

echo "==================================="
echo "  Postfix Minimal Mail Server"
echo "  Domain: $DOMAIN"
echo "==================================="

# Configure Postfix with the specified domain
postconf -e "myhostname=mail.$DOMAIN"
postconf -e "mydomain=$DOMAIN"
postconf -e "myorigin=\$mydomain"
postconf -e "inet_interfaces=all"
postconf -e "inet_protocols=ipv4"
postconf -e "mydestination=\$myhostname, localhost.\$mydomain, localhost, \$mydomain"
postconf -e "mynetworks=127.0.0.0/8 [::1]/128 172.16.0.0/12 192.168.0.0/16 10.0.0.0/8"
postconf -e "maillog_file=/dev/stdout"

# Disable authentication for local sending (development only!)
postconf -e "smtpd_relay_restrictions=permit_mynetworks, reject_unauth_destination"

# Create mail directory
mkdir -p /var/mail

# Generate aliases database
newaliases 2>/dev/null || true

echo ""
echo "Postfix configured! Starting server..."
echo ""
echo "To send an email, use:"
echo "  docker exec -it postfix-minimal send-email"
echo ""

# Start Postfix in foreground
exec postfix start-fg
