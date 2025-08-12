import * as express from 'express';
import { Request, Response } from 'express';
import axios from 'axios';
import rateLimit from 'express-rate-limit';
import { Server } from 'socket.io';

// Type definitions for API responses
interface EarthquakeFeature {
  properties: {
    mag: number;
    place: string;
    time: number;
    updated: number;
    tz: number;
    url: string;
    detail: string;
    felt: number;
    cdi: number;
    mmi: number;
    alert: string;
    status: string;
    tsunami: number;
    sig: number;
    net: string;
    code: string;
    ids: string;
    sources: string;
    types: string;
    nst: number;
    dmin: number;
    rms: number;
    gap: number;
    magType: string;
    type: string;
    title: string;
  };
  geometry: {
    type: string;
    coordinates: [number, number, number];
  };
  id: string;
}

interface WeatherAlertFeature {
  properties: {
    id: string;
    event: string;
    description: string;
    severity?: string;
    certainty?: string;
    urgency?: string;
    headline: string;
    areaDesc?: string;
    effective: string;
    expires: string;
    status?: string;
  };
  geometry?: {
    coordinates?: number[][][];
  };
}

// Rate limiting for API endpoints
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many API requests from this IP, please try again later.'
});

const emergencyLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 20, // limit each IP to 20 emergency requests per windowMs
  message: 'Too many emergency requests from this IP, please try again later.'
});

// Initialize router
const router = express.Router();

// Apply rate limiting to all routes
router.use(apiLimiter as unknown as express.RequestHandler);

// Real-time data service configuration
const API_KEYS = {
  HERE_TRAFFIC: process.env.HERE_TRAFFIC_API_KEY || '',
  WEATHER_API: process.env.WEATHER_API_KEY || '',
  HOSPITAL_API: process.env.HOSPITAL_API_KEY || '',
  GOOGLE_MAPS: process.env.GOOGLE_MAPS_API_KEY || ''
};

// Cache for API responses
const cache = new Map();
const CACHE_TTL = {
  earthquakes: 5 * 60 * 1000,    // 5 minutes
  weather: 10 * 60 * 1000,       // 10 minutes
  traffic: 2 * 60 * 1000,        // 2 minutes
  hospitals: 15 * 60 * 1000      // 15 minutes
};

// Utility function to check cache
const getCachedData = (key: string, ttl: number) => {
  const cached = cache.get(key);
  if (cached && (Date.now() - cached.timestamp) < ttl) {
    return cached.data;
  }
  return null;
};

// Utility function to set cache
const setCachedData = (key: string, data: unknown) => {
  cache.set(key, { data, timestamp: Date.now() });
};

// USGS Earthquake API endpoint
router.get('/api/earthquakes', async (req: express.Request, res: express.Response) => {
  try {
    const { lat, lng, radius, minMagnitude = '2.5', timeRange = 'day' } = req.query;
    const cacheKey = `earthquakes-${lat}-${lng}-${radius}-${minMagnitude}-${timeRange}`;
    
    // Check cache first
    const cachedData = getCachedData(cacheKey, CACHE_TTL.earthquakes);
    if (cachedData) {
      return res.json(cachedData);
    }

    let url = `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&minmagnitude=${minMagnitude}&orderby=time`;
    
    // Add time range
    const now = new Date();
    let starttime: Date;
    switch (timeRange) {
      case 'hour':
        starttime = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case 'day':
        starttime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'week':
        starttime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        starttime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        starttime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }
    
    url += `&starttime=${starttime.toISOString()}`;

    // Add location filter if provided
    if (lat && lng && radius) {
      url += `&latitude=${lat}&longitude=${lng}&maxradiuskm=${radius}`;
    }

    const response = await axios.get(url, { timeout: 10000 });
    const earthquakes = response.data.features.map((feature: EarthquakeFeature) => ({
      id: feature.id,
      magnitude: feature.properties.mag,
      location: feature.properties.place,
      coordinates: [feature.geometry.coordinates[1], feature.geometry.coordinates[0]],
      depth: feature.geometry.coordinates[2],
      time: new Date(feature.properties.time).toISOString(),
      tsunami: feature.properties.tsunami === 1,
      alert: feature.properties.alert,
      url: feature.properties.url,
      place: feature.properties.place,
      type: feature.properties.type,
      status: feature.properties.status,
      title: feature.properties.title
    }));

    setCachedData(cacheKey, earthquakes);
    res.json(earthquakes);

  } catch (error) {
    console.error('USGS API error:', error);
    res.status(500).json({ error: 'Failed to fetch earthquake data' });
  }
});

