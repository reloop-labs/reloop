FROM ghcr.io/kumocorp/kumomta:latest

# Install tools for DKIM key generation and debugging
USER root
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    openssl \
    ca-certificates \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create configuration directories
RUN mkdir -p /opt/kumomta/etc/policy /opt/kumomta/etc/dkim /opt/kumomta/etc/tls

# Copy configuration files
COPY init.lua /opt/kumomta/etc/policy/init.lua
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Expose SMTP port
EXPOSE 25 587 465

ENTRYPOINT ["/entrypoint.sh"]
