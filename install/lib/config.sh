#!/usr/bin/env bash

ENV_FILE=""
EXISTING_INSTALL=0
REUSE_CONFIG=0

env_get() {
	local key="$1" file="$2"
	[ -f "$file" ] || return 1
	sed -n "s/^${key}=\(.*\)$/\1/p" "$file" | tail -1
}

detect_existing_install() {
	ENV_FILE="$INSTALL_DIR/.env"
	[ -f "$ENV_FILE" ] || return 0

	EXISTING_INSTALL=1
	local existing_domain
	existing_domain="$(env_get RELOOP_DOMAIN "$ENV_FILE" || true)"

	heading "Existing Reloop installation detected"
	printf '  Location: %s\n' "$INSTALL_DIR"
	[ -n "$existing_domain" ] && printf '  Domain:   %s\n' "$existing_domain"

	if [ "$NONINTERACTIVE" = "1" ]; then
		case "$EXISTING_ACTION" in
		abort) die "An installation already exists at $INSTALL_DIR (RELOOP_EXISTING=abort)." ;;
		reconfigure) REUSE_CONFIG=0 ;;
		continue) REUSE_CONFIG=1 ;;
		*) die "Set RELOOP_EXISTING to abort, reconfigure or continue for a non-interactive re-run." ;;
		esac
		return 0
	fi

	local choice
	ask_choice choice "How would you like to proceed?" \
		"Abort — change nothing" \
		"Reconfigure — re-ask domain and HTTPS settings, keep data and secrets" \
		"Continue — redeploy with the existing configuration"

	case "$choice" in
	1) die "Aborted. Nothing was changed." ;;
	2) REUSE_CONFIG=0 ;;
	3) REUSE_CONFIG=1 ;;
	esac
}

load_existing_values() {
	local key
	for key in RELOOP_VERSION RELOOP_DOMAIN RELOOP_ADMIN_EMAIL RELOOP_PUBLIC_IP \
		RELOOP_HTTPS POSTGRES_DB POSTGRES_USER POSTGRES_PASSWORD REDIS_PASSWORD \
		BETTER_AUTH_SECRET RELOOP_INTERNAL_SECRET TRACKING_SECRET PREFERENCES_SECRET \
		WEBHOOK_ENCRYPTION_KEY S3_ENDPOINT S3_ACCESS_KEY S3_SECRET_KEY \
		S3_BUCKET S3_REGION DEFAULT_OTP; do
		local value
		value="$(env_get "$key" "$ENV_FILE" || true)"
		if [ -n "$value" ]; then
			printf -v "PRESERVED_$key" '%s' "$value"
		fi
	done
}

preserved_or_new() {
	local key="$1" generator="$2" length="$3"
	local ref="PRESERVED_$key"
	if [ -n "${!ref-}" ]; then
		printf -v "$key" '%s' "${!ref}"
	else
		printf -v "$key" '%s' "$("$generator" "$length")"
	fi
}

collect_storage() {
	local fallback=no
	[ -n "${PRESERVED_S3_ENDPOINT:-}" ] && fallback=yes

	ask_yes_no RELOOP_S3 \
		"Configure S3-compatible object storage (needed for file uploads)" "$fallback"

	if [ "$RELOOP_S3" != "yes" ]; then
		STORAGE_ENABLED=no
		COMPOSE_PROFILES=""
		S3_ENDPOINT=""
		S3_ACCESS_KEY=""
		S3_SECRET_KEY=""
		S3_BUCKET=""
		S3_REGION=""
		return 0
	fi

	STORAGE_ENABLED=yes
	COMPOSE_PROFILES=storage

	ask S3_ENDPOINT "S3 endpoint URL" \
		"e.g. https://s3.eu-central-1.amazonaws.com" \
		"${PRESERVED_S3_ENDPOINT:-}" valid_url \
		"Enter a full URL including https://"
	ask S3_ACCESS_KEY "S3 access key" "" \
		"${PRESERVED_S3_ACCESS_KEY:-}" valid_any ""
	ask S3_SECRET_KEY "S3 secret key" "" \
		"${PRESERVED_S3_SECRET_KEY:-}" valid_any ""
	ask S3_BUCKET "S3 bucket" "" \
		"${PRESERVED_S3_BUCKET:-reloop-uploads}" valid_any ""
	ask S3_REGION "S3 region" "" \
		"${PRESERVED_S3_REGION:-us-east-1}" valid_any ""
}

