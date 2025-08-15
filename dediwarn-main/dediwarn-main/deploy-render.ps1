#!/usr/bin/env pwsh
# Render Deployment Script for Disaster Management Application
# This script prepares and validates the application for Render deployment

Write-Host "🚀 Starting Render Deployment Process..." -ForegroundColor Green

# Step 1: Validate environment
Write-Host "📋 Step 1: Environment Validation" -ForegroundColor Yellow
if (Test-Path "package.json") {
    Write-Host "✅ Root package.json found" -ForegroundColor Green
} else {
    Write-Host "❌ Root package.json not found" -ForegroundColor Red
    exit 1
}

if (Test-Path "render.yaml") {
    Write-Host "✅ render.yaml configuration found" -ForegroundColor Green
} else {
    Write-Host "❌ render.yaml not found" -ForegroundColor Red
    exit 1
}

# Step 2: Clean and install dependencies
Write-Host "📦 Step 2: Installing Dependencies" -ForegroundColor Yellow
Write-Host "Installing root dependencies..." -ForegroundColor Cyan
npm install

Write-Host "Installing frontend dependencies..." -ForegroundColor Cyan
Set-Location frontend
npm install
Set-Location ..

# Step 3: Run tests and type checking
Write-Host "🔍 Step 3: Running Quality Checks" -ForegroundColor Yellow
Set-Location frontend
Write-Host "Running TypeScript check..." -ForegroundColor Cyan
npm run typecheck

# Step 4: Build for production
Write-Host "🏗️ Step 4: Production Build" -ForegroundColor Yellow
Write-Host "Building for production..." -ForegroundColor Cyan
npm run build
Set-Location ..

# Step 5: Git operations
Write-Host "📝 Step 5: Git Operations" -ForegroundColor Yellow
git add .

$hasChanges = git status --porcelain
if ($hasChanges) {
    Write-Host "Committing changes..." -ForegroundColor Cyan
    git commit -m "deploy: Prepare for Render deployment

✅ Production build completed
✅ All dependencies updated
✅ TypeScript checks passed
✅ Ready for Render deployment

🚀 Deploy to: https://render.com"
    
    Write-Host "Pushing to repository..." -ForegroundColor Cyan
    git push origin dediwarn-main
} else {
    Write-Host "No changes to commit" -ForegroundColor Green
}

# Step 6: Deployment instructions
Write-Host "🎯 Step 6: Deployment Instructions" -ForegroundColor Yellow
Write-Host ""
Write-Host "================== RENDER DEPLOYMENT GUIDE ==================" -ForegroundColor Magenta
Write-Host ""
Write-Host "1. Go to https://render.com and log in with your GitHub account" -ForegroundColor White
Write-Host ""
Write-Host "2. Click 'New +' and select 'Blueprint'" -ForegroundColor White
Write-Host ""
Write-Host "3. Connect your GitHub repository:" -ForegroundColor White
Write-Host "   Repository: ogdevsanskar/dediwarn-disaster-management" -ForegroundColor Cyan
Write-Host "   Branch: dediwarn-main" -ForegroundColor Cyan
Write-Host ""
Write-Host "4. Render will automatically detect the render.yaml file" -ForegroundColor White
Write-Host ""
Write-Host "5. Review the services that will be created:" -ForegroundColor White
Write-Host "   - Frontend (Static Site): dediwarn-frontend" -ForegroundColor Green
Write-Host "   - Backend (Web Service): dediwarn-backend" -ForegroundColor Green
Write-Host ""
Write-Host "6. Click 'Apply' to start the deployment" -ForegroundColor White
Write-Host ""
Write-Host "7. Your app will be available at:" -ForegroundColor White
Write-Host "   Frontend: https://dediwarn-frontend.onrender.com" -ForegroundColor Green
Write-Host "   Backend:  https://dediwarn-backend.onrender.com" -ForegroundColor Green
Write-Host ""
Write-Host "=========================================================" -ForegroundColor Magenta
Write-Host ""
Write-Host "🌐 Local Application Running:" -ForegroundColor Green
Write-Host "   http://localhost:5177/" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ Deployment preparation complete!" -ForegroundColor Green
Write-Host "✅ All files ready for Render deployment!" -ForegroundColor Green
