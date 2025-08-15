/**
 * Smart Risk Assessment System
 * AI-Powered disaster prediction and personalized safety recommendations
 */

export interface RiskFactor {
  type: 'weather' | 'geological' | 'environmental' | 'social' | 'infrastructure';
  severity: number; // 0-100
  confidence: number; // 0-100
  source: string;
  timestamp: Date;
  location: {
    lat: number;
    lng: number;
    radius: number; // km
  };
  description: string;
}

export interface DisasterPrediction {
  disasterType: 'flood' | 'earthquake' | 'wildfire' | 'storm' | 'tornado' | 'tsunami' | 'landslide' | 'heatwave' | 'blizzard';
  probability: number; // 0-100
  timeframe: {
    min: number; // hours
    max: number; // hours
    peak: number; // hours when most likely
  };
  severity: 'low' | 'moderate' | 'high' | 'extreme';
  confidence: number; // 0-100
  affectedArea: {
    center: { lat: number; lng: number };
    radius: number; // km
    polygon?: Array<{ lat: number; lng: number }>;
  };
  riskFactors: RiskFactor[];
  historicalPatterns: {
    frequency: number; // events per year
    lastOccurrence: Date;
    averageSeverity: number;
  };
}

export interface PersonalSafetyRecommendation {
  id: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  category: 'immediate' | 'prepare' | 'evacuate' | 'shelter' | 'medical';
  title: string;
  description: string;
  actionItems: string[];
  timeframe: string; // "within 30 minutes", "next 2 hours", etc.
  location?: { lat: number; lng: number };
  personalizedFactors: string[]; // Why this applies to this user
  resources: {
    supplies?: string[];
    contacts?: string[];
    locations?: string[];
  };
}

export interface EvacuationRoute {
  id: string;
  name: string;
  startPoint: { lat: number; lng: number };
  endPoint: { lat: number; lng: number };
  waypoints: Array<{ lat: number; lng: number; description?: string }>;
  distance: number; // km
  estimatedTime: number; // minutes
  safetyScore: number; // 0-100
  congestionLevel: 'low' | 'medium' | 'high' | 'blocked';
  routeType: 'primary' | 'secondary' | 'emergency';
  hazards: string[];
  shelters: Array<{
    name: string;
    capacity: number;
    services: string[];
    location: { lat: number; lng: number };
  }>;
  lastUpdated: Date;
}

export interface UserProfile {
  id: string;
  location: { lat: number; lng: number };
  vulnerabilities: {
    mobility: 'high' | 'medium' | 'low';
    medical: string[]; // conditions
    age: 'child' | 'adult' | 'elderly';
    dependencies: string[]; // pets, family members, etc.
  };
  preferences: {
    transportMode: 'car' | 'walking' | 'bicycle' | 'public';
    language: string;
    notificationLevel: 'minimal' | 'standard' | 'detailed';
  };
  resources: {
    emergencySupplies: boolean;
    vehicle: boolean;
    pets: number;
    familySize: number;
  };
}

// Data structure interfaces for API responses
interface WeatherForecastItem {
  dt: number;
  weather: Array<{
    main: string;
    description?: string;
  }>;
  main: {
    temp: number;
    humidity?: number;
    pressure?: number;
  };
  wind?: {
    speed: number;
    deg: number;
  };
  rain?: {
    '3h': number;
  };
}

interface EarthquakeProperties {
  mag: number;
  place?: string;
  time: number;
  type?: string;
}

interface EarthquakeGeometry {
  coordinates: number[]; // [longitude, latitude, depth?]
}

interface EarthquakeFeature {
  properties: EarthquakeProperties;
  geometry: EarthquakeGeometry;
}

class SmartRiskAssessment {
  private static instance: SmartRiskAssessment;
  private riskFactors: Map<string, RiskFactor[]> = new Map();
  private predictions: Map<string, DisasterPrediction[]> = new Map();
  // Removed unused trafficCache property

  // Data Sources Integration
  // Removed unused dataSources property

  private constructor() {}

  static getInstance(): SmartRiskAssessment {
    if (!SmartRiskAssessment.instance) {
      SmartRiskAssessment.instance = new SmartRiskAssessment();
    }
    return SmartRiskAssessment.instance;
  }

