FROM ghcr.io/kumocorp/kumomta:latest

COPY init.lua /opt/kumomta/etc/policy/init.lua
COPY policy /opt/kumomta/etc/policy/policy
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

RUN mkdir -p /var/spool/kumomta/data /var/spool/kumomta/meta \
    && chown -R kumod:kumod /var/spool/kumomta/data /var/spool/kumomta/meta

EXPOSE 25 8000

ENTRYPOINT ["/entrypoint.sh"]
CMD ["/opt/kumomta/sbin/kumod", "--policy", "/opt/kumomta/etc/policy/init.lua", "--user", "kumod"]
