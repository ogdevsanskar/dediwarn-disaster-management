import React, { useState, useEffect } from 'react';
import { Navigation, Phone, MapPin, Truck, Users, Battery, Fuel, Activity } from 'lucide-react';

interface EmergencyResource {
  id: string;
  name: string;
  type: 'ambulance' | 'fire_truck' | 'police' | 'rescue_team' | 'medical_team' | 'supply_vehicle';
  status: 'available' | 'en_route' | 'busy' | 'offline';
  location: {
    lat: number;
    lng: number;
    address: string;
    lastUpdated: string;
  };
  contactInfo: {
    phone: string;
    radio: string;
    emergency: string;
  };
  capacity: {
    personnel: number;
    currentLoad: number;
    equipment: string[];
  };
  eta: number; // minutes
  batteryLevel?: number;
  fuelLevel?: number;
  speed?: number; // km/h
  heading?: number; // degrees
}

interface EmergencyResourceTrackerProps {
  userLocation: { lat: number; lng: number };
  emergencyType?: string;
}

export const EmergencyResourceTracker: React.FC<EmergencyResourceTrackerProps> = ({ 
  userLocation, 
  emergencyType 
}) => {
  const [resources, setResources] = useState<EmergencyResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [trackingActive, setTrackingActive] = useState<Record<string, boolean>>({});
  const [liveMap, setLiveMap] = useState<Record<string, { mapId?: string; isActive?: boolean; startTime?: string; lat?: number; lng?: number; heading?: number }>>({});

  useEffect(() => {
    const fetchEmergencyResources = async () => {
      setLoading(true);
      try {
        // Simulated API call - replace with actual emergency services API
        const mockResources: EmergencyResource[] = [
          {
            id: 'amb-001',
            name: 'Ambulance Unit Alpha',
            type: 'ambulance',
            status: 'available',
            location: {
              lat: userLocation.lat + 0.01,
              lng: userLocation.lng + 0.01,
              address: '123 Medical Center Dr',
              lastUpdated: new Date().toISOString()
            },
            contactInfo: {
              phone: '+1-555-0101',
              radio: 'MED-1',
              emergency: '911'
            },
            capacity: {
              personnel: 2,
              currentLoad: 0,
              equipment: ['Defibrillator', 'Oxygen Tank', 'Stretcher']
            },
            eta: 8,
            batteryLevel: 85,
            fuelLevel: 70,
            speed: 45,
            heading: 180
          },
          {
            id: 'fire-001',
            name: 'Fire Engine 12',
            type: 'fire_truck',
            status: 'en_route',
            location: {
              lat: userLocation.lat - 0.02,
              lng: userLocation.lng + 0.015,
              address: '456 Fire Station Rd',
              lastUpdated: new Date().toISOString()
            },
            contactInfo: {
              phone: '+1-555-0112',
              radio: 'FIRE-12',
              emergency: '911'
            },
            capacity: {
              personnel: 4,
              currentLoad: 3,
              equipment: ['Ladder', 'Hose', 'Foam', 'Rescue Tools']
            },
            eta: 5,
            batteryLevel: 92,
            fuelLevel: 60,
            speed: 55,
            heading: 225
          },
          {
            id: 'pol-001',
            name: 'Police Unit Bravo',
            type: 'police',
            status: 'available',
            location: {
              lat: userLocation.lat + 0.005,
              lng: userLocation.lng - 0.01,
              address: '789 Police Plaza',
              lastUpdated: new Date().toISOString()
            },
            contactInfo: {
              phone: '+1-555-0123',
              radio: 'POL-7',
              emergency: '911'
            },
            capacity: {
              personnel: 2,
              currentLoad: 0,
              equipment: ['First Aid Kit', 'Traffic Cones', 'Radio']
            },
            eta: 3,
            batteryLevel: 78,
            fuelLevel: 85,
            speed: 35,
            heading: 90
          }
        ];

        setResources(mockResources);
      } catch (error) {
        console.error('Failed to fetch emergency resources:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEmergencyResources();
    const interval = setInterval(() => {
      updateResourceLocations();
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [emergencyType, userLocation]);

  const updateResourceLocations = () => {
    setResources(prevResources => 
      prevResources.map(resource => {
        if (resource.status === 'en_route' && resource.speed && resource.speed > 0) {
          // Simulate movement - in production, get real GPS updates via WebSocket
          const deltaTime = 5 / 3600; // 5 seconds in hours
          const distance = resource.speed * deltaTime; // km traveled
          const earthRadius = 6371; // km
          
          const deltaLat = (distance / earthRadius) * (180 / Math.PI) * Math.cos((resource.heading || 0) * Math.PI / 180);
          const deltaLng = (distance / earthRadius) * (180 / Math.PI) * Math.sin((resource.heading || 0) * Math.PI / 180);
          
          return {
            ...resource,
            location: {
              ...resource.location,
              lat: resource.location.lat + deltaLat,
              lng: resource.location.lng + deltaLng,
              lastUpdated: new Date().toISOString()
            },
            eta: Math.max(0, resource.eta - 0.083) // Reduce ETA by 5 seconds
          };
        }
        return resource;
      })
    );
  };

  const getResourceIcon = (type: string, status: string) => {
    const icons = {
      ambulance: Activity,
      fire_truck: Truck,
      police: Users,
      rescue_team: Users,
      medical_team: Activity,
      supply_vehicle: Truck
    };
    
    const IconComponent = icons[type as keyof typeof icons] || Truck;
    const color = status === 'available' ? 'text-green-400' : 
                 status === 'en_route' ? 'text-blue-400' : 
                 status === 'busy' ? 'text-orange-400' : 'text-slate-400';

    return <IconComponent className={`h-6 w-6 ${color}`} />;
  };

  const startLiveTracking = (resourceId: string) => {
    setTrackingActive(prev => ({ ...prev, [resourceId]: true }));
    
    // Simulate starting GPS tracking and live map
    setLiveMap(prev => ({
      ...prev,
      [resourceId]: {
        mapId: `map-${resourceId}`,
        isActive: true,
        startTime: new Date().toISOString()
      }
    }));

    // In production, establish WebSocket connection for live GPS updates
    console.log(`Started live tracking for resource: ${resourceId}`);
  };

  const stopLiveTracking = (resourceId: string) => {
    setTrackingActive(prev => ({ ...prev, [resourceId]: false }));
    setLiveMap(prev => {
      const newMap = { ...prev };
      delete newMap[resourceId];
      return newMap;
    });
  };

  const callResource = (phoneNumber: string, resourceName: string) => {
    // In production, integrate with Twilio Voice API or native calling
    if (window.confirm(`Call ${resourceName} at ${phoneNumber}?`)) {
      window.open(`tel:${phoneNumber}`);
    }
  };

  const navigateToResource = (lat: number, lng: number, address: string) => {
    // Open navigation in Google Maps with address fallback
    const destination = address ? encodeURIComponent(address) : `${lat},${lng}`;
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
    window.open(mapsUrl, '_blank');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'text-green-400 bg-green-900/20';
      case 'en_route': return 'text-blue-400 bg-blue-900/20';
      case 'busy': return 'text-orange-400 bg-orange-900/20';
      case 'offline': return 'text-slate-400 bg-slate-900/20';
      default: return 'text-slate-400 bg-slate-900/20';
    }
  };

  const formatETA = (minutes: number) => {
    if (minutes < 1) return 'Arriving now';
    if (minutes < 60) return `${Math.round(minutes)}m`;
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}h ${mins}m`;
  };

  if (loading) {
    return (
      <div className="bg-slate-800/90 backdrop-blur-md rounded-xl border border-slate-700 p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-700 rounded mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-slate-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/90 backdrop-blur-md rounded-xl border border-slate-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center">
          <MapPin className="h-6 w-6 text-blue-400 mr-2" />
          Emergency Resources
        </h2>
        <div className="text-sm text-slate-400">
          {resources.length} units tracked
        </div>
      </div>

      <div className="space-y-4">
        {resources.map(resource => (
          <div
            key={resource.id}
            className="bg-slate-700/50 rounded-xl border border-slate-600 p-6 transition-all duration-300 hover:border-slate-500"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                {getResourceIcon(resource.type, resource.status)}
                <div>
                  <h3 className="font-semibold text-white">{resource.name}</h3>
                  <p className="text-sm text-slate-400">{resource.location.address}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(resource.status)}`}>
                  {resource.status.replace('_', ' ').toUpperCase()}
                </span>
                <span className="text-lg font-bold text-blue-400">
                  {formatETA(resource.eta)}
                </span>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{resource.capacity.currentLoad}/{resource.capacity.personnel}</div>
                <div className="text-xs text-slate-400">Personnel</div>
              </div>
              {resource.batteryLevel && (
                <div className="text-center">
                  <div className="flex items-center justify-center">
                    <Battery className="h-4 w-4 text-green-400 mr-1" />
                    <span className="text-lg font-bold text-white">{resource.batteryLevel}%</span>
                  </div>
                  <div className="text-xs text-slate-400">Battery</div>
                </div>
              )}
              {resource.fuelLevel && (
                <div className="text-center">
                  <div className="flex items-center justify-center">
                    <Fuel className="h-4 w-4 text-blue-400 mr-1" />
                    <span className="text-lg font-bold text-white">{resource.fuelLevel}%</span>
                  </div>
                  <div className="text-xs text-slate-400">Fuel</div>
                </div>
              )}
            </div>

            {/* Equipment */}
            <div className="mb-4">
              <div className="text-sm text-slate-400 mb-2">Equipment:</div>
              <div className="flex flex-wrap gap-1">
                {resource.capacity.equipment.map((item, index) => (
                  <span key={index} className="px-2 py-1 bg-slate-600 rounded text-xs text-slate-300">
                    {item}
                  </span>
                ))}
              </div>
            </div>

            {/* Live Tracking Section */}
            {trackingActive[resource.id] && (
              <div className="mb-4 p-3 bg-blue-900/20 rounded-lg border border-blue-500/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-blue-400 font-medium flex items-center">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse mr-2"></div>
                    Live Tracking Active
                    {liveMap[resource.id]?.isActive && (
                      <span className="ml-2 text-xs text-blue-300">
                        (Map ID: {liveMap[resource.id]?.mapId})
                      </span>
                    )}
                  </span>
                  <span className="text-xs text-slate-400">
                    {liveMap[resource.id]?.startTime ? (
                      `Started: ${new Date(liveMap[resource.id].startTime!).toLocaleTimeString()}`
                    ) : (
                      `Updated: ${new Date().toLocaleTimeString()}`
                    )}
                  </span>
                </div>
                <div className="text-xs text-slate-300">
                  GPS: {resource.location.lat.toFixed(6)}, {resource.location.lng.toFixed(6)}
                  {resource.speed && resource.speed > 0 && (
                    <span className="ml-2">• Speed: {resource.speed} km/h</span>
                  )}
                  {liveMap[resource.id]?.lat && liveMap[resource.id]?.lng && (
                    <span className="ml-2">• Live Position: {liveMap[resource.id].lat?.toFixed(4)}, {liveMap[resource.id].lng?.toFixed(4)}</span>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex space-x-2">
              <button
                onClick={() => callResource(resource.contactInfo.phone, resource.name)}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center justify-center transition-colors"
              >
                <Phone className="h-4 w-4 mr-2" />
                Call
              </button>
              
              <button
                onClick={() => navigateToResource(resource.location.lat, resource.location.lng, resource.location.address)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center transition-colors"
              >
                <Navigation className="h-4 w-4 mr-2" />
                Navigate
              </button>
              
              <button
                onClick={() => trackingActive[resource.id] ? stopLiveTracking(resource.id) : startLiveTracking(resource.id)}
                className={`flex-1 px-4 py-2 rounded-lg flex items-center justify-center transition-colors ${
                  trackingActive[resource.id] 
                    ? 'bg-red-600 hover:bg-red-700 text-white' 
                    : 'bg-orange-600 hover:bg-orange-700 text-white'
                }`}
              >
                <MapPin className="h-4 w-4 mr-2" />
                {trackingActive[resource.id] ? 'Stop' : 'Track'}
              </button>
            </div>

            {/* Contact Info */}
            <div className="mt-4 pt-4 border-t border-slate-600">
              <div className="text-xs text-slate-400 space-y-1">
                <div>Radio: {resource.contactInfo.radio}</div>
                <div>Emergency: {resource.contactInfo.emergency}</div>
                <div>Last Update: {new Date(resource.location.lastUpdated).toLocaleString()}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {resources.length === 0 && (
        <div className="text-center py-8 text-slate-400">
          <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No emergency resources available in your area</p>
        </div>
      )}
    </div>
  );
};
