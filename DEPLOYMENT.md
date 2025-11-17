# Nokta App - Deployment Guide

Complete guide for deploying Nokta App to Ubuntu 24.04 VPS.

## Prerequisites

**Local Machine:**
- SSH client

**Server:**
- Ubuntu 24.04 LTS (fresh)
- 1 CPU, 1GB RAM, 10GB storage (minimum)
- Root access
- Domain with A record pointing to server IP
- Ports 22, 80, 443 accessible

---

## Step 1: Prepare Server (One-Time)

### Upload and Run Preparation Script

```bash
# From local machine
scp server-prep.sh root@YOUR_SERVER_IP:/root/
ssh root@YOUR_SERVER_IP

# On server as root
chmod +x /root/server-prep.sh
./server-prep.sh
```

**What it does:**
- Updates system packages
- Creates app user (default: `nokta`)
- Hardens SSH (disables password auth, key-only)
- Configures UFW firewall (ports 22, 80, 443)
- Enables fail2ban (brute force protection)
- Applies system security hardening
- Enables automatic security updates

### Setup SSH Key

```bash
# From local machine
cat ~/.ssh/id_rsa.pub | ssh root@YOUR_SERVER_IP 'cat >> /home/nokta/.ssh/authorized_keys'

# Test SSH key login (CRITICAL - do this before closing root session!)
ssh nokta@YOUR_SERVER_IP
```

---

## Step 2: Install Application

### Download and Run Installation Script

```bash
# On server as 'nokta' user
ssh nokta@YOUR_SERVER_IP

# Download installation script from GitHub
curl -o install.sh https://raw.githubusercontent.com/vladstudio/nokta/main/install.sh
chmod +x install.sh
./install.sh
```

**Interactive prompts:**
- Domain name (e.g., `nokta.example.com`)
- Admin email
- Admin password (minimum 10 characters)
- Daily.co API key

**What it does:**
- Installs Caddy web server
- Installs Bun (JavaScript runtime)
- Downloads latest code from GitHub
- Downloads PocketBase
- Builds frontend application
- Initializes PocketBase database
- Creates admin user
- Configures Caddy (automatic SSL + reverse proxy)
- Creates systemd service (auto-start on boot)
- Sets up log rotation
- Creates maintenance scripts (`backup.sh`, `update.sh`)
- Schedules daily backups (3 AM)

---

## Step 3: Verify Installation

### Check Services

```bash
sudo systemctl status nokta-backend
sudo systemctl status caddy
```

Both should show `active (running)`.

### Access Application

- **Frontend:** `https://your-domain.com`
- **Admin Dashboard:** `https://your-domain.com/_/`

First HTTPS connection takes 5-10 seconds (SSL certificate generation).

---

## Step 4: Security Hardening (Recommended)

### Enable Rate Limiter (1 minute)

Prevents brute force attacks on login endpoints.

**Steps:**
1. Access admin dashboard: `https://your-domain.com/_/`
2. Navigate to **Settings → Application**
3. Scroll to **Rate limiter** section
4. Enable rate limiting with these recommended settings:
   ```
   Auth endpoints: 5 requests / 15 minutes
   General API: 60 requests / 1 minute
   ```
5. Click **Save changes**

**Verifies:** Blocks attackers from trying unlimited passwords.

---

### Enable MFA for Superusers (2 minutes)

Requires email verification code when logging into admin dashboard.

**Steps:**
1. In admin dashboard, go to **Collections → _superusers**
2. Click the **⚙️ (settings cog)** to edit collection
3. Go to **Options** tab
4. Enable **Multi-factor authentication (MFA)**
5. Enable **One-time password (OTP)** as auth method
6. Configure SMTP settings in **Settings → Mail settings** (required for OTP delivery)
7. Click **Save changes**

**Result:** Admin login now requires both password AND email code.

**Fallback:** If email fails, generate manual OTP:
```bash
ssh nokta@YOUR_SERVER_IP
cd ~/nokta/backend
./pocketbase superuser otp your-admin@example.com
```

---

### Auth Logging (Already Enabled)

The application includes automatic authentication logging at [backend/pb_hooks/auth_logging.pb.js](backend/pb_hooks/auth_logging.pb.js).

**What's logged:**
- All login attempts (success/failure)
- User identity and IP address
- Admin dashboard access attempts
- Token refresh events (detects session hijacking)

**View auth logs:**
```bash
# Production (systemd)
sudo journalctl -u nokta-backend | grep AUTH

# Development
tail -f backend/pocketbase.log | grep AUTH
```

**Sample log entries:**
```
[AUTH SUCCESS] 2025-01-13T10:30:45Z | User: alice@example.com | IP: 192.168.1.100
[AUTH FAILURE] 2025-01-13T10:31:02Z | User: alice@example.com | IP: 192.168.1.100 | Error: invalid credentials
[ADMIN LOGIN SUCCESS] 2025-01-13T10:35:12Z | Admin: admin@example.com | IP: 192.168.1.50
```

**Use cases:**
- Detect brute force patterns
- Track account compromise attempts
- Investigate suspicious login activity
- Compliance auditing

---

## Architecture

