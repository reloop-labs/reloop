#!/bin/sh
# Runs the IMAP service for `bun dev`. Exits cleanly (without stopping the
# other services) when Go is missing or older than go.mod requires.
cd "$(dirname "$0")/.." || exit 1

need=$(awk '/^go /{print $2; exit}' go.mod)
if ! command -v go >/dev/null 2>&1; then
	echo "[be-imap] Go $need+ is not installed; skipping IMAP. Install with: brew install go"
	exit 0
fi
have=$(go env GOVERSION | sed 's/^go//')
if [ "$(printf '%s\n%s\n' "$need" "$have" | sort -V | head -n1)" != "$need" ]; then
	echo "[be-imap] Go $have is older than $need; skipping IMAP. Upgrade with: brew upgrade go"
	exit 0
fi

[ -f .env ] || cp .env.dev .env
exec go run . serve
