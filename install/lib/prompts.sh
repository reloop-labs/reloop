#!/usr/bin/env bash

# `curl | sudo bash` leaves stdin on the piped script, so prompts need the tty fd.
read_line() {
	local __var="$1" __line=""
	if [ -n "$TTY_FD" ]; then
		IFS= read -r __line <&"$TTY_FD" || return 1
	else
		IFS= read -r __line || return 1
	fi
	printf -v "$__var" '%s' "$__line"
}

prompt_label() {
	printf '\n%s%s%s\n' "$C_BOLD" "$1" "$C_RESET"
	if [ -n "${2:-}" ]; then
		printf '%s%s%s\n' "$C_DIM" "$2" "$C_RESET"
	fi
}

ask() {
	local var="$1" label="$2" hint="$3" default="$4" validator="$5" errhint="$6"
	local current answer

	current="${!var-}"
	if [ -n "$current" ]; then
		if "$validator" "$current"; then
			ok "$label: $current"
			return 0
		fi
		die "Invalid value for $var: $current" "$errhint"
	fi

	if [ "$NONINTERACTIVE" = "1" ]; then
		if [ -z "$default" ]; then
			die "$label is required in non-interactive mode." "$errhint"
		fi
		printf -v "$var" '%s' "$default"
		ok "$label: $default"
		return 0
	fi

	while true; do
		if [ -n "$default" ]; then
			prompt_label "$label [$default]:" "$hint"
		else
			prompt_label "$label:" "$hint"
		fi
		printf '> '
		if ! read_line answer; then
			die "Standard input closed while waiting for an answer."
		fi
		[ -z "$answer" ] && answer="$default"
		if [ -z "$answer" ]; then
			warn "A value is required."
			continue
		fi
		if "$validator" "$answer"; then
			printf -v "$var" '%s' "$answer"
			return 0
		fi
		warn "$errhint"
	done
}

ask_yes_no() {
	local var="$1" label="$2" default="$3" current answer suffix

	current="${!var-}"
	if [ -n "$current" ]; then
		case "${current,,}" in
		1 | y | yes | true) printf -v "$var" '%s' "yes" ;;
		0 | n | no | false) printf -v "$var" '%s' "no" ;;
		*) die "Invalid value for $var: $current (expected yes or no)" ;;
		esac
		ok "$label: ${!var}"
		return 0
	fi

	if [ "$NONINTERACTIVE" = "1" ]; then
		printf -v "$var" '%s' "$default"
		ok "$label: $default"
		return 0
	fi

	if [ "$default" = "yes" ]; then suffix="[Y/n]"; else suffix="[y/N]"; fi

	while true; do
		prompt_label "$label $suffix:" ""
		printf '> '
		if ! read_line answer; then
			die "Standard input closed while waiting for an answer."
		fi
		case "${answer,,}" in
		"") printf -v "$var" '%s' "$default" && return 0 ;;
		y | yes) printf -v "$var" '%s' "yes" && return 0 ;;
		n | no) printf -v "$var" '%s' "no" && return 0 ;;
		*) warn "Answer y or n." ;;
		esac
	done
}

ask_choice() {
	local var="$1" label="$2"
	shift 2
	local options=("$@") i answer

	if [ "$NONINTERACTIVE" = "1" ]; then
		die "$label requires an interactive terminal."
	fi

	while true; do
		prompt_label "$label" ""
		for i in "${!options[@]}"; do
			printf '  %d. %s\n' "$((i + 1))" "${options[$i]}"
		done
		printf '> '
		if ! read_line answer; then
			die "Standard input closed while waiting for an answer."
		fi
		if [[ "$answer" =~ ^[0-9]+$ ]] && [ "$answer" -ge 1 ] && [ "$answer" -le "${#options[@]}" ]; then
			printf -v "$var" '%s' "$answer"
			return 0
		fi
		warn "Enter a number between 1 and ${#options[@]}."
	done
}

valid_hostname() {
	local value="$1"
	[ "${#value}" -le 253 ] || return 1
	[[ "$value" =~ ^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,63}$ ]]
}

valid_email() {
	local value="$1"
	[ "${#value}" -le 254 ] || return 1
	[[ "$value" =~ ^[A-Za-z0-9._%+-]+@([A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+[A-Za-z]{2,63}$ ]]
}

# Unquoted-identifier charset only: the value is spliced into PG_URL and psql args.
valid_pg_identifier() {
	local value="$1"
	[ "${#value}" -le 63 ] || return 1
	[[ "$value" =~ ^[a-z_][a-z0-9_]*$ ]]
}

valid_ipv4() {
	local value="$1" octet
	[[ "$value" =~ ^[0-9]{1,3}(\.[0-9]{1,3}){3}$ ]] || return 1
	case "$value" in
	0.* | 127.* | 255.255.255.255) return 1 ;;
	esac
	local IFS=.
	for octet in $value; do
		[ "$octet" -le 255 ] || return 1
	done
	return 0
}

valid_url() {
	case "$1" in
	https://*.* | http://*.*) return 0 ;;
	*) return 1 ;;
	esac
}

valid_any() {
	[ -n "$1" ]
}
