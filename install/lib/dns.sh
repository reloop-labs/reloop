#!/usr/bin/env bash

is_private_ipv4() {
	local ip="$1"
	case "$ip" in
	10.* | 127.* | 169.254.* | 192.168.* | 0.* | 255.*) return 0 ;;
	172.1[6-9].* | 172.2[0-9].* | 172.3[0-1].*) return 0 ;;
	100.6[4-9].* | 100.[7-9][0-9].* | 100.1[0-1][0-9].* | 100.12[0-7].*) return 0 ;;
	esac
	return 1
}

local_public_ipv4s() {
	ip -4 -o addr show scope global 2>/dev/null |
		awk '{print $2, $4}' |
		grep -Ev '^(docker[0-9]*|br-[0-9a-f]+|veth|lo|virbr[0-9]*|kube|cni|flannel|tailscale)' |
		awk '{split($2, a, "/"); print a[1]}'
}

remote_public_ipv4() {
	local url ip
	for url in https://api.ipify.org https://ifconfig.me/ip https://icanhazip.com; do
		ip="$(curl -fsS --max-time 10 "$url" 2>/dev/null | tr -d '[:space:]')" || continue
		if valid_ipv4 "$ip"; then
			printf '%s' "$ip"
			return 0
		fi
	done
	return 1
}

detect_public_ip() {
	step "Detecting the server's public address..."

	if [ -n "${RELOOP_PUBLIC_IP:-}" ]; then
		valid_ipv4 "$RELOOP_PUBLIC_IP" ||
			die "RELOOP_PUBLIC_IP is not a valid IPv4 address: $RELOOP_PUBLIC_IP"
		ok "Public IPv4: $RELOOP_PUBLIC_IP (provided)"
		return 0
	fi

	local candidates=() ip
	while read -r ip; do
		[ -n "$ip" ] || continue
		is_private_ipv4 "$ip" && continue
		candidates+=("$ip")
	done < <(local_public_ipv4s)

	local remote=""
	remote="$(remote_public_ipv4 || true)"
	if [ -n "$remote" ]; then
		local seen=0 c
		for c in "${candidates[@]}"; do
			[ "$c" = "$remote" ] && seen=1
		done
		[ "$seen" = "0" ] && candidates+=("$remote")
	fi

	if [ "${#candidates[@]}" -eq 0 ]; then
		if [ "$NONINTERACTIVE" = "1" ]; then
			die "Could not determine the server's public IPv4 address." \
				"Set RELOOP_PUBLIC_IP=<address> and re-run."
		fi
		warn "No public IPv4 address could be detected automatically"
		ask RELOOP_PUBLIC_IP "Server public IPv4 address" \
			"The address your DNS A records should point at" \
			"" valid_ipv4 "Enter a valid IPv4 address, e.g. 203.0.113.10"
		return 0
	fi

	if [ "${#candidates[@]}" -eq 1 ]; then
		RELOOP_PUBLIC_IP="${candidates[0]}"
		ok "Public IPv4: $RELOOP_PUBLIC_IP"
		return 0
	fi

	if [ "$NONINTERACTIVE" = "1" ]; then
		RELOOP_PUBLIC_IP="${remote:-${candidates[0]}}"
		warn "Several public addresses found; using $RELOOP_PUBLIC_IP"
		return 0
	fi

	local choice
	ask_choice choice "This server has more than one public address. Which one should DNS point at?" \
		"${candidates[@]}"
	RELOOP_PUBLIC_IP="${candidates[$((choice - 1))]}"
	ok "Public IPv4: $RELOOP_PUBLIC_IP"
}

dns_instructions() {
	local apex="$1" name_app name_link name_inbound
	name_app="$(dns_label "$RELOOP_DOMAIN" "$apex")"
	name_link="$(dns_label "$RELOOP_TRACKING_HOST" "$apex")"
	name_inbound="$(dns_label "$RELOOP_INBOUND_HOST" "$apex")"

	printf '\n'
	printf 'Add these records at the DNS host for %s:\n\n' "$apex"
	printf '  %-6s %-28s %-32s %s\n' "TYPE" "NAME" "VALUE" "TTL"
	printf '  %-6s %-28s %-32s %s\n' "----" "----" "-----" "---"
	printf '  %-6s %-28s %-32s %s\n' "A" "$name_app" "$RELOOP_PUBLIC_IP" "Auto"
	printf '  %-6s %-28s %-32s %s\n' "A" "$name_link" "$RELOOP_PUBLIC_IP" "Auto"
	printf '  %-6s %-28s %-32s %s\n' "A" "$name_inbound" "$RELOOP_PUBLIC_IP" "Auto"
	printf '  %-6s %-28s %-32s %s\n' "TXT" "$name_app" "v=spf1 ip4:$RELOOP_PUBLIC_IP -all" "Auto"
	printf '\n'
	printf 'Full records:\n\n'
	printf '  %-38s A    %s\n' "$RELOOP_DOMAIN" "$RELOOP_PUBLIC_IP"
	printf '  %-38s A    %s\n' "$RELOOP_TRACKING_HOST" "$RELOOP_PUBLIC_IP"
	printf '  %-38s A    %s\n' "$RELOOP_INBOUND_HOST" "$RELOOP_PUBLIC_IP"
	printf '  %-38s TXT  "v=spf1 ip4:%s -all"\n' "$RELOOP_DOMAIN" "$RELOOP_PUBLIC_IP"
}

dns_label() {
	local fqdn="$1" apex="$2"
	if [ "$fqdn" = "$apex" ]; then
		printf '@'
	else
		printf '%s' "${fqdn%".$apex"}"
	fi
}

TWO_LABEL_SUFFIXES="co.uk ac.uk gov.uk org.uk net.uk me.uk com.au net.au org.au edu.au \
co.nz net.nz org.nz co.za org.za com.br net.br com.mx com.ar com.tr com.sg com.hk \
com.cn net.cn org.cn co.jp or.jp ne.jp co.kr co.in net.in org.in co.il com.pl"

# Guessing the zone wrong sends the reader to the wrong DNS record name.
zone_apex() {
	local fqdn="$1" n last2 suffix
	n="$(awk -F. '{print NF}' <<<"$fqdn")"
	if [ "$n" -le 2 ]; then
		printf '%s' "$fqdn"
		return
	fi
	last2="$(cut -d. -f$((n - 1))-"$n" <<<"$fqdn")"
	for suffix in $TWO_LABEL_SUFFIXES; do
		if [ "$last2" = "$suffix" ]; then
			if [ "$n" -le 3 ]; then
				printf '%s' "$fqdn"
			else
				printf '%s' "$(cut -d. -f$((n - 2))-"$n" <<<"$fqdn")"
			fi
			return
		fi
	done
	printf '%s' "$last2"
}
