FROM rspamd/rspamd:3.7

LABEL maintainer="https://github.com/reloop-labs"
LABEL author="Rudra Patel <https://github.com/rudra-2>"
LABEL description="Rspamd spam filtering configuration by Rudra Patel for ReloopLabs"
LABEL version="1.0.0"

COPY ../config/rspamd.conf /etc/rspamd/rspamd.conf
COPY ../config/local.d/ /etc/rspamd/local.d/

RUN mkdir -p /var/lib/rspamd /var/log/rspamd

EXPOSE 11332 11333 11334

CMD ["rspamd", "-f", "-u", "_rspamd", "-g", "_rspamd"]
