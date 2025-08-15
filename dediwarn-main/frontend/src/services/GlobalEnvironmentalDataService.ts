import axios from 'axios';

// Types for API responses
export interface FIRMSFire {
  latitude: number;
  longitude: number;
  bright_ti4: number;
  scan: number;
  track: number;
  acq_date: string;
  acq_time: string;
  satellite: string;
  confidence: number;
  version: string;
  bright_ti5: number;
  frp: number;
  daynight: string;
}

export interface GDACSAlert {
  eventid: string;
  eventname: string;
  eventtype: string;
  alertlevel: string;
  country: string;
  fromdate: string;
  todate: string;
  subject: string;
  htmldescription: string;
  coordinate: string;
}

export interface WeatherData {
  coord: { lon: number; lat: number };
  weather: Array<{
    id: number;
    main: string;
    description: string;
    icon: string;
  }>;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
  };
  wind: {
    speed: number;
    deg: number;
  };
  name: string;
  alerts?: Array<{
    sender_name: string;
    event: string;
    start: number;
    end: number;
    description: string;
  }>;
}

export interface EONETEvent {
  id: string;
  title: string;
  description: string;
  link: string;
  categories: Array<{
    id: string;
    title: string;
  }>;
  sources: Array<{
    id: string;
    url: string;
  }>;
  geometry: Array<{
    magnitudeValue?: number;
    magnitudeUnit?: string;
    date: string;
    type: string;
    coordinates: number[];
  }>;
  closed?: string;
}

// API Configuration
const API_CONFIG = {
  NASA_FIRMS_BASE: 'https://firms.modaps.eosdis.nasa.gov/api/area/csv',
  GDACS_BASE: 'https://www.gdacs.org/gdacsapi/api',
  OPENWEATHER_BASE: 'https://api.openweathermap.org/data/2.5',
  EONET_BASE: 'https://eonet.gsfc.nasa.gov/api/v3',
  // API Keys (add these to your .env file)
  NASA_FIRMS_KEY: process.env.REACT_APP_NASA_FIRMS_API_KEY || 'MAP_KEY',
  OPENWEATHER_KEY: process.env.REACT_APP_OPENWEATHER_API_KEY || 'demo_key',
};

/**
 * NASA FIRMS (Fire Information for Resource Management System)
 * Fetches active fire data from NASA satellites
 */
export async function fetchFIRMSFires(
  bbox?: string,
  days: number = 1
): Promise<FIRMSFire[]> {
  try {
    // Default to global bbox if not provided
    const boundingBox = bbox || '-180,-90,180,90';
    const url = `${API_CONFIG.NASA_FIRMS_BASE}/MODIS_C6_1/${API_CONFIG.NASA_FIRMS_KEY}/${boundingBox}/${days}`;
    
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'ClimaAid-Platform/1.0'
      }
    });

    // Parse CSV response
    const lines = response.data.split('\n');
    if (lines.length < 2) return generateMockFires();
    
    const headers = lines[0].split(',');
    const fires: FIRMSFire[] = [];

    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim()) {
        const values = lines[i].split(',');
        const fireData: Record<string, string | number> = {};
        headers.forEach((header: string, index: number) => {
          const value = values[index]?.trim();
          if (header.includes('latitude') || header.includes('longitude') || 
              header.includes('bright') || header.includes('confidence') || 
              header.includes('frp')) {
            fireData[header.trim()] = parseFloat(value) || 0;
          } else {
            fireData[header.trim()] = value;
          }
        });
        
        // Create a proper FIRMSFire object with defaults
        const fire: FIRMSFire = {
          latitude: fireData.latitude as number || 0,
          longitude: fireData.longitude as number || 0,
          bright_ti4: fireData.bright_ti4 as number || 0,
          scan: fireData.scan as number || 0,
          track: fireData.track as number || 0,
          acq_date: fireData.acq_date as string || '',
          acq_time: fireData.acq_time as string || '',
          satellite: fireData.satellite as string || '',
          confidence: fireData.confidence as number || 0,
          version: fireData.version as string || '',
          bright_ti5: fireData.bright_ti5 as number || 0,
          frp: fireData.frp as number || 0,
          daynight: fireData.daynight as string || ''
        };
        
        fires.push(fire);
      }
    }

    return fires.slice(0, 100); // Limit to 100 fires for performance
  } catch (error) {
    console.error('Error fetching FIRMS data:', error);
    return generateMockFires();
  }
}

