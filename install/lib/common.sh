#!/usr/bin/env bash

if [ -t 1 ] && [ -z "${NO_COLOR:-}" ]; then
	C_RESET=$'\033[0m'
	C_DIM=$'\033[2m'
	C_BOLD=$'\033[1m'
	C_RED=$'\033[31m'
	C_GREEN=$'\033[32m'
	C_YELLOW=$'\033[33m'
else
	C_RESET=""
	C_DIM=""
	C_BOLD=""
	C_RED=""
	C_GREEN=""
	C_YELLOW=""
fi

TTY_FD=""

open_tty() {
	if { exec 3<>/dev/tty; } 2>/dev/null; then
		TTY_FD=3
	fi
	return 0
}

heading() {
	printf '\n%s%s%s\n' "$C_BOLD" "$1" "$C_RESET"
}

step() {
	printf '\n%s%s%s\n' "$C_BOLD" "$1" "$C_RESET"
}

ok() {
	printf '  %s✓%s %s\n' "$C_GREEN" "$C_RESET" "$1"
}

info() {
	printf '  %s·%s %s\n' "$C_DIM" "$C_RESET" "$1"
}

warn() {
	printf '  %s!%s %s\n' "$C_YELLOW" "$C_RESET" "$1"
}

err() {
	printf '\n%s[ERROR]%s %s\n' "$C_RED" "$C_RESET" "$1" >&2
}

die() {
	trap - ERR
	err "$1"
	shift
	for line in "$@"; do
		printf '%s\n' "$line" >&2
	done
	printf '\n' >&2
	exit 1
}

rule() {
	printf '%s\n' "============================================================"
}

have() {
	command -v "$1" >/dev/null 2>&1
}

# Alphanumeric only: any other charset would need quoting in .env and YAML.
gen_secret() {
	local n="${1:-40}" out
	out="$(
		set +o pipefail
		LC_ALL=C tr -dc 'A-Za-z0-9' </dev/urandom | head -c "$n"
	)"
	if [ "${#out}" -ne "$n" ]; then
		die "Could not read $n bytes of randomness from /dev/urandom."
	fi
	printf '%s' "$out"
}

gen_hex() {
	local bytes="${1:-32}" out
	out="$(
		set +o pipefail
		od -An -tx1 -N "$bytes" /dev/urandom | tr -d ' \n'
	)"
	if [ "${#out}" -ne $((bytes * 2)) ]; then
		die "Could not read $bytes bytes of randomness from /dev/urandom."
	fi
	printf '%s' "$out"
}

gen_digits() {
	local n="${1:-6}" out
	out="$(
		set +o pipefail
		LC_ALL=C tr -dc '0-9' </dev/urandom | head -c "$n"
	)"
	if [ "${#out}" -ne "$n" ]; then
		die "Could not read $n digits of randomness from /dev/urandom."
	fi
	printf '%s' "$out"
}

compose() {
	docker compose --project-directory "$INSTALL_DIR" \
		-f "$INSTALL_DIR/docker-compose.yml" "$@"
}
