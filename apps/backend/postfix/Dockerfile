FROM debian:stable-slim

ENV DEBIAN_FRONTEND=noninteractive

# Install Postfix, OpenDKIM, and mail utilities
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    postfix \
    opendkim \
    opendkim-tools \
    openssl \
    mailutils \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Create OpenDKIM directories
RUN mkdir -p /etc/opendkim/keys && \
    chown -R opendkim:opendkim /etc/opendkim && \
    chmod 700 /etc/opendkim/keys

# Copy entrypoint script
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Copy send email script
COPY send-email.sh /usr/local/bin/send-email
RUN chmod +x /usr/local/bin/send-email

# Expose SMTP port
EXPOSE 25

ENTRYPOINT ["/entrypoint.sh"]