/**
 * GDACS (Global Disaster Alert and Coordination System)
 * Fetches global disaster alerts and coordination information
 */
export async function fetchGDACSAlerts(): Promise<GDACSAlert[]> {
  try {
    const url = `${API_CONFIG.GDACS_BASE}/events/geteventlist/MAP`;
    
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'ClimaAid-Platform/1.0',
        'Accept': 'application/json'
      }
    });

    return response.data || generateMockGDACS();
  } catch (error) {
    console.error('Error fetching GDACS data:', error);
    return generateMockGDACS();
  }
}

/**
 * OpenWeatherMap - Current Weather & Alerts
 * Fetches current weather and weather alerts for a location
 */
export async function fetchWeatherData(
  lat: number,
  lon: number
): Promise<WeatherData> {
  try {
    const weatherUrl = `${API_CONFIG.OPENWEATHER_BASE}/weather?lat=${lat}&lon=${lon}&appid=${API_CONFIG.OPENWEATHER_KEY}&units=metric`;
    
    const response = await axios.get(weatherUrl, {
      timeout: 8000,
      headers: { 'User-Agent': 'ClimaAid-Platform/1.0' }
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching weather data:', error);
    return generateMockWeather(lat, lon);
  }
}

/**
 * EONET (Earth Observatory Natural Event Tracker) – NASA
 * Fetches natural events and disasters from NASA's Earth Observatory
 */
export async function fetchEONETEvents(
  category?: string,
  status: string = 'open',
  limit: number = 50
): Promise<EONETEvent[]> {
  try {
    let url = `${API_CONFIG.EONET_BASE}/events?status=${status}&limit=${limit}`;
    if (category) {
      url += `&category=${category}`;
    }

    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'ClimaAid-Platform/1.0'
      }
    });

    return response.data.events || generateMockEONET();
  } catch (error) {
    console.error('Error fetching EONET data:', error);
    return generateMockEONET();
  }
}

/**
 * Aggregated Global Environmental Data
 * Fetches data from all four APIs and returns a unified dataset
 */
export async function fetchGlobalEnvironmentalData(
  lat: number = 0,
  lon: number = 0
) {
  try {
    const [fires, disasters, weather, events] = await Promise.all([
      fetchFIRMSFires(),
      fetchGDACSAlerts(),
      fetchWeatherData(lat, lon),
      fetchEONETEvents()
    ]);

    return {
      fires,
      disasters,
      weather,
      events,
      lastUpdated: new Date().toISOString(),
      summary: {
        activeFires: fires.length,
        activeDisasters: disasters.length,
        naturalEvents: events.length,
        weatherCondition: weather.weather[0]?.main || 'Unknown'
      }
    };
  } catch (error) {
    console.error('Error fetching global environmental data:', error);
    return null;
  }
}

// Mock data generators for fallback
function generateMockFires(): FIRMSFire[] {
  const mockFires: FIRMSFire[] = [];
  const regions = [
    { lat: 37.7749, lon: -122.4194, name: 'California' },
    { lat: -23.5505, lon: -46.6333, name: 'Brazil' },
    { lat: -25.2744, lon: 133.7751, name: 'Australia' },
    { lat: 61.524, lon: 105.3188, name: 'Siberia' },
    { lat: 0.7893, lon: 113.9213, name: 'Indonesia' }
  ];

  regions.forEach((region) => {
    for (let i = 0; i < 5; i++) {
      mockFires.push({
        latitude: region.lat + (Math.random() - 0.5) * 2,
        longitude: region.lon + (Math.random() - 0.5) * 2,
        bright_ti4: 300 + Math.random() * 100,
        scan: 1.0,
        track: 1.0,
        acq_date: new Date().toISOString().split('T')[0],
        acq_time: String(Math.floor(Math.random() * 24)).padStart(2, '0') + 
                  String(Math.floor(Math.random() * 60)).padStart(2, '0'),
        satellite: ['Terra', 'Aqua'][Math.floor(Math.random() * 2)],
        confidence: 70 + Math.random() * 30,
        version: '6.1',
        bright_ti5: 280 + Math.random() * 80,
        frp: 10 + Math.random() * 50,
        daynight: Math.random() > 0.5 ? 'D' : 'N'
      });
    }
  });

  return mockFires;
}

