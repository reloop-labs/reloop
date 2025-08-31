#!/bin/bash

# Set timezone
ln -snf /usr/share/zoneinfo/${TZ} /etc/localtime && echo ${TZ} > /etc/timezone

# Create necessary directories
mkdir -p /var/spool/postfix /var/log/mail /etc/postfix/sql /var/spool/postfix/private

# Update Postfix configuration with environment variables
sed -i "s/\${DB_HOST}/$DB_HOST/g" /etc/postfix/sql/*.cf
sed -i "s/\${DB_NAME}/$DB_NAME/g" /etc/postfix/sql/*.cf
sed -i "s/\${DB_USER}/$DB_USER/g" /etc/postfix/sql/*.cf
sed -i "s/\${DB_PASSWORD}/$DB_PASSWORD/g" /etc/postfix/sql/*.cf
sed -i "s/\${MAIL_HOSTNAME}/$MAIL_HOSTNAME/g" /etc/postfix/main.cf

# Set permissions
chown -R postfix:postfix /var/spool/postfix
chmod -R 755 /var/spool/postfix

# Initialize Postfix
postfix set-permissions
postfix check

# Start rsyslog
rsyslogd

# Start Postfix
postfix start

# Keep container running
tail -f /var/log/mail.log