#!/bin/bash

# Render Build Script - Suppress Warnings
# This script builds the frontend with all warnings suppressed

echo "🔨 Building frontend for Render deployment..."

# Set environment variables to suppress warnings
export CI=false
export GENERATE_SOURCEMAP=false
export DISABLE_ESLINT_PLUGIN=true
export SKIP_PREFLIGHT_CHECK=true
export BUILD_IGNORE_WARNINGS=true

# Navigate to frontend directory
cd frontend

# Clean install dependencies
echo "📦 Installing dependencies..."
npm ci --silent

# Build with warnings suppressed
echo "🚀 Building application..."
npm run build --silent 2>/dev/null || npm run build

echo "✅ Build complete!"
echo "📊 Build output:"
ls -la dist/

echo "🎉 Frontend ready for deployment!"
