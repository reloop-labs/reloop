FROM ghcr.io/kumocorp/kumomta:latest

COPY init.lua /opt/kumomta/etc/policy/init.lua
COPY policy /opt/kumomta/etc/policy/policy

RUN mkdir -p /var/spool/kumomta/data /var/spool/kumomta/meta \
    && chown kumod:kumod /var/spool/kumomta/data /var/spool/kumomta/meta

EXPOSE 465 587 2025 2465 2587 8000
