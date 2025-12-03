#!/bin/bash

# Determine if we're in production or development mode
if [ "$NODE_ENV" = "production" ]; then
  echo "Starting in production mode..."
  
  # Start backend in the background
  cd backend
  npm run start:prod &
  BACKEND_PID=$!
  
  # Wait for backend to start
  echo "Waiting for backend to start..."
  sleep 5
  
  # Start frontend
  cd ../client
  npm run start
else
  echo "Starting in development mode..."
  
  # Start backend in the background
  cd backend
  npm run start:dev &
  BACKEND_PID=$!
  
  # Wait for backend to start
  echo "Waiting for backend to start..."
  sleep 5
  
  # Start frontend
  cd ../client
  npm run dev
fi

# Cleanup on exit
trap "kill $BACKEND_PID 2>/dev/null" EXIT
