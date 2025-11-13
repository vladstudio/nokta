#!/bin/bash
set -e

# Nokta App - Installation Script
# Installs and configures Nokta app on prepared Ubuntu server
# Run as the app user (not root)

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "======================================"
echo "Nokta App - Installation"
echo "======================================"
echo ""

# Check if NOT running as root
if [ "$EUID" -eq 0 ]; then
    echo -e "${RED}Error: Do NOT run as root${NC}"
    echo "Run as your app user: ./install.sh"
    exit 1
fi

# Configuration
APP_USER=$(whoami)
APP_DIR="/home/$APP_USER/nokta"
DOMAIN=""
ADMIN_EMAIL=""
ADMIN_PASSWORD=""

# Prompt for configuration
echo "======================================"
echo "Configuration"
echo "======================================"
read -p "Domain name (e.g., nokta.example.com): " DOMAIN
read -p "Admin email: " ADMIN_EMAIL
read -sp "Admin password (min 10 chars): " ADMIN_PASSWORD
echo ""
read -sp "Confirm admin password: " ADMIN_PASSWORD_CONFIRM
echo ""

# Validate input
if [ -z "$DOMAIN" ] || [ -z "$ADMIN_EMAIL" ] || [ -z "$ADMIN_PASSWORD" ]; then
    echo -e "${RED}Error: All fields are required${NC}"
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
echo "======================================"
echo "Installation Summary"
echo "======================================"
echo "User: $APP_USER"
echo "Install Directory: $APP_DIR"
echo "Domain: $DOMAIN"
echo "Admin Email: $ADMIN_EMAIL"
echo "Backend URL: https://$DOMAIN"
echo ""
read -p "Continue with installation? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
fi

# Check if nokta-app.tar.gz exists
if [ ! -f "nokta-app.tar.gz" ]; then
    echo -e "${RED}Error: nokta-app.tar.gz not found${NC}"
    echo "Upload the deployment package first:"
    echo "  scp nokta-app.tar.gz $APP_USER@$DOMAIN:~/"
    exit 1
fi

# Install Caddy
echo -e "${BLUE}[1/10]${NC} Installing Caddy web server..."
if ! command -v caddy &> /dev/null; then
    sudo apt-get install -y debian-keyring debian-archive-keyring apt-transport-https curl
    curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
    curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
    sudo apt-get update
    sudo apt-get install -y caddy
    echo "  Caddy installed"
else
    echo "  Caddy already installed"
fi

# Extract deployment package
echo -e "${BLUE}[2/10]${NC} Extracting application files..."
rm -rf $APP_DIR
mkdir -p $APP_DIR
tar -xzf nokta-app.tar.gz -C $APP_DIR --strip-components=1
cd $APP_DIR

# Verify extraction
if [ ! -d "frontend" ] || [ ! -d "backend" ]; then
    echo -e "${RED}Error: Invalid deployment package${NC}"
    exit 1
fi

# Configure backend environment
echo -e "${BLUE}[3/10]${NC} Configuring backend..."
cat > backend/.env << EOF
ADMIN_EMAIL=$ADMIN_EMAIL
ADMIN_PASSWORD=$ADMIN_PASSWORD
EOF

chmod 600 backend/.env

# Make PocketBase executable
chmod +x backend/pocketbase

# Initialize PocketBase database
echo -e "${BLUE}[4/10]${NC} Initializing database..."
cd backend

# Create admin user
echo "  Creating admin user..."
./pocketbase superuser create "$ADMIN_EMAIL" "$ADMIN_PASSWORD" || true

# Run migrations (PocketBase will apply them automatically on first start)
echo "  Database initialized"
cd ..

# Configure Caddy
echo -e "${BLUE}[5/10]${NC} Configuring Caddy..."
sudo tee /etc/caddy/Caddyfile > /dev/null << EOF
# Nokta App - Caddy Configuration
# Generated: $(date)

