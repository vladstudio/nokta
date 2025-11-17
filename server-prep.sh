#!/bin/bash
set -e

# Nokta App - Server Preparation Script
# Prepares a fresh Ubuntu 24.04 server with security hardening
# Run this FIRST before installation

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "======================================"
echo "Nokta App - Server Preparation"
echo "======================================"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}Error: Must run as root (use sudo)${NC}"
    exit 1
fi

# Check OS version
if [ ! -f /etc/os-release ]; then
    echo -e "${RED}Error: Cannot detect OS version${NC}"
    exit 1
fi

source /etc/os-release
if [ "$ID" != "ubuntu" ]; then
    echo -e "${YELLOW}Warning: This script is designed for Ubuntu 24.04${NC}"
    echo "Current OS: $PRETTY_NAME"
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Detect server public IP
echo "Detecting server public IP..."
SERVER_IP=$(curl -s -4 icanhazip.com || curl -s ifconfig.me || echo "UNKNOWN")
if [ "$SERVER_IP" = "UNKNOWN" ]; then
    echo -e "${YELLOW}Warning: Could not detect public IP automatically${NC}"
    read -p "Enter server public IP: " SERVER_IP
fi

# Configuration
read -p "Enter username for app deployment (default: nokta): " APP_USER
APP_USER=${APP_USER:-nokta}

echo ""
read -sp "Set password for $APP_USER (min 10 chars): " APP_USER_PASSWORD
echo ""
read -sp "Confirm password: " APP_USER_PASSWORD_CONFIRM
echo ""

# Validate password
if [ -z "$APP_USER_PASSWORD" ]; then
    echo -e "${RED}Error: Password is required${NC}"
    exit 1
fi

if [ "$APP_USER_PASSWORD" != "$APP_USER_PASSWORD_CONFIRM" ]; then
    echo -e "${RED}Error: Passwords do not match${NC}"
    exit 1
fi

