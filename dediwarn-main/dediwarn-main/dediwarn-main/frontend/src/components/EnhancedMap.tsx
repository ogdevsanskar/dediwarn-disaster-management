import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Navigation, AlertTriangle, Layers, Satellite, Globe, Route, Target, Download, Share2, Wifi, WifiOff } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in React-Leaflet
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface MapViewProps {
  center?: [number, number];
  zoom?: number;
}

interface DisasterMarker {
  id: string;
  position: [number, number];
  type: 'earthquake' | 'flood' | 'fire' | 'cyclone' | 'landslide';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  timestamp: string;
}

interface MapLayer {
  id: string;
  name: string;
  url: string;
  attribution: string;
}

const EnhancedMap: React.FC<MapViewProps> = ({ 
  center = [20.5937, 78.9629], // India center
  zoom = 6 
}) => {
  const [mapLayers] = useState<MapLayer[]>([
    {
      id: 'satellite',
      name: 'Satellite',
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: '&copy; Esri'
    },
    {
      id: 'streets',
      name: 'Streets',
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '&copy; OpenStreetMap contributors'
    },
    {
      id: 'hybrid',
      name: 'Hybrid',
      url: 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
      attribution: '&copy; Google'
    },
    {
      id: 'terrain',
      name: 'Terrain',
      url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
      attribution: '&copy; OpenTopoMap'
    }
  ]);

  const [activeLayer, setActiveLayer] = useState<string>('hybrid');
  const [isNavigating, setIsNavigating] = useState(false);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [navigationRoute, setNavigationRoute] = useState<[number, number][] | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [disasters] = useState<DisasterMarker[]>([
    {
      id: 'disaster-1',
      position: [19.0760, 72.8777], // Mumbai
      type: 'flood',
      severity: 'high',
      title: 'Urban Flooding',
      description: 'Heavy rainfall causing waterlogging in multiple areas',
      timestamp: new Date().toISOString()
    },
    {
      id: 'disaster-2',
      position: [28.7041, 77.1025], // Delhi
      type: 'fire',
      severity: 'critical',
      title: 'Industrial Fire',
      description: 'Major fire incident in industrial area',
      timestamp: new Date().toISOString()
    },
    {
      id: 'disaster-3',
      position: [22.5726, 88.3639], // Kolkata
      type: 'cyclone',
      severity: 'medium',
      title: 'Cyclone Warning',
      description: 'Tropical cyclone approaching coastal areas',
      timestamp: new Date().toISOString()
    }
  ]);

  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    // Monitor online status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);
        },
        (error) => {
          console.error('Geolocation error:', error);
        }
      );
    }
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const getCurrentLayer = () => {
    return mapLayers.find(layer => layer.id === activeLayer) || mapLayers[0];
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return '#10B981'; // green
      case 'medium': return '#F59E0B'; // yellow
      case 'high': return '#F97316'; // orange
      case 'critical': return '#EF4444'; // red
      default: return '#6B7280'; // gray
    }
  };

  const createCustomIcon = (type: string, severity: string) => {
    const color = getSeverityColor(severity);
    const iconHtml = `
      <div style="
        background-color: ${color};
        width: 30px;
        height: 30px;
        border-radius: 50%;
        border: 3px solid white;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        font-size: 16px;
      ">
        ${getDisasterEmoji(type)}
      </div>
    `;
    
    return L.divIcon({
      html: iconHtml,
      className: 'custom-disaster-marker',
      iconSize: [30, 30],
      iconAnchor: [15, 15]
    });
  };

  const getDisasterEmoji = (type: string) => {
    switch (type) {
      case 'earthquake': return '🌊';
      case 'flood': return '🌊';
      case 'fire': return '🔥';
      case 'cyclone': return '🌀';
      case 'landslide': return '⛰️';
      default: return '⚠️';
    }
  };

  const startNavigation = (destination: [number, number]) => {
    if (!userLocation) {
      alert('Current location not available. Please enable location services.');
      return;
    }

    setIsNavigating(true);
    
    // For demo purposes, create a simple route
    const route = [userLocation, destination];
    setNavigationRoute(route);
    
    // Open Google Maps navigation
    const [destLat, destLng] = destination;
    const navigationUrl = `https://www.google.com/maps/dir/?api=1&origin=${userLocation[0]},${userLocation[1]}&destination=${destLat},${destLng}&travelmode=driving`;
    window.open(navigationUrl, '_blank');
    
    setTimeout(() => {
      setIsNavigating(false);
    }, 2000);
  };

  const downloadOfflineMap = () => {
    // Simulate offline map download
    alert('Offline map download started. Maps will be available offline for emergency use.');
  };

  const shareMapLocation = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Disaster Map Location',
        text: 'Emergency disaster information',
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Map URL copied to clipboard!');
    }
  };

  // Component to handle map instance
  const MapController = () => {
    const map = useMap();
    
    useEffect(() => {
      mapRef.current = map;
      
      // Add navigation route if exists
      if (navigationRoute && navigationRoute.length > 1) {
        const routeLine = L.polyline(navigationRoute, {
          color: '#3B82F6',
          weight: 4,
          opacity: 0.8
        }).addTo(map);
        
        // Fit map to show entire route
        map.fitBounds(routeLine.getBounds());
        
        return () => {
          map.removeLayer(routeLine);
        };
      }
    }, [map]);
    
    // Handle navigation route separately
    useEffect(() => {
      if (navigationRoute && navigationRoute.length > 1 && mapRef.current) {
        const routeLine = L.polyline(navigationRoute, {
          color: '#3B82F6',
          weight: 4,
          opacity: 0.8
        }).addTo(mapRef.current);
        
        // Fit map to show entire route
        mapRef.current.fitBounds(routeLine.getBounds());
        
        return () => {
          if (mapRef.current) {
            mapRef.current.removeLayer(routeLine);
          }
        };
      }
    }, []);
    
    return null;
  };

  return (
    <div className="relative h-screen bg-slate-900">
      {/* Network Status */}
      <div className={`absolute top-4 left-4 z-[1000] flex items-center space-x-2 px-3 py-2 rounded-lg ${isOnline ? 'bg-green-500/20 border border-green-500/30' : 'bg-red-500/20 border border-red-500/30'}`}>
        {isOnline ? <Wifi className="w-4 h-4 text-green-400" /> : <WifiOff className="w-4 h-4 text-red-400" />}
        <span className={`text-sm ${isOnline ? 'text-green-300' : 'text-red-300'}`}>
          {isOnline ? 'Online' : 'Offline Mode'}
        </span>
      </div>

      {/* Map Controls */}
      <div className="absolute top-4 right-4 z-[1000] space-y-2">
        {/* Layer Switcher */}
        <div className="bg-slate-800/90 backdrop-blur-sm rounded-lg p-3 border border-slate-700">
          <div className="flex items-center space-x-2 mb-2">
            <Layers className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-white font-medium">Map View</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {mapLayers.map((layer) => (
              <button
                key={layer.id}
                onClick={() => setActiveLayer(layer.id)}
                className={`flex items-center space-x-2 px-3 py-2 rounded text-sm transition-colors ${
                  activeLayer === layer.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                }`}
              >
                {layer.id === 'satellite' && <Satellite className="w-3 h-3" />}
                {layer.id === 'hybrid' && <Globe className="w-3 h-3" />}
                {layer.id === 'streets' && <MapPin className="w-3 h-3" />}
                {layer.id === 'terrain' && <Target className="w-3 h-3" />}
                <span>{layer.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Map Actions */}
        <div className="bg-slate-800/90 backdrop-blur-sm rounded-lg p-3 border border-slate-700">
          <div className="space-y-2">
            <button
              onClick={() => {
                if (userLocation && mapRef.current) {
                  mapRef.current.setView(userLocation, 15);
                }
              }}
              className="flex items-center space-x-2 w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white text-sm transition-colors"
            >
              <Target className="w-4 h-4" />
              <span>My Location</span>
            </button>
            
            <button
              onClick={downloadOfflineMap}
              className="flex items-center space-x-2 w-full px-3 py-2 bg-green-600 hover:bg-green-700 rounded text-white text-sm transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Download</span>
            </button>
            
            <button
              onClick={shareMapLocation}
              className="flex items-center space-x-2 w-full px-3 py-2 bg-purple-600 hover:bg-purple-700 rounded text-white text-sm transition-colors"
            >
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Status */}
      {isNavigating && (
        <div className="absolute bottom-4 left-4 right-4 z-[1000] bg-blue-600/90 backdrop-blur-sm rounded-lg p-4 border border-blue-500">
          <div className="flex items-center space-x-3">
            <Route className="w-5 h-5 text-white animate-pulse" />
            <div>
              <p className="text-white font-medium">Navigation Active</p>
              <p className="text-blue-200 text-sm">Following route to emergency location</p>
            </div>
          </div>
        </div>
      )}

      {/* Map Container */}
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <MapController />
        
        <TileLayer
          url={getCurrentLayer().url}
          attribution={getCurrentLayer().attribution}
        />

        {/* User Location Marker */}
        {userLocation && (
          <Marker
            position={userLocation}
            icon={L.divIcon({
              html: `
                <div style="
                  background-color: #3B82F6;
                  width: 20px;
                  height: 20px;
                  border-radius: 50%;
                  border: 3px solid white;
                  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                  animation: pulse 2s infinite;
                ">
                </div>
              `,
              className: 'user-location-marker',
              iconSize: [20, 20],
              iconAnchor: [10, 10]
            })}
          >
            <Popup>
              <div className="text-center">
                <h3 className="font-semibold">Your Location</h3>
                <p className="text-sm text-gray-600">Current position</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Disaster Markers */}
        {disasters.map((disaster) => (
          <Marker
            key={disaster.id}
            position={disaster.position}
            icon={createCustomIcon(disaster.type, disaster.severity)}
          >
            <Popup>
              <div className="min-w-[200px]">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertTriangle className={`w-4 h-4`} style={{ color: getSeverityColor(disaster.severity) }} />
                  <h3 className="font-semibold">{disaster.title}</h3>
                </div>
                <p className="text-sm text-gray-600 mb-2">{disaster.description}</p>
                <p className="text-xs text-gray-500 mb-3">
                  {new Date(disaster.timestamp).toLocaleString()}
                </p>
                <div className="space-y-2">
                  <button
                    onClick={() => startNavigation(disaster.position)}
                    className="flex items-center space-x-1 w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
                  >
                    <Navigation className="w-3 h-3" />
                    <span>Navigate</span>
                  </button>
                  <button
                    onClick={() => {
                      window.open(`tel:911`, '_self');
                    }}
                    className="flex items-center space-x-1 w-full px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors"
                  >
                    <AlertTriangle className="w-3 h-3" />
                    <span>Emergency Call</span>
                  </button>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Add CSS for animations */}
      <style>{`
        @keyframes pulse {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.2);
            opacity: 0.7;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default EnhancedMap;
