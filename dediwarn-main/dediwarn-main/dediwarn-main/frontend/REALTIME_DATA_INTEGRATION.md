# Real-Time Data Integration Documentation

## Overview

The DeDiWARN system now includes comprehensive real-time data integration with multiple emergency APIs to provide live situational awareness during emergency calls and general system usage.

## Integrated Data Sources

### 1. USGS Earthquake API
- **Source**: United States Geological Survey
- **Data**: Real-time earthquake information worldwide
- **Frequency**: Updates every 5 minutes
- **Features**:
  - Earthquake magnitude, location, and depth
  - Tsunami alerts
  - Color-coded alert levels (green, yellow, orange, red)
  - Historical data up to 30 days
  - Location-based filtering

### 2. National Weather Service API
- **Source**: NOAA National Weather Service
- **Data**: Weather alerts and warnings
- **Frequency**: Updates every 10 minutes
- **Features**:
  - Severe weather alerts
  - Hurricane/tornado warnings
  - Flood alerts
  - Winter weather advisories
  - Location-based alerts

### 3. Traffic/Road Closure API
- **Source**: HERE Traffic API
- **Data**: Real-time traffic incidents
- **Frequency**: Updates every 2 minutes
- **Features**:
  - Traffic accidents
  - Road closures
  - Construction zones
  - Hazardous conditions
  - Lane closures and detours
  - Emergency services on scene indicators

### 4. Hospital Capacity API
- **Source**: Custom hospital management integration
- **Data**: Hospital bed availability and emergency capacity
- **Frequency**: Updates every 15 minutes
- **Features**:
  - Total bed capacity
  - Available beds (general, ICU, emergency)
  - Current wait times
  - Ambulance diversion status
  - Trauma center levels
  - Hospital specialties

## Implementation Architecture

### Frontend Components

#### 1. RealTimeDataService (`src/services/realTimeDataService.ts`)
- **Purpose**: Core service for fetching and managing real-time data
- **Features**:
  - WebSocket connections for live updates
  - Intelligent caching with TTL
  - Rate limiting and error handling
  - Subscription-based data distribution
  - Location-based filtering

#### 2. useRealTimeData Hook (`src/hooks/useRealTimeData.ts`)
- **Purpose**: React hook for consuming real-time data
- **Features**:
  - Automatic data fetching and refresh
  - Loading and error state management
  - High-priority alert filtering
  - Statistics calculation
  - Configurable data types and refresh intervals

#### 3. RealTimeDataDisplay Component (`src/components/RealTimeDataDisplay.tsx`)
- **Purpose**: UI component for displaying real-time emergency data
- **Features**:
  - Tabbed interface (Alerts, Earthquakes, Weather, Traffic, Hospitals)
  - Real-time status indicators
  - Priority-based alert highlighting
  - Interactive maps integration
  - Minimizable for in-call use

### Backend API (`src/api/realTimeDataAPI.ts`)
- **Purpose**: Backend endpoints and WebSocket management
- **Features**:
  - Rate-limited API endpoints
  - Caching layer for performance
  - Emergency bypass for critical situations
  - WebSocket real-time broadcasting
  - Mock data fallbacks

## Configuration

### Environment Variables
```bash
# Traffic Data
REACT_APP_HERE_TRAFFIC_API_KEY=your_here_api_key_here

# Hospital Data
REACT_APP_HOSPITAL_API_KEY=your_hospital_api_key_here

# Maps Integration
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

# Real-time Updates
REACT_APP_WEBSOCKET_URL=ws://localhost:3001
REACT_APP_API_URL=http://localhost:3001
```

### Feature Flags
```bash
REACT_APP_EARTHQUAKE_ALERTS=true
REACT_APP_WEATHER_ALERTS=true
REACT_APP_TRAFFIC_INCIDENTS=true
REACT_APP_HOSPITAL_CAPACITY=true
REACT_APP_VOLUNTEER_ALERTS=true
```

## Usage Examples

### Basic Usage in Components
```tsx
import { useRealTimeData } from '../hooks/useRealTimeData';

const EmergencyComponent = () => {
  const {
    earthquakes,
    weatherAlerts,
    trafficIncidents,
    hospitalCapacity,
    loading,
    error,
    getHighPriorityAlerts,
    refresh
  } = useRealTimeData({
    location: { lat: 37.7749, lng: -122.4194, radius: 50 },
    autoRefresh: true,
    refreshInterval: 120000,
    dataTypes: ['earthquakes', 'weather', 'traffic', 'hospitals']
  });

  const highPriorityAlerts = getHighPriorityAlerts();

  return (
    <div>
      {highPriorityAlerts.map(alert => (
        <AlertCard key={alert.id} alert={alert} />
      ))}
    </div>
  );
};
```