$DOMAIN {
    # Frontend - serve static files
    root * $APP_DIR/frontend

    # Enable compression
    encode gzip

    # Backend API - reverse proxy to PocketBase
    reverse_proxy /api/* localhost:8090
    reverse_proxy /_/* localhost:8090

    # Serve static files
    file_server

    # SPA fallback - serve index.html for all non-API routes
    try_files {path} /index.html

    # Security headers
    header {
        # Prevent clickjacking
        X-Frame-Options "SAMEORIGIN"
        # Prevent MIME type sniffing
        X-Content-Type-Options "nosniff"
        # Enable XSS protection
        X-XSS-Protection "1; mode=block"
        # HSTS (optional, uncomment after HTTPS is working)
        # Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
    }

    # Logs
    log {
        output file /var/log/caddy/nokta-access.log
        format json
    }
}
EOF

# Create log directory
sudo mkdir -p /var/log/caddy
sudo chown caddy:caddy /var/log/caddy

# Test Caddy configuration
sudo caddy validate --config /etc/caddy/Caddyfile

# Create systemd service for PocketBase
echo -e "${BLUE}[6/10]${NC} Creating PocketBase service..."
sudo tee /etc/systemd/system/nokta-backend.service > /dev/null << EOF
[Unit]
Description=Nokta App - PocketBase Backend
After=network.target
Wants=network-online.target

[Service]
Type=simple
User=$APP_USER
Group=$APP_USER
WorkingDirectory=$APP_DIR/backend
ExecStart=$APP_DIR/backend/pocketbase serve --http=127.0.0.1:8090
Restart=always
RestartSec=5
StandardOutput=journal
StandardError=journal

# Security hardening
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=$APP_DIR/backend/pb_data
ProtectKernelTunables=true
ProtectKernelModules=true
ProtectControlGroups=true

[Install]
WantedBy=multi-user.target
EOF

# Reload systemd
sudo systemctl daemon-reload

# Enable and start services
echo -e "${BLUE}[7/10]${NC} Starting services..."
sudo systemctl enable nokta-backend
sudo systemctl start nokta-backend

# Wait for backend to start
echo "  Waiting for backend to start..."
sleep 3

# Check if backend is running
if ! systemctl is-active --quiet nokta-backend; then
    echo -e "${RED}Error: Backend failed to start${NC}"
    echo "Check logs: sudo journalctl -u nokta-backend -n 50"
    exit 1
fi

# Restart Caddy to apply configuration
sudo systemctl reload caddy

# Setup logrotate for PocketBase logs
echo -e "${BLUE}[8/10]${NC} Configuring log rotation..."
sudo tee /etc/logrotate.d/nokta-app > /dev/null << EOF
$APP_DIR/backend/*.log {
    daily
    rotate 14
    compress
    delaycompress
    missingok
    notifempty
    create 0640 $APP_USER $APP_USER
    postrotate
        systemctl reload nokta-backend > /dev/null 2>&1 || true
    endscript
}
EOF

# Create maintenance scripts
echo -e "${BLUE}[9/10]${NC} Creating maintenance scripts..."
cat > $APP_DIR/backup.sh << 'EOF'
#!/bin/bash
# Nokta App - Backup Script
set -e

BACKUP_DIR="$HOME/nokta-backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
APP_DIR="$HOME/nokta"

mkdir -p $BACKUP_DIR

# Backup PocketBase database
echo "Backing up database..."
tar -czf $BACKUP_DIR/pb_data_$TIMESTAMP.tar.gz -C $APP_DIR/backend pb_data

# Keep only last 7 backups
find $BACKUP_DIR -name "pb_data_*.tar.gz" -mtime +7 -delete

echo "Backup completed: $BACKUP_DIR/pb_data_$TIMESTAMP.tar.gz"
EOF

cat > $APP_DIR/update.sh << 'EOF'
#!/bin/bash
# Nokta App - Update Script
set -e

APP_DIR="$HOME/nokta"

echo "Updating Nokta App..."

# Backup database first
$APP_DIR/backup.sh

# Upload new nokta-app.tar.gz to server first, then run this script

if [ ! -f "$HOME/nokta-app.tar.gz" ]; then
    echo "Error: nokta-app.tar.gz not found in home directory"
    exit 1
fi

# Stop services
sudo systemctl stop nokta-backend

# Extract new version
tar -xzf $HOME/nokta-app.tar.gz -C $APP_DIR --strip-components=1

# Preserve .env file
# (already preserved by tar, but ensure permissions)
chmod 600 $APP_DIR/backend/.env
chmod +x $APP_DIR/backend/pocketbase

# Start services
sudo systemctl start nokta-backend
sudo systemctl reload caddy

echo "Update completed!"
echo "Check status: systemctl status nokta-backend"
EOF

chmod +x $APP_DIR/backup.sh
chmod +x $APP_DIR/update.sh

# Setup daily backups
echo -e "${BLUE}[10/10]${NC} Setting up automated backups..."
(crontab -l 2>/dev/null || true; echo "0 3 * * * $APP_DIR/backup.sh >> $APP_DIR/backup.log 2>&1") | crontab -

echo ""
echo -e "${GREEN}✓ Installation completed successfully!${NC}"
echo ""
echo "======================================"
echo "Installation Summary"
echo "======================================"
echo "✓ Caddy web server installed and configured"
echo "✓ Application files extracted"
echo "✓ Backend configured and running"
echo "✓ Database initialized"
echo "✓ Services enabled (auto-start on boot)"
echo "✓ Log rotation configured"
echo "✓ Maintenance scripts created"
echo "✓ Daily backups scheduled (3 AM)"
echo ""
echo "======================================"
echo "Access Your Application"
echo "======================================"
echo "Frontend: https://$DOMAIN"
echo "Admin Email: $ADMIN_EMAIL"
echo "Admin Password: [your password]"
echo ""
echo "PocketBase Admin: https://$DOMAIN/_/"
echo ""
echo "======================================"
echo "Important Notes"
echo "======================================"
echo "1. SSL certificates are automatically managed by Caddy"
echo "2. First HTTPS connection may take a few seconds"
echo "3. Backend runs on localhost:8090 (not exposed)"
echo ""
echo "======================================"
echo "Useful Commands"
echo "======================================"
echo "Check backend status:"
echo "  sudo systemctl status nokta-backend"
echo ""
echo "View backend logs:"
echo "  sudo journalctl -u nokta-backend -f"
echo ""
echo "Restart backend:"
echo "  sudo systemctl restart nokta-backend"
echo ""
echo "Restart Caddy:"
echo "  sudo systemctl reload caddy"
echo ""
echo "Create manual backup:"
echo "  $APP_DIR/backup.sh"
echo ""
echo "Update application:"
echo "  # Upload new nokta-app.tar.gz first"
echo "  $APP_DIR/update.sh"
echo ""
echo "======================================"
echo "Next Steps"
echo "======================================"
echo "1. Visit https://$DOMAIN to access your app"
echo "2. Log in with admin credentials"
echo "3. Create your first user account"
echo "4. Configure spaces and chats"
echo ""
echo "For support, check the logs if issues occur:"
echo "  sudo journalctl -u nokta-backend -n 100"
echo ""
