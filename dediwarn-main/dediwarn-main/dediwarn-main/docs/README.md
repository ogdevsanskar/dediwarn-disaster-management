# 🌍 DediWarn - AI-Powered Disaster Management System

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-green.svg)

> **A comprehensive disaster management platform that leverages AI, real-time data, and modern web technologies to provide early warning systems, emergency response coordination, and public safety communication.**

## 🚀 Overview

DediWarn is a state-of-the-art disaster management system designed to save lives through proactive monitoring, intelligent analysis, and rapid response coordination. The platform integrates multiple data sources, AI-powered analytics, and real-time communication systems to provide comprehensive disaster preparedness and response capabilities.

### 🎯 Key Features

- **🤖 AI-Powered Assistant**: Natural language processing for disaster queries and emergency guidance
- **📡 Real-time Monitoring**: Live earthquake, weather, and environmental data integration
- **📱 Multi-channel Alerts**: SMS, Email, and WebSocket notifications
- **🗺️ Interactive Mapping**: Real-time disaster visualization and risk assessment
- **📊 Analytics Dashboard**: Comprehensive data analysis and reporting
- **🔗 Blockchain Integration**: Smart contracts for transparent resource allocation
- **👥 Community Features**: Volunteer coordination and crowd-sourced reporting

## 🏗️ Architecture

### Frontend Architecture
```
frontend/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── AIAssistant.tsx     # AI chat interface
│   │   ├── RealTimeMap.tsx     # Interactive disaster map
│   │   ├── AnalyticsDashboard.tsx # Data visualization
│   │   └── NotificationCenter.tsx # Alert management
│   ├── pages/              # Application pages
│   ├── services/           # API integration services
│   ├── contexts/           # React context providers
│   └── hooks/              # Custom React hooks
├── public/                 # Static assets
└── package.json           # Frontend dependencies
```

### Backend Architecture
```
backend/
├── server.ts              # Main Express server
├── api/
│   └── routes.ts          # API route definitions
├── services/              # Business logic services
├── models/                # Data models
├── middleware/            # Express middleware
└── package.json          # Backend dependencies
```

## 🛠️ Technology Stack

### Frontend
- **React 18.2.0** - Modern UI library with hooks
- **TypeScript** - Type-safe JavaScript development
- **Vite 4.5.14** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **Socket.IO Client** - Real-time communication
- **Lucide React** - Modern icon library

### Backend
- **Express.js** - Web application framework
- **TypeScript** - Server-side type safety
- **Socket.IO** - WebSocket implementation
- **MongoDB** - NoSQL database
- **Redis** - Caching and session management
- **Nodemailer** - Email service integration
- **Twilio** - SMS service integration

### External APIs
- **USGS Earthquake API** - Real-time seismic data
- **OpenWeatherMap API** - Weather monitoring
- **Government Alert APIs** - Official emergency alerts

### Deployment
- **Render.com** - Cloud hosting platform
- **GitHub Actions** - CI/CD pipeline
- **Docker** - Containerization (optional)

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18.0.0
- npm >= 8.0.0
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ogdevsanskar/dediwarn.git
   cd dediwarn
   ```

2. **Install dependencies**
   ```bash
   # Install workspace dependencies
   npm install
   
   # Install frontend dependencies
   cd frontend && npm install
   
   # Install backend dependencies
   cd ../backend && npm install
   ```

3. **Environment Configuration**
   
   Create `.env` files in both frontend and backend directories:
   
   **Backend `.env`:**
   ```env
   PORT=3001
   NODE_ENV=development
   
   # Database
   MONGODB_URI=mongodb://localhost:27017/dediwarn
   REDIS_URL=redis://localhost:6379
   
   # External APIs
   OPENWEATHER_API_KEY=your_openweather_api_key
   USGS_API_URL=https://earthquake.usgs.gov/earthquakes/feed/v1.0
   
   # Communication Services
   TWILIO_ACCOUNT_SID=your_twilio_sid
   TWILIO_AUTH_TOKEN=your_twilio_token
   TWILIO_PHONE_NUMBER=your_twilio_phone
   
   # Email Configuration
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_app_password
   
   # Security
   JWT_SECRET=your_jwt_secret
   SESSION_SECRET=your_session_secret
   ```
   
   **Frontend `.env`:**
   ```env
   VITE_API_BASE_URL=http://localhost:3001
   VITE_SOCKET_URL=http://localhost:3001
   VITE_GOOGLE_MAPS_API_KEY=your_google_maps_key
   ```

4. **Start Development Servers**
   ```bash
   # Start both frontend and backend
   npm run dev:full
   
   # Or start individually
   npm run dev:frontend  # Frontend only
   npm run dev:backend   # Backend only
   ```

5. **Access the Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001
   - API Health Check: http://localhost:3001/api/status

## 📚 API Documentation

### Core Endpoints

#### Health Check
```http
GET /api/status
```
Returns system status and service health information.

#### AI Assistant
```http
POST /api/ai/chat
Content-Type: application/json

