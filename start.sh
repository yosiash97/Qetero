#!/bin/bash

# Default to production if NODE_ENV is not set
if [ -z "$NODE_ENV" ]; then
  export NODE_ENV=production
fi

# Function to wait for backend to be ready
wait_for_backend() {
  echo "Waiting for backend to be ready on port 3001..."
  for i in {1..30}; do
    if curl -s http://127.0.0.1:3001/api/hotels > /dev/null 2>&1; then
      echo "Backend is ready!"
      return 0
    fi
    echo "Attempt $i: Backend not ready yet..."
    sleep 2
  done
  echo "Warning: Backend may not be fully ready, but continuing..."
  return 1
}

if [ "$NODE_ENV" = "production" ]; then
  echo "Starting in production mode..."
  
  # Start backend in the background
  cd backend
  node dist/main.js &
  BACKEND_PID=$!
  
  # Wait for backend to be ready
  cd ..
  wait_for_backend
  
  # Start frontend
  cd client
  npm run start
else
  echo "Starting in development mode..."
  
  # Start backend in the background
  cd backend
  npm run start:dev &
  BACKEND_PID=$!
  
  # Wait for backend to be ready
  cd ..
  wait_for_backend
  
  # Start frontend
  cd client
  npm run dev
fi

# Cleanup on exit
trap "kill $BACKEND_PID 2>/dev/null" EXIT
