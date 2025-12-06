#!/bin/bash

echo "🗑️  Database Reset and Setup Script"
echo "===================================="
echo ""

# Check if PocketBase is running
if lsof -Pi :8090 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "⚠️  PocketBase is currently running on port 8090"
    echo "Please stop PocketBase first, then run this script again."
    echo "  1. Press Ctrl+C in the terminal where PocketBase is running"
    echo "  2. Or run: lsof -ti:8090 | xargs kill"
    exit 1
fi

echo "✓ PocketBase is not running"
echo ""

# Backup warning
echo "⚠️  WARNING: This will DELETE all data in pb_data/"
read -p "Are you sure you want to continue? (y/n): " -r
echo ""

if [[ ! $REPLY =~ ^[y]$ ]]; then
    echo "Cancelled."
    exit 0
fi

# Delete pb_data
if [ -d "pb_data" ]; then
    echo "🗑️  Deleting pb_data directory..."
    rm -rf pb_data
    echo "✓ Deleted pb_data"
else
    echo "ℹ️  pb_data directory doesn't exist (already clean)"
fi

echo ""

# Get admin credentials
read -p "Admin email: " ADMIN_EMAIL
read -sp "Admin password: " ADMIN_PASSWORD
echo ""

echo "👑 Creating superuser..."
./pocketbase superuser upsert "$ADMIN_EMAIL" "$ADMIN_PASSWORD" > /dev/null 2>&1
echo "✓ Superuser created: $ADMIN_EMAIL"
echo ""

echo "🚀 Starting PocketBase..."
echo "   (Starting in background, logs in pocketbase.log)"
echo ""

# Start PocketBase in the background
nohup ./pocketbase serve > pocketbase.log 2>&1 &
POCKETBASE_PID=$!

echo "✓ PocketBase started (PID: $POCKETBASE_PID)"
echo "⏳ Waiting for PocketBase to be ready..."
sleep 3

# Check if PocketBase is running
if ! kill -0 $POCKETBASE_PID 2>/dev/null; then
    echo "❌ PocketBase failed to start. Check pocketbase.log for errors."
    exit 1
fi

echo "✓ PocketBase is ready"
echo ""

# Create admin user in users collection via API
echo "👤 Creating admin user in users collection..."

# First, authenticate as superuser to get token
AUTH_RESPONSE=$(curl -s -X POST "http://127.0.0.1:8090/api/collections/_superusers/auth-with-password" \
    -H "Content-Type: application/json" \
    -d "{
        \"identity\": \"$ADMIN_EMAIL\",
        \"password\": \"$ADMIN_PASSWORD\"
    }")

TOKEN=$(echo "$AUTH_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    echo "❌ Failed to authenticate as superuser"
    kill $POCKETBASE_PID 2>/dev/null
    exit 1
fi

# Enable rate limiting for auth endpoints
echo "🔒 Enabling rate limiting..."
curl -s -X PATCH "http://127.0.0.1:8090/api/settings" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{"rateLimits":{"enabled":true,"rules":[{"label":"/api/collections/users/auth-with-password","audience":"","duration":900,"maxRequests":5},{"label":"/api/collections/_superusers/auth-with-password","audience":"","duration":900,"maxRequests":3}]}}' > /dev/null 2>&1
echo "✓ Rate limiting enabled (5 attempts / 15 min)"
echo ""

# Create admin user via API with superuser token
curl -s -X POST "http://127.0.0.1:8090/api/collections/users/records" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d "{
        \"email\": \"$ADMIN_EMAIL\",
        \"password\": \"$ADMIN_PASSWORD\",
        \"passwordConfirm\": \"$ADMIN_PASSWORD\",
        \"name\": \"Admin\",
        \"role\": \"Admin\",
        \"emailVisibility\": true
    }" > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo "✓ Admin user created in users collection: $ADMIN_EMAIL"
else
    echo "⚠️  Failed to create admin user (may already exist)"
fi

echo ""
echo "✅ All done!"
echo ""

# Stop PocketBase
echo "🛑 Stopping PocketBase..."
if kill $POCKETBASE_PID 2>/dev/null; then
    echo "✓ PocketBase stopped (PID: $POCKETBASE_PID)"
else
    echo "⚠️  PocketBase process may have already stopped"
fi
echo ""
