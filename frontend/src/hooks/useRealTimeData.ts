import { useState, useEffect, useCallback, useRef } from 'react';
import realTimeDataService, { 
  EarthquakeData, 
  WeatherAlert, 
  TrafficIncident, 
  HospitalCapacity, 
  DisasterEvent 
} from '../services/realTimeDataService';

export interface RealTimeDataState {
  earthquakes: EarthquakeData[];
  weatherAlerts: WeatherAlert[];
  trafficIncidents: TrafficIncident[];
  hospitalCapacity: HospitalCapacity[];
  disasterEvents: DisasterEvent[];
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

export interface UseRealTimeDataOptions {
  location?: { lat: number; lng: number; radius?: number };
  autoRefresh?: boolean;
  refreshInterval?: number; // milliseconds
  dataTypes?: ('earthquakes' | 'weather' | 'traffic' | 'hospitals' | 'disasters')[];
}

export const useRealTimeData = (options: UseRealTimeDataOptions = {}) => {
  const {
    location,
    autoRefresh = true,
    refreshInterval = 120000, // 2 minutes
    dataTypes = ['earthquakes', 'weather', 'traffic', 'hospitals', 'disasters']
  } = options;

  const [data, setData] = useState<RealTimeDataState>({
    earthquakes: [],
    weatherAlerts: [],
    trafficIncidents: [],
    hospitalCapacity: [],
    disasterEvents: [],
    loading: true,
    error: null,
    lastUpdated: null
  });

  const refreshIntervalRef = useRef<NodeJS.Timeout>();
  const unsubscribeFunctions = useRef<(() => void)[]>([]);

  // Update a specific data type
  const updateDataType = useCallback((type: string, newData: unknown) => {
    setData(prevData => {
      const updatedData = { ...prevData };
      
      switch (type) {
        case 'earthquakes':
          updatedData.earthquakes = Array.isArray(newData) ? newData : [newData];
          break;
        case 'weather':
          updatedData.weatherAlerts = Array.isArray(newData) ? newData : [newData];
          break;
        case 'traffic':
          updatedData.trafficIncidents = Array.isArray(newData) ? newData : [newData];
          break;
        case 'hospitals':
          updatedData.hospitalCapacity = Array.isArray(newData) ? newData : [newData];
          break;
        case 'disasters':
          updatedData.disasterEvents = Array.isArray(newData) ? newData : [newData];
          break;
      }
      
      updatedData.lastUpdated = new Date().toISOString();
      return updatedData;
    });
  }, []);

  // Fetch all data
  const fetchAllData = useCallback(async () => {
    if (!location && (dataTypes.includes('traffic') || dataTypes.includes('hospitals'))) {
      setData(prev => ({ ...prev, error: 'Location is required for traffic and hospital data' }));
      return;
    }

    setData(prev => ({ ...prev, loading: true, error: null }));

    try {
      const locationWithRadius = location ? { ...location, radius: location.radius || 50 } : undefined;
      
      const promises: Promise<{ type: string; data: unknown }>[] = [];
      
      if (dataTypes.includes('earthquakes')) {
        promises.push(
          realTimeDataService.fetchEarthquakeData(2.5, 'day', locationWithRadius)
            .then(result => ({ type: 'earthquakes', data: result }))
        );
      }
      
      if (dataTypes.includes('weather')) {
        promises.push(
          realTimeDataService.fetchWeatherAlerts(location)
            .then(result => ({ type: 'weather', data: result }))
        );
      }
      
      if (dataTypes.includes('traffic') && location) {
        promises.push(
          realTimeDataService.fetchTrafficData(locationWithRadius!)
            .then(result => ({ type: 'traffic', data: result }))
        );
      }
      
      if (dataTypes.includes('hospitals') && location) {
        promises.push(
          realTimeDataService.fetchHospitalCapacity(locationWithRadius!)
            .then(result => ({ type: 'hospitals', data: result }))
        );
      }
      
      if (dataTypes.includes('disasters')) {
        promises.push(
          realTimeDataService.fetchDisasterEvents(locationWithRadius)
            .then(result => ({ type: 'disasters', data: result }))
        );
      }

      const results = await Promise.allSettled(promises);
      
      let hasError = false;
      const errors: string[] = [];

      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          updateDataType(result.value.type, result.value.data);
        } else {
          hasError = true;
          errors.push(`Failed to fetch ${dataTypes[index]}: ${result.reason.message}`);
        }
      });

      setData(prev => ({
        ...prev,
        loading: false,
        error: hasError ? errors.join('; ') : null,
        lastUpdated: new Date().toISOString()
      }));

    } catch (error) {
      console.error('Error fetching real-time data:', error);
      setData(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }));
    }
  }, [location, dataTypes, updateDataType]);

  // Set up real-time subscriptions
  const setupSubscriptions = useCallback(() => {
    // Clear existing subscriptions
    unsubscribeFunctions.current.forEach(unsubscribe => unsubscribe());
    unsubscribeFunctions.current = [];

    // Subscribe to relevant data types
    if (dataTypes.includes('earthquakes')) {
      const unsubscribe = realTimeDataService.subscribe('earthquakes', (earthquakeData) => {
        updateDataType('earthquakes', earthquakeData);
      });
      unsubscribeFunctions.current.push(unsubscribe);
    }

    if (dataTypes.includes('weather')) {
      const unsubscribe = realTimeDataService.subscribe('weather', (weatherData) => {
        updateDataType('weather', weatherData);
      });
      unsubscribeFunctions.current.push(unsubscribe);
    }

    if (dataTypes.includes('traffic')) {
      const unsubscribe = realTimeDataService.subscribe('traffic', (trafficData) => {
        updateDataType('traffic', trafficData);
      });
      unsubscribeFunctions.current.push(unsubscribe);
    }

    if (dataTypes.includes('hospitals')) {
      const unsubscribe = realTimeDataService.subscribe('hospitals', (hospitalData) => {
        updateDataType('hospitals', hospitalData);
      });
      unsubscribeFunctions.current.push(unsubscribe);
    }

    if (dataTypes.includes('disasters')) {
      const unsubscribe = realTimeDataService.subscribe('disasters', (disasterData) => {
        updateDataType('disasters', disasterData);
      });
      unsubscribeFunctions.current.push(unsubscribe);
    }
  }, [dataTypes, updateDataType]);

  // Initialize data and subscriptions
  useEffect(() => {
    fetchAllData();
    setupSubscriptions();

    // Set up auto-refresh if enabled
    if (autoRefresh && refreshInterval > 0) {
      refreshIntervalRef.current = setInterval(fetchAllData, refreshInterval);
    }

    return () => {
      // Cleanup interval
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
      
      // Cleanup subscriptions
      unsubscribeFunctions.current.forEach(unsubscribe => unsubscribe());
    };
  }, [fetchAllData, setupSubscriptions, autoRefresh, refreshInterval]);

  // Manual refresh function
  const refresh = useCallback(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Get filtered data based on severity/priority
  const getHighPriorityAlerts = useCallback(() => {
    const alerts: Array<{
      id: string;
      type: 'earthquake' | 'weather' | 'traffic' | 'hospital' | 'disaster';
      severity: 'low' | 'medium' | 'high' | 'critical';
      title: string;
      description: string;
      coordinates?: [number, number];
      timestamp: string;
    }> = [];

    // High magnitude earthquakes
    data.earthquakes
      .filter(eq => eq.magnitude >= 5.0 || eq.alert === 'red' || eq.alert === 'orange')
      .forEach(eq => {
        alerts.push({
          id: eq.id,
          type: 'earthquake',
          severity: eq.magnitude >= 7.0 ? 'critical' : eq.magnitude >= 6.0 ? 'high' : 'medium',
          title: `M${eq.magnitude} Earthquake`,
          description: eq.place,
          coordinates: eq.coordinates,
          timestamp: eq.time
        });
      });

    // Severe weather alerts
    data.weatherAlerts
      .filter(alert => alert.severity === 'severe' || alert.severity === 'extreme')
      .forEach(alert => {
        alerts.push({
          id: alert.id,
          type: 'weather',
          severity: alert.severity === 'extreme' ? 'critical' : 'high',
          title: alert.headline,
          description: alert.description,
          coordinates: alert.coordinates[0],
          timestamp: alert.effective
        });
      });

    // Critical traffic incidents
    data.trafficIncidents
      .filter(incident => incident.severity === 'high' || incident.severity === 'critical')
      .forEach(incident => {
        alerts.push({
          id: incident.id,
          type: 'traffic',
          severity: incident.severity as 'low' | 'medium' | 'high' | 'critical',
          title: incident.title,
          description: incident.description,
          coordinates: incident.coordinates,
          timestamp: incident.start_time
        });
      });

    // Hospital capacity issues
    data.hospitalCapacity
      .filter(hospital => hospital.status === 'critical' || hospital.ambulance_diversion)
      .forEach(hospital => {
        alerts.push({
          id: hospital.id,
          type: 'hospital',
          severity: hospital.status === 'critical' ? 'critical' : 'high',
          title: `${hospital.name} - Capacity Issue`,
          description: hospital.ambulance_diversion 
            ? 'On ambulance diversion' 
            : `Only ${hospital.bed_capacity.available} beds available`,
          coordinates: hospital.coordinates,
          timestamp: hospital.last_updated
        });
      });

    // Active disasters
    data.disasterEvents
      .filter(disaster => disaster.status === 'active' && disaster.severity === 'emergency')
      .forEach(disaster => {
        alerts.push({
          id: disaster.id,
          type: 'disaster',
          severity: 'critical',
          title: disaster.title,
          description: disaster.description,
          coordinates: disaster.coordinates,
          timestamp: disaster.start_time
        });
      });

    // Sort by severity and timestamp
    return alerts.sort((a, b) => {
      const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      const severityDiff = severityOrder[b.severity] - severityOrder[a.severity];
      if (severityDiff !== 0) return severityDiff;
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });
  }, [data]);

  // Get statistics
  const getStatistics = useCallback(() => {
    return {
      totalEarthquakes: data.earthquakes.length,
      significantEarthquakes: data.earthquakes.filter(eq => eq.magnitude >= 4.0).length,
      activeWeatherAlerts: data.weatherAlerts.length,
      severeWeatherAlerts: data.weatherAlerts.filter(alert => 
        alert.severity === 'severe' || alert.severity === 'extreme'
      ).length,
      trafficIncidents: data.trafficIncidents.length,
      criticalTrafficIncidents: data.trafficIncidents.filter(incident => 
        incident.severity === 'high' || incident.severity === 'critical'
      ).length,
      availableHospitals: data.hospitalCapacity.filter(hospital => 
        hospital.status !== 'closed' && !hospital.ambulance_diversion
      ).length,
      hospitalCapacityIssues: data.hospitalCapacity.filter(hospital => 
        hospital.status === 'critical' || hospital.ambulance_diversion
      ).length,
      activeDisasters: data.disasterEvents.filter(disaster => 
        disaster.status === 'active'
      ).length,
      emergencyDisasters: data.disasterEvents.filter(disaster => 
        disaster.status === 'active' && disaster.severity === 'emergency'
      ).length
    };
  }, [data]);

  return {
    ...data,
    refresh,
    getHighPriorityAlerts,
    getStatistics
  };
};

export default useRealTimeData;