{
  "message": "Is there earthquake activity in Delhi?",
  "location": "Delhi, India"
}
```

#### Emergency Reports
```http
POST /api/emergency-reports
Content-Type: application/json

{
  "type": "earthquake",
  "location": {
    "lat": 28.6139,
    "lng": 77.2090
  },
  "severity": "moderate",
  "description": "Moderate shaking felt in central Delhi"
}
```

#### Weather Alerts
```http
GET /api/weather-alerts?location=Delhi&type=severe
```

#### Seismic Data
```http
GET /api/seismic-data?lat=28.6139&lng=77.2090&radius=100
```

#### SMS Notifications
```http
POST /api/send-sms
Content-Type: application/json

{
  "to": "+91XXXXXXXXXX",
  "message": "Emergency alert: Earthquake detected in your area. Stay safe!",
  "type": "emergency"
}
```

### WebSocket Events

#### Client to Server
- `join_location` - Join location-based room
- `emergency_report` - Report emergency incident
- `request_update` - Request real-time updates

#### Server to Client
- `emergency_alert` - Emergency broadcast
- `weather_update` - Weather condition updates
- `seismic_activity` - Earthquake notifications

## 🔧 Development

### Project Structure
```
dediwarn/
├── frontend/               # React frontend application
├── backend/                # Express backend server
├── docs/                   # Documentation and guides
├── scripts/                # Build and deployment scripts
├── .github/                # GitHub Actions workflows
├── package.json            # Workspace configuration
├── render.yaml             # Render deployment config
└── README.md               # Project overview
```

### Available Scripts

#### Workspace Level
```bash
npm run dev:full            # Start both frontend and backend
npm run build:all           # Build both applications
npm run test:all            # Run all tests
npm run lint:all            # Lint all code
npm run deploy              # Deploy to production
```

#### Frontend Scripts
```bash
npm run dev                 # Start development server
npm run build               # Build for production
npm run preview             # Preview production build
npm run test                # Run frontend tests
npm run lint                # Lint frontend code
```

#### Backend Scripts
```bash
npm run dev                 # Start development server with hot reload
npm run build               # Compile TypeScript
npm run start               # Start production server
npm run test                # Run backend tests
npm run lint                # Lint backend code
```

### Code Style Guidelines

- **TypeScript**: Strict mode enabled
- **ESLint**: Airbnb configuration with custom rules
- **Prettier**: Automatic code formatting
- **Commit Convention**: Conventional Commits specification

### Testing Strategy

- **Frontend**: React Testing Library + Jest
- **Backend**: Jest + Supertest for API testing
- **E2E**: Cypress for integration testing
- **Coverage**: Minimum 80% code coverage

## 🌐 Deployment

### Render.com Deployment

1. **Connect Repository**
   - Link your GitHub repository to Render
   - Configure auto-deploy on main branch

2. **Environment Variables**
   - Set all required environment variables in Render dashboard
   - Use secure storage for API keys and secrets

3. **Build Configuration**
   ```yaml
   # render.yaml
   services:
     - type: web
       name: dediwarn-backend
       env: node
       buildCommand: cd backend && npm install && npm run build
       startCommand: cd backend && npm start
       
     - type: web
       name: dediwarn-frontend
       env: static
       buildCommand: cd frontend && npm install && npm run build
       staticPublishPath: frontend/dist
   ```

### Manual Deployment

1. **Build Applications**
   ```bash
   npm run build:all
   ```

2. **Deploy Backend**
   ```bash
   cd backend
   npm install --production
   npm start
   ```

3. **Deploy Frontend**
   ```bash
   cd frontend
   npm install --production
   npm run build
   # Serve dist/ folder with any static file server
   ```

## 🔐 Security

### Authentication
- JWT-based authentication for API access
- Session management with secure cookies
- Role-based access control (RBAC)

### Data Protection
- HTTPS enforcement in production
- Input validation and sanitization
- SQL injection prevention
- XSS protection with CSP headers

### API Security
- Rate limiting to prevent abuse
- CORS configuration for trusted origins
- API key rotation and management
- Secure environment variable handling

## 📊 Monitoring & Analytics

### Application Monitoring
- Health check endpoints for uptime monitoring
- Error tracking and logging
- Performance metrics collection
- Real-time system status dashboard

### Business Metrics
- Emergency response times
- User engagement analytics
- Alert effectiveness measurement
- Resource utilization tracking

## 🤝 Contributing

### Development Workflow

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make changes and commit**
   ```bash
   git commit -m "feat: add amazing feature"
   ```
4. **Push to branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Create Pull Request**

### Contribution Guidelines

- Follow the existing code style and conventions
- Write comprehensive tests for new features
- Update documentation for any API changes
- Ensure all tests pass before submitting PR
- Include detailed PR description with screenshots if applicable

### Bug Reports

When reporting bugs, please include:
- Detailed description of the issue
- Steps to reproduce the problem
- Expected vs actual behavior
- Screenshots or error logs
- Environment information (OS, browser, Node version)

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

## 🙏 Acknowledgments

- **USGS** for providing real-time earthquake data
- **OpenWeatherMap** for weather API services
- **Twilio** for SMS infrastructure
- **Open source community** for the amazing tools and libraries

## 📞 Support

### Contact Information
- **Project Maintainer**: Sanskar
- **Email**: sanskar@example.com
- **GitHub**: [@ogdevsanskar](https://github.com/ogdevsanskar)

### Getting Help

1. **Documentation**: Check this README and docs folder
2. **Issues**: Create a GitHub issue for bugs or feature requests
3. **Discussions**: Use GitHub Discussions for questions
4. **Community**: Join our Discord server for real-time help

## 🗺️ Roadmap

### Current Version (1.0.0)
- ✅ Real-time disaster monitoring
- ✅ AI-powered assistant
- ✅ Multi-channel notifications
- ✅ Basic analytics dashboard

### Upcoming Features (1.1.0)
- 🔄 Mobile application (React Native)
- 🔄 Advanced machine learning models
- 🔄 IoT sensor integration
- 🔄 Offline functionality with PWA

### Future Releases (2.0.0)
- 📅 Augmented reality emergency guidance
- 📅 Drone integration for damage assessment
- 📅 International expansion with multi-language support
- 📅 Advanced prediction algorithms

## 📈 Performance

### Benchmarks
- **API Response Time**: < 200ms average
- **Frontend Load Time**: < 2 seconds
- **Real-time Update Latency**: < 100ms
- **Uptime Target**: 99.9%

### Optimization
- CDN integration for static assets
- Database query optimization
- Caching strategies with Redis
- Lazy loading for frontend components

---

**Built with ❤️ for safer communities worldwide**

> *"In times of disaster, information is life. DediWarn ensures that critical information reaches those who need it most, when they need it most."*
