#!/usr/bin/env bash

MIN_RAM_MB=3800
MIN_DISK_GB=45

OS_ID=""
OS_VERSION_ID=""
OS_PRETTY=""
OS_CODENAME=""

detect_os() {
	[ -r /etc/os-release ] || die "/etc/os-release is missing; this OS is not supported."
	# shellcheck disable=SC1091
	. /etc/os-release
	OS_ID="${ID:-}"
	OS_VERSION_ID="${VERSION_ID:-}"
	OS_PRETTY="${PRETTY_NAME:-$OS_ID $OS_VERSION_ID}"
	OS_CODENAME="${VERSION_CODENAME:-}"
}

check_root() {
	if [ "$(id -u)" -ne 0 ]; then
		die "The installer must run as root." \
			"Re-run it with sudo:" \
			"  curl -fsSL $INSTALLER_URL | sudo bash"
	fi
	ok "Running as root"
}

check_os() {
	detect_os
	case "$OS_ID" in
	ubuntu)
		case "$OS_VERSION_ID" in
		22.04 | 24.04) ok "$OS_PRETTY supported" ;;
		*)
			if [ "$ALLOW_UNSUPPORTED_OS" = "1" ]; then
				warn "$OS_PRETTY is untested (RELOOP_ALLOW_UNSUPPORTED_OS=1)"
			else
				die "Ubuntu $OS_VERSION_ID is not supported." \
					"Supported: Ubuntu 22.04 LTS, Ubuntu 24.04 LTS, Debian 12, Debian 13." \
					"Set RELOOP_ALLOW_UNSUPPORTED_OS=1 to continue anyway."
			fi
			;;
		esac
		;;
	debian)
		case "${OS_VERSION_ID%%.*}" in
		12 | 13) ok "$OS_PRETTY supported" ;;
		*)
			if [ "$ALLOW_UNSUPPORTED_OS" = "1" ]; then
				warn "$OS_PRETTY is untested (RELOOP_ALLOW_UNSUPPORTED_OS=1)"
			else
				die "Debian $OS_VERSION_ID is not supported." \
					"Supported: Ubuntu 22.04 LTS, Ubuntu 24.04 LTS, Debian 12, Debian 13." \
					"Set RELOOP_ALLOW_UNSUPPORTED_OS=1 to continue anyway."
			fi
			;;
		esac
		;;
	*)
		if [ "$ALLOW_UNSUPPORTED_OS" = "1" ]; then
			warn "$OS_PRETTY is untested (RELOOP_ALLOW_UNSUPPORTED_OS=1)"
		else
			die "$OS_PRETTY is not supported." \
				"Supported: Ubuntu 22.04 LTS, Ubuntu 24.04 LTS, Debian 12, Debian 13." \
				"Set RELOOP_ALLOW_UNSUPPORTED_OS=1 to continue anyway."
		fi
		;;
	esac
}

check_arch() {
	local arch
	arch="$(uname -m)"
	case "$arch" in
	x86_64) ok "x86_64 architecture" ;;
	aarch64 | arm64)
		die "arm64 is not supported yet." \
			"Reloop publishes arm64 images for the backend services but the" \
			"dashboard, docs and links images are amd64-only, so the stack" \
			"cannot start on this machine. Use an x86_64 server."
		;;
	*) die "Unsupported CPU architecture: $arch (Reloop needs x86_64)." ;;
	esac
}

check_memory() {
	local kb mb
	kb="$(awk '/^MemTotal:/ {print $2}' /proc/meminfo)"
	mb=$((kb / 1024))
	if [ "$mb" -lt "$MIN_RAM_MB" ]; then
		die "Not enough memory: ${mb} MB detected, 4 GB is the documented minimum." \
			"Reloop runs 22 containers; 8 GB is recommended for production."
	fi
	ok "Memory: ${mb} MB"
	if [ "$mb" -lt 7000 ]; then
		warn "8 GB is recommended for production traffic"
	fi
}

