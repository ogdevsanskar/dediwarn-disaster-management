# 🌍 AI-Powered Disaster Management System

A comprehensive disaster management application with AI assistance, real-time monitoring, and emergency response capabilities.

## 🚀 **Deploy to Render**

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com)

### Quick Deployment Steps:

1. **Fork/Clone this repository**
2. **Push to your GitHub account**
3. **Connect to Render**:
   - Go to [render.com](https://render.com)
   - Connect your GitHub account
   - Create services from your repository

### 🌐 **Frontend Deployment (Static Site)**
- **Service Type**: Static Site
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `./dist`
- **Environment Variables**: None required

### ⚡ **Backend Deployment (Web Service)**
- **Service Type**: Web Service
- **Build Command**: `npm install && npm run build:server`
- **Start Command**: `npm run start:server`
- **Environment Variables**:
  ```
  NODE_ENV=production
  FRONTEND_URL=https://your-frontend-app.onrender.com
  ```

## 🎯 **Live Demo URLs**
After deployment, your app will be available at:
- **Frontend**: `https://your-app-name.onrender.com`
- **Backend API**: `https://your-api-name.onrender.com`

## ✨ **Features**

### 🤖 **AI Disaster Assistant**
- Intelligent conversation about disasters
- Real-time emergency guidance
- Voice recognition & text-to-speech
- Context-aware responses

### 📱 **Emergency Communication**
- Instant SMS alerts
- Quick emergency templates
- Custom message broadcasting
- Emergency contact management

### 🌊 **Disaster Monitoring**
- Earthquake tracking & analysis
- Flood risk assessment
- Weather disaster alerts
- Real-time environmental data

### 🎤 **Voice Integration**
- Speech-to-text commands
- Audio emergency alerts
- Hands-free operation
- Multi-language support

### 📲 **Progressive Web App**
- Installable on mobile devices
- Offline functionality
- Push notifications
- Native app-like experience

## 🛠️ **Local Development**

```bash
# Clone repository
git clone <your-repo-url>
cd disaster-management-app

# Install dependencies
npm install

# Start development servers
npm run dev:full

# Or start individually:
npm run dev:server  # Backend on port 3001
npm run dev         # Frontend on port 5173
```

## 📦 **Technology Stack**

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Express.js + TypeScript
- **UI**: Tailwind CSS + Lucide Icons
- **Voice**: Web Speech API
- **PWA**: Service Workers + Web App Manifest
- **Real-time**: WebSocket support ready

## 🔧 **Environment Configuration**

### Development (.env.local):
```env
VITE_API_URL=http://localhost:3001
NODE_ENV=development
PORT=3001
```

### Production (Render Environment Variables):
```env
NODE_ENV=production
FRONTEND_URL=https://your-frontend.onrender.com
PORT=10000  # Automatically set by Render
```

## 🚨 **Emergency Features Demo**

Try these voice commands or text inputs:

- **"Earthquake in Delhi"** - Get seismic activity analysis
- **"Flood risk in Mumbai"** - Receive flood monitoring data  
- **"Emergency help"** - Activate emergency protocols
- **"Send SMS alert"** - Broadcast emergency messages
- **"Weather alerts"** - Get severe weather warnings

## 📋 **API Endpoints**

- `GET /api/status` - Health check
- `POST /api/ai/chat` - AI conversation
- `GET /api/emergency-reports` - Emergency data
- `GET /api/environmental-data` - Environmental monitoring
- `POST /api/subscribe-notifications` - Push notifications

## 🔐 **Security Features**

- CORS protection
- Input validation
- XSS prevention
- Secure headers
- Rate limiting ready

## 🤝 **Contributing**

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 **Support**

For deployment issues:
- Check [Render Documentation](https://render.com/docs)
- Review build logs in Render dashboard
- Verify environment variables are set correctly

---

**🌟 Built with ❤️ for emergency preparedness and disaster response**
