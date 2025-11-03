#!/usr/bin/env bash

# Deploy Services
# This script pulls Docker images, builds services without images, and starts all services

set -euo pipefail

# Source common functions
source "$(dirname "$0")/common.sh"

step "Deploying services"

log_info "Pulling pre-built Docker images..."
($DC -f docker-compose.prod.yml pull 2>/dev/null || true) &
spinner $! "Pulling images"

log_info "Building services without pre-built images..."
# Build only services that don't have pre-built images (webhook, audience, tracehub, inngest)
($DC -f docker-compose.prod.yml build reloop-webhook reloop-audience reloop-tracehub reloop-inngest 2>/dev/null || echo "Build step completed") &
spinner $! "Building services"

log_info "Starting all services..."
($DC -f docker-compose.prod.yml up -d) &
spinner $! "Starting services"

log_info "Waiting for services to settle..."
sleep 15

log_success "Services deployed"

