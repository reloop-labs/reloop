FROM ghcr.io/kumocorp/kumomta:latest

# Copy the configuration files to the expected location
COPY init.lua /opt/kumomta/etc/policy/init.lua
COPY policy /opt/kumomta/etc/policy/policy

# Create spool directories and set permissions
RUN mkdir -p /var/spool/kumomta/data /var/spool/kumomta/meta \
    && chown kumod:kumod /var/spool/kumomta/data /var/spool/kumomta/meta

# Expose SMTP and HTTP API ports
EXPOSE 25 8000

# Default command remains the same as base image
