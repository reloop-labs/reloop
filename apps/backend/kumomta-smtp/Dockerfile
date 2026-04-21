FROM ghcr.io/kumocorp/kumomta:latest

# Copy the configuration file to the expected location
COPY init.lua /opt/kumomta/etc/policy/init.lua

# Expose SMTP and HTTP API ports
EXPOSE 25 8000

# Default command remains the same as base image