  /**
   * Analyze multiple data sources for comprehensive risk assessment
   */
  async analyzeMultipleDataSources(
    location: { lat: number; lng: number },
    radius: number = 50 // km
  ): Promise<RiskFactor[]> {
    const riskFactors: RiskFactor[] = [];

    try {
      // Parallel data fetching for efficiency
      const [
        weatherRisks,
        geologicalRisks,
        environmentalRisks,
        socialRisks,
        infrastructureRisks
      ] = await Promise.all([
        this.analyzeWeatherData(location, radius),
        this.analyzeGeologicalData(location, radius),
        this.analyzeEnvironmentalData(location, radius),
        this.analyzeSocialData(location, radius),
        this.analyzeInfrastructureData(location, radius)
      ]);

      riskFactors.push(
        ...weatherRisks,
        ...geologicalRisks,
        ...environmentalRisks,
        ...socialRisks,
        ...infrastructureRisks
      );

      // Cache results for performance
      const cacheKey = `${location.lat}_${location.lng}_${radius}`;
      this.riskFactors.set(cacheKey, riskFactors);

      return riskFactors;
    } catch (error) {
      console.error('Error analyzing data sources:', error);
      return [];
    }
  }

  /**
   * Weather data analysis
   */
  private async analyzeWeatherData(
    location: { lat: number; lng: number },
    radius: number
  ): Promise<RiskFactor[]> {
    const risks: RiskFactor[] = [];

    try {
      // Simulate weather API call (replace with actual API key)
      const weatherData = await this.fetchWeatherData(location);
      const forecastData = await this.fetchWeatherForecast();

      // Current weather risks
      if (weatherData.wind?.speed > 15) { // m/s
        risks.push({
          type: 'weather',
          severity: Math.min((weatherData.wind.speed - 15) * 5, 100),
          confidence: 85,
          source: 'OpenWeatherMap',
          timestamp: new Date(),
          location: { ...location, radius },
          description: `High winds detected: ${weatherData.wind.speed} m/s`
        });
      }

      // Precipitation risks
      if (weatherData.rain && weatherData.rain['1h'] > 10) { // mm/h
        risks.push({
          type: 'weather',
          severity: Math.min(weatherData.rain['1h'] * 3, 100),
          confidence: 90,
          source: 'OpenWeatherMap',
          timestamp: new Date(),
          location: { ...location, radius },
          description: `Heavy rainfall: ${weatherData.rain['1h']} mm/h`
        });
      }

      // Temperature extremes
      const temp = weatherData.main.temp - 273.15; // Convert K to C
      if (temp > 35 || temp < -10) {
        risks.push({
          type: 'weather',
          severity: temp > 35 ? (temp - 35) * 2 : (10 + temp) * -2,
          confidence: 95,
          source: 'OpenWeatherMap',
          timestamp: new Date(),
          location: { ...location, radius },
          description: `Extreme temperature: ${temp.toFixed(1)}°C`
        });
      }

      // Forecast analysis for predictions
      forecastData.list.forEach((forecast: WeatherForecastItem) => {
        if (forecast.weather[0].main === 'Thunderstorm') {
          risks.push({
            type: 'weather',
            severity: 60,
            confidence: 75,
            source: 'OpenWeatherMap Forecast',
            timestamp: new Date(forecast.dt * 1000),
            location: { ...location, radius },
            description: `Thunderstorm predicted: ${new Date(forecast.dt * 1000).toLocaleString()}`
          });
        }
      });

    } catch (error) {
      console.error('Weather data analysis error:', error);
    }

    return risks;
  }

  /**
   * Geological data analysis
   */
  private async analyzeGeologicalData(
    location: { lat: number; lng: number },
    radius: number
  ): Promise<RiskFactor[]> {
    const risks: RiskFactor[] = [];

    try {
      // Fetch recent seismic activity
      const seismicData = await this.fetchSeismicData(location);

      seismicData.features.forEach((earthquake: EarthquakeFeature) => {
        const magnitude = earthquake.properties.mag;
        const distance = this.calculateDistance(
          location.lat, location.lng,
          earthquake.geometry.coordinates[1],
          earthquake.geometry.coordinates[0]
        );

        if (distance <= radius && magnitude >= 2.0) {
          risks.push({
            type: 'geological',
            severity: Math.min(magnitude * 15, 100),
            confidence: 90,
            source: 'USGS',
            timestamp: new Date(earthquake.properties.time),
            location: { ...location, radius: distance },
            description: `Earthquake M${magnitude} at ${distance.toFixed(1)}km distance`
          });
        }
      });

      // Historical seismic risk assessment
      const historicalRisk = await this.assessHistoricalSeismicRisk();
      if (historicalRisk > 30) {
        risks.push({
          type: 'geological',
          severity: historicalRisk,
          confidence: 70,
          source: 'Historical Analysis',
          timestamp: new Date(),
          location: { ...location, radius },
          description: `High historical seismic activity in region`
        });
      }

    } catch (error) {
      console.error('Geological data analysis error:', error);
    }

    return risks;
  }

