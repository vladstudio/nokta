#!/bin/bash
set -e

# Nokta App - Installation Script
# Run as app user (not root)

RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "======================================"
echo "Nokta App - Installation"
echo "======================================"

if [ "$EUID" -eq 0 ]; then
    echo -e "${RED}Error: Do NOT run as root${NC}"
    exit 1
fi

APP_USER=$(whoami)
APP_DIR="/home/$APP_USER/nokta"
REPO_URL="https://github.com/vladstudio/nokta"

echo ""
read -p "Domain (e.g., nokta.example.com): " DOMAIN
read -p "Admin email: " ADMIN_EMAIL
read -sp "Admin password (min 10 chars): " ADMIN_PASSWORD
echo ""
read -sp "Confirm password: " ADMIN_PASSWORD_CONFIRM
echo ""
read -p "Daily.co API key: " DAILY_API_KEY

if [ -z "$DOMAIN" ] || [ -z "$ADMIN_EMAIL" ] || [ -z "$ADMIN_PASSWORD" ] || [ -z "$DAILY_API_KEY" ]; then
    echo -e "${RED}Error: All fields required${NC}"
    exit 1
fi

if [ "$ADMIN_PASSWORD" != "$ADMIN_PASSWORD_CONFIRM" ]; then
    echo -e "${RED}Error: Passwords do not match${NC}"
    exit 1
fi

if [ ${#ADMIN_PASSWORD} -lt 10 ]; then
    echo -e "${RED}Error: Password must be at least 10 characters${NC}"
    exit 1
fi

echo ""
echo "Domain: $DOMAIN | Email: $ADMIN_EMAIL | Dir: $APP_DIR"
read -p "Continue? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
fi

# Install Caddy
echo -e "${BLUE}[1/11]${NC} Installing Caddy..."
if ! command -v caddy &> /dev/null; then
    sudo apt-get install -y debian-keyring debian-archive-keyring apt-transport-https curl
    curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
    curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
    sudo apt-get update
    sudo apt-get install -y caddy
fi

# Download from GitHub
echo -e "${BLUE}[2/11]${NC} Downloading from GitHub..."
rm -rf $APP_DIR
curl -L $REPO_URL/archive/refs/heads/main.tar.gz | tar -xz
mv nokta-main $APP_DIR
cd $APP_DIR

if [ ! -d "frontend" ] || [ ! -d "backend" ]; then
    echo -e "${RED}Error: Invalid repository structure${NC}"
    exit 1
fi

# Download PocketBase
echo -e "${BLUE}[3/11]${NC} Downloading PocketBase..."
PB_VERSION="0.23.6"

# Detect system architecture
ARCH=$(uname -m)
case "$ARCH" in
    x86_64)
        PB_ARCH="linux_amd64"
        ;;
    aarch64|arm64)
        PB_ARCH="linux_arm64"
        ;;
    *)
        echo -e "${RED}Error: Unsupported architecture: $ARCH${NC}"
        echo "Supported: x86_64, aarch64/arm64"
        exit 1
        ;;
esac

echo "Detected architecture: $ARCH -> $PB_ARCH"
curl -L "https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_${PB_ARCH}.zip" -o /tmp/pb.zip
unzip -o /tmp/pb.zip -d backend/
rm /tmp/pb.zip
chmod +x backend/pocketbase

# Configure environment
echo -e "${BLUE}[4/11]${NC} Configuring environment..."
cat > backend/.env << EOF
ADMIN_EMAIL=$ADMIN_EMAIL
ADMIN_PASSWORD=$ADMIN_PASSWORD
EOF
chmod 600 backend/.env

cat > frontend/.env << EOF
VITE_POCKETBASE_URL=https://$DOMAIN
VITE_DAILY_CO_API_KEY=$DAILY_API_KEY
EOF
chmod 644 frontend/.env

# Initialize database
echo -e "${BLUE}[5/11]${NC} Initializing database..."
cd backend
./pocketbase superuser create "$ADMIN_EMAIL" "$ADMIN_PASSWORD" || true
cd ..

