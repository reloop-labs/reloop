#!/usr/bin/env bash

# Common functions and variables for Reloop setup scripts
# Source this file in each setup script: source "$(dirname "$0")/common.sh"

set -euo pipefail

# ==========================
# Directory Setup
# ==========================
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

# Change to root directory
cd "$ROOT_DIR" || exit 1

# Export for use in other scripts
export SCRIPT_DIR ROOT_DIR

# ==========================
# OS Detection
# ==========================
OS_NAME="$(uname -s)"
IS_MAC=false
IS_LINUX=false
[[ "$OS_NAME" == "Darwin" ]] && IS_MAC=true
[[ "$OS_NAME" == "Linux" ]] && IS_LINUX=true

export OS_NAME IS_MAC IS_LINUX

# ==========================
# Helper Functions
# ==========================

# ASCII banner
reloop_banner() {
  cat <<'BANNER'
 _____  ______  _
|  __ \|  ____|| |
| |__) | |__   | |     ___   ___   _ __  ___
|  _  /|  __|  | |    / _ \ / _ \ | '__|/ __|
| | \ \| |____ | |___| (_) | (_) || |   \__ \
|_|  \_\______||______\___/ \___/ |_|   |___/

BANNER
}

# Spinner for long-running operations
spinner() {
  local pid=$1
  local msg=$2
  local sp='|/-\'
  local i=0
  printf "%s " "$msg"
  while kill -0 "$pid" 2>/dev/null; do
    printf "\r%s %s" "$msg" "${sp:i++%${#sp}:1}"
    sleep 0.1
  done
  printf "\r%s ✓\n" "$msg"
}

# Portable sed replace (Linux/macOS)
sed_in_place() {
  local search=$1
  local replace=$2
  local file=$3
  if $IS_MAC; then
    sed -i '' -e "s|${search}|${replace}|g" "$file"
  else
    sed -i -e "s|${search}|${replace}|g" "$file"
  fi
}

# Generate secure random secret
generate_secret() {
  openssl rand -hex 32 2>/dev/null || head -c 32 /dev/urandom | base64 | tr -d '\n'
}

# Docker Compose command detection
detect_docker_compose() {
  if docker compose version >/dev/null 2>&1; then
    echo "docker compose"
  elif command -v docker-compose >/dev/null 2>&1; then
    echo "docker-compose"
  else
    echo ""
  fi
}

# Get Docker Compose command (cached)
DC=$(detect_docker_compose)
export DC

# ==========================
# Step Counter
# ==========================
TOTAL_STEPS=8
CURRENT_STEP=0

step() {
  CURRENT_STEP=$((CURRENT_STEP + 1))
  echo
  echo ">>> [${CURRENT_STEP}/${TOTAL_STEPS}] $*"
  echo
}

# ==========================
# Logging Functions
# ==========================
log_info() {
  echo "ℹ️  $*"
}

log_success() {
  echo "✅ $*"
}

log_warning() {
  echo "⚠️  $*"
}

log_error() {
  echo "❌ $*" >&2
}