// National Weather Service API endpoint
router.get('/api/weather-alerts', async (req: express.Request, res: express.Response) => {
  try {
    const { lat, lng } = req.query;
    const cacheKey = `weather-alerts-${lat}-${lng}`;
    
    const cachedData = getCachedData(cacheKey, CACHE_TTL.weather);
    if (cachedData) {
      return res.json(cachedData);
    }

    let url = 'https://api.weather.gov/alerts/active';
    if (lat && lng) {
      url += `?point=${lat},${lng}`;
    }

    const response = await axios.get(url, {
      headers: {
        'User-Agent': '(DeDiWARN Emergency System, emergency@dediwarn.com)'
      },
      timeout: 10000
    });

    const alerts = response.data.features.map((feature: WeatherAlertFeature) => ({
      id: feature.properties.id,
      title: feature.properties.event,
      description: feature.properties.description,
      severity: feature.properties.severity?.toLowerCase(),
      certainty: feature.properties.certainty?.toLowerCase(),
      urgency: feature.properties.urgency?.toLowerCase(),
      event: feature.properties.event,
      headline: feature.properties.headline,
      areas: feature.properties.areaDesc?.split('; ') || [],
      coordinates: feature.geometry?.coordinates?.[0]?.map((coord: number[]) => [coord[1], coord[0]]) || [],
      effective: feature.properties.effective,
      expires: feature.properties.expires,
      status: feature.properties.status?.toLowerCase()
    }));

    setCachedData(cacheKey, alerts);
    res.json(alerts);

  } catch (error) {
    console.error('Weather API error:', error);
    res.status(500).json({ error: 'Failed to fetch weather alerts' });
  }
});