if [ ${#APP_USER_PASSWORD} -lt 10 ]; then
    echo -e "${RED}Error: Password must be at least 10 characters${NC}"
    exit 1
fi

echo ""
echo "======================================"
echo "Configuration"
echo "======================================"
echo "Server IP: $SERVER_IP"
echo "App User: $APP_USER"
echo "SSH Port: 22 (default)"
echo ""
read -p "Continue with server preparation? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
fi

# System updates
echo -e "${BLUE}[1/8]${NC} Updating system packages..."
apt-get update -qq
DEBIAN_FRONTEND=noninteractive apt-get upgrade -y -qq
DEBIAN_FRONTEND=noninteractive apt-get dist-upgrade -y -qq

# Install essential packages
echo -e "${BLUE}[2/8]${NC} Installing essential packages..."
DEBIAN_FRONTEND=noninteractive apt-get install -y -qq \
    curl \
    wget \
    git \
    unzip \
    vim \
    htop \
    net-tools \
    software-properties-common \
    ufw \
    fail2ban \
    logrotate \
    ca-certificates \
    gnupg \
    lsb-release

# Create app user
echo -e "${BLUE}[3/8]${NC} Creating application user..."
if id "$APP_USER" &>/dev/null; then
    echo "  User $APP_USER already exists, updating password"
else
    useradd -m -s /bin/bash "$APP_USER"
    echo "  Created user: $APP_USER"
fi

# Set password
echo "$APP_USER:$APP_USER_PASSWORD" | chpasswd
echo "  Password set for $APP_USER"

# Setup passwordless sudo for app user (for service management)
echo "$APP_USER ALL=(ALL) NOPASSWD: /bin/systemctl restart nokta-*" > /etc/sudoers.d/$APP_USER
chmod 0440 /etc/sudoers.d/$APP_USER

# Configure SSH key authentication
echo -e "${BLUE}[4/8]${NC} Configuring SSH..."
mkdir -p /home/$APP_USER/.ssh
chmod 700 /home/$APP_USER/.ssh
touch /home/$APP_USER/.ssh/authorized_keys
chmod 600 /home/$APP_USER/.ssh/authorized_keys
chown -R $APP_USER:$APP_USER /home/$APP_USER/.ssh

echo -e "${YELLOW}Important: Add your SSH public key to authorized_keys${NC}"
echo ""
echo "From your local machine, run:"
echo -e "${GREEN}cat ~/.ssh/id_rsa.pub | ssh root@$SERVER_IP 'cat >> /home/$APP_USER/.ssh/authorized_keys'${NC}"
echo ""
read -p "Press Enter when SSH key is added (or skip if already added)..."

# Harden SSH configuration
echo -e "${BLUE}[5/8]${NC} Hardening SSH configuration..."
SSH_CONFIG="/etc/ssh/sshd_config"

# Backup original config
cp $SSH_CONFIG ${SSH_CONFIG}.backup.$(date +%Y%m%d)

# Apply hardened SSH config
cat > $SSH_CONFIG << EOF
# Nokta App - Hardened SSH Configuration
# Generated: $(date)

# Authentication
UsePAM yes
PermitRootLogin no
MaxAuthTries 3
LoginGraceTime 20
PasswordAuthentication no
PermitEmptyPasswords no
ChallengeResponseAuthentication no
KerberosAuthentication no
GSSAPIAuthentication no

# Security
X11Forwarding no
PermitUserEnvironment no
AllowAgentForwarding no
AllowTcpForwarding yes
PermitTunnel no
DebianBanner no

# Allowed users
AllowUsers $APP_USER

# Environment
AcceptEnv LANG LC_*

# Subsystems
Subsystem sftp /usr/lib/openssh/sftp-server
EOF

# Validate SSH config
sshd -t
if [ $? -eq 0 ]; then
    systemctl restart ssh
    echo "  SSH configuration updated and restarted"
else
    echo -e "${RED}Error: Invalid SSH configuration${NC}"
    cp ${SSH_CONFIG}.backup.$(date +%Y%m%d) $SSH_CONFIG
    exit 1
fi

# Configure UFW firewall
echo -e "${BLUE}[6/8]${NC} Configuring firewall (UFW)..."
ufw --force disable

# Reset UFW to defaults
ufw --force reset

# Default policies
ufw default deny incoming
ufw default allow outgoing

# Allow SSH
ufw allow 22/tcp comment 'SSH'

# Allow HTTP and HTTPS
ufw allow 80/tcp comment 'HTTP'
ufw allow 443/tcp comment 'HTTPS'

# Enable UFW
ufw --force enable
echo "  Firewall enabled with rules: SSH(22), HTTP(80), HTTPS(443)"

# Configure fail2ban
echo -e "${BLUE}[7/8]${NC} Configuring fail2ban..."
cat > /etc/fail2ban/jail.local << EOF
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 3

[sshd]
enabled = true
port = 22
logpath = %(sshd_log)s
backend = %(sshd_backend)s
EOF

systemctl enable fail2ban
systemctl restart fail2ban
echo "  fail2ban configured and started"

# System hardening
echo -e "${BLUE}[8/8]${NC} Applying system hardening..."

# Disable unused network protocols
cat >> /etc/sysctl.conf << EOF

# Nokta App - Security Hardening
net.ipv4.conf.all.accept_redirects = 0
net.ipv6.conf.all.accept_redirects = 0
net.ipv4.conf.all.send_redirects = 0
net.ipv4.conf.all.accept_source_route = 0
net.ipv6.conf.all.accept_source_route = 0
net.ipv4.icmp_echo_ignore_broadcasts = 1
net.ipv4.icmp_ignore_bogus_error_responses = 1
net.ipv4.tcp_syncookies = 1
EOF

sysctl -p > /dev/null 2>&1

# Set timezone to UTC
timedatectl set-timezone UTC

# Enable automatic security updates
DEBIAN_FRONTEND=noninteractive apt-get install -y -qq unattended-upgrades
cat > /etc/apt/apt.conf.d/50unattended-upgrades << EOF
Unattended-Upgrade::Allowed-Origins {
    "\${distro_id}:\${distro_codename}-security";
};
Unattended-Upgrade::AutoFixInterruptedDpkg "true";
Unattended-Upgrade::MinimalSteps "true";
Unattended-Upgrade::Remove-Unused-Kernel-Packages "true";
Unattended-Upgrade::Remove-Unused-Dependencies "true";
Unattended-Upgrade::Automatic-Reboot "false";
EOF

echo ""
echo -e "${GREEN}✓ Server preparation completed!${NC}"
echo ""
echo "======================================"
echo "Summary"
echo "======================================"
echo "✓ System updated and upgraded"
echo "✓ Essential packages installed"
echo "✓ User created: $APP_USER"
echo "✓ SSH hardened (password auth disabled)"
echo "✓ Firewall enabled: SSH(22), HTTP(80), HTTPS(443)"
echo "✓ fail2ban configured"
echo "✓ System hardening applied"
echo "✓ Automatic security updates enabled"
echo ""
echo "======================================"
echo "Next Steps"
echo "======================================"
echo "1. Verify SSH key authentication works:"
echo -e "   ${GREEN}ssh $APP_USER@$SERVER_IP${NC}"
echo ""
echo "2. DO NOT close this terminal until SSH key login is verified!"
echo ""
echo "3. Run the installation script as $APP_USER:"
echo -e "   ${GREEN}ssh $APP_USER@$SERVER_IP${NC}"
echo -e "   ${GREEN}./install.sh${NC}"
echo ""
echo "======================================"
echo "Server Details"
echo "======================================"
echo "Hostname: $(hostname)"
echo "IP Address: $(hostname -I | awk '{print $1}')"
echo "OS: $(lsb_release -d | cut -f2)"
echo "Kernel: $(uname -r)"
echo ""
