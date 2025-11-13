#!/bin/bash
set -e

# Talk App - Production Build Script
# Creates optimized frontend build and prepares backend for deployment

echo "======================================"
echo "Talk App - Production Build"
echo "======================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if bun is installed
if ! command -v bun &> /dev/null; then
    echo -e "${RED}Error: bun is not installed${NC}"
    echo "Install bun: curl -fsSL https://bun.sh/install | bash"
    exit 1
fi

# Check if we're in the project root
if [ ! -d "frontend" ] || [ ! -d "backend" ]; then
    echo -e "${RED}Error: Must run from project root directory${NC}"
    exit 1
fi

# Clean previous builds
echo -e "${BLUE}[1/6]${NC} Cleaning previous builds..."
rm -rf frontend/dist
rm -rf deploy
mkdir -p deploy

# Build frontend
echo -e "${BLUE}[2/6]${NC} Building frontend..."
cd frontend

# Check for .env file
if [ ! -f ".env" ]; then
    echo -e "${RED}Warning: frontend/.env not found${NC}"
    echo "Create .env with VITE_POCKETBASE_URL for production"
    exit 1
fi

# Install dependencies
echo "  Installing dependencies..."
bun install --frozen-lockfile

# Build production bundle
echo "  Creating production build..."
bun run build

# Verify build output
if [ ! -d "dist" ]; then
    echo -e "${RED}Error: Build failed - dist/ directory not created${NC}"
    exit 1
fi

cd ..

# Prepare backend
echo -e "${BLUE}[3/6]${NC} Preparing backend..."

# Check if pocketbase binary exists
if [ ! -f "backend/pocketbase" ]; then
    echo -e "${RED}Error: backend/pocketbase executable not found${NC}"
    echo "Download PocketBase from: https://pocketbase.io/docs/"
    exit 1
fi

# Copy backend files to deploy directory
echo "  Copying backend files..."
mkdir -p deploy/backend
cp backend/pocketbase deploy/backend/
cp -r backend/pb_hooks deploy/backend/
cp -r backend/pb_migrations deploy/backend/
cp backend/.env.example deploy/backend/.env

# Check backend .env
if [ ! -f "backend/.env" ]; then
    echo -e "${RED}Warning: backend/.env not found, using .env.example${NC}"
else
    cp backend/.env deploy/backend/.env
fi

# Copy frontend build to deploy directory
echo -e "${BLUE}[4/6]${NC} Copying frontend build..."
mkdir -p deploy/frontend
cp -r frontend/dist/* deploy/frontend/

# Create deployment package info
echo -e "${BLUE}[5/6]${NC} Creating deployment manifest..."
cat > deploy/MANIFEST.txt << EOF
Talk App - Production Build
====================================
Build Date: $(date)
Frontend: Vite production build
Backend: PocketBase $(backend/pocketbase --version 2>&1 | head -n1)

Directory Structure:
  frontend/     - Static files (serve with Caddy/nginx)
  backend/      - PocketBase executable + hooks + migrations

Deployment Requirements:
  - Ubuntu 24.04 or higher
  - Caddy web server (or nginx)
  - systemd (for service management)

See DEPLOYMENT.md for installation instructions.
EOF

# Calculate sizes
echo -e "${BLUE}[6/6]${NC} Build summary..."
FRONTEND_SIZE=$(du -sh deploy/frontend | cut -f1)
BACKEND_SIZE=$(du -sh deploy/backend | cut -f1)
TOTAL_SIZE=$(du -sh deploy | cut -f1)

echo ""
echo -e "${GREEN}✓ Build completed successfully!${NC}"
echo ""
echo "======================================"
echo "Build Summary"
echo "======================================"
echo "Frontend: $FRONTEND_SIZE"
echo "Backend:  $BACKEND_SIZE"
echo "Total:    $TOTAL_SIZE"
echo ""
echo "Output: ./deploy/"
echo ""
echo "Next steps:"
echo "1. Review deploy/backend/.env (set production credentials)"
echo "2. Update frontend environment variables if needed"
echo "3. Create deployment archive: tar -czf talk-app.tar.gz deploy/"
echo "4. Transfer to server and run installation scripts"
echo ""
