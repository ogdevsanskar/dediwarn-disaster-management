import mqtt from 'mqtt';
import winston from 'winston';
import Redis from 'ioredis';
import { EventEmitter } from 'events';
import axios from 'axios';
import WebSocket from 'ws';

/**
 * IoT Sensor Network Integration
 * Environmental sensor integration, early warning systems, air quality monitoring, structural integrity alerts
 */

export interface SensorDevice {
  id: string;
  name: string;
  type: 'environmental' | 'structural' | 'air-quality' | 'seismic' | 'weather' | 'fire' | 'flood' | 'chemical';
  location: {
    lat: number;
    lng: number;
    altitude?: number;
    address: string;
    zone: string;
    building?: string;
    floor?: number;
  };
  specifications: {
    manufacturer: string;
    model: string;
    sensors: string[];
    accuracy: Record<string, number>;
    range: Record<string, { min: number; max: number; unit: string }>;
    sampleRate: number; // Hz
    powerSource: 'battery' | 'solar' | 'grid' | 'hybrid';
    connectivity: 'wifi' | 'cellular' | 'lora' | 'zigbee' | 'bluetooth';
  };
  status: 'online' | 'offline' | 'maintenance' | 'error' | 'low-battery';
  lastSeen: Date;
  batteryLevel?: number; // percentage
  signalStrength?: number; // dBm
  firmware: {
    version: string;
    lastUpdate: Date;
    autoUpdate: boolean;
  };
  calibration: {
    lastCalibrated: Date;
    nextCalibration: Date;
    calibrationData: Record<string, any>;
  };
  alerts: {
    enabled: boolean;
    thresholds: Record<string, { min?: number; max?: number; critical?: boolean }>;
    recipients: string[];
  };
}

export interface SensorReading {
  deviceId: string;
  timestamp: Date;
  readings: Record<string, {
    value: number;
    unit: string;
    quality: 'excellent' | 'good' | 'fair' | 'poor' | 'invalid';
    confidence: number; // 0-1
  }>;
  location: {
    lat: number;
    lng: number;
    altitude?: number;
  };
  metadata: {
    batteryLevel?: number;
    signalStrength?: number;
    temperature?: number; // internal sensor temp
    humidity?: number; // internal humidity
  };
  alerts: Array<{
    type: 'threshold' | 'anomaly' | 'trend' | 'device-status';
    severity: 'low' | 'medium' | 'high' | 'critical';
    parameter: string;
    message: string;
    value?: number;
    threshold?: number;
  }>;
  processed: boolean;
}

export interface EnvironmentalAlert {
  id: string;
  type: 'air-quality' | 'radiation' | 'chemical-leak' | 'noise-pollution' | 'temperature' | 'humidity' | 'wind' | 'precipitation';
  severity: 'advisory' | 'watch' | 'warning' | 'emergency';
  location: {
    lat: number;
    lng: number;
    radius: number; // km
    affectedAreas: string[];
  };
  parameters: Record<string, {
    current: number;
    threshold: number;
    unit: string;
    trend: 'rising' | 'falling' | 'stable';
  }>;
  description: string;
  recommendations: string[];
  timestamp: Date;
  duration: {
    estimated: number; // minutes
    actual?: number;
  };
  sources: string[]; // sensor device IDs
  verified: boolean;
  authorities: string[]; // notified authorities
  status: 'active' | 'monitoring' | 'resolved' | 'expired';
}

export interface StructuralAlert {
  id: string;
  buildingId: string;
  buildingName: string;
  type: 'vibration' | 'tilt' | 'crack' | 'settlement' | 'temperature-stress' | 'moisture' | 'corrosion';
  severity: 'minor' | 'moderate' | 'major' | 'critical' | 'structural-failure';
  location: {
    lat: number;
    lng: number;
    building: string;
    floor?: number;
    section?: string;
  };
  measurements: Record<string, {
    value: number;
    baseline: number;
    deviation: number;
    unit: string;
    critical: boolean;
  }>;
  riskAssessment: {
    occupancyRisk: 'safe' | 'caution' | 'evacuate' | 'immediate-danger';
    structuralIntegrity: 'intact' | 'compromised' | 'critical' | 'failure';
    progressionRate: 'slow' | 'moderate' | 'rapid' | 'immediate';
    predictedFailure?: Date;
  };
  timestamp: Date;
  sensors: string[];
  engineerNotified: boolean;
  evacuationRecommended: boolean;
  status: 'monitoring' | 'investigating' | 'mitigating' | 'resolved';
}

export interface EarlyWarningSystem {
  id: string;
  name: string;
  type: 'earthquake' | 'tsunami' | 'wildfire' | 'flood' | 'hurricane' | 'tornado' | 'industrial-accident';
  coverage: {
    lat: number;
    lng: number;
    radius: number; // km
    zones: string[];
  };
  sensors: string[]; // sensor device IDs
  algorithms: {
    detection: string;
    prediction: string;
    confidence: number; // 0-1
  };
  alertLevels: Array<{
    level: number;
    name: string;
    criteria: Record<string, number>;
    actions: string[];
    notifications: string[];
  }>;
  currentStatus: {
    level: number;
    confidence: number;
    lastUpdate: Date;
    activeSensors: number;
    totalSensors: number;
  };
  history: Array<{
    timestamp: Date;
    event: string;
    level: number;
    duration: number;
    affected: number;
    validated: boolean;
  }>;
}

