
#!/usr/bin/env bash

echo "Starting project setup..."


if [ -d "server/node_modules" ]; then
  echo "Backend dependencies already installed."
else
  echo "Installing backend dependencies..."
  cd server && pnpm install
  if [ $? -ne 0 ]; then
    echo "Backend pnpm install failed."
    exit 1
  fi
fi


if [ -d "client/node_modules" ]; then
  echo "Frontend dependencies already installed."
else
  echo "Installing frontend dependencies..."
  cd client && pnpm install
  if [ $? -ne 0 ]; then
    echo "Frontend pnpm install failed."
    exit 1
  fi
fi


if [ -f ".env" ]; then
  echo ".env file already exists."
else
  echo "Creating .env file..."
  echo "NODE_ENV=development" > .env
  echo "PORT=3001" >> .env

  if [ $? -ne 0 ]; then
    echo ".env file creation failed."
    exit 2
  fi
fi

echo "Setup completed successfully."
exit 0
