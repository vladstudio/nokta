#!/bin/bash
set -e
BACKUP_DIR="$HOME/nokta-backups"
SECRETS_DIR="$HOME/.nokta"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

# Backup PocketBase data
tar -czf $BACKUP_DIR/pb_data_$TIMESTAMP.tar.gz -C $HOME/nokta-main/backend pb_data

# Backup secrets directory if exists
if [ -d "$SECRETS_DIR" ]; then
  tar -czf $BACKUP_DIR/secrets_$TIMESTAMP.tar.gz -C $HOME .nokta
fi

# Clean up old backups (keep 7 days)
find $BACKUP_DIR -name "pb_data_*.tar.gz" -mtime +7 -delete
find $BACKUP_DIR -name "secrets_*.tar.gz" -mtime +7 -delete

echo "Backup: $BACKUP_DIR/pb_data_$TIMESTAMP.tar.gz"
