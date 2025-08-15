import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import winston from 'winston';
import Redis from 'ioredis';
import { EventEmitter } from 'events';

/**
 * Emergency Services Integration
 * Direct API integration with 911 services, hospitals, and transportation authorities
 */

export interface Emergency911Service {
  id: string;
  name: string;
  jurisdiction: string;
  apiEndpoint: string;
  apiKey: string;
  protocols: string[];
  capabilities: string[];
  responseTime: number; // average in seconds
  coverage: {
    lat: number;
    lng: number;
    radius: number; // km
  };
  status: 'active' | 'maintenance' | 'offline';
  priority: number;
}

export interface HospitalSystem {
  id: string;
  name: string;
  network: string;
  apiEndpoint: string;
  apiKey: string;
  services: string[];
  capacity: {
    emergency: number;
    icu: number;
    surgery: number;
    beds: number;
  };
  currentLoad: {
    emergency: number;
    icu: number;
    surgery: number;
    beds: number;
  };
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  status: 'accepting' | 'diversion' | 'critical' | 'closed';
  lastUpdated: Date;
}

export interface TransportationAuthority {
  id: string;
  name: string;
  type: 'traffic' | 'transit' | 'aviation' | 'maritime';
  apiEndpoint: string;
  apiKey: string;
  coverage: string[];
  capabilities: string[];
  realTimeData: boolean;
  status: 'operational' | 'limited' | 'down';
}

export interface EmergencyDispatch {
  id: string;
  incidentId: string;
  priority: 1 | 2 | 3 | 4 | 5; // 1 = highest
  type: 'medical' | 'fire' | 'police' | 'rescue' | 'hazmat' | 'multi-agency';
  location: {
    lat: number;
    lng: number;
    address: string;
    landmarks?: string[];
  };
  description: string;
  requestedServices: string[];
  assignedUnits: string[];
  estimatedResponse: number; // minutes
  status: 'pending' | 'dispatched' | 'en-route' | 'on-scene' | 'resolved' | 'cancelled';
  timestamp: Date;
  updates: Array<{
    timestamp: Date;
    status: string;
    message: string;
    unitId?: string;
  }>;
}

export interface HospitalAvailability {
  hospitalId: string;
  specialties: Array<{
    service: string;
    available: boolean;
    waitTime: number; // minutes
    capacity: number;
    current: number;
  }>;
  emergencyRoom: {
    waitTime: number;
    traumaBays: number;
    availableBays: number;
    diversion: boolean;
  };
  estimatedArrival: number; // minutes
  acceptingPatients: boolean;
  specialInstructions?: string;
}

export interface TrafficManagement {
  incidentId: string;
  affectedRoutes: string[];
  alternativeRoutes: string[];
  trafficSignals: Array<{
    intersectionId: string;
    status: 'normal' | 'emergency' | 'offline';
    timing: any;
  }>;
  roadClosures: Array<{
    roadId: string;
    section: string;
    reason: string;
    duration: number;
    alternates: string[];
  }>;
  estimatedImpact: {
    delayMinutes: number;
    affectedVehicles: number;
    detourDistance: number;
  };
}

class EmergencyServicesIntegration extends EventEmitter {
  private static instance: EmergencyServicesIntegration;
  private logger!: winston.Logger;
  private redis: Redis = new Redis;
  private httpClient!: AxiosInstance;
  
  // Service connections
  private service911: Map<string, Emergency911Service> = new Map();
  private hospitals: Map<string, HospitalSystem> = new Map();
  private transportation: Map<string, TransportationAuthority> = new Map();
  
  // Active dispatches and monitoring
  private activeDispatches: Map<string, EmergencyDispatch> = new Map();
  private monitoringInterval: NodeJS.Timeout | null = null;

  // Integration endpoints
  private readonly ENDPOINTS = {
    DISPATCH_911: '/api/dispatch',
    HOSPITAL_AVAILABILITY: '/api/availability',
    TRAFFIC_MANAGEMENT: '/api/traffic',
    UNIT_STATUS: '/api/units/status',
    INCIDENT_UPDATE: '/api/incident/update'
  };

