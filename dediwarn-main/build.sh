#!/bin/bash
set -e

echo "🔧 Setting up Node.js environment..."
export NODE_VERSION=20.11.0
export NPM_VERSION=10.2.4

echo "📦 Installing root dependencies..."
npm ci --include=dev

echo "📦 Building frontend..."
cd frontend

echo "🔧 Installing frontend dependencies..."
npm ci --include=dev

echo "🔍 Checking if Vite is available..."
npx vite --version

echo "🏗️ Running TypeScript check..."
npm run typecheck

echo "🏗️ Building production bundle..."
npm run build

echo "📁 Checking build output..."
ls -la dist/

echo "✅ Build complete! Frontend built successfully."
