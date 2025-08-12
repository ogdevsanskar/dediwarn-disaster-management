interface DisasterEvent {
  id: string;
  type: 'earthquake' | 'flood' | 'fire' | 'storm' | 'emergency';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  timestamp: string;
  affectedArea: number;
  evacuationRequired: boolean;
  casualties?: number;
  description: string;
  magnitude?: number; // For earthquakes
  depth?: number; // For earthquakes
  weatherData?: WeatherData; // For weather-related events
}

interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  pressure: number;
  description: string;
  visibility: number;
}

interface USGSEarthquakeResponse {
  type: string;
  features: {
    type: string;
    properties: {
      mag: number;
      place: string;
      time: number;
      alert?: string;
      status: string;
      tsunami: number;
      sig: number;
      title: string;
      detail: string;
    };
    geometry: {
      type: string;
      coordinates: [number, number, number]; // [longitude, latitude, depth]
    };
    id: string;
  }[];
}

interface OpenWeatherResponse {
  coord: {
    lon: number;
    lat: number;
  };
  weather: {
    id: number;
    main: string;
    description: string;
    icon: string;
  }[];
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
    sea_level?: number;
    grnd_level?: number;
  };
  visibility: number;
  wind: {
    speed: number;
    deg: number;
    gust?: number;
  };
  clouds: {
    all: number;
  };
  dt: number;
  sys: {
    type: number;
    id: number;
    country: string;
    sunrise: number;
    sunset: number;
  };
  timezone: number;
  id: number;
  name: string;
  cod: number;
}

class DisasterService {
  private readonly USGS_API_URL = 'https://earthquake.usgs.gov/fdsnws/event/1/query';
  private readonly OPENWEATHER_API_URL = 'https://api.openweathermap.org/data/2.5/weather';
  private readonly OPENWEATHER_API_KEY = 'YOUR_API_KEY'; // Replace with actual API key

