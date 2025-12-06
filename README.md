# Nokta

Very opinionated real-time chat app with video calls.  
React frontend + PocketBase backend.

## Deploy

**Prerequisites:** Ubuntu 24.04 server, domain pointing to server IP, [Daily.co](https://daily.co) API key, SSH public key

1. Edit 5 variables in [`cloud-init.yaml`](cloud-init.yaml):
   ```yaml
   DOMAIN="your-domain.com"
   ADMIN_EMAIL="you@your-domain.com"
   ADMIN_PASSWORD="change-this-password"
   DAILY_API_KEY="your-daily-co-api-key"
   SSH_KEY="ssh-rsa AAAAB3..." # usually you can get your key value with cat .ssh/id_rsa.pub
   FIREBASE_SA_BASE64="" # Optional, for Android push notifications: see below
   ```

2. Create server (Hetzner/DigitalOcean/Vultr), paste the entire `cloud-init.yaml` into **User Data / Cloud Init / Cloud Config**

3. Wait ~5 min
   
4. visit **Admin panel:** `https://your-domain.com/_/` . Create your first users in `users` collection. Make sure to have at least one user with role `Admin`.
   
5. Start chatting: `https://your-domain.com`

## After Deployment

```bash
ssh nokta@SERVER_IP                  # SSH access
cloud-init status                    # Check cloud-init status
~/nokta/backup.sh                    # Manual backup
~/nokta/update.sh                    # Update to latest
sudo systemctl restart nokta-backend # Restart backend
sudo reboot                          # Reboot entire server
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
sudo reboot
```

## Local Development

```bash
# Backend
cd backend && ./pocketbase serve     # :8090

# Frontend
cd frontend && bun install && bun dev # :3000
```

Test users (after running `backend/reset.sh`): `a@test.com` / `b@test.com`, password `1234567890`

## Build Native Apps

**Prerequisites:** Node.js, Android Studio (for Android)

```bash
cd native-app && npm install
```

**macOS app:**
```bash
npm run build:mac          # Universal (ARM + Intel)
npm run build:mac-arm      # ARM only
npm run build:mac-intel    # Intel only
# Output: native-app/dist/*.dmg
```

**Windows app (cross-compile):**
```bash
npm run build:win
# Output: native-app/dist/*.exe
```

**Android app:**
```bash
cd android && ./gradlew assembleDebug
# Output: android/app/build/outputs/apk/debug/app-debug.apk
```

## Android Push Notifications (Optional)

To enable background push notifications on the Android app:

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Add an Android app with package name `com.nokta.app`
3. Download `google-services.json` → place in `native-app/android/app/`
4. Go to Project Settings → Service accounts → Generate new private key
5. Save as `backend/firebase-service-account.json`
6. Encode for cloud-init (if deploying to server):
   ```bash
   cat backend/firebase-service-account.json | base64 | tr -d '\n'
   ```
7. For local development, run the FCM service alongside PocketBase:
   ```bash
   cd backend && bun install && bun run fcm  # :9090
   ```

For production deployment, the FCM service runs automatically via systemd.

