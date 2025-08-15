/**
 * Offline Maps Service
 * Download and cache maps for offline use during emergencies
 */

export interface MapTile {
  id: string;
  zoom: number;
  x: number;
  y: number;
  url: string;
  data: ArrayBuffer;
  downloadedAt: Date;
  size: number; // bytes
}

export interface MapRegion {
  id: string;
  name: string;
  bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  zoomLevels: number[];
  tileCount: number;
  totalSize: number; // estimated size in bytes
  downloadProgress: number; // 0-100
  downloadedAt?: Date;
  priority: 'critical' | 'high' | 'medium' | 'low';
}

export interface EmergencyLocation {
  id: string;
  name: string;
  type: 'hospital' | 'fire_station' | 'police' | 'shelter' | 'government' | 'utility' | 'fuel' | 'food' | 'pharmacy';
  location: {
    lat: number;
    lng: number;
    elevation?: number;
  };
  address: string;
  contact: {
    phone?: string;
    radio?: string;
    email?: string;
  };
  services: string[];
  capacity?: number;
  operationalHours: string;
  accessibleByDisabled: boolean;
  hasBackupPower: boolean;
  supplyLevel?: number; // 0-100 for resources
  lastUpdated: Date;
  isOperational: boolean;
  priority: number; // 1-10
}

export interface OfflineRoute {
  id: string;
  name: string;
  startPoint: { lat: number; lng: number };
  endPoint: { lat: number; lng: number };
  waypoints: Array<{
    lat: number;
    lng: number;
    instruction: string;
    distance: number; // meters to next waypoint
    duration: number; // seconds to next waypoint
  }>;
  totalDistance: number; // meters
  totalDuration: number; // seconds
  routeType: 'evacuation' | 'emergency_services' | 'supply' | 'medical';
  difficulty: 'easy' | 'moderate' | 'difficult';
  accessibleByDisabled: boolean;
  vehicleTypes: Array<'car' | 'truck' | 'motorcycle' | 'bicycle' | 'walking'>;
  hazards: Array<{
    type: string;
    location: { lat: number; lng: number };
    description: string;
    severity: number;
  }>;
  alternatives: string[]; // IDs of alternative routes
  lastValidated: Date;
}

export interface OfflineMapData {
  version: string;
  lastUpdated: Date;
  regions: MapRegion[];
  tiles: Map<string, MapTile>;
  emergencyLocations: EmergencyLocation[];
  routes: OfflineRoute[];
  totalCacheSize: number;
  maxCacheSize: number;
}

export interface GPSNavigation {
  isActive: boolean;
  currentRoute?: OfflineRoute;
  currentPosition?: {
    lat: number;
    lng: number;
    accuracy: number;
    heading?: number;
    speed?: number;
  };
  nextWaypoint?: {
    index: number;
    distance: number;
    instruction: string;
    eta: number;
  };
  routeProgress: {
    distanceTraveled: number;
    distanceRemaining: number;
    timeElapsed: number;
    estimatedTimeRemaining: number;
  };
}

class OfflineMapsService {
  private static instance: OfflineMapsService;
  private mapData: OfflineMapData;
  private db: IDBDatabase | null = null;
  private isOnline = navigator.onLine;
  private gpsWatchId: number | null = null;
  private navigation: GPSNavigation = { isActive: false, routeProgress: { distanceTraveled: 0, distanceRemaining: 0, timeElapsed: 0, estimatedTimeRemaining: 0 } };
  private eventHandlers: Map<string, Array<(...args: unknown[]) => void>> = new Map();

