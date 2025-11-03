#!/usr/bin/env bash

# Summary
# This script displays the final setup summary and useful information

set -euo pipefail

# Source common functions
source "$(dirname "$0")/common.sh"

# Load configuration
# shellcheck disable=SC1091
[[ -f .env ]] && source .env

step "Summary and next steps"

# Configure firewall if on Linux
if $IS_LINUX && command -v ufw >/dev/null 2>&1; then
  log_info "Configuring firewall..."
  ( \
    sudo ufw allow 22/tcp && \
    sudo ufw allow 80/tcp && \
    sudo ufw allow 443/tcp \
  ) &
  spinner $! "Opening required ports"

  # Check if firewall is already enabled
  if ! sudo ufw status | grep -q "Status: active"; then
    log_info "Enabling UFW firewall..."
    sudo ufw --force enable || log_warning "Failed to enable firewall (may need manual configuration)"
    log_success "Firewall configured"
  else
    log_success "Firewall already enabled"
  fi
fi

echo
echo "=========================================="
echo "Reloop VPS Setup Complete!"
echo "=========================================="
echo
echo "Your Reloop instance is now running at:"
echo "  🌐 Main Site:     https://$DOMAIN"
echo "  📊 Dashboard:     https://$DOMAIN/dashboard"
echo "  🛠️  Admin Panel:   https://$DOMAIN/admin"
echo "  📚 Documentation: https://$DOMAIN/docs"
echo "  💻 Dev Portal:    https://$DOMAIN/dev"
echo
echo "API Endpoints:"
echo "  🔐 Auth:      https://$DOMAIN/api/auth"
echo "  🔑 API Key:   https://$DOMAIN/api/api-key"
echo "  🌍 Domain:    https://$DOMAIN/api/domain"
echo "  📡 Webhook:   https://$DOMAIN/api/webhook"
echo "  👥 Audience:  https://$DOMAIN/api/audience"
echo "  📧 Mail:      https://$DOMAIN/api/mail"
echo "  📊 TraceHub:  https://$DOMAIN/api/tracehub"
echo "  ⚙️  Inngest:   https://$DOMAIN/api/inngest"
echo
echo "Management:"
if [[ -n "${GF_SECURITY_ADMIN_PASSWORD:-}" ]]; then
  echo "  📈 Grafana:   http://localhost:3400 (admin password in .env: GF_SECURITY_ADMIN_PASSWORD)"
else
  echo "  📈 Grafana:   http://localhost:3400 (check .env for admin password)"
fi
echo
echo "Useful Commands:"
echo "  View logs:    $DC -f docker-compose.prod.yml logs -f [service-name]"
echo "  All logs:     $DC -f docker-compose.prod.yml logs -f"
echo "  Stop all:     $DC -f docker-compose.prod.yml down"
echo "  Restart:      $DC -f docker-compose.prod.yml restart [service-name]"
echo "  Status:       $DC -f docker-compose.prod.yml ps"
echo "  Update:       git pull && $DC -f docker-compose.prod.yml up -d --build"
echo
echo "Database Management:"
echo "  Migrate:      bun run db:push"
echo "  Studio:       bun run db:studio"
echo
echo "⚠️  Important:"
echo "  - Keep your .env file secure (contains passwords)"
echo "  - Change default Grafana password"
echo "  - Configure DNS records for $DOMAIN"
echo "  - SSL certificates will be issued automatically by Caddy"
echo
echo "Next Steps:"
echo "  1. Point your DNS A record for $DOMAIN to this server's IP"
echo "  2. Wait for DNS propagation (may take a few minutes)"
echo "  3. Caddy will automatically obtain SSL certificates"
echo "  4. Visit https://$DOMAIN to start using Reloop"
echo
echo "Done! 🎉"