check_disk() {
	local avail_gb
	avail_gb="$(df -BG --output=avail "$(dirname "$INSTALL_DIR")" 2>/dev/null | tail -1 | tr -dc '0-9')"
	if [ -z "$avail_gb" ]; then
		warn "Could not determine free disk space for $INSTALL_DIR"
		return 0
	fi
	if [ "$avail_gb" -lt "$MIN_DISK_GB" ]; then
		die "Not enough disk space: ${avail_gb} GB free, ${MIN_DISK_GB} GB required." \
			"The Reloop container images alone are about 28 GB; 60 GB is recommended" \
			"so there is room for the database, object storage and mail spools."
	fi
	ok "Disk space: ${avail_gb} GB free"
	if [ "$avail_gb" -lt 60 ]; then
		warn "60 GB is recommended once the database and mail spools grow"
	fi
}

check_binaries() {
	local missing=()
	local b
	for b in curl awk sed grep df tar; do
		have "$b" || missing+=("$b")
	done
	if [ "${#missing[@]}" -gt 0 ]; then
		die "Missing required commands: ${missing[*]}" \
			"Install them with: apt-get install -y ${missing[*]}"
	fi
	ok "Required tools available"
}

check_network() {
	local code
	# The registry answers 401 without credentials; any status proves reachability.
	code="$(curl -s --max-time 15 -o /dev/null -w '%{http_code}' https://registry-1.docker.io/v2/ 2>/dev/null || true)"
	if [ -n "$code" ] && [ "$code" != "000" ]; then
		ok "Outbound network reachable"
		return 0
	fi
	die "Cannot reach registry-1.docker.io." \
		"Reloop pulls its container images from Docker Hub; allow outbound HTTPS and retry."
}

port_owner() {
	local port="$1" out=""
	if have ss; then
		out="$(ss -H -lntup "sport = :$port" 2>/dev/null | awk '{for(i=1;i<=NF;i++) if($i ~ /users:/) print $i}' | head -1)"
	fi
	if [ -z "$out" ] && have lsof; then
		out="$(lsof -nP -iTCP:"$port" -sTCP:LISTEN -Fc 2>/dev/null | sed -n 's/^c//p' | head -1)"
	fi
	printf '%s' "$out"
}

port_in_use() {
	local port="$1"
	if have ss; then
		ss -H -lnt "sport = :$port" 2>/dev/null | grep -q . && return 0
		return 1
	fi
	if have lsof; then
		lsof -nP -iTCP:"$port" -sTCP:LISTEN >/dev/null 2>&1 && return 0
		return 1
	fi
	return 1
}

port_is_ours() {
	local port="$1"
	docker ps --format '{{.Names}}\t{{.Ports}}' 2>/dev/null |
		grep -E '^reloop-' | grep -q ":$port->"
}

check_ports() {
	local conflicts=()
	local port owner
	for port in "${REQUIRED_PORTS[@]}"; do
		if port_in_use "$port" && ! port_is_ours "$port"; then
			owner="$(port_owner "$port")"
			conflicts+=("$port|${owner:-unknown process}")
		fi
	done

	if [ "${#conflicts[@]}" -eq 0 ]; then
		ok "Required ports available (${REQUIRED_PORTS[*]})"
		return 0
	fi

	local entry p o lines=()
	for entry in "${conflicts[@]}"; do
		p="${entry%%|*}"
		o="${entry#*|}"
		lines+=("  Port $p is held by: $o  (${PORT_PURPOSE[$p]:-required by Reloop})")
	done

	die "Required ports are already in use." "${lines[@]}" \
		"" \
		"Stop the listed services (or move them to other ports) and re-run the installer."
}

preflight() {
	step "Checking server..."
	check_root
	check_os
	check_arch
	check_memory
	check_disk
	check_binaries
	check_network
}
