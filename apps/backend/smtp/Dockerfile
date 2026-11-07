FROM ghcr.io/kumocorp/kumomta:latest

# Upgrade base packages so libbrotli (used by curl and certbot) picks up the
# distro fix for CVE-2026-111497 instead of whatever the base image shipped.
RUN apt-get update && apt-get upgrade -y \
    && apt-get install -y --no-install-recommends \
    libbrotli1 \
    certbot \
    jq \
    openssl \
    ca-certificates \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY init.lua /opt/kumomta/etc/policy/init.lua
COPY policy /opt/kumomta/etc/policy/policy
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

RUN mkdir -p /var/spool/kumomta/data /var/spool/kumomta/meta /opt/kumomta/etc/certs \
    && chown -R kumod:kumod /var/spool/kumomta/data /var/spool/kumomta/meta /opt/kumomta/etc/certs

EXPOSE 465 587 2025 2465 2587 8000

ENTRYPOINT ["/entrypoint.sh"]
CMD ["/opt/kumomta/sbin/kumod", "--policy", "/opt/kumomta/etc/policy/init.lua", "--user", "kumod"]
