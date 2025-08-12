import React, { useState, useEffect } from 'react';
import {
  Satellite,
  Globe,
  Activity,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Droplets,
  Wind,
  Eye,
  Zap,
  Shield,
  Radio,
  Database,
  Clock,
  Filter,
  Layers,
  Target,
  Users,
  Calendar
} from 'lucide-react';

interface SatelliteData {
  id: string;
  name: string;
  type: 'environmental' | 'weather' | 'disaster' | 'ocean';
  lastUpdate: Date;
  status: 'active' | 'maintenance' | 'offline';
  coverage: string;
  resolution: string;
  dataPoints: {
    temperature?: number;
    humidity?: number;
    windSpeed?: number;
    precipitation?: number;
    airQuality?: number;
    seaLevel?: number;
    vegetation?: number;
    deforestation?: number;
  };
}

interface HotspotData {
  id: string;
  type: 'wildfire' | 'flood' | 'pollution' | 'deforestation' | 'coral-bleaching';
  location: {
    name: string;
    coordinates: [number, number];
  };
  severity: 'low' | 'medium' | 'high' | 'critical';
  trend: 'improving' | 'stable' | 'worsening';
  detectedBy: string[];
  confidence: number;
  affectedArea: number;
  population: number;
  firstDetected: Date;
  lastUpdate: Date;
}

interface IoTSensor {
  id: string;
  type: 'air-quality' | 'water-quality' | 'noise' | 'radiation' | 'seismic';
  location: {
    name: string;
    coordinates: [number, number];
  };
  status: 'online' | 'offline' | 'warning';
  lastReading: {
    value: number;
    unit: string;
    timestamp: Date;
  };
  threshold: {
    warning: number;
    critical: number;
  };
}

