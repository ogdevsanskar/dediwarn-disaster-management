/**
 * Navigation and Routing Service using OpenStreetMap and OSRM
 * Provides turn-by-turn navigation, route optimization, and real-time directions
 */

// Type definitions for external API responses
interface NominatimSearchResult {
  lat: string;
  lon: string;
  display_name: string;
  type: string;
  address?: Record<string, string>;
}

interface OverpassElement {
  lat?: number;
  lon?: number;
  tags?: {
    name?: string;
    amenity?: string;
  };
}

interface OSRMRoute {
  distance: number;
  duration: number;
  geometry: {
    coordinates: [number, number][];
  };
  legs: {
    steps: OSRMStep[];
  }[];
}

interface OSRMStep {
  distance: number;
  duration: number;
  maneuver: OSRMManeuver;
  geometry?: {
    coordinates: [number, number][];
  };
}

interface OSRMManeuver {
  type: string;
  modifier?: string;
  bearing_before?: number;
  bearing_after?: number;
  location: [number, number];
}

export interface RoutePoint {
  lat: number;
  lng: number;
  name?: string;
  description?: string;
}

export interface RouteStep {
  instruction: string;
  distance: number; // in meters
  duration: number; // in seconds
  maneuver: {
    type: string;
    direction?: string;
    bearing_before?: number;
    bearing_after?: number;
    location: [number, number];
  };
  geometry: [number, number][];
}

export interface NavigationRoute {
  id: string;
  name: string;
  distance: number; // total distance in meters
  duration: number; // total duration in seconds
  geometry: [number, number][]; // route path coordinates
  steps: RouteStep[];
  startPoint: RoutePoint;
  endPoint: RoutePoint;
  waypoints?: RoutePoint[];
  routeType: 'fastest' | 'shortest' | 'balanced' | 'emergency';
  hazardWarnings?: HazardWarning[];
}

export interface HazardWarning {
  id: string;
  type: 'road_closure' | 'flooding' | 'fire' | 'debris' | 'traffic';
  severity: 'low' | 'medium' | 'high' | 'critical';
  location: RoutePoint;
  description: string;
  affectedRadius: number; // in meters
  timestamp: Date;
}

export interface NavigationState {
  isNavigating: boolean;
  currentRoute?: NavigationRoute;
  currentPosition?: RoutePoint;
  nextWaypoint?: RoutePoint;
  progress: {
    distanceTraveled: number;
    distanceRemaining: number;
    timeElapsed: number;
    estimatedTimeRemaining: number;
    completionPercentage: number;
  };
  currentInstruction?: string;
  nextInstruction?: string;
  warnings: HazardWarning[];
}

export interface RoutingOptions {
  profile: 'driving' | 'walking' | 'cycling' | 'emergency';
  avoidHazards: boolean;
  avoidTolls: boolean;
  avoidHighways: boolean;
  preferSafeRoutes: boolean;
  maxDetour: number; // percentage of original route length
}

class NavigationService {
  private static instance: NavigationService;
  private navigationState: NavigationState;
  private watchId?: number;
  private routeUpdateCallbacks: ((state: NavigationState) => void)[] = [];
  private hazardDatabase: HazardWarning[] = [];

  // OpenStreetMap Routing Service (OSRM) endpoints
  private readonly OSRM_BASE_URL = 'https://router.project-osrm.org';
  private readonly NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';
  private readonly OVERPASS_BASE_URL = 'https://overpass-api.de/api/interpreter';

  private constructor() {
    this.navigationState = {
      isNavigating: false,
      progress: {
        distanceTraveled: 0,
        distanceRemaining: 0,
        timeElapsed: 0,
        estimatedTimeRemaining: 0,
        completionPercentage: 0
      },
      warnings: []
    };
    this.initializeHazardDatabase();
  }

  static getInstance(): NavigationService {
    if (!NavigationService.instance) {
      NavigationService.instance = new NavigationService();
    }
    return NavigationService.instance;
  }

