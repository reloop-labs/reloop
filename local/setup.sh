#!/usr/bin/env bash

# Function to populate .env file from .env.dev
populate_env() {
  local service_path=$1
  local env_file="$service_path/.env"
  local env_dev="$service_path/.env.dev"

  echo "--------------------------------------------------"
  echo "Setting up .env for: $service_path"

  if [ ! -f "$env_dev" ]; then
    echo "Warning: No .env.dev found in $service_path. Skipping."
    return
  fi

  if [ ! -f "$env_file" ]; then
    cp "$env_dev" "$env_file"
    echo "Success: Created .env from .env.dev"
  else
    echo "Info: .env already exists. Checking for missing keys..."
    # Logic to add missing keys from .env.dev to .env
    while IFS= read -r line || [[ -n "$line" ]]; do
      # Skip comments, empty lines, and lines without an equals sign
      if [[ $line =~ ^# ]] || [[ -z "${line// }" ]] || [[ ! $line == *"="* ]]; then
        continue
      fi

      key=$(echo "$line" | cut -d '=' -f 1)
      if ! grep -q "^$key=" "$env_file"; then
        echo "$line" >> "$env_file"
        echo "Added missing key: $key"
      fi
    done < "$env_dev"
    echo "Success: .env is up to date."
  fi
}

# Ensure we are in the root directory (assuming script is in local/)
cd "$(dirname "$0")/.." || exit

# List of services to populate
populate_env "apps/backend/api-key"
populate_env "apps/backend/auth"
populate_env "apps/backend/contacts"
populate_env "apps/backend/domain"
populate_env "apps/backend/email"
populate_env "apps/backend/logs"
populate_env "apps/backend/mail"
populate_env "apps/backend/template"
populate_env "apps/backend/upload"
populate_env "apps/backend/webhook"
populate_env "apps/backend/inbox"
populate_env "apps/backend/workflow"


echo "--------------------------------------------------"
echo "Setup complete!"
