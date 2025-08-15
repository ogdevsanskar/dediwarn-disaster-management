import * as express from 'express';
import * as cors from 'cors';
import * as dotenv from 'dotenv';
import axios from 'axios';

// Type definitions for earthquake data
interface EarthquakeFeature {
  id: string;
  geometry: {
    coordinates: [number, number, number]; // [longitude, latitude, depth]
  };
  properties: {
    mag: number;
    place: string;
    time: number;
    url: string;
  };
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

interface EarthquakeData {
  id: string;
  magnitude: number;
  location: string;
  time: string;
  coordinates: { lat: number; lon: number };
  severity: string;
  recommendation: string;
  url: string;
}

interface WeatherData {
  location: { name: string };
  current: {
    temperature: number;
    windSpeed: number;
    humidity: number;
    description: string;
  };
  disaster_assessment: {
    risk_level: string;
    warnings: string[];
    recommendations: string[];
  };
}

interface FloodAlert {
  location: string;
  severity: string;
  description: string;
  issued_at: string;
  recommendations: string[];
}

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173', 
    'http://localhost:3000', 
    'http://localhost:4173',
    'https://disaster-management-frontend.onrender.com',
    process.env.FRONTEND_URL
  ].filter((origin): origin is string => typeof origin === 'string'),
  credentials: true
}));
app.use(express.json());

// Environment variables
const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY || 'demo_key';
const USGS_EARTHQUAKE_API = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_hour.geojson';

// Health check endpoint
app.get('/api/status', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    services: {
      weather: !!OPENWEATHER_API_KEY,
      earthquake: true,
      disaster_alerts: true
    }
  });
});

// Real-time earthquake data
app.get('/api/disasters/earthquakes', async (req, res) => {
  try {
    const { lat, lon, radius = 100 } = req.query;
    
    // Fetch from USGS
    const response = await axios.get(USGS_EARTHQUAKE_API);
    let earthquakes = response.data.features;
    
    // Filter by location if provided
    if (lat && lon) {
      earthquakes = earthquakes.filter((quake: EarthquakeFeature) => {
        const [quakeLon, quakeLat] = quake.geometry.coordinates;
        const distance = calculateDistance(
          parseFloat(lat as string), 
          parseFloat(lon as string), 
          quakeLat, 
          quakeLon
        );
        return distance <= parseFloat(radius as string);
      });
    }
    
    // Process and format data
    const processedEarthquakes = earthquakes.slice(0, 10).map((quake: EarthquakeFeature) => {
      const magnitude = quake.properties.mag;
      const location = quake.properties.place;
      const time = new Date(quake.properties.time);
      const [lon, lat] = quake.geometry.coordinates;
      
      let severity = 'Low';
      let recommendation = 'Stay alert and monitor updates.';
      
      if (magnitude >= 7.0) {
        severity = 'Extreme';
        recommendation = 'Immediate evacuation! Take cover and move to safe areas.';
      } else if (magnitude >= 6.0) {
        severity = 'High';
        recommendation = 'Prepare for evacuation. Stay away from buildings.';
      } else if (magnitude >= 4.0) {
        severity = 'Moderate';
        recommendation = 'Be cautious. Check for damages and stay informed.';
      }
      
      return {
        id: quake.id,
        magnitude,
        location,
        time: time.toISOString(),
        coordinates: { lat, lon },
        severity,
        recommendation,
        url: quake.properties.url
      };
    });
    
    res.json({
      success: true,
      data: processedEarthquakes,
      count: processedEarthquakes.length,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Earthquake API error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch earthquake data',
      timestamp: new Date().toISOString()
    });
  }
});