  /**
   * Environmental data analysis
   */
  private async analyzeEnvironmentalData(
    location: { lat: number; lng: number },
    radius: number
  ): Promise<RiskFactor[]> {
    const risks: RiskFactor[] = [];

    try {
      // Wildfire risk assessment
      const fireRisk = await this.assessWildfireRisk(location);
      if (fireRisk > 40) {
        risks.push({
          type: 'environmental',
          severity: fireRisk,
          confidence: 80,
          source: 'NASA VIIRS',
          timestamp: new Date(),
          location: { ...location, radius },
          description: `Elevated wildfire risk based on vegetation and weather conditions`
        });
      }

      // Air quality assessment
      const airQuality = await this.assessAirQuality(location);
      if (airQuality.aqi > 150) {
        risks.push({
          type: 'environmental',
          severity: Math.min((airQuality.aqi - 100) / 2, 100),
          confidence: 85,
          source: 'Air Quality API',
          timestamp: new Date(),
          location: { ...location, radius },
          description: `Poor air quality: AQI ${airQuality.aqi}`
        });
      }

      // Flood risk from elevation and rainfall patterns
      const floodRisk = await this.assessFloodRisk(location);
      if (floodRisk > 50) {
        risks.push({
          type: 'environmental',
          severity: floodRisk,
          confidence: 75,
          source: 'Elevation & Rainfall Analysis',
          timestamp: new Date(),
          location: { ...location, radius },
          description: `Flood risk based on topography and precipitation patterns`
        });
      }

    } catch (error) {
      console.error('Environmental data analysis error:', error);
    }

    return risks;
  }

  /**
   * Social data analysis
   */
  private async analyzeSocialData(
    location: { lat: number; lng: number },
    radius: number
  ): Promise<RiskFactor[]> {
    const risks: RiskFactor[] = [];

    try {
      // Population density analysis
      const populationDensity = await this.getPopulationDensity(location);
      if (populationDensity > 1000) { // people per km²
        risks.push({
          type: 'social',
          severity: Math.min(populationDensity / 50, 100),
          confidence: 80,
          source: 'Census Data',
          timestamp: new Date(),
          location: { ...location, radius },
          description: `High population density: ${populationDensity} people/km²`
        });
      }

      // Event/gathering analysis (simulated)
      const events = await this.checkLargeEvents();
      events.forEach((event: { name: string; expectedAttendance: number }) => {
        risks.push({
          type: 'social',
          severity: Math.min(event.expectedAttendance / 1000, 100),
          confidence: 70,
          source: 'Event APIs',
          timestamp: new Date(),
          location: { ...location, radius },
          description: `Large event: ${event.name} (${event.expectedAttendance} attendees)`
        });
      });

    } catch (error) {
      console.error('Social data analysis error:', error);
    }

    return risks;
  }

  /**
   * Infrastructure data analysis
   */
  private async analyzeInfrastructureData(
    location: { lat: number; lng: number },
    radius: number
  ): Promise<RiskFactor[]> {
    const risks: RiskFactor[] = [];

    try {
      // Critical infrastructure proximity
      const criticalInfra = await this.identifyCriticalInfrastructure() as Array<{ type: string; distance: number }>;
      
      criticalInfra.forEach((facility: { type: string; distance: number }) => {
        if (facility.type === 'nuclear' || facility.type === 'chemical') {
          risks.push({
            type: 'infrastructure',
            severity: 80 - facility.distance * 2, // Higher risk closer to facility
            confidence: 90,
            source: 'Infrastructure Database',
            timestamp: new Date(),
            location: { ...location, radius: facility.distance },
            description: `${facility.type} facility within ${facility.distance}km`
          });
        }
      });

      // Transportation network analysis
      const trafficCongestion = await this.analyzeTrafficPatterns();
      if (trafficCongestion.severity > 70) {
        risks.push({
          type: 'infrastructure',
          severity: trafficCongestion.severity,
          confidence: 85,
          source: 'Traffic Analysis',
          timestamp: new Date(),
          location: { ...location, radius },
          description: `High traffic congestion affecting evacuation routes`
        });
      }

    } catch (error) {
      console.error('Infrastructure data analysis error:', error);
    }

    return risks;
  }