collect_configuration() {
	STORAGE_ENABLED=no
	COMPOSE_PROFILES=""
	S3_ENDPOINT="${S3_ENDPOINT:-}"
	S3_ACCESS_KEY="${S3_ACCESS_KEY:-}"
	S3_SECRET_KEY="${S3_SECRET_KEY:-}"
	S3_BUCKET="${S3_BUCKET:-}"
	S3_REGION="${S3_REGION:-}"

	if [ "$EXISTING_INSTALL" = "1" ]; then
		load_existing_values
	fi

	if [ "$REUSE_CONFIG" = "1" ]; then
		local key
		for key in RELOOP_DOMAIN RELOOP_ADMIN_EMAIL RELOOP_HTTPS RELOOP_PUBLIC_IP \
			POSTGRES_DB POSTGRES_USER S3_ENDPOINT S3_ACCESS_KEY S3_SECRET_KEY \
			S3_BUCKET S3_REGION; do
			local ref="PRESERVED_$key"
			[ -n "${!ref-}" ] && printf -v "$key" '%s' "${!ref}"
		done
		if [ -n "$S3_ENDPOINT" ]; then
			STORAGE_ENABLED=yes
			COMPOSE_PROFILES=storage
		fi
		step "Using the existing configuration"
		ok "Domain: $RELOOP_DOMAIN"
		ok "Administrator email: $RELOOP_ADMIN_EMAIL"
	else
		step "Configuration"

		ask RELOOP_DOMAIN "Primary Reloop domain" \
			"The hostname Reloop will be served on, e.g. reloop.example.com" \
			"${PRESERVED_RELOOP_DOMAIN:-}" valid_hostname \
			"Enter a bare hostname — no scheme, no path, no port. Example: reloop.example.com"

		ask RELOOP_ADMIN_EMAIL "Administrator email" \
			"Used for Let's Encrypt notices and as your first Reloop account" \
			"${PRESERVED_RELOOP_ADMIN_EMAIL:-}" valid_email \
			"Enter a valid email address, e.g. admin@example.com"

		ask POSTGRES_DB "Database name" "" \
			"${PRESERVED_POSTGRES_DB:-reloop}" valid_pg_identifier \
			"Use lowercase letters, digits and underscores, starting with a letter."

		ask POSTGRES_USER "Database user" "" \
			"${PRESERVED_POSTGRES_USER:-reloop}" valid_pg_identifier \
			"Use lowercase letters, digits and underscores, starting with a letter."

		ask_yes_no RELOOP_HTTPS "Configure automatic HTTPS" "${PRESERVED_RELOOP_HTTPS:-yes}"

		collect_storage
	fi

	if [ "$EXISTING_INSTALL" = "1" ] && [ -n "${PRESERVED_POSTGRES_USER:-}" ] &&
		{ [ "$POSTGRES_USER" != "$PRESERVED_POSTGRES_USER" ] ||
			[ "$POSTGRES_DB" != "${PRESERVED_POSTGRES_DB:-}" ]; }; then
		die "The database name and user cannot be changed on an existing installation." \
			"The current database is $PRESERVED_POSTGRES_DB owned by $PRESERVED_POSTGRES_USER." \
			"Keep those values, or start from a clean server."
	fi

	RELOOP_VERSION="${RELOOP_VERSION:-${PRESERVED_RELOOP_VERSION:-latest}}"
	RELOOP_TRACKING_HOST="link.$RELOOP_DOMAIN"
	RELOOP_INBOUND_HOST="inbound.$RELOOP_DOMAIN"

	if [ "$RELOOP_HTTPS" = "yes" ]; then
		RELOOP_SCHEME="https"
		RELOOP_SITE_ADDRESS="$RELOOP_DOMAIN"
		RELOOP_TRACKING_SITE_ADDRESS="$RELOOP_TRACKING_HOST"
	else
		RELOOP_SCHEME="http"
		RELOOP_SITE_ADDRESS="http://$RELOOP_DOMAIN"
		RELOOP_TRACKING_SITE_ADDRESS="http://$RELOOP_TRACKING_HOST"
	fi

	preserved_or_new POSTGRES_PASSWORD gen_secret 32
	preserved_or_new REDIS_PASSWORD gen_secret 32
	preserved_or_new BETTER_AUTH_SECRET gen_secret 48
	preserved_or_new RELOOP_INTERNAL_SECRET gen_secret 48
	preserved_or_new TRACKING_SECRET gen_secret 48
	preserved_or_new PREFERENCES_SECRET gen_secret 48
	preserved_or_new WEBHOOK_ENCRYPTION_KEY gen_hex 32
	preserved_or_new DEFAULT_OTP gen_digits 6
}

