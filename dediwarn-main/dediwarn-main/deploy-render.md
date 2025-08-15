# 🚀 Deploy to Render - Complete Guide

## Method 1: Using Render Dashboard (Recommended)

### 🎯 **Step 1: Deploy Frontend (Static Site)**

1. **Go to Render Dashboard**: https://dashboard.render.com
2. **Click "New +" → "Static Site"**
3. **Connect GitHub repository**: `ogdevsanskar/dediwarn-disaster-management`
4. **Configure settings**:

```
Name: dediwarn-frontend
Branch: main
Root Directory: (leave empty)
Build Command: cd frontend && npm install && npm run build
Publish Directory: frontend/dist
Auto-Deploy: Yes
```

**Environment Variables** (Optional):
```
VITE_API_URL=https://dediwarn-backend.onrender.com
VITE_ENVIRONMENT=production
```

### 🎯 **Step 2: Deploy Backend (Web Service)**

1. **Click "New +" → "Web Service"**
2. **Use same repository**: `ogdevsanskar/dediwarn-disaster-management`
3. **Configure settings**:

```
Name: dediwarn-backend
Branch: main
Root Directory: backend
Build Command: npm install && npm run build
Start Command: npm start
Auto-Deploy: Yes
```

**Environment Variables**:
```
NODE_ENV=production
PORT=10000
```

## Method 2: Using render.yaml (Automated)

Your project already has a `render.yaml` file configured. To use it:

1. **Go to Render Dashboard**
2. **Click "New +" → "Blueprint"**
3. **Connect your GitHub repository**
4. **Render will automatically detect and use your render.yaml**

## 🔧 Pre-Deployment Checklist

✅ **Repository is public and accessible**
✅ **All dependencies are listed in package.json**
✅ **Build scripts are working locally**
✅ **Environment variables are configured**

## 🌐 Expected URLs

After deployment:
- **Frontend**: `https://dediwarn-frontend.onrender.com`
- **Backend**: `https://dediwarn-backend.onrender.com`

## 🛠️ Troubleshooting

### Common Issues:

1. **Build Failures**:
   - Check Node.js version compatibility
   - Ensure all dependencies are in package.json
   - Check build logs in Render dashboard

2. **Runtime Errors**:
   - Verify environment variables
   - Check start command
   - Monitor service logs

3. **Frontend-Backend Connection**:
   - Update API URLs in frontend
   - Configure CORS in backend
   - Check network policies

## 📊 Deployment Time

- **Frontend**: ~3-5 minutes
- **Backend**: ~5-8 minutes
- **Total**: ~10-15 minutes

---

## 🚀 **Ready to Deploy!**

Choose your preferred method and follow the steps above. Your disaster management platform will be live on Render in minutes!
