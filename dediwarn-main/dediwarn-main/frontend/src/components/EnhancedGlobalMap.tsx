import React, { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents } from 'react-leaflet';
import { Icon } from 'leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import NavigationService, { 
  NavigationRoute, 
  RoutePoint, 
  NavigationState
} from '../services/NavigationService';
import {
  FIRMSFire,
  GDACSAlert,
  EONETEvent
} from '../services/GlobalEnvironmentalDataService';
import {
  AlertTriangle,
  Navigation,
  Truck,
  Clock,
  Route,
  MapPin,
  Search,
  Navigation2,
  AlertCircle,
  X,
  Play,
  Square,
  RotateCcw,
  Map as MapIcon
} from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in React Leaflet
delete (Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface DisasterMarker {
  id: string;
  type: 'fire' | 'disaster' | 'event';
  position: [number, number];
  title: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: string;
  data: FIRMSFire | GDACSAlert | EONETEvent;
  icon: string;
}

interface ResourceMarker {
  id: string;
  type: 'resource';
  position: [number, number];
  title: string;
  resourceType: 'medical' | 'fire' | 'police' | 'rescue';
  status: 'available' | 'deployed' | 'maintenance';
  capacity: number;
  data: unknown;
}

const createCustomIcon = (iconType: string, color: string, size: number = 25) => {
  const svgIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="${size}" height="${size}">
      <circle cx="12" cy="12" r="10" fill="${color}" stroke="#ffffff" stroke-width="2"/>
      <text x="12" y="16" text-anchor="middle" fill="white" font-size="12" font-family="Arial">
        ${iconType.charAt(0).toUpperCase()}
      </text>
    </svg>
  `;
  
  return new Icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(svgIcon)}`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
};

const createNavigationIcon = (color: string) => {
  const svgIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="30" height="30">
      <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" 
            fill="${color}" stroke="#ffffff" stroke-width="1"/>
    </svg>
  `;
  
  return new Icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(svgIcon)}`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15],
  });
};

// Component for handling map clicks and navigation
const NavigationMapHandler: React.FC<{
  onMapClick: (point: RoutePoint) => void;
  isSelectingDestination: boolean;
}> = ({ onMapClick, isSelectingDestination }) => {
  useMapEvents({
    click: (e) => {
      if (isSelectingDestination) {
        const point: RoutePoint = {
          lat: e.latlng.lat,
          lng: e.latlng.lng,
          name: `Point (${e.latlng.lat.toFixed(4)}, ${e.latlng.lng.toFixed(4)})`
        };
        onMapClick(point);
      }
    },
  });

  return null;
};

// Component for route display
const RouteDisplay: React.FC<{
  routes: NavigationRoute[];
  activeRoute?: NavigationRoute;
  onRouteSelect: (route: NavigationRoute) => void;
}> = ({ routes, activeRoute, onRouteSelect }) => {
  return (
    <>
      {routes.map((route, index) => (
        <Polyline
          key={route.id}
          positions={route.geometry}
          color={activeRoute?.id === route.id ? '#3b82f6' : index === 0 ? '#10b981' : '#6b7280'}
          weight={activeRoute?.id === route.id ? 6 : 4}
          opacity={activeRoute?.id === route.id ? 1 : 0.7}
          eventHandlers={{
            click: () => onRouteSelect(route),
          }}
        />
      ))}
      
      {/* Route markers */}
      {routes.map(route => (
        <React.Fragment key={`markers-${route.id}`}>
          <Marker
            position={[route.startPoint.lat, route.startPoint.lng]}
            icon={createNavigationIcon('#10b981')}
          >
            <Popup>
              <div className="p-2">
                <h4 className="font-semibold text-gray-900">Start Point</h4>
                <p className="text-sm text-gray-600">{route.startPoint.name}</p>
              </div>
            </Popup>
          </Marker>
          
          <Marker
            position={[route.endPoint.lat, route.endPoint.lng]}
            icon={createNavigationIcon('#ef4444')}
          >
            <Popup>
              <div className="p-2">
                <h4 className="font-semibold text-gray-900">Destination</h4>
                <p className="text-sm text-gray-600">{route.endPoint.name}</p>
                <p className="text-xs text-gray-500 mt-2">
                  Distance: {(route.distance / 1000).toFixed(1)} km<br />
                  Duration: {Math.round(route.duration / 60)} minutes
                </p>
              </div>
            </Popup>
          </Marker>
        </React.Fragment>
      ))}
    </>
  );
};

