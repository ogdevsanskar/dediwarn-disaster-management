import React, { useState, useEffect } from 'react';
import { Phone, MapPin, Clock, Users, Shield, Heart, Home, Search, Filter, Navigation } from 'lucide-react';

interface EmergencyResource {
  id: string;
  name: string;
  type: 'hospital' | 'shelter' | 'fire_station' | 'police' | 'ngo' | 'government' | 'food_center' | 'evacuation_center';
  contact: {
    phone: string;
    emergency_phone?: string;
    email?: string;
  };
  location: {
    lat: number;
    lng: number;
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  services: string[];
  capacity?: number;
  availability: 'available' | 'full' | 'limited' | 'unavailable';
  operatingHours: string;
  specializations?: string[];
  verified: boolean;
  lastUpdated: string;
  distance?: number; // In km from user location
}

interface ResourceDirectoryProps {
  userLocation?: { lat: number; lng: number };
  onNavigate?: (resource: EmergencyResource) => void;
}

export const ResourceDirectory: React.FC<ResourceDirectoryProps> = ({ 
  userLocation, 
  onNavigate 
}) => {
  const [resources, setResources] = useState<EmergencyResource[]>([]);
  const [filteredResources, setFilteredResources] = useState<EmergencyResource[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);

  // Mock emergency resources data
  const mockResources: EmergencyResource[] = [
    {
      id: '1',
      name: 'All India Institute of Medical Sciences (AIIMS)',
      type: 'hospital',
      contact: {
        phone: '011-26588500',
        emergency_phone: '011-26588700',
        email: 'director@aiims.ac.in'
      },
      location: {
        lat: 28.5672,
        lng: 77.2100,
        address: 'Sri Aurobindo Marg, Ansari Nagar',
        city: 'New Delhi',
        state: 'Delhi',
        pincode: '110029'
      },
      services: ['Emergency Care', 'Trauma Center', 'ICU', 'Surgery', 'Ambulance'],
      capacity: 2500,
      availability: 'available',
      operatingHours: '24/7',
      specializations: ['Cardiology', 'Neurology', 'Orthopedics', 'Emergency Medicine'],
      verified: true,
      lastUpdated: '2025-08-07T10:00:00Z'
    },
    {
      id: '2',
      name: 'Central Emergency Relief Shelter',
      type: 'shelter',
      contact: {
        phone: '011-23456789',
        emergency_phone: '011-23456790'
      },
      location: {
        lat: 28.6139,
        lng: 77.2090,
        address: 'Red Fort Area, Chandni Chowk',
        city: 'New Delhi',
        state: 'Delhi',
        pincode: '110006'
      },
      services: ['Emergency Shelter', 'Food Distribution', 'Medical Aid', 'Children Care'],
      capacity: 1000,
      availability: 'available',
      operatingHours: '24/7',
      verified: true,
      lastUpdated: '2025-08-07T09:30:00Z'
    },
    {
      id: '3',
      name: 'Delhi Fire Service Headquarters',
      type: 'fire_station',
      contact: {
        phone: '101',
        emergency_phone: '101'
      },
      location: {
        lat: 28.6304,
        lng: 77.2177,
        address: 'Bahadur Shah Zafar Marg',
        city: 'New Delhi',
        state: 'Delhi',
        pincode: '110002'
      },
      services: ['Fire Fighting', 'Rescue Operations', 'Emergency Response', 'Ambulance'],
      availability: 'available',
      operatingHours: '24/7',
      verified: true,
      lastUpdated: '2025-08-07T11:00:00Z'
    },
    {
      id: '4',
      name: 'Delhi Police Control Room',
      type: 'police',
      contact: {
        phone: '100',
        emergency_phone: '100'
      },
      location: {
        lat: 28.6289,
        lng: 77.2065,
        address: 'ITO, IP Estate',
        city: 'New Delhi',
        state: 'Delhi',
        pincode: '110002'
      },
      services: ['Emergency Response', 'Law & Order', 'Traffic Control', 'Disaster Management'],
      availability: 'available',
      operatingHours: '24/7',
      verified: true,
      lastUpdated: '2025-08-07T11:15:00Z'
    },
    {
      id: '5',
      name: 'National Disaster Response Force (NDRF)',
      type: 'government',
      contact: {
        phone: '011-24363260',
        emergency_phone: '108'
      },
      location: {
        lat: 28.5355,
        lng: 77.3910,
        address: 'Sector 1, Ghaziabad',
        city: 'Ghaziabad',
        state: 'Uttar Pradesh',
        pincode: '201002'
      },
      services: ['Disaster Response', 'Search & Rescue', 'Medical Aid', 'Evacuation'],
      availability: 'available',
      operatingHours: '24/7',
      specializations: ['Natural Disasters', 'Man-made Disasters', 'Chemical Accidents'],
      verified: true,
      lastUpdated: '2025-08-07T10:45:00Z'
    },
    {
      id: '6',
      name: 'Red Cross Society - Delhi Branch',
      type: 'ngo',
      contact: {
        phone: '011-23711551',
        email: 'delhi@indianredcross.org'
      },
      location: {
        lat: 28.6139,
        lng: 77.2295,
        address: 'Red Cross Road, Near ISBT',
        city: 'New Delhi',
        state: 'Delhi',
        pincode: '110054'
      },
      services: ['Medical Aid', 'Blood Bank', 'Disaster Relief', 'Ambulance Service'],
      availability: 'available',
      operatingHours: '24/7',
      verified: true,
      lastUpdated: '2025-08-07T09:00:00Z'
    },
    {
      id: '7',
      name: 'Central Food Distribution Center',
      type: 'food_center',
      contact: {
        phone: '011-25551234'
      },
      location: {
        lat: 28.5706,
        lng: 77.3272,
        address: 'Anand Vihar, ISBT Area',
        city: 'New Delhi',
        state: 'Delhi',
        pincode: '110092'
      },
      services: ['Free Food Distribution', 'Water Supply', 'Emergency Rations'],
      capacity: 500,
      availability: 'available',
      operatingHours: '6:00 AM - 10:00 PM',
      verified: true,
      lastUpdated: '2025-08-07T08:30:00Z'
    }
  ];

  // Calculate distance between two coordinates
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Load resources
  useEffect(() => {
    setIsLoading(true);
    
    // Add distance calculation if user location is available
    const resourcesWithDistance = mockResources.map(resource => {
      if (userLocation) {
        const distance = calculateDistance(
          userLocation.lat, 
          userLocation.lng, 
          resource.location.lat, 
          resource.location.lng
        );
        return { ...resource, distance: parseFloat(distance.toFixed(1)) };
      }
      return resource;
    });

    // Sort by distance if available
    if (userLocation) {
      resourcesWithDistance.sort((a, b) => (a.distance || 999) - (b.distance || 999));
    }

    setResources(resourcesWithDistance);
    setIsLoading(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userLocation]);

  // Filter resources
  useEffect(() => {
    let filtered = resources;

    if (searchTerm) {
      filtered = filtered.filter(resource => 
        resource.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.services.some(service => service.toLowerCase().includes(searchTerm.toLowerCase())) ||
        resource.location.city.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter(resource => resource.type === selectedType);
    }

    setFilteredResources(filtered);
  }, [resources, searchTerm, selectedType]);

  // Get type icon
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'hospital': return <Heart className="h-5 w-5 text-red-400" />;
      case 'shelter': return <Home className="h-5 w-5 text-blue-400" />;
      case 'fire_station': return <Shield className="h-5 w-5 text-orange-400" />;
      case 'police': return <Shield className="h-5 w-5 text-blue-600" />;
      case 'ngo': return <Users className="h-5 w-5 text-green-400" />;
      case 'government': return <Shield className="h-5 w-5 text-purple-400" />;
      case 'food_center': return <Home className="h-5 w-5 text-yellow-400" />;
      case 'evacuation_center': return <MapPin className="h-5 w-5 text-red-500" />;
      default: return <MapPin className="h-5 w-5 text-gray-400" />;
    }
  };

  // Get availability color
  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'available': return 'text-green-400 bg-green-500/20';
      case 'limited': return 'text-yellow-400 bg-yellow-500/20';
      case 'full': return 'text-orange-400 bg-orange-500/20';
      case 'unavailable': return 'text-red-400 bg-red-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const resourceTypes = [
    { value: 'all', label: 'All Resources' },
    { value: 'hospital', label: 'Hospitals' },
    { value: 'shelter', label: 'Shelters' },
    { value: 'fire_station', label: 'Fire Stations' },
    { value: 'police', label: 'Police Stations' },
    { value: 'ngo', label: 'NGOs' },
    { value: 'government', label: 'Government' },
    { value: 'food_center', label: 'Food Centers' },
    { value: 'evacuation_center', label: 'Evacuation Centers' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6">
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
          <Shield className="h-6 w-6 mr-3 text-blue-400" />
          Emergency Resource Directory
        </h2>
        <p className="text-gray-400">
          Find nearby hospitals, shelters, emergency services, and support centers
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search resources, services, or locations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Type Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              title="Filter resources by type"
              className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500 appearance-none"
            >
              {resourceTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Resources Grid */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto"></div>
          <p className="text-gray-400 mt-4">Loading resources...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredResources.map((resource) => (
            <div key={resource.id} className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6 hover:border-slate-600 transition-colors">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  {getTypeIcon(resource.type)}
                  <div className="ml-3">
                    <h3 className="font-bold text-white text-lg">{resource.name}</h3>
                    <p className="text-gray-400 text-sm capitalize">{resource.type.replace('_', ' ')}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-1">
                  <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${getAvailabilityColor(resource.availability)}`}>
                    {resource.availability}
                  </span>
                  {resource.verified && (
                    <span className="text-green-400 text-xs">✓ Verified</span>
                  )}
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm">
                  <Phone className="h-4 w-4 mr-2 text-blue-400" />
                  <span className="text-white font-medium">{resource.contact.phone}</span>
                  {resource.contact.emergency_phone && (
                    <span className="ml-2 px-2 py-1 bg-red-600 text-white text-xs rounded">
                      Emergency: {resource.contact.emergency_phone}
                    </span>
                  )}
                </div>
                
                <div className="flex items-center text-sm text-gray-400">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span>{resource.location.address}, {resource.location.city}</span>
                  {resource.distance && (
                    <span className="ml-2 px-2 py-1 bg-blue-600 text-white text-xs rounded">
                      {resource.distance} km away
                    </span>
                  )}
                </div>

                <div className="flex items-center text-sm text-gray-400">
                  <Clock className="h-4 w-4 mr-2" />
                  <span>{resource.operatingHours}</span>
                </div>

                {resource.capacity && (
                  <div className="flex items-center text-sm text-gray-400">
                    <Users className="h-4 w-4 mr-2" />
                    <span>Capacity: {resource.capacity}</span>
                  </div>
                )}
              </div>

              {/* Services */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-400 mb-2">Services:</h4>
                <div className="flex flex-wrap gap-2">
                  {resource.services.map((service, index) => (
                    <span 
                      key={index} 
                      className="px-2 py-1 bg-slate-700 text-white text-xs rounded"
                    >
                      {service}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-2">
                <a
                  href={`tel:${resource.contact.phone}`}
                  className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors text-center"
                >
                  <Phone className="h-4 w-4 inline mr-1" />
                  Call
                </a>
                
                {onNavigate && (
                  <button
                    onClick={() => onNavigate(resource)}
                    className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                  >
                    <Navigation className="h-4 w-4 inline mr-1" />
                    Navigate
                  </button>
                )}

                <button
                  onClick={() => {
                    const url = `https://www.google.com/maps/dir/?api=1&destination=${resource.location.lat},${resource.location.lng}`;
                    window.open(url, '_blank');
                  }}
                  className="px-3 py-2 bg-slate-600 hover:bg-slate-500 text-white text-sm rounded-lg transition-colors"
                >
                  <MapPin className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredResources.length === 0 && !isLoading && (
        <div className="text-center py-12 bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700">
          <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No Resources Found</h3>
          <p className="text-gray-400">Try adjusting your search terms or filters</p>
        </div>
      )}
    </div>
  );
};
