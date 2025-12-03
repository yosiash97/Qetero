#!/bin/bash

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

# Cleanup on exit
trap "kill $BACKEND_PID 2>/dev/null" EXIT
