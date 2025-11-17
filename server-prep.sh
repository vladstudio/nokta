#!/bin/bash
set -e

# Nokta App - Server Preparation Script
# Run as root (sudo)

RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "======================================"
echo "Nokta App - Server Preparation"
echo "======================================"

if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}Error: Must run as root${NC}"
    exit 1
fi

if [ ! -f /etc/os-release ]; then
    echo -e "${RED}Error: Cannot detect OS${NC}"
    exit 1
fi

source /etc/os-release
if [ "$ID" != "ubuntu" ]; then
    echo -e "${YELLOW}Warning: Designed for Ubuntu 24.04 (current: $PRETTY_NAME)${NC}"
    read -p "Continue? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then exit 1; fi
fi

echo ""
SERVER_IP=$(curl -s -4 icanhazip.com || curl -s ifconfig.me || echo "UNKNOWN")
if [ "$SERVER_IP" = "UNKNOWN" ]; then
    read -p "Enter server public IP: " SERVER_IP
fi

read -p "Username (default: nokta): " APP_USER
APP_USER=${APP_USER:-nokta}

read -sp "Password for $APP_USER (min 10 chars): " APP_USER_PASSWORD
echo ""
read -sp "Confirm password: " APP_USER_PASSWORD_CONFIRM
echo ""

if [ -z "$APP_USER_PASSWORD" ] || [ "$APP_USER_PASSWORD" != "$APP_USER_PASSWORD_CONFIRM" ]; then
    echo -e "${RED}Error: Password mismatch or empty${NC}"
    exit 1
fi

if [ ${#APP_USER_PASSWORD} -lt 10 ]; then
    echo -e "${RED}Error: Password must be at least 10 characters${NC}"
    exit 1
fi

echo ""
echo "Server: $SERVER_IP | User: $APP_USER"
read -p "Continue? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then exit 1; fi

# System updates
echo -e "${BLUE}[1/8]${NC} Updating system..."
apt-get update -qq
DEBIAN_FRONTEND=noninteractive apt-get upgrade -y -qq
DEBIAN_FRONTEND=noninteractive apt-get dist-upgrade -y -qq

# Install packages
echo -e "${BLUE}[2/8]${NC} Installing packages..."
DEBIAN_FRONTEND=noninteractive apt-get install -y -qq curl wget git unzip vim htop ufw fail2ban logrotate ca-certificates unattended-upgrades

# Create user
echo -e "${BLUE}[3/8]${NC} Creating user..."
if ! id "$APP_USER" &>/dev/null; then
    useradd -m -s /bin/bash "$APP_USER"
    usermod -aG sudo "$APP_USER"
fi
echo "$APP_USER:$APP_USER_PASSWORD" | chpasswd
echo "$APP_USER ALL=(ALL) NOPASSWD: /bin/systemctl restart nokta-*, /bin/systemctl reload caddy, /bin/systemctl stop nokta-*, /bin/systemctl start nokta-*" > /etc/sudoers.d/$APP_USER
chmod 0440 /etc/sudoers.d/$APP_USER

# Configure SSH
echo -e "${BLUE}[4/8]${NC} Configuring SSH..."
mkdir -p /home/$APP_USER/.ssh
chmod 700 /home/$APP_USER/.ssh
touch /home/$APP_USER/.ssh/authorized_keys
chmod 600 /home/$APP_USER/.ssh/authorized_keys
chown -R $APP_USER:$APP_USER /home/$APP_USER/.ssh

echo ""
echo -e "${YELLOW}Add your SSH key:${NC}"
echo -e "${GREEN}cat ~/.ssh/id_rsa.pub | ssh root@$SERVER_IP 'cat >> /home/$APP_USER/.ssh/authorized_keys'${NC}"
read -p "Press Enter when done..."

# Harden SSH
echo -e "${BLUE}[5/8]${NC} Hardening SSH..."
cp /etc/ssh/sshd_config /etc/ssh/sshd_config.backup
cat > /etc/ssh/sshd_config << EOF
UsePAM yes
PermitRootLogin no
MaxAuthTries 3
LoginGraceTime 20
PasswordAuthentication no
PermitEmptyPasswords no
ChallengeResponseAuthentication no
X11Forwarding no
AllowUsers $APP_USER
AcceptEnv LANG LC_*
Subsystem sftp /usr/lib/openssh/sftp-server
EOF

if sshd -t; then
    systemctl restart ssh
else
    echo -e "${RED}Error: Invalid SSH config${NC}"
    cp /etc/ssh/sshd_config.backup /etc/ssh/sshd_config
    exit 1
fi

# Configure firewall
echo -e "${BLUE}[6/8]${NC} Configuring firewall..."
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp comment 'SSH'
ufw allow 80/tcp comment 'HTTP'
ufw allow 443/tcp comment 'HTTPS'
ufw --force enable

# Configure fail2ban
echo -e "${BLUE}[7/8]${NC} Configuring fail2ban..."
cat > /etc/fail2ban/jail.local << EOF
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 3

[sshd]
enabled = true
EOF

systemctl enable fail2ban
systemctl restart fail2ban

# System hardening
echo -e "${BLUE}[8/8]${NC} Hardening system..."
cat >> /etc/sysctl.conf << EOF

# Security hardening
net.ipv4.conf.all.accept_redirects = 0
net.ipv6.conf.all.accept_redirects = 0
net.ipv4.conf.all.send_redirects = 0
net.ipv4.conf.all.accept_source_route = 0
net.ipv6.conf.all.accept_source_route = 0
net.ipv4.icmp_echo_ignore_broadcasts = 1
net.ipv4.tcp_syncookies = 1
EOF
sysctl -p > /dev/null 2>&1

timedatectl set-timezone UTC

cat > /etc/apt/apt.conf.d/50unattended-upgrades << EOF
Unattended-Upgrade::Allowed-Origins {
    "\${distro_id}:\${distro_codename}-security";
};
Unattended-Upgrade::Automatic-Reboot "false";
EOF

echo ""
echo -e "${GREEN}✓ Server preparation complete!${NC}"
echo ""
echo "Verify SSH key works in another terminal:"
echo -e "  ${GREEN}ssh $APP_USER@$SERVER_IP${NC}"
echo ""
echo "Then install Nokta:"
echo -e "  ${GREEN}curl -o install.sh https://raw.githubusercontent.com/vladstudio/nokta/main/install.sh${NC}"
echo -e "  ${GREEN}chmod +x install.sh && ./install.sh${NC}"
echo ""
