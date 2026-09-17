#!/usr/bin/env bash
# Idempotent Cloud Agent bootstrap for Brisa Realty.
# Installs dependencies, ensures a local dev .env, and prepares the SQLite database.
set -euo pipefail

# Run from the repository root regardless of where the script is invoked.
cd "$(dirname "$0")/.."

# Install dependencies from the lockfile. postinstall runs `prisma generate`.
npm ci

# Create a local development .env if one is not already present.
# Local dev uses Prisma + SQLite and needs no external services; the only
# values that must be unique are the signing secrets, which we generate here.
if [ ! -f .env ]; then
  cp .env.example .env
  auth_secret="$(openssl rand -base64 32)"
  inquiry_secret="$(openssl rand -base64 32)"
  sed -i "s|^AUTH_SECRET=.*|AUTH_SECRET=\"${auth_secret}\"|" .env
  sed -i "s|^INQUIRY_NOTIFY_SECRET=.*|INQUIRY_NOTIFY_SECRET=\"${inquiry_secret}\"|" .env
fi

# Push the Prisma schema, install the SQLite inquiry-notify trigger, and seed
# Manila listings plus the demo studio admin. Safe to re-run (seed upserts).
npm run db:setup
