#!/bin/bash

echo "Building backend..."
cd backend
npm install
npm run build

echo "Building frontend..."
cd ../client
npm install
npm run build

echo "Build complete!"
