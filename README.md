# Nokta

Very opinionated real-time chat app with video calls.  
React frontend + PocketBase backend.

## Deploy

**Prerequisites:** Ubuntu 24.04 server, domain pointing to server IP, [Daily.co](https://daily.co) API key, SSH public key

1. Edit variables in [`cloud-init.yaml`](cloud-init.yaml):
   ```yaml
   DOMAIN="your-domain.com"
   ADMIN_EMAIL="you@your-domain.com"
   ADMIN_PASSWORD="change-this-password"
   DAILY_API_KEY="your-daily-co-api-key"
   SSH_KEY="ssh-rsa AAAAB3..."
   FIREBASE_SA_BASE64="" # Optional: Android push notifications (see below)
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
# Setup (once)
mkdir -p ~/.nokta && echo "DAILY_CO_API_KEY=your-key" > ~/.nokta/env

# Backend
env $(cat ~/.nokta/env) ./backend/pocketbase serve  # :8090

# Frontend
cd frontend && bun install && bun dev  # :3000
```

Test users (after running `backend/reset.sh`): `a@test.com` / `b@test.com`, password `1234567890`

## Build Native Apps

**Prerequisites:** Node.js, Android Studio (Android), Xcode 15+ (iOS)

### Android
```bash
# Setup signing (once)
mkdir -p ~/.nokta
keytool -genkey -v -keystore ~/.nokta/nokta-release.keystore -alias nokta -keyalg RSA -keysize 2048 -validity 10000
cat > ~/.nokta/nokta-keystore.properties << 'EOF'
storeFile=nokta-release.keystore
storePassword=YOUR_PASSWORD
keyAlias=nokta
keyPassword=YOUR_PASSWORD
EOF

# Build
cd native-app/android && ./gradlew assembleRelease
```

### iOS
```bash
cd native-app/ios && open Nokta.xcodeproj
```
1. Set team in **Signing & Capabilities** (requires [Apple Developer Program](https://developer.apple.com/programs/) for push notifications)
2. Build (⌘B) or Archive for distribution

## Android Push Notifications (Optional)

1. Create Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Add Android app with package name `com.nokta.app`
3. Download `google-services.json` → `native-app/android/app/`
4. Project Settings → Service accounts → Generate new private key
5. For **deployment**: base64 encode and set `FIREBASE_SA_BASE64` in cloud-init:
   ```bash
   cat firebase-service-account.json | base64 | tr -d '\n'
   ```
6. For **local dev**: save as `~/.nokta/firebase-service-account.json` and run:
   ```bash
   env SECRETS_PATH=$HOME/.nokta bun run backend/fcm-service.ts
   ```

