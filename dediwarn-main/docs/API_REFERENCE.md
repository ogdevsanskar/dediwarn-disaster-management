# 📋 API Reference

## Authentication

All API endpoints require authentication except for public health checks and basic information endpoints.

### Authentication Methods

1. **JWT Token Authentication** (Recommended for applications)
   ```http
   Authorization: Bearer <jwt_token>
   ```

2. **API Key Authentication** (For external integrations)
   ```http
   X-API-Key: <your_api_key>
   ```

## Base URL

- **Development**: `http://localhost:3001`
- **Production**: `https://your-production-domain.com`

## Response Format

All API responses follow a consistent format:

```json
{
  "success": true,
  "data": {},
  "message": "Success message",
  "timestamp": "2025-08-06T15:30:00.000Z"
}
```

Error responses:
```json
{
  "success": false,
  "error": "Error description",
  "code": "ERROR_CODE",
  "timestamp": "2025-08-06T15:30:00.000Z"
}
```

## Endpoints

### System Status

#### GET /api/status
Returns system health and service status.

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "uptime": 86400,
    "services": {
      "database": true,
      "weather_api": true,
      "earthquake_api": true,
      "sms_service": true,
      "email_service": true
    }
  }
}
```

### AI Assistant

#### POST /api/ai/chat
Interact with the AI disaster management assistant.

**Request Body:**
```json
{
  "message": "Is there earthquake activity in Delhi?",
  "location": "Delhi, India",
  "user_id": "user123" // Optional
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "response": "Based on real-time USGS data, there is currently low seismic activity in the Delhi region...",
    "intent": "earthquake",
    "location": "Delhi, India",
    "actions": [
      {
        "type": "sms",
        "label": "Send Earthquake Alert SMS",
        "data": "earthquake_alert"
      }
    ]
  }
}
```

### Emergency Reports

#### POST /api/emergency-reports
Submit an emergency incident report.

**Request Body:**
```json
{
  "type": "earthquake|flood|fire|storm|other",
  "location": {
    "lat": 28.6139,
    "lng": 77.2090,
    "address": "Central Delhi, India"
  },
  "severity": "low|medium|high|critical",
  "description": "Moderate shaking felt in the area",
  "reporter": {
    "name": "John Doe",
    "phone": "+91XXXXXXXXXX",
    "email": "john@example.com"
  },
  "timestamp": "2025-08-06T15:30:00.000Z"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "report_id": "ER_2025_001234",
    "status": "received",
    "priority": "medium"
  }
}
```

#### GET /api/emergency-reports
Retrieve emergency reports with filters.

**Query Parameters:**
- `type`: Filter by disaster type
- `location`: Filter by location (radius-based)
- `severity`: Filter by severity level
- `start_date`: Reports after this date
- `end_date`: Reports before this date
- `limit`: Number of results (default: 20)
- `offset`: Pagination offset

### Environmental Data

#### GET /api/environmental-data
Get current environmental monitoring data.

**Query Parameters:**
- `lat`: Latitude
- `lng`: Longitude
- `radius`: Search radius in kilometers (default: 50)
- `type`: Data type (air_quality|water_level|temperature|humidity)

**Response:**
```json
{
  "success": true,
  "data": {
    "location": {
      "lat": 28.6139,
      "lng": 77.2090
    },
    "measurements": [
      {
        "type": "air_quality",
        "value": 150,
        "unit": "AQI",
        "status": "moderate",
        "timestamp": "2025-08-06T15:30:00.000Z"
      }
    ]
  }
}
```

### Weather Alerts

#### GET /api/weather-alerts
Get weather-based disaster alerts.

**Query Parameters:**
- `location`: Location name or coordinates
- `type`: Alert type (severe_weather|storm|flood_risk)
- `active_only`: Show only active alerts (default: true)

**Response:**
```json
{
  "success": true,
  "data": {
    "alerts": [
      {
        "id": "WA_2025_001",
        "type": "severe_weather",
        "severity": "moderate",
        "title": "Thunderstorm Warning",
        "description": "Severe thunderstorms expected with heavy rainfall",
        "affected_areas": ["Delhi", "Noida", "Gurgaon"],
        "valid_from": "2025-08-06T16:00:00.000Z",
        "valid_until": "2025-08-06T22:00:00.000Z"
      }
    ]
  }
}
```

### Seismic Data

#### GET /api/seismic-data
Get real-time earthquake data.

**Query Parameters:**
- `lat`: Latitude (required)
- `lng`: Longitude (required)
- `radius`: Search radius in kilometers (default: 100)
- `min_magnitude`: Minimum earthquake magnitude (default: 2.5)
- `start_time`: Start time for data range
- `end_time`: End time for data range

**Response:**
```json
{
  "success": true,
  "data": {
    "query": {
      "lat": 28.6139,
      "lng": 77.2090,
      "radius": 100
    },
    "count": 3,
    "earthquakes": [
      {
        "id": "us7000abcd",
        "magnitude": 4.2,
        "location": "42km NE of Delhi, India",
        "coordinates": {
          "lat": 28.9,
          "lng": 77.5,
          "depth": 10
        },
        "time": "2025-08-06T14:20:15.000Z",
        "significance": 342,
        "alert": null,
        "url": "https://earthquake.usgs.gov/earthquakes/eventpage/us7000abcd"
      }
    ]
  }
}
```

### Notification Services

#### POST /api/send-sms
Send SMS notification.

**Request Body:**
```json
{
  "to": "+91XXXXXXXXXX",
  "message": "Emergency alert: Earthquake detected in your area. Stay safe!",
  "type": "emergency|alert|reminder",
  "priority": "low|medium|high|critical"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message_id": "SMS_2025_001234",
    "status": "sent",
    "delivery_status": "pending"
  }
}
```

#### POST /api/send-email
Send email notification.

**Request Body:**
```json
{
  "to": "user@example.com",
  "subject": "Emergency Alert - Earthquake Detected",
  "message": "Emergency alert details...",
  "type": "emergency|alert|reminder",
  "html": "<h1>Emergency Alert</h1><p>Details...</p>" // Optional HTML content
}
```

## WebSocket Events

### Connection
```javascript
const socket = io('http://localhost:3001');
```

### Client to Server Events

#### join_location
Join a location-based room for targeted updates.
```javascript
socket.emit('join_location', {
  lat: 28.6139,
  lng: 77.2090,
  radius: 50 // km
});
```

#### emergency_report
Report an emergency incident.
```javascript
socket.emit('emergency_report', {
  type: 'earthquake',
  location: { lat: 28.6139, lng: 77.2090 },
  severity: 'moderate',
  description: 'Shaking felt'
});
```

### Server to Client Events

#### emergency_alert
Receive emergency alerts for your location.
```javascript
socket.on('emergency_alert', (data) => {
  console.log('Emergency alert received:', data);
});
```

#### weather_update
Receive weather condition updates.
```javascript
socket.on('weather_update', (data) => {
  console.log('Weather update:', data);
});
```

#### seismic_activity
Receive earthquake notifications.
```javascript
socket.on('seismic_activity', (data) => {
  console.log('Seismic activity detected:', data);
});
```

## Error Codes

| Code | Description |
|------|-------------|
| INVALID_REQUEST | Malformed request data |
| UNAUTHORIZED | Authentication required |
| FORBIDDEN | Insufficient permissions |
| NOT_FOUND | Resource not found |
| RATE_LIMITED | Too many requests |
| SERVICE_UNAVAILABLE | External service error |
| INTERNAL_ERROR | Server error |

## Rate Limits

- **General API**: 1000 requests per hour per IP
- **AI Assistant**: 100 requests per hour per user
- **SMS Notifications**: 10 SMS per hour per phone number
- **Emergency Reports**: 5 reports per hour per user

## SDKs and Libraries

### JavaScript/TypeScript
```bash
npm install dediwarn-js-sdk
```

### Python
```bash
pip install dediwarn-python-sdk
```

### Usage Example
```javascript
import { DediWarnAPI } from 'dediwarn-js-sdk';

const api = new DediWarnAPI({
  apiKey: 'your-api-key',
  baseUrl: 'https://api.dediwarn.com'
});

// Get earthquake data
const earthquakes = await api.getSeismicData({
  lat: 28.6139,
  lng: 77.2090,
  radius: 100
});

// Send emergency alert
await api.sendSMS({
  to: '+91XXXXXXXXXX',
  message: 'Emergency alert message',
  type: 'emergency'
});
```
