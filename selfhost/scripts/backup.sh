#!/usr/bin/env bash
# Backup diário do Supabase self-hosted
# Cron: 0 3 * * * /opt/supabase/backup.sh >> /var/log/supabase-backup.log 2>&1
set -euo pipefail

BACKUP_DIR=/backups
RETENTION_DAYS=7
STAMP=$(date +%Y-%m-%d-%H%M)

mkdir -p "$BACKUP_DIR"

cd /opt/supabase/docker

# 1) Dump do Postgres
echo "[$(date)] Dump do Postgres..."
docker compose exec -T db pg_dumpall -U postgres | gzip > "$BACKUP_DIR/db-$STAMP.sql.gz"

# 2) Tar do storage
echo "[$(date)] Tar do storage..."
tar -czf "$BACKUP_DIR/storage-$STAMP.tar.gz" -C /opt/supabase/docker/volumes storage

# 3) Limpeza (manter últimos N dias)
echo "[$(date)] Limpeza > $RETENTION_DAYS dias..."
find "$BACKUP_DIR" -name "db-*.sql.gz"     -mtime +$RETENTION_DAYS -delete
find "$BACKUP_DIR" -name "storage-*.tar.gz" -mtime +$RETENTION_DAYS -delete

# 4) (Opcional) Sync para Oracle Object Storage via rclone
#    Configure com: rclone config (provider: Oracle Cloud Object Storage)
# rclone copy "$BACKUP_DIR" oracle:crm-backups --max-age 7d --transfers 4

echo "[$(date)] Backup concluído:"
ls -lh "$BACKUP_DIR" | tail -10
