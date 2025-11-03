#!/usr/bin/env bash

# Reloop VPS Setup Script
# Main orchestrator that runs all setup modules in order

set -euo pipefail

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR" || exit 1

# Display banner
source "$SCRIPT_DIR/common.sh"
reloop_banner

echo "=========================================="
echo "Reloop VPS Setup"
echo "=========================================="
echo
echo "This script will set up Reloop on your VPS in multiple steps."
echo "Each step can be run independently if needed."
echo "All passwords and credentials will be auto-generated."
echo

# Array of scripts to run in order
SETUP_SCRIPTS=(
  "00-install-dependencies.sh"
  "01-collect-config.sh"
  "02-setup-project.sh"
  "03-configure-env.sh"
  "04-generate-configs.sh"
  "05-setup-database.sh"
  "06-deploy-services.sh"
  "07-health-checks.sh"
  "08-summary.sh"
)

# Run each setup script
TOTAL_STEPS=${#SETUP_SCRIPTS[@]}
CURRENT_STEP=0

for script in "${SETUP_SCRIPTS[@]}"; do
  script_path="$SCRIPT_DIR/$script"

  if [[ ! -f "$script_path" ]]; then
    echo "⚠️  Warning: Script $script not found, skipping..."
    continue
  fi

  # Make sure script is executable
  chmod +x "$script_path"

  CURRENT_STEP=$((CURRENT_STEP + 1))
  echo
  echo "=========================================="
  echo "[${CURRENT_STEP}/${TOTAL_STEPS}] Running $script"
  echo "=========================================="

  # Run the script
  if bash "$script_path"; then
    echo "✅ Completed: $script"
  else
    echo "❌ Failed: $script"
    echo
    echo "Setup interrupted. You can:"
    echo "  1. Fix the issue and re-run this script (it will continue from where it left off)"
    echo "  2. Run individual scripts: bash $script_path"
    exit 1
  fi
done

echo
echo "=========================================="
echo "All setup steps completed successfully!"
echo "=========================================="
