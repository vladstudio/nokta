#!/bin/bash
set -e
BACKUP_DIR="$HOME/nokta-backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR
tar -czf $BACKUP_DIR/pb_data_$TIMESTAMP.tar.gz -C $HOME/nokta/backend pb_data
find $BACKUP_DIR -name "pb_data_*.tar.gz" -mtime +7 -delete
echo "Backup: $BACKUP_DIR/pb_data_$TIMESTAMP.tar.gz"
