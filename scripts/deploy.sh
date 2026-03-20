#!/bin/bash
# Idempotent Deployment Script for ShopSmart
# This script can be run safely multiple times without causing errors or duplicating processes.

# Load nvm and use correct Node version
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm use default

set -e # Exit on any error

APP_DIR="$HOME/shopsmart"

# 1. Idempotent Directory Creation
echo "=> Ensuring application directories exist..."
mkdir -p "$APP_DIR/logs"

# 2. Navigate to app directory
cd "$APP_DIR" || exit 1

# 3. Pull latest changes (assuming git is already initialized)
echo "=> Pulling latest changes from main branch..."
git pull origin main || echo "Git pull failed, continuing local deployment..."

# 4. Install dependencies securely based on lockfile
echo "=> Installing dependencies..."
pnpm install --frozen-lockfile

# 5. Database Setup (Idempotent push/migrate)
echo "=> Syncing database schema..."
cd server
pnpm prisma db push --accept-data-loss
cd ..

# 6. Build Frontend
echo "=> Building Next.js application..."
cd client
pnpm build
cd ..

# 7. Restart Backend Service (Idempotent PM2 or kill-start logic)
echo "=> Restarting Backend Service..."
cd server
if lsof -Pi :5001 -sTCP:LISTEN -t >/dev/null ; then
    echo "Port 5001 in use. Killing existing backend process safely..."
    lsof -ti :5001 | xargs kill -15
    sleep 2 # Wait for graceful shutdown
fi

# Ensure it actually stopped, force kill if needed
if lsof -Pi :5001 -sTCP:LISTEN -t >/dev/null ; then
    lsof -ti :5001 | xargs kill -9
fi

# Start the server in the background and pipe logs
nohup pnpm start > ../logs/server.log 2>&1 &
echo "=> Backend started on port 5001."
cd ..

# 8. Restart Frontend Service
echo "=> Restarting Frontend Service..."
cd client
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
    echo "Port 3000 in use. Killing existing frontend process safely..."
    lsof -ti :3000 | xargs kill -15
    sleep 2
fi

nohup pnpm start > ../logs/client.log 2>&1 &
echo "=> Frontend started on port 3000."
cd ..

echo "=> Deployment completed successfully!"