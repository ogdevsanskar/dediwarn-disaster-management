# Disaster Management Application

## Render Deployment

This application is configured for deployment on Render with the following services:

### Frontend (Static Site)
- **Service Name**: disaster-management-frontend
- **Type**: Static Site
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `./dist`

### Backend (Web Service)
- **Service Name**: disaster-management-backend
- **Type**: Web Service (Node.js)
- **Build Command**: `npm install && npm run build:server`
- **Start Command**: `npm run start:server`
- **Health Check**: `/api/status`

## Environment Variables

Set these in Render Dashboard:
- `NODE_ENV=production`
- `PORT=10000` (automatically set by Render)

## Deployment Steps

1. **Push to GitHub**: Commit and push your code to a GitHub repository
2. **Connect to Render**: 
   - Go to [render.com](https://render.com)
   - Connect your GitHub account
   - Create new services from your repository
3. **Deploy Frontend**:
   - Create a new Static Site
   - Choose your repository
   - Set build command: `npm install && npm run build`
   - Set publish directory: `dist`
4. **Deploy Backend**:
   - Create a new Web Service
   - Choose your repository
   - Set build command: `npm install && npm run build:server`
   - Set start command: `npm run start:server`
   - Add environment variables

## Features Available After Deployment

✅ **AI Disaster Assistant** - Intelligent emergency response system
✅ **Voice Recognition** - Speech-to-text for hands-free operation
✅ **SMS Emergency Alerts** - Quick disaster notifications
✅ **Real-time Disaster Monitoring** - Earthquake, flood, weather tracking
✅ **Emergency Action Buttons** - One-click emergency services
✅ **Progressive Web App** - Installable on mobile devices
✅ **Offline Capabilities** - Works without internet connection

## URLs After Deployment

- **Frontend**: `https://disaster-management-frontend.onrender.com`
- **Backend API**: `https://disaster-management-backend.onrender.com`

## Local Development

```bash
# Install dependencies
npm install

# Start development servers
npm run dev:full

# Frontend: http://localhost:5173
# Backend: http://localhost:3001
```
