#!/bin/sh
# Load .env from project root and compose DATABASE_URL for Prisma CLI
ROOT_DIR="$(cd "$(dirname "$0")/../../" && pwd)"
if [ -f "$ROOT_DIR/.env" ]; then
  set -a
  . "$ROOT_DIR/.env"
  set +a
fi

export DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST:-localhost}:${DB_PORT:-5432}/${DB_NAME}?schema=public"
exec "$@"
