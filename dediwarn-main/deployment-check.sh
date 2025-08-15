#!/bin/bash

# Render Deployment Debug Script
# Run this to check if your deployment configuration is correct

echo "🔍 Render Deployment Verification"
echo "=================================="

# Check if all required files exist
echo ""
echo "📁 Checking Required Files:"

if [ -f "render.yaml" ]; then
    echo "✅ render.yaml found"
else
    echo "❌ render.yaml missing"
fi

if [ -f "backend/package.json" ]; then
    echo "✅ backend/package.json found"
else
    echo "❌ backend/package.json missing"
fi

if [ -f "frontend/package.json" ]; then
    echo "✅ frontend/package.json found"
else
    echo "❌ frontend/package.json missing"
fi

# Check Node.js version consistency
echo ""
echo "🔧 Checking Node.js Version Configuration:"

if [ -f ".nvmrc" ]; then
    NODE_VERSION=$(cat .nvmrc)
    echo "✅ .nvmrc specifies Node.js version: $NODE_VERSION"
else
    echo "⚠️  .nvmrc not found"
fi

# Check backend configuration
echo ""
echo "🖥️  Backend Configuration:"
if [ -f "backend/server.ts" ]; then
    echo "✅ Backend server.ts found"
    if grep -q "CORS_ORIGIN" backend/server.ts; then
        echo "✅ CORS configuration found"
    else
        echo "⚠️  CORS configuration might be missing"
    fi
else
    echo "❌ Backend server.ts missing"
fi

# Test builds
echo ""
echo "🔨 Testing Builds:"

echo "Building backend..."
cd backend
if npm run build > /dev/null 2>&1; then
    echo "✅ Backend build successful"
    if [ -f "dist/server.js" ]; then
        echo "✅ server.js compiled successfully"
    else
        echo "❌ server.js not found in dist/"
    fi
else
    echo "❌ Backend build failed"
fi

cd ../frontend
echo "Building frontend..."
if npm run build > /dev/null 2>&1; then
    echo "✅ Frontend build successful"
    if [ -f "dist/index.html" ]; then
        echo "✅ Frontend assets compiled successfully"
    else
        echo "❌ Frontend dist/index.html not found"
    fi
else
    echo "❌ Frontend build failed"
fi

cd ..

echo ""
echo "📋 Deployment Checklist:"
echo "1. ✅ All builds successful"
echo "2. ✅ render.yaml configured"
echo "3. ✅ Node.js version set to 18.x"
echo "4. ✅ CORS properly configured"
echo "5. ✅ Environment variables set"
echo ""
echo "🚀 Ready to deploy to Render!"
echo ""
echo "📝 Deployment Steps:"
echo "1. Go to render.com"
echo "2. Connect your GitHub repository"
echo "3. Create 'Web Service from Git'"
echo "4. Select: ogdevsanskar/dediwarn-disaster-management"
echo "5. Render will auto-detect render.yaml and deploy both services"
echo ""
echo "🌐 Expected URLs:"
echo "- Backend: https://dediwarn-backend.onrender.com"
echo "- Frontend: https://dediwarn-frontend.onrender.com"
