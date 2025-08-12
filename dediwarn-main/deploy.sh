#!/bin/bash

# Deployment Script for Render
# This script prepares the application for deployment

echo "🚀 Preparing Disaster Management App for Render Deployment..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build frontend
echo "🏗️ Building frontend..."
npm run build

# Build backend
echo "⚙️ Building backend..."
npm run build:server

# Verify builds
if [ -d "dist" ] && [ -f "dist/server/server.js" ]; then
    echo "✅ Build successful!"
    echo "📁 Frontend built to: ./dist/"
    echo "📁 Backend built to: ./dist/server/"
else
    echo "❌ Build failed!"
    exit 1
fi

echo "🌟 Ready for Render deployment!"
echo ""
echo "Next steps:"
echo "1. Push code to GitHub repository"
echo "2. Connect repository to Render"
echo "3. Create two services:"
echo "   - Static Site (Frontend): Build command 'npm run build', Publish dir './dist'"
echo "   - Web Service (Backend): Build command 'npm run build:server', Start command 'npm run start:server'"
echo "4. Set environment variables in Render dashboard"
