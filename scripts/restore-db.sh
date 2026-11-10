#!/usr/bin/env bash
set -euo pipefail

export PATH="/usr/lib/postgresql/15/bin:$PATH"
BACKUP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/backups"
SOURCE_FILE="${1:-${BACKUP_DIR}/latest.sql}"
DB_URL="${DATABASE_URL:-postgresql://postgres@localhost:5432/learn_sinhala}"

if [ ! -f "$SOURCE_FILE" ]; then
  echo "[RESTORE] Error: Backup file not found at $SOURCE_FILE"
  exit 1
fi

echo "[RESTORE] Restoring PostgreSQL database from $SOURCE_FILE..."
psql "$DB_URL" -f "$SOURCE_FILE"
echo "[RESTORE] Database restore completed successfully."
