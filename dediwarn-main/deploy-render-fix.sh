#!/bin/bash

# Deployment Fix Script for Render
# This script addresses common deployment issues

echo "🚀 Starting Render Deployment Fix..."

# 1. Fix Backend Dependencies
echo "📦 Checking Backend Dependencies..."
cd backend
npm install --production=false

# 2. Build Backend
echo "🔨 Building Backend..."
npm run build

# 3. Fix Frontend Dependencies  
echo "📦 Checking Frontend Dependencies..."
cd ../frontend
npm install --production=false

# 4. Build Frontend with Production Environment
echo "🔨 Building Frontend..."
NODE_ENV=production npm run build

# 5. Check Build Outputs
echo "📊 Checking Build Outputs..."
echo "Backend dist folder:"
ls -la ../backend/dist/

echo "Frontend dist folder:"
ls -la dist/

# 6. Verify Critical Files
if [ -f "../backend/dist/server.js" ]; then
    echo "✅ Backend server.js found"
else
    echo "❌ Backend server.js missing"
fi

if [ -f "dist/index.html" ]; then
    echo "✅ Frontend index.html found"
else
    echo "❌ Frontend index.html missing"
fi

echo "🎉 Deployment fix complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Commit these changes: git add . && git commit -m 'Fix deployment configuration'"
echo "2. Push to GitHub: git push origin main"
echo "3. Deploy on Render using the render.yaml configuration"
echo ""
echo "🔗 Render Configuration:"
echo "- Backend URL: https://dediwarn-backend.onrender.com"
echo "- Frontend URL: https://dediwarn-frontend.onrender.com"
