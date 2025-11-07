#!/bin/bash

echo "🗑️  Database Reset and Setup Script"
echo "===================================="
echo ""

# Check if PocketBase is running
if lsof -Pi :8090 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "⚠️  PocketBase is currently running on port 8090"
    echo "Please stop PocketBase first, then run this script again."
    echo ""
    echo "To stop PocketBase:"
    echo "  1. Press Ctrl+C in the terminal where PocketBase is running"
    echo "  2. Or run: lsof -ti:8090 | xargs kill"
    exit 1
fi

echo "✓ PocketBase is not running"
echo ""

# Backup warning
echo "⚠️  WARNING: This will DELETE all data in pb_data/"
read -p "Are you sure you want to continue? (yes/no): " -r
echo ""

if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
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

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo "✓ Dependencies installed"
    echo ""
fi

# Run setup script (will show instructions if admin doesn't exist)
echo "🎬 Running setup script..."
echo ""
npm run setup

# If setup failed, wait for user to create admin and retry
if [ $? -ne 0 ]; then
    echo ""
    read -p "Press Enter when you've created the admin account to retry..."
    echo ""
    echo "⏳ Waiting a moment for PocketBase to sync..."
    sleep 2
    echo "🔄 Retrying setup..."
    echo ""
    npm run setup
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