function generateMockGDACS(): GDACSAlert[] {
  return [
    {
      eventid: 'FL-20250813-001',
      eventname: 'Flooding in Southeast Asia',
      eventtype: 'FL',
      alertlevel: 'Orange',
      country: 'Thailand',
      fromdate: '2025-08-13',
      todate: '2025-08-17',
      subject: 'Severe flooding affects multiple provinces',
      htmldescription: 'Heavy monsoon rains have caused severe flooding across multiple provinces.',
      coordinate: '13.7563,100.5018'
    },
    {
      eventid: 'EQ-20250812-002',
      eventname: 'Earthquake in Pacific Ring of Fire',
      eventtype: 'EQ',
      alertlevel: 'Red',
      country: 'Philippines',
      fromdate: '2025-08-12',
      todate: '2025-08-14',
      subject: 'Magnitude 6.8 earthquake strikes Mindanao',
      htmldescription: 'A powerful earthquake has struck the southern Philippines.',
      coordinate: '6.2442,125.2482'
    },
    {
      eventid: 'TC-20250813-003',
      eventname: 'Tropical Cyclone Formation',
      eventtype: 'TC',
      alertlevel: 'Yellow',
      country: 'Australia',
      fromdate: '2025-08-13',
      todate: '2025-08-18',
      subject: 'Cyclone developing in Coral Sea',
      htmldescription: 'A tropical cyclone is forming in the Coral Sea near Queensland.',
      coordinate: '-16.2859,145.7781'
    }
  ];
}

function generateMockWeather(lat: number, lon: number): WeatherData {
  const conditions = ['Clear', 'Clouds', 'Rain', 'Snow', 'Thunderstorm'];
  const condition = conditions[Math.floor(Math.random() * conditions.length)];
  
  return {
    coord: { lon, lat },
    weather: [{
      id: 800,
      main: condition,
      description: `${condition.toLowerCase()} sky`,
      icon: '01d'
    }],
    main: {
      temp: 15 + Math.random() * 20,
      feels_like: 15 + Math.random() * 20,
      temp_min: 10 + Math.random() * 15,
      temp_max: 20 + Math.random() * 15,
      pressure: 1000 + Math.random() * 50,
      humidity: 40 + Math.random() * 40
    },
    wind: {
      speed: Math.random() * 10,
      deg: Math.random() * 360
    },
    name: 'Sample Location'
  };
}

function generateMockEONET(): EONETEvent[] {
  return [
    {
      id: 'EONET_6123',
      title: 'Wildfire - California Complex',
      description: 'Large wildfire complex burning in Northern California',
      link: 'https://eonet.gsfc.nasa.gov/api/v3/events/EONET_6123',
      categories: [{ id: '8', title: 'Wildfires' }],
      sources: [{ id: 'InciWeb', url: 'http://inciweb.nwcg.gov/' }],
      geometry: [{
        magnitudeValue: 15000,
        magnitudeUnit: 'acres',
        date: '2025-08-13T00:00:00Z',
        type: 'Point',
        coordinates: [-121.4944, 38.5816]
      }]
    },
    {
      id: 'EONET_6124',
      title: 'Severe Storm - Atlantic Hurricane',
      description: 'Category 3 hurricane in the Atlantic Ocean',
      link: 'https://eonet.gsfc.nasa.gov/api/v3/events/EONET_6124',
      categories: [{ id: '10', title: 'Severe Storms' }],
      sources: [{ id: 'NOAA_NHC', url: 'https://www.nhc.noaa.gov/' }],
      geometry: [{
        magnitudeValue: 185,
        magnitudeUnit: 'kph',
        date: '2025-08-12T12:00:00Z',
        type: 'Point',
        coordinates: [-65.0, 25.0]
      }]
    },
    {
      id: 'EONET_6125',
      title: 'Volcanic Activity - Mount Etna',
      description: 'Increased volcanic activity at Mount Etna, Italy',
      link: 'https://eonet.gsfc.nasa.gov/api/v3/events/EONET_6125',
      categories: [{ id: '12', title: 'Volcanoes' }],
      sources: [{ id: 'INGV', url: 'https://www.ingv.it/' }],
      geometry: [{
        magnitudeValue: 2,
        magnitudeUnit: 'VEI',
        date: '2025-08-13T08:30:00Z',
        type: 'Point',
        coordinates: [14.9955, 37.7510]
      }]
    }
  ];
}

export default {
  fetchFIRMSFires,
  fetchGDACSAlerts,
  fetchWeatherData,
  fetchEONETEvents,
  fetchGlobalEnvironmentalData
};
