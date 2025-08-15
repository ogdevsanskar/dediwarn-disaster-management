import { io, Socket } from 'socket.io-client';

// Types for different data sources
export interface EarthquakeData {
  id: string;
  magnitude: number;
  location: string;
  coordinates: [number, number];
  depth: number;
  time: string;
  tsunami: boolean;
  alert: 'green' | 'yellow' | 'orange' | 'red' | null;
  url: string;
  place: string;
  type: string;
  status: string;
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
  title: string;
}

export interface WeatherAlert {
  id: string;
  title: string;
  description: string;
  severity: 'minor' | 'moderate' | 'severe' | 'extreme';
  certainty: 'possible' | 'likely' | 'observed';
  urgency: 'future' | 'expected' | 'immediate';
  event: string;
  headline: string;
  areas: string[];
  coordinates: [number, number][];
  effective: string;
  expires: string;
  status: 'test' | 'draft' | 'actual';
}

export interface TrafficIncident {
  id: string;
  type: 'accident' | 'construction' | 'closure' | 'hazard' | 'congestion';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  location: string;
  coordinates: [number, number];
  roadName: string;
  lanes_affected: number;
  estimated_duration: string;
  start_time: string;
  end_time?: string;
  detour_available: boolean;
  emergency_services_on_scene: boolean;
}

export interface HospitalCapacity {
  id: string;
  name: string;
  address: string;
  coordinates: [number, number];
  phone: string;
  emergency_services: boolean;
  trauma_center_level: number | null;
  bed_capacity: {
    total: number;
    available: number;
    icu: number;
    icu_available: number;
    emergency: number;
    emergency_available: number;
  };
  specialties: string[];
  current_wait_time: number; // minutes
  ambulance_diversion: boolean;
  last_updated: string;
  status: 'normal' | 'busy' | 'critical' | 'closed';
}

export interface DisasterEvent {
  id: string;
  type: 'wildfire' | 'flood' | 'hurricane' | 'tornado' | 'earthquake' | 'tsunami' | 'volcanic' | 'landslide' | 'other';
  severity: 'watch' | 'advisory' | 'warning' | 'emergency';
  title: string;
  description: string;
  coordinates: [number, number];
  affected_radius: number; // km
  start_time: string;
  estimated_end?: string;
  evacuation_zones: string[];
  shelters_available: string[];
  emergency_contacts: string[];
  status: 'active' | 'contained' | 'resolved';
}

// API Response interfaces
interface USGSEarthquakeFeature {
  id: string;
  properties: {
    mag: number;
    place: string;
    time: number;
    tsunami: number;
    alert: string | null;
    url: string;
    [key: string]: unknown;
  };
  geometry: {
    coordinates: [number, number, number]; // [lng, lat, depth]
  };
}

interface WeatherAlertFeature {
  properties: {
    id: string;
    event: string;
    description: string;
    severity: string;
    certainty: string;
    urgency: string;
    headline: string;
    areaDesc: string;
    effective: string;
    expires: string;
    status: string;
    [key: string]: unknown;
  };
  geometry?: {
    coordinates: number[][][];
  };
}

interface TrafficIncidentItem {
  TRAFFIC_ITEM_ID: string;
  TRAFFIC_ITEM_TYPE_DESC: string;
  CRITICALITY: string;
  TRAFFIC_ITEM_DESCRIPTION?: Array<{ content: string }>;
  TRAFFIC_ITEM_DETAIL?: Array<{ content: string }>;
  LOCATION?: {
    DEFINED?: {
      ORIGIN?: {
        LATITUDE?: string;
        LONGITUDE?: string;
        ROADWAY?: Array<{
          DESCRIPTION?: Array<{ content: string }>;
          LANES_AFFECTED?: string;
          DETOUR_AVAILABLE?: string;
        }>;
      };
    };
  };
  [key: string]: unknown;
}

class RealTimeDataService {
  private socket: Socket | null = null;
  private subscribers: Map<string, Set<(data: unknown) => void>> = new Map();
  private cache: Map<string, { data: unknown; timestamp: number }> = new Map();
  private cacheTimeout = 300000; // 5 minutes
  private apiKeys = {
    weather: process.env.REACT_APP_WEATHER_API_KEY || '',
    traffic: process.env.REACT_APP_TRAFFIC_API_KEY || '',
    hospital: process.env.REACT_APP_HOSPITAL_API_KEY || ''
  };