# Configure Caddy
echo -e "${BLUE}[6/11]${NC} Configuring Caddy..."
sudo tee /etc/caddy/Caddyfile > /dev/null << EOF
$DOMAIN {
    root * $APP_DIR/frontend
    encode gzip

    reverse_proxy /api/* localhost:8090
    reverse_proxy /_/* localhost:8090

    file_server
    try_files {path} /index.html

    header {
        X-Frame-Options "SAMEORIGIN"
        X-Content-Type-Options "nosniff"
        X-XSS-Protection "1; mode=block"
    }

    log {
        output file /var/log/caddy/nokta.log
        format json
    }
}
EOF

sudo mkdir -p /var/log/caddy
sudo chown caddy:caddy /var/log/caddy
sudo caddy validate --config /etc/caddy/Caddyfile

# Create systemd service
echo -e "${BLUE}[7/11]${NC} Creating systemd service..."
sudo tee /etc/systemd/system/nokta-backend.service > /dev/null << EOF
[Unit]
Description=Nokta App Backend
After=network.target

[Service]
Type=simple
User=$APP_USER
WorkingDirectory=$APP_DIR/backend
ExecStart=$APP_DIR/backend/pocketbase serve --http=127.0.0.1:8090
Restart=always
RestartSec=5

NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=$APP_DIR/backend/pb_data

[Install]
WantedBy=multi-user.target
EOF

# Start services
echo -e "${BLUE}[8/11]${NC} Starting services..."
sudo systemctl daemon-reload
sudo systemctl enable nokta-backend
sudo systemctl start nokta-backend
sleep 3

if ! systemctl is-active --quiet nokta-backend; then
    echo -e "${RED}Error: Backend failed to start${NC}"
    echo "Check logs: sudo journalctl -u nokta-backend -n 50"
    exit 1
fi

sudo systemctl reload caddy

# Setup log rotation
echo -e "${BLUE}[9/11]${NC} Configuring log rotation..."
sudo tee /etc/logrotate.d/nokta-app > /dev/null << EOF
$APP_DIR/backend/*.log {
    daily
    rotate 14
    compress
    missingok
    notifempty
}
EOF

# Create maintenance scripts
echo -e "${BLUE}[10/11]${NC} Creating maintenance scripts..."
cat > $APP_DIR/backup.sh << 'EOF'
#!/bin/bash
set -e
BACKUP_DIR="$HOME/nokta-backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR
tar -czf $BACKUP_DIR/pb_data_$TIMESTAMP.tar.gz -C $HOME/nokta/backend pb_data
find $BACKUP_DIR -name "pb_data_*.tar.gz" -mtime +7 -delete
echo "Backup: $BACKUP_DIR/pb_data_$TIMESTAMP.tar.gz"
EOF

cat > $APP_DIR/update.sh << 'EOF'
#!/bin/bash
set -e
APP_DIR="$HOME/nokta"
REPO_URL="https://github.com/vladstudio/nokta"
PB_VERSION="0.23.6"

echo "Updating from GitHub..."
$APP_DIR/backup.sh

sudo systemctl stop nokta-backend

cp $APP_DIR/backend/.env $HOME/.env.backend.backup
cp $APP_DIR/frontend/.env $HOME/.env.frontend.backup
mv $APP_DIR/backend/pb_data $HOME/pb_data.backup

rm -rf $APP_DIR
curl -L $REPO_URL/archive/refs/heads/main.tar.gz | tar -xz
mv nokta-main $APP_DIR

# Detect system architecture
ARCH=$(uname -m)
case "$ARCH" in
    x86_64)
        PB_ARCH="linux_amd64"
        ;;
    aarch64|arm64)
        PB_ARCH="linux_arm64"
        ;;
    *)
        echo "Error: Unsupported architecture: $ARCH"
        exit 1
        ;;
esac

echo "Detected architecture: $ARCH -> $PB_ARCH"
curl -L "https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_${PB_ARCH}.zip" -o /tmp/pb.zip
unzip -o /tmp/pb.zip -d $APP_DIR/backend/
rm /tmp/pb.zip

mv $HOME/.env.backend.backup $APP_DIR/backend/.env
mv $HOME/.env.frontend.backup $APP_DIR/frontend/.env
mv $HOME/pb_data.backup $APP_DIR/backend/pb_data
chmod 600 $APP_DIR/backend/.env
chmod 644 $APP_DIR/frontend/.env
chmod +x $APP_DIR/backend/pocketbase

sudo systemctl start nokta-backend
sudo systemctl reload caddy

echo "Update complete!"
EOF

chmod +x $APP_DIR/backup.sh
chmod +x $APP_DIR/update.sh

# Setup daily backups
echo -e "${BLUE}[11/11]${NC} Setting up automated backups..."
(crontab -l 2>/dev/null || true; echo "0 3 * * * $APP_DIR/backup.sh >> $APP_DIR/backup.log 2>&1") | crontab -

echo ""
echo -e "${GREEN}✓ Installation complete!${NC}"
echo ""
echo "Access: https://$DOMAIN"
echo "Admin: $ADMIN_EMAIL"
echo "PocketBase Admin: https://$DOMAIN/_/"
echo ""
echo "Useful commands:"
echo "  sudo systemctl status nokta-backend"
echo "  sudo journalctl -u nokta-backend -f"
echo "  $APP_DIR/backup.sh"
echo "  $APP_DIR/update.sh"
echo ""
