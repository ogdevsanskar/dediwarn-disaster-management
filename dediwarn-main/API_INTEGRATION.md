# 🌐 Real-Time Disaster API Integration

This document explains how the disaster management system integrates with real-world APIs to fetch live disaster data.

## 📡 Integrated APIs

### 1. USGS Earthquake API
- **URL**: `https://earthquake.usgs.gov/fdsnws/event/1/query`
- **Purpose**: Fetch real-time earthquake data worldwide
- **Authentication**: No API key required (free and open)
- **Data**: Magnitude 4.5+ earthquakes from the last 7 days
- **Update Frequency**: Every 5 minutes

#### Example USGS URL:
```
https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=2025-08-05&minmagnitude=4.5
```

### 2. OpenWeatherMap API
- **URL**: `https://api.openweathermap.org/data/2.5/weather`
- **Purpose**: Fetch weather data for disaster prediction
- **Authentication**: Requires free API key
- **Data**: Current weather conditions, extreme weather alerts
- **Update Frequency**: Every 5 minutes

#### Example OpenWeatherMap URL:
```
https://api.openweathermap.org/data/2.5/weather?q=Delhi&appid=YOUR_API_KEY&units=metric
```

## 🔧 Setup Instructions

### 1. Get OpenWeatherMap API Key (Free)
1. Visit [OpenWeatherMap](https://openweathermap.org/api)
2. Sign up for a free account
3. Generate an API key
4. Copy the API key

### 2. Configure Environment Variables
1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` file and add your API key:
   ```env
   VITE_OPENWEATHER_API_KEY=your_actual_api_key_here
   ```

3. Restart the development server:
   ```bash
   npm run dev
   ```

## 📊 Data Processing

### Earthquake Data Processing
- **Severity Mapping**:
  - Magnitude 7.0+: Critical
  - Magnitude 6.0-6.9: High
  - Magnitude 5.0-5.9: Medium
  - Magnitude 4.5-4.9: Low

- **Evacuation Requirements**: Triggered for magnitude 6.0+ or red alerts
- **Affected Area**: Calculated as magnitude² × 10 km²

### Weather Data Processing
- **Heat Wave Detection**: Temperature > 40°C
- **Storm Detection**: Wind speed > 20 m/s
- **Flood Risk**: Keywords like "heavy rain", "thunderstorm"

## 🔄 Auto-Refresh System

The system automatically refreshes data every 5 minutes to ensure real-time updates:

```typescript
// Auto-refresh every 5 minutes
const interval = setInterval(loadDisasterData, 5 * 60 * 1000);
```

## 🛡️ Error Handling

### API Fallback System
If APIs are unavailable, the system:
1. Shows "API Unavailable" status
2. Falls back to demo data
3. Continues to retry connections
4. Displays clear error messages

### Connection Status Indicators
- 🟢 **Connected**: Live APIs working
- 🔴 **Offline**: APIs unavailable
- 🟡 **Connecting**: Checking API status

## 📱 Manual Refresh

Users can manually refresh data using the refresh button in the Live Statistics panel.

## 🌍 Monitored Cities

Default cities monitored for weather-related disasters:
- Delhi, India
- Mumbai, India
- Chennai, India
- Kolkata, India
- Bangalore, India
- Hyderabad, India
- Pune, India
- Ahmedabad, India

## 🔍 Data Sources Verification

### USGS Earthquake Data
- Official US Geological Survey data
- Updated in real-time
- Global coverage
- High accuracy and reliability

### OpenWeatherMap Weather Data
- Professional weather service
- Current conditions and forecasts
- Used by major applications worldwide
- Reliable and accurate data

## 🚨 Emergency Response Features

### Real-time Alerts
- Critical earthquakes (magnitude 7.0+)
- Extreme weather conditions
- Evacuation zone notifications

### Navigation Integration
- Direct navigation to disaster locations
- Emergency response routing
- Satellite imagery for assessment

## 📈 Performance Optimization

### Data Caching
- 5-minute cache for API responses
- Reduces API calls
- Improves performance

### Error Recovery
- Automatic retry mechanism
- Graceful degradation
- User-friendly error messages

## 🔐 Security & Privacy

### API Key Protection
- Environment variables for sensitive data
- No hardcoded credentials
- Secure configuration

### Data Handling
- No personal data collection
- Public disaster information only
- GDPR compliant

## 🛠️ Development Notes

### Testing APIs
You can test the APIs directly:

1. **Test USGS API** (no key required):
   ```bash
   curl "https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=2025-08-05&minmagnitude=4.5"
   ```

2. **Test OpenWeatherMap API** (requires key):
   ```bash
   curl "https://api.openweathermap.org/data/2.5/weather?q=Delhi&appid=YOUR_API_KEY&units=metric"
   ```

### Debugging
- Check browser console for API errors
- Verify API key configuration
- Test network connectivity
- Review API response formats

## 📚 Further Reading

- [USGS Earthquake API Documentation](https://earthquake.usgs.gov/fdsnws/event/1/)
- [OpenWeatherMap API Documentation](https://openweathermap.org/api)
- [React Hooks for API Integration](https://reactjs.org/docs/hooks-state.html)

---

## 🆘 Troubleshooting

### Common Issues

**API Key Not Working**
- Verify API key is correct
- Check if key is activated (may take a few minutes)
- Ensure environment variables are loaded

**No Earthquake Data**
- USGS API may be temporarily unavailable
- Check network connectivity
- Verify API URL format

**Weather Data Not Loading**
- Check OpenWeatherMap API key
- Verify city names are correct
- Check API quota limits

**Development Server Issues**
- Restart development server after .env changes
- Clear browser cache
- Check for TypeScript errors
