import { Server as SocketIOServer } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import Redis from 'ioredis';
import { Server } from 'http';
import jwt from 'jsonwebtoken';
import winston from 'winston';

/**
 * Real-time Infrastructure Service
 * WebSocket connections for live updates with Redis clustering
 */

export interface EmergencyAlert {
  id: string;
  type: 'disaster' | 'evacuation' | 'weather' | 'security' | 'medical';
  severity: 'low' | 'medium' | 'high' | 'critical';
  location: {
    lat: number;
    lng: number;
    radius: number;
    address: string;
  };
  message: string;
  timestamp: Date;
  source: string;
  affectedAreas: string[];
  expectedDuration?: number; // minutes
  instructions: string[];
  resources: {
    shelters?: string[];
    evacuationRoutes?: string[];
    emergencyContacts?: string[];
  };
}

export interface UserConnection {
  id: string;
  userId: string;
  socketId: string;
  location?: { lat: number; lng: number };
  subscriptions: string[]; // alert types they're subscribed to
  role: 'citizen' | 'responder' | 'coordinator' | 'admin';
  lastSeen: Date;
  deviceInfo: {
    type: 'mobile' | 'desktop' | 'tablet';
    os: string;
    browser: string;
  };
}

export interface RealTimeMetrics {
  connectedUsers: number;
  activeAlerts: number;
  messagesPerSecond: number;
  regionActivity: Map<string, number>;
  responseTime: number;
  systemLoad: {
    cpu: number;
    memory: number;
    network: number;
  };
}

class RealTimeInfrastructure {
  private static instance: RealTimeInfrastructure;
  private io: SocketIOServer | null = null;
  private redisClient!: Redis;
  private redisPub!: Redis;
  private redisSub!: Redis;
  private connections: Map<string, UserConnection> = new Map();
  private activeAlerts: Map<string, EmergencyAlert> = new Map();
  private logger!: winston.Logger;
  private metrics!: RealTimeMetrics;
  private metricsInterval: NodeJS.Timeout | null = null;

  // Redis configuration for clustering
  private redisConfig = {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    retryDelayOnFailover: 100,
    enableReadyCheck: false,
    maxRetriesPerRequest: null,
    lazyConnect: true,
    connectTimeout: 60000,
    commandTimeout: 5000,
    family: 4
  };

  // Room configurations
  private readonly ROOMS = {
    GLOBAL: 'global',
    ALERTS: 'alerts',
    RESPONDERS: 'responders',
    COORDINATORS: 'coordinators',
    LOCATION_PREFIX: 'location:',
    ALERT_TYPE_PREFIX: 'alert:'
  };

  private constructor() {
    this.initializeLogger();
    this.initializeRedis();
    this.initializeMetrics();
  }