export interface AirQualityIndex {
  location: {
    lat: number;
    lng: number;
    address: string;
    zone: string;
  };
  timestamp: Date;
  overall: {
    aqi: number;
    category: 'good' | 'moderate' | 'unhealthy-sensitive' | 'unhealthy' | 'very-unhealthy' | 'hazardous';
    primaryPollutant: string;
  };
  pollutants: Record<string, {
    concentration: number;
    unit: string;
    aqi: number;
    category: string;
    healthEffects: string;
  }>;
  forecast: Array<{
    timestamp: Date;
    aqi: number;
    category: string;
    confidence: number;
  }>;
  recommendations: {
    general: string[];
    sensitive: string[];
    outdoor: string[];
  };
  sensors: string[];
}

class IoTSensorNetwork extends EventEmitter {
  private static instance: IoTSensorNetwork;
  private logger!: winston.Logger;
  private redis!: Redis;
  
  // MQTT and WebSocket connections
  private mqttClient!: mqtt.MqttClient;
  private wsServer: WebSocket.Server | null = null;
  private connections: Set<WebSocket> = new Set();
  
  // Device and data management
  private sensors: Map<string, SensorDevice> = new Map();
  private readings: Map<string, SensorReading[]> = new Map(); // deviceId -> readings
  private alerts: Map<string, EnvironmentalAlert | StructuralAlert> = new Map();
  
  // Early warning systems
  private earlyWarningSystems: Map<string, EarlyWarningSystem> = new Map();
  
  // Processing intervals
  private dataProcessingInterval: NodeJS.Timeout | null = null;
  private alertProcessingInterval: NodeJS.Timeout | null = null;
  private maintenanceInterval: NodeJS.Timeout | null = null;
  
  // Configuration
  private readonly CONFIG = {
    MQTT_BROKER: process.env.MQTT_BROKER || 'mqtt://localhost:1883',
    MQTT_USERNAME: process.env.MQTT_USERNAME || '',
    MQTT_PASSWORD: process.env.MQTT_PASSWORD || '',
    WS_PORT: parseInt(process.env.IOT_WS_PORT || '8080'),
    DATA_RETENTION_HOURS: parseInt(process.env.DATA_RETENTION_HOURS || '168'), // 7 days
    ALERT_THRESHOLD_CHECK_INTERVAL: parseInt(process.env.ALERT_CHECK_INTERVAL || '30000'), // 30 seconds
    CALIBRATION_CHECK_INTERVAL: parseInt(process.env.CALIBRATION_CHECK_INTERVAL || '86400000') // 24 hours
  };

  private constructor() {
    super();
    this.initializeLogger();
    this.initializeRedis();
    this.initializeMQTT();
    this.initializeWebSocket();
    this.initializeSensors();
    this.startProcessing();
  }

