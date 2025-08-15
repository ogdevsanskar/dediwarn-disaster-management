@echo off
echo 🌍 Setting up GitHub repository for Disaster Management App...

:: Check if we're in a git repository
if not exist ".git" (
    echo ❌ Not a git repository. Please run 'git init' first.
    pause
    exit /b 1
)

:: Prompt for GitHub repository URL
echo 📝 Please enter your GitHub repository URL:
echo Example: https://github.com/YOUR_USERNAME/disaster-management-app.git
set /p REPO_URL="Repository URL: "

if "%REPO_URL%"=="" (
    echo ❌ Repository URL is required.
    pause
    exit /b 1
)

echo 🔗 Adding remote origin...
git remote add origin "%REPO_URL%"

echo 📤 Pushing to GitHub...
git push -u origin main

echo.
echo ✅ SUCCESS! Your code is now on GitHub!
echo.
echo 🚀 Next steps for Render deployment:
echo 1. Go to https://render.com
echo 2. Connect your GitHub account
echo 3. Create new Static Site:
echo    - Repository: Select your repo
echo    - Build Command: npm install ^&^& npm run build
echo    - Publish Directory: ./dist
echo 4. Create new Web Service:
echo    - Repository: Same repo
echo    - Build Command: npm install ^&^& npm run build:server
echo    - Start Command: npm run start:server
echo    - Environment Variables:
echo      NODE_ENV=production
echo      FRONTEND_URL=https://your-frontend.onrender.com
echo.
echo 🌟 Your Disaster Management App will be live soon!
pause