// Real-time weather data
app.get('/api/disasters/weather', async (req, res) => {
  try {
    const { city, lat, lon } = req.query;
    
    let weatherUrl = '';
    if (lat && lon) {
      weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`;
    } else if (city) {
      weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${OPENWEATHER_API_KEY}&units=metric`;
    } else {
      return res.status(400).json({ 
        success: false, 
        error: 'Please provide either city name or coordinates (lat, lon)' 
      });
    }
    
    const response = await axios.get(weatherUrl);
    const data = response.data;
    
    // Assess disaster risk based on weather conditions
    const windSpeed = data.wind?.speed || 0;
    const temperature = data.main.temp;
    const humidity = data.main.humidity;
    const weather = data.weather[0];
    
    let disasterRisk = 'Low';
    const warnings: string[] = [];
    const recommendations: string[] = [];
    
    // Wind-based warnings
    if (windSpeed > 32) { // > 115 km/h
      disasterRisk = 'Extreme';
      warnings.push('Hurricane/Cyclone conditions');
      recommendations.push('Immediate shelter! Stay indoors and away from windows.');
    } else if (windSpeed > 17) { // > 60 km/h
      disasterRisk = 'High';
      warnings.push('High wind warning');
      recommendations.push('Avoid outdoor activities and secure loose objects.');
    }
    
    // Temperature-based warnings
    if (temperature > 40) {
      warnings.push('Extreme heat warning');
      recommendations.push('Stay hydrated and avoid outdoor exposure.');
    } else if (temperature < -10) {
      warnings.push('Extreme cold warning');
      recommendations.push('Dress warmly and limit outdoor exposure.');
    }
    
    // Weather condition warnings
    if (weather.main.includes('Thunderstorm')) {
      warnings.push('Thunderstorm alert');
      recommendations.push('Stay indoors and avoid electrical appliances.');
    }
    
    if (weather.main.includes('Rain') && humidity > 90) {
      warnings.push('Flood risk');
      recommendations.push('Avoid low-lying areas and monitor water levels.');
    }
    
    res.json({
      success: true,
      data: {
        location: {
          name: data.name,
          country: data.sys.country,
          coordinates: { lat: data.coord.lat, lon: data.coord.lon }
        },
        current: {
          temperature,
          humidity,
          windSpeed,
          description: weather.description,
          icon: weather.icon
        },
        disaster_assessment: {
          risk_level: disasterRisk,
          warnings,
          recommendations
        }
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Weather API error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch weather data',
      timestamp: new Date().toISOString()
    });
  }
});

// Disaster alerts endpoint
app.get('/api/disasters/alerts', async (req, res) => {
  try {
    const { location, type } = req.query;
    
    // Simulate real-time alerts (in production, this would fetch from emergency services APIs)
    const alerts = [
      {
        id: 'alert_001',
        type: 'flood',
        severity: 'moderate',
        location: 'Assam, India',
        description: 'Rising water levels in Brahmaputra river',
        issued_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        recommendations: [
          'Move to higher ground',
          'Avoid crossing flooded roads',
          'Keep emergency supplies ready'
        ]
      },
      {
        id: 'alert_002',
        type: 'earthquake',
        severity: 'low',
        location: 'Delhi, India',
        description: 'Minor seismic activity detected',
        issued_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        expires_at: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
        recommendations: [
          'Check for structural damages',
          'Be prepared for aftershocks',
          'Keep emergency kit accessible'
        ]
      }
    ];
    
    // Filter by location or type if provided
    let filteredAlerts = alerts;
    if (location) {
      filteredAlerts = alerts.filter(alert => 
        alert.location.toLowerCase().includes((location as string).toLowerCase())
      );
    }
    if (type) {
      filteredAlerts = filteredAlerts.filter(alert => alert.type === type);
    }
    
    res.json({
      success: true,
      data: filteredAlerts,
      count: filteredAlerts.length,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Alerts API error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch alerts',
      timestamp: new Date().toISOString()
    });
  }
});

// AI Chat endpoint for real-time disaster analysis
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { message, location } = req.body;
    
    // Parse message to determine intent
    const intent = determineIntent(message);
    let response = '';
    
    switch (intent.type) {
      case 'earthquake': {
        const earthquakeData = await getEarthquakeData(intent.location || location);
        response = formatEarthquakeResponse(earthquakeData, intent.location || location);
        break;
      }
        
      case 'weather': {
        const weatherData = await getWeatherData(intent.location || location);
        response = formatWeatherResponse(weatherData, intent.location || location);
        break;
      }
        
      case 'flood': {
        const floodAlerts = await getFloodAlerts(intent.location || location);
        response = formatFloodResponse(floodAlerts, intent.location || location);
        break;
      }
        
      default:
        response = generateGeneralDisasterResponse(message);
    }
    
    res.json({
      success: true,
      response,
      intent: intent.type,
      location: intent.location || location,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('AI Chat error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to process AI request',
      timestamp: new Date().toISOString()
    });
  }
});

