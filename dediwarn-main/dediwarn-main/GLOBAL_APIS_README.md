# Global Environmental APIs Integration

This project integrates 4 major global environmental APIs into the ClimaAid disaster management platform:

## 🌍 Integrated APIs

### 1. NASA FIRMS (Fire Information for Resource Management System)
- **Purpose**: Real-time fire detection and monitoring
- **Data**: Active fire locations, thermal anomalies, fire radiative power
- **Regions**: Global coverage with 1km resolution
- **Update Frequency**: Near real-time (3-6 hours)
- **Setup**: Get API key from [NASA FIRMS](https://firms.modaps.eosdis.nasa.gov/api/)

### 2. GDACS (Global Disaster Alert and Coordination System)
- **Purpose**: Disaster alerts and coordination information
- **Data**: Earthquakes, tropical cyclones, floods, volcanic eruptions
- **Regions**: Global coverage
- **Update Frequency**: Real-time alerts
- **Setup**: No API key required (free public API)

### 3. OpenWeatherMap
- **Purpose**: Current weather conditions and alerts
- **Data**: Temperature, humidity, wind, precipitation, air quality
- **Regions**: Global coverage
- **Update Frequency**: Real-time updates
- **Setup**: Get API key from [OpenWeatherMap](https://openweathermap.org/api)

### 4. NASA EONET (Earth Observatory Natural Event Tracker)
- **Purpose**: Natural disaster and environmental event tracking
- **Data**: Wildfires, severe storms, volcanoes, sea/lake ice, drought
- **Regions**: Global coverage
- **Update Frequency**: Daily updates
- **Setup**: No API key required (free public API)

## 🚀 Quick Start

### 1. Environment Setup
```bash
# Copy environment template
cp env.example .env

# Add your API keys to .env file
FIRMS_API_KEY=your_nasa_firms_api_key
OPENWEATHER_API_KEY=your_openweathermap_api_key
```

### 2. Install Dependencies
```bash
# Frontend dependencies
cd frontend
npm install

# Backend dependencies
cd ../backend
npm install
```

### 3. Start Services
```bash
# Start backend (Terminal 1)
cd backend
npm run dev

# Start frontend (Terminal 2)  
cd frontend
npm run dev
```

### 4. Access Global Hub
1. Open http://localhost:5173
2. Navigate to Enhanced Dashboard
3. Click on "Global Hub" tab
4. View real-time environmental data

## 🎯 Features

### Real-Time Dashboard
- **Live Fire Monitoring**: See active fires worldwide with confidence levels
- **Disaster Alerts**: Get immediate notifications for natural disasters
- **Weather Integration**: Current conditions and severe weather warnings
- **Natural Events**: Track ongoing environmental events globally

### Interactive Controls
- **Region Selection**: Focus on specific geographical areas
- **Auto-Refresh**: Configurable data update intervals (30s - 5min)
- **Data Filtering**: Filter by event type, severity, and date range
- **Export Options**: Download data for offline analysis

### Data Visualization
- **Summary Cards**: Quick overview of current conditions
- **Event Lists**: Detailed information for each event/alert
- **Geographic Mapping**: Visual representation on interactive maps
- **Trend Analysis**: Historical data patterns and forecasts

## 🔧 Technical Implementation

### Service Layer (`GlobalEnvironmentalDataService.ts`)
```typescript
// Unified API access with error handling
const data = await fetchGlobalEnvironmentalData('North America');

// Individual API functions available
const fires = await fetchFIRMSFires('US');
const alerts = await fetchGDACSAlerts();
const weather = await fetchWeatherData(lat, lon);
const events = await fetchEONETEvents();
```

### Component Integration (`GlobalEnvironmentalHub.tsx`)
- React component with TypeScript
- Framer Motion animations
- Real-time data updates
- Responsive design with Tailwind CSS
- Accessibility features included

### Dashboard Integration (`EnhancedDashboard.tsx`)
- Seamless integration with existing features
- Tab-based navigation
- Consistent UI/UX with platform theme
- Mobile-responsive layout

## 📊 Data Flow

```
External APIs → Service Layer → React Component → Dashboard UI
     ↓              ↓              ↓              ↓
Real-time     Error Handling   State Management  User Interface
   Data       & Caching        & Updates         & Interactions
```

## 🛡️ Error Handling

- **API Failures**: Automatic fallback to mock data
- **Rate Limiting**: Built-in request throttling
- **Network Issues**: Graceful degradation and retry logic
- **Data Validation**: TypeScript interfaces ensure data integrity

## 🔄 Mock Data

For development and testing, the system includes comprehensive mock data:
- Sample fire locations with realistic coordinates
- Mock disaster alerts with various severity levels
- Simulated weather conditions for different regions
- Generated natural events for testing UI components

## 🚀 Deployment Notes

1. **API Keys**: Ensure all required API keys are set in production environment
2. **Rate Limits**: Monitor API usage to stay within free tier limits
3. **Caching**: Consider implementing Redis cache for production
4. **Security**: Use environment variables for sensitive data
5. **Monitoring**: Set up logging and alerting for API failures

## 📝 API Documentation

### NASA FIRMS
- Documentation: https://firms.modaps.eosdis.nasa.gov/api/
- Rate Limit: 1000 requests/day (free tier)
- Data Format: CSV/JSON

### GDACS
- Documentation: https://www.gdacs.org/knowledge-base/learn_gdacs_xml.aspx
- Rate Limit: No explicit limits
- Data Format: XML/RSS

### OpenWeatherMap
- Documentation: https://openweathermap.org/api
- Rate Limit: 1000 calls/day (free tier)
- Data Format: JSON

### NASA EONET
- Documentation: https://eonet.gsfc.nasa.gov/docs/v3
- Rate Limit: No explicit limits
- Data Format: JSON

## 🤝 Contributing

When adding new environmental APIs:
1. Add TypeScript interfaces to `GlobalEnvironmentalDataService.ts`
2. Implement API fetch function with error handling
3. Add mock data for development/testing
4. Update the dashboard component to display new data
5. Update this README with API documentation

## 📧 Support

For issues with:
- **API Integration**: Check API keys and rate limits
- **Data Display**: Verify component props and TypeScript types
- **Real-time Updates**: Check useEffect dependencies and timers
- **Styling**: Review Tailwind classes and responsive design

## 🎉 Success!

Your ClimaAid platform now has comprehensive global environmental monitoring capabilities with real-time data from 4 major APIs. The Global Hub provides a unified interface for tracking fires, disasters, weather, and natural events worldwide.
