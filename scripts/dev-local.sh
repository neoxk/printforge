#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PRINTFORGE_ENV="$ROOT_DIR/docker/printforge/.env"
WORDPRESS_ENV="$ROOT_DIR/docker/wordpress/.env"

require_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing required command: $1" >&2
    exit 1
  fi
}

create_file_if_missing() {
  local target="$1"
  local source="$2"

  if [ -f "$target" ]; then
    return
  fi

  cp "$source" "$target"
  echo "Created ${target#$ROOT_DIR/}"
}

ensure_env_value() {
  local target="$1"
  local key="$2"
  local value="$3"

  if grep -q "^${key}=" "$target"; then
    return
  fi

  printf '\n%s=%s\n' "$key" "$value" >> "$target"
  echo "Added ${key} to ${target#$ROOT_DIR/}"
}

require_command docker

if ! docker compose version >/dev/null 2>&1; then
  echo "Docker Compose v2 is required. Expected: docker compose ..." >&2
  exit 1
fi

if [ -d "$ROOT_DIR/docker/data/postgres" ] && [ ! -f "$PRINTFORGE_ENV" ]; then
  echo "Existing Postgres data was found. Keep .env credentials aligned with that data volume." >&2
fi

create_file_if_missing "$WORDPRESS_ENV" "$ROOT_DIR/docker/wordpress/.env.example"
create_file_if_missing "$PRINTFORGE_ENV" "$ROOT_DIR/docker/printforge/.env.example"
ensure_env_value "$PRINTFORGE_ENV" "WOOCOMMERCE_INTERNAL_URL" "http://wordpress"

if ! docker network inspect printforge >/dev/null 2>&1; then
  docker network create printforge >/dev/null
  echo "Created Docker network: printforge"
fi

echo "Starting WordPress and PrintForge local services..."
docker compose \
  --env-file "$WORDPRESS_ENV" \
  -f "$ROOT_DIR/docker/wordpress/compose.yml" \
  up -d

docker compose \
  --env-file "$PRINTFORGE_ENV" \
  -f "$ROOT_DIR/docker/printforge/compose.yml" \
  -f "$ROOT_DIR/docker/printforge/compose.local.yml" \
  up -d

cat <<'EOF'

Local PrintForge is starting.

URLs:
  WordPress:          http://localhost:8080
  PrintForge Admin:  http://localhost:5174/pf-admin/
  PrintForge iframe: http://localhost:5174/pf/
  API:               http://localhost:5174/api/

Useful commands:
  docker compose -f docker/printforge/compose.yml -f docker/printforge/compose.local.yml logs -f
  docker compose -f docker/wordpress/compose.yml logs -f
EOF
