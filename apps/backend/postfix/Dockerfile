FROM debian:stable-slim

ENV DEBIAN_FRONTEND=noninteractive

# Install Postfix and mail utilities
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    postfix \
    mailutils \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Copy entrypoint script
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Copy send email script
COPY send-email.sh /usr/local/bin/send-email
RUN chmod +x /usr/local/bin/send-email

# Expose SMTP port
EXPOSE 25

ENTRYPOINT ["/entrypoint.sh"]
