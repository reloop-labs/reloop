FROM debian:stable-slim

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && \
    apt-get install -y --no-install-recommends postfix postfix-pgsql ca-certificates postgresql-client curl telnet && \
    rm -rf /var/lib/apt/lists/*


RUN postconf -e maillog_file=/dev/stdout
COPY allowed_domains.cf /etc/postfix/allowed_domains.cf
CMD \
    postconf -e "smtpd_sender_restrictions=check_sender_access proxy:pgsql:/etc/postfix/allowed_domains.cf, reject" && \
    postconf -e "smtpd_recipient_restrictions=permit_mynetworks, reject_unauth_destination" && \
    postconf -e "smtpd_relay_restrictions=permit_mynetworks, reject_unauth_destination" && \
    postconf -e "myhostname=${MYHOSTNAME:-localhost}" && \
    postconf -e "myorigin=${MYORIGIN:-localhost}" && \
    postconf -e "mydestination=" && \
    postconf -e "inet_interfaces=all" && \
    postconf -e "mynetworks=127.0.0.0/8, [::1]/128, [fe80::]/10, 172.20.0.0/16" && \
    echo 'submission inet n - n - - smtpd' >> /etc/postfix/master.cf && \
    newaliases && \
    postfix start-fg