write_env_file() {
	step "Generating secure configuration..."

	local tmp
	tmp="$(mktemp "$INSTALL_DIR/.env.new.XXXXXX")"
	chmod 600 "$tmp"

	cat >"$tmp" <<EOF
# Reloop production configuration — generated by the Reloop self-host installer.
# This file holds every credential for this deployment. Keep it at mode 0600
# and back it up: losing it means losing access to the encrypted data.

RELOOP_VERSION=$RELOOP_VERSION
RELOOP_DOMAIN=$RELOOP_DOMAIN
RELOOP_TRACKING_HOST=$RELOOP_TRACKING_HOST
RELOOP_INBOUND_HOST=$RELOOP_INBOUND_HOST
RELOOP_ADMIN_EMAIL=$RELOOP_ADMIN_EMAIL
RELOOP_PUBLIC_IP=$RELOOP_PUBLIC_IP
RELOOP_HTTPS=$RELOOP_HTTPS
RELOOP_SITE_ADDRESS=$RELOOP_SITE_ADDRESS
RELOOP_TRACKING_SITE_ADDRESS=$RELOOP_TRACKING_SITE_ADDRESS
RELOOP_ACME_EMAIL=$RELOOP_ADMIN_EMAIL

NODE_ENV=production
BASE_URL=$RELOOP_SCHEME://$RELOOP_DOMAIN
HOST_DOMAIN=$RELOOP_DOMAIN
TRACKING_DOMAIN=$RELOOP_TRACKING_HOST
TRACKING_BASE_URL=$RELOOP_SCHEME://$RELOOP_TRACKING_HOST
INBOUND_HOSTNAME=$RELOOP_INBOUND_HOST
SMTP_HOSTNAME=$RELOOP_DOMAIN
DKIM_SELECTOR=reloop

POSTGRES_DB=$POSTGRES_DB
POSTGRES_USER=$POSTGRES_USER
POSTGRES_PASSWORD=$POSTGRES_PASSWORD
PG_URL=postgresql://$POSTGRES_USER:$POSTGRES_PASSWORD@postgres:5432/$POSTGRES_DB

REDIS_PASSWORD=$REDIS_PASSWORD
REDIS_URL=redis://:$REDIS_PASSWORD@redis:6379

NATS_URL=nats://nats:4222

COMPOSE_PROFILES=$COMPOSE_PROFILES
S3_ENDPOINT=$S3_ENDPOINT
S3_ACCESS_KEY=$S3_ACCESS_KEY
S3_SECRET_KEY=$S3_SECRET_KEY
S3_BUCKET=$S3_BUCKET
S3_REGION=$S3_REGION
S3_FORCE_PATH_STYLE=true

BETTER_AUTH_SECRET=$BETTER_AUTH_SECRET
RELOOP_INTERNAL_SECRET=$RELOOP_INTERNAL_SECRET
TRACKING_SECRET=$TRACKING_SECRET
PREFERENCES_SECRET=$PREFERENCES_SECRET
WEBHOOK_ENCRYPTION_KEY=$WEBHOOK_ENCRYPTION_KEY

# Bootstrap sign-in code. Reloop cannot email a one-time code until you have
# verified a sending domain, so this fixed code stands in for the first login.
# Remove it (and restart) as soon as your own domain sends mail.
DEFAULT_OTP=$DEFAULT_OTP
DISABLE_SIGNUP=false

KUMOMTA_MIN_FREE_SPACE=5%
KUMOMTA_MIN_FREE_INODES=0
KUMOMTA_RSPAMD_URL=http://spam:11333/checkv2
KUMOMTA_CHECK_RECIPIENT_URL=http://domain:8011/api/domain
KUMOMTA_WEBHOOK_URL=http://domain:8011/api/domain
RSPAMD_REDIS_SERVERS=redis:6379
RSPAMD_REDIS_PASSWORD=$REDIS_PASSWORD
EOF

	if [ -f "$ENV_FILE" ] && ! cmp -s "$tmp" "$ENV_FILE"; then
		local backup
		backup="$INSTALL_DIR/.env.backup.$(date +%Y%m%d%H%M%S)"
		cp -p "$ENV_FILE" "$backup"
		chmod 600 "$backup"
		info "Previous configuration saved to $(basename "$backup")"
	fi

	mv "$tmp" "$ENV_FILE"
	chown root:root "$ENV_FILE"
	chmod 600 "$ENV_FILE"
	ok "Wrote $ENV_FILE (root-only, 0600)"
}

install_asset() {
	local src="$1" dest="$2" mode="$3"
	if [ -f "$dest" ] && ! cmp -s "$src" "$dest"; then
		cp -p "$dest" "$dest.backup.$(date +%Y%m%d%H%M%S)"
		info "Local changes to $(basename "$dest") saved alongside it"
	fi
	install -m "$mode" -o root -g root "$src" "$dest"
}

write_stack_files() {
	install_asset "$ASSET_DIR/templates/docker-compose.yml" "$INSTALL_DIR/docker-compose.yml" 0644

	if [ "$RELOOP_HTTPS" = "yes" ]; then
		install_asset "$ASSET_DIR/templates/Caddyfile" "$INSTALL_DIR/Caddyfile" 0644
	else
		install_asset "$ASSET_DIR/templates/Caddyfile.http" "$INSTALL_DIR/Caddyfile" 0644
	fi

	install -m 0755 -o root -g root "$ASSET_DIR/templates/reloop" /usr/local/bin/reloop
	ok "Wrote docker-compose.yml, Caddyfile and the reloop command"
}
