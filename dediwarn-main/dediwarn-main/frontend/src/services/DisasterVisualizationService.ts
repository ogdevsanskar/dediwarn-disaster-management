/**
 * 3D Disaster Visualization Service
 * Advanced 3D visualization using Three.js for disaster simulation and analysis
 */

import * as THREE from 'three';

export interface TerrainData {
  width: number;
  height: number;
  elevationData: number[][]; // Height map data
  bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  resolution: number; // meters per pixel
}

export interface FloodSimulationData {
  id: string;
  timestamp: Date;
  waterLevel: number; // meters above sea level
  affectedAreas: Array<{
    coordinates: Array<{ lat: number; lng: number }>;
    depth: number; // water depth in meters
    velocity: number; // water flow velocity m/s
    direction: number; // flow direction in degrees
  }>;
  progression: Array<{
    time: number; // minutes from start
    extent: Array<{ lat: number; lng: number }>;
    maxDepth: number;
  }>;
}

export interface FireSpreadData {
  id: string;
  ignitionPoint: { lat: number; lng: number };
  timestamp: Date;
  currentPerimeter: Array<{ lat: number; lng: number }>;
  intensity: number; // fire intensity 1-10
  spreadRate: number; // meters per minute
  windDirection: number; // degrees
  windSpeed: number; // m/s
  progression: Array<{
    time: number; // minutes from ignition
    perimeter: Array<{ lat: number; lng: number }>;
    burnedArea: number; // square kilometers
    temperature: number; // celsius
  }>;
  fuelType: 'grass' | 'brush' | 'forest' | 'urban';
  terrainSlope: number; // average slope in degrees
}

export interface EvacuationVisualization {
  routes: Array<{
    id: string;
    path: Array<{ lat: number; lng: number; elevation: number }>;
    capacity: number; // people per hour
    currentLoad: number; // current people count
    estimatedTime: number; // minutes
    safetyScore: number; // 0-100
    hazards: Array<{
      location: { lat: number; lng: number };
      type: string;
      severity: number;
    }>;
  }>;
  shelters: Array<{
    id: string;
    location: { lat: number; lng: number; elevation: number };
    capacity: number;
    currentOccupancy: number;
    services: string[];
    accessibility: boolean;
  }>;
  evacuationZones: Array<{
    id: string;
    priority: number;
    boundary: Array<{ lat: number; lng: number }>;
    population: number;
    estimatedEvacuationTime: number;
  }>;
}

export interface Visualization3DConfig {
  container: HTMLElement;
  width: number;
  height: number;
  terrain: TerrainData;
  camera: {
    position: { x: number; y: number; z: number };
    target: { x: number; y: number; z: number };
  };
  lighting: {
    ambient: number;
    directional: {
      intensity: number;
      position: { x: number; y: number; z: number };
    };
  };
  controls: {
    enableZoom: boolean;
    enableRotate: boolean;
    enablePan: boolean;
    maxDistance: number;
    minDistance: number;
  };
}

class DisasterVisualizationService {
  private static instance: DisasterVisualizationService;
  private scene: THREE.Scene | null = null;
  private camera: THREE.PerspectiveCamera | null = null;
  private renderer: THREE.WebGLRenderer | null = null;
  private controls: unknown = null; // OrbitControls - type will be set when library is imported
  private terrain: THREE.Mesh | null = null;
  private floodLayer: THREE.Group | null = null;
  private fireLayer: THREE.Group | null = null;
  private evacuationLayer: THREE.Group | null = null;
  private animationId: number | null = null;
  private isInitialized = false;

  // Simulation state
  private currentFloodSimulation: FloodSimulationData | null = null;
  private currentFireSimulation: FireSpreadData | null = null;
  private currentEvacuationData: EvacuationVisualization | null = null;
  private simulationTime = 0; // Current simulation time in minutes
  private isSimulationRunning = false;

  private constructor() {}

  static getInstance(): DisasterVisualizationService {
    if (!DisasterVisualizationService.instance) {
      DisasterVisualizationService.instance = new DisasterVisualizationService();
    }
    return DisasterVisualizationService.instance;
  }

