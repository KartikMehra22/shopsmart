#!/bin/bash
set -e

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# use default node if available
nvm use default || true

APP_DIR="$HOME/shopsmart"
REPO_URL="https://github.com/KartikMehra22/shopsmart.git"

echo "=> Ensuring app directory exists..."

# Clone repo if missing
if [ ! -d "$APP_DIR" ]; then
  echo "=> Repo not found. Cloning fresh copy..."
  git clone "$REPO_URL" "$APP_DIR"
fi

cd "$APP_DIR"

# If folder exists but git is broken, re-clone
if [ ! -d ".git" ]; then
  echo "=> .git folder missing. Re-cloning repository..."
  cd "$HOME"
  rm -rf "$APP_DIR"
  git clone "$REPO_URL" "$APP_DIR"
  cd "$APP_DIR"
fi

echo "=> Pulling latest changes..."
git fetch origin
git reset --hard origin/main

echo "=> Creating logs directory..."
mkdir -p logs

echo "=> Installing root dependencies..."
pnpm install --frozen-lockfile

echo "=> Installing server dependencies..."
cd server
pnpm install --frozen-lockfile

echo "=> Syncing database schema..."
pnpm prisma db push --accept-data-loss

echo "=> Restarting backend..."
if lsof -Pi :5001 -sTCP:LISTEN -t >/dev/null ; then
  lsof -ti :5001 | xargs kill -15 || true
  sleep 2
fi

if lsof -Pi :5001 -sTCP:LISTEN -t >/dev/null ; then
  lsof -ti :5001 | xargs kill -9 || true
fi

nohup pnpm start > ../logs/server.log 2>&1 &
cd ..

echo "=> Installing client dependencies..."
cd client
pnpm install --frozen-lockfile

echo "=> Building frontend..."
pnpm build

echo "=> Restarting frontend..."
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
  lsof -ti :3000 | xargs kill -15 || true
  sleep 2
fi

if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
  lsof -ti :3000 | xargs kill -9 || true
fi

nohup pnpm start > ../logs/client.log 2>&1 &
cd ..

echo "=> Deployment completed successfully!"