  static getInstance(): IoTSensorNetwork {
    if (!IoTSensorNetwork.instance) {
      IoTSensorNetwork.instance = new IoTSensorNetwork();
    }
    return IoTSensorNetwork.instance;
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
        new winston.transports.File({ filename: 'logs/iot-sensor-error.log', level: 'error' }),
        new winston.transports.File({ filename: 'logs/iot-sensor-combined.log' }),
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
      this.logger.info('IoT Sensor Network connected to Redis');
    });

    this.redis.on('error', (error) => {
      this.logger.error('Redis connection error:', error);
    });
  }

  /**
   * Initialize MQTT client
   */
  private initializeMQTT(): void {
    const options: mqtt.IClientOptions = {
      username: this.CONFIG.MQTT_USERNAME,
      password: this.CONFIG.MQTT_PASSWORD,
      reconnectPeriod: 1000,
      connectTimeout: 30000,
      keepalive: 60,
      clean: true
    };

    this.mqttClient = mqtt.connect(this.CONFIG.MQTT_BROKER, options);

    this.mqttClient.on('connect', () => {
      this.logger.info('Connected to MQTT broker');
      
      // Subscribe to sensor topics
      const topics = [
        'sensors/+/data',
        'sensors/+/status',
        'sensors/+/alert',
        'sensors/+/heartbeat',
        'weather/+/data',
        'earthquake/+/data',
        'air-quality/+/data'
      ];
      
      topics.forEach(topic => {
        this.mqttClient.subscribe(topic, (error) => {
          if (error) {
            this.logger.error(`Failed to subscribe to ${topic}:`, error);
          } else {
            this.logger.debug(`Subscribed to ${topic}`);
          }
        });
      });
    });

    this.mqttClient.on('message', (topic, message) => {
      this.handleMQTTMessage(topic, message);
    });

    this.mqttClient.on('error', (error) => {
      this.logger.error('MQTT connection error:', error);
    });

    this.mqttClient.on('offline', () => {
      this.logger.warn('MQTT client offline');
    });
  }

  /**
   * Initialize WebSocket server for real-time updates
   */
  private initializeWebSocket(): void {
    this.wsServer = new WebSocket.Server({ 
      port: this.CONFIG.WS_PORT,
      perMessageDeflate: false 
    });

    this.wsServer.on('connection', (ws) => {
      this.connections.add(ws);
      
      ws.on('message', (message) => {
        try {
          const data = JSON.parse(message.toString());
          this.handleWebSocketMessage(ws, data);
        } catch (error) {
          this.logger.error('Invalid WebSocket message:', error);
        }
      });

      ws.on('close', () => {
        this.connections.delete(ws);
      });

      ws.on('error', (error) => {
        this.logger.error('WebSocket error:', error);
        this.connections.delete(ws);
      });

      // Send initial status
      this.sendToClient(ws, {
        type: 'status',
        data: {
          connected: true,
          sensors: this.sensors.size,
          activeSensors: Array.from(this.sensors.values()).filter(s => s.status === 'online').length
        }
      });
    });

    this.logger.info(`IoT WebSocket server started on port ${this.CONFIG.WS_PORT}`);
  }

  /**
   * Initialize default sensors
   */
  private initializeSensors(): void {
    // Environmental sensors
    this.registerSensor({
      id: 'env_001',
      name: 'Downtown Air Quality Monitor',
      type: 'air-quality',
      location: {
        lat: 40.7589,
        lng: -73.9851,
        address: '123 Main Street, Downtown',
        zone: 'downtown'
      },
      specifications: {
        manufacturer: 'AirSense Pro',
        model: 'AS-2000',
        sensors: ['PM2.5', 'PM10', 'NO2', 'O3', 'CO', 'SO2', 'temperature', 'humidity'],
        accuracy: { 'PM2.5': 0.1, 'NO2': 0.5, 'temperature': 0.1 },
        range: {
          'PM2.5': { min: 0, max: 500, unit: 'μg/m³' },
          'NO2': { min: 0, max: 200, unit: 'ppb' },
          'temperature': { min: -40, max: 80, unit: '°C' }
        },
        sampleRate: 0.1,
        powerSource: 'grid',
        connectivity: 'wifi'
      },
      status: 'online',
      lastSeen: new Date(),
      firmware: {
        version: '2.1.4',
        lastUpdate: new Date(Date.now() - 86400000 * 30),
        autoUpdate: true
      },
      calibration: {
        lastCalibrated: new Date(Date.now() - 86400000 * 90),
        nextCalibration: new Date(Date.now() + 86400000 * 90),
        calibrationData: {}
      },
      alerts: {
        enabled: true,
        thresholds: {
          'PM2.5': { max: 35, critical: true },
          'NO2': { max: 100, critical: false }
        },
        recipients: ['air-quality@city.gov', 'health@city.gov']
      }
    });

    // Structural integrity sensor
    this.registerSensor({
      id: 'struct_001',
      name: 'City Hall Structural Monitor',
      type: 'structural',
      location: {
        lat: 40.7505,
        lng: -73.9971,
        address: 'City Hall, 1st Floor',
        zone: 'civic-center',
        building: 'City Hall',
        floor: 1
      },
      specifications: {
        manufacturer: 'StructSafe',
        model: 'SS-500',
        sensors: ['accelerometer', 'tiltmeter', 'strain-gauge', 'temperature', 'humidity'],
        accuracy: { 'acceleration': 0.001, 'tilt': 0.01, 'strain': 0.1 },
        range: {
          'acceleration': { min: -10, max: 10, unit: 'm/s²' },
          'tilt': { min: -45, max: 45, unit: 'degrees' },
          'strain': { min: -1000, max: 1000, unit: 'microstrains' }
        },
        sampleRate: 100,
        powerSource: 'grid',
        connectivity: 'wifi'
      },
      status: 'online',
      lastSeen: new Date(),
      firmware: {
        version: '1.3.2',
        lastUpdate: new Date(Date.now() - 86400000 * 15),
        autoUpdate: true
      },
      calibration: {
        lastCalibrated: new Date(Date.now() - 86400000 * 30),
        nextCalibration: new Date(Date.now() + 86400000 * 60),
        calibrationData: {}
      },
      alerts: {
        enabled: true,
        thresholds: {
          'acceleration': { max: 0.1, critical: true },
          'tilt': { max: 2, critical: true },
          'strain': { max: 100, critical: false }
        },
        recipients: ['structural@city.gov', 'emergency@city.gov']
      }
    });

    // Seismic sensor for early warning
    this.registerSensor({
      id: 'seismic_001',
      name: 'Regional Seismic Monitor',
      type: 'seismic',
      location: {
        lat: 40.7282,
        lng: -74.0776,
        address: 'Emergency Operations Center',
        zone: 'regional'
      },
      specifications: {
        manufacturer: 'SeismoTech',
        model: 'ST-1000',
        sensors: ['3-axis-accelerometer', 'velocity-sensor', 'displacement-sensor'],
        accuracy: { 'acceleration': 0.0001, 'velocity': 0.001, 'displacement': 0.01 },
        range: {
          'acceleration': { min: -50, max: 50, unit: 'm/s²' },
          'velocity': { min: -10, max: 10, unit: 'm/s' },
          'displacement': { min: -1, max: 1, unit: 'm' }
        },
        sampleRate: 1000,
        powerSource: 'grid',
        connectivity: 'cellular'
      },
      status: 'online',
      lastSeen: new Date(),
      firmware: {
        version: '3.0.1',
        lastUpdate: new Date(Date.now() - 86400000 * 7),
        autoUpdate: true
      },
      calibration: {
        lastCalibrated: new Date(Date.now() - 86400000 * 14),
        nextCalibration: new Date(Date.now() + 86400000 * 30),
        calibrationData: {}
      },
      alerts: {
        enabled: true,
        thresholds: {
          'acceleration': { max: 1, critical: true },
          'velocity': { max: 0.1, critical: true }
        },
        recipients: ['seismic@city.gov', 'emergency@city.gov', 'usgs@gov']
      }
    });

    this.logger.info('Default sensors initialized');
  }

  /**
   * Register a new sensor device
   */
  registerSensor(sensor: Omit<SensorDevice, 'lastSeen' | 'status'> & Partial<Pick<SensorDevice, 'lastSeen' | 'status'>>): void {
    const device: SensorDevice = {
      ...sensor,
      status: sensor.status || 'offline',
      lastSeen: sensor.lastSeen || new Date()
    };

    this.sensors.set(device.id, device);
    this.readings.set(device.id, []);

    // Store in Redis
    this.redis.hset('iot:sensors', device.id, JSON.stringify(device));

    this.emit('sensor:registered', device);
    this.logger.info(`Sensor registered: ${device.id} (${device.type})`);
  }

  /**
   * Handle MQTT messages from sensors
   */
  private handleMQTTMessage(topic: string, message: Buffer): void {
    try {
      const [category, deviceId, messageType] = topic.split('/');
      const data = JSON.parse(message.toString());

      switch (messageType) {
        case 'data':
          this.processSensorReading(deviceId, data);
          break;
        case 'status':
          this.updateSensorStatus(deviceId, data);
          break;
        case 'alert':
          this.processSensorAlert(deviceId, data);
          break;
        case 'heartbeat':
          this.updateSensorHeartbeat(deviceId);
          break;
        default:
          this.logger.debug(`Unhandled MQTT message type: ${messageType}`);
      }

    } catch (error) {
      this.logger.error('Error handling MQTT message:', error);
    }
  }

  /**
   * Process sensor reading
   */
  private async processSensorReading(deviceId: string, data: any): Promise<void> {
    try {
      const sensor = this.sensors.get(deviceId);
      if (!sensor) {
        this.logger.warn(`Unknown sensor: ${deviceId}`);
        return;
      }

      const reading: SensorReading = {
        deviceId,
        timestamp: new Date(data.timestamp || Date.now()),
        readings: data.readings || {},
        location: data.location || sensor.location,
        metadata: data.metadata || {},
        alerts: [],
        processed: false
      };

      // Validate and enhance readings
      this.validateSensorReading(reading, sensor);
      
      // Check for alert conditions
      this.checkAlertThresholds(reading, sensor);

      // Store reading
      const deviceReadings = this.readings.get(deviceId) || [];
      deviceReadings.push(reading);
      
      // Keep only recent readings (memory optimization)
      const maxReadings = 1000;
      if (deviceReadings.length > maxReadings) {
        deviceReadings.splice(0, deviceReadings.length - maxReadings);
      }
      
      this.readings.set(deviceId, deviceReadings);

      // Store in Redis with expiration
      await this.redis.setex(
        `iot:reading:${deviceId}:${reading.timestamp.getTime()}`,
        this.CONFIG.DATA_RETENTION_HOURS * 3600,
        JSON.stringify(reading)
      );

      // Update sensor last seen
      sensor.lastSeen = reading.timestamp;
      sensor.status = 'online';
      this.sensors.set(deviceId, sensor);

      // Process reading for early warning systems
      this.processForEarlyWarning(reading, sensor);

      // Emit real-time update
      this.broadcastReading(reading);

      this.emit('reading:processed', reading);

    } catch (error) {
      this.logger.error('Error processing sensor reading:', error);
    }
  }

  /**
   * Validate sensor reading
   */
  private validateSensorReading(reading: SensorReading, sensor: SensorDevice): void {
    for (const [parameter, measurement] of Object.entries(reading.readings)) {
      const spec = sensor.specifications.range[parameter];
      if (spec) {
        const { value } = measurement;
        
        // Check if value is within sensor range
        if (value < spec.min || value > spec.max) {
          measurement.quality = 'invalid';
          measurement.confidence = 0;
        } else if (Math.abs(value - spec.min) / (spec.max - spec.min) > 0.95) {
          measurement.quality = 'poor';
          measurement.confidence = 0.3;
        } else {
          measurement.quality = 'excellent';
          measurement.confidence = 0.95;
        }
      }
    }
  }

  /**
   * Check alert thresholds
   */
  private checkAlertThresholds(reading: SensorReading, sensor: SensorDevice): void {
    if (!sensor.alerts.enabled) return;

    for (const [parameter, threshold] of Object.entries(sensor.alerts.thresholds)) {
      const measurement = reading.readings[parameter];
      if (!measurement) continue;

      let alertTriggered = false;
      let alertType = 'threshold';
      let severity: 'low' | 'medium' | 'high' | 'critical' = 'low';

      if (threshold.min !== undefined && measurement.value < threshold.min) {
        alertTriggered = true;
        severity = threshold.critical ? 'critical' : 'medium';
      }

      if (threshold.max !== undefined && measurement.value > threshold.max) {
        alertTriggered = true;
        severity = threshold.critical ? 'critical' : 'medium';
      }

      if (alertTriggered) {
        const alert = {
          type: alertType as 'threshold',
          severity,
          parameter,
          message: `${parameter} ${threshold.min ? 'below' : 'above'} threshold: ${measurement.value} ${measurement.unit}`,
          value: measurement.value,
          threshold: threshold.max || threshold.min
        };

        reading.alerts.push(alert);
        this.generateEnvironmentalAlert(sensor, parameter, measurement, threshold);
      }
    }
  }

  /**
   * Generate environmental alert
   */
  private async generateEnvironmentalAlert(
    sensor: SensorDevice, 
    parameter: string, 
    measurement: any, 
    threshold: any
  ): Promise<void> {
    try {
      const alertId = `alert_${sensor.id}_${parameter}_${Date.now()}`;
      
      const alert: EnvironmentalAlert = {
        id: alertId,
        type: this.mapParameterToAlertType(parameter),
        severity: threshold.critical ? 'emergency' : 'warning',
        location: {
          lat: sensor.location.lat,
          lng: sensor.location.lng,
          radius: this.calculateAlertRadius(sensor.type),
          affectedAreas: [sensor.location.zone]
        },
        parameters: {
          [parameter]: {
            current: measurement.value,
            threshold: threshold.max || threshold.min || 0,
            unit: measurement.unit,
            trend: await this.calculateTrend(sensor.id, parameter)
          }
        },
        description: `${parameter} levels ${threshold.max ? 'exceeded' : 'below'} safe threshold at ${sensor.location.address}`,
        recommendations: this.getRecommendations(parameter, measurement.value, threshold.critical),
        timestamp: new Date(),
        duration: {
          estimated: this.estimateAlertDuration(parameter, measurement.value)
        },
        sources: [sensor.id],
        verified: false,
        authorities: sensor.alerts.recipients,
        status: 'active'
      };

      this.alerts.set(alertId, alert);
      
      // Store in Redis
      await this.redis.setex(
        `iot:alert:${alertId}`,
        86400, // 24 hours
        JSON.stringify(alert)
      );

      // Broadcast alert
      this.broadcastAlert(alert);
      
      // Notify authorities
      await this.notifyAuthorities(alert);

      this.emit('alert:generated', alert);
      this.logger.warn(`Environmental alert generated: ${alertId} - ${parameter} threshold exceeded`);

    } catch (error) {
      this.logger.error('Error generating environmental alert:', error);
    }
  }

  /**
   * Process reading for early warning systems
   */
  private processForEarlyWarning(reading: SensorReading, sensor: SensorDevice): void {
    // Check if sensor is part of any early warning system
    for (const system of this.earlyWarningSystems.values()) {
      if (system.sensors.includes(sensor.id)) {
        this.evaluateEarlyWarning(system, reading, sensor);
      }
    }
  }

  /**
   * Evaluate early warning system
   */
  private evaluateEarlyWarning(
    system: EarlyWarningSystem, 
    reading: SensorReading, 
    sensor: SensorDevice
  ): void {
    try {
      // Update active sensors count
      system.currentStatus.activeSensors = system.sensors.filter(id => {
        const s = this.sensors.get(id);
        return s && s.status === 'online' && 
               (Date.now() - s.lastSeen.getTime()) < 300000; // 5 minutes
      }).length;

      // Evaluate alert levels
      for (const alertLevel of system.alertLevels) {
        let criteriaMetCount = 0;
        const totalCriteria = Object.keys(alertLevel.criteria).length;

        for (const [parameter, threshold] of Object.entries(alertLevel.criteria)) {
          const measurement = reading.readings[parameter];
          if (measurement && measurement.value >= threshold) {
            criteriaMetCount++;
          }
        }

        const confidence = criteriaMetCount / totalCriteria;
        
        if (confidence >= system.algorithms.confidence && alertLevel.level > system.currentStatus.level) {
          this.triggerEarlyWarningAlert(system, alertLevel, confidence, reading);
        }
      }

    } catch (error) {
      this.logger.error('Error evaluating early warning system:', error);
    }
  }

  /**
   * Trigger early warning alert
   */
  private async triggerEarlyWarningAlert(
    system: EarlyWarningSystem,
    alertLevel: any,
    confidence: number,
    reading: SensorReading
  ): Promise<void> {
    try {
      system.currentStatus.level = alertLevel.level;
      system.currentStatus.confidence = confidence;
      system.currentStatus.lastUpdate = new Date();

      const warningAlert: EnvironmentalAlert = {
        id: `early_warning_${system.id}_${Date.now()}`,
        type: system.type as any,
        severity: alertLevel.level >= 4 ? 'emergency' : alertLevel.level >= 3 ? 'warning' : 'watch',
        location: {
          lat: system.coverage.lat,
          lng: system.coverage.lng,
          radius: system.coverage.radius,
          affectedAreas: system.coverage.zones
        },
        parameters: Object.fromEntries(
          await Promise.all(
            Object.entries(reading.readings).map(async ([parameter, measurement]) => {
              const threshold = system.alertLevels
                .find(al => al.level === alertLevel.level)?.criteria[parameter] ?? 0;
              const trend = await this.calculateTrend(reading.deviceId, parameter);
              return [
                parameter,
                {
                  current: measurement.value,
                  threshold,
                  unit: measurement.unit,
                  trend
                }
              ];
            })
          )
        ),
        description: `${system.name} - Alert Level ${alertLevel.level}: ${alertLevel.name}`,
        recommendations: alertLevel.actions,
        timestamp: new Date(),
        duration: {
          estimated: this.estimateEventDuration(system.type)
        },
        sources: system.sensors,
        verified: confidence > 0.8,
        authorities: alertLevel.notifications,
        status: 'active'
      };

      this.alerts.set(warningAlert.id, warningAlert);

      // Broadcast critical early warnings immediately
      this.broadcastAlert(warningAlert);
      
      if (alertLevel.level >= 3) {
        await this.notifyAuthorities(warningAlert);
      }

      this.emit('early-warning:triggered', {
        system: system.id,
        level: alertLevel.level,
        confidence,
        alert: warningAlert
      });

      this.logger.warn(`Early warning triggered: ${system.name} - Level ${alertLevel.level} (Confidence: ${(confidence * 100).toFixed(1)}%)`);

    } catch (error) {
      this.logger.error('Error triggering early warning alert:', error);
    }
  }

  /**
   * Get current air quality index
   */
  async getCurrentAirQuality(location?: { lat: number; lng: number }): Promise<AirQualityIndex[]> {
    try {
      const airQualitySensors = Array.from(this.sensors.values())
        .filter(sensor => sensor.type === 'air-quality' && sensor.status === 'online');

      if (location) {
        // Filter sensors by proximity
        const maxDistance = 10; // km
        airQualitySensors.filter(sensor => {
          const distance = this.calculateDistance(
            location.lat, location.lng,
            sensor.location.lat, sensor.location.lng
          );
          return distance <= maxDistance;
        });
      }

      const airQualityData: AirQualityIndex[] = [];

      for (const sensor of airQualitySensors) {
        const recentReadings = this.readings.get(sensor.id)?.slice(-10) || []; // Last 10 readings
        if (recentReadings.length === 0) continue;

        const latestReading = recentReadings[recentReadings.length - 1];
        const aqi = this.calculateAQI(latestReading);

        airQualityData.push(aqi);
      }

      return airQualityData;

    } catch (error) {
      this.logger.error('Error getting air quality data:', error);
      return [];
    }
  }

  /**
   * Calculate AQI from sensor reading
   */
  private calculateAQI(reading: SensorReading): AirQualityIndex {
    const pollutants: Record<string, any> = {};
    let maxAQI = 0;
    let primaryPollutant = '';

    // Calculate AQI for each pollutant
    for (const [parameter, measurement] of Object.entries(reading.readings)) {
      if (['PM2.5', 'PM10', 'NO2', 'O3', 'CO', 'SO2'].includes(parameter)) {
        const aqi = this.calculatePollutantAQI(parameter, measurement.value);
        pollutants[parameter] = {
          concentration: measurement.value,
          unit: measurement.unit,
          aqi,
          category: this.getAQICategory(aqi),
          healthEffects: this.getHealthEffects(parameter, aqi)
        };

        if (aqi > maxAQI) {
          maxAQI = aqi;
          primaryPollutant = parameter;
        }
      }
    }

    return {
      location: {
        lat: reading.location.lat,
        lng: reading.location.lng,
        address: this.sensors.get(reading.deviceId)?.location.address || '',
        zone: this.sensors.get(reading.deviceId)?.location.zone || ''
      },
      timestamp: reading.timestamp,
      overall: {
        aqi: Math.round(maxAQI),
        category: this.getAQICategory(maxAQI) as any,
        primaryPollutant
      },
      pollutants,
      forecast: [], // Would integrate with weather/pollution forecast APIs
      recommendations: this.getAQIRecommendations(maxAQI),
      sensors: [reading.deviceId]
    };
  }

  /**
   * Start data processing intervals
   */
  private startProcessing(): void {
    // Data processing interval
    this.dataProcessingInterval = setInterval(async () => {
      await this.processDataBatch();
    }, 60000); // Every minute

    // Alert processing interval
    this.alertProcessingInterval = setInterval(async () => {
      await this.processActiveAlerts();
    }, this.CONFIG.ALERT_THRESHOLD_CHECK_INTERVAL);

    // Maintenance interval
    this.maintenanceInterval = setInterval(async () => {
      await this.performMaintenance();
    }, this.CONFIG.CALIBRATION_CHECK_INTERVAL);

    this.logger.info('IoT data processing started');
  }

  /**
   * Process data batch for analysis
   */
  private async processDataBatch(): Promise<void> {
    try {
      // Analyze trends, patterns, and anomalies
      for (const [deviceId, readings] of this.readings) {
        if (readings.length < 10) continue; // Need minimum data for analysis

        const recentReadings = readings.slice(-60); // Last hour of readings
        
        // Detect anomalies
        const anomalies = this.detectAnomalies(recentReadings);
        
        if (anomalies.length > 0) {
          this.logger.info(`Detected ${anomalies.length} anomalies in sensor ${deviceId}`);
          this.emit('anomalies:detected', { deviceId, anomalies });
        }

        // Update trends
        await this.updateTrends(deviceId, recentReadings);
      }

    } catch (error) {
      this.logger.error('Error processing data batch:', error);
    }
  }

  /**
   * Broadcast reading to connected clients
   */
  private broadcastReading(reading: SensorReading): void {
    const message = {
      type: 'sensor-reading',
      data: reading
    };

    this.broadcast(message);
  }

  /**
   * Broadcast alert to connected clients
   */
  private broadcastAlert(alert: EnvironmentalAlert | StructuralAlert): void {
    const message = {
      type: 'alert',
      data: alert
    };

    this.broadcast(message);
  }

  /**
   * Broadcast message to all connected clients
   */
  private broadcast(message: any): void {
    const messageStr = JSON.stringify(message);
    
    this.connections.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN) {
        try {
          ws.send(messageStr);
        } catch (error) {
          this.logger.error('Error broadcasting message:', error);
          this.connections.delete(ws);
        }
      }
    });
  }

  /**
   * Send message to specific client
   */
  private sendToClient(ws: WebSocket, message: any): void {
    if (ws.readyState === WebSocket.OPEN) {
      try {
        ws.send(JSON.stringify(message));
      } catch (error) {
        this.logger.error('Error sending message to client:', error);
      }
    }
  }

  // Helper methods

  private handleWebSocketMessage(ws: WebSocket, data: any): void {
    switch (data.type) {
      case 'subscribe':
        // Handle subscription to specific sensors or alert types
        break;
      case 'get-status':
        this.sendToClient(ws, {
          type: 'status',
          data: this.getSystemStatus()
        });
        break;
      default:
        this.logger.debug('Unknown WebSocket message type:', data.type);
    }
  }

  private updateSensorStatus(deviceId: string, statusData: any): void {
    const sensor = this.sensors.get(deviceId);
    if (!sensor) return;

    sensor.status = statusData.status || sensor.status;
    sensor.batteryLevel = statusData.batteryLevel;
    sensor.signalStrength = statusData.signalStrength;
    sensor.lastSeen = new Date();

    this.sensors.set(deviceId, sensor);
  }

  private processSensorAlert(deviceId: string, alertData: any): void {
    this.logger.warn(`Direct sensor alert from ${deviceId}:`, alertData);
    // Process emergency alerts sent directly by sensors
  }

  private updateSensorHeartbeat(deviceId: string): void {
    const sensor = this.sensors.get(deviceId);
    if (sensor) {
      sensor.lastSeen = new Date();
      sensor.status = 'online';
      this.sensors.set(deviceId, sensor);
    }
  }

  private mapParameterToAlertType(parameter: string): EnvironmentalAlert['type'] {
    const mapping: Record<string, EnvironmentalAlert['type']> = {
      'PM2.5': 'air-quality',
      'PM10': 'air-quality',
      'NO2': 'air-quality',
      'O3': 'air-quality',
      'CO': 'air-quality',
      'SO2': 'air-quality',
      'temperature': 'temperature',
      'humidity': 'humidity',
      'radiation': 'radiation',
      'noise': 'noise-pollution'
    };
    
    return mapping[parameter] || 'air-quality';
  }

  private calculateAlertRadius(sensorType: string): number {
    const radiusMap: Record<string, number> = {
      'air-quality': 2,
      'structural': 0.5,
      'seismic': 50,
      'weather': 10,
      'fire': 5,
      'flood': 10,
      'chemical': 3
    };
    
    return radiusMap[sensorType] || 1;
  }

  private async calculateTrend(deviceId: string, parameter: string): Promise<'rising' | 'falling' | 'stable'> {
    const readings = this.readings.get(deviceId) || [];
    if (readings.length < 5) return 'stable';

    const recent = readings.slice(-5).map(r => r.readings[parameter]?.value).filter(v => v !== undefined);
    if (recent.length < 3) return 'stable';

    const trend = recent[recent.length - 1] - recent[0];
    const threshold = recent[0] * 0.1; // 10% change

    if (Math.abs(trend) < threshold) return 'stable';
    return trend > 0 ? 'rising' : 'falling';
  }

  private getRecommendations(parameter: string, value: number, critical: boolean): string[] {
    // Return context-appropriate recommendations based on parameter and severity
    const recommendations: string[] = [];
    
    if (parameter === 'PM2.5' || parameter === 'PM10') {
      recommendations.push('Limit outdoor activities', 'Use air purifiers indoors', 'Wear N95 masks when outside');
      if (critical) recommendations.push('Stay indoors', 'Close windows and doors');
    }
    
    return recommendations;
  }

  private estimateAlertDuration(parameter: string, value: number): number {
    // Estimate how long the alert condition might persist
    return 120; // Default 2 hours
  }

  private async notifyAuthorities(alert: EnvironmentalAlert): Promise<void> {
    // Send notifications to authorities (email, SMS, API calls)
    this.logger.info(`Notifying authorities for alert: ${alert.id}`);
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

  private calculatePollutantAQI(pollutant: string, concentration: number): number {
    // Simplified AQI calculation - in reality would use EPA breakpoint tables
    const breakpoints: Record<string, number[]> = {
      'PM2.5': [0, 12, 35, 55, 150, 250],
      'PM10': [0, 54, 154, 254, 354, 424],
      'NO2': [0, 53, 100, 360, 649, 1249],
      'O3': [0, 54, 70, 85, 105, 200],
      'CO': [0, 4.4, 9.4, 12.4, 15.4, 30.4],
      'SO2': [0, 35, 75, 185, 304, 604]
    };

    const aqiLevels = [0, 50, 100, 150, 200, 300, 500];
    const levels = breakpoints[pollutant] || breakpoints['PM2.5'];

    for (let i = 0; i < levels.length - 1; i++) {
      if (concentration >= levels[i] && concentration <= levels[i + 1]) {
        return aqiLevels[i] + (aqiLevels[i + 1] - aqiLevels[i]) * 
               (concentration - levels[i]) / (levels[i + 1] - levels[i]);
      }
    }

    return 500; // Hazardous
  }

  private getAQICategory(aqi: number): string {
    if (aqi <= 50) return 'good';
    if (aqi <= 100) return 'moderate';
    if (aqi <= 150) return 'unhealthy-sensitive';
    if (aqi <= 200) return 'unhealthy';
    if (aqi <= 300) return 'very-unhealthy';
    return 'hazardous';
  }

  private getHealthEffects(pollutant: string, aqi: number): string {
    // Return health effects based on pollutant and AQI level
    return 'Monitor air quality and limit exposure if sensitive to air pollution.';
  }

  private getAQIRecommendations(aqi: number): { general: string[]; sensitive: string[]; outdoor: string[] } {
    if (aqi <= 50) {
      return {
        general: ['Air quality is satisfactory'],
        sensitive: ['Enjoy outdoor activities'],
        outdoor: ['Great day for outdoor activities']
      };
    } else if (aqi <= 100) {
      return {
        general: ['Air quality is acceptable'],
        sensitive: ['Consider reducing prolonged outdoor exertion'],
        outdoor: ['Moderate outdoor activities are fine']
      };
    } else {
      return {
        general: ['Reduce outdoor activities'],
        sensitive: ['Avoid outdoor activities'],
        outdoor: ['Postpone outdoor activities']
      };
    }
  }

  private detectAnomalies(readings: SensorReading[]): any[] {
    // Implement anomaly detection algorithm
    return [];
  }

  private async updateTrends(deviceId: string, readings: SensorReading[]): Promise<void> {
    // Update trend data in Redis
  }

  private async processActiveAlerts(): Promise<void> {
    // Process and update active alerts
  }

  private async performMaintenance(): Promise<void> {
    // Check for calibration needs, offline sensors, etc.
  }

  private estimateEventDuration(eventType: string): number {
    const durations: Record<string, number> = {
      'earthquake': 10,
      'tsunami': 480,
      'wildfire': 1440,
      'flood': 720,
      'hurricane': 2160,
      'tornado': 30,
      'industrial-accident': 240
    };
    
    return durations[eventType] || 60;
  }

  private getSystemStatus(): any {
    return {
      totalSensors: this.sensors.size,
      onlineSensors: Array.from(this.sensors.values()).filter(s => s.status === 'online').length,
      activeAlerts: this.alerts.size,
      lastUpdate: new Date()
    };
  }

  /**
   * Graceful shutdown
   */
  async shutdown(): Promise<void> {
    try {
      // Clear intervals
      if (this.dataProcessingInterval) clearInterval(this.dataProcessingInterval);
      if (this.alertProcessingInterval) clearInterval(this.alertProcessingInterval);
      if (this.maintenanceInterval) clearInterval(this.maintenanceInterval);

      // Close connections
      if (this.mqttClient) {
        this.mqttClient.end();
      }
      
      if (this.wsServer) {
        this.wsServer.close();
      }

      // Close WebSocket connections
      this.connections.forEach(ws => ws.close());

      // Close Redis connection
      await this.redis.quit();

      this.logger.info('IoT Sensor Network shut down gracefully');

    } catch (error) {
      this.logger.error('Error during IoT system shutdown:', error);
    }
  }
}

export default IoTSensorNetwork;
