import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Shield } from 'lucide-react';
import styled from 'styled-components';
import './RealTimeMap.css'; // Import the CSS file for the component

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

interface RealTimeMapProps {
  events: DisasterEvent[];
  selectedEvent: DisasterEvent | null;
  onEventSelect: (event: DisasterEvent) => void;
}

const MapContainer = styled.div<{ $isActive: boolean }>`
  width: 100%;
  height: 400px;
  background-color: ${props => props.$isActive ? '#e8f5e8' : '#f0f0f0'};
  border-radius: 8px;
`;

export const RealTimeMap: React.FC<RealTimeMapProps> = ({ 
  events, 
  selectedEvent, 
  onEventSelect 
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapCenter, setMapCenter] = useState({ lat: 40.7128, lng: -74.0060 });
  const [zoom, setZoom] = useState(4);
  // Removed unused isActive state

  // Simulate map markers positioning
  const getMarkerPosition = (event: DisasterEvent) => {
    // Convert lat/lng to pixel coordinates (simplified simulation)
    const x = ((event.location.lng + 180) / 360) * 100;
    const y = ((90 - event.location.lat) / 180) * 100;
    return { x: `${x}%`, y: `${y}%` };
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'high': return 'bg-orange-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-500';
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

  // Center map on selected event
  useEffect(() => {
    if (selectedEvent) {
      setMapCenter({
        lat: selectedEvent.location.lat,
        lng: selectedEvent.location.lng
      });
      setZoom(8);
    }
  }, [selectedEvent]);

  return (
    <MapContainer $isActive={false} ref={mapRef} className="real-time-map">
      {/* Map Background - Simulated world map */}
      <div 
        className={`absolute inset-0 opacity-20 realtime-map-bg map-bg-scaled`}
        data-zoom={zoom}
      />

      {/* Grid overlay */}
      <div className="absolute inset-0 opacity-10">
        <div className="w-full h-full bg-grid bg-slate-600"></div>
      </div>

      {/* Map controls */}
      <div className="map-controls">
        <button
          onClick={() => setZoom(Math.min(zoom + 1, 10))}
          className="control-button"
        >
          +
        </button>
        <button
          onClick={() => setZoom(Math.max(zoom - 1, 1))}
          className="control-button"
        >
          -
        </button>
      </div>

      {/* Center indicator */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
        <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse"></div>
      </div>

      {/* Event markers */}
      {events.map((event) => {
        const position = getMarkerPosition(event);
        const isSelected = selectedEvent?.id === event.id;
        
        return (
          <div
            key={event.id}
            className={`event-marker absolute z-15 cursor-pointer ${isSelected ? 'selected' : ''}`}
            data-left={position.x}
            data-top={position.y}
            data-scale={isSelected ? 1.2 : 1}
            onClick={() => onEventSelect(event)}
          >
            {/* Ripple effect for critical events */}
            {event.severity === 'critical' && (
              <div className="absolute inset-0 animate-ping">
                <div className={`w-8 h-8 rounded-full ${getSeverityColor(event.severity)} opacity-75`}></div>
              </div>
            )}
            
            {/* Main marker */}
            <div 
              className={`relative w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold shadow-lg ${getSeverityColor(event.severity)} ${
                isSelected ? 'ring-4 ring-blue-400 ring-opacity-50' : ''
              }`}
            >
              <span>{getTypeIcon(event.type)}</span>
            </div>

            {/* Evacuation zone indicator */}
            {event.evacuationRequired && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border border-white">
                <Shield className="w-2 h-2 text-white m-0.5" />
              </div>
            )}

            {/* Hover tooltip */}
            <div className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 text-white text-xs rounded shadow-lg whitespace-nowrap pointer-events-none transition-opacity duration-200 ${
              isSelected ? 'opacity-100' : 'opacity-0 hover:opacity-100'
            }`}>
              <div className="font-medium">{event.title}</div>
              <div className="text-gray-300">{event.location.address}</div>
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-slate-800"></div>
            </div>
          </div>
        );
      })}

      {/* Navigation path (when navigating to selected event) */}
      {selectedEvent && (
        <div className="absolute inset-0 z-5 pointer-events-none">
          <svg className="w-full h-full">
            <defs>
              <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.8" />
              </linearGradient>
            </defs>
            <path
              d={`M 50% 50% Q 60% 30% ${getMarkerPosition(selectedEvent).x} ${getMarkerPosition(selectedEvent).y}`}
              stroke="url(#pathGradient)"
              strokeWidth="2"
              fill="none"
              strokeDasharray="5,5"
              className="animate-pulse"
            />
          </svg>
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-slate-800/90 backdrop-blur-sm rounded-lg p-3 text-xs">
        <div className="text-white font-medium mb-2">Severity Levels</div>
        <div className="space-y-1">
          {[
            { level: 'Critical', color: 'bg-red-500' },
            { level: 'High', color: 'bg-orange-500' },
            { level: 'Medium', color: 'bg-yellow-500' },
            { level: 'Low', color: 'bg-green-500' }
          ].map((item) => (
            <div key={item.level} className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
              <span className="text-gray-300">{item.level}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 pt-2 border-t border-slate-600">
          <div className="flex items-center space-x-2">
            <Shield className="w-3 h-3 text-red-400" />
            <span className="text-gray-300">Evacuation Required</span>
          </div>
        </div>
      </div>

      {/* Map info overlay */}
      <div className="absolute top-4 left-4 bg-slate-800/90 backdrop-blur-sm rounded-lg p-3">
        <div className="flex items-center space-x-2 text-white">
          <MapPin className="w-4 h-4 text-blue-400" />
          <span className="text-sm font-medium">
            {events.length} Active Events
          </span>
        </div>
        <div className="text-xs text-gray-400 mt-1">
          Center: {mapCenter.lat.toFixed(4)}, {mapCenter.lng.toFixed(4)}
        </div>
        <div className="text-xs text-gray-400">
          Zoom: {zoom}x
        </div>
      </div>
    </MapContainer>
  );
};
