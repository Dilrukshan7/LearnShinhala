#!/usr/bin/env bash
set -euo pipefail

export PATH="/usr/lib/postgresql/15/bin:$PATH"
BACKUP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/backups"
mkdir -p "$BACKUP_DIR"

TIMESTAMP="$(date -u +"%Y%m%d_%H%M%S")"
BACKUP_FILE="${BACKUP_DIR}/learn_sinhala_${TIMESTAMP}.sql"
DB_URL="${DATABASE_URL:-postgresql://postgres@localhost:5432/learn_sinhala}"

echo "[BACKUP] Creating UTF-8 PostgreSQL dump of Sinhala Vocabulary Encyclopedia..."
pg_dump "$DB_URL" --encoding=UTF8 --clean --if-exists --no-owner > "$BACKUP_FILE"
cp "$BACKUP_FILE" "${BACKUP_DIR}/latest.sql"

echo "[BACKUP] Completed successfully: $BACKUP_FILE"