  constructor() {
    this.initializeWebSocket();
    this.startPeriodicUpdates();
  }

  // Initialize WebSocket connection for real-time updates
  private initializeWebSocket() {
    try {
      this.socket = io(process.env.REACT_APP_WEBSOCKET_URL || 'ws://localhost:3001', {
        transports: ['websocket'],
        upgrade: true,
        rememberUpgrade: true
      });

      this.socket.on('connect', () => {
        console.log('Connected to real-time data service');
      });

      this.socket.on('earthquake-update', (data: EarthquakeData) => {
        this.notifySubscribers('earthquakes', data);
      });

      this.socket.on('weather-alert', (data: WeatherAlert) => {
        this.notifySubscribers('weather', data);
      });

      this.socket.on('traffic-incident', (data: TrafficIncident) => {
        this.notifySubscribers('traffic', data);
      });

      this.socket.on('hospital-update', (data: HospitalCapacity) => {
        this.notifySubscribers('hospitals', data);
      });

      this.socket.on('disaster-event', (data: DisasterEvent) => {
        this.notifySubscribers('disasters', data);
      });

    } catch (error) {
      console.error('Failed to initialize WebSocket:', error);
    }
  }

  // Start periodic updates for APIs without real-time capabilities
  private startPeriodicUpdates() {
    // Update earthquakes every 5 minutes
    setInterval(() => this.fetchEarthquakeData(), 300000);
    
    // Update weather every 10 minutes
    setInterval(() => this.fetchWeatherAlerts(), 600000);
    
    // Update traffic every 2 minutes
    setInterval(() => this.fetchTrafficData({ lat: 0, lng: 0, radius: 10 }), 120000);
    
    // Update hospital capacity every 15 minutes
    setInterval(() => this.fetchHospitalCapacity({ lat: 0, lng: 0, radius: 10 }), 900000);
  }

  // Subscribe to specific data type updates
  public subscribe(dataType: string, callback: (data: unknown) => void) {
    if (!this.subscribers.has(dataType)) {
      this.subscribers.set(dataType, new Set());
    }
    this.subscribers.get(dataType)!.add(callback);

    // Return unsubscribe function
    return () => {
      this.subscribers.get(dataType)?.delete(callback);
    };
  }

  // Notify subscribers of data updates
  private notifySubscribers(dataType: string, data: unknown) {
    const typeSubscribers = this.subscribers.get(dataType);
    if (typeSubscribers) {
      typeSubscribers.forEach(callback => callback(data));
    }
  }

  // Check if cached data is still valid
  private isCacheValid(key: string): boolean {
    const cached = this.cache.get(key);
    return !!cached && (Date.now() - cached.timestamp) < this.cacheTimeout;
  }

  // Get cached data or fetch new
  private async getCachedOrFetch<T>(key: string, fetchFunction: () => Promise<T>): Promise<T> {
    if (this.isCacheValid(key)) {
      return this.cache.get(key)!.data as T;
    }

    try {
      const data = await fetchFunction();
      this.cache.set(key, { data: data as unknown, timestamp: Date.now() });
      return data;
    } catch (error) {
      console.error(`Failed to fetch ${key}:`, error);
      // Return cached data if available, even if expired
      const cached = this.cache.get(key);
      if (cached) {
        return cached.data as T;
      }
      throw error;
    }
  }

