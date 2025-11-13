# Talk App - Deployment Guide

Complete guide for deploying Talk App to Ubuntu 24.04 VPS.

## Prerequisites

**Local Machine:**
- [Bun](https://bun.sh) installed
- SSH client
- ~30MB free space

**Server:**
- Ubuntu 24.04 LTS (fresh)
- 1 CPU, 1GB RAM, 10GB storage (minimum)
- Root access
- Domain with A record pointing to server IP
- Ports 22, 80, 443 accessible

---

## Step 1: Build Application (Local Machine)

### Configure Environment

**Frontend** (`frontend/.env`):
```bash
VITE_POCKETBASE_URL=https://your-domain.com
VITE_DAILY_CO_API_KEY=your_daily_co_key_here  # Optional
```

**Backend** (`backend/.env`):
```bash
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your_secure_password_here
```

### Build and Package

```bash
./build.sh
tar -czf talk-app.tar.gz deploy/
```

Creates `talk-app.tar.gz` (~15-30 MB) ready for deployment.

---

## Step 2: Prepare Server (One-Time)

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
- Creates app user (default: `talk`)
- Hardens SSH (disables password auth, key-only)
- Configures UFW firewall (ports 22, 80, 443)
- Enables fail2ban (brute force protection)
- Applies system security hardening
- Enables automatic security updates

### Setup SSH Key

```bash
# From local machine
cat ~/.ssh/id_rsa.pub | ssh root@YOUR_SERVER_IP 'cat >> /home/talk/.ssh/authorized_keys'

# Test SSH key login (CRITICAL - do this before closing root session!)
ssh talk@YOUR_SERVER_IP
```

---

## Step 3: Install Application

### Upload Files

```bash
# From local machine
scp talk-app.tar.gz install.sh talk@YOUR_SERVER_IP:~/
```

### Run Installation

```bash
# On server as 'talk' user
ssh talk@YOUR_SERVER_IP
chmod +x ~/install.sh
./install.sh
```

**Interactive prompts:**
- Domain name (e.g., `talk.example.com`)
- Admin email
- Admin password (minimum 10 characters)

**What it does:**
- Installs Caddy web server
- Extracts application files to `/home/talk/talk/`
- Initializes PocketBase database
- Creates admin user
- Configures Caddy (automatic SSL + reverse proxy)
- Creates systemd service (auto-start on boot)
- Sets up log rotation
- Creates maintenance scripts (`backup.sh`, `update.sh`)
- Schedules daily backups (3 AM)

---

## Step 4: Verify Installation

### Check Services

```bash
sudo systemctl status talk-backend
sudo systemctl status caddy
```

Both should show `active (running)`.

### Access Application

- **Frontend:** `https://your-domain.com`
- **Admin Dashboard:** `https://your-domain.com/_/`

First HTTPS connection takes 5-10 seconds (SSL certificate generation).

---

## Step 5: Security Hardening (Recommended)

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
ssh talk@YOUR_SERVER_IP
cd ~/talk/backend
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
sudo journalctl -u talk-backend | grep AUTH

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
   ├─→ Frontend (static files from /home/talk/talk/frontend/)
   └─→ Backend API (reverse proxy to localhost:8090)
       └─→ PocketBase (SQLite at /home/talk/talk/backend/pb_data/)
```

**Services:**
- `talk-backend` - PocketBase (localhost:8090)
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
sudo systemctl status talk-backend
sudo journalctl -u talk-backend -f    # View logs
```

### Backups
```bash
~/talk/backup.sh                       # Manual backup
ls -lh ~/talk-backups/                 # List backups (kept 7 days)
```

Automatic daily backups at 3 AM via cron.

### Update Application
```bash
# 1. Build new version locally
./build.sh && tar -czf talk-app.tar.gz deploy/

# 2. Upload to server
scp talk-app.tar.gz talk@YOUR_SERVER_IP:~/

# 3. Run update script (backs up database first)
ssh talk@YOUR_SERVER_IP '~/talk/update.sh'
```

### Restart Services
```bash
sudo systemctl restart talk-backend
sudo systemctl reload caddy
```

---

## Troubleshooting

### Backend Won't Start
```bash
sudo journalctl -u talk-backend -n 100 --no-pager
```

**Common issues:**
- Port 8090 in use: `netstat -tulpn | grep 8090`
- Permission issues: `sudo chown -R talk:talk /home/talk/talk/backend/pb_data`
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
ls -la /home/talk/talk/frontend/
sudo tail -f /var/log/caddy/talk-access.log
```

### Can't Access Admin Dashboard
```bash
cd ~/talk/backend
./pocketbase superuser list
./pocketbase superuser update EMAIL NEW_PASSWORD
```

### SSH Key Login Fails
```bash
chmod 600 ~/.ssh/id_rsa                            # Local machine
cat /home/talk/.ssh/authorized_keys                # Verify key on server
sudo tail -f /var/log/auth.log                     # Check auth logs
```

---

## File Locations

```
/home/talk/talk/                     # Application root
├── frontend/                        # Static files (served by Caddy)
├── backend/                         # PocketBase
│   ├── pocketbase                   # Executable
│   ├── pb_data/                     # SQLite database (BACKUP THIS!)
│   ├── pb_hooks/                    # Server-side hooks
│   ├── pb_migrations/               # Schema migrations
│   └── .env                         # Configuration
├── backup.sh                        # Manual backup script
└── update.sh                        # Update script

/home/talk/talk-backups/             # Daily backups (7 day retention)
/etc/caddy/Caddyfile                 # Caddy configuration
/etc/systemd/system/talk-backend.service  # Backend service
/var/log/caddy/talk-access.log       # Access logs
```

---

## Production Checklist

**Pre-Deployment:**
- [ ] Domain DNS configured (A record)
- [ ] Environment variables set
- [ ] Build successful (`./build.sh`)
- [ ] Deployment package created (`talk-app.tar.gz`)

**Installation:**
- [ ] Server preparation completed
- [ ] SSH key authentication working
- [ ] Application installed
- [ ] Both services running

**Verification:**
- [ ] HTTPS working (green padlock)
- [ ] Frontend loads at `https://your-domain.com`
- [ ] Admin dashboard accessible at `/_/`
- [ ] Test user can log in
- [ ] Real-time messaging works
- [ ] File uploads functional

**Security:**
- [ ] SSH password auth disabled
- [ ] Root login disabled
- [ ] Firewall configured (only ports 22, 80, 443)
- [ ] fail2ban active
- [ ] Automatic updates enabled
- [ ] Rate limiter enabled (Settings → Application)
- [ ] MFA enabled for superusers (Collections → _superusers)
- [ ] SMTP configured for OTP delivery (Settings → Mail settings)
- [ ] Auth logging verified (check logs with `sudo journalctl -u talk-backend | grep AUTH`)

**Maintenance:**
- [ ] Daily backups scheduled (check `crontab -l`)
- [ ] Backup script tested (`~/talk/backup.sh`)
- [ ] Update script tested
- [ ] Credentials documented securely

---

## Support

**Check logs:** Most issues show up in logs first
```bash
sudo journalctl -u talk-backend -n 100 --no-pager
sudo journalctl -u caddy -n 100 --no-pager
```

**Verify services:**
```bash
sudo systemctl status talk-backend
sudo systemctl status caddy
sudo ufw status
```

**Common fixes:**
- DNS issues: Wait 5-10 minutes for propagation
- Port blocked: Check `sudo ufw status`
- Permission error: Check ownership with `ls -la ~/talk/backend/pb_data`
- Database corruption: Restore from `/home/talk/talk-backups/`

---

## Quick Reference

| Task | Command |
|------|---------|
| View backend logs | `sudo journalctl -u talk-backend -f` |
| View auth logs | `sudo journalctl -u talk-backend \| grep AUTH` |
| View Caddy logs | `sudo journalctl -u caddy -f` |
| Restart backend | `sudo systemctl restart talk-backend` |
| Reload Caddy | `sudo systemctl reload caddy` |
| Manual backup | `~/talk/backup.sh` |
| List backups | `ls -lh ~/talk-backups/` |
| Check disk space | `df -h` |
| Check memory | `free -h` |
| Firewall status | `sudo ufw status` |
| fail2ban status | `sudo fail2ban-client status sshd` |

---

**Tech Stack:** React 19 + Vite + Tailwind CSS 4 | PocketBase 0.26.3 | Caddy 2 | SQLite | Ubuntu 24.04 LTS
