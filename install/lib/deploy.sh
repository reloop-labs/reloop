#!/usr/bin/env bash

INFRA_SERVICES=(postgres redis nats minio)

pull_images() {
	step "Downloading Reloop ${RELOOP_VERSION} container images..."
	info "About 28 GB on a first install — this is the slowest step."

	local log total pid pulled status
	log="$(mktemp -t reloop-pull.XXXXXX)"
	total="$(compose config --images 2>/dev/null | sort -u | grep -c . || true)"
	[ -n "$total" ] && [ "$total" -gt 0 ] || total="?"

	compose --progress plain pull >"$log" 2>&1 &
	pid=$!

	local started=$SECONDS
	while kill -0 "$pid" 2>/dev/null; do
		pulled="$(grep -c ' Pulled' "$log" 2>/dev/null || true)"
		pulled="${pulled:-0}"
		printf '\r  %s·%s %s of %s images downloaded (%ss elapsed)' \
			"$C_DIM" "$C_RESET" "$pulled" "$total" "$((SECONDS - started))"
		sleep 5
	done

	status=0
	wait "$pid" || status=$?
	printf '\r\033[K'

	if [ "$status" -ne 0 ]; then
		printf '\n' >&2
		tail -20 "$log" >&2
		rm -f "$log"
		die "Failed to download the Reloop container images." \
			"If the output above mentions a pull rate limit, Docker Hub is throttling" \
			"this server's IP. Wait an hour, or authenticate with a Docker Hub account:" \
			"  docker login" \
			"" \
			"Then retry:" \
			"  cd $INSTALL_DIR && docker compose pull"
	fi

	rm -f "$log"
	ok "Images downloaded"
}

start_infrastructure() {
	step "Starting infrastructure..."
	if ! compose up -d --wait --wait-timeout 300 "${INFRA_SERVICES[@]}"; then
		diagnose_services "${INFRA_SERVICES[@]}"
		die "Infrastructure services did not become healthy."
	fi
	ok "PostgreSQL ready"
	ok "Redis ready"
	ok "NATS ready"
	ok "Object storage ready"
}

database_has_tables() {
	local count
	count="$(compose exec -T postgres psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -tAc \
		"select count(*) from information_schema.tables where table_schema='public'" 2>/dev/null | tr -dc '0-9')"
	[ -n "$count" ] && [ "$count" -gt 0 ]
}

prune_backups() {
	local dir="$1" old
	while read -r old; do
		[ -n "$old" ] && rm -f "$old"
	done < <(ls -1t "$dir"/pre-migration-*.sql.gz 2>/dev/null | tail -n +6)
}

backup_database() {
	local dir="$INSTALL_DIR/backups"
	install -d -m 0700 -o root -g root "$dir"
	local file
	file="$dir/pre-migration-$(date +%Y%m%d%H%M%S).sql.gz"
	info "Backing up the existing database before applying schema changes"
	if compose exec -T postgres pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" | gzip >"$file"; then
		chmod 600 "$file"
		prune_backups "$dir"
		ok "Backup written to $file"
	else
		rm -f "$file"
		die "Could not back up the database before migrating." \
			"Refusing to change the schema without a backup."
	fi
}

run_migrations() {
	step "Applying the database schema..."
	if database_has_tables; then
		backup_database
	fi
	if ! compose --profile tools run --rm migrate; then
		diagnose_services postgres
		die "Database migration failed." \
			"Re-run it manually once the cause is fixed:" \
			"  cd $INSTALL_DIR && docker compose --profile tools run --rm migrate"
	fi
	ok "Schema applied"
}

start_application() {
	step "Deploying Reloop..."
	if ! compose up -d --remove-orphans; then
		die "docker compose up failed." \
			"Inspect the stack with:" \
			"  cd $INSTALL_DIR && docker compose ps" \
			"  cd $INSTALL_DIR && docker compose logs --tail 50"
	fi
	ok "All services started"
}
