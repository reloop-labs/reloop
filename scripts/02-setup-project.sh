#!/usr/bin/env bash

# Setup Project
# This script installs dependencies and builds packages

set -euo pipefail

# Source common functions
source "$(dirname "$0")/common.sh"

step "Setting up project"

if [[ ! -f package.json ]]; then
  log_error "package.json not found. Are you in the correct directory?"
  exit 1
fi

log_info "Installing dependencies..."
(bun install) &
spinner $! "Installing dependencies"

log_info "Building packages (if needed)..."
# Packages will be built during Docker image build, but we can build them here too
(bun run build --filter='@reloop/*' || echo "Package build skipped - will build in Docker") &
spinner $! "Building packages"

log_success "Project setup complete"

