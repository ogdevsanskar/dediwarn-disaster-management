import React, { useRef, useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './SatelliteMap.css';

// Fix for default markers in React-Leaflet
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface DisasterEvent {
  id: string;
  type: 'earthquake' | 'flood' | 'fire' | 'storm' | 'emergency';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  timestamp: string;
  affectedArea: number;
  evacuationRequired: boolean;
  casualties?: number;
  description: string;
}

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
  const [mapLayer, setMapLayer] = useState<'satellite' | 'hybrid'>('satellite');

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
        {mapLayer === 'satellite' && (
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            attribution='&copy; <a href="https://www.esri.com/">Esri</a>, Maxar, Earthstar Geographics'
            maxZoom={18}
          />
        )}
        
        {/* Hybrid Layer */}
        {mapLayer === 'hybrid' && (
          <>
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              attribution='&copy; <a href="https://www.esri.com/">Esri</a>, Maxar, Earthstar Geographics'
              maxZoom={18}
            />
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
              attribution=""
              opacity={0.8}
            />
          </>
        )}

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
        <h4 className="font-bold text-sm mb-2">🛰️ Live Satellite Map</h4>
        <div className="space-y-1 text-xs">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
            <span>Low Risk</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-yellow-500 rounded-full mr-2"></div>
            <span>Medium Risk</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-orange-500 rounded-full mr-2"></div>
            <span>High Risk</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-red-500 rounded-full mr-2"></div>
            <span>Critical Risk</span>
          </div>
        </div>
      </div>

      {/* Map Type Controls */}
      <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm p-2 rounded-lg shadow-lg z-[1000]">
        <div className="flex flex-col space-y-2">
          <button 
            onClick={() => setMapLayer('satellite')}
            className={`px-3 py-1 text-xs rounded transition-colors ${
              mapLayer === 'satellite' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            🛰️ Satellite
          </button>
          <button 
            onClick={() => setMapLayer('hybrid')}
            className={`px-3 py-1 text-xs rounded transition-colors ${
              mapLayer === 'hybrid' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            🗺️ Hybrid
          </button>
        </div>
      </div>

      {/* Loading indicator for real-time data */}
      <div className="absolute top-4 left-4 bg-green-500/90 text-white px-3 py-1 rounded-lg text-sm font-medium z-[1000] flex items-center">
        <div className="w-2 h-2 bg-green-300 rounded-full mr-2 animate-pulse"></div>
        LIVE DATA
      </div>
    </div>
  );
};

export default SatelliteMap;
