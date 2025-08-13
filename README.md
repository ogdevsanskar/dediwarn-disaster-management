# 🌍 Disaster Management Application

AI-Powered Full-Stack Disaster Management System with Separated Frontend and Backend

## 📁 Project Structure

```
disaster-management-app/
├── frontend/                    # React + Vite Frontend
│   ├── src/                    # React components and pages
│   ├── public/                 # Static assets
│   ├── index.html             # Main HTML file
│   ├── package.json           # Frontend dependencies
│   ├── vite.config.ts         # Vite configuration
│   ├── tailwind.config.js     # Tailwind CSS config
│   └── tsconfig.json          # TypeScript config
│
├── backend/                     # Express + TypeScript Backend
│   ├── api/                    # API routes
│   ├── server.ts              # Main server file
│   ├── package.json           # Backend dependencies
│   └── tsconfig.json          # TypeScript config
│
├── package.json               # Root package.json (workspace orchestration)
├── render.yaml               # Render deployment configuration
└── README.md                 # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js ≥ 18.0.0
- npm ≥ 8.0.0

### Installation

1. **Install all dependencies:**
   ```bash
   npm run install:all
   ```

2. **Or install separately:**
   ```bash
   npm run install:frontend
   npm run install:backend
   ```

### Development

1. **Run both frontend and backend:**
   ```bash
   npm run dev:full
   ```

2. **Or run separately:**
   ```bash
   # Terminal 1 - Backend (Port 3001)
   npm run dev:backend
   
   # Terminal 2 - Frontend (Port 5173)
   npm run dev:frontend
   ```

### Production Build

```bash
# Build both frontend and backend
npm run build:all

# Or build separately
npm run build:frontend
npm run build:backend
```

### Production Start

```bash
npm run start:all
```

## 🌐 URLs
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **API Health Check**: http://localhost:3001/api/status

## 🎯 Features

### 🤖 AI Assistant
- Voice recognition and chat
- Disaster response guidance
- Emergency protocol assistance

### 🌍 Real-Time Monitoring
- Live earthquake data from USGS
- Weather conditions and forecasts
- Interactive disaster mapping

### 🚨 Emergency Management
- SMS alert system
- Emergency broadcast notifications
- Real-time communication channels

### 💰 Donation System
- Secure payment processing
- Transparent fund tracking
- Donor management

### 👥 Volunteer Coordination
- Registration and management
- Task assignment system
- Communication tools

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development
- **Tailwind CSS** for styling
- **Chart.js** for data visualization
- **Socket.io** for real-time updates

### Backend
- **Express.js** with TypeScript
- **MongoDB** for data storage
- **Socket.io** for real-time communication
- **External APIs** (USGS, OpenWeather)

## 🚀 Deployment

### Render Deployment
The project is configured for automatic deployment on Render.com:

1. Push code to GitHub
2. Connect repository to Render
3. Render automatically detects `render.yaml` configuration
4. Both frontend and backend deploy automatically

### Manual Deployment
```bash
# Build for production
npm run build:all

# Frontend builds to: frontend/dist/
# Backend builds to: backend/dist/
```

## 📝 Scripts Reference

| Command | Description |
|---------|-------------|
| `npm run install:all` | Install dependencies for both frontend and backend |
| `npm run dev:full` | Start both development servers |
| `npm run build:all` | Build both frontend and backend for production |
| `npm run start:all` | Start both production servers |
| `npm run lint:all` | Run linting for both projects |

## 🔧 Configuration

### Environment Variables
Create `.env` files in the root directory:

```env
# Backend Configuration
NODE_ENV=development
PORT=3001
OPENWEATHER_API_KEY=your_key_here
MONGODB_URI=your_mongodb_uri
FRONTEND_URL=http://localhost:5173

# Frontend Configuration (if needed)
VITE_API_URL=http://localhost:3001
```

## 📄 License
MIT License - see LICENSE file for details

## 👨‍💻 Author
SANSKAR

---
Built with ❤️ for disaster management and community safety