// Traffic incidents endpoint (using HERE API)
router.get('/api/traffic-incidents', async (req: Request, res: Response) => {
  try {
    const { lat, lng, radius = 25 } = req.query;
    
    if (!lat || !lng) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    const cacheKey = `traffic-incidents-${lat}-${lng}-${radius}`;
    const cachedData = getCachedData(cacheKey, CACHE_TTL.traffic);
    if (cachedData) {
      return res.json(cachedData);
    }

    if (!API_KEYS.HERE_TRAFFIC) {
      // Return mock data if no API key
      const mockData = [
        {
          id: 'traffic-1',
          type: 'accident',
          severity: 'high',
          title: 'Multi-vehicle accident',
          description: 'Traffic accident blocking 2 lanes',
          location: 'Highway 101 North',
          coordinates: [parseFloat(lat as string) + 0.01, parseFloat(lng as string) + 0.01],
          roadName: 'Highway 101',
          lanes_affected: 2,
          estimated_duration: '45 minutes',
          start_time: new Date().toISOString(),
          detour_available: true,
          emergency_services_on_scene: true
        }
      ];
      setCachedData(cacheKey, mockData);
      return res.json(mockData);
    }

    const bbox = `${parseFloat(lat as string) - parseFloat(radius as string) / 111},${parseFloat(lng as string) - parseFloat(radius as string) / 111};${parseFloat(lat as string) + parseFloat(radius as string) / 111},${parseFloat(lng as string) + parseFloat(radius as string) / 111}`;
    const url = `https://traffic.ls.hereapi.com/traffic/6.3/incidents.json?apikey=${API_KEYS.HERE_TRAFFIC}&bbox=${bbox}&criticality=major,minor`;

    const response = await axios.get(url, { timeout: 10000 });
    
    const incidents = response.data.TRAFFIC_ITEMS?.TRAFFIC_ITEM?.map((item: unknown) => {
      // Type assertion for complex nested API structure
      const t = item as Record<string, unknown>;
      const location = t.LOCATION as Record<string, unknown> | undefined;
      const defined = location?.DEFINED as Record<string, unknown> | undefined;
      const origin = defined?.ORIGIN as Record<string, unknown> | undefined;
      const roadway = origin?.ROADWAY as Record<string, unknown>[] | undefined;
      const desc = t.TRAFFIC_ITEM_DESCRIPTION as Record<string, unknown>[] | undefined;
      const detail = t.TRAFFIC_ITEM_DETAIL as Record<string, unknown>[] | undefined;
      
      return {
        id: t.TRAFFIC_ITEM_ID,
        type: mapTrafficType(t.TRAFFIC_ITEM_TYPE_DESC as string),
        severity: mapTrafficSeverity(t.CRITICALITY as string),
        title: desc?.[0]?.content || 'Traffic Incident',
        description: detail?.[0]?.content || '',
        location: ((roadway?.[0] as Record<string, unknown>)?.DESCRIPTION as Record<string, unknown>[])?.[0]?.content as string || 'Unknown location',
        coordinates: [
          parseFloat(origin?.LATITUDE as string || '0'),
          parseFloat(origin?.LONGITUDE as string || '0')
        ],
        roadName: ((roadway?.[0] as Record<string, unknown>)?.DESCRIPTION as Record<string, unknown>[])?.[0]?.content as string || 'Unknown road',
        lanes_affected: parseInt(roadway?.[0]?.LANES_AFFECTED as string || '1'),
        estimated_duration: t.AVERAGE_DELAY || 'Unknown',
        start_time: t.START_TIME || new Date().toISOString(),
        end_time: t.END_TIME,
        detour_available: roadway?.[0]?.DETOUR_AVAILABLE === 'true',
        emergency_services_on_scene: desc?.[0]?.content?.toString().toLowerCase().includes('emergency') || false
      };
    }) || [];

    setCachedData(cacheKey, incidents);
    res.json(incidents);

  } catch (error) {
    console.error('Traffic API error:', error);
    res.status(500).json({ error: 'Failed to fetch traffic incidents' });
  }
});

// Hospital capacity endpoint
router.get('/api/hospitals/capacity', async (req: Request, res: Response) => {
  try {
    const { lat, lng, radius = 25 } = req.query;
    
    if (!lat || !lng) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    const cacheKey = `hospitals-${lat}-${lng}-${radius}`;
    const cachedData = getCachedData(cacheKey, CACHE_TTL.hospitals);
    if (cachedData) {
      return res.json(cachedData);
    }

    // Mock hospital data (in production, integrate with actual hospital management systems)
    const hospitals = [
      {
        id: 'hospital-1',
        name: 'City General Hospital',
        address: '123 Main St',
        coordinates: [parseFloat(lat as string) + 0.01, parseFloat(lng as string) + 0.01],
        phone: '555-0101',
        emergency_services: true,
        trauma_center_level: 1,
        bed_capacity: {
          total: 300,
          available: Math.floor(Math.random() * 100) + 20,
          icu: 50,
          icu_available: Math.floor(Math.random() * 20) + 5,
          emergency: 25,
          emergency_available: Math.floor(Math.random() * 15) + 5
        },
        specialties: ['Cardiology', 'Trauma', 'Emergency Medicine'],
        current_wait_time: Math.floor(Math.random() * 60) + 10,
        ambulance_diversion: Math.random() > 0.8,
        last_updated: new Date().toISOString(),
        status: ['normal', 'busy', 'critical'][Math.floor(Math.random() * 3)]
      },
      {
        id: 'hospital-2',
        name: 'Regional Medical Center',
        address: '456 Health Ave',
        coordinates: [parseFloat(lat as string) - 0.02, parseFloat(lng as string) - 0.01],
        phone: '555-0202',
        emergency_services: true,
        trauma_center_level: 2,
        bed_capacity: {
          total: 150,
          available: Math.floor(Math.random() * 50) + 10,
          icu: 20,
          icu_available: Math.floor(Math.random() * 10) + 2,
          emergency: 15,
          emergency_available: Math.floor(Math.random() * 10) + 3
        },
        specialties: ['Pediatrics', 'Surgery', 'Emergency Medicine'],
        current_wait_time: Math.floor(Math.random() * 90) + 15,
        ambulance_diversion: Math.random() > 0.9,
        last_updated: new Date().toISOString(),
        status: ['normal', 'busy'][Math.floor(Math.random() * 2)]
      }
    ];

    setCachedData(cacheKey, hospitals);
    res.json(hospitals);

  } catch (error) {
    console.error('Hospital API error:', error);
    res.status(500).json({ error: 'Failed to fetch hospital capacity data' });
  }
});

