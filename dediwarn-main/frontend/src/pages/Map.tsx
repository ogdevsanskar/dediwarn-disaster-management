import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Navigation, AlertTriangle, Shield, Zap, Filter, Search, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { DisasterEvent } from '../services/disasterService';
import { disasterService } from '../services/disasterService';
import { API_CONFIG, checkApiConfiguration } from '../config/apiConfig';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in React-Leaflet
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

export const Map: React.FC = () => {
  const [selectedEvent, setSelectedEvent] = useState<DisasterEvent | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isNavigating, setIsNavigating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [apiStatus, setApiStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking');
  
  // Real disaster events from APIs
  const [disasterEvents, setDisasterEvents] = useState<DisasterEvent[]>([]);

  // Load real disaster data
  const loadDisasterData = async () => {
    setIsLoading(true);
    setApiStatus('checking');
    
    try {
      // Check API configuration
      const configCheck = checkApiConfiguration();
      
      // Get disaster events from real APIs
      const events = await disasterService.getAllDisasterEvents({
        includeEarthquakes: true,
        includeWeather: configCheck.isValid,
        cities: API_CONFIG.DEFAULT_CITIES,
        earthquakeMinMagnitude: API_CONFIG.EARTHQUAKE_CONFIG.MIN_MAGNITUDE,
        weatherApiKey: API_CONFIG.OPENWEATHER_API_KEY
      });
      
      setDisasterEvents(events);
      setLastUpdated(new Date());
      setApiStatus(events.length > 0 ? 'connected' : 'disconnected');
      
      if (!configCheck.isValid) {
        console.warn('API Configuration issues:', configCheck.issues);
      }
    } catch (error) {
      console.error('Failed to load disaster data:', error);
      setApiStatus('disconnected');
      
      // Fallback to mock data if APIs fail
      setDisasterEvents([
        {
          id: 'fallback-1',
          type: 'earthquake',
          severity: 'high',
          title: 'API Unavailable - Using Demo Data',
          location: {
            lat: 40.7128,
            lng: -74.0060,
            address: 'Demo Location'
          },
          timestamp: new Date().toISOString(),
          affectedArea: 50,
          evacuationRequired: false,
          description: 'Real-time data unavailable. Please check your internet connection and API configuration.'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Load data on component mount and set up auto-refresh
  useEffect(() => {
    loadDisasterData();
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(loadDisasterData, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'high': return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
      case 'critical': return 'text-red-400 bg-red-500/20 border-red-500/30';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'earthquake': return '🌋';
      case 'flood': return '🌊';
      case 'fire': return '🔥';
      case 'storm': return '⛈️';
      case 'emergency': return '🚨';
      default: return '⚠️';
    }
  };

  const filteredEvents = disasterEvents.filter(event => {
    const matchesSeverity = filterSeverity === 'all' || event.severity === filterSeverity;
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.location.address.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSeverity && matchesSearch;
  });

  const handleNavigateToEvent = (event: DisasterEvent) => {
    setIsNavigating(true);
    setSelectedEvent(event);
    // Simulate navigation
    setTimeout(() => {
      setIsNavigating(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen pt-8 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-4 flex items-center">
            <MapPin className="h-7 w-7 mr-3 text-blue-400" />
            🛰️ Live Satellite Disaster Map
          </h1>
          <p className="text-gray-400 text-base">
            Real-time monitoring with satellite imagery and navigation for disaster events worldwide
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map Section */}
          <div className="lg:col-span-2">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white flex items-center">
                  <Navigation className="h-5 w-5 mr-2 text-blue-400" />
                  🛰️ Satellite Map View
                </h2>
                {isNavigating && (
                  <div className="flex items-center text-blue-400 animate-pulse">
                    <Zap className="h-4 w-4 mr-1" />
                    Navigating...
                  </div>
                )}
              </div>
              
              {/* Enhanced Satellite Map Component */}
              <div className="relative h-96 bg-slate-900 rounded-lg overflow-hidden">
                <SatelliteMap 
                  events={filteredEvents}
                  selectedEvent={selectedEvent}
                  onEventSelect={setSelectedEvent}
                  className="w-full h-full"
                />
              </div>
            </div>
          </div>

          {/* Sidebar - Events List */}
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Filter className="h-5 w-5 mr-2 text-blue-400" />
                Filters
              </h3>
              
              {/* Search */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Severity Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Severity Level</label>
                <select
                  value={filterSeverity}
                  onChange={(e) => setFilterSeverity(e.target.value)}
                  title="Filter by severity level"
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="all">All Levels</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>

            {/* Events List */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-blue-400" />
                Active Events ({filteredEvents.length})
              </h3>
              
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredEvents.map((event) => (
                  <div
                    key={event.id}
                    className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 hover:scale-105 ${
                      selectedEvent?.id === event.id 
                        ? 'bg-blue-500/20 border-blue-500/50' 
                        : 'bg-slate-700/50 border-slate-600 hover:border-slate-500'
                    }`}
                    onClick={() => setSelectedEvent(event)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center">
                        <span className="text-lg mr-2">{getTypeIcon(event.type)}</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium border ${getSeverityColor(event.severity)}`}>
                          {event.severity.toUpperCase()}
                        </span>
                      </div>
                      {event.evacuationRequired && (
                        <Shield className="h-4 w-4 text-red-400" />
                      )}
                    </div>
                    
                    <h4 className="font-medium text-white mb-1">{event.title}</h4>
                    <p className="text-gray-400 text-sm mb-2">{event.location.address}</p>
                    <p className="text-gray-500 text-xs">{new Date(event.timestamp).toLocaleString()}</p>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNavigateToEvent(event);
                      }}
                      className="mt-2 w-full px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors duration-200 flex items-center justify-center"
                    >
                      <Navigation className="h-3 w-3 mr-1" />
                      Navigate
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-white">Live Statistics</h3>
                <button
                  onClick={loadDisasterData}
                  disabled={isLoading}
                  className="flex items-center space-x-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:opacity-50 rounded-lg text-sm text-white transition-colors"
                  title="Refresh data"
                >
                  <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                  <span>{isLoading ? 'Loading...' : 'Refresh'}</span>
                </button>
              </div>
              
              {/* API Status Indicator */}
              <div className="flex justify-between items-center mb-3 pb-3 border-b border-slate-600">
                <span className="text-gray-400">Data Source:</span>
                <div className="flex items-center space-x-2">
                  {apiStatus === 'connected' ? (
                    <Wifi className="h-4 w-4 text-green-400" />
                  ) : apiStatus === 'disconnected' ? (
                    <WifiOff className="h-4 w-4 text-red-400" />
                  ) : (
                    <RefreshCw className="h-4 w-4 text-yellow-400 animate-spin" />
                  )}
                  <span className={`text-sm font-medium ${
                    apiStatus === 'connected' ? 'text-green-400' : 
                    apiStatus === 'disconnected' ? 'text-red-400' : 'text-yellow-400'
                  }`}>
                    {apiStatus === 'connected' ? 'Live APIs' : 
                     apiStatus === 'disconnected' ? 'Offline' : 'Connecting...'}
                  </span>
                </div>
              </div>

              {/* Last Updated */}
              {lastUpdated && (
                <div className="flex justify-between items-center mb-3 text-xs">
                  <span className="text-gray-500">Last updated:</span>
                  <span className="text-gray-400">
                    {lastUpdated.toLocaleTimeString()}
                  </span>
                </div>
              )}
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Active Events:</span>
                  <span className="text-white font-medium">{disasterEvents.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Critical Alerts:</span>
                  <span className="text-red-400 font-medium">
                    {disasterEvents.filter(e => e.severity === 'critical').length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Evacuation Zones:</span>
                  <span className="text-orange-400 font-medium">
                    {disasterEvents.filter(e => e.evacuationRequired).length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Affected Areas:</span>
                  <span className="text-blue-400 font-medium">
                    {disasterEvents.reduce((sum, e) => sum + e.affectedArea, 0)} km²
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// SatelliteMap.tsx

interface SatelliteMapProps {
  events: DisasterEvent[];
  selectedEvent: DisasterEvent | null;
  onEventSelect: (event: DisasterEvent) => void;
  className?: string;
}

// SatelliteMap Component with Leaflet Implementation

interface SatelliteMapProps {
  events: DisasterEvent[];
  selectedEvent: DisasterEvent | null;
  onEventSelect: (event: DisasterEvent) => void;
  className?: string;
}

// Create custom disaster icons
const createDisasterIcon = (type: string, severity: string) => {
  const colors = {
    low: '#22c55e',
    medium: '#f59e0b', 
    high: '#f97316',
    critical: '#ef4444'
  };

  const icons = {
    earthquake: '🌋',
    flood: '🌊', 
    fire: '🔥',
    storm: '⛈️',
    emergency: '🚨'
  };

  return L.divIcon({
    html: `
      <div style="
        background: ${colors[severity as keyof typeof colors] || colors.medium};
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        border: 3px solid white;
        box-shadow: 0 2px 10px rgba(0,0,0,0.3);
        animation: pulse 2s infinite;
      ">
        ${icons[type as keyof typeof icons] || '⚠️'}
      </div>
      <style>
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
      </style>
    `,
    className: 'custom-disaster-marker',
    iconSize: [40, 40],
    iconAnchor: [20, 20]
  });
};

const SatelliteMap: React.FC<SatelliteMapProps> = ({
  events,
  selectedEvent,
  onEventSelect,
  className
}) => {
  const mapRef = useRef<L.Map>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Default center coordinates (India)
  const defaultCenter: [number, number] = [20.5937, 78.9629];
  const defaultZoom = 5;

  useEffect(() => {
    setMapLoaded(true);
  }, []);

  useEffect(() => {
    // Focus on selected event
    if (selectedEvent && mapRef.current) {
      mapRef.current.setView(
        [selectedEvent.location.lat, selectedEvent.location.lng], 
        10,
        { animate: true }
      );
    }
  }, [selectedEvent]);

  if (!mapLoaded) {
    return (
      <div className="flex items-center justify-center h-full bg-slate-800 rounded-lg">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading satellite map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full ${className || ''}`}>
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef as React.RefObject<L.Map>}
        className="rounded-lg overflow-hidden"
      >
        {/* Satellite Tile Layer */}
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          attribution='&copy; <a href="https://www.esri.com/">Esri</a>, Maxar, Earthstar Geographics'
          maxZoom={18}
        />
        
        {/* Street Map Overlay (Optional) */}
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
          attribution=""
          opacity={0.5}
        />

        {/* Disaster Event Markers */}
        {events.map((event) => (
          <Marker
            key={event.id}
            position={[event.location.lat, event.location.lng]}
            icon={createDisasterIcon(event.type, event.severity)}
            eventHandlers={{
              click: () => onEventSelect(event)
            }}
          >
            <Popup className="disaster-popup">
              <div className="p-3 max-w-sm">
                <div className="flex items-center mb-2">
                  <span className="text-lg mr-2">
                    {event.type === 'earthquake' && '🌋'}
                    {event.type === 'flood' && '🌊'}
                    {event.type === 'fire' && '🔥'}
                    {event.type === 'storm' && '⛈️'}
                    {event.type === 'emergency' && '🚨'}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs font-bold text-white ${
                    event.severity === 'critical' ? 'bg-red-500' :
                    event.severity === 'high' ? 'bg-orange-500' :
                    event.severity === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                  }`}>
                    {event.severity.toUpperCase()}
                  </span>
                </div>
                
                <h3 className="font-bold text-gray-800 mb-2">{event.title}</h3>
                <p className="text-gray-600 text-sm mb-2">{event.description}</p>
                <div className="text-xs text-gray-500 space-y-1">
                  <div><strong>Location:</strong> {event.location.address}</div>
                  <div><strong>Time:</strong> {new Date(event.timestamp).toLocaleString()}</div>
                  <div><strong>Affected Area:</strong> {event.affectedArea} km²</div>
                  {event.casualties && event.casualties > 0 && (
                    <div className="text-red-600"><strong>Casualties:</strong> {event.casualties}</div>
                  )}
                  {event.evacuationRequired && (
                    <div className="text-orange-600"><strong>⚠️ Evacuation Required</strong></div>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Map Legend */}
      <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm p-3 rounded-lg shadow-lg z-[1000]">
        <h4 className="font-bold text-sm mb-2">Legend</h4>
        <div className="space-y-1 text-xs">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
            <span>Low Severity</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-yellow-500 rounded-full mr-2"></div>
            <span>Medium Severity</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-orange-500 rounded-full mr-2"></div>
            <span>High Severity</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-red-500 rounded-full mr-2"></div>
            <span>Critical Severity</span>
          </div>
        </div>
      </div>

      {/* Map Type Controls */}
      <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm p-2 rounded-lg shadow-lg z-[1000]">
        <div className="flex flex-col space-y-2">
          <button className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors">
            Satellite
          </button>
          <button className="px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded hover:bg-gray-300 transition-colors">
            Hybrid
          </button>
        </div>
      </div>
    </div>
  );
};

export default SatelliteMap;
