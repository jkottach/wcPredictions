#!/usr/bin/env bash
# Import wc26.teams.json and wc26.matches.json into MongoDB (MongoDB extended JSON).
# Requires: mongosh (MongoDB Database Tools) and api/.env with MONGODB_URI + MONGODB_DB.
#
# Usage (from repo root):
#   chmod +x deploy/seed-from-export.sh
#   ./deploy/seed-from-export.sh
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="${ENV_FILE:-$ROOT/api/.env}"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Missing $ENV_FILE — copy api/.env.example to api/.env and set MONGODB_URI / MONGODB_DB." >&2
  exit 1
fi

set -a
# shellcheck disable=SC1090
source "$ENV_FILE"
set +a

if [[ -z "${MONGODB_URI:-}" || -z "${MONGODB_DB:-}" ]]; then
  echo "MONGODB_URI and MONGODB_DB must be set in $ENV_FILE" >&2
  exit 1
fi

if ! command -v mongoimport &>/dev/null; then
  echo "mongoimport not found. Install MongoDB Database Tools:" >&2
  echo "  https://www.mongodb.com/docs/database-tools/installation/" >&2
  exit 1
fi

TEAMS_FILE="${TEAMS_FILE:-$ROOT/wc26.teams.json}"
MATCHES_FILE="${MATCHES_FILE:-$ROOT/wc26.matches.json}"

for f in "$TEAMS_FILE" "$MATCHES_FILE"; do
  if [[ ! -f "$f" ]]; then
    echo "Missing seed file: $f" >&2
    exit 1
  fi
done

echo "==> Dropping existing teams and matches in database: $MONGODB_DB"
mongosh "$MONGODB_URI/$MONGODB_DB" --quiet --eval '
  db.teams.deleteMany({});
  db.matches.deleteMany({});
  print("Cleared teams and matches (users collection unchanged).");
'

echo "==> Importing teams from $TEAMS_FILE"
mongoimport \
  --uri="$MONGODB_URI" \
  --db="$MONGODB_DB" \
  --collection=teams \
  --file="$TEAMS_FILE" \
  --jsonArray

echo "==> Importing matches from $MATCHES_FILE"
mongoimport \
  --uri="$MONGODB_URI" \
  --db="$MONGODB_DB" \
  --collection=matches \
  --file="$MATCHES_FILE" \
  --jsonArray

echo "Seed complete. Users are created when people register or sign in with Google."