  /**
   * Calculate route between two points using OSRM
   */
  async calculateRoute(
    start: RoutePoint,
    end: RoutePoint,
    options: Partial<RoutingOptions> = {}
  ): Promise<NavigationRoute> {
    try {
      const defaultOptions: RoutingOptions = {
        profile: 'driving',
        avoidHazards: true,
        avoidTolls: false,
        avoidHighways: false,
        preferSafeRoutes: true,
        maxDetour: 20
      };

      const routeOptions = { ...defaultOptions, ...options };
      const profile = this.mapProfileToOSRM(routeOptions.profile);

      // Build OSRM route request
      const coordinates = `${start.lng},${start.lat};${end.lng},${end.lat}`;
      const params = new URLSearchParams({
        overview: 'full',
        geometries: 'geojson',
        steps: 'true',
        annotations: 'true'
      });

      const osrmUrl = `${this.OSRM_BASE_URL}/route/v1/${profile}/${coordinates}?${params}`;
      
      const response = await fetch(osrmUrl);
      if (!response.ok) {
        throw new Error(`OSRM API error: ${response.statusText}`);
      }

      const data: { code: string; routes?: OSRMRoute[] } = await response.json();
      
      if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
        throw new Error('No route found');
      }

      const osrmRoute: OSRMRoute = data.routes[0];
      
      // Process route steps for navigation instructions
      const steps: RouteStep[] = this.processOSRMSteps(osrmRoute.legs[0].steps);

      // Check for hazards along the route
      const hazards = await this.checkRouteHazards(osrmRoute.geometry.coordinates);

      const navigationRoute: NavigationRoute = {
        id: this.generateRouteId(),
        name: `Route from ${start.name || 'Start'} to ${end.name || 'Destination'}`,
        distance: osrmRoute.distance,
        duration: osrmRoute.duration,
        geometry: osrmRoute.geometry.coordinates.map(([lng, lat]: [number, number]) => [lat, lng]),
        steps,
        startPoint: start,
        endPoint: end,
        routeType: this.mapOptionsToRouteType(routeOptions),
        hazardWarnings: hazards
      };

      return navigationRoute;
    } catch (error) {
      console.error('Error calculating route:', error);
      throw new Error(`Failed to calculate route: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Calculate multiple route alternatives
   */
  async calculateAlternativeRoutes(
    start: RoutePoint,
    end: RoutePoint,
    options: Partial<RoutingOptions> = {}
  ): Promise<NavigationRoute[]> {
    try {
      const routes: NavigationRoute[] = [];

      // Calculate primary route
      const primaryRoute = await this.calculateRoute(start, end, options);
      routes.push(primaryRoute);

      // Calculate alternative routes with different profiles
      const alternatives = [
        { ...options, profile: 'driving' as const, avoidHighways: true },
        { ...options, profile: 'driving' as const, preferSafeRoutes: false },
      ];

      for (const altOptions of alternatives) {
        try {
          const altRoute = await this.calculateRoute(start, end, altOptions);
          // Only add if significantly different from primary route
          if (this.isSignificantlyDifferent(primaryRoute, altRoute)) {
            routes.push(altRoute);
          }
        } catch (error) {
          console.warn('Failed to calculate alternative route:', error);
        }
      }

      return routes.sort((a, b) => {
        // Sort by safety first, then by duration
        const aSafety = this.calculateRouteSafety(a);
        const bSafety = this.calculateRouteSafety(b);
        if (aSafety !== bSafety) return bSafety - aSafety;
        return a.duration - b.duration;
      });
    } catch (error) {
      console.error('Error calculating alternative routes:', error);
      return [];
    }
  }

  /**
   * Start navigation for a route
   */
  async startNavigation(route: NavigationRoute): Promise<void> {
    try {
      // Stop any existing navigation
      this.stopNavigation();

      this.navigationState = {
        isNavigating: true,
        currentRoute: route,
        progress: {
          distanceTraveled: 0,
          distanceRemaining: route.distance,
          timeElapsed: 0,
          estimatedTimeRemaining: route.duration,
          completionPercentage: 0
        },
        currentInstruction: route.steps[0]?.instruction || 'Starting navigation',
        nextInstruction: route.steps[1]?.instruction,
        warnings: route.hazardWarnings || []
      };

      // Start GPS tracking
      this.startGPSTracking();

      // Notify listeners
      this.notifyStateChange();

      console.log('Navigation started for route:', route.name);
    } catch (error) {
      console.error('Error starting navigation:', error);
      throw error;
    }
  }

  /**
   * Stop navigation
   */
  stopNavigation(): void {
    if (this.watchId !== undefined) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = undefined;
    }

    this.navigationState = {
      isNavigating: false,
      progress: {
        distanceTraveled: 0,
        distanceRemaining: 0,
        timeElapsed: 0,
        estimatedTimeRemaining: 0,
        completionPercentage: 0
      },
      warnings: []
    };

    this.notifyStateChange();
    console.log('Navigation stopped');
  }

  /**
   * Get current navigation state
   */
  getNavigationState(): NavigationState {
    return { ...this.navigationState };
  }

  /**
   * Subscribe to navigation state changes
   */
  onNavigationUpdate(callback: (state: NavigationState) => void): () => void {
    this.routeUpdateCallbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.routeUpdateCallbacks.indexOf(callback);
      if (index > -1) {
        this.routeUpdateCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Search for places using Nominatim
   */
  async searchPlaces(query: string, bounds?: [[number, number], [number, number]]): Promise<RoutePoint[]> {
    try {
      const params = new URLSearchParams({
        q: query,
        format: 'json',
        limit: '10',
        addressdetails: '1',
        extratags: '1'
      });

      if (bounds) {
        const [[south, west], [north, east]] = bounds;
        params.append('viewbox', `${west},${north},${east},${south}`);
        params.append('bounded', '1');
      }

      const response = await fetch(`${this.NOMINATIM_BASE_URL}/search?${params}`);
      if (!response.ok) {
        throw new Error(`Nominatim API error: ${response.statusText}`);
      }

      const data = await response.json();
      
      return data.map((item: NominatimSearchResult) => ({
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
        name: item.display_name,
        description: item.type
      }));
    } catch (error) {
      console.error('Error searching places:', error);
      return [];
    }
  }

  /**
   * Reverse geocoding - get place name from coordinates
   */
  async reverseGeocode(lat: number, lng: number): Promise<RoutePoint | null> {
    try {
      const params = new URLSearchParams({
        lat: lat.toString(),
        lon: lng.toString(),
        format: 'json',
        addressdetails: '1'
      });

      const response = await fetch(`${this.NOMINATIM_BASE_URL}/reverse?${params}`);
      if (!response.ok) {
        throw new Error(`Nominatim API error: ${response.statusText}`);
      }

      const data = await response.json();
      
      return {
        lat,
        lng,
        name: data.display_name,
        description: data.address?.amenity || data.address?.building || 'Location'
      };
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      return null;
    }
  }

  /**
   * Find nearby emergency resources
   */
  async findNearbyResources(
    center: RoutePoint,
    radius: number = 5000, // meters
    resourceType: 'hospital' | 'fire_station' | 'police' | 'shelter' = 'hospital'
  ): Promise<RoutePoint[]> {
    try {
      const overpassQuery = this.buildOverpassQuery(center, radius, resourceType);
      
      const response = await fetch(this.OVERPASS_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `data=${encodeURIComponent(overpassQuery)}`
      });

      if (!response.ok) {
        throw new Error(`Overpass API error: ${response.statusText}`);
      }

      const data = await response.json();
      
      return data.elements
        .filter((element: OverpassElement) => element.lat && element.lon)
        .map((element: OverpassElement) => ({
          lat: element.lat,
          lng: element.lon,
          name: element.tags?.name || `${resourceType} facility`,
          description: element.tags?.amenity || resourceType
        }));
    } catch (error) {
      console.error('Error finding nearby resources:', error);
      return [];
    }
  }

  // Private helper methods

  private startGPSTracking(): void {
    if (!navigator.geolocation) {
      console.error('Geolocation is not supported');
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 1000
    };

    this.watchId = navigator.geolocation.watchPosition(
      (position) => this.updateNavigationPosition(position),
      (error) => console.error('GPS error:', error),
      options
    );
  }

  private updateNavigationPosition(position: GeolocationPosition): void {
    if (!this.navigationState.isNavigating || !this.navigationState.currentRoute) {
      return;
    }

    const currentPos: RoutePoint = {
      lat: position.coords.latitude,
      lng: position.coords.longitude
    };

    this.navigationState.currentPosition = currentPos;

    // Calculate progress
    const route = this.navigationState.currentRoute;
    const progress = this.calculateProgress(currentPos, route);
    this.navigationState.progress = progress;

    // Update instructions
    this.updateNavigationInstructions(currentPos, route);

    // Check for nearby hazards
    this.checkNearbyHazards(currentPos);

    this.notifyStateChange();
  }

  private calculateProgress(currentPos: RoutePoint, route: NavigationRoute): NavigationState['progress'] {
    // Find closest point on route
    const closestPoint = this.findClosestPointOnRoute(currentPos, route.geometry);
    const distanceTraveled = this.calculateDistanceAlongRoute(route.geometry, closestPoint.index);
    const distanceRemaining = route.distance - distanceTraveled;
    const completionPercentage = (distanceTraveled / route.distance) * 100;

    return {
      distanceTraveled,
      distanceRemaining,
      timeElapsed: this.navigationState.progress.timeElapsed + 1, // Approximate
      estimatedTimeRemaining: Math.round((distanceRemaining / route.distance) * route.duration),
      completionPercentage: Math.min(100, Math.max(0, completionPercentage))
    };
  }

  private updateNavigationInstructions(currentPos: RoutePoint, route: NavigationRoute): void {
    // Find current step based on position
    const currentStepIndex = this.findCurrentStepIndex(currentPos, route.steps);
    
    if (currentStepIndex < route.steps.length) {
      this.navigationState.currentInstruction = route.steps[currentStepIndex].instruction;
      this.navigationState.nextInstruction = route.steps[currentStepIndex + 1]?.instruction;
    }
  }

  private checkNearbyHazards(currentPos: RoutePoint): void {
    const nearbyHazards = this.hazardDatabase.filter(hazard => {
      const distance = this.calculateDistance(currentPos, hazard.location);
      return distance <= hazard.affectedRadius;
    });

    this.navigationState.warnings = nearbyHazards;
  }

  private notifyStateChange(): void {
    this.routeUpdateCallbacks.forEach(callback => {
      try {
        callback({ ...this.navigationState });
      } catch (error) {
        console.error('Error in navigation callback:', error);
      }
    });
  }

  private mapProfileToOSRM(profile: RoutingOptions['profile']): string {
    const mapping = {
      driving: 'driving',
      walking: 'foot',
      cycling: 'bike',
      emergency: 'driving'
    };
    return mapping[profile] || 'driving';
  }

  private mapOptionsToRouteType(options: RoutingOptions): NavigationRoute['routeType'] {
    if (options.profile === 'emergency') return 'emergency';
    if (options.preferSafeRoutes) return 'balanced';
    if (options.avoidHighways) return 'shortest';
    return 'fastest';
  }

  private processOSRMSteps(osrmSteps: OSRMStep[]): RouteStep[] {
    return osrmSteps.map(step => ({
      instruction: this.formatInstruction(step.maneuver),
      distance: step.distance,
      duration: step.duration,
      maneuver: {
        type: step.maneuver.type,
        direction: step.maneuver.modifier,
        bearing_before: step.maneuver.bearing_before,
        bearing_after: step.maneuver.bearing_after,
        location: step.maneuver.location
      },
      geometry: step.geometry?.coordinates?.map(([lng, lat]: [number, number]) => [lat, lng]) || []
    }));
  }

  private formatInstruction(maneuver: OSRMManeuver): string {
    const type = maneuver.type;
    const direction = maneuver.modifier;

    const instructions: { [key: string]: string } = {
      'depart': 'Start your journey',
      'arrive': 'You have arrived at your destination',
      'turn': `Turn ${direction}`,
      'continue': 'Continue straight',
      'merge': `Merge ${direction}`,
      'ramp': `Take the ramp ${direction}`,
      'roundabout': `Take the roundabout, exit ${direction}`,
      'exit roundabout': 'Exit the roundabout'
    };

    return instructions[type] || `${type} ${direction || ''}`.trim();
  }

  private async checkRouteHazards(coordinates: [number, number][]): Promise<HazardWarning[]> {
    // Check against known hazards in the database
    const routeHazards: HazardWarning[] = [];

    for (const hazard of this.hazardDatabase) {
      const isOnRoute = coordinates.some(([lng, lat]) => {
        const distance = this.calculateDistance(
          { lat, lng },
          hazard.location
        );
        return distance <= hazard.affectedRadius;
      });

      if (isOnRoute) {
        routeHazards.push(hazard);
      }
    }

    return routeHazards;
  }

  private calculateDistance(point1: RoutePoint, point2: RoutePoint): number {
    const R = 6371000; // Earth's radius in meters
    const φ1 = point1.lat * Math.PI / 180;
    const φ2 = point2.lat * Math.PI / 180;
    const Δφ = (point2.lat - point1.lat) * Math.PI / 180;
    const Δλ = (point2.lng - point1.lng) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  private findClosestPointOnRoute(point: RoutePoint, route: [number, number][]): { index: number; distance: number } {
    let minDistance = Infinity;
    let closestIndex = 0;

    for (let i = 0; i < route.length; i++) {
      const [lat, lng] = route[i];
      const distance = this.calculateDistance(point, { lat, lng });
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = i;
      }
    }

    return { index: closestIndex, distance: minDistance };
  }

  private calculateDistanceAlongRoute(route: [number, number][], pointIndex: number): number {
    let distance = 0;
    for (let i = 0; i < pointIndex && i < route.length - 1; i++) {
      const [lat1, lng1] = route[i];
      const [lat2, lng2] = route[i + 1];
      distance += this.calculateDistance({ lat: lat1, lng: lng1 }, { lat: lat2, lng: lng2 });
    }
    return distance;
  }

  private findCurrentStepIndex(currentPos: RoutePoint, steps: RouteStep[]): number {
    // Simplified: find step based on proximity to maneuver location
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      const [lat, lng] = step.maneuver.location;
      const distance = this.calculateDistance(currentPos, { lat, lng });
      if (distance < 50) { // Within 50 meters
        return i;
      }
    }
    return 0;
  }

  private isSignificantlyDifferent(route1: NavigationRoute, route2: NavigationRoute): boolean {
    const timeDiff = Math.abs(route1.duration - route2.duration) / Math.max(route1.duration, route2.duration);
    const distanceDiff = Math.abs(route1.distance - route2.distance) / Math.max(route1.distance, route2.distance);
    
    return timeDiff > 0.1 || distanceDiff > 0.1; // 10% difference threshold
  }

  private calculateRouteSafety(route: NavigationRoute): number {
    // Calculate safety score based on hazards and route characteristics
    let safetyScore = 100;
    
    for (const hazard of route.hazardWarnings || []) {
      const penalty = {
        low: 5,
        medium: 15,
        high: 30,
        critical: 50
      }[hazard.severity];
      
      safetyScore -= penalty;
    }

    return Math.max(0, safetyScore);
  }

  private buildOverpassQuery(center: RoutePoint, radius: number, resourceType: string): string {
    const amenityMap: { [key: string]: string } = {
      hospital: 'hospital',
      fire_station: 'fire_station',
      police: 'police',
      shelter: 'shelter'
    };

    const amenity = amenityMap[resourceType] || resourceType;

    return `
      [out:json][timeout:25];
      (
        node["amenity"="${amenity}"](around:${radius},${center.lat},${center.lng});
        way["amenity"="${amenity}"](around:${radius},${center.lat},${center.lng});
      );
      out center;
    `;
  }

  private generateRouteId(): string {
    return `route_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private initializeHazardDatabase(): void {
    // Initialize with some sample hazards
    this.hazardDatabase = [
      {
        id: 'hazard_1',
        type: 'flooding',
        severity: 'high',
        location: { lat: 40.7589, lng: -73.9851 },
        description: 'Flood warning in Central Park area',
        affectedRadius: 1000,
        timestamp: new Date()
      },
      {
        id: 'hazard_2',
        type: 'road_closure',
        severity: 'medium',
        location: { lat: 34.0522, lng: -118.2437 },
        description: 'Road closure due to construction',
        affectedRadius: 500,
        timestamp: new Date()
      }
    ];
  }

  /**
   * Add new hazard to the database
   */
  addHazard(hazard: Omit<HazardWarning, 'id' | 'timestamp'>): void {
    const newHazard: HazardWarning = {
      ...hazard,
      id: `hazard_${Date.now()}`,
      timestamp: new Date()
    };
    
    this.hazardDatabase.push(newHazard);
  }

  /**
   * Remove hazard from the database
   */
  removeHazard(hazardId: string): void {
    this.hazardDatabase = this.hazardDatabase.filter(h => h.id !== hazardId);
  }

  /**
   * Get all current hazards
   */
  getHazards(): HazardWarning[] {
    return [...this.hazardDatabase];
  }
}

export default NavigationService;