// Get local emergency number based on location
router.get('/api/emergency-numbers', async (req: Request, res: Response) => {
  try {
    const { lat, lng } = req.query;
    
    if (!lat || !lng) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    // Mock emergency numbers based on location (in production, use actual geocoding service)
    const location = { lat: parseFloat(lat as string), lng: parseFloat(lng as string) };
    
    // Default to US emergency number, but could be expanded for international
    let emergencyNumber = '911';
    let country = 'US';
    
    // Simple region detection (expand this for actual implementation)
    if (location.lat >= 24 && location.lat <= 49 && location.lng >= -125 && location.lng <= -66) {
      emergencyNumber = '911';
      country = 'US';
    } else if (location.lat >= 41.6 && location.lat <= 83.2 && location.lng >= -141 && location.lng <= -52) {
      emergencyNumber = '911';
      country = 'CA';
    } else {
      // International locations - would need proper geocoding
      emergencyNumber = '112'; // European emergency number
      country = 'International';
    }

    res.json({
      emergencyNumber,
      country,
      services: {
        police: emergencyNumber,
        fire: emergencyNumber,
        medical: emergencyNumber,
        poison: country === 'US' ? '1-800-222-1222' : emergencyNumber
      }
    });

  } catch (error) {
    console.error('Emergency number lookup error:', error);
    res.status(500).json({ error: 'Failed to get local emergency number' });
  }
});

// Send emergency message endpoint
router.post('/api/send-emergency-message', emergencyLimiter as unknown as express.RequestHandler, async (req: Request, res: Response) => {
  try {
    const { phone, message, priority } = req.body;
    
    if (!phone || !message) {
      return res.status(400).json({ error: 'Phone number and message are required' });
    }

    // In production, integrate with SMS service like Twilio
    console.log(`Emergency SMS to ${phone}: ${message} (Priority: ${priority})`);
    
    // Mock successful SMS sending
    res.json({
      success: true,
      messageId: `msg_${Date.now()}`,
      deliveryStatus: 'queued'
    });

  } catch (error) {
    console.error('Emergency message error:', error);
    res.status(500).json({ error: 'Failed to send emergency message' });
  }
});

// Alert volunteers endpoint
router.post('/api/alert-volunteers', emergencyLimiter as unknown as express.RequestHandler, async (req: Request, res: Response) => {
  try {
    const { location, emergencyType, userProfile } = req.body;
    
    if (!location || !emergencyType) {
      return res.status(400).json({ error: 'Location and emergency type are required' });
    }

    // In production, integrate with volunteer management system
    console.log(`Volunteer alert for ${emergencyType} at ${location.lat}, ${location.lng}`);
    console.log(`User profile: ${JSON.stringify(userProfile)}`);
    
    // Mock volunteer alert
    res.json({
      success: true,
      alertId: `alert_${Date.now()}`,
      volunteersNotified: Math.floor(Math.random() * 10) + 5,
      estimatedResponseTime: '10-15 minutes'
    });

  } catch (error) {
    console.error('Volunteer alert error:', error);
    res.status(500).json({ error: 'Failed to alert volunteers' });
  }
});