  // USGS Earthquake API Integration
  public async fetchEarthquakeData(
    minMagnitude: number = 2.5,
    timeRange: string = 'day',
    location?: { lat: number; lng: number; radius: number }
  ): Promise<EarthquakeData[]> {
    const cacheKey = `earthquakes-${minMagnitude}-${timeRange}-${location ? `${location.lat},${location.lng},${location.radius}` : 'global'}`;
    
    return this.getCachedOrFetch(cacheKey, async () => {
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
      if (location) {
        const { lat, lng, radius } = location;
        url += `&latitude=${lat}&longitude=${lng}&maxradiuskm=${radius}`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`USGS API error: ${response.status}`);
      }

      const data = await response.json();
      
      const earthquakes: EarthquakeData[] = data.features.map((feature: USGSEarthquakeFeature) => ({
        id: feature.id,
        magnitude: feature.properties.mag,
        location: feature.properties.place,
        coordinates: [feature.geometry.coordinates[1], feature.geometry.coordinates[0]], // lat, lng
        depth: feature.geometry.coordinates[2],
        time: new Date(feature.properties.time).toISOString(),
        tsunami: feature.properties.tsunami === 1,
        alert: feature.properties.alert,
        url: feature.properties.url,
        place: feature.properties.place,
        type: feature.properties.type,
        status: feature.properties.status,
        net: feature.properties.net,
        code: feature.properties.code,
        ids: feature.properties.ids,
        sources: feature.properties.sources,
        types: feature.properties.types,
        nst: feature.properties.nst,
        dmin: feature.properties.dmin,
        rms: feature.properties.rms,
        gap: feature.properties.gap,
        magType: feature.properties.magType,
        title: feature.properties.title
      }));

      // Notify subscribers
      this.notifySubscribers('earthquakes', earthquakes);
      
      return earthquakes;
    });
  }

  // National Weather Service API Integration
  public async fetchWeatherAlerts(location?: { lat: number; lng: number }): Promise<WeatherAlert[]> {
    const cacheKey = `weather-alerts-${location ? `${location.lat},${location.lng}` : 'national'}`;
    
    return this.getCachedOrFetch(cacheKey, async () => {
      let url = 'https://api.weather.gov/alerts/active';
      
      if (location) {
        url += `?point=${location.lat},${location.lng}`;
      }

      const response = await fetch(url, {
        headers: {
          'User-Agent': '(DeDiWARN Emergency System, emergency@dediwarn.com)'
        }
      });

      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
      }

      const data = await response.json();
      
      const alerts: WeatherAlert[] = data.features.map((feature: WeatherAlertFeature) => ({
        id: feature.properties.id,
        title: feature.properties.event,
        description: feature.properties.description,
        severity: feature.properties.severity.toLowerCase(),
        certainty: feature.properties.certainty.toLowerCase(),
        urgency: feature.properties.urgency.toLowerCase(),
        event: feature.properties.event,
        headline: feature.properties.headline,
        areas: feature.properties.areaDesc.split('; '),
        coordinates: feature.geometry ? feature.geometry.coordinates[0].map((coord: number[]) => [coord[1], coord[0]]) : [],
        effective: feature.properties.effective,
        expires: feature.properties.expires,
        status: feature.properties.status.toLowerCase()
      }));

      // Notify subscribers
      this.notifySubscribers('weather', alerts);
      
      return alerts;
    });
  }

  // Traffic/Road Closure API Integration (using HERE API as example)
  public async fetchTrafficData(location: { lat: number; lng: number; radius: number }): Promise<TrafficIncident[]> {
    const cacheKey = `traffic-${location.lat},${location.lng},${location.radius}`;
    
    return this.getCachedOrFetch(cacheKey, async () => {
      // Using HERE Traffic API as example - replace with your preferred provider
      const url = `https://traffic.ls.hereapi.com/traffic/6.3/incidents.json?apikey=${this.apiKeys.traffic}&bbox=${location.lat - 0.1},${location.lng - 0.1};${location.lat + 0.1},${location.lng + 0.1}&criticality=major,minor`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Traffic API error: ${response.status}`);
      }

      const data = await response.json();
      
      const incidents: TrafficIncident[] = data.TRAFFIC_ITEMS?.TRAFFIC_ITEM?.map((item: TrafficIncidentItem) => ({
        id: item.TRAFFIC_ITEM_ID,
        type: this.mapTrafficType(item.TRAFFIC_ITEM_TYPE_DESC),
        severity: this.mapTrafficSeverity(item.CRITICALITY),
        title: item.TRAFFIC_ITEM_DESCRIPTION?.[0]?.content || 'Traffic Incident',
        description: item.TRAFFIC_ITEM_DETAIL?.[0]?.content || '',
        location: item.LOCATION?.DEFINED?.ORIGIN?.ROADWAY?.[0]?.DESCRIPTION?.[0]?.content || 'Unknown location',
        coordinates: [
          parseFloat(item.LOCATION?.DEFINED?.ORIGIN?.LATITUDE || '0'),
          parseFloat(item.LOCATION?.DEFINED?.ORIGIN?.LONGITUDE || '0')
        ],
        roadName: item.LOCATION?.DEFINED?.ORIGIN?.ROADWAY?.[0]?.DESCRIPTION?.[0]?.content || 'Unknown road',
        lanes_affected: parseInt(item.LOCATION?.DEFINED?.ORIGIN?.ROADWAY?.[0]?.LANES_AFFECTED || '1'),
        estimated_duration: item.AVERAGE_DELAY || 'Unknown',
        start_time: item.START_TIME || new Date().toISOString(),
        end_time: item.END_TIME,
        detour_available: item.LOCATION?.DEFINED?.ORIGIN?.ROADWAY?.[0]?.DETOUR_AVAILABLE === 'true',
        emergency_services_on_scene: item.TRAFFIC_ITEM_DESCRIPTION?.[0]?.content?.toLowerCase().includes('emergency') || false
      })) || [];

      // Notify subscribers
      this.notifySubscribers('traffic', incidents);
      
      return incidents;
    });
  }

  // Hospital Capacity API Integration (mock implementation - integrate with actual hospital systems)
  public async fetchHospitalCapacity(location: { lat: number; lng: number; radius: number }): Promise<HospitalCapacity[]> {
    const cacheKey = `hospitals-${location.lat},${location.lng},${location.radius}`;
    
    return this.getCachedOrFetch(cacheKey, async () => {
      // This would integrate with actual hospital management systems
      // For now, using a mock API structure that matches real hospital data formats
      const url = `/api/hospitals/capacity?lat=${location.lat}&lng=${location.lng}&radius=${location.radius}`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${this.apiKeys.hospital}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        // Fallback to mock data for demonstration
        return this.getMockHospitalData(location);
      }

      const hospitals: HospitalCapacity[] = await response.json();

      // Notify subscribers
      this.notifySubscribers('hospitals', hospitals);
      
      return hospitals;
    });
  }

  // Fetch comprehensive disaster data
  public async fetchDisasterEvents(location?: { lat: number; lng: number; radius: number }): Promise<DisasterEvent[]> {
    const cacheKey = `disasters-${location ? `${location.lat},${location.lng},${location.radius}` : 'global'}`;
    
    return this.getCachedOrFetch(cacheKey, async () => {
      // Combine data from multiple sources
      const [earthquakes, weatherAlerts] = await Promise.all([
        this.fetchEarthquakeData(4.0, 'day', location).catch(() => []),
        this.fetchWeatherAlerts(location).catch(() => [])
      ]);

      const disasters: DisasterEvent[] = [];

      // Convert significant earthquakes to disaster events
      earthquakes
        .filter(eq => eq.magnitude >= 5.0 || eq.alert === 'red' || eq.alert === 'orange')
        .forEach(eq => {
          disasters.push({
            id: `earthquake-${eq.id}`,
            type: 'earthquake',
            severity: eq.alert === 'red' ? 'emergency' : eq.alert === 'orange' ? 'warning' : 'advisory',
            title: `M${eq.magnitude} Earthquake`,
            description: eq.title,
            coordinates: eq.coordinates,
            affected_radius: Math.min(eq.magnitude * 100, 1000), // Rough estimate
            start_time: eq.time,
            evacuation_zones: [],
            shelters_available: [],
            emergency_contacts: ['911'],
            status: 'active'
          });
        });

      // Convert severe weather alerts to disaster events
      weatherAlerts
        .filter(alert => alert.severity === 'severe' || alert.severity === 'extreme')
        .forEach(alert => {
          disasters.push({
            id: `weather-${alert.id}`,
            type: this.mapWeatherEventType(alert.event),
            severity: alert.urgency === 'immediate' ? 'emergency' : 'warning',
            title: alert.headline,
            description: alert.description,
            coordinates: alert.coordinates[0] || [0, 0],
            affected_radius: 50, // Default radius for weather events
            start_time: alert.effective,
            estimated_end: alert.expires,
            evacuation_zones: alert.areas,
            shelters_available: [],
            emergency_contacts: ['911'],
            status: 'active'
          });
        });

      // Notify subscribers
      this.notifySubscribers('disasters', disasters);
      
      return disasters;
    });
  }

  // Get real-time updates for a specific location
  public async getRealTimeLocationData(location: { lat: number; lng: number; radius: number }) {
    const data = await Promise.allSettled([
      this.fetchEarthquakeData(2.0, 'day', location),
      this.fetchWeatherAlerts(location),
      this.fetchTrafficData(location),
      this.fetchHospitalCapacity(location),
      this.fetchDisasterEvents(location)
    ]);

    return {
      earthquakes: data[0].status === 'fulfilled' ? data[0].value : [],
      weatherAlerts: data[1].status === 'fulfilled' ? data[1].value : [],
      trafficIncidents: data[2].status === 'fulfilled' ? data[2].value : [],
      hospitalCapacity: data[3].status === 'fulfilled' ? data[3].value : [],
      disasterEvents: data[4].status === 'fulfilled' ? data[4].value : [],
      lastUpdated: new Date().toISOString()
    };
  }

  // Helper methods for mapping API responses
  private mapTrafficType(typeDesc: string): TrafficIncident['type'] {
    const desc = typeDesc?.toLowerCase() || '';
    if (desc.includes('accident')) return 'accident';
    if (desc.includes('construction')) return 'construction';
    if (desc.includes('closure') || desc.includes('closed')) return 'closure';
    if (desc.includes('hazard')) return 'hazard';
    return 'congestion';
  }

  private mapTrafficSeverity(criticality: string): TrafficIncident['severity'] {
    const crit = criticality?.toLowerCase() || '';
    if (crit.includes('major')) return 'high';
    if (crit.includes('minor')) return 'low';
    return 'medium';
  }

  private mapWeatherEventType(event: string): DisasterEvent['type'] {
    const eventLower = event.toLowerCase();
    if (eventLower.includes('tornado')) return 'tornado';
    if (eventLower.includes('hurricane')) return 'hurricane';
    if (eventLower.includes('flood')) return 'flood';
    if (eventLower.includes('fire')) return 'wildfire';
    return 'other';
  }

  // Mock hospital data for demonstration
  private getMockHospitalData(location: { lat: number; lng: number }): HospitalCapacity[] {
    return [
      {
        id: 'hospital-1',
        name: 'City General Hospital',
        address: '123 Main St',
        coordinates: [location.lat + 0.01, location.lng + 0.01],
        phone: '555-0101',
        emergency_services: true,
        trauma_center_level: 1,
        bed_capacity: {
          total: 300,
          available: 45,
          icu: 50,
          icu_available: 8,
          emergency: 25,
          emergency_available: 12
        },
        specialties: ['Cardiology', 'Trauma', 'Emergency Medicine'],
        current_wait_time: 15,
        ambulance_diversion: false,
        last_updated: new Date().toISOString(),
        status: 'normal'
      },
      {
        id: 'hospital-2',
        name: 'Regional Medical Center',
        address: '456 Health Ave',
        coordinates: [location.lat - 0.02, location.lng - 0.01],
        phone: '555-0202',
        emergency_services: true,
        trauma_center_level: 2,
        bed_capacity: {
          total: 150,
          available: 23,
          icu: 20,
          icu_available: 3,
          emergency: 15,
          emergency_available: 7
        },
        specialties: ['Pediatrics', 'Surgery', 'Emergency Medicine'],
        current_wait_time: 25,
        ambulance_diversion: false,
        last_updated: new Date().toISOString(),
        status: 'busy'
      }
    ];
  }

  // Cleanup method
  public cleanup() {
    if (this.socket) {
      this.socket.disconnect();
    }
    this.subscribers.clear();
    this.cache.clear();
  }
}

// Export singleton instance
export const realTimeDataService = new RealTimeDataService();
export default realTimeDataService;