  static getInstance(): RealTimeInfrastructure {
    if (!RealTimeInfrastructure.instance) {
      RealTimeInfrastructure.instance = new RealTimeInfrastructure();
    }
    return RealTimeInfrastructure.instance;
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
        new winston.transports.File({ filename: 'logs/realtime-error.log', level: 'error' }),
        new winston.transports.File({ filename: 'logs/realtime-combined.log' }),
        new winston.transports.Console({
          format: winston.format.simple()
        })
      ]
    });
  }

  /**
   * Initialize Redis connections for clustering
   */
  private initializeRedis(): void {
    try {
      // Main Redis client for caching
      this.redisClient = new Redis(this.redisConfig);
      
      // Pub/Sub clients for real-time messaging
      this.redisPub = new Redis(this.redisConfig);
      this.redisSub = new Redis(this.redisConfig);

      // Set up error handlers
      this.redisClient.on('error', (error) => {
        this.logger.error('Redis client error:', error);
      });

      this.redisPub.on('error', (error) => {
        this.logger.error('Redis pub error:', error);
      });

      this.redisSub.on('error', (error) => {
        this.logger.error('Redis sub error:', error);
      });

      // Set up connection handlers
      this.redisClient.on('connect', () => {
        this.logger.info('Redis client connected');
      });

      this.logger.info('Redis infrastructure initialized');
    } catch (error) {
      this.logger.error('Failed to initialize Redis:', error);
      throw error;
    }
  }

  /**
   * Initialize metrics tracking
   */
  private initializeMetrics(): void {
    this.metrics = {
      connectedUsers: 0,
      activeAlerts: 0,
      messagesPerSecond: 0,
      regionActivity: new Map(),
      responseTime: 0,
      systemLoad: {
        cpu: 0,
        memory: 0,
        network: 0
      }
    };

    // Update metrics every 30 seconds
    this.metricsInterval = setInterval(() => {
      this.updateMetrics();
    }, 30000);
  }

  /**
   * Initialize Socket.IO server with Redis adapter
   */
  async initialize(httpServer: Server): Promise<void> {
    try {
      this.io = new SocketIOServer(httpServer, {
        cors: {
          origin: process.env.FRONTEND_URL || "http://localhost:5173",
          methods: ["GET", "POST"],
          credentials: true
        },
        transports: ['websocket', 'polling'],
        allowEIO3: true,
        pingTimeout: 60000,
        pingInterval: 25000
      });

      // Set up Redis adapter for clustering
      const pubClient = this.redisPub;
      const subClient = this.redisSub;
      this.io.adapter(createAdapter(pubClient, subClient));

      this.setupSocketHandlers();
      this.setupRedisSubscriptions();

      this.logger.info('Real-time infrastructure initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize real-time infrastructure:', error);
      throw error;
    }
  }

  /**
   * Set up Socket.IO event handlers
   */
  private setupSocketHandlers(): void {
    if (!this.io) return;

    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        if (!token) {
          return next(new Error('Authentication error: No token provided'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
        socket.data = socket.data || {};
        socket.data.userId = decoded.id;
        socket.data.userRole = decoded.role || 'citizen';
        next();
      } catch (error) {
        next(new Error('Authentication error: Invalid token'));
      }
    });

    this.io.on('connection', (socket) => {
      this.handleConnection(socket);
    });
  }

  /**
   * Handle new socket connection
   */
  private handleConnection(socket: any): void {
    const connection: UserConnection = {
      id: socket.id,
      userId: socket.data?.userId,
      socketId: socket.id,
      subscriptions: ['general'],
      role: socket.data?.userRole,
      lastSeen: new Date(),
      deviceInfo: {
        type: this.detectDeviceType(socket.handshake.headers['user-agent'] || ''),
        os: this.detectOS(socket.handshake.headers['user-agent'] || ''),
        browser: this.detectBrowser(socket.handshake.headers['user-agent'] || '')
      }
    };

    this.connections.set(socket.id, connection);
    this.metrics.connectedUsers = this.connections.size;

    // Join default rooms
    socket.join(this.ROOMS.GLOBAL);
    if (connection.role !== 'citizen') {
      socket.join(this.ROOMS.RESPONDERS);
    }
    if (connection.role === 'coordinator' || connection.role === 'admin') {
      socket.join(this.ROOMS.COORDINATORS);
    }

    this.logger.info(`User connected: ${connection.userId} (${socket.id}), Role: ${connection.role}`);

    // Set up event handlers
    this.setupConnectionHandlers(socket, connection);

    // Send initial data
    this.sendInitialData(socket);
  }

  /**
   * Set up event handlers for individual connection
   */
  private setupConnectionHandlers(socket: any, connection: UserConnection): void {
    // Location updates
    socket.on('location:update', (data: { lat: number; lng: number; accuracy?: number }) => {
      this.handleLocationUpdate(socket, connection, data);
    });

    // Alert subscriptions
    socket.on('alert:subscribe', (alertTypes: string[]) => {
      this.handleAlertSubscription(socket, connection, alertTypes);
    });

    // Emergency report submission
    socket.on('emergency:report', (report: any) => {
      this.handleEmergencyReport(socket, connection, report);
    });

    // Status updates for responders
    socket.on('responder:status', (status: any) => {
      if (connection.role !== 'citizen') {
        this.handleResponderStatus(socket, connection, status);
      }
    });

    // Heartbeat for connection monitoring
    socket.on('heartbeat', () => {
      connection.lastSeen = new Date();
      socket.emit('heartbeat:ack');
    });

    // Disconnect handling
    socket.on('disconnect', (reason) => {
      this.handleDisconnection(socket, connection, reason);
    });

    // Error handling
    socket.on('error', (error) => {
      this.logger.error(`Socket error for user ${connection.userId}:`, error);
    });
  }

  /**
   * Handle location updates
   */
  private async handleLocationUpdate(
    socket: any, 
    connection: UserConnection, 
    location: { lat: number; lng: number; accuracy?: number }
  ): Promise<void> {
    try {
      connection.location = location;
      
      // Join location-based room
      const locationRoom = this.getLocationRoom(location.lat, location.lng);
      socket.join(locationRoom);

      // Cache user location in Redis
      await this.redisClient.setex(
        `user:${connection.userId}:location`,
        3600, // 1 hour TTL
        JSON.stringify({
          ...location,
          timestamp: new Date(),
          socketId: socket.id
        })
      );

      // Check for nearby alerts
      const nearbyAlerts = await this.findNearbyAlerts(location.lat, location.lng, 50); // 50km radius
      if (nearbyAlerts.length > 0) {
        socket.emit('alerts:nearby', nearbyAlerts);
      }

      this.logger.debug(`Location updated for user ${connection.userId}: ${location.lat}, ${location.lng}`);
    } catch (error) {
      this.logger.error('Error handling location update:', error);
    }
  }

  /**
   * Handle alert subscription changes
   */
  private handleAlertSubscription(
    socket: any,
    connection: UserConnection,
    alertTypes: string[]
  ): void {
    // Leave old alert rooms
    connection.subscriptions.forEach(type => {
      socket.leave(this.ROOMS.ALERT_TYPE_PREFIX + type);
    });

    // Join new alert rooms
    alertTypes.forEach(type => {
      socket.join(this.ROOMS.ALERT_TYPE_PREFIX + type);
    });

    connection.subscriptions = alertTypes;
    this.logger.info(`User ${connection.userId} subscribed to alerts: ${alertTypes.join(', ')}`);
  }

  /**
   * Handle emergency report submission
   */
  private async handleEmergencyReport(
    socket: any,
    connection: UserConnection,
    report: any
  ): Promise<void> {
    try {
      const reportId = `emergency_${Date.now()}_${socket.userId}`;
      
      // Store report in Redis
      await this.redisClient.setex(
        `emergency:report:${reportId}`,
        86400, // 24 hours TTL
        JSON.stringify({
          ...report,
          id: reportId,
          reporterId: connection.userId,
          reporterRole: connection.role,
          timestamp: new Date(),
          status: 'pending'
        })
      );

      // Notify responders and coordinators
      this.io?.to(this.ROOMS.RESPONDERS).emit('emergency:new_report', {
        id: reportId,
        type: report.type,
        location: report.location,
        severity: report.severity,
        summary: report.description?.substring(0, 100)
      });

      // Acknowledge to reporter
      socket.emit('emergency:report_received', {
        reportId,
        status: 'received',
        message: 'Your emergency report has been received and is being processed'
      });

      this.logger.info(`Emergency report received from user ${connection.userId}: ${reportId}`);
    } catch (error) {
      this.logger.error('Error handling emergency report:', error);
      socket.emit('emergency:report_error', {
        message: 'Failed to process emergency report'
      });
    }
  }

  /**
   * Handle responder status updates
   */
  private async handleResponderStatus(
    socket: any,
    connection: UserConnection,
    status: any
  ): Promise<void> {
    try {
      const statusUpdate = {
        userId: connection.userId,
        role: connection.role,
        status: status.status, // available, busy, offline, responding
        location: connection.location,
        assignedIncident: status.assignedIncident,
        timestamp: new Date()
      };

      // Store in Redis
      await this.redisClient.setex(
        `responder:${connection.userId}:status`,
        1800, // 30 minutes TTL
        JSON.stringify(statusUpdate)
      );

      // Notify coordinators
      this.io?.to(this.ROOMS.COORDINATORS).emit('responder:status_update', statusUpdate);

      this.logger.debug(`Responder status updated for ${connection.userId}: ${status.status}`);
    } catch (error) {
      this.logger.error('Error handling responder status:', error);
    }
  }

  /**
   * Handle connection disconnect
   */
  private handleDisconnection(socket: any, connection: UserConnection, reason: string): void {
    this.connections.delete(socket.id);
    this.metrics.connectedUsers = this.connections.size;

    this.logger.info(`User disconnected: ${connection.userId} (${socket.id}), Reason: ${reason}`);

    // Clean up user data
    this.cleanupUserData(connection.userId);
  }

  /**
   * Broadcast emergency alert to relevant users
   */
  async broadcastEmergencyAlert(alert: EmergencyAlert): Promise<void> {
    try {
      this.activeAlerts.set(alert.id, alert);
      this.metrics.activeAlerts = this.activeAlerts.size;

      // Store alert in Redis
      await this.redisClient.setex(
        `alert:${alert.id}`,
        86400, // 24 hours TTL
        JSON.stringify(alert)
      );

      // Determine target audience
      const rooms: string[] = [];
      
      // Add location-based rooms
      const locationRoom = this.getLocationRoom(alert.location.lat, alert.location.lng);
      rooms.push(locationRoom);

      // Add alert type rooms
      rooms.push(this.ROOMS.ALERT_TYPE_PREFIX + alert.type);

      // Add severity-based rooms for critical alerts
      if (alert.severity === 'critical') {
        rooms.push(this.ROOMS.GLOBAL);
      }

      // Broadcast to all relevant rooms
      rooms.forEach(room => {
        this.io?.to(room).emit('alert:emergency', alert);
      });

      // Send push notifications for critical alerts
      if (alert.severity === 'critical') {
        await this.sendPushNotifications(alert);
      }

      this.logger.info(`Emergency alert broadcasted: ${alert.id} - ${alert.type} (${alert.severity})`);
    } catch (error) {
      this.logger.error('Error broadcasting emergency alert:', error);
      throw error;
    }
  }

  /**
   * Send real-time update to specific user
   */
  async sendToUser(userId: string, event: string, data: any): Promise<boolean> {
    try {
      // Find user's socket
      const userConnection = Array.from(this.connections.values())
        .find(conn => conn.userId === userId);

      if (userConnection) {
        this.io?.to(userConnection.socketId).emit(event, data);
        return true;
      }

      return false;
    } catch (error) {
      this.logger.error(`Error sending message to user ${userId}:`, error);
      return false;
    }
  }

  /**
   * Send real-time update to users in specific location
   */
  async sendToLocation(
    lat: number, 
    lng: number, 
    radius: number, 
    event: string, 
    data: any
  ): Promise<void> {
    try {
      const locationRoom = this.getLocationRoom(lat, lng);
      this.io?.to(locationRoom).emit(event, data);
      
      this.logger.debug(`Message sent to location ${lat}, ${lng} (radius: ${radius}km)`);
    } catch (error) {
      this.logger.error('Error sending message to location:', error);
    }
  }

  /**
   * Get current real-time metrics
   */
  getMetrics(): RealTimeMetrics {
    return { ...this.metrics };
  }

  /**
   * Get active connections summary
   */
  getConnectionsSummary() {
    const roleStats = new Map<string, number>();
    const locationStats = new Map<string, number>();

    this.connections.forEach(conn => {
      // Count by role
      roleStats.set(conn.role, (roleStats.get(conn.role) || 0) + 1);

      // Count by location (if available)
      if (conn.location) {
        const locationKey = `${Math.floor(conn.location.lat)},${Math.floor(conn.location.lng)}`;
        locationStats.set(locationKey, (locationStats.get(locationKey) || 0) + 1);
      }
    });

    return {
      totalConnections: this.connections.size,
      roleDistribution: Object.fromEntries(roleStats),
      locationDistribution: Object.fromEntries(locationStats),
      activeAlerts: this.activeAlerts.size,
      averageResponseTime: this.metrics.responseTime
    };
  }

  // Helper methods

  private setupRedisSubscriptions(): void {
    // Subscribe to cross-cluster events
    this.redisSub.subscribe('emergency:alert', 'system:broadcast');
    
    this.redisSub.on('message', (channel, message) => {
      try {
        const data = JSON.parse(message);
        
        switch (channel) {
          case 'emergency:alert':
            this.broadcastEmergencyAlert(data);
            break;
          case 'system:broadcast':
            this.io?.emit('system:message', data);
            break;
        }
      } catch (error) {
        this.logger.error(`Error processing Redis message from ${channel}:`, error);
      }
    });
  }

  private sendInitialData(socket: any): void {
    // Send recent alerts
    const recentAlerts = Array.from(this.activeAlerts.values())
      .filter(alert => {
        const age = Date.now() - alert.timestamp.getTime();
        return age < 3600000; // Last hour
      })
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 10);

    socket.emit('alerts:initial', recentAlerts);

    // Send system status
    socket.emit('system:status', {
      connectedUsers: this.metrics.connectedUsers,
      systemLoad: this.metrics.systemLoad,
      timestamp: new Date()
    });
  }

  private getLocationRoom(lat: number, lng: number): string {
    // Create location-based room (grid system - 0.1 degree precision ~11km)
    const gridLat = Math.floor(lat * 10) / 10;
    const gridLng = Math.floor(lng * 10) / 10;
    return `${this.ROOMS.LOCATION_PREFIX}${gridLat},${gridLng}`;
  }

  private async findNearbyAlerts(
    lat: number, 
    lng: number, 
    radius: number
  ): Promise<EmergencyAlert[]> {
    const nearbyAlerts: EmergencyAlert[] = [];
    
    for (const alert of this.activeAlerts.values()) {
      const distance = this.calculateDistance(
        lat, lng, 
        alert.location.lat, alert.location.lng
      );
      
      if (distance <= radius) {
        nearbyAlerts.push(alert);
      }
    }
    
    return nearbyAlerts.sort((a, b) => {
      const distanceA = this.calculateDistance(lat, lng, a.location.lat, a.location.lng);
      const distanceB = this.calculateDistance(lat, lng, b.location.lat, b.location.lng);
      return distanceA - distanceB;
    });
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

  private detectDeviceType(userAgent: string): 'mobile' | 'desktop' | 'tablet' {
    if (/tablet|ipad|playbook|silk/i.test(userAgent)) return 'tablet';
    if (/mobile|phone|android|iphone|ipod|blackberry|opera|mini/i.test(userAgent)) return 'mobile';
    return 'desktop';
  }

  private detectOS(userAgent: string): string {
    if (/windows/i.test(userAgent)) return 'Windows';
    if (/mac|darwin/i.test(userAgent)) return 'macOS';
    if (/linux/i.test(userAgent)) return 'Linux';
    if (/android/i.test(userAgent)) return 'Android';
    if (/ios|iphone|ipad/i.test(userAgent)) return 'iOS';
    return 'Unknown';
  }

  private detectBrowser(userAgent: string): string {
    if (/chrome/i.test(userAgent)) return 'Chrome';
    if (/firefox/i.test(userAgent)) return 'Firefox';
    if (/safari/i.test(userAgent)) return 'Safari';
    if (/edge/i.test(userAgent)) return 'Edge';
    return 'Unknown';
  }

  private async sendPushNotifications(alert: EmergencyAlert): Promise<void> {
    // This would integrate with push notification services
    // Implementation depends on the specific push service being used
    this.logger.info(`Would send push notification for critical alert: ${alert.id}`);
  }

  private updateMetrics(): void {
    // Update system metrics
    this.metrics.connectedUsers = this.connections.size;
    this.metrics.activeAlerts = this.activeAlerts.size;
    
    // Calculate messages per second (simplified)
    // In real implementation, this would track actual message counts
    this.metrics.messagesPerSecond = this.connections.size * 0.1; // Estimated
    
    // Update system load (this would use actual system monitoring)
    this.metrics.systemLoad = {
      cpu: Math.random() * 100,
      memory: Math.random() * 100,
      network: Math.random() * 100
    };

    // Log metrics for monitoring
    this.logger.debug('Metrics updated:', this.metrics);
  }

  private async cleanupUserData(userId: string): Promise<void> {
    try {
      // Remove user location from Redis
      await this.redisClient.del(`user:${userId}:location`);
      
      // Remove responder status if applicable
      await this.redisClient.del(`responder:${userId}:status`);
      
      this.logger.debug(`Cleaned up data for user: ${userId}`);
    } catch (error) {
      this.logger.error(`Error cleaning up data for user ${userId}:`, error);
    }
  }

  /**
   * Graceful shutdown
   */
  async shutdown(): Promise<void> {
    try {
      if (this.metricsInterval) {
        clearInterval(this.metricsInterval);
      }

      if (this.io) {
        this.io.close();
      }

      await this.redisClient.quit();
      await this.redisPub.quit();
      await this.redisSub.quit();

      this.logger.info('Real-time infrastructure shut down gracefully');
    } catch (error) {
      this.logger.error('Error during shutdown:', error);
    }
  }
}

export default RealTimeInfrastructure;
