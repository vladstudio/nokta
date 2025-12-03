#!/bin/bash
set -e
BACKUP_DIR="$HOME/nokta-backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

# Backup PocketBase data
tar -czf $BACKUP_DIR/pb_data_$TIMESTAMP.tar.gz -C $HOME/nokta/backend pb_data

# Backup Firebase service account if exists
if [ -f "$HOME/nokta/backend/firebase-service-account.json" ]; then
  cp $HOME/nokta/backend/firebase-service-account.json $BACKUP_DIR/firebase-service-account_$TIMESTAMP.json
fi

# Clean up old backups (keep 7 days)
find $BACKUP_DIR -name "pb_data_*.tar.gz" -mtime +7 -delete
find $BACKUP_DIR -name "firebase-service-account_*.json" -mtime +7 -delete

echo "Backup: $BACKUP_DIR/pb_data_$TIMESTAMP.tar.gz"