// Location update endpoint for emergency tracking
router.post('/api/location-update', emergencyLimiter as unknown as express.RequestHandler, async (req: Request, res: Response) => {
  try {
    const { location, timestamp, accuracy } = req.body;
    
    if (!location || !timestamp) {
      return res.status(400).json({ error: 'Location and timestamp are required' });
    }

    // In production, store in emergency tracking database
    console.log(`Location update: ${location.lat}, ${location.lng} at ${timestamp} (accuracy: ${accuracy}m)`);
    
    res.json({
      success: true,
      trackingId: `track_${Date.now()}`,
      nextUpdateInterval: 30000 // 30 seconds
    });

  } catch (error) {
    console.error('Location update error:', error);
    res.status(500).json({ error: 'Failed to update location' });
  }
});

// Emergency recording upload endpoint
router.post('/api/emergency-recording', emergencyLimiter as unknown as express.RequestHandler, async (_, res) => {
  try {
    // In production, handle file upload to secure storage
    console.log('Emergency recording uploaded');
    
    res.json({
      success: true,
      recordingId: `rec_${Date.now()}`,
      storageLocation: 'secure-emergency-storage',
      retentionPeriod: '7 years'
    });

  } catch (error) {
    console.error('Emergency recording error:', error);
    res.status(500).json({ error: 'Failed to upload emergency recording' });
  }
});

// Utility functions
function mapTrafficType(typeDesc: string): string {
  const desc = typeDesc?.toLowerCase() || '';
  if (desc.includes('accident')) return 'accident';
  if (desc.includes('construction')) return 'construction';
  if (desc.includes('closure') || desc.includes('closed')) return 'closure';
  if (desc.includes('hazard')) return 'hazard';
  return 'congestion';
}

function mapTrafficSeverity(criticality: string): string {
  const crit = criticality?.toLowerCase() || '';
  if (crit.includes('major')) return 'high';
  if (crit.includes('minor')) return 'low';
  return 'medium';
}

// WebSocket setup for real-time updates
export const setupRealTimeUpdates = (io: Server) => {
  // Update earthquake data every 5 minutes
  setInterval(async () => {
    try {
      const response = await axios.get('https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&minmagnitude=4.0&orderby=time&starttime=' + new Date(Date.now() - 5 * 60 * 1000).toISOString());
      const earthquakes = response.data.features.map((feature: EarthquakeFeature) => ({
        id: feature.id,
        magnitude: feature.properties.mag,
        location: feature.properties.place,
        coordinates: [feature.geometry.coordinates[1], feature.geometry.coordinates[0]],
        time: new Date(feature.properties.time).toISOString(),
        alert: feature.properties.alert
      }));
      
      if (earthquakes.length > 0) {
        io.emit('earthquake-update', earthquakes);
      }
    } catch (error) {
      console.error('Real-time earthquake update error:', error);
    }
  }, 5 * 60 * 1000);

  // Update weather alerts every 10 minutes
  setInterval(async () => {
    try {
      const response = await axios.get('https://api.weather.gov/alerts/active', {
        headers: {
          'User-Agent': '(DeDiWARN Emergency System, emergency@dediwarn.com)'
        }
      });
      
      const severeAlerts = response.data.features
        .filter((feature: WeatherAlertFeature) => feature.properties.severity === 'Severe' || feature.properties.severity === 'Extreme')
        .map((feature: WeatherAlertFeature) => ({
          id: feature.properties.id,
          event: feature.properties.event,
          headline: feature.properties.headline,
          severity: feature.properties.severity,
          urgency: feature.properties.urgency,
          effective: feature.properties.effective
        }));
      
      if (severeAlerts.length > 0) {
        io.emit('weather-alert', severeAlerts);
      }
    } catch (error) {
      console.error('Real-time weather update error:', error);
    }
  }, 10 * 60 * 1000);
};

export default router;
