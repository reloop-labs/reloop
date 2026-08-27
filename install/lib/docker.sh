#!/usr/bin/env bash

MIN_DOCKER_VERSION="24.0.0"
MIN_COMPOSE_VERSION="2.20.0"

version_ge() {
	[ "$(printf '%s\n%s\n' "$2" "$1" | sort -V | head -1)" = "$2" ]
}

setup_docker_repo() {
	export DEBIAN_FRONTEND=noninteractive
	export NEEDRESTART_MODE=a
	export NEEDRESTART_SUSPEND=1

	apt-get update -qq >/dev/null 2>&1
	apt-get install -y -qq ca-certificates curl gnupg >/dev/null 2>&1

	install -m 0755 -d /etc/apt/keyrings
	local keyring="/etc/apt/keyrings/docker.asc"
	if ! curl -fsSL --proto '=https' "https://download.docker.com/linux/$OS_ID/gpg" -o "$keyring"; then
		die "Could not download the Docker apt signing key." \
			"Check outbound HTTPS access to download.docker.com and retry."
	fi
	chmod a+r "$keyring"

	local codename="$OS_CODENAME"
	if [ -z "$codename" ]; then
		codename="$(. /etc/os-release && echo "${UBUNTU_CODENAME:-${VERSION_CODENAME:-}}")"
	fi
	[ -n "$codename" ] || die "Could not determine the distribution codename for the Docker repository."

	printf 'deb [arch=amd64 signed-by=%s] https://download.docker.com/linux/%s %s stable\n' \
		"$keyring" "$OS_ID" "$codename" >/etc/apt/sources.list.d/docker.list

	apt-get update -qq >/dev/null 2>&1
}

install_docker_engine() {
	info "Installing Docker Engine from the official Docker apt repository"
	setup_docker_repo
	if ! apt-get install -y -qq docker-ce docker-ce-cli containerd.io \
		docker-buildx-plugin docker-compose-plugin >/dev/null 2>&1; then
		die "Docker installation failed." \
			"Inspect the output above, or install Docker manually:" \
			"  https://docs.docker.com/engine/install/"
	fi

	systemctl enable --now docker >/dev/null 2>&1 || true
	ok "Docker Engine installed"
}

ensure_docker() {
	step "Checking Docker..."

	if ! have docker; then
		case "$OS_ID" in
		ubuntu | debian) install_docker_engine ;;
		*)
			die "Docker is not installed and this OS has no automatic install path." \
				"Install Docker 24+ and the Compose plugin, then re-run the installer."
			;;
		esac
	fi

	local docker_version
	if ! docker_version="$(docker version --format '{{.Server.Version}}' 2>/dev/null)"; then
		systemctl start docker >/dev/null 2>&1 || true
		if ! docker_version="$(docker version --format '{{.Server.Version}}' 2>/dev/null)"; then
			die "The Docker daemon is not responding." \
				"Diagnose it with:" \
				"  systemctl status docker" \
				"  journalctl -u docker -n 50 --no-pager"
		fi
	fi

	if ! version_ge "${docker_version%%-*}" "$MIN_DOCKER_VERSION"; then
		die "Docker $docker_version is too old (Reloop needs $MIN_DOCKER_VERSION or newer)." \
			"Upgrade Docker: https://docs.docker.com/engine/install/"
	fi
	ok "Docker $docker_version available"

	local compose_version
	if ! compose_version="$(docker compose version --short 2>/dev/null)"; then
		case "$OS_ID" in
		ubuntu | debian)
			info "Installing the Docker Compose plugin"
			setup_docker_repo
			apt-get install -y -qq docker-compose-plugin >/dev/null 2>&1 ||
				die "Could not install the Docker Compose plugin."
			compose_version="$(docker compose version --short 2>/dev/null)" ||
				die "Docker Compose v2 is still unavailable after installation."
			;;
		*)
			die "Docker Compose v2 is missing." \
				"Install the compose plugin: https://docs.docker.com/compose/install/"
			;;
		esac
	fi

	if ! version_ge "${compose_version#v}" "$MIN_COMPOSE_VERSION"; then
		die "Docker Compose ${compose_version} is too old (Reloop needs $MIN_COMPOSE_VERSION or newer)." \
			"Upgrade the compose plugin: https://docs.docker.com/compose/install/"
	fi
	ok "Docker Compose ${compose_version} available"

	if ! docker info >/dev/null 2>&1; then
		die "\`docker info\` failed." \
			"The daemon is installed but unhealthy. Check: journalctl -u docker -n 50 --no-pager"
	fi
	ok "Docker daemon healthy"

	systemctl is-enabled docker >/dev/null 2>&1 || systemctl enable docker >/dev/null 2>&1 || true
}
