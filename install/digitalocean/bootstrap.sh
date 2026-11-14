#!/usr/bin/env bash
set -Eeuo pipefail
umask 077

exec >/var/log/reloop-install.log 2>&1
trap 'printf "failed\n" >/var/lib/reloop-install.status' ERR
printf 'installing\n' >/var/lib/reloop-install.status

export DEBIAN_FRONTEND=noninteractive
apt-get update
apt-get install -y ca-certificates curl

export RELOOP_NONINTERACTIVE=1
export RELOOP_EXISTING=continue
export RELOOP_HTTPS=yes
export RELOOP_EXTERNAL_PROXY=no
export RELOOP_S3=no
export RELOOP_PUBLIC_IP
RELOOP_PUBLIC_IP="$(curl -fsS --retry 3 --max-time 15 http://169.254.169.254/metadata/v1/interfaces/public/0/ipv4/address)"

curl -fsSL --proto '=https' --proto-redir '=https' --retry 3 --max-time 120 \
	"$RELOOP_INSTALL_BASE_URL/install.sh" -o /root/reloop-install.sh
bash /root/reloop-install.sh

printf 'installed\n' >/var/lib/reloop-install.status