const EnhancedDashboard: React.FC = () => {
  const [activeLayer, setActiveLayer] = useState<'hotspots' | 'satellites' | 'sensors' | 'relief'>('hotspots');
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('24h');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [satellites, setSatellites] = useState<SatelliteData[]>([]);
  const [hotspots, setHotspots] = useState<HotspotData[]>([]);
  const [sensors, setSensors] = useState<IoTSensor[]>([]);
  const [globalMetrics] = useState({
    activeAlerts: 23,
    satelliteCoverage: 94.7,
    sensorNetwork: 1247,
    reliefOperations: 8,
    peopleAssisted: 125400,
    areasMonitored: 89
  });

  useEffect(() => {
    loadSatelliteData();
    loadHotspots();
    loadSensorData();
    
    const interval = setInterval(() => {
      loadSatelliteData();
      loadHotspots();
      loadSensorData();
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [timeRange]);

  const loadSatelliteData = () => {
    setSatellites([
      {
        id: 'sentinel-2',
        name: 'Sentinel-2A',
        type: 'environmental',
        lastUpdate: new Date(Date.now() - 15 * 60 * 1000),
        status: 'active',
        coverage: 'Global Land',
        resolution: '10m',
        dataPoints: {
          vegetation: 78.3,
          deforestation: 2.1,
          temperature: 24.5
        }
      },
      {
        id: 'goes-16',
        name: 'GOES-16',
        type: 'weather',
        lastUpdate: new Date(Date.now() - 5 * 60 * 1000),
        status: 'active',
        coverage: 'Americas',
        resolution: '1km',
        dataPoints: {
          temperature: 18.7,
          humidity: 67,
          windSpeed: 15.2,
          precipitation: 0.3
        }
      },
      {
        id: 'jason-3',
        name: 'Jason-3',
        type: 'ocean',
        lastUpdate: new Date(Date.now() - 25 * 60 * 1000),
        status: 'active',
        coverage: 'Global Ocean',
        resolution: '3.3cm',
        dataPoints: {
          seaLevel: 2.3,
          temperature: 16.2
        }
      }
    ]);
  };

  const loadHotspots = () => {
    setHotspots([
      {
        id: 'hotspot-1',
        type: 'wildfire',
        location: { name: 'Northern California', coordinates: [39.8283, -120.4233] },
        severity: 'high',
        trend: 'worsening',
        detectedBy: ['MODIS', 'Sentinel-2', 'Community Reports'],
        confidence: 92,
        affectedArea: 15420,
        population: 8500,
        firstDetected: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        lastUpdate: new Date(Date.now() - 30 * 60 * 1000)
      },
      {
        id: 'hotspot-2',
        type: 'flood',
        location: { name: 'Bangladesh Coast', coordinates: [22.3569, 91.7832] },
        severity: 'critical',
        trend: 'stable',
        detectedBy: ['Sentinel-1', 'Local Sensors', 'Volunteer Reports'],
        confidence: 87,
        affectedArea: 8930,
        population: 45000,
        firstDetected: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        lastUpdate: new Date(Date.now() - 10 * 60 * 1000)
      },
      {
        id: 'hotspot-3',
        type: 'deforestation',
        location: { name: 'Amazon Basin', coordinates: [-3.4653, -62.2159] },
        severity: 'medium',
        trend: 'improving',
        detectedBy: ['Landsat-8', 'Sentinel-2', 'PRODES'],
        confidence: 95,
        affectedArea: 2340,
        population: 1200,
        firstDetected: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        lastUpdate: new Date(Date.now() - 60 * 60 * 1000)
      }
    ]);
  };

  const loadSensorData = () => {
    setSensors([
      {
        id: 'sensor-aq-001',
        type: 'air-quality',
        location: { name: 'Delhi, India', coordinates: [28.6139, 77.2090] },
        status: 'warning',
        lastReading: { value: 152, unit: 'AQI', timestamp: new Date() },
        threshold: { warning: 100, critical: 200 }
      },
      {
        id: 'sensor-wq-002',
        type: 'water-quality',
        location: { name: 'Ganges River', coordinates: [25.3176, 83.0105] },
        status: 'online',
        lastReading: { value: 6.8, unit: 'pH', timestamp: new Date() },
        threshold: { warning: 7.5, critical: 8.5 }
      },
      {
        id: 'sensor-seis-003',
        type: 'seismic',
        location: { name: 'San Francisco', coordinates: [37.7749, -122.4194] },
        status: 'online',
        lastReading: { value: 1.2, unit: 'M', timestamp: new Date() },
        threshold: { warning: 3.0, critical: 5.0 }
      }
    ]);
  };

  const getHotspotIcon = (type: string) => {
    switch (type) {
      case 'wildfire': return { icon: <Activity className="h-4 w-4" />, color: 'text-red-400' };
      case 'flood': return { icon: <Droplets className="h-4 w-4" />, color: 'text-blue-400' };
      case 'pollution': return { icon: <Wind className="h-4 w-4" />, color: 'text-gray-400' };
      case 'deforestation': return { icon: <Target className="h-4 w-4" />, color: 'text-green-400' };
      case 'coral-bleaching': return { icon: <Globe className="h-4 w-4" />, color: 'text-cyan-400' };
      default: return { icon: <AlertTriangle className="h-4 w-4" />, color: 'text-yellow-400' };
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingDown className="h-4 w-4 text-green-400" />;
      case 'worsening': return <TrendingUp className="h-4 w-4 text-red-400" />;
      case 'stable': return <Activity className="h-4 w-4 text-yellow-400" />;
      default: return <Activity className="h-4 w-4 text-gray-400" />;
    }
  };

  const getSensorIcon = (type: string) => {
    switch (type) {
      case 'air-quality': return <Wind className="h-4 w-4" />;
      case 'water-quality': return <Droplets className="h-4 w-4" />;
      case 'noise': return <Radio className="h-4 w-4" />;
      case 'radiation': return <Zap className="h-4 w-4" />;
      case 'seismic': return <Activity className="h-4 w-4" />;
      default: return <Eye className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-400';
      case 'warning': return 'text-yellow-400';
      case 'offline': return 'text-red-400';
      case 'active': return 'text-green-400';
      case 'maintenance': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  const filteredHotspots = hotspots.filter(hotspot => 
    filterSeverity === 'all' || hotspot.severity === filterSeverity
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  Global Environmental Intelligence Center
                </h1>
                <p className="text-gray-400">
                  Real-time satellite data, IoT sensors, and community reports
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center text-green-400">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse" />
                  <span className="text-sm">Live Data</span>
                </div>
                <div className="text-gray-400 text-sm">
                  <Clock className="h-4 w-4 inline mr-1" />
                  {new Date().toLocaleString()}
                </div>
              </div>
            </div>

            {/* Global Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              <div className="bg-slate-700/50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-red-400">{globalMetrics.activeAlerts}</div>
                    <div className="text-sm text-gray-400">Active Alerts</div>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-red-400" />
                </div>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-blue-400">{globalMetrics.satelliteCoverage}%</div>
                    <div className="text-sm text-gray-400">Satellite Coverage</div>
                  </div>
                  <Satellite className="h-8 w-8 text-blue-400" />
                </div>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-green-400">{globalMetrics.sensorNetwork.toLocaleString()}</div>
                    <div className="text-sm text-gray-400">IoT Sensors</div>
                  </div>
                  <Database className="h-8 w-8 text-green-400" />
                </div>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-purple-400">{globalMetrics.reliefOperations}</div>
                    <div className="text-sm text-gray-400">Relief Operations</div>
                  </div>
                  <Shield className="h-8 w-8 text-purple-400" />
                </div>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-orange-400">{globalMetrics.peopleAssisted.toLocaleString()}</div>
                    <div className="text-sm text-gray-400">People Assisted</div>
                  </div>
                  <Users className="h-8 w-8 text-orange-400" />
                </div>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-cyan-400">{globalMetrics.areasMonitored}</div>
                    <div className="text-sm text-gray-400">Areas Monitored</div>
                  </div>
                  <Globe className="h-8 w-8 text-cyan-400" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="mb-6 bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center space-x-2">
              <Layers className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-300">Layer:</span>
              <div className="flex space-x-1">
                {[
                  { key: 'hotspots', label: 'Hotspots', icon: Target },
                  { key: 'satellites', label: 'Satellites', icon: Satellite },
                  { key: 'sensors', label: 'IoT Sensors', icon: Database },
                  { key: 'relief', label: 'Relief Ops', icon: Shield }
                ].map(layer => {
                  const Icon = layer.icon;
                  return (
                    <button
                      key={layer.key}
                      onClick={() => setActiveLayer(layer.key as typeof activeLayer)}
                      className={`flex items-center px-3 py-2 rounded-lg text-sm transition-colors ${
                        activeLayer === layer.key
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                      }`}
                    >
                      <Icon className="h-3 w-3 mr-1" />
                      {layer.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-300">Time:</span>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as typeof timeRange)}
                className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none"
                aria-label="Select time range"
              >
                <option value="1h">Last Hour</option>
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
              </select>
            </div>

            {activeLayer === 'hotspots' && (
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-300">Severity:</span>
                <select
                  value={filterSeverity}
                  onChange={(e) => setFilterSeverity(e.target.value)}
                  className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none"
                  aria-label="Filter by severity level"
                >
                  <option value="all">All Levels</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map Area */}
          <div className="lg:col-span-2">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6 h-96">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Global Map View</h2>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-sm text-green-400">Real-time Data</span>
                </div>
              </div>
              <div className="h-72 bg-slate-700/50 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Globe className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400">Interactive satellite map with {activeLayer} layer</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Showing {
                      activeLayer === 'hotspots' ? filteredHotspots.length : 
                      activeLayer === 'satellites' ? satellites.length :
                      activeLayer === 'sensors' ? sensors.length : '8'
                    } data points
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Data Panel */}
          <div className="space-y-6">
            {activeLayer === 'hotspots' && (
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6">
                <h3 className="text-lg font-bold text-white mb-4">Active Hotspots</h3>
                <div className="space-y-4 max-h-80 overflow-y-auto">
                  {filteredHotspots.map(hotspot => {
                    const { icon, color } = getHotspotIcon(hotspot.type);
                    return (
                      <div key={hotspot.id} className="bg-slate-700/50 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <div className={color}>{icon}</div>
                            <div>
                              <div className="text-white font-medium">{hotspot.location.name}</div>
                              <div className="text-xs text-gray-400 capitalize">{hotspot.type.replace('-', ' ')}</div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {getTrendIcon(hotspot.trend)}
                            <span className={`px-2 py-1 rounded text-xs font-medium border ${getSeverityColor(hotspot.severity)}`}>
                              {hotspot.severity}
                            </span>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs text-gray-400">
                          <div>Area: {hotspot.affectedArea.toLocaleString()} km²</div>
                          <div>Population: {hotspot.population.toLocaleString()}</div>
                          <div>Confidence: {hotspot.confidence}%</div>
                          <div>Sources: {hotspot.detectedBy.length}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeLayer === 'satellites' && (
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6">
                <h3 className="text-lg font-bold text-white mb-4">Satellite Network</h3>
                <div className="space-y-4 max-h-80 overflow-y-auto">
                  {satellites.map(satellite => (
                    <div key={satellite.id} className="bg-slate-700/50 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="text-white font-medium">{satellite.name}</div>
                          <div className="text-xs text-gray-400 capitalize">{satellite.type}</div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${getStatusColor(satellite.status).replace('text-', 'bg-')}`} />
                          <span className={`text-xs ${getStatusColor(satellite.status)}`}>
                            {satellite.status}
                          </span>
                        </div>
                      </div>
                      <div className="text-xs text-gray-400 mb-2">
                        Coverage: {satellite.coverage} | Resolution: {satellite.resolution}
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(satellite.dataPoints).map(([key, value]) => (
                          <div key={key} className="text-xs">
                            <span className="text-gray-400 capitalize">{key.replace(/([A-Z])/g, ' $1')}: </span>
                            <span className="text-white font-medium">{value}
                              {key.includes('temperature') ? '°C' : 
                               key.includes('humidity') ? '%' : 
                               key.includes('wind') ? ' km/h' : 
                               key.includes('precipitation') ? ' mm' : 
                               key.includes('vegetation') ? '%' : 
                               key.includes('deforestation') ? '%' : 
                               key.includes('seaLevel') ? ' mm' : ''}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeLayer === 'sensors' && (
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6">
                <h3 className="text-lg font-bold text-white mb-4">IoT Sensor Network</h3>
                <div className="space-y-4 max-h-80 overflow-y-auto">
                  {sensors.map(sensor => (
                    <div key={sensor.id} className="bg-slate-700/50 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <div className="text-blue-400">{getSensorIcon(sensor.type)}</div>
                          <div>
                            <div className="text-white font-medium">{sensor.location.name}</div>
                            <div className="text-xs text-gray-400 capitalize">{sensor.type.replace('-', ' ')}</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${getStatusColor(sensor.status).replace('text-', 'bg-')}`} />
                          <span className={`text-xs ${getStatusColor(sensor.status)}`}>
                            {sensor.status}
                          </span>
                        </div>
                      </div>
                      <div className="text-center py-2">
                        <div className="text-2xl font-bold text-white">
                          {sensor.lastReading.value} <span className="text-sm text-gray-400">{sensor.lastReading.unit}</span>
                        </div>
                        <div className="text-xs text-gray-400">
                          Warning: {sensor.threshold.warning} | Critical: {sensor.threshold.critical}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeLayer === 'relief' && (
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6">
                <h3 className="text-lg font-bold text-white mb-4">Relief Operations</h3>
                <div className="space-y-4">
                  {[
                    { name: 'Bangladesh Flood Response', status: 'active', teams: 12, people: 25000 },
                    { name: 'California Fire Suppression', status: 'active', teams: 8, people: 15000 },
                    { name: 'Amazon Conservation', status: 'ongoing', teams: 5, people: 3000 },
                    { name: 'Pacific Coral Restoration', status: 'planning', teams: 3, people: 500 }
                  ].map((operation, index) => (
                    <div key={index} className="bg-slate-700/50 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="text-white font-medium">{operation.name}</div>
                          <div className="text-xs text-gray-400">{operation.teams} teams deployed</div>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          operation.status === 'active' ? 'bg-green-500/20 text-green-400' :
                          operation.status === 'ongoing' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {operation.status}
                        </span>
                      </div>
                      <div className="text-sm text-gray-300">
                        {operation.people.toLocaleString()} people assisted
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedDashboard;