  private constructor() {
    super();
    this.initializeLogger();
    this.initializeRedis();
    this.initializeHttpClient();
    this.initializeServices();
  }

  static getInstance(): EmergencyServicesIntegration {
    if (!EmergencyServicesIntegration.instance) {
      EmergencyServicesIntegration.instance = new EmergencyServicesIntegration();
    }
    return EmergencyServicesIntegration.instance;
  }

  /**
   * Initialize logger
   */
  private initializeLogger(): void {
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      transports: [
        new winston.transports.File({ filename: 'logs/emergency-integration-error.log', level: 'error' }),
        new winston.transports.File({ filename: 'logs/emergency-integration-combined.log' }),
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          )
        })
      ]
    });
  }

  /**
   * Initialize Redis connection
   */
  private initializeRedis(): void {
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      enableReadyCheck: false,
      maxRetriesPerRequest: null,
      lazyConnect: true
    });

    this.redis.on('connect', () => {
      this.logger.info('Emergency Services Integration connected to Redis');
    });

    this.redis.on('error', (error) => {
      this.logger.error('Redis connection error:', error);
    });
  }

  /**
   * Initialize HTTP client with retry logic
   */
  private initializeHttpClient(): void {
    this.httpClient = axios.create({
      timeout: 30000, // 30 second timeout for emergency services
      headers: {
        'User-Agent': 'DisasterManagement-EmergencyIntegration/1.0',
        'Content-Type': 'application/json'
      }
    });

    // Request interceptor for authentication and logging
    this.httpClient.interceptors.request.use(
      (config) => {
        this.logger.debug(`Emergency API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        this.logger.error('Emergency API Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor for logging and error handling
    this.httpClient.interceptors.response.use(
      (response) => {
        this.logger.debug(`Emergency API Response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        this.logger.error('Emergency API Response Error:', error);
        return Promise.reject(error);
      }
    );
  }

  /**
   * Initialize emergency services
   */
  private initializeServices(): void {
    // Initialize 911 services
    this.service911.set('central-dispatch', {
      id: 'central-dispatch',
      name: 'Central Emergency Dispatch',
      jurisdiction: 'City-wide',
      apiEndpoint: process.env.DISPATCH_911_API || 'http://dispatch.city.gov/api',
      apiKey: process.env.DISPATCH_911_KEY || '',
      protocols: ['NENA', 'E911', 'NG911'],
      capabilities: ['voice', 'text', 'video', 'data'],
      responseTime: 45, // seconds
      coverage: {
        lat: parseFloat(process.env.CITY_CENTER_LAT || '40.7128'),
        lng: parseFloat(process.env.CITY_CENTER_LNG || '-74.0060'),
        radius: 50 // km
      },
      status: 'active',
      priority: 1
    });

    // Initialize hospital systems
    this.hospitals.set('general-hospital', {
      id: 'general-hospital',
      name: 'General Hospital',
      network: 'City Health Network',
      apiEndpoint: process.env.HOSPITAL_API || 'http://hospital.city.gov/api',
      apiKey: process.env.HOSPITAL_API_KEY || '',
      services: ['emergency', 'trauma', 'cardiac', 'stroke', 'burn', 'pediatric'],
      capacity: {
        emergency: 50,
        icu: 20,
        surgery: 10,
        beds: 300
      },
      currentLoad: {
        emergency: 0,
        icu: 0,
        surgery: 0,
        beds: 0
      },
      location: {
        lat: parseFloat(process.env.HOSPITAL_LAT || '40.7589'),
        lng: parseFloat(process.env.HOSPITAL_LNG || '-73.9851'),
        address: '123 Health Street, City, State 12345'
      },
      status: 'accepting',
      lastUpdated: new Date()
    });

    // Initialize transportation authorities
    this.transportation.set('traffic-management', {
      id: 'traffic-management',
      name: 'City Traffic Management Center',
      type: 'traffic',
      apiEndpoint: process.env.TRAFFIC_API || 'http://traffic.city.gov/api',
      apiKey: process.env.TRAFFIC_API_KEY || '',
      coverage: ['highways', 'arterials', 'local-roads'],
      capabilities: ['signal-control', 'ramp-metering', 'message-boards', 'cameras'],
      realTimeData: true,
      status: 'operational'
    });

    this.logger.info('Emergency services initialized');
  }

  /**
   * Dispatch emergency services
   */
  async dispatchEmergency(incident: {
    priority: 1 | 2 | 3 | 4 | 5;
    type: 'medical' | 'fire' | 'police' | 'rescue' | 'hazmat' | 'multi-agency';
    location: { lat: number; lng: number; address: string };
    description: string;
    reportedBy: string;
    contactInfo?: string;
    specialInstructions?: string;
  }): Promise<EmergencyDispatch> {
    try {
      const dispatch: EmergencyDispatch = {
        id: `dispatch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        incidentId: incident.reportedBy,
        priority: incident.priority,
        type: incident.type,
        location: incident.location,
        description: incident.description,
        requestedServices: this.determineRequiredServices(incident.type, incident.priority),
        assignedUnits: [],
        estimatedResponse: this.calculateResponseTime(incident.location, incident.priority),
        status: 'pending',
        timestamp: new Date(),
        updates: [{
          timestamp: new Date(),
          status: 'received',
          message: 'Emergency dispatch request received and being processed'
        }]
      };

      // Store dispatch in Redis and local memory
      await this.redis.setex(
        `dispatch:${dispatch.id}`,
        86400, // 24 hours
        JSON.stringify(dispatch)
      );
      this.activeDispatches.set(dispatch.id, dispatch);

      // Send to 911 dispatch system
      await this.send911Dispatch(dispatch, incident);

      // Coordinate with hospitals for medical emergencies
      if (incident.type === 'medical') {
        await this.coordinateHospitalResponse(dispatch);
      }

      // Manage traffic for major incidents
      if (incident.priority <= 2) {
        await this.manageTrafficForIncident(dispatch);
      }

      // Emit event for real-time updates
      this.emit('dispatch:created', dispatch);

      this.logger.info(`Emergency dispatched: ${dispatch.id} - ${incident.type} (Priority ${incident.priority})`);
      return dispatch;

    } catch (error) {
      this.logger.error('Error dispatching emergency:', error);
      throw error;
    }
  }

  /**
   * Send dispatch to 911 system
   */
  private async send911Dispatch(dispatch: EmergencyDispatch, incident: any): Promise<void> {
    try {
      const service = this.service911.get('central-dispatch');
      if (!service) {
        throw new Error('No 911 service available');
      }

      const dispatchData = {
        incidentId: dispatch.id,
        priority: dispatch.priority,
        type: dispatch.type,
        location: {
          latitude: dispatch.location.lat,
          longitude: dispatch.location.lng,
          address: dispatch.location.address
        },
        description: dispatch.description,
        caller: incident.reportedBy,
        timestamp: dispatch.timestamp.toISOString(),
        requestedServices: dispatch.requestedServices
      };

      const response = await this.httpClient.post(
        `${service.apiEndpoint}${this.ENDPOINTS.DISPATCH_911}`,
        dispatchData,
        {
          headers: {
            'Authorization': `Bearer ${service.apiKey}`,
            'X-Jurisdiction': service.jurisdiction
          }
        }
      );

      if (response.data.dispatchNumber) {
        dispatch.assignedUnits = response.data.assignedUnits || [];
        dispatch.status = 'dispatched';
        dispatch.updates.push({
          timestamp: new Date(),
          status: 'dispatched',
          message: `Dispatched to 911 system. Dispatch #${response.data.dispatchNumber}`
        });

        await this.updateDispatch(dispatch);
      }

    } catch (error) {
      this.logger.error('Error sending 911 dispatch:', error);
      dispatch.updates.push({
        timestamp: new Date(),
        status: 'error',
        message: 'Failed to dispatch to 911 system'
      });
      await this.updateDispatch(dispatch);
      throw error;
    }
  }

  /**
   * Coordinate hospital response for medical emergencies
   */
  private async coordinateHospitalResponse(dispatch: EmergencyDispatch): Promise<void> {
    try {
      // Find nearest hospitals
      const nearbyHospitals = await this.findNearestHospitals(
        dispatch.location.lat,
        dispatch.location.lng,
        5 // 5 hospitals
      );

      // Check availability
      const availabilities: HospitalAvailability[] = [];
      for (const hospital of nearbyHospitals) {
        try {
          const availability = await this.checkHospitalAvailability(hospital.id, dispatch.type);
          if (availability.acceptingPatients) {
            availabilities.push(availability);
          }
        } catch (error) {
          this.logger.warn(`Failed to check availability for ${hospital.id}:`, error);
        }
      }

      // Sort by availability and response time
      availabilities.sort((a, b) => {
        if (a.emergencyRoom.diversion !== b.emergencyRoom.diversion) {
          return a.emergencyRoom.diversion ? 1 : -1; // Non-diversion first
        }
        return a.estimatedArrival - b.estimatedArrival;
      });

      // Store hospital recommendations
      await this.redis.setex(
        `dispatch:${dispatch.id}:hospitals`,
        3600, // 1 hour
        JSON.stringify(availabilities)
      );

      dispatch.updates.push({
        timestamp: new Date(),
        status: 'hospitals-coordinated',
        message: `${availabilities.length} hospitals available for patient transport`
      });

      await this.updateDispatch(dispatch);

      this.logger.info(`Hospital coordination complete for dispatch ${dispatch.id}`);

    } catch (error) {
      this.logger.error('Error coordinating hospital response:', error);
    }
  }

  /**
   * Manage traffic for major incidents
   */
  private async manageTrafficForIncident(dispatch: EmergencyDispatch): Promise<TrafficManagement> {
    try {
      const trafficAuthority = this.transportation.get('traffic-management');
      if (!trafficAuthority) {
        throw new Error('Traffic management system not available');
      }

      const trafficData = {
        incidentId: dispatch.id,
        location: dispatch.location,
        priority: dispatch.priority,
        estimatedDuration: this.estimateIncidentDuration(dispatch.type, dispatch.priority),
        emergencyVehicles: dispatch.assignedUnits
      };

      const response = await this.httpClient.post(
        `${trafficAuthority.apiEndpoint}${this.ENDPOINTS.TRAFFIC_MANAGEMENT}`,
        trafficData,
        {
          headers: {
            'Authorization': `Bearer ${trafficAuthority.apiKey}`,
            'X-Priority': 'EMERGENCY'
          }
        }
      );

      const trafficManagement: TrafficManagement = {
        incidentId: dispatch.id,
        affectedRoutes: response.data.affectedRoutes || [],
        alternativeRoutes: response.data.alternativeRoutes || [],
        trafficSignals: response.data.signalChanges || [],
        roadClosures: response.data.roadClosures || [],
        estimatedImpact: response.data.estimatedImpact || {
          delayMinutes: 0,
          affectedVehicles: 0,
          detourDistance: 0
        }
      };

      // Store traffic management plan
      await this.redis.setex(
        `dispatch:${dispatch.id}:traffic`,
        7200, // 2 hours
        JSON.stringify(trafficManagement)
      );

      dispatch.updates.push({
        timestamp: new Date(),
        status: 'traffic-managed',
        message: 'Traffic management plan activated'
      });

      await this.updateDispatch(dispatch);

      this.emit('traffic:managed', trafficManagement);

      this.logger.info(`Traffic management activated for dispatch ${dispatch.id}`);
      return trafficManagement;

    } catch (error) {
      this.logger.error('Error managing traffic for incident:', error);
      throw error;
    }
  }

  /**
   * Check hospital availability
   */
  async checkHospitalAvailability(hospitalId: string, incidentType: string): Promise<HospitalAvailability> {
    try {
      const hospital = this.hospitals.get(hospitalId);
      if (!hospital) {
        throw new Error(`Hospital ${hospitalId} not found`);
      }

      const response = await this.httpClient.get(
        `${hospital.apiEndpoint}${this.ENDPOINTS.HOSPITAL_AVAILABILITY}`,
        {
          headers: {
            'Authorization': `Bearer ${hospital.apiKey}`
          },
          params: {
            incidentType,
            timestamp: new Date().toISOString()
          }
        }
      );

      const availability: HospitalAvailability = {
        hospitalId,
        specialties: response.data.specialties || [],
        emergencyRoom: response.data.emergencyRoom || {
          waitTime: 30,
          traumaBays: 5,
          availableBays: 3,
          diversion: false
        },
        estimatedArrival: this.calculateHospitalArrivalTime(hospital),
        acceptingPatients: response.data.acceptingPatients !== false,
        specialInstructions: response.data.specialInstructions
      };

      // Cache availability data
      await this.redis.setex(
        `hospital:${hospitalId}:availability`,
        300, // 5 minutes cache
        JSON.stringify(availability)
      );

      return availability;

    } catch (error) {
      this.logger.error(`Error checking hospital availability for ${hospitalId}:`, error);
      
      // Return fallback availability
      return {
        hospitalId,
        specialties: [],
        emergencyRoom: {
          waitTime: 60,
          traumaBays: 0,
          availableBays: 0,
          diversion: true
        },
        estimatedArrival: 30,
        acceptingPatients: false,
        specialInstructions: 'Hospital status unknown - contact directly'
      };
    }
  }

  /**
   * Update dispatch status
   */
  async updateDispatch(dispatch: EmergencyDispatch): Promise<void> {
    try {
      // Update in Redis
      await this.redis.setex(
        `dispatch:${dispatch.id}`,
        86400,
        JSON.stringify(dispatch)
      );

      // Update in memory
      this.activeDispatches.set(dispatch.id, dispatch);

      // Emit update event
      this.emit('dispatch:updated', dispatch);

      this.logger.debug(`Dispatch updated: ${dispatch.id} - Status: ${dispatch.status}`);

    } catch (error) {
      this.logger.error('Error updating dispatch:', error);
    }
  }

  /**
   * Get dispatch status
   */
  async getDispatchStatus(dispatchId: string): Promise<EmergencyDispatch | null> {
    try {
      // Try memory first
      let dispatch = this.activeDispatches.get(dispatchId);
      
      if (!dispatch) {
        // Try Redis
        const cached = await this.redis.get(`dispatch:${dispatchId}`);
        if (cached) {
          dispatch = JSON.parse(cached);
          this.activeDispatches.set(dispatchId, dispatch!);
        }
      }

      return dispatch || null;

    } catch (error) {
      this.logger.error('Error getting dispatch status:', error);
      return null;
    }
  }

  /**
   * Get real-time hospital status
   */
  async getHospitalStatus(): Promise<HospitalSystem[]> {
    try {
      const hospitals: HospitalSystem[] = [];
      
      for (const hospital of this.hospitals.values()) {
        try {
          // Get real-time data
          const response = await this.httpClient.get(
            `${hospital.apiEndpoint}/status`,
            {
              headers: {
                'Authorization': `Bearer ${hospital.apiKey}`
              },
              timeout: 5000
            }
          );

          hospital.currentLoad = response.data.currentLoad || hospital.currentLoad;
          hospital.status = response.data.status || hospital.status;
          hospital.lastUpdated = new Date();

          hospitals.push(hospital);

        } catch (error) {
          this.logger.warn(`Failed to get real-time status for ${hospital.id}:`, error);
          hospitals.push(hospital); // Include with cached data
        }
      }

      return hospitals;

    } catch (error) {
      this.logger.error('Error getting hospital status:', error);
      return Array.from(this.hospitals.values());
    }
  }

  /**
   * Start monitoring active dispatches
   */
  startMonitoring(): void {
    this.monitoringInterval = setInterval(async () => {
      for (const dispatch of this.activeDispatches.values()) {
        if (dispatch.status === 'resolved' || dispatch.status === 'cancelled') {
          continue;
        }

        try {
          await this.checkDispatchProgress(dispatch);
        } catch (error) {
          this.logger.error(`Error monitoring dispatch ${dispatch.id}:`, error);
        }
      }
    }, 30000); // Check every 30 seconds

    this.logger.info('Dispatch monitoring started');
  }

  /**
   * Check progress of active dispatch
   */
  private async checkDispatchProgress(dispatch: EmergencyDispatch): Promise<void> {
    try {
      // Check with 911 system for unit status
      const service = this.service911.get('central-dispatch');
      if (!service) return;

      const response = await this.httpClient.get(
        `${service.apiEndpoint}${this.ENDPOINTS.UNIT_STATUS}/${dispatch.id}`,
        {
          headers: {
            'Authorization': `Bearer ${service.apiKey}`
          },
          timeout: 10000
        }
      );

      if (response.data.status !== dispatch.status) {
        dispatch.status = response.data.status;
        dispatch.updates.push({
          timestamp: new Date(),
          status: response.data.status,
          message: response.data.statusMessage || `Status updated to ${response.data.status}`
        });

        await this.updateDispatch(dispatch);
      }

    } catch (error) {
      this.logger.debug(`Could not check progress for dispatch ${dispatch.id}:`, error);
    }
  }

  // Helper methods

  private determineRequiredServices(type: string, priority: number): string[] {
    const services: string[] = [];

    switch (type) {
      case 'medical':
        services.push('ambulance', 'paramedic');
        if (priority <= 2) services.push('fire-rescue');
        break;
      case 'fire':
        services.push('fire-engine', 'fire-rescue', 'ambulance');
        if (priority <= 2) services.push('hazmat', 'police');
        break;
      case 'police':
        services.push('police-patrol');
        if (priority <= 2) services.push('police-supervisor');
        break;
      case 'rescue':
        services.push('fire-rescue', 'ambulance', 'police');
        break;
      case 'hazmat':
        services.push('hazmat', 'fire-engine', 'ambulance', 'police');
        break;
      case 'multi-agency':
        services.push('police', 'fire-engine', 'ambulance');
        break;
    }

    return services;
  }

  private calculateResponseTime(location: { lat: number; lng: number }, priority: number): number {
    // Base response time calculation
    let baseTime = 8; // minutes

    // Adjust for priority
    switch (priority) {
      case 1: baseTime = 4; break;  // Life-threatening
      case 2: baseTime = 6; break;  // Emergency
      case 3: baseTime = 10; break; // Urgent
      case 4: baseTime = 15; break; // Less urgent
      case 5: baseTime = 20; break; // Non-emergency
    }

    // Add random variation for traffic/distance
    return baseTime + Math.floor(Math.random() * 5);
  }

  private async findNearestHospitals(lat: number, lng: number, count: number): Promise<HospitalSystem[]> {
    const hospitals = Array.from(this.hospitals.values());
    
    return hospitals
      .map(hospital => ({
        ...hospital,
        distance: this.calculateDistance(lat, lng, hospital.location.lat, hospital.location.lng)
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, count);
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private calculateHospitalArrivalTime(hospital: HospitalSystem): number {
    // Simplified calculation - in real implementation would use traffic APIs
    return 15 + Math.floor(Math.random() * 10); // 15-25 minutes
  }

  private estimateIncidentDuration(type: string, priority: number): number {
    let baseDuration = 60; // minutes

    switch (type) {
      case 'medical': baseDuration = 30; break;
      case 'fire': baseDuration = 120; break;
      case 'police': baseDuration = 45; break;
      case 'rescue': baseDuration = 180; break;
      case 'hazmat': baseDuration = 240; break;
      case 'multi-agency': baseDuration = 180; break;
    }

    // Higher priority incidents may take longer due to complexity
    if (priority <= 2) baseDuration *= 1.5;

    return Math.floor(baseDuration);
  }

  /**
   * Graceful shutdown
   */
  async shutdown(): Promise<void> {
    try {
      if (this.monitoringInterval) {
        clearInterval(this.monitoringInterval);
      }

      await this.redis.quit();
      this.logger.info('Emergency Services Integration shut down gracefully');

    } catch (error) {
      this.logger.error('Error during shutdown:', error);
    }
  }
}

export default EmergencyServicesIntegration;