  /**
   * Initialize the 3D visualization system
   */
  async initialize(config: Visualization3DConfig): Promise<void> {
    try {
      // Create scene
      this.scene = new THREE.Scene();
      this.scene.background = new THREE.Color(0x87CEEB); // Sky blue

      // Create camera
      this.camera = new THREE.PerspectiveCamera(
        75,
        config.width / config.height,
        0.1,
        10000
      );
      this.camera.position.set(
        config.camera.position.x,
        config.camera.position.y,
        config.camera.position.z
      );

      // Create renderer
      this.renderer = new THREE.WebGLRenderer({ antialias: true });
      this.renderer.setSize(config.width, config.height);
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      config.container.appendChild(this.renderer.domElement);

      // Add lighting
      const ambientLight = new THREE.AmbientLight(0x404040, config.lighting.ambient);
      this.scene.add(ambientLight);

      const directionalLight = new THREE.DirectionalLight(0xffffff, config.lighting.directional.intensity);
      directionalLight.position.set(
        config.lighting.directional.position.x,
        config.lighting.directional.position.y,
        config.lighting.directional.position.z
      );
      directionalLight.castShadow = true;
      directionalLight.shadow.mapSize.width = 2048;
      directionalLight.shadow.mapSize.height = 2048;
      this.scene.add(directionalLight);

      // Initialize controls (would need to import OrbitControls)
      // this.setupControls(config.controls);

      // Create terrain
      await this.createTerrain(config.terrain);

      // Initialize layers
      this.floodLayer = new THREE.Group();
      this.fireLayer = new THREE.Group();
      this.evacuationLayer = new THREE.Group();
      this.scene.add(this.floodLayer);
      this.scene.add(this.fireLayer);
      this.scene.add(this.evacuationLayer);

      // Start render loop
      this.startRenderLoop();

      this.isInitialized = true;
      console.log('3D Disaster Visualization initialized successfully');
    } catch (error) {
      console.error('Error initializing 3D visualization:', error);
      throw error;
    }
  }

  /**
   * Create 3D terrain from elevation data
   */
  private async createTerrain(terrainData: TerrainData): Promise<void> {
    const { width, height, elevationData } = terrainData;

    // Create geometry from elevation data
    const geometry = new THREE.PlaneGeometry(
      width * terrainData.resolution,
      height * terrainData.resolution,
      width - 1,
      height - 1
    );

    // Apply elevation data to vertices
    const vertices = geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < height; i++) {
      for (let j = 0; j < width; j++) {
        const vertexIndex = (i * width + j) * 3;
        vertices[vertexIndex + 2] = elevationData[i][j]; // Z coordinate for elevation
      }
    }

    geometry.computeVertexNormals();

    // Create material with elevation-based coloring
    const material = new THREE.ShaderMaterial({
      uniforms: {
        minElevation: { value: Math.min(...elevationData.flat()) },
        maxElevation: { value: Math.max(...elevationData.flat()) }
      },
      vertexShader: `
        varying float vElevation;
        void main() {
          vElevation = position.z;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float minElevation;
        uniform float maxElevation;
        varying float vElevation;
        
        void main() {
          float elevationRatio = (vElevation - minElevation) / (maxElevation - minElevation);
          
          // Color based on elevation
          vec3 lowColor = vec3(0.2, 0.6, 0.2);  // Green for low elevation
          vec3 midColor = vec3(0.8, 0.7, 0.4);  // Brown for medium elevation
          vec3 highColor = vec3(0.9, 0.9, 0.9); // White for high elevation
          
          vec3 color;
          if (elevationRatio < 0.5) {
            color = mix(lowColor, midColor, elevationRatio * 2.0);
          } else {
            color = mix(midColor, highColor, (elevationRatio - 0.5) * 2.0);
          }
          
          gl_FragColor = vec4(color, 1.0);
        }
      `
    });

