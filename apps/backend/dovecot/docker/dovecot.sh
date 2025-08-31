#!/bin/bash

# Set timezone
ln -snf /usr/share/zoneinfo/${TZ} /etc/localtime && echo ${TZ} > /etc/timezone

# Create necessary directories
mkdir -p /var/vmail /var/log/mail /etc/dovecot

# Update Dovecot configuration with environment variables
sed -i "s/\${DB_HOST}/$DB_HOST/g" /etc/dovecot/conf.d/dovecot-sql.conf.ext
sed -i "s/\${DB_NAME}/$DB_NAME/g" /etc/dovecot/conf.d/dovecot-sql.conf.ext
sed -i "s/\${DB_USER}/$DB_USER/g" /etc/dovecot/conf.d/dovecot-sql.conf.ext
sed -i "s/\${DB_PASSWORD}/$DB_PASSWORD/g" /etc/dovecot/conf.d/dovecot-sql.conf.ext

# Set permissions
chown -R vmail:vmail /var/vmail
chmod -R 755 /var/vmail

# Start rsyslog
rsyslogd

# Start Dovecot
dovecot -F
