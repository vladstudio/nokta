# Nokta

Real-time chat app with video/audio calls. React frontend + PocketBase backend.

## Deploy (5 minutes)

**Prerequisites:** Ubuntu 24.04 server, domain pointing to server IP, [Daily.co](https://daily.co) API key, SSH public key

1. Edit 5 variables in [`cloud-init.yaml`](cloud-init.yaml):
   ```yaml
   DOMAIN="your-domain.com"
   ADMIN_EMAIL="you@your-domain.com"
   ADMIN_PASSWORD="change-this-password"
   DAILY_API_KEY="your-daily-co-api-key"
   SSH_KEY="ssh-rsa AAAAB3... your-public-key"
   ```
   Usually you can get your SSH key value with `cat .ssh/id_rsa.pub` .

2. Create server (Hetzner/DigitalOcean/Vultr), paste the entire `cloud-init.yaml` into **User Data / Cloud Init / Cloud Config**

3. Wait ~5 min
   
4. visit **Admin panel:** `https://your-domain.com/_/` . Create your first users in `users` collection. Make sure to have at least one user with role `Admin`.
   
5. Start chatting: `https://your-domain.com`

## After Deployment

```bash
ssh nokta@SERVER_IP                  # SSH access
~/nokta/backup.sh                    # Manual backup
~/nokta/update.sh                    # Update to latest
sudo systemctl restart nokta-backend # Restart backend
```



### Optional: Enable MFA

1. Admin panel → Collections → _superusers → Settings
2. Options → Enable MFA → Enable OTP
3. Configure SMTP in Settings → Mail settings

## Troubleshooting

```bash
sudo journalctl -u nokta-backend -f  # Backend logs
sudo journalctl -u caddy -f          # Caddy logs
cat /var/log/nokta-install.log       # Install log
```

**Reset admin password:**
```bash
cd ~/nokta/backend && ./pocketbase superuser update EMAIL NEW_PASSWORD
```

**Restore from backup:**
```bash
sudo systemctl stop nokta-backend
tar -xzf ~/nokta-backups/pb_data_TIMESTAMP.tar.gz -C ~/nokta/backend
sudo systemctl start nokta-backend
```

## Local Development

```bash
# Backend
cd backend && ./pocketbase serve     # :8090

# Frontend
cd frontend && bun install && bun dev # :3000
```

Test users (after running `backend/reset.sh`): `a@test.com` / `b@test.com`, password `1234567890`
