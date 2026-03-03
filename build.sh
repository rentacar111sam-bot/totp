#!/bin/bash

# Build script for Render deployment

echo "🔨 Building TOTP Authentication System..."

# Backend o'rnatish
echo "📦 Installing backend dependencies..."
cd backend
npm install --production
cd ..

echo "✅ Build completed successfully!"
echo "🚀 Ready for deployment on Render"
