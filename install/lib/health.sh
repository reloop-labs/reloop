#!/usr/bin/env bash

API_HEALTH=(
	"auth|Auth|http://auth:8000/api/auth/health"
	"domain|Domain|http://domain:8011/api/domain/health"
	"api-key|API keys|http://api-key:8012/api/api-key/health"
	"webhook|Webhooks|http://webhook:8013/api/webhook/health"
	"contacts|Contacts|http://contacts:8014/api/contacts/health"
	"mail|Mail|http://mail:8015/api/mail/health"
	"logs|Logs|http://logs:8016/api/logs/health"
	"workflow|Workflows|http://workflow:8017/api/workflow/health"
	"upload|Uploads|http://upload:8018/api/upload/health"
	"template|Templates|http://template:8019/api/template/health"
	"inbox|Inbox|http://inbox:8021/api/inbox/health"
	"email|Email|http://email:8022/api/email/health"
	"credits|Credits|http://credits:8023/api/credits/health"
	"admin|Admin|http://admin:8024/api/admin/health"
	"tools|Tools|http://tools:8026/api/tools/health"
)

WEB_HEALTH=(
	"dashboard|Dashboard|http://dashboard:3000/dashboard/healthz"
	"docs|Documentation|http://docs:3000/docs"
	"console|Console|http://console:3002/console"
	"links|Links|http://links:3005/"
)

MAIL_SERVICES=(smtp inbound spam)

http_probe() {
	compose exec -T proxy wget -q -O - -T 8 "$1" 2>/dev/null
}

container_state() {
	docker inspect -f '{{.State.Status}}' "reloop-$1" 2>/dev/null || printf 'missing'
}

restart_count() {
	docker inspect -f '{{.RestartCount}}' "reloop-$1" 2>/dev/null || printf '0'
}

diagnose_services() {
	local svc
	printf '\n'
	printf '%sContainer status%s\n' "$C_BOLD" "$C_RESET"
	compose ps || true
	for svc in "$@"; do
		printf '\n%sLast log lines — reloop-%s%s\n' "$C_BOLD" "$svc" "$C_RESET"
		compose logs --tail 30 --no-color "$svc" 2>&1 | sed 's/^/    /' || true
	done
	printf '\n'
}

wait_for_probe() {
	local url="$1" expect_success="$2" budget="$3" deadline body
	deadline=$((SECONDS + budget))
	while [ "$SECONDS" -lt "$deadline" ]; do
		if body="$(http_probe "$url")"; then
			if [ "$expect_success" = "0" ]; then
				return 0
			fi
			case "$body" in
			*DISCONNECTED* | *'"success":false'*) : ;;
			*'"success":true'* | *'"status":"CONNECTED"'*) return 0 ;;
			esac
		fi
		sleep 4
	done
	return 1
}

check_group() {
	local -n entries="$1"
	local expect_success="$2"
	local failed=() entry svc label url budget="$HEALTH_TIMEOUT"
	for entry in "${entries[@]}"; do
		IFS='|' read -r svc label url <<<"$entry"
		if wait_for_probe "$url" "$expect_success" "$budget"; then
			ok "$label healthy"
			budget="$HEALTH_TIMEOUT_FOLLOWUP"
		else
			printf '  %s✗%s %s did not become healthy\n' "$C_RED" "$C_RESET" "$label"
			failed+=("$svc")
		fi
	done
	if [ "${#failed[@]}" -gt 0 ]; then
		FAILED_SERVICES+=("${failed[@]}")
	fi
}

check_mail_transport() {
	local svc state
	for svc in "${MAIL_SERVICES[@]}"; do
		state="$(container_state "$svc")"
		if [ "$state" = "running" ] && [ "$(restart_count "$svc")" -le 2 ]; then
			ok "Mail transport: $svc running"
		else
			printf '  %s✗%s Mail transport: %s is %s\n' "$C_RED" "$C_RESET" "$svc" "$state"
			FAILED_SERVICES+=("$svc")
		fi
	done
}

check_restart_loops() {
	local svc count looping=()
	while read -r svc; do
		[ -n "$svc" ] || continue
		count="$(restart_count "$svc")"
		if [ "$count" -ge 3 ]; then
			looping+=("$svc")
		fi
	done < <(compose ps --services 2>/dev/null)

	if [ "${#looping[@]}" -gt 0 ]; then
		printf '  %s✗%s Restart loops detected: %s\n' "$C_RED" "$C_RESET" "${looping[*]}"
		FAILED_SERVICES+=("${looping[@]}")
		return 1
	fi
	ok "No restart loops"
}

verify_deployment() {
	step "Verifying deployment..."
	FAILED_SERVICES=()

	if [ "$(container_state proxy)" != "running" ]; then
		diagnose_services proxy
		die "The reverse proxy is not running; no health checks could be run."
	fi

	check_group API_HEALTH 1
	check_group WEB_HEALTH 0
	check_mail_transport
	check_restart_loops || true

	if http_probe http://127.0.0.1:2019/config/ >/dev/null 2>&1; then
		ok "Reverse proxy configured"
	else
		printf '  %s✗%s Reverse proxy is not serving its configuration\n' "$C_RED" "$C_RESET"
		FAILED_SERVICES+=(proxy)
	fi

	if [ "${#FAILED_SERVICES[@]}" -eq 0 ]; then
		return 0
	fi

	local unique
	mapfile -t unique < <(printf '%s\n' "${FAILED_SERVICES[@]}" | sort -u)
	diagnose_services "${unique[@]}"
	die "Reloop was deployed but ${#unique[@]} service(s) are unhealthy: ${unique[*]}" \
		"Inspect them with:" \
		"  cd $INSTALL_DIR && docker compose logs ${unique[0]}" \
		"" \
		"Re-run the installer once the cause is fixed; your configuration and data are kept."
}
