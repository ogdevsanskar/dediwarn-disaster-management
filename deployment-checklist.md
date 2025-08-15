# Render Deployment Checklist

## ✅ Pre-Deployment (Completed)
- [x] Fixed render.yaml (static → web with env: static)
- [x] Committed and pushed changes to GitHub
- [x] Repository: ogdevsanskar/dediwarn-disaster-management
- [x] Branch: dediwarn-main

## 🚀 Render Deployment Steps

### 1. Create Render Account
- [ ] Go to https://render.com
- [ ] Sign up with GitHub account
- [ ] Connect GitHub repository

### 2. Deploy with Blueprint
- [ ] Click "New +" → "Web Service"
- [ ] Select "Build and deploy from Git repository"
- [ ] Choose repository: `ogdevsanskar/dediwarn-disaster-management`
- [ ] Select branch: `dediwarn-main`
- [ ] Select "Use Blueprint" (render.yaml detected)
- [ ] Click "Apply"

### 3. Monitor Deployment
- [ ] Watch frontend service build (~5-10 min)
- [ ] Watch backend service build (~3-5 min)
- [ ] Check build logs for errors

### 4. Expected URLs
- Frontend: `https://dediwarn-frontend.onrender.com`
- Backend: `https://dediwarn-backend.onrender.com`

### 5. Test Deployment
- [ ] Frontend loads correctly
- [ ] Global Hub displays data
- [ ] Live Map shows markers
- [ ] Navigation works
- [ ] API endpoints respond

## 🔧 Troubleshooting Tips

### If Frontend Build Fails:
```bash
# Check these in build logs:
- Node.js version compatibility
- npm install success
- Vite build completion
- File paths correctness
```

### If Backend Build Fails:
```bash
# Check these in build logs:
- TypeScript compilation
- Dependencies installation
- Server startup
```

### Common Issues:
1. **Build timeout** - Render free tier has build time limits
2. **Memory issues** - Try reducing build parallelism
3. **API key errors** - Use demo keys initially

## 📞 Support
- Render Status: https://status.render.com
- Render Docs: https://render.com/docs
- GitHub Repo: https://github.com/ogdevsanskar/dediwarn-disaster-management