// Navigation control panel
const NavigationPanel: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  routes: NavigationRoute[];
  activeRoute?: NavigationRoute;
  navigationState: NavigationState;
  onStartNavigation: (route: NavigationRoute) => void;
  onStopNavigation: () => void;
  onRouteSelect: (route: NavigationRoute) => void;
}> = ({ 
  isOpen, 
  onClose, 
  routes, 
  activeRoute, 
  navigationState, 
  onStartNavigation, 
  onStopNavigation,
  onRouteSelect 
}) => {
  const formatDistance = (meters: number) => {
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(1)} km`;
    }
    return `${Math.round(meters)} m`;
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 20 }}
          className="absolute right-0 top-0 bottom-0 w-96 bg-gray-900/95 backdrop-blur-sm border-l border-gray-700/50 z-1000 overflow-y-auto"
        >
          <div className="p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center">
                <Route className="w-5 h-5 mr-2" />
                Navigation
              </h3>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-white transition-colors"
                aria-label="Close navigation panel"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Status */}
            {navigationState.isNavigating && (
              <div className="mb-4 p-3 bg-blue-500/20 border border-blue-400/30 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-blue-300 font-medium">Navigation Active</span>
                  <button
                    onClick={onStopNavigation}
                    className="p-1 text-blue-300 hover:text-blue-200 transition-colors"
                    aria-label="Stop navigation"
                  >
                    <Square className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Progress:</span>
                    <span className="text-blue-300">
                      {navigationState.progress.completionPercentage.toFixed(1)}%
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-300">Remaining:</span>
                    <span className="text-blue-300">
                      {formatDistance(navigationState.progress.distanceRemaining)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-300">ETA:</span>
                    <span className="text-blue-300">
                      {formatDuration(navigationState.progress.estimatedTimeRemaining)}
                    </span>
                  </div>
                </div>

                {/* Current Instruction */}
                {navigationState.currentInstruction && (
                  <div className="mt-3 p-2 bg-blue-500/10 rounded border border-blue-500/20">
                    <p className="text-blue-200 text-sm font-medium">
                      {navigationState.currentInstruction}
                    </p>
                    {navigationState.nextInstruction && (
                      <p className="text-blue-300 text-xs mt-1">
                        Next: {navigationState.nextInstruction}
                      </p>
                    )}
                  </div>
                )}

                {/* Warnings */}
                {navigationState.warnings.length > 0 && (
                  <div className="mt-3 space-y-1">
                    {navigationState.warnings.map(warning => (
                      <div 
                        key={warning.id}
                        className="p-2 bg-yellow-500/20 border border-yellow-400/30 rounded text-xs"
                      >
                        <div className="flex items-center">
                          <AlertCircle className="w-3 h-3 mr-1 text-yellow-400" />
                          <span className="text-yellow-300">{warning.description}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Route Options */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-300 flex items-center">
                <MapIcon className="w-4 h-4 mr-2" />
                Route Options ({routes.length})
              </h4>
              
              {routes.map((route, index) => (
                <motion.div
                  key={route.id}
                  whileHover={{ scale: 1.02 }}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    activeRoute?.id === route.id
                      ? 'bg-blue-500/20 border-blue-400/30'
                      : 'bg-gray-800/50 border-gray-700/30 hover:bg-gray-700/50'
                  }`}
                  onClick={() => onRouteSelect(route)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className={`w-3 h-3 rounded-full ${
                          index === 0 ? 'bg-green-500' : 
                          index === 1 ? 'bg-blue-500' : 'bg-gray-500'
                        }`} />
                        <h5 className="text-sm font-medium text-white">
                          {route.routeType === 'fastest' ? 'Fastest Route' :
                           route.routeType === 'shortest' ? 'Shortest Route' :
                           route.routeType === 'emergency' ? 'Emergency Route' :
                           'Balanced Route'}
                        </h5>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-xs text-gray-300">
                        <div>
                          <span className="text-gray-400">Distance:</span>
                          <div className="text-white">{formatDistance(route.distance)}</div>
                        </div>
                        <div>
                          <span className="text-gray-400">Duration:</span>
                          <div className="text-white">{formatDuration(route.duration)}</div>
                        </div>
                      </div>

                      {/* Hazard warnings */}
                      {route.hazardWarnings && route.hazardWarnings.length > 0 && (
                        <div className="mt-2 flex items-center space-x-1">
                          <AlertTriangle className="w-3 h-3 text-yellow-400" />
                          <span className="text-xs text-yellow-300">
                            {route.hazardWarnings.length} warning(s)
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Action button */}
                    <div className="ml-2">
                      {!navigationState.isNavigating ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onStartNavigation(route);
                          }}
                          className="p-2 bg-blue-500/20 border border-blue-400/30 rounded text-blue-300 hover:bg-blue-500/30 transition-colors"
                          aria-label="Start navigation"
                        >
                          <Play className="w-4 h-4" />
                        </button>
                      ) : activeRoute?.id === route.id && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onStopNavigation();
                          }}
                          className="p-2 bg-red-500/20 border border-red-400/30 rounded text-red-300 hover:bg-red-500/30 transition-colors"
                          aria-label="Stop navigation"
                        >
                          <Square className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Route Instructions */}
            {activeRoute && (
              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-300 mb-3">Turn-by-Turn Directions</h4>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {activeRoute.steps.map((step, index) => (
                    <div 
                      key={index}
                      className="p-2 bg-gray-800/30 rounded text-xs border border-gray-700/30"
                    >
                      <div className="flex items-start space-x-2">
                        <div className="w-5 h-5 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-300 text-xs font-medium mt-0.5">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="text-gray-200">{step.instruction}</p>
                          <p className="text-gray-400 mt-1">
                            {formatDistance(step.distance)} • {formatDuration(step.duration)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Search panel for finding locations
const SearchPanel: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onLocationSelect: (point: RoutePoint) => void;
}> = ({ isOpen, onClose, onLocationSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<RoutePoint[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const navigationService = NavigationService.getInstance();

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const results = await navigationService.searchPlaces(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  }, [searchQuery, navigationService]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        handleSearch();
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [handleSearch, searchQuery]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: '-100%' }}
          animate={{ y: 0 }}
          exit={{ y: '-100%' }}
          transition={{ type: 'spring', damping: 20 }}
          className="absolute top-0 left-0 right-0 bg-gray-900/95 backdrop-blur-sm border-b border-gray-700/50 z-1000"
        >
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center">
                <Search className="w-5 h-5 mr-2" />
                Search Locations
              </h3>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-white transition-colors"
                aria-label="Close search panel"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative mb-4">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for places, addresses, landmarks..."
                className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              />
              {isSearching && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full" />
                </div>
              )}
            </div>

            {searchResults.length > 0 && (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {searchResults.map((result, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.02 }}
                    className="p-3 bg-gray-800/50 border border-gray-700/30 rounded-lg cursor-pointer hover:bg-gray-700/50 transition-all"
                    onClick={() => {
                      onLocationSelect(result);
                      onClose();
                    }}
                  >
                    <div className="flex items-start space-x-3">
                      <MapPin className="w-5 h-5 text-blue-400 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-medium text-white">{result.name}</h4>
                        <p className="text-xs text-gray-400 mt-1">
                          {result.lat.toFixed(4)}, {result.lng.toFixed(4)}
                        </p>
                        {result.description && (
                          <p className="text-xs text-gray-500 mt-1">{result.description}</p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

interface EnhancedGlobalMapProps {
  fires?: FIRMSFire[];
  disasters?: GDACSAlert[];
  events?: EONETEvent[];
  onMarkerClick?: (marker: DisasterMarker | ResourceMarker) => void;
  trackingEnabled?: boolean;
  onTrackingToggle?: () => void;
}

const EnhancedGlobalMap: React.FC<EnhancedGlobalMapProps> = ({
  fires = [],
  disasters = [],
  events = [],
  onMarkerClick = () => {},
  trackingEnabled = false,
  onTrackingToggle = () => {},
}) => {
  const [activePanel, setActivePanel] = useState<'disasters' | 'resources' | null>('disasters');
  const [navigationPanel, setNavigationPanel] = useState(false);
  const [searchPanel, setSearchPanel] = useState(false);
  const [isSelectingDestination, setIsSelectingDestination] = useState(false);
  const [startPoint, setStartPoint] = useState<RoutePoint | null>(null);
  const [routes, setRoutes] = useState<NavigationRoute[]>([]);
  const [activeRoute, setActiveRoute] = useState<NavigationRoute | undefined>();
  const [navigationState, setNavigationState] = useState<NavigationState>({
    isNavigating: false,
    progress: {
      distanceTraveled: 0,
      distanceRemaining: 0,
      timeElapsed: 0,
      estimatedTimeRemaining: 0,
      completionPercentage: 0
    },
    warnings: []
  });
  
  const navigationService = NavigationService.getInstance();

  // Subscribe to navigation updates
  useEffect(() => {
    const unsubscribe = navigationService.onNavigationUpdate((state) => {
      setNavigationState(state);
    });

    return unsubscribe;
  }, [navigationService]);

  const markers: DisasterMarker[] = [
    ...fires.map(fire => ({
      id: `fire-${fire.latitude}-${fire.longitude}`,
      type: 'fire' as const,
      position: [fire.latitude, fire.longitude] as [number, number],
      title: `Fire Alert - Confidence: ${fire.confidence}%`,
      severity: (fire.confidence > 80 ? 'critical' : fire.confidence > 60 ? 'high' : 'medium') as 'low' | 'medium' | 'high' | 'critical',
      status: 'active',
      data: fire,
      icon: 'fire'
    })),
    ...disasters.map(disaster => {
      const coords = disaster.coordinate.split(',');
      const lat = parseFloat(coords[0]) || 0;
      const lng = parseFloat(coords[1]) || 0;
      
      return {
        id: `disaster-${disaster.eventid}`,
        type: 'disaster' as const,
        position: [lat, lng] as [number, number],
        title: disaster.eventname || disaster.subject,
        severity: (disaster.alertlevel?.toLowerCase() as 'low' | 'medium' | 'high' | 'critical') || 'medium',
        status: 'active',
        data: disaster,
        icon: 'alert'
      };
    }),
    ...events.map(event => ({
      id: `event-${event.id}`,
      type: 'event' as const,
      position: [
        event.geometry?.[0]?.coordinates?.[1] || 0,
        event.geometry?.[0]?.coordinates?.[0] || 0
      ] as [number, number],
      title: event.title,
      severity: 'medium' as const,
      status: 'monitoring',
      data: event,
      icon: 'event'
    }))
  ];

  const resourceMarkers: ResourceMarker[] = [
    {
      id: 'hospital-1',
      type: 'resource',
      position: [40.7128, -74.0060],
      title: 'NYC Emergency Medical Center',
      resourceType: 'medical',
      status: 'available',
      capacity: 150,
      data: {}
    },
    {
      id: 'fire-station-1',
      type: 'resource',
      position: [34.0522, -118.2437],
      title: 'LA Fire Department Station 27',
      resourceType: 'fire',
      status: 'deployed',
      capacity: 8,
      data: {}
    },
    {
      id: 'rescue-1',
      type: 'resource',
      position: [51.5074, -0.1278],
      title: 'London Search & Rescue Unit',
      resourceType: 'rescue',
      status: 'available',
      capacity: 12,
      data: {}
    }
  ];

  const getMarkerIcon = (marker: DisasterMarker | ResourceMarker) => {
    if (marker.type === 'fire') {
      return createCustomIcon('F', '#ef4444');
    } else if (marker.type === 'disaster') {
      return createCustomIcon('!', '#f59e0b');
    } else if (marker.type === 'event') {
      return createCustomIcon('E', '#3b82f6');
    } else if (marker.type === 'resource') {
      const colors = {
        medical: '#10b981',
        fire: '#ef4444',
        police: '#3b82f6',
        rescue: '#f59e0b'
      };
      return createCustomIcon('R', colors[marker.resourceType]);
    }
    return createCustomIcon('?', '#6b7280');
  };

  const handleMapClick = (point: RoutePoint) => {
    if (isSelectingDestination) {
      if (!startPoint) {
        setStartPoint(point);
      } else {
        calculateRoutes(startPoint, point);
        setIsSelectingDestination(false);
      }
    }
  };

  const calculateRoutes = async (start: RoutePoint, end: RoutePoint) => {
    try {
      const calculatedRoutes = await navigationService.calculateAlternativeRoutes(start, end);
      setRoutes(calculatedRoutes);
      if (calculatedRoutes.length > 0) {
        setActiveRoute(calculatedRoutes[0]);
        setNavigationPanel(true);
      }
    } catch (error) {
      console.error('Error calculating routes:', error);
    }
  };

  const handleStartNavigation = async (route: NavigationRoute) => {
    try {
      await navigationService.startNavigation(route);
      setActiveRoute(route);
    } catch (error) {
      console.error('Error starting navigation:', error);
    }
  };

  const handleStopNavigation = () => {
    navigationService.stopNavigation();
    setActiveRoute(undefined);
  };

  const handleLocationSelect = (point: RoutePoint) => {
    if (!startPoint) {
      setStartPoint(point);
    } else {
      calculateRoutes(startPoint, point);
    }
  };

  const resetNavigation = () => {
    setStartPoint(null);
    setRoutes([]);
    setActiveRoute(undefined);
    setNavigationPanel(false);
    navigationService.stopNavigation();
  };

  return (
    <div className="relative w-full h-[600px] bg-gray-900 rounded-xl overflow-hidden">
      {/* Search Panel */}
      <SearchPanel
        isOpen={searchPanel}
        onClose={() => setSearchPanel(false)}
        onLocationSelect={handleLocationSelect}
      />

      {/* Navigation Panel */}
      <NavigationPanel
        isOpen={navigationPanel}
        onClose={() => setNavigationPanel(false)}
        routes={routes}
        activeRoute={activeRoute}
        navigationState={navigationState}
        onStartNavigation={handleStartNavigation}
        onStopNavigation={handleStopNavigation}
        onRouteSelect={setActiveRoute}
      />

      {/* Enhanced Control Panel */}
      <div className="absolute top-4 right-4 z-1000 space-y-2">
        {/* Search Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setSearchPanel(true)}
          className="p-3 bg-gray-800/50 border border-gray-600/30 rounded-lg shadow-lg backdrop-blur-sm text-gray-300 hover:bg-gray-700/50 transition-all"
        >
          <Search className="w-5 h-5" />
        </motion.button>

        {/* Navigation Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            if (routes.length > 0) {
              setNavigationPanel(true);
            } else {
              setIsSelectingDestination(!isSelectingDestination);
            }
          }}
          className={`p-3 rounded-lg shadow-lg backdrop-blur-sm border transition-all ${
            isSelectingDestination
              ? 'bg-blue-500/20 border-blue-400/30 text-blue-300'
              : routes.length > 0
              ? 'bg-green-500/20 border-green-400/30 text-green-300'
              : 'bg-gray-800/50 border-gray-600/30 text-gray-300 hover:bg-gray-700/50'
          }`}
        >
          <Navigation2 className={`w-5 h-5 ${isSelectingDestination ? 'animate-pulse' : ''}`} />
        </motion.button>

        {/* Reset Navigation */}
        {(startPoint || routes.length > 0) && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={resetNavigation}
            className="p-3 bg-red-500/20 border border-red-400/30 rounded-lg shadow-lg backdrop-blur-sm text-red-300 hover:bg-red-500/30 transition-all"
          >
            <RotateCcw className="w-5 h-5" />
          </motion.button>
        )}

        {/* Tracking Toggle */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onTrackingToggle}
          className={`p-3 rounded-lg shadow-lg backdrop-blur-sm border transition-all ${
            trackingEnabled
              ? 'bg-emerald-500/20 border-emerald-400/30 text-emerald-300'
              : 'bg-gray-800/50 border-gray-600/30 text-gray-300 hover:bg-gray-700/50'
          }`}
        >
          <Navigation className={`w-5 h-5 ${trackingEnabled ? 'animate-pulse' : ''}`} />
        </motion.button>
      </div>

      {/* Left Panel */}
      <motion.div
        initial={{ x: -300 }}
        animate={{ x: activePanel ? 0 : -280 }}
        className="absolute left-0 top-0 bottom-0 w-80 bg-gray-900/95 backdrop-blur-sm border-r border-gray-700/50 z-1000 overflow-y-auto"
      >
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">
              {activePanel === 'disasters' ? 'Active Disasters' : 'Resource Tracking'}
            </h3>
            <div className="flex space-x-1">
              <button
                onClick={() => setActivePanel(activePanel === 'disasters' ? null : 'disasters')}
                className={`p-2 rounded ${
                  activePanel === 'disasters' ? 'bg-red-500/20 text-red-300' : 'bg-gray-700 text-gray-300'
                }`}
                aria-label="Toggle disasters panel"
              >
                <AlertTriangle className="w-4 h-4" />
              </button>
              <button
                onClick={() => setActivePanel(activePanel === 'resources' ? null : 'resources')}
                className={`p-2 rounded ${
                  activePanel === 'resources' ? 'bg-blue-500/20 text-blue-300' : 'bg-gray-700 text-gray-300'
                }`}
                aria-label="Toggle resources panel"
              >
                <Truck className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Navigation Status in Left Panel */}
          {isSelectingDestination && (
            <div className="mb-4 p-3 bg-blue-500/20 border border-blue-400/30 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Navigation2 className="w-4 h-4 text-blue-300" />
                <span className="text-blue-300 font-medium">Select Route Points</span>
              </div>
              <p className="text-sm text-blue-200">
                {!startPoint ? 'Click on the map to set start point' : 'Click on the map to set destination'}
              </p>
              {startPoint && (
                <div className="mt-2 p-2 bg-blue-500/10 rounded">
                  <p className="text-xs text-blue-300">
                    Start: {startPoint.name}
                  </p>
                </div>
              )}
            </div>
          )}

          {activePanel === 'disasters' && (
            <div className="space-y-3">
              {markers.slice(0, 10).map((marker) => (
                <motion.div
                  key={marker.id}
                  whileHover={{ scale: 1.02 }}
                  className="p-3 bg-gray-800/50 rounded-lg border border-gray-700/30 cursor-pointer"
                  onClick={() => onMarkerClick(marker)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-white truncate">
                        {marker.title}
                      </h4>
                      <p className="text-xs text-gray-400 mt-1">
                        {marker.position[0].toFixed(3)}, {marker.position[1].toFixed(3)}
                      </p>
                    </div>
                    <div className={`px-2 py-1 rounded text-xs font-medium ${
                      marker.severity === 'critical' ? 'bg-red-500/20 text-red-300' :
                      marker.severity === 'high' ? 'bg-orange-500/20 text-orange-300' :
                      marker.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                      'bg-green-500/20 text-green-300'
                    }`}>
                      {marker.severity}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {activePanel === 'resources' && (
            <div className="space-y-3">
              {resourceMarkers.map((resource) => (
                <motion.div
                  key={resource.id}
                  whileHover={{ scale: 1.02 }}
                  className="p-3 bg-gray-800/50 rounded-lg border border-gray-700/30 cursor-pointer"
                  onClick={() => onMarkerClick(resource)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-white">
                        {resource.title}
                      </h4>
                      <p className="text-xs text-gray-400 mt-1">
                        Type: {resource.resourceType} • Capacity: {resource.capacity}
                      </p>
                    </div>
                    <div className={`px-2 py-1 rounded text-xs font-medium ${
                      resource.status === 'available' ? 'bg-green-500/20 text-green-300' :
                      resource.status === 'deployed' ? 'bg-blue-500/20 text-blue-300' :
                      'bg-gray-500/20 text-gray-300'
                    }`}>
                      {resource.status}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Tracking Status */}
          <div className="mt-6 p-3 bg-gray-800/30 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Live Tracking</span>
              <div className={`flex items-center space-x-2 ${
                trackingEnabled ? 'text-emerald-400' : 'text-gray-500'
              }`}>
                <Clock className="w-4 h-4" />
                <span className="text-xs">
                  {trackingEnabled ? 'Active' : 'Disabled'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Map Container */}
      <MapContainer
        center={[20, 0]}
        zoom={3}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <NavigationMapHandler
          onMapClick={handleMapClick}
          isSelectingDestination={isSelectingDestination}
        />

        {/* Route Display */}
        {routes.length > 0 && (
          <RouteDisplay
            routes={routes}
            activeRoute={activeRoute}
            onRouteSelect={setActiveRoute}
          />
        )}

        {/* Disaster Markers */}
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            position={marker.position}
            icon={getMarkerIcon(marker)}
            eventHandlers={{
              click: () => onMarkerClick(marker),
            }}
          >
            <Popup>
              <div className="p-2">
                <h4 className="font-semibold text-gray-900">{marker.title}</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Severity: <span className="capitalize">{marker.severity}</span>
                </p>
                <p className="text-sm text-gray-600">
                  Status: <span className="capitalize">{marker.status}</span>
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Coordinates: {marker.position[0].toFixed(4)}, {marker.position[1].toFixed(4)}
                </p>
                <button
                  onClick={() => {
                    const point: RoutePoint = {
                      lat: marker.position[0],
                      lng: marker.position[1],
                      name: marker.title
                    };
                    handleLocationSelect(point);
                  }}
                  className="mt-2 px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
                >
                  Navigate Here
                </button>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Resource Markers */}
        {resourceMarkers.map((resource) => (
          <Marker
            key={resource.id}
            position={resource.position}
            icon={getMarkerIcon(resource)}
            eventHandlers={{
              click: () => onMarkerClick(resource),
            }}
          >
            <Popup>
              <div className="p-2">
                <h4 className="font-semibold text-gray-900">{resource.title}</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Type: <span className="capitalize">{resource.resourceType}</span>
                </p>
                <p className="text-sm text-gray-600">
                  Status: <span className="capitalize">{resource.status}</span>
                </p>
                <p className="text-sm text-gray-600">
                  Capacity: {resource.capacity}
                </p>
                <button
                  onClick={() => {
                    const point: RoutePoint = {
                      lat: resource.position[0],
                      lng: resource.position[1],
                      name: resource.title
                    };
                    handleLocationSelect(point);
                  }}
                  className="mt-2 px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition-colors"
                >
                  Navigate Here
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Enhanced Legend */}
      <div className="absolute bottom-4 left-4 bg-gray-900/95 backdrop-blur-sm border border-gray-700/50 rounded-lg p-4 z-1000">
        <h4 className="text-sm font-semibold text-white mb-3">Map Legend</h4>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-red-500"></div>
            <span className="text-xs text-gray-300">Fire Incidents</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-orange-500"></div>
            <span className="text-xs text-gray-300">Disaster Alerts</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-blue-500"></div>
            <span className="text-xs text-gray-300">Environmental Events</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-emerald-500"></div>
            <span className="text-xs text-gray-300">Emergency Resources</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-1 bg-gradient-to-r from-green-500 to-blue-500"></div>
            <span className="text-xs text-gray-300">Navigation Routes</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedGlobalMap;