  /**
   * Predict disaster likelihood using AI/ML models
   */
  async predictDisasterLikelihood(
    location: { lat: number; lng: number },
    timeframe: number = 72 // hours
  ): Promise<DisasterPrediction[]> {
    const predictions: DisasterPrediction[] = [];

    try {
      // Get comprehensive risk factors
      const riskFactors = await this.analyzeMultipleDataSources(location, 100);
      
      // Weather-based predictions
      const weatherPredictions = await this.predictWeatherDisasters(location, riskFactors);
      predictions.push(...weatherPredictions);

      // Geological predictions
      const geologicalPredictions = await this.predictGeologicalDisasters(location, riskFactors);
      predictions.push(...geologicalPredictions);

      // Environmental predictions
      const environmentalPredictions = await this.predictEnvironmentalDisasters(location, riskFactors);
      predictions.push(...environmentalPredictions);

      // Cache predictions
      const cacheKey = `${location.lat}_${location.lng}_${timeframe}`;
      this.predictions.set(cacheKey, predictions);

      return predictions.sort((a, b) => b.probability - a.probability);
    } catch (error) {
      console.error('Error predicting disasters:', error);
      return [];
    }
  }

  /**
   * Generate personalized safety recommendations
   */
  async generatePersonalizedRecommendations(
    userProfile: UserProfile,
    predictions: DisasterPrediction[]
  ): Promise<PersonalSafetyRecommendation[]> {
    const recommendations: PersonalSafetyRecommendation[] = [];

    for (const prediction of predictions) {
      if (prediction.probability < 20) continue; // Skip low probability events

      const recs = await this.generateDisasterSpecificRecommendations(
        prediction,
        userProfile
      );
      recommendations.push(...recs);
    }

    // Sort by priority and personalization relevance
    return recommendations.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  /**
   * Optimize evacuation routes using AI
   */
  async optimizeEvacuationRoutes(
    startLocation: { lat: number; lng: number }
  ): Promise<EvacuationRoute[]> {
    const routes: EvacuationRoute[] = [];

    try {
      // Find potential evacuation destinations
      const shelters = await this.findEvacuationShelters(startLocation);
      
      // Generate multiple route options for each shelter
      for (const shelter of shelters.slice(0, 3)) { // Top 3 shelters
        const routeOptions = await this.generateRouteOptions(
          startLocation,
          shelter.location
        );

        routes.push(...routeOptions);
      }

      // Score and rank routes
      const scoredRoutes = await this.scoreEvacuationRoutes(routes);

      return scoredRoutes.sort((a, b) => b.safetyScore - a.safetyScore).slice(0, 5);
    } catch (error) {
      console.error('Error optimizing evacuation routes:', error);
      return [];
    }
  }

  // Helper methods for API calls and calculations

  private async fetchWeatherData(location: { lat: number; lng: number }) {
    // Simulate API call - replace with actual implementation
    // Use location to vary weather data for demonstration
    const tempVariation = (location.lat + location.lng) % 10;
    return {
      main: { temp: 298 + tempVariation, feels_like: 301 + tempVariation, pressure: 1013, humidity: 60 },
      wind: { speed: Math.random() * 20, deg: 180 },
      weather: [{ main: 'Clear', description: 'clear sky' }],
      rain: Math.random() > 0.7 ? { '1h': Math.random() * 20 } : undefined
    };
  }

  private async fetchWeatherForecast() {
    // Simulate forecast API call
    const forecasts = [];
    for (let i = 0; i < 40; i++) {
      forecasts.push({
        dt: Date.now() / 1000 + i * 3600 * 3, // Every 3 hours
        weather: [{ main: Math.random() > 0.8 ? 'Thunderstorm' : 'Clear' }],
        main: { temp: 295 + Math.random() * 10 }
      });
    }
    return { list: forecasts };
  }

  private async fetchSeismicData(location: { lat: number; lng: number }) {
    // Simulate USGS API call
    const features = [];
    const numEarthquakes = Math.floor(Math.random() * 5);
    
    for (let i = 0; i < numEarthquakes; i++) {
      features.push({
        properties: {
          mag: 2 + Math.random() * 4,
          time: Date.now() - Math.random() * 86400000 * 7 // Within last week
        },
        geometry: {
          coordinates: [
            location.lng + (Math.random() - 0.5) * 2,
            location.lat + (Math.random() - 0.5) * 2,
            Math.random() * 50
          ]
        }
      });
    }
    
    return { features };
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

  // Additional helper methods (simplified for demo)
  private async assessHistoricalSeismicRisk(): Promise<number> {
    // Simulate historical analysis
    return Math.random() * 100;
  }

  private async assessWildfireRisk(location: { lat: number; lng: number }): Promise<number> {
    // Simulate wildfire risk calculation based on vegetation, weather, etc.
    // Use location to vary risk for demonstration
    const locationFactor = ((location.lat + location.lng) % 10) * 5;
    return Math.random() * 100 + locationFactor;
  }

  private async assessAirQuality(location: { lat: number; lng: number }) {
    // Use location to vary AQI for demonstration
    const locationFactor = ((location.lat + location.lng) % 10) * 5;
    return { aqi: 50 + locationFactor + Math.random() * 150 };
  }

  private async assessFloodRisk(location: { lat: number; lng: number }): Promise<number> {
    // Use location to vary flood risk for demonstration
    const locationFactor = ((location.lat + location.lng) % 10) * 5;
    return Math.random() * 100 + locationFactor;
  }

  private async getPopulationDensity(location: { lat: number; lng: number }): Promise<number> {
    // Use location to vary population density for demonstration
    const variation = ((location.lat + location.lng) % 10) * 50;
    return 100 + variation + Math.random() * 2000;
  }

  private async checkLargeEvents() {
    return []; // Simulate no events for now
  }

  private async identifyCriticalInfrastructure() {
    return []; // Simulate no critical infrastructure
  }

  private async analyzeTrafficPatterns() {
    return { severity: Math.random() * 100 };
  }

  private async predictWeatherDisasters(
    location: { lat: number; lng: number },
    riskFactors: RiskFactor[]
  ): Promise<DisasterPrediction[]> {
    const predictions: DisasterPrediction[] = [];
    
    // Weather-based risk analysis
    const weatherRisks = riskFactors.filter(rf => rf.type === 'weather');
    
    // Flood prediction based on rainfall
    if (weatherRisks.some(wr => wr.description.includes('Heavy rainfall'))) {
      predictions.push({
        disasterType: 'flood',
        probability: 65,
        timeframe: { min: 2, max: 24, peak: 8 },
        severity: 'moderate',
        confidence: 80,
        affectedArea: { center: location, radius: 25 },
        riskFactors: weatherRisks,
        historicalPatterns: {
          frequency: 0.8,
          lastOccurrence: new Date(Date.now() - 86400000 * 180),
          averageSeverity: 60
        }
      });
    }

    // Storm prediction based on wind and pressure
    const windRisk = weatherRisks.find(wr => wr.description.includes('High winds'));
    if (windRisk && windRisk.severity > 60) {
      predictions.push({
        disasterType: 'storm',
        probability: Math.min(windRisk.severity + 20, 95),
        timeframe: { min: 1, max: 12, peak: 4 },
        severity: windRisk.severity > 80 ? 'high' : 'moderate',
        confidence: 85,
        affectedArea: { center: location, radius: 40 },
        riskFactors: [windRisk],
        historicalPatterns: {
          frequency: 2.1,
          lastOccurrence: new Date(Date.now() - 86400000 * 45),
          averageSeverity: 55
        }
      });
    }

    // Temperature-based predictions
    const tempRisk = weatherRisks.find(wr => wr.description.includes('Extreme temperature'));
    if (tempRisk) {
      const isHot = tempRisk.description.includes('35') || tempRisk.severity > 70;
      predictions.push({
        disasterType: isHot ? 'heatwave' : 'blizzard',
        probability: Math.min(tempRisk.severity + 15, 90),
        timeframe: { min: 6, max: 72, peak: 24 },
        severity: tempRisk.severity > 75 ? 'high' : 'moderate',
        confidence: 90,
        affectedArea: { center: location, radius: 100 },
        riskFactors: [tempRisk],
        historicalPatterns: {
          frequency: isHot ? 1.5 : 0.3,
          lastOccurrence: new Date(Date.now() - 86400000 * (isHot ? 120 : 400)),
          averageSeverity: tempRisk.severity
        }
      });
    }

    return predictions;
  }

  private async predictGeologicalDisasters(
    location: { lat: number; lng: number },
    riskFactors: RiskFactor[]
  ): Promise<DisasterPrediction[]> {
    const predictions: DisasterPrediction[] = [];
    const geologicalRisks = riskFactors.filter(rf => rf.type === 'geological');
    
    // Earthquake prediction based on seismic activity
    const seismicRisk = geologicalRisks.find(gr => gr.description.includes('Earthquake'));
    if (seismicRisk && seismicRisk.severity > 40) {
      predictions.push({
        disasterType: 'earthquake',
        probability: Math.min(seismicRisk.severity, 75), // Cap earthquake predictions
        timeframe: { min: 1, max: 168, peak: 72 }, // 1 hour to 1 week, peak at 3 days
        severity: seismicRisk.severity > 70 ? 'high' : 'moderate',
        confidence: 70, // Lower confidence for earthquake predictions
        affectedArea: { center: location, radius: 150 },
        riskFactors: [seismicRisk],
        historicalPatterns: {
          frequency: 0.2,
          lastOccurrence: new Date(Date.now() - 86400000 * 800),
          averageSeverity: seismicRisk.severity
        }
      });
    }

    // Landslide prediction based on geological + weather factors
    const weatherRisks = riskFactors.filter(rf => rf.type === 'weather');
    const rainfallRisk = weatherRisks.find(wr => wr.description.includes('rainfall'));
    const historicalSeismic = geologicalRisks.find(gr => gr.description.includes('historical'));
    
    if (rainfallRisk && historicalSeismic && rainfallRisk.severity > 50) {
      predictions.push({
        disasterType: 'landslide',
        probability: Math.min((rainfallRisk.severity + historicalSeismic.severity) / 2, 80),
        timeframe: { min: 4, max: 48, peak: 12 },
        severity: rainfallRisk.severity > 70 ? 'high' : 'moderate',
        confidence: 75,
        affectedArea: { center: location, radius: 20 },
        riskFactors: [rainfallRisk, historicalSeismic],
        historicalPatterns: {
          frequency: 0.4,
          lastOccurrence: new Date(Date.now() - 86400000 * 300),
          averageSeverity: (rainfallRisk.severity + historicalSeismic.severity) / 2
        }
      });
    }

    return predictions;
  }

  private async predictEnvironmentalDisasters(
    location: { lat: number; lng: number },
    riskFactors: RiskFactor[]
  ): Promise<DisasterPrediction[]> {
    const predictions: DisasterPrediction[] = [];
    const environmentalRisks = riskFactors.filter(rf => rf.type === 'environmental');
    const weatherRisks = riskFactors.filter(rf => rf.type === 'weather');
    
    // Wildfire prediction
    const fireRisk = environmentalRisks.find(er => er.description.includes('wildfire'));
    const windRisk = weatherRisks.find(wr => wr.description.includes('winds'));
    const tempRisk = weatherRisks.find(wr => wr.description.includes('temperature') && wr.description.includes('35'));
    
    if (fireRisk || (windRisk && tempRisk)) {
      const combinedSeverity = fireRisk ? fireRisk.severity : ((windRisk?.severity || 0) + (tempRisk?.severity || 0)) / 2;
      
      predictions.push({
        disasterType: 'wildfire',
        probability: Math.min(combinedSeverity + 20, 95),
        timeframe: { min: 2, max: 96, peak: 24 },
        severity: combinedSeverity > 70 ? 'extreme' : combinedSeverity > 50 ? 'high' : 'moderate',
        confidence: 80,
        affectedArea: { center: location, radius: 80 },
        riskFactors: [fireRisk, windRisk, tempRisk].filter(Boolean) as RiskFactor[],
        historicalPatterns: {
          frequency: 1.8,
          lastOccurrence: new Date(Date.now() - 86400000 * 200),
          averageSeverity: combinedSeverity
        }
      });
    }

    // Air quality disaster prediction
    const airQualityRisk = environmentalRisks.find(er => er.description.includes('air quality'));
    if (airQualityRisk && airQualityRisk.severity > 60) {
      // This isn't a traditional "disaster" but important for health emergencies
      // Could be represented as an environmental health emergency
    }

    return predictions;
  }

  private async generateDisasterSpecificRecommendations(
    prediction: DisasterPrediction,
    userProfile: UserProfile
  ): Promise<PersonalSafetyRecommendation[]> {
    const recommendations: PersonalSafetyRecommendation[] = [];
    const urgency = prediction.probability > 70 ? 'critical' : 
                   prediction.probability > 50 ? 'high' : 
                   prediction.probability > 30 ? 'medium' : 'low';

    // Generate recommendations based on disaster type and user profile
    switch (prediction.disasterType) {
      case 'flood':
        recommendations.push({
          id: `flood-prep-${Date.now()}`,
          priority: urgency,
          category: 'prepare',
          title: 'Flood Preparation Protocol',
          description: 'Immediate steps to prepare for potential flooding in your area',
          actionItems: [
            'Move valuable items and electronics to higher floors',
            'Charge all electronic devices and power banks',
            'Fill bathtub and containers with clean water',
            'Review evacuation routes and identify higher ground',
            'Prepare emergency kit with food for 72 hours',
            userProfile.resources.pets > 0 ? 'Prepare pet carriers and pet supplies' : '',
            userProfile.vulnerabilities.mobility === 'low' ? 'Arrange transportation assistance if needed' : 'Fill vehicle with gas'
          ].filter(Boolean),
          timeframe: `within ${prediction.timeframe.min} hours`,
          personalizedFactors: [
            `Based on ${prediction.probability}% flood probability`,
            `Your location is in the predicted ${prediction.affectedArea.radius}km impact zone`,
            userProfile.resources.familySize > 1 ? `Customized for family of ${userProfile.resources.familySize}` : '',
            userProfile.vulnerabilities.medical.length > 0 ? 'Medical conditions considered' : ''
          ].filter(Boolean),
          resources: {
            supplies: ['Water containers', 'Flashlight', 'Battery radio', 'First aid kit', 'Non-perishable food'],
            contacts: ['Local emergency services: 911', 'Non-emergency city services'],
            locations: ['Higher ground areas nearby', 'Community evacuation centers']
          }
        });

        if (prediction.probability > 60) {
          recommendations.push({
            id: `flood-evacuate-${Date.now()}`,
            priority: 'critical',
            category: 'evacuate',
            title: 'Flood Evacuation Alert',
            description: 'High probability flood requires immediate evacuation consideration',
            actionItems: [
              'Monitor official evacuation orders',
              'Prepare to evacuate to higher ground',
              'Turn off utilities (gas, electricity, water) if instructed',
              'Take emergency kit and important documents',
              'Leave early - don\'t wait for water to rise'
            ],
            timeframe: `within ${Math.max(1, prediction.timeframe.min - 1)} hours`,
            personalizedFactors: [
              `Critical ${prediction.probability}% flood probability`,
              `Peak flooding expected in ${prediction.timeframe.peak} hours`
            ],
            resources: {
              supplies: ['Emergency kit', 'Important documents', 'Medications'],
              contacts: ['Emergency services: 911'],
              locations: ['Designated evacuation centers', 'Higher elevation areas']
            }
          });
        }
        break;

      case 'wildfire':
        recommendations.push({
          id: `wildfire-prep-${Date.now()}`,
          priority: urgency,
          category: 'prepare',
          title: 'Wildfire Preparation',
          description: 'Prepare for potential wildfire threat in your area',
          actionItems: [
            'Create defensible space around your home',
            'Clear gutters and roof of debris',
            'Prepare emergency evacuation kit',
            'Identify multiple evacuation routes',
            'Sign up for emergency alerts',
            'Prepare N95 masks for smoke protection',
            userProfile.resources.vehicle ? 'Keep vehicle fueled and ready' : 'Arrange transportation',
            userProfile.resources.pets > 0 ? 'Prepare pet evacuation plan' : ''
          ].filter(Boolean),
          timeframe: `within ${prediction.timeframe.min} hours`,
          personalizedFactors: [
            `Based on ${prediction.probability}% wildfire probability`,
            `Fire risk elevated due to weather conditions`,
            userProfile.vulnerabilities.medical.includes('asthma') || userProfile.vulnerabilities.medical.includes('respiratory') ? 'Respiratory health considerations' : ''
          ].filter(Boolean),
          resources: {
            supplies: ['N95 masks', 'Emergency kit', 'Fire extinguisher', 'Garden hose'],
            contacts: ['Fire department', 'Emergency services: 911', 'Local evacuation hotline'],
            locations: ['Evacuation centers', 'Safe zones outside fire risk area']
          }
        });
        break;

      case 'earthquake':
        recommendations.push({
          id: `earthquake-prep-${Date.now()}`,
          priority: urgency,
          category: 'prepare',
          title: 'Earthquake Preparedness',
          description: 'Prepare for potential seismic activity in your region',
          actionItems: [
            'Secure heavy furniture and appliances to walls',
            'Identify safe spots in each room (under sturdy desks/tables)',
            'Practice Drop, Cover, and Hold On drill',
            'Prepare earthquake emergency kit',
            'Know how to turn off gas, water, and electricity',
            'Plan family communication strategy',
            userProfile.vulnerabilities.mobility === 'low' ? 'Identify accessible safe spots and exit routes' : '',
            'Check and reinforce home foundation if needed'
          ].filter(Boolean),
          timeframe: `within ${prediction.timeframe.min} hours to days`,
          personalizedFactors: [
            `Based on ${prediction.probability}% earthquake probability`,
            `Historical seismic activity in your area`,
            userProfile.resources.familySize > 1 ? 'Family earthquake plan needed' : ''
          ].filter(Boolean),
          resources: {
            supplies: ['Emergency kit', 'Flashlight', 'Whistle', 'Sturdy shoes', 'Work gloves'],
            contacts: ['Emergency services: 911', 'Gas/utility companies'],
            locations: ['Safe spots in home', 'Open areas away from buildings']
          }
        });
        break;

      case 'storm':
        recommendations.push({
          id: `storm-prep-${Date.now()}`,
          priority: urgency,
          category: 'prepare',
          title: 'Severe Storm Preparation',
          description: 'Prepare for high winds and severe weather conditions',
          actionItems: [
            'Secure or bring indoors loose outdoor items',
            'Check and clean storm drains',
            'Trim tree branches near power lines',
            'Prepare for power outages - charge devices',
            'Stock emergency supplies for 72 hours',
            'Review safe room locations (interior, lowest floor)',
            userProfile.resources.vehicle ? 'Avoid unnecessary travel' : 'Arrange safe transportation'
          ].filter(Boolean),
          timeframe: `within ${prediction.timeframe.min} hours`,
          personalizedFactors: [
            `${prediction.probability}% severe storm probability`,
            `Wind speeds may affect ${prediction.affectedArea.radius}km area`
          ],
          resources: {
            supplies: ['Flashlight', 'Battery radio', 'Emergency food/water'],
            contacts: ['Power company', 'Emergency services: 911'],
            locations: ['Interior safe rooms', 'Community storm shelters']
          }
        });
        break;

      case 'heatwave':
        recommendations.push({
          id: `heatwave-prep-${Date.now()}`,
          priority: urgency,
          category: 'prepare',
          title: 'Extreme Heat Safety',
          description: 'Prepare for dangerous heat conditions',
          actionItems: [
            'Stay indoors during peak heat hours (10 AM - 6 PM)',
            'Drink water frequently, avoid alcohol and caffeine',
            'Wear light-colored, loose-fitting clothing',
            'Use fans and air conditioning, or go to cooling centers',
            'Check on elderly neighbors and relatives',
            'Never leave people or pets in vehicles',
            userProfile.vulnerabilities.age === 'elderly' ? 'Take extra precautions - higher heat risk' : '',
            userProfile.vulnerabilities.medical.length > 0 ? 'Monitor for heat-related health issues' : ''
          ].filter(Boolean),
          timeframe: `over next ${prediction.timeframe.max} hours`,
          personalizedFactors: [
            `Extreme heat expected with ${prediction.probability}% probability`,
            userProfile.vulnerabilities.age === 'elderly' || userProfile.vulnerabilities.medical.length > 0 ? 'Higher risk individual' : '',
            userProfile.resources.pets > 0 ? 'Pet heat safety considered' : ''
          ].filter(Boolean),
          resources: {
            supplies: ['Extra water', 'Electrolyte drinks', 'Cooling towels'],
            contacts: ['Health department heat hotline', 'Emergency services: 911'],
            locations: ['Cooling centers', 'Public libraries', 'Shopping malls']
          }
        });
        break;

      default:
        // Generic disaster preparation
        recommendations.push({
          id: `general-prep-${Date.now()}`,
          priority: urgency,
          category: 'prepare',
          title: 'Emergency Preparedness',
          description: 'General emergency preparation based on detected risks',
          actionItems: [
            'Review emergency communication plan',
            'Check emergency kit supplies',
            'Identify evacuation routes',
            'Stay informed through official channels'
          ],
          timeframe: 'next few hours',
          personalizedFactors: [`Based on detected risk factors in your area`],
          resources: {
            supplies: ['Emergency kit basics'],
            contacts: ['Emergency services: 911'],
            locations: ['Safe areas identified in emergency plan']
          }
        });
    }

    return recommendations;
  }

  private async findEvacuationShelters(
    location: { lat: number; lng: number }
  ) {
    // Simulate shelter finding
    return [
      {
        name: 'Community Center',
        location: { lat: location.lat + 0.01, lng: location.lng + 0.01 },
        capacity: 500,
        services: ['Medical', 'Food', 'Pets allowed']
      }
    ];
  }

  private async generateRouteOptions(
    start: { lat: number; lng: number },
    end: { lat: number; lng: number }
  ): Promise<EvacuationRoute[]> {
    // Simulate route generation
    return [{
      id: `route-${Date.now()}`,
      name: 'Primary Route',
      startPoint: start,
      endPoint: end,
      waypoints: [],
      distance: this.calculateDistance(start.lat, start.lng, end.lat, end.lng),
      estimatedTime: 30,
      safetyScore: 85,
      congestionLevel: 'low',
      routeType: 'primary',
      hazards: [],
      shelters: [],
      lastUpdated: new Date()
    }];
  }

  private async scoreEvacuationRoutes(
    routes: EvacuationRoute[]
  ): Promise<EvacuationRoute[]> {
    // Apply scoring algorithm
    return routes.map(route => ({
      ...route,
      safetyScore: Math.max(0, route.safetyScore - route.hazards.length * 10)
    }));
  }
}

export default SmartRiskAssessment;
