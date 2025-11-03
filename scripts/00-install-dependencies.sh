#!/usr/bin/env bash

# Install Dependencies
# This script checks and installs prerequisites: Bun, Docker, Docker Compose

set -euo pipefail

# Source common functions
source "$(dirname "$0")/common.sh"

reloop_banner

step "Checking and installing prerequisites"

# Check if running as root
if [[ "$EUID" -eq 0 ]]; then
  log_error "Please do not run this script as root. It will prompt for sudo when needed."
  exit 1
fi

# Check system requirements
if $IS_LINUX; then
  TOTAL_RAM=$(free -g | awk '/^Mem:/{print $2}')
  if [[ $TOTAL_RAM -lt 4 ]]; then
    log_warning "System has less than 4GB RAM. Recommended: 8GB+"
    log_info "Continuing anyway..."
  fi

  AVAILABLE_DISK=$(df -BG "$ROOT_DIR" | awk 'NR==2 {print $4}' | sed 's/G//')
  if [[ $AVAILABLE_DISK -lt 20 ]]; then
    log_warning "Less than 20GB disk space available. Recommended: 50GB+"
    log_info "Continuing anyway..."
  fi
fi

# Install Bun if not present
if ! command -v bun >/dev/null 2>&1; then
  log_info "Bun not found. Installing Bun..."
  (curl -fsSL https://bun.sh/install | bash) &
  spinner $! "Installing Bun"
  export PATH="$HOME/.bun/bin:$PATH"
  if ! command -v bun >/dev/null 2>&1; then
    log_error "Bun installation failed. Please install manually from https://bun.sh"
    exit 1
  fi
fi

log_success "Bun version: $(bun --version)"

# Install Docker if not present
if ! command -v docker >/dev/null 2>&1; then
  if $IS_MAC; then
    log_error "Docker is not installed. Please install Docker Desktop for Mac and re-run."
    exit 1
  else
    log_info "Docker not found. Attempting to install (Linux)."
    (curl -fsSL https://get.docker.com -o /tmp/get-docker.sh && sudo sh /tmp/get-docker.sh) &
    spinner $! "Installing Docker"
    sudo usermod -aG docker "$USER" || true
    log_warning "Docker installed. You may need to log out and back in for group changes to take effect."
  fi
fi

# Check Docker Compose
DC=$(detect_docker_compose)
if [[ -z "$DC" ]]; then
  if $IS_MAC; then
    log_error "Docker Compose not found. Please install Docker Desktop (includes Compose)."
    exit 1
  else
    log_info "Docker Compose not found. Installing v2."
    (sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" \
      -o /usr/local/bin/docker-compose && sudo chmod +x /usr/local/bin/docker-compose) &
    spinner $! "Installing Docker Compose"
    DC="docker-compose"
  fi
fi

export DC
log_success "Docker Compose: $($DC version --short)"

# Ensure docker is running
if ! docker info >/dev/null 2>&1; then
  log_info "Docker daemon is not running. Starting Docker..."
  if $IS_MAC; then
    log_error "Please start Docker Desktop and re-run this script."
    exit 1
  else
    sudo systemctl start docker || sudo service docker start || true
    sleep 2
    if ! docker info >/dev/null 2>&1; then
      log_error "Failed to start Docker. Please start it manually and re-run."
      exit 1
    fi
  fi
fi

log_success "Prerequisites OK"

