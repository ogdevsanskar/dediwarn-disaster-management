# Disaster Management Platform - Windows Deployment Script
Write-Host "🚀 Starting deployment process..." -ForegroundColor Cyan

# Step 1: Run final build test
Write-Host "📦 Testing production build..." -ForegroundColor Yellow
Set-Location frontend
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Frontend build successful!" -ForegroundColor Green
} else {
    Write-Host "❌ Frontend build failed. Please fix errors before deploying." -ForegroundColor Red
    exit 1
}

Set-Location ..

# Step 2: Test backend build
Write-Host "📦 Testing backend build..." -ForegroundColor Yellow
npm run build:backend

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Backend build successful!" -ForegroundColor Green
} else {
    Write-Host "❌ Backend build failed. Please fix errors before deploying." -ForegroundColor Red
    exit 1
}

# Step 3: Check git status
Write-Host "📋 Checking git status..." -ForegroundColor Yellow
git status

# Step 4: Add all files
Write-Host "📥 Adding all files to git..." -ForegroundColor Yellow
git add .

# Step 5: Commit changes
Write-Host "💾 Committing changes..." -ForegroundColor Yellow
$commit_msg = Read-Host "Enter commit message (or press Enter for default)"
if ([string]::IsNullOrWhiteSpace($commit_msg)) {
    $commit_msg = "Deploy: Production build with TypeScript fixes and enhanced features"
}

git commit -m $commit_msg

# Step 6: Push to main branch
Write-Host "🌐 Pushing to remote repository..." -ForegroundColor Yellow
git push origin main

Write-Host ""
Write-Host "🎉 Deployment process complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "1. Go to your Render dashboard: https://dashboard.render.com"
Write-Host "2. Connect your GitHub repository if not already connected"
Write-Host "3. Create a new Static Site pointing to this repository"
Write-Host "4. Use the render.yaml configuration for automatic deployment"
Write-Host ""
Write-Host "🌍 Your app will be deployed to:" -ForegroundColor Magenta
Write-Host "   Frontend: https://your-app-name.onrender.com"
Write-Host "   Backend:  https://your-backend-name.onrender.com"
Write-Host ""
Write-Host "✨ Deployment ready! Your disaster management platform is production-ready!" -ForegroundColor Green
