FROM ubuntu:22.04

LABEL maintainer="Reloop Mail Server"

ARG DEBIAN_FRONTEND=noninteractive
ENV LC_ALL=C

# Install required packages with retry mechanism
RUN apt-get clean && \
    apt-get update --fix-missing && \
    apt-get install -y --no-install-recommends \
    dovecot-core \
    dovecot-dev \
    dovecot-pop3d \
    dovecot-imapd \
    dovecot-lmtpd \
    dovecot-pgsql \
    dovecot-sieve \
    sasl2-bin \
    libsasl2-modules \
    postgresql-client \
    ca-certificates \
    curl \
    supervisor \
    rsyslog \
    tzdata \
    cron \
    && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Create vmail user and group (handle existing groups/users)
RUN groupadd -g 5000 vmail 2>/dev/null || true \
    && useradd -g vmail -u 5000 vmail -d /var/vmail -s /usr/sbin/nologin 2>/dev/null || true

# Copy configuration files
COPY dovecot.sh /dovecot.sh
COPY supervisord.conf /etc/supervisor/supervisord.conf

# Make scripts executable
RUN chmod +x /dovecot.sh

# Create necessary directories
RUN mkdir -p /var/vmail /var/log/mail /usr/lib/dovecot/sieve

# Copy sieve scripts
COPY spam-to-folder.sieve /usr/lib/dovecot/sieve/spam-to-folder.sieve
COPY report-spam.sieve /usr/lib/dovecot/sieve/report-spam.sieve
COPY report-ham.sieve /usr/lib/dovecot/sieve/report-ham.sieve

# Expose ports
EXPOSE 110 143 993 995

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/supervisord.conf"]
