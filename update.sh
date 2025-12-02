#!/bin/bash
set -e
APP_DIR="$HOME/nokta"
PB_VERSION="0.23.6"

echo "Backing up..."
$APP_DIR/backup.sh

echo "Stopping backend..."
sudo systemctl stop nokta-backend

cp $APP_DIR/backend/.env /tmp/.env.backend.backup
cp $APP_DIR/frontend/.env /tmp/.env.frontend.backup
mv $APP_DIR/backend/pb_data /tmp/pb_data.backup

echo "Downloading update..."
rm -rf $APP_DIR
curl -L https://github.com/vladstudio/nokta/archive/refs/heads/main.tar.gz | tar -xz -C $HOME
mv $HOME/nokta-main $APP_DIR

ARCH=$(uname -m)
case "$ARCH" in
  x86_64) PB_ARCH="linux_amd64" ;;
  aarch64|arm64) PB_ARCH="linux_arm64" ;;
esac
curl -L "https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_${PB_ARCH}.zip" -o /tmp/pb.zip
unzip -o /tmp/pb.zip -d $APP_DIR/backend/
rm /tmp/pb.zip
chmod +x $APP_DIR/backend/pocketbase

mv /tmp/.env.backend.backup $APP_DIR/backend/.env
mv /tmp/.env.frontend.backup $APP_DIR/frontend/.env
mv /tmp/pb_data.backup $APP_DIR/backend/pb_data
chmod 600 $APP_DIR/backend/.env

echo "Building frontend..."
cd $APP_DIR/frontend
~/.bun/bin/bun install
~/.bun/bin/bun run build

chmod 755 $APP_DIR $APP_DIR/frontend $APP_DIR/frontend/dist

sudo systemctl start nokta-backend
sudo systemctl reload caddy

echo "Update complete!"