### VideoCall Integration
```tsx
import RealTimeDataDisplay from './RealTimeDataDisplay';

const VideoCallSystem = ({ userLocation }) => {
  const [showRealTimeData, setShowRealTimeData] = useState(true);
  
  return (
    <div>
      {/* Video call interface */}
      
      {showRealTimeData && (
        <RealTimeDataDisplay
          userLocation={userLocation}
          showInCall={isCallActive}
          isMinimized={realTimeDataMinimized}
        />
      )}
    </div>
  );
};
```

## Data Flow

1. **Initial Load**: Component mounts → useRealTimeData hook → RealTimeDataService
2. **Data Fetching**: Service checks cache → Makes API calls → Updates cache → Notifies subscribers
3. **Real-time Updates**: WebSocket receives updates → Service processes → Notifies components
4. **UI Updates**: Components receive data → Re-render with new information
5. **User Interaction**: Manual refresh → Priority filtering → Location updates

## API Endpoints

### GET `/api/earthquakes`
- Query params: `lat`, `lng`, `radius`, `minMagnitude`, `timeRange`
- Returns: Array of earthquake data

### GET `/api/weather-alerts`
- Query params: `lat`, `lng`
- Returns: Array of weather alerts

### GET `/api/traffic-incidents`
- Query params: `lat`, `lng`, `radius`
- Returns: Array of traffic incidents

### GET `/api/hospitals/capacity`
- Query params: `lat`, `lng`, `radius`
- Returns: Array of hospital capacity data

### POST `/api/send-emergency-message`
- Body: `{ phone, message, priority }`
- Returns: Message delivery status

### POST `/api/alert-volunteers`
- Body: `{ location, emergencyType, userProfile }`
- Returns: Volunteer notification status

## Security Features

### Rate Limiting
- Standard API calls: 100 requests per 15 minutes per IP
- Emergency calls: 20 requests per 5 minutes per IP
- Bypass available for critical emergencies

### Data Validation
- Input sanitization for all user data
- Location boundary validation
- Phone number format validation
- Emergency type whitelisting

### Privacy Protection
- No personal data stored in API logs
- Emergency recordings encrypted at rest
- Location data anonymized after resolution
- GDPR compliance for international users

## Performance Optimizations

### Caching Strategy
- **Earthquakes**: 5-minute TTL
- **Weather**: 10-minute TTL
- **Traffic**: 2-minute TTL
- **Hospitals**: 15-minute TTL

### WebSocket Efficiency
- Connection pooling
- Selective subscriptions based on location
- Automatic reconnection with exponential backoff
- Compression for large data payloads

### Resource Management
- Lazy loading of non-critical data
- Debounced location updates
- Paginated results for large datasets
- Background refresh during idle periods

## Testing

### Unit Tests
```bash
npm test -- --testPathPattern="realTime"
```

### Integration Tests
```bash
npm run test:integration
```

### Load Testing
```bash
npm run test:load
```

## Monitoring and Analytics

### Metrics Tracked
- API response times
- Cache hit rates
- WebSocket connection stability
- Error rates by endpoint
- Emergency response times

### Health Checks
- `/health/api` - API endpoint status
- `/health/websocket` - WebSocket server status
- `/health/external` - External API availability

## Troubleshooting

### Common Issues

1. **No Real-time Updates**
   - Check WebSocket connection
   - Verify environment variables
   - Check network connectivity

2. **High API Error Rates**
   - Verify API keys
   - Check rate limiting
   - Review external service status

3. **Poor Performance**
   - Check cache configuration
   - Monitor memory usage
   - Review database queries

### Debug Mode
```bash
# Enable debug logging
REACT_APP_DEBUG_REALTIME=true npm start
```

## Future Enhancements

### Planned Features
- **Wildfire Tracking**: Integration with NASA FIRMS API
- **Air Quality**: EPA AirNow API integration
- **Social Media**: Twitter/X emergency feeds
- **Satellite Imagery**: Real-time disaster imagery
- **International APIs**: Global emergency service integration

### Scalability Improvements
- Redis caching layer
- CDN for static emergency data
- Geographic load balancing
- Database sharding for emergency logs

## Contributing

### Adding New Data Sources
1. Add interface definitions to `realTimeDataService.ts`
2. Implement fetch function with error handling
3. Add WebSocket subscription handling
4. Create UI components for data display
5. Add configuration options
6. Write tests and documentation

### API Key Management
- Never commit API keys to version control
- Use environment variables for all credentials
- Implement key rotation procedures
- Monitor API usage quotas

## Support

For technical support with real-time data integration:
- Check the troubleshooting guide above
- Review API logs in the developer console
- Verify all environment variables are set
- Test individual API endpoints using the debug mode

Emergency data integration is critical for life-safety applications. Always test thoroughly and have fallback procedures in place.