  // Map tile providers
  private tileProviders = {
    osm: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    terrain: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}'
  };

  private constructor() {
    this.mapData = {
      version: '1.0.0',
      lastUpdated: new Date(),
      regions: [],
      tiles: new Map(),
      emergencyLocations: [],
      routes: [],
      totalCacheSize: 0,
      maxCacheSize: 500 * 1024 * 1024 // 500MB default
    };

    this.initializeDatabase();
    this.setupEventListeners();
  }

  static getInstance(): OfflineMapsService {
    if (!OfflineMapsService.instance) {
      OfflineMapsService.instance = new OfflineMapsService();
    }
    return OfflineMapsService.instance;
  }

  /**
   * Initialize IndexedDB for offline storage
   */
  private async initializeDatabase(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('OfflineMapsDB', 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        this.loadCachedData();
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object stores
        const tilesStore = db.createObjectStore('tiles', { keyPath: 'id' });
        tilesStore.createIndex('region', 'regionId', { unique: false });

        db.createObjectStore('regions', { keyPath: 'id' });
        const locationsStore = db.createObjectStore('locations', { keyPath: 'id' });
        locationsStore.createIndex('type', 'type', { unique: false });

        const routesStore = db.createObjectStore('routes', { keyPath: 'id' });
        routesStore.createIndex('type', 'routeType', { unique: false });

        console.log('Offline Maps database initialized');
      };
    });
  }

  /**
   * Download map region for offline use
   */
  async downloadRegion(region: Omit<MapRegion, 'tileCount' | 'totalSize' | 'downloadProgress'>): Promise<void> {
    const mapRegion: MapRegion = {
      ...region,
      tileCount: 0,
      totalSize: 0,
      downloadProgress: 0
    };

    try {
      // Calculate total tiles needed
      const tiles = this.calculateTilesForRegion(mapRegion);
      mapRegion.tileCount = tiles.length;
      mapRegion.totalSize = tiles.length * 15000; // Estimate 15KB per tile

      this.broadcastEvent('download_started', { region: mapRegion });

      let downloadedCount = 0;
      const batchSize = 10; // Download 10 tiles at a time

      for (let i = 0; i < tiles.length; i += batchSize) {
        const batch = tiles.slice(i, i + batchSize);
        const downloads = batch.map(tile => this.downloadTile(tile, mapRegion.id));

        try {
          const results = await Promise.allSettled(downloads);
          downloadedCount += results.filter(r => r.status === 'fulfilled').length;
          
          mapRegion.downloadProgress = Math.round((downloadedCount / tiles.length) * 100);
          this.broadcastEvent('download_progress', { 
            region: mapRegion, 
            progress: mapRegion.downloadProgress 
          });

          // Respect rate limits
          await this.delay(100);
        } catch (error) {
          console.error('Error downloading tile batch:', error);
        }
      }

      mapRegion.downloadedAt = new Date();
      this.mapData.regions.push(mapRegion);
      await this.saveRegion(mapRegion);

      this.broadcastEvent('download_completed', { region: mapRegion });
    } catch (error) {
      console.error('Error downloading region:', error);
      this.broadcastEvent('download_failed', { region: mapRegion, error });
      throw error;
    }
  }

  /**
   * Download individual map tile
   */
  private async downloadTile(tileInfo: { z: number; x: number; y: number }, regionId: string): Promise<MapTile> {
    const tileId = `${tileInfo.z}_${tileInfo.x}_${tileInfo.y}`;
    const url = this.tileProviders.osm
      .replace('{z}', tileInfo.z.toString())
      .replace('{x}', tileInfo.x.toString())
      .replace('{y}', tileInfo.y.toString());

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to download tile: ${response.status}`);
      }

      const data = await response.arrayBuffer();
      const tile: MapTile = {
        id: tileId,
        zoom: tileInfo.z,
        x: tileInfo.x,
        y: tileInfo.y,
        url,
        data,
        downloadedAt: new Date(),
        size: data.byteLength
      };

      this.mapData.tiles.set(tileId, tile);
      this.mapData.totalCacheSize += tile.size;

      await this.saveTile(tile, regionId);
      return tile;
    } catch (error) {
      console.error('Error downloading tile:', tileId, error);
      throw error;
    }
  }

  /**
   * Get cached tile for offline use
   */
  getCachedTile(z: number, x: number, y: number): MapTile | null {
    const tileId = `${z}_${x}_${y}`;
    return this.mapData.tiles.get(tileId) || null;
  }

  /**
   * Cache emergency locations
   */
  async cacheEmergencyLocations(locations: EmergencyLocation[]): Promise<void> {
    try {
      for (const location of locations) {
        this.mapData.emergencyLocations.push(location);
        await this.saveEmergencyLocation(location);
      }

      this.broadcastEvent('locations_cached', { count: locations.length });
    } catch (error) {
      console.error('Error caching emergency locations:', error);
      throw error;
    }
  }

  /**
   * Get emergency locations by type
   */
  getEmergencyLocations(
    type?: EmergencyLocation['type'],
    location?: { lat: number; lng: number; radius: number }
  ): EmergencyLocation[] {
    let locations = this.mapData.emergencyLocations;

    // Filter by type
    if (type) {
      locations = locations.filter(loc => loc.type === type);
    }

    // Filter by location and radius
    if (location) {
      locations = locations.filter(loc => {
        const distance = this.calculateDistance(
          location.lat,
          location.lng,
          loc.location.lat,
          loc.location.lng
        );
        return distance <= location.radius;
      });
    }

    // Sort by priority and distance
    if (location) {
      locations.sort((a, b) => {
        const distanceA = this.calculateDistance(location.lat, location.lng, a.location.lat, a.location.lng);
        const distanceB = this.calculateDistance(location.lat, location.lng, b.location.lat, b.location.lng);
        return (b.priority - a.priority) * 1000 + (distanceA - distanceB);
      });
    } else {
      locations.sort((a, b) => b.priority - a.priority);
    }

    return locations;
  }

  /**
   * Cache offline routes
   */
  async cacheRoutes(routes: OfflineRoute[]): Promise<void> {
    try {
      for (const route of routes) {
        this.mapData.routes.push(route);
        await this.saveRoute(route);
      }

      this.broadcastEvent('routes_cached', { count: routes.length });
    } catch (error) {
      console.error('Error caching routes:', error);
      throw error;
    }
  }

  /**
   * Start GPS navigation
   */
  async startNavigation(routeId: string): Promise<void> {
    const route = this.mapData.routes.find(r => r.id === routeId);
    if (!route) {
      throw new Error('Route not found');
    }

    try {
      // Start GPS tracking
      this.gpsWatchId = navigator.geolocation.watchPosition(
        (position) => this.updateNavigationPosition(position),
        (error) => this.handleGPSError(error),
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 1000
        }
      );

      this.navigation = {
        isActive: true,
        currentRoute: route,
        routeProgress: {
          distanceTraveled: 0,
          distanceRemaining: route.totalDistance,
          timeElapsed: 0,
          estimatedTimeRemaining: route.totalDuration
        }
      };

      this.broadcastEvent('navigation_started', { route });
    } catch (error) {
      console.error('Error starting navigation:', error);
      throw error;
    }
  }

  /**
   * Update navigation with current GPS position
   */
  private updateNavigationPosition(position: GeolocationPosition): void {
    if (!this.navigation.isActive || !this.navigation.currentRoute) return;

    const currentPos = {
      lat: position.coords.latitude,
      lng: position.coords.longitude,
      accuracy: position.coords.accuracy,
      heading: position.coords.heading || undefined,
      speed: position.coords.speed || undefined
    };

    this.navigation.currentPosition = currentPos;

    // Find nearest waypoint
    const nearestWaypoint = this.findNearestWaypoint(currentPos);
    if (nearestWaypoint) {
      this.navigation.nextWaypoint = {
        index: nearestWaypoint.index,
        distance: nearestWaypoint.distance,
        instruction: nearestWaypoint.waypoint.instruction,
        eta: Math.round(nearestWaypoint.distance / (currentPos.speed || 1))
      };

      // Update progress
      this.updateRouteProgress(currentPos);
    }

    this.broadcastEvent('navigation_updated', {
      position: currentPos,
      navigation: this.navigation
    });
  }

  /**
   * Handle GPS errors
   */
  private handleGPSError(error: GeolocationPositionError): void {
    console.error('GPS Error:', error);
    this.broadcastEvent('gps_error', { error: error.message });
  }

  /**
   * Stop GPS navigation
   */
  stopNavigation(): void {
    if (this.gpsWatchId) {
      navigator.geolocation.clearWatch(this.gpsWatchId);
      this.gpsWatchId = null;
    }

    this.navigation = {
      isActive: false,
      routeProgress: {
        distanceTraveled: 0,
        distanceRemaining: 0,
        timeElapsed: 0,
        estimatedTimeRemaining: 0
      }
    };

    this.broadcastEvent('navigation_stopped', {});
  }

  /**
   * Get offline route
   */
  getOfflineRoute(
    startPoint: { lat: number; lng: number },
    endPoint: { lat: number; lng: number },
    routeType?: OfflineRoute['routeType']
  ): OfflineRoute | null {
    // Find best matching cached route
    let routes = this.mapData.routes;

    if (routeType) {
      routes = routes.filter(r => r.routeType === routeType);
    }

    // Find route with closest start/end points
    const tolerance = 0.001; // ~100m tolerance
    const matchingRoute = routes.find(route => {
      const startMatch = Math.abs(route.startPoint.lat - startPoint.lat) < tolerance &&
                         Math.abs(route.startPoint.lng - startPoint.lng) < tolerance;
      const endMatch = Math.abs(route.endPoint.lat - endPoint.lat) < tolerance &&
                       Math.abs(route.endPoint.lng - endPoint.lng) < tolerance;
      return startMatch && endMatch;
    });

    return matchingRoute || null;
  }

  /**
   * Clean up old cached data
   */
  async cleanupCache(): Promise<void> {
    const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
    const cutoffDate = new Date(Date.now() - maxAge);

    try {
      // Remove old tiles
      const tilesToRemove: string[] = [];
      this.mapData.tiles.forEach((tile, id) => {
        if (tile.downloadedAt < cutoffDate) {
          tilesToRemove.push(id);
        }
      });

      for (const tileId of tilesToRemove) {
        const tile = this.mapData.tiles.get(tileId);
        if (tile) {
          this.mapData.totalCacheSize -= tile.size;
          this.mapData.tiles.delete(tileId);
          await this.deleteTile(tileId);
        }
      }

      // Remove old regions
      this.mapData.regions = this.mapData.regions.filter(region => {
        return !region.downloadedAt || region.downloadedAt >= cutoffDate;
      });

      this.broadcastEvent('cache_cleaned', { 
        tilesRemoved: tilesToRemove.length,
        newCacheSize: this.mapData.totalCacheSize 
      });
    } catch (error) {
      console.error('Error cleaning cache:', error);
      throw error;
    }
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      totalSize: this.mapData.totalCacheSize,
      maxSize: this.mapData.maxCacheSize,
      usage: (this.mapData.totalCacheSize / this.mapData.maxCacheSize) * 100,
      regions: this.mapData.regions.length,
      tiles: this.mapData.tiles.size,
      emergencyLocations: this.mapData.emergencyLocations.length,
      routes: this.mapData.routes.length,
      lastUpdated: this.mapData.lastUpdated
    };
  }

  /**
   * Check if operating in offline mode
   */
  isOffline(): boolean {
    return !this.isOnline;
  }

  /**
   * Event handling
   */
  addEventListener(event: string, handler: (...args: unknown[]) => void): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event)!.push(handler);
  }

  removeEventListener(event: string, handler: (...args: unknown[]) => void): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  private broadcastEvent(event: string, data: unknown): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error('Error in event handler:', error);
        }
      });
    }
  }

  /**
   * Utility methods
   */
  private calculateTilesForRegion(region: MapRegion): Array<{ z: number; x: number; y: number }> {
    const tiles: Array<{ z: number; x: number; y: number }> = [];

    region.zoomLevels.forEach(zoom => {
      const northWest = this.latLngToTile(region.bounds.north, region.bounds.west, zoom);
      const southEast = this.latLngToTile(region.bounds.south, region.bounds.east, zoom);

      for (let x = northWest.x; x <= southEast.x; x++) {
        for (let y = northWest.y; y <= southEast.y; y++) {
          tiles.push({ z: zoom, x, y });
        }
      }
    });

    return tiles;
  }

  private latLngToTile(lat: number, lng: number, zoom: number): { x: number; y: number } {
    const x = Math.floor((lng + 180) / 360 * Math.pow(2, zoom));
    const y = Math.floor((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom));
    return { x, y };
  }

  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371000; // Earth's radius in meters
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private findNearestWaypoint(position: { lat: number; lng: number }) {
    if (!this.navigation.currentRoute) return null;

    let nearestIndex = 0;
    let nearestDistance = Infinity;

    this.navigation.currentRoute.waypoints.forEach((waypoint, index) => {
      const distance = this.calculateDistance(
        position.lat,
        position.lng,
        waypoint.lat,
        waypoint.lng
      );

      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = index;
      }
    });

    return {
      index: nearestIndex,
      waypoint: this.navigation.currentRoute.waypoints[nearestIndex],
      distance: nearestDistance
    };
  }

  private updateRouteProgress(position: { lat: number; lng: number }): void {
    if (!this.navigation.currentRoute) return;

    // Calculate progress along route
    // This is a simplified implementation
    const route = this.navigation.currentRoute;
    const totalDistance = route.totalDistance;
    
    // Find progress based on nearest waypoint
    const nearest = this.findNearestWaypoint(position);
    if (nearest) {
      const waypointsCompleted = nearest.index;
      const distanceToWaypoints = route.waypoints
        .slice(0, waypointsCompleted)
        .reduce((sum, waypoint) => sum + waypoint.distance, 0);

      this.navigation.routeProgress.distanceTraveled = distanceToWaypoints;
      this.navigation.routeProgress.distanceRemaining = totalDistance - distanceToWaypoints;
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private setupEventListeners(): void {
    // Online/offline detection
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.broadcastEvent('connection_changed', { online: true });
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.broadcastEvent('connection_changed', { online: false });
    });
  }

  // Database operations
  private async saveTile(tile: MapTile, regionId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) return reject(new Error('Database not initialized'));

      const transaction = this.db.transaction(['tiles'], 'readwrite');
      const store = transaction.objectStore('tiles');
      
      const request = store.put({ ...tile, regionId });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  private async saveRegion(region: MapRegion): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) return reject(new Error('Database not initialized'));

      const transaction = this.db.transaction(['regions'], 'readwrite');
      const store = transaction.objectStore('regions');
      
      const request = store.put(region);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  private async saveEmergencyLocation(location: EmergencyLocation): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) return reject(new Error('Database not initialized'));

      const transaction = this.db.transaction(['locations'], 'readwrite');
      const store = transaction.objectStore('locations');
      
      const request = store.put(location);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  private async saveRoute(route: OfflineRoute): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) return reject(new Error('Database not initialized'));

      const transaction = this.db.transaction(['routes'], 'readwrite');
      const store = transaction.objectStore('routes');
      
      const request = store.put(route);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  private async deleteTile(tileId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) return reject(new Error('Database not initialized'));

      const transaction = this.db.transaction(['tiles'], 'readwrite');
      const store = transaction.objectStore('tiles');
      
      const request = store.delete(tileId);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  private async loadCachedData(): Promise<void> {
    if (!this.db) return;

    try {
      // Load regions
      const regions = await this.loadAllFromStore<MapRegion>('regions');
      this.mapData.regions = regions;

      // Load tiles
      const tiles = await this.loadAllFromStore<MapTile & { regionId: string }>('tiles');
      tiles.forEach(tile => {
        this.mapData.tiles.set(tile.id, tile);
        this.mapData.totalCacheSize += tile.size;
      });

      // Load emergency locations
      const locations = await this.loadAllFromStore<EmergencyLocation>('locations');
      this.mapData.emergencyLocations = locations;

      // Load routes
      const routes = await this.loadAllFromStore<OfflineRoute>('routes');
      this.mapData.routes = routes;

      console.log('Cached data loaded:', this.getCacheStats());
    } catch (error) {
      console.error('Error loading cached data:', error);
    }
  }

  private async loadAllFromStore<T>(storeName: string): Promise<T[]> {
    return new Promise((resolve, reject) => {
      if (!this.db) return reject(new Error('Database not initialized'));

      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
}

export default OfflineMapsService;
