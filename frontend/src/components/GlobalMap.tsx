import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Icon } from 'leaflet';
import { motion } from 'framer-motion';
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
  Target
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

const createCustomIcon = (iconType: string, color: string) => {
  const svgIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
      <circle cx="12" cy="12" r="10" fill="${color}" stroke="#ffffff" stroke-width="2"/>
      <text x="12" y="16" text-anchor="middle" fill="white" font-size="12" font-family="Arial">
        ${iconType.charAt(0).toUpperCase()}
      </text>
    </svg>
  `;
  
  return new Icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(svgIcon)}`,
    iconSize: [25, 25],
    iconAnchor: [12.5, 12.5],
    popupAnchor: [0, -12.5],
  });
};

interface MapControlsProps {
  trackingEnabled: boolean;
  onTrackingToggle: () => void;
}

const MapControls: React.FC<MapControlsProps> = ({ trackingEnabled, onTrackingToggle }) => {
  const map = useMap();

  const flyToLocation = (lat: number, lng: number) => {
    map.flyTo([lat, lng], 10, {
      animate: true,
      duration: 1.5
    });
  };

  return (
    <div className="absolute top-4 right-4 z-1000 space-y-2">
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
      
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => flyToLocation(20, 0)}
        className="p-3 bg-gray-800/50 border border-gray-600/30 rounded-lg shadow-lg backdrop-blur-sm text-gray-300 hover:bg-gray-700/50 transition-all"
      >
        <Target className="w-5 h-5" />
      </motion.button>
    </div>
  );
};

interface GlobalMapComponentProps {
  fires?: FIRMSFire[];
  disasters?: GDACSAlert[];
  events?: EONETEvent[];
  onMarkerClick?: (marker: DisasterMarker | ResourceMarker) => void;
  trackingEnabled?: boolean;
  onTrackingToggle?: () => void;
}

const GlobalMap: React.FC<GlobalMapComponentProps> = ({
  fires = [],
  disasters = [],
  events = [],
  onMarkerClick = () => {},
  trackingEnabled = false,
  onTrackingToggle = () => {},
}) => {
  const [activePanel, setActivePanel] = useState<'disasters' | 'resources' | null>('disasters');

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
      // Parse coordinate string (e.g., "lat,lng" format)
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

  return (
    <div className="relative w-full h-[600px] bg-gray-900 rounded-xl overflow-hidden">
      {/* Resource Tracking Panel */}
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
                title="Toggle disasters panel"
                aria-label="Toggle disasters panel"
              >
                <AlertTriangle className="w-4 h-4" />
              </button>
              <button
                onClick={() => setActivePanel(activePanel === 'resources' ? null : 'resources')}
                className={`p-2 rounded ${
                  activePanel === 'resources' ? 'bg-blue-500/20 text-blue-300' : 'bg-gray-700 text-gray-300'
                }`}
                title="Toggle resources panel"
                aria-label="Toggle resources panel"
              >
                <Truck className="w-4 h-4" />
              </button>
            </div>
          </div>

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
        
        <MapControls
          trackingEnabled={trackingEnabled}
          onTrackingToggle={onTrackingToggle}
        />

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
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Legend */}
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
        </div>
      </div>
    </div>
  );
};

export default GlobalMap;