// Helper functions
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function determineIntent(message: string) {
  const lowerMessage = message.toLowerCase();
  
  // Extract location mentions
  const locationRegex = /(in|at|near)\s+([a-zA-Z\s]+)/i;
  const locationMatch = message.match(locationRegex);
  const location = locationMatch ? locationMatch[2].trim() : null;
  
  if (lowerMessage.includes('earthquake') || lowerMessage.includes('quake') || lowerMessage.includes('seismic')) {
    return { type: 'earthquake', location };
  }
  if (lowerMessage.includes('weather') || lowerMessage.includes('storm') || lowerMessage.includes('rain') || lowerMessage.includes('wind')) {
    return { type: 'weather', location };
  }
  if (lowerMessage.includes('flood') || lowerMessage.includes('water') || lowerMessage.includes('river')) {
    return { type: 'flood', location };
  }
  
  return { type: 'general', location };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function getEarthquakeData(_location: string) {
  try {
    const response = await axios.get(`http://localhost:${PORT}/api/disasters/earthquakes`);
    return response.data;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_error) {
    return { success: false, data: [] };
  }
}

async function getWeatherData(location: string) {
  try {
    const response = await axios.get(`http://localhost:${PORT}/api/disasters/weather?city=${location}`);
    return response.data;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_error) {
    return { success: false, data: {} };
  }
}

async function getFloodAlerts(location: string) {
  try {
    const response = await axios.get(`http://localhost:${PORT}/api/disasters/alerts?type=flood&location=${location}`);
    return response.data;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_error) {
    return { success: false, data: [] };
  }
}

function formatEarthquakeResponse(data: ApiResponse<EarthquakeData[]>, location: string): string {
  if (!data.success || data.data.length === 0) {
    return `No significant earthquake activity detected in ${location || 'your area'} recently. Current seismic conditions appear stable. I recommend staying informed through official channels and having an emergency kit ready.`;
  }
  
  const earthquake = data.data[0];
  return `🚨 EARTHQUAKE ALERT for ${location || 'your area'}:

📍 Location: ${earthquake.location}
📊 Magnitude: ${earthquake.magnitude}
⚠️ Severity: ${earthquake.severity}
🕐 Time: ${new Date(earthquake.time).toLocaleString()}

🔸 IMMEDIATE ACTION: ${earthquake.recommendation}

Stay safe and monitor official emergency channels for updates.`;
}

function formatWeatherResponse(data: ApiResponse<WeatherData>, location: string): string {
  if (!data.success) {
    return `Unable to fetch current weather data for ${location}. Please check the location name and try again.`;
  }
  
  const weather = data.data;
  let response = `🌤️ WEATHER ANALYSIS for ${weather.location.name}:

🌡️ Temperature: ${weather.current.temperature}°C
💨 Wind Speed: ${weather.current.windSpeed} m/s
💧 Humidity: ${weather.current.humidity}%
☁️ Conditions: ${weather.current.description}

⚠️ DISASTER RISK LEVEL: ${weather.disaster_assessment.risk_level}`;

  if (weather.disaster_assessment.warnings.length > 0) {
    response += `\n\n🚨 ACTIVE WARNINGS:`;
    weather.disaster_assessment.warnings.forEach((warning: string) => {
      response += `\n• ${warning}`;
    });
  }
  
  if (weather.disaster_assessment.recommendations.length > 0) {
    response += `\n\n💡 RECOMMENDATIONS:`;
    weather.disaster_assessment.recommendations.forEach((rec: string) => {
      response += `\n• ${rec}`;
    });
  }
  
  return response;
}

function formatFloodResponse(data: ApiResponse<FloodAlert[]>, location: string): string {
  if (!data.success || data.data.length === 0) {
    return `No active flood alerts for ${location}. Current flood risk appears low. Continue monitoring weather conditions and water levels.`;
  }
  
  const alert = data.data[0];
  return `🌊 FLOOD ALERT for ${location}:

📍 Affected Area: ${alert.location}
⚠️ Severity: ${alert.severity.toUpperCase()}
📝 Details: ${alert.description}
🕐 Issued: ${new Date(alert.issued_at).toLocaleString()}

🔸 SAFETY MEASURES:
${alert.recommendations.map((rec: string) => `• ${rec}`).join('\n')}

Stay vigilant and follow local emergency instructions.`;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function generateGeneralDisasterResponse(_message: string): string {
  return `Thank you for your question. I'm equipped to provide real-time disaster information including:

🌍 Earthquake monitoring and analysis
🌤️ Weather-based disaster risk assessment  
🌊 Flood alerts and water level monitoring
⚠️ Emergency response guidance

Please ask me specific questions like:
• "Is there any earthquake activity in Delhi?"
• "What's the current flood risk in Assam?"
• "Show me weather alerts for Mumbai"

I'll provide real-time data and safety recommendations based on current conditions.`;
}

app.listen(PORT, () => {
  console.log(`🚀 Disaster Management API Server running on port ${PORT}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/api/status`);
  console.log(`🤖 AI Chat: http://localhost:${PORT}/api/ai/chat`);
});

export default app;
