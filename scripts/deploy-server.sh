#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PRINTFORGE_ENV="$ROOT_DIR/docker/printforge/.env.server"
WORDPRESS_ENV="$ROOT_DIR/docker/wordpress/.env"

require_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing required command: $1" >&2
    exit 1
  fi
}

require_file() {
  if [ ! -f "$1" ]; then
    echo "Missing required file: ${1#$ROOT_DIR/}" >&2
    echo "Create it from the matching .env example and set production secrets." >&2
    exit 1
  fi
}

require_command docker

if ! docker compose version >/dev/null 2>&1; then
  echo "Docker Compose v2 is required. Expected: docker compose ..." >&2
  exit 1
fi

require_file "$PRINTFORGE_ENV"
require_file "$WORDPRESS_ENV"

if ! docker network inspect printforge >/dev/null 2>&1; then
  docker network create printforge >/dev/null
  echo "Created Docker network: printforge"
fi

echo "Starting WordPress..."
docker compose \
  --env-file "$WORDPRESS_ENV" \
  -f "$ROOT_DIR/docker/wordpress/compose.yml" \
  up -d

echo "Building PrintForge production images..."
docker compose \
  --env-file "$PRINTFORGE_ENV" \
  -f "$ROOT_DIR/docker/printforge/compose.yml" \
  -f "$ROOT_DIR/docker/printforge/compose.server.yml" \
  build

echo "Starting Postgres..."
docker compose \
  --env-file "$PRINTFORGE_ENV" \
  -f "$ROOT_DIR/docker/printforge/compose.yml" \
  -f "$ROOT_DIR/docker/printforge/compose.server.yml" \
  up -d postgres

echo "Running Prisma migrations..."
docker compose \
  --env-file "$PRINTFORGE_ENV" \
  -f "$ROOT_DIR/docker/printforge/compose.yml" \
  -f "$ROOT_DIR/docker/printforge/compose.server.yml" \
  --profile tools \
  run --rm migrate

echo "Starting PrintForge services..."
docker compose \
  --env-file "$PRINTFORGE_ENV" \
  -f "$ROOT_DIR/docker/printforge/compose.yml" \
  -f "$ROOT_DIR/docker/printforge/compose.server.yml" \
  up -d fastify admin configurator

cat <<'EOF'

Production containers are running behind localhost-bound ports for server Caddy:

  Fastify API:      http://127.0.0.1:3000
  PrintForge Admin: http://127.0.0.1:5173/pf-admin/
  PrintForge iframe:http://127.0.0.1:5174/pf/
  WordPress:        http://127.0.0.1:8080

Expected Caddy routes:
  /api/*       -> 127.0.0.1:3000
  /pf-admin/*  -> 127.0.0.1:5173
  /pf/*        -> 127.0.0.1:5174
  /*           -> 127.0.0.1:8080
EOF