  /**
   * Fetch recent earthquakes from USGS
   */
  async fetchEarthquakes(
    startDate?: string,
    minMagnitude: number = 4.5,
    limit: number = 20
  ): Promise<DisasterEvent[]> {
    try {
      const today = new Date();
      const defaultStartDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000); // 7 days ago
      const starttime = startDate || defaultStartDate.toISOString().split('T')[0];

      const url = `${this.USGS_API_URL}?format=geojson&starttime=${starttime}&minmagnitude=${minMagnitude}&limit=${limit}&orderby=time`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`USGS API error: ${response.status} ${response.statusText}`);
      }

      const data: USGSEarthquakeResponse = await response.json();
      
      return data.features.map((feature, index) => {
        const { properties, geometry, id } = feature;
        const [longitude, latitude, depth] = geometry.coordinates;
        
        // Determine severity based on magnitude
        let severity: 'low' | 'medium' | 'high' | 'critical';
        if (properties.mag >= 7.0) severity = 'critical';
        else if (properties.mag >= 6.0) severity = 'high';
        else if (properties.mag >= 5.0) severity = 'medium';
        else severity = 'low';

        // Determine evacuation requirement
        const evacuationRequired = properties.mag >= 6.0 || properties.alert === 'red';

        // Estimate affected area based on magnitude (rough calculation)
        const affectedArea = Math.round(Math.pow(properties.mag, 2) * 10);

        return {
          id: id || `earthquake-${index}`,
          type: 'earthquake' as const,
          severity,
          title: `Earthquake M${properties.mag.toFixed(1)} - ${properties.place}`,
          location: {
            lat: latitude,
            lng: longitude,
            address: properties.place || 'Unknown location'
          },
          timestamp: new Date(properties.time).toISOString(),
          affectedArea,
          evacuationRequired,
          description: `Magnitude ${properties.mag.toFixed(1)} earthquake detected. Depth: ${depth.toFixed(1)}km. ${properties.alert ? `Alert level: ${properties.alert}` : ''}`,
          magnitude: properties.mag,
          depth: depth
        };
      });
    } catch (error) {
      console.error('Error fetching earthquake data:', error);
      throw new Error('Failed to fetch earthquake data from USGS');
    }
  }

  /**
   * Fetch weather data for a specific location
   */
  async fetchWeatherData(
    city: string,
    apiKey?: string
  ): Promise<WeatherData | null> {
    try {
      const key = apiKey || this.OPENWEATHER_API_KEY;
      if (!key || key === 'YOUR_API_KEY') {
        console.warn('OpenWeatherMap API key not configured');
        return null;
      }

      const url = `${this.OPENWEATHER_API_URL}?q=${encodeURIComponent(city)}&appid=${key}&units=metric`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`OpenWeatherMap API error: ${response.status} ${response.statusText}`);
      }

      const data: OpenWeatherResponse = await response.json();
      
      return {
        temperature: data.main.temp,
        humidity: data.main.humidity,
        windSpeed: data.wind.speed,
        windDirection: data.wind.deg,
        pressure: data.main.pressure,
        description: data.weather[0].description,
        visibility: data.visibility / 1000 // Convert to km
      };
    } catch (error) {
      console.error('Error fetching weather data:', error);
      return null;
    }
  }

  /**
   * Fetch weather data by coordinates
   */
  async fetchWeatherByCoordinates(
    lat: number,
    lon: number,
    apiKey?: string
  ): Promise<WeatherData | null> {
    try {
      const key = apiKey || this.OPENWEATHER_API_KEY;
      if (!key || key === 'YOUR_API_KEY') {
        console.warn('OpenWeatherMap API key not configured');
        return null;
      }

      const url = `${this.OPENWEATHER_API_URL}?lat=${lat}&lon=${lon}&appid=${key}&units=metric`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`OpenWeatherMap API error: ${response.status} ${response.statusText}`);
      }

      const data: OpenWeatherResponse = await response.json();
      
      return {
        temperature: data.main.temp,
        humidity: data.main.humidity,
        windSpeed: data.wind.speed,
        windDirection: data.wind.deg,
        pressure: data.main.pressure,
        description: data.weather[0].description,
        visibility: data.visibility / 1000
      };
    } catch (error) {
      console.error('Error fetching weather data:', error);
      return null;
    }
  }

  /**
   * Create weather-related disaster events based on severe weather conditions
   */
  async createWeatherDisasterEvents(cities: string[], apiKey?: string): Promise<DisasterEvent[]> {
    const disasters: DisasterEvent[] = [];
    
    for (const city of cities) {
      try {
        const weatherData = await this.fetchWeatherData(city, apiKey);
        if (!weatherData) continue;

        // Detect severe weather conditions
        const { temperature, windSpeed, description } = weatherData;
        
        // High temperature warning (heat wave)
        if (temperature > 40) {
          disasters.push({
            id: `heatwave-${city}-${Date.now()}`,
            type: 'emergency',
            severity: temperature > 45 ? 'critical' : 'high',
            title: `Heat Wave Warning - ${city}`,
            location: {
              lat: 0, // Would need geocoding service for exact coordinates
              lng: 0,
              address: city
            },
            timestamp: new Date().toISOString(),
            affectedArea: 100,
            evacuationRequired: temperature > 45,
            description: `Extreme heat conditions detected. Temperature: ${temperature}°C. ${description}`,
            weatherData
          });
        }

        // High wind warning (storm)
        if (windSpeed > 20) {
          disasters.push({
            id: `storm-${city}-${Date.now()}`,
            type: 'storm',
            severity: windSpeed > 30 ? 'critical' : 'high',
            title: `Storm Warning - ${city}`,
            location: {
              lat: 0,
              lng: 0,
              address: city
            },
            timestamp: new Date().toISOString(),
            affectedArea: 75,
            evacuationRequired: windSpeed > 30,
            description: `Severe storm conditions. Wind speed: ${windSpeed} m/s. ${description}`,
            weatherData
          });
        }

        // Flood potential (based on weather description)
        if (description.toLowerCase().includes('heavy rain') || description.toLowerCase().includes('thunderstorm')) {
          disasters.push({
            id: `flood-risk-${city}-${Date.now()}`,
            type: 'flood',
            severity: 'medium',
            title: `Flood Risk - ${city}`,
            location: {
              lat: 0,
              lng: 0,
              address: city
            },
            timestamp: new Date().toISOString(),
            affectedArea: 50,
            evacuationRequired: false,
            description: `Potential flood risk due to heavy precipitation. Current conditions: ${description}`,
            weatherData
          });
        }
      } catch (error) {
        console.error(`Error processing weather data for ${city}:`, error);
      }
    }

    return disasters;
  }

  /**
   * Get combined disaster events from multiple sources
   */
  async getAllDisasterEvents(options?: {
    includeEarthquakes?: boolean;
    includeWeather?: boolean;
    cities?: string[];
    earthquakeMinMagnitude?: number;
    weatherApiKey?: string;
  }): Promise<DisasterEvent[]> {
    const {
      includeEarthquakes = true,
      includeWeather = true,
      cities = ['Delhi', 'Mumbai', 'Chennai', 'Kolkata', 'Bangalore'],
      earthquakeMinMagnitude = 4.5,
      weatherApiKey
    } = options || {};

    const disasters: DisasterEvent[] = [];

    try {
      // Fetch earthquake data
      if (includeEarthquakes) {
        const earthquakes = await this.fetchEarthquakes(undefined, earthquakeMinMagnitude);
        disasters.push(...earthquakes);
      }

      // Fetch weather-related disasters
      if (includeWeather) {
        const weatherDisasters = await this.createWeatherDisasterEvents(cities, weatherApiKey);
        disasters.push(...weatherDisasters);
      }

      // Sort by timestamp (most recent first)
      return disasters.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    } catch (error) {
      console.error('Error fetching disaster events:', error);
      throw error;
    }
  }
}

export const disasterService = new DisasterService();
export type { DisasterEvent, WeatherData };
