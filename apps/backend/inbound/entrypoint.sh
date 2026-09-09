#!/bin/bash
set -e

# Coolify/Docker named volumes are often created as root. kumod cannot
# initialize the spool unless these directories are writable by kumod.
mkdir -p /var/spool/kumomta/data /var/spool/kumomta/meta
chown -R kumod:kumod /var/spool/kumomta/data /var/spool/kumomta/meta 2>/dev/null || true

if [ "$#" -eq 0 ]; then
    exec /opt/kumomta/sbin/kumod --policy /opt/kumomta/etc/policy/init.lua --user kumod
else
    exec "$@"
fi