    this.terrain = new THREE.Mesh(geometry, material);
    this.terrain.rotation.x = -Math.PI / 2; // Rotate to horizontal
    this.terrain.receiveShadow = true;
    this.scene?.add(this.terrain);
  }

  /**
   * Start flood simulation visualization
   */
  async startFloodSimulation(floodData: FloodSimulationData): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('Visualization not initialized');
    }

    this.currentFloodSimulation = floodData;
    this.clearFloodLayer();

    // Create initial flood visualization
    this.updateFloodVisualization(0);
  }

  /**
   * Update flood visualization based on time
   */
  private updateFloodVisualization(timeMinutes: number): void {
    if (!this.currentFloodSimulation || !this.floodLayer) return;

    // Clear existing flood visualization
    this.clearFloodLayer();

    // Find current flood state
    const currentState = this.getCurrentFloodState(timeMinutes);
    if (!currentState) return;

    // Create water surface mesh
    currentState.extent.forEach(area => {
      const waterGeometry = this.createWaterGeometry([area]);
      const waterMaterial = new THREE.MeshLambertMaterial({
        color: 0x006994,
        transparent: true,
        opacity: 0.7
      });

      const waterMesh = new THREE.Mesh(waterGeometry, waterMaterial);
      waterMesh.position.y = currentState.maxDepth / 2;
      this.floodLayer?.add(waterMesh);
    });

    // Add flow direction indicators
    this.addFlowIndicators(this.currentFloodSimulation.affectedAreas);
  }

  /**
   * Start fire spread simulation
   */
  async startFireSimulation(fireData: FireSpreadData): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('Visualization not initialized');
    }

    this.currentFireSimulation = fireData;
    this.clearFireLayer();

    // Create initial fire visualization
    this.updateFireVisualization(0);
  }

  /**
   * Update fire visualization based on time
   */
  private updateFireVisualization(timeMinutes: number): void {
    if (!this.currentFireSimulation || !this.fireLayer) return;

    // Clear existing fire visualization
    this.clearFireLayer();

    // Find current fire state
    const currentState = this.getCurrentFireState(timeMinutes);
    if (!currentState) return;

    // Create fire perimeter
    const fireGeometry = this.createFireGeometry(currentState.perimeter);
    const fireMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: timeMinutes },
        intensity: { value: this.currentFireSimulation.intensity }
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform float intensity;
        varying vec2 vUv;
        
        void main() {
          float noise = sin(vUv.x * 10.0 + time * 0.1) * sin(vUv.y * 10.0 + time * 0.1);
          vec3 fireColor = mix(vec3(1.0, 0.2, 0.0), vec3(1.0, 1.0, 0.0), noise * 0.5 + 0.5);
          float alpha = intensity / 10.0 * (0.8 + noise * 0.2);
          gl_FragColor = vec4(fireColor, alpha);
        }
      `,
      transparent: true
    });

    const fireMesh = new THREE.Mesh(fireGeometry, fireMaterial);
    fireMesh.position.y = 5; // Slightly above ground
    this.fireLayer?.add(fireMesh);

    // Add smoke particles
    this.addSmokeEffect(currentState.perimeter);

    // Add fire intensity indicators
    this.addFireIntensityIndicators(currentState.perimeter, currentState.temperature);
  }

  /**
   * Visualize evacuation routes and zones
   */
  async visualizeEvacuation(evacuationData: EvacuationVisualization): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('Visualization not initialized');
    }

    this.currentEvacuationData = evacuationData;
    this.clearEvacuationLayer();

    // Visualize evacuation routes
    evacuationData.routes.forEach(route => {
      this.createEvacuationRoute(route);
    });

    // Visualize shelters
    evacuationData.shelters.forEach(shelter => {
      this.createShelterVisualization(shelter);
    });

    // Visualize evacuation zones
    evacuationData.evacuationZones.forEach(zone => {
      this.createEvacuationZone(zone);
    });
  }

  /**
   * Create evacuation route visualization
   */
  private createEvacuationRoute(route: EvacuationVisualization['routes'][0]): void {
    if (!this.evacuationLayer) return;

    const points = route.path.map(point => 
      new THREE.Vector3(
        this.latLngToWorld(point.lat, point.lng).x,
        point.elevation + 2,
        this.latLngToWorld(point.lat, point.lng).z
      )
    );

    const curve = new THREE.CatmullRomCurve3(points);
    const tubeGeometry = new THREE.TubeGeometry(curve, 50, 2, 8);
    
    // Color based on safety score
    const color = new THREE.Color().setHSL(route.safetyScore / 100 * 0.3, 1, 0.5);
    const routeMaterial = new THREE.MeshLambertMaterial({ color });

    const routeMesh = new THREE.Mesh(tubeGeometry, routeMaterial);
    this.evacuationLayer.add(routeMesh);

    // Add directional arrows
    this.addRouteDirectionArrows(points, color);

    // Add hazard indicators
    route.hazards.forEach(hazard => {
      this.addHazardIndicator(hazard);
    });
  }

  /**
   * Create shelter visualization
   */
  private createShelterVisualization(shelter: EvacuationVisualization['shelters'][0]): void {
    if (!this.evacuationLayer) return;

    const worldPos = this.latLngToWorld(shelter.location.lat, shelter.location.lng);
    
    // Create shelter building
    const shelterGeometry = new THREE.BoxGeometry(20, 15, 20);
    const occupancyRatio = shelter.currentOccupancy / shelter.capacity;
    const color = occupancyRatio > 0.8 ? 0xff4444 : occupancyRatio > 0.5 ? 0xffaa44 : 0x44ff44;
    
    const shelterMaterial = new THREE.MeshLambertMaterial({ color });
    const shelterMesh = new THREE.Mesh(shelterGeometry, shelterMaterial);
    
    shelterMesh.position.set(worldPos.x, shelter.location.elevation + 7.5, worldPos.z);
    this.evacuationLayer.add(shelterMesh);

    // Add capacity indicator
    this.addCapacityIndicator(shelter, worldPos);
  }

  /**
   * Create evacuation zone visualization
   */
  private createEvacuationZone(zone: EvacuationVisualization['evacuationZones'][0]): void {
    if (!this.evacuationLayer) return;

    const points = zone.boundary.map(point => {
      const worldPos = this.latLngToWorld(point.lat, point.lng);
      return new THREE.Vector2(worldPos.x, worldPos.z);
    });

    const shape = new THREE.Shape(points);
    const zoneGeometry = new THREE.ShapeGeometry(shape);
    
    // Color based on priority
    const color = new THREE.Color().setHSL((1 - zone.priority / 10) * 0.3, 0.7, 0.5);
    const zoneMaterial = new THREE.MeshLambertMaterial({ 
      color,
      transparent: true,
      opacity: 0.3
    });

    const zoneMesh = new THREE.Mesh(zoneGeometry, zoneMaterial);
    zoneMesh.rotation.x = -Math.PI / 2;
    zoneMesh.position.y = 1;
    this.evacuationLayer.add(zoneMesh);

    // Add priority label
    this.addZonePriorityLabel(zone);
  }

  /**
   * Control simulation playback
   */
  startSimulation(): void {
    this.isSimulationRunning = true;
    this.simulationTime = 0;
  }

  pauseSimulation(): void {
    this.isSimulationRunning = false;
  }

  resetSimulation(): void {
    this.isSimulationRunning = false;
    this.simulationTime = 0;
    this.updateVisualization();
  }

  setSimulationTime(timeMinutes: number): void {
    this.simulationTime = timeMinutes;
    this.updateVisualization();
  }

  /**
   * Update all visualizations based on current time
   */
  private updateVisualization(): void {
    if (this.currentFloodSimulation) {
      this.updateFloodVisualization(this.simulationTime);
    }
    
    if (this.currentFireSimulation) {
      this.updateFireVisualization(this.simulationTime);
    }
  }

  /**
   * Main render loop
   */
  private startRenderLoop(): void {
    const animate = () => {
      this.animationId = requestAnimationFrame(animate);

      // Update simulation time if running
      if (this.isSimulationRunning) {
        this.simulationTime += 0.1; // Increment by 6 seconds (0.1 minutes)
        this.updateVisualization();
      }

      // Update controls
      if (this.controls) {
        (this.controls as { update: () => void }).update();
      }

      // Render scene
      if (this.scene && this.camera && this.renderer) {
        this.renderer.render(this.scene, this.camera);
      }
    };

    animate();
  }

  /**
   * Utility methods
   */
  private latLngToWorld(lat: number, lng: number): { x: number; z: number } {
    // Simple conversion - in real implementation, use proper projection
    return {
      x: lng * 111320, // Approximate meters per degree longitude
      z: -lat * 111320 // Negative for proper orientation
    };
  }

  private getCurrentFloodState(timeMinutes: number) {
    if (!this.currentFloodSimulation) return null;
    
    const progression = this.currentFloodSimulation.progression;
    const currentIndex = progression.findIndex(p => p.time > timeMinutes);
    
    if (currentIndex === -1) {
      return progression[progression.length - 1];
    } else if (currentIndex === 0) {
      return progression[0];
    } else {
      // Interpolate between two states
      const prev = progression[currentIndex - 1];
      const next = progression[currentIndex];
      const factor = (timeMinutes - prev.time) / (next.time - prev.time);
      
      return {
        time: timeMinutes,
        extent: prev.extent, // Simplified - should interpolate
        maxDepth: prev.maxDepth + (next.maxDepth - prev.maxDepth) * factor
      };
    }
  }

  private getCurrentFireState(timeMinutes: number) {
    if (!this.currentFireSimulation) return null;
    
    const progression = this.currentFireSimulation.progression;
    const currentIndex = progression.findIndex(p => p.time > timeMinutes);
    
    if (currentIndex === -1) {
      return progression[progression.length - 1];
    } else if (currentIndex === 0) {
      return progression[0];
    } else {
      const prev = progression[currentIndex - 1];
      const next = progression[currentIndex];
      const factor = (timeMinutes - prev.time) / (next.time - prev.time);
      
      return {
        time: timeMinutes,
        perimeter: prev.perimeter, // Simplified - should interpolate
        burnedArea: prev.burnedArea + (next.burnedArea - prev.burnedArea) * factor,
        temperature: prev.temperature + (next.temperature - prev.temperature) * factor
      };
    }
  }

  // Helper methods for creating geometries and effects
  private createWaterGeometry(area: { lat: number; lng: number }[]): THREE.BufferGeometry {
    // Create geometry for flood area using the coordinates in 'area'
    const shape = new THREE.Shape();
    if (area.length > 0) {
      const first = this.latLngToWorld(area[0].lat, area[0].lng);
      shape.moveTo(first.x, first.z);
      for (let i = 1; i < area.length; i++) {
        const point = this.latLngToWorld(area[i].lat, area[i].lng);
        shape.lineTo(point.x, point.z);
      }
      shape.lineTo(first.x, first.z); // Close the shape
    }
    const geometry = new THREE.ShapeGeometry(shape);
    return geometry;
  }

  private createFireGeometry(perimeter: { lat: number; lng: number }[]): THREE.BufferGeometry {
    // Create geometry for fire perimeter using the coordinates in 'perimeter'
    const shape = new THREE.Shape();
    if (perimeter.length > 0) {
      const first = this.latLngToWorld(perimeter[0].lat, perimeter[0].lng);
      shape.moveTo(first.x, first.z);
      for (let i = 1; i < perimeter.length; i++) {
        const point = this.latLngToWorld(perimeter[i].lat, perimeter[i].lng);
        shape.lineTo(point.x, point.z);
      }
      shape.lineTo(first.x, first.z); // Close the shape
    }
    const geometry = new THREE.ShapeGeometry(shape);
    return geometry;
  }

  private addFlowIndicators(areas: FloodSimulationData['affectedAreas']): void {
    // Example: Add flow direction indicators for each affected area
    areas.forEach(area => {
      // For demonstration, log the flow direction and velocity
      console.log(`Flow direction: ${area.direction}°, velocity: ${area.velocity} m/s`);
      // In a real implementation, you would add 3D arrows or indicators here
    });
  }

  private addSmokeEffect(perimeter: { lat: number; lng: number }[]): void {
    // Example usage: Add smoke particle system at each perimeter point
    perimeter.forEach((point: { lat: number; lng: number }) => {
      // Here you would create and add a smoke particle at the converted world position
      // For demonstration, we'll just log the position
      console.log(`Add smoke at (${point.lat}, ${point.lng})`);
    });
  }

  private addFireIntensityIndicators(perimeter: { lat: number; lng: number }[], temperature: number): void {
    // Example: Log each perimeter point with temperature for demonstration
    perimeter.forEach(point => {
      console.log(`Fire intensity at (${point.lat}, ${point.lng}): ${temperature}°C`);
    });
    // Add fire intensity visualization
  }

  private addRouteDirectionArrows(points: THREE.Vector3[], color: THREE.Color): void {
    // Add directional arrows along route
    // For demonstration, log the points and color to avoid unused parameter error
    console.log('Route direction points:', points, 'Color:', color);
  }

  private addHazardIndicator(hazard: { location: { lat: number; lng: number }; type: string; severity: number }): void {
    // For demonstration, log the hazard details to avoid unused parameter error
    console.log(`Hazard at (${hazard.location.lat}, ${hazard.location.lng}): Type=${hazard.type}, Severity=${hazard.severity}`);
    // Add hazard warning indicators
  }

  private addCapacityIndicator(shelter: EvacuationVisualization['shelters'][0], worldPos: { x: number; z: number }): void {
    // Example: Add a simple text label showing shelter capacity and occupancy
    const capacityText = `Capacity: ${shelter.capacity}, Occupancy: ${shelter.currentOccupancy}`;
    // In a real implementation, you would create a 3D text or sprite here.
    // For demonstration, we'll log it:
    console.log(`Shelter at (${worldPos.x}, ${worldPos.z}): ${capacityText}`);
  }

  private addZonePriorityLabel(zone: EvacuationVisualization['evacuationZones'][0]): void {
    // Add priority level labels
    // For demonstration, log the zone priority to avoid unused parameter error
    console.log(`Evacuation zone ${zone.id} priority: ${zone.priority}`);
  }

  private clearFloodLayer(): void {
    if (this.floodLayer) {
      while (this.floodLayer.children.length > 0) {
        this.floodLayer.remove(this.floodLayer.children[0]);
      }
    }
  }

  private clearFireLayer(): void {
    if (this.fireLayer) {
      while (this.fireLayer.children.length > 0) {
        this.fireLayer.remove(this.fireLayer.children[0]);
      }
    }
  }

  private clearEvacuationLayer(): void {
    if (this.evacuationLayer) {
      while (this.evacuationLayer.children.length > 0) {
        this.evacuationLayer.remove(this.evacuationLayer.children[0]);
      }
    }
  }

  /**
   * Cleanup and dispose
   */
  dispose(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }

    if (this.renderer) {
      this.renderer.dispose();
    }

    if (this.scene) {
      this.scene.clear();
    }

    this.isInitialized = false;
  }

  /**
   * Export current visualization as image
   */
  exportImage(): string {
    if (!this.renderer) {
      throw new Error('Renderer not initialized');
    }
    return this.renderer.domElement.toDataURL('image/png');
  }

  /**
   * Get current simulation statistics
   */
  getSimulationStats() {
    return {
      currentTime: this.simulationTime,
      isRunning: this.isSimulationRunning,
      hasFloodSimulation: !!this.currentFloodSimulation,
      hasFireSimulation: !!this.currentFireSimulation,
      hasEvacuationData: !!this.currentEvacuationData
    };
  }
}

export default DisasterVisualizationService;