```
Internet
   ↓
[Caddy Web Server] :80, :443
   ├─→ Frontend (static files from /home/nokta/nokta/frontend/dist/)
   └─→ Backend API (reverse proxy to localhost:8090)
       └─→ PocketBase (SQLite at /home/nokta/nokta/backend/pb_data/)
```

**Services:**
- `nokta-backend` - PocketBase (localhost:8090)
- `caddy` - Web server + automatic SSL

**Security:**
- SSH: Key-only auth, no passwords, root login disabled
- Firewall: Only ports 22, 80, 443 open
- fail2ban: Brute force protection
- SSL/TLS: Automatic Let's Encrypt certificates
- Backend: Not exposed to internet (localhost only)

---

## Maintenance

### Check Status
```bash
sudo systemctl status nokta-backend
sudo journalctl -u nokta-backend -f    # View logs
```

### Backups
```bash
~/nokta/backup.sh                       # Manual backup
ls -lh ~/nokta-backups/                 # List backups (kept 7 days)
```

Automatic daily backups at 3 AM via cron.

### Update Application

```bash
# On server as 'nokta' user
ssh nokta@YOUR_SERVER_IP
~/nokta/update.sh
```

**What it does:**
- Creates automatic backup
- Stops backend service
- Downloads latest code from GitHub
- Downloads latest PocketBase
- Rebuilds frontend
- Restores database and configuration
- Restarts services

### Restart Services
```bash
sudo systemctl restart nokta-backend
sudo systemctl reload caddy
```

---

## Troubleshooting

### Backend Won't Start
```bash
sudo journalctl -u nokta-backend -n 100 --no-pager
```

**Common issues:**
- Port 8090 in use: `netstat -tulpn | grep 8090`
- Permission issues: `sudo chown -R nokta:nokta /home/nokta/nokta/backend/pb_data`
- Database corruption: Restore from backup

### SSL Certificate Issues
```bash
sudo journalctl -u caddy -n 100 --no-pager
```

**Common issues:**
- DNS not propagated: Wait 5-10 minutes, verify with `dig your-domain.com`
- Port 80 blocked: Check `sudo ufw status`
- Rate limit: Let's Encrypt has rate limits (5 failures per hour)

### Frontend Not Loading
```bash
sudo caddy validate --config /etc/caddy/Caddyfile
ls -la /home/nokta/nokta/frontend/dist/
sudo tail -f /var/log/caddy/nokta.log
```

### Can't Access Admin Dashboard
```bash
cd ~/nokta/backend
./pocketbase superuser list
./pocketbase superuser update EMAIL NEW_PASSWORD
```

### SSH Key Login Fails
```bash
chmod 600 ~/.ssh/id_rsa                            # Local machine
cat /home/nokta/.ssh/authorized_keys                # Verify key on server
sudo tail -f /var/log/auth.log                     # Check auth logs
```

---

## File Locations

```
/home/nokta/nokta/                     # Application root
├── frontend/                        # Frontend source
│   ├── dist/                        # Built static files (served by Caddy)
│   └── .env                         # Frontend config
├── backend/                         # PocketBase
│   ├── pocketbase                   # Executable
│   ├── pb_data/                     # SQLite database (BACKUP THIS!)
│   ├── pb_hooks/                    # Server-side hooks
│   ├── pb_migrations/               # Schema migrations
│   └── .env                         # Backend config
├── backup.sh                        # Manual backup script
└── update.sh                        # Update script

/home/nokta/nokta-backups/             # Daily backups (7 day retention)
/etc/caddy/Caddyfile                 # Caddy configuration
/etc/systemd/system/nokta-backend.service  # Backend service
/var/log/caddy/nokta.log               # Access logs
```

---

## Support

**Check logs:** Most issues show up in logs first
```bash
sudo journalctl -u nokta-backend -n 100 --no-pager
sudo journalctl -u caddy -n 100 --no-pager
```

**Verify services:**
```bash
sudo systemctl status nokta-backend
sudo systemctl status caddy
sudo ufw status
```

**Common fixes:**
- DNS issues: Wait 5-10 minutes for propagation
- Port blocked: Check `sudo ufw status`
- Permission error: Check ownership with `ls -la ~/nokta/backend/pb_data`
- Database corruption: Restore from `/home/nokta/nokta-backups/`

---

## Quick Reference

| Task | Command |
|------|---------|
| View backend logs | `sudo journalctl -u nokta-backend -f` |
| View auth logs | `sudo journalctl -u nokta-backend \| grep AUTH` |
| View Caddy logs | `sudo journalctl -u caddy -f` |
| Restart backend | `sudo systemctl restart nokta-backend` |
| Reload Caddy | `sudo systemctl reload caddy` |
| Update app | `~/nokta/update.sh` |
| Manual backup | `~/nokta/backup.sh` |
| List backups | `ls -lh ~/nokta-backups/` |
| Check disk space | `df -h` |
| Check memory | `free -h` |
| Firewall status | `sudo ufw status` |
| fail2ban status | `sudo fail2ban-client status sshd` |

---

**Tech Stack:** React 19 + Vite + Tailwind CSS 4 | PocketBase 0.23.6 | Caddy 2 | SQLite | Ubuntu 24.04 LTS
