#!/usr/bin/env bash
set -Eeuo pipefail

INSTALLER_VERSION="1.0.0"
INSTALLER_URL="https://reloop.sh/install.sh"

INSTALL_DIR="${RELOOP_INSTALL_DIR:-/opt/reloop}"
INSTALL_REF="${RELOOP_INSTALL_REF:-main}"
ASSET_BASE_URL="${RELOOP_INSTALL_BASE_URL:-https://raw.githubusercontent.com/reloop-labs/reloop/$INSTALL_REF/install}"

RELOOP_VERSION="${RELOOP_VERSION:-}"
RELOOP_DOMAIN="${RELOOP_DOMAIN:-}"
RELOOP_ADMIN_EMAIL="${RELOOP_ADMIN_EMAIL:-}"
RELOOP_PUBLIC_IP="${RELOOP_PUBLIC_IP:-}"
RELOOP_HTTPS="${RELOOP_HTTPS:-}"
POSTGRES_DB="${RELOOP_DB_NAME:-}"
POSTGRES_USER="${RELOOP_DB_USER:-}"
RELOOP_S3="${RELOOP_S3:-}"
S3_ENDPOINT="${RELOOP_S3_ENDPOINT:-}"
S3_ACCESS_KEY="${RELOOP_S3_ACCESS_KEY:-}"
S3_SECRET_KEY="${RELOOP_S3_SECRET_KEY:-}"
S3_BUCKET="${RELOOP_S3_BUCKET:-}"
S3_REGION="${RELOOP_S3_REGION:-}"

NONINTERACTIVE=0
case "${RELOOP_NONINTERACTIVE:-}" in
1 | true | yes) NONINTERACTIVE=1 ;;
esac
ALLOW_UNSUPPORTED_OS=0
case "${RELOOP_ALLOW_UNSUPPORTED_OS:-}" in
1 | true | yes) ALLOW_UNSUPPORTED_OS=1 ;;
esac
EXISTING_ACTION="${RELOOP_EXISTING:-}"

HEALTH_TIMEOUT="${RELOOP_HEALTH_TIMEOUT:-240}"
HEALTH_TIMEOUT_FOLLOWUP="${RELOOP_HEALTH_TIMEOUT_FOLLOWUP:-60}"

REQUIRED_PORTS=(80 443 25 465 587)
declare -A PORT_PURPOSE=(
	[80]="HTTP — ACME challenges and the redirect to HTTPS"
	[443]="HTTPS — the Reloop dashboard and API"
	[25]="SMTP — inbound mail delivered to your domains"
	[465]="SMTPS — outbound submission"
	[587]="Submission — outbound submission with STARTTLS"
)

ASSET_DIR=""
SELF_DIR=""

cleanup() {
	local code=$?
	if [ -n "$ASSET_DIR" ] && [ "${ASSET_DIR_IS_TEMP:-0}" = "1" ]; then
		rm -rf "$ASSET_DIR"
	fi
	if [ -n "${TTY_FD:-}" ]; then
		exec 3>&- 2>/dev/null || true
	fi
	exit "$code"
}

on_error() {
	local line="$1"
	printf '\n\033[31m[ERROR]\033[0m The installer stopped unexpectedly at line %s.\n' "$line" >&2
	printf 'Re-running the installer is safe: it keeps the existing configuration and data.\n' >&2
}

fetch_assets() {
	if [ -n "${BASH_SOURCE[0]:-}" ] && [ -f "${BASH_SOURCE[0]}" ]; then
		SELF_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
	fi

	if [ -n "$SELF_DIR" ] && [ -d "$SELF_DIR/lib" ] && [ -d "$SELF_DIR/templates" ]; then
		ASSET_DIR="$SELF_DIR"
		ASSET_DIR_IS_TEMP=0
		return 0
	fi

	ASSET_DIR="$(mktemp -d -t reloop-install.XXXXXXXX)"
	ASSET_DIR_IS_TEMP=1
	chmod 700 "$ASSET_DIR"
	mkdir -p "$ASSET_DIR/lib" "$ASSET_DIR/templates"

	local proto='=https'
	case "$ASSET_BASE_URL" in
	http://*) proto='=http,https' ;;
	esac

	local f
	for f in lib/common.sh lib/prompts.sh lib/preflight.sh lib/docker.sh \
		lib/config.sh lib/deploy.sh lib/health.sh lib/dns.sh \
		templates/docker-compose.yml templates/Caddyfile templates/Caddyfile.http \
		templates/reloop; do
		curl -fsSL --proto "$proto" --proto-redir "$proto" \
			--retry 3 --retry-delay 2 --max-time 120 \
			-o "$ASSET_DIR/$f" "$ASSET_BASE_URL/$f" ||
			{
				printf 'Failed to download installer component: %s\n' "$f" >&2
				printf 'Source: %s\n' "$ASSET_BASE_URL/$f" >&2
				exit 1
			}
	done
}

