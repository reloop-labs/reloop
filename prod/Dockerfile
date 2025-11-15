FROM debian:stable-slim

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    postfix \
    postfix-pgsql \
    ca-certificates \
    postgresql-client \
    curl \
    telnet \
    opendkim \
    opendkim-tools \
    sudo && \
    rm -rf /var/lib/apt/lists/*

RUN postconf -e maillog_file=/dev/stdout
COPY allowed_domains.cf /etc/postfix/allowed_domains.cf

RUN mkdir -p /etc/opendkim/keys && \
    chown -R opendkim:opendkim /etc/opendkim && \
    chmod -R 700 /etc/opendkim/keys

RUN cat > /etc/opendkim.conf << 'EOF'
Syslog yes
SyslogSuccess yes
LogWhy yes
UMask 002
Mode sv
SubDomains no
Canonicalization relaxed/simple
ExternalIgnoreList /etc/opendkim/TrustedHosts
InternalHosts /etc/opendkim/TrustedHosts
KeyTable /etc/opendkim/KeyTable
SigningTable /etc/opendkim/SigningTable
Socket inet:8891@localhost
PidFile /var/run/opendkim/opendkim.pid
OversignHeaders From
EOF

RUN echo '127.0.0.1' > /etc/opendkim/TrustedHosts && \
    echo 'localhost' >> /etc/opendkim/TrustedHosts && \
    echo '172.20.0.0/16' >> /etc/opendkim/TrustedHosts && \
    touch /etc/opendkim/KeyTable && \
    touch /etc/opendkim/SigningTable && \
    chown opendkim:opendkim /etc/opendkim/KeyTable /etc/opendkim/SigningTable

RUN cat > /usr/local/bin/sync-dkim-keys.sh << 'EOFSCRIPT'
#!/bin/bash
export PGPASSWORD="$PGPASSWORD"
psql -h "$PGHOST" -U "$PGUSER" -d "$PGDATABASE" -t -A -c "
SELECT 
    domain, 
    dkim_selector, 
    dkim_private_key 
FROM domain 
WHERE dkim_private_key IS NOT NULL 
    AND status = 'active';
" | while IFS='|' read -r domain selector private_key; do
    if [ -n "$domain" ] && [ -n "$selector" ] && [ -n "$private_key" ]; then
        mkdir -p "/etc/opendkim/keys/$domain"
        echo "$private_key" > "/etc/opendkim/keys/$domain/$selector.private"
        chown opendkim:opendkim "/etc/opendkim/keys/$domain/$selector.private"
        chmod 600 "/etc/opendkim/keys/$domain/$selector.private"
        
        grep -q "$selector._domainkey.$domain" /etc/opendkim/KeyTable || \
            echo "$selector._domainkey.$domain $domain:$selector:/etc/opendkim/keys/$domain/$selector.private" >> /etc/opendkim/KeyTable
        
        grep -q "*@$domain" /etc/opendkim/SigningTable || \
            echo "*@$domain $selector._domainkey.$domain" >> /etc/opendkim/SigningTable
        
        echo "[DKIM] Configured $domain with selector $selector"
    fi
done
if [ -s /etc/opendkim/KeyTable ]; then
    pkill -HUP opendkim 2>/dev/null || true
    echo "[DKIM] Keys synced and OpenDKIM reloaded"
fi
EOFSCRIPT

RUN chmod +x /usr/local/bin/sync-dkim-keys.sh

CMD \
    /usr/local/bin/sync-dkim-keys.sh && \
    postconf -e "smtpd_sender_restrictions=check_sender_access proxy:pgsql:/etc/postfix/allowed_domains.cf, reject" && \
    postconf -e "smtpd_recipient_restrictions=permit_mynetworks, reject_unauth_destination" && \
    postconf -e "smtpd_relay_restrictions=permit_mynetworks, reject_unauth_destination" && \
    postconf -e "myhostname=${MYHOSTNAME:-localhost}" && \
    postconf -e "myorigin=${MYORIGIN:-localhost}" && \
    postconf -e "mydestination=" && \
    postconf -e "inet_interfaces=all" && \
    postconf -e "mynetworks=127.0.0.0/8, [::1]/128, [fe80::]/10, 172.20.0.0/16" && \
    postconf -e "smtpd_milters=inet:localhost:8891" && \
    postconf -e "non_smtpd_milters=inet:localhost:8891" && \
    postconf -e "milter_protocol=6" && \
    postconf -e "milter_default_action=accept" && \
    echo 'submission inet n - n - - smtpd' >> /etc/postfix/master.cf && \
    newaliases && \
    mkdir -p /var/run/opendkim && \
    chown opendkim:opendkim /var/run/opendkim && \
    sudo -u opendkim opendkim && \
    postfix start-fg