trap 'on_error $LINENO' ERR
trap cleanup EXIT

fetch_assets

# shellcheck source=lib/common.sh
. "$ASSET_DIR/lib/common.sh"
# shellcheck source=lib/prompts.sh
. "$ASSET_DIR/lib/prompts.sh"
# shellcheck source=lib/preflight.sh
. "$ASSET_DIR/lib/preflight.sh"
# shellcheck source=lib/docker.sh
. "$ASSET_DIR/lib/docker.sh"
# shellcheck source=lib/config.sh
. "$ASSET_DIR/lib/config.sh"
# shellcheck source=lib/dns.sh
. "$ASSET_DIR/lib/dns.sh"
# shellcheck source=lib/deploy.sh
. "$ASSET_DIR/lib/deploy.sh"
# shellcheck source=lib/health.sh
. "$ASSET_DIR/lib/health.sh"

print_summary() {
	local apex
	apex="$(zone_apex "$RELOOP_DOMAIN")"

	printf '\n'
	rule
	printf 'Reloop installation complete\n'
	rule

	printf '\nApplication domain:\n%s\n' "$RELOOP_DOMAIN"
	printf '\nServer IPv4:\n%s\n' "$RELOOP_PUBLIC_IP"

	dns_instructions "$apex"

	printf '\nNAME values are relative to the %s zone.\n' "$apex"

	printf '\nWhat each record is for:\n'
	printf '  %-38s dashboard, API and Let'"'"'s Encrypt validation\n' "$RELOOP_DOMAIN"
	printf '  %-38s click and open tracking, unsubscribe pages\n' "$RELOOP_TRACKING_HOST"
	printf '  %-38s MX target for mail your domains receive\n' "$RELOOP_INBOUND_HOST"
	printf '  %-38s authorises this server to send for the host domain\n' "SPF TXT"

	printf '\nOnce DNS propagates, Reloop will be available at:\n'
	printf '%s://%s\n' "$RELOOP_SCHEME" "$RELOOP_DOMAIN"

	if [ "$RELOOP_HTTPS" = "yes" ]; then
		printf '\nHTTPS: Caddy requests a certificate as soon as %s resolves to\n' "$RELOOP_DOMAIN"
		printf '%s. It retries automatically — no action needed after DNS is added.\n' "$RELOOP_PUBLIC_IP"
		printf 'Watch it happen with:  reloop logs proxy\n'
	else
		printf '\nHTTPS is disabled. Reloop is served over plain HTTP on port 80.\n'
	fi

	printf '\n'
	rule
	printf 'First sign-in\n'
	rule
	printf '\n  1. Open %s://%s/dashboard\n' "$RELOOP_SCHEME" "$RELOOP_DOMAIN"
	printf '  2. Sign up with %s\n' "$RELOOP_ADMIN_EMAIL"
	printf '  3. Enter this one-time code when asked:  %s\n' "$DEFAULT_OTP"
	printf '\n  Reloop cannot email a code until one of your own domains is verified,\n'
	printf '  so this fixed code stands in. Remove DEFAULT_OTP from %s/.env\n' "$INSTALL_DIR"
	printf '  and run "reloop restart auth" once your domain is sending mail.\n'

	printf '\n'
	rule
	printf 'Sending and receiving domains\n'
	rule
	printf '\n  The records above only cover this Reloop installation. The SPF, DKIM,\n'
	printf '  DMARC and MX records for the domains you send from are generated by\n'
	printf '  Reloop itself — add a domain under Domains in the dashboard and it\n'
	printf '  shows the exact records for that domain.\n'

	printf '\n'
	rule
	printf 'Managing this installation\n'
	rule
	printf '\n  reloop status          container health\n'
	printf '  reloop logs [service]  follow logs\n'
	printf '  reloop restart         restart the stack\n'
	printf '  reloop update          pull new images and redeploy\n'
	printf '\n  Configuration: %s/.env (root-only, holds every secret)\n' "$INSTALL_DIR"

	if [ "$STORAGE_ENABLED" != "yes" ]; then
		printf '\n  File uploads are off: no S3 storage was configured. Set the S3_*\n'
		printf '  values and COMPOSE_PROFILES=storage in %s/.env, then run\n' "$INSTALL_DIR"
		printf '  "reloop restart" to turn them on.\n'
	fi

	printf '\n'
}

main() {
	open_tty

	heading "Reloop Self-Host Installer ${INSTALLER_VERSION}"

	preflight
	ensure_docker
	check_ports

	install -d -m 0755 -o root -g root "$INSTALL_DIR"
	ok "Installation directory: $INSTALL_DIR"

	detect_existing_install
	collect_configuration
	detect_public_ip

	write_env_file
	write_stack_files

	pull_images
	start_infrastructure
	run_migrations
	start_application
	verify_deployment

	print_summary
}

main "$@"
