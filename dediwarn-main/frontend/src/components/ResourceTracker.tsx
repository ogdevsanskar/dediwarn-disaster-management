import React, { useState, useEffect } from 'react';
import { Shield, Truck, Users, Heart, MapPin, Phone, Clock, AlertTriangle, CheckCircle, Filter, Search, RefreshCw, Plus } from 'lucide-react';

interface EmergencyResource {
  id: string;
  name: string;
  type: 'medical' | 'rescue' | 'shelter' | 'supply' | 'transport' | 'communication';
  status: 'available' | 'deployed' | 'maintenance' | 'unavailable';
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  capacity: {
    current: number;
    maximum: number;
  };
  contact: {
    phone: string;
    email?: string;
    radio?: string;
  };
  description: string;
  estimatedResponseTime: number; // in minutes
  lastUpdated: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

interface ResourceRequest {
  id: string;
  type: string;
  quantity: number;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  location: string;
  requestedBy: string;
  timestamp: string;
  status: 'pending' | 'assigned' | 'en-route' | 'delivered';
}

const ResourceTracker: React.FC = () => {
  const [resources, setResources] = useState<EmergencyResource[]>([]);
  const [requests, setRequests] = useState<ResourceRequest[]>([]);
  const [activeTab, setActiveTab] = useState<'resources' | 'requests'>('resources');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadResources();
    loadRequests();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      loadResources();
      loadRequests();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const loadResources = () => {
    setIsLoading(true);
    
    // Simulate API call with mock data
    setTimeout(() => {
      setResources([
        {
          id: 'res-001',
          name: 'Emergency Medical Unit Alpha',
          type: 'medical',
          status: 'available',
          location: {
            lat: 19.0760,
            lng: 72.8777,
            address: 'Bandra West, Mumbai, Maharashtra'
          },
          capacity: { current: 3, maximum: 10 },
          contact: {
            phone: '+91 6001163688',
            email: 'emu.alpha@emergency.gov.in',
            radio: 'EMU-ALPHA-01'
          },
          description: 'Advanced life support ambulance with trauma specialists',
          estimatedResponseTime: 8,
          lastUpdated: new Date().toISOString(),
          priority: 'high'
        },
        {
          id: 'res-002',
          name: 'Rescue Team Bravo',
          type: 'rescue',
          status: 'deployed',
          location: {
            lat: 28.7041,
            lng: 77.1025,
            address: 'Connaught Place, New Delhi'
          },
          capacity: { current: 12, maximum: 15 },
          contact: {
            phone: '+91 6200943853',
            radio: 'RESCUE-BRAVO-02'
          },
          description: 'Urban search and rescue team with heavy equipment',
          estimatedResponseTime: 15,
          lastUpdated: new Date().toISOString(),
          priority: 'critical'
        },
        {
          id: 'res-003',
          name: 'Emergency Shelter Charlie',
          type: 'shelter',
          status: 'available',
          location: {
            lat: 22.5726,
            lng: 88.3639,
            address: 'Salt Lake, Kolkata, West Bengal'
          },
          capacity: { current: 45, maximum: 200 },
          contact: {
            phone: '+91 7477396342',
            email: 'shelter.charlie@relief.gov.in'
          },
          description: 'Temporary housing facility with food and medical support',
          estimatedResponseTime: 0,
          lastUpdated: new Date().toISOString(),
          priority: 'medium'
        },
        {
          id: 'res-004',
          name: 'Supply Transport Delta',
          type: 'transport',
          status: 'maintenance',
          location: {
            lat: 12.9716,
            lng: 77.5946,
            address: 'Whitefield, Bangalore, Karnataka'
          },
          capacity: { current: 0, maximum: 5 },
          contact: {
            phone: '+91 9876543210',
            radio: 'TRANSPORT-DELTA-04'
          },
          description: 'Heavy-duty trucks for emergency supply distribution',
          estimatedResponseTime: 25,
          lastUpdated: new Date().toISOString(),
          priority: 'low'
        }
      ]);
      
      setIsLoading(false);
    }, 1000);
  };

  const loadRequests = () => {
    // Mock resource requests
    setRequests([
      {
        id: 'req-001',
        type: 'Medical Supplies',
        quantity: 50,
        urgency: 'critical',
        location: 'Disaster Zone Alpha, Mumbai',
        requestedBy: 'Field Commander Singh',
        timestamp: new Date().toISOString(),
        status: 'pending'
      },
      {
        id: 'req-002',
        type: 'Rescue Personnel',
        quantity: 10,
        urgency: 'high',
        location: 'Collapsed Building, Delhi',
        requestedBy: 'Captain Sharma',
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        status: 'assigned'
      },
      {
        id: 'req-003',
        type: 'Emergency Shelter',
        quantity: 100,
        urgency: 'medium',
        location: 'Flood Area, Kolkata',
        requestedBy: 'Relief Coordinator Patel',
        timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        status: 'en-route'
      }
    ]);
  };

  const getResourceTypeIcon = (type: string) => {
    switch (type) {
      case 'medical': return <Heart className="w-5 h-5" />;
      case 'rescue': return <Shield className="w-5 h-5" />;
      case 'shelter': return <Users className="w-5 h-5" />;
      case 'supply': return <Truck className="w-5 h-5" />;
      case 'transport': return <Truck className="w-5 h-5" />;
      case 'communication': return <Phone className="w-5 h-5" />;
      default: return <AlertTriangle className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'deployed': return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
      case 'maintenance': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'unavailable': return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'pending': return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
      case 'assigned': return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
      case 'en-route': return 'text-purple-400 bg-purple-500/20 border-purple-500/30';
      case 'delivered': return 'text-green-400 bg-green-500/20 border-green-500/30';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'high': return 'text-orange-400';
      case 'critical': return 'text-red-400 animate-pulse';
      default: return 'text-gray-400';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'low': return 'text-green-400 bg-green-500/20';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20';
      case 'high': return 'text-orange-400 bg-orange-500/20';
      case 'critical': return 'text-red-400 bg-red-500/20 animate-pulse';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.location.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || resource.type === filterType;
    const matchesStatus = filterStatus === 'all' || resource.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleCall = (phoneNumber: string) => {
    window.open(`tel:${phoneNumber}`, '_self');
  };

  const handleNavigate = (lat: number, lng: number) => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
  };

  const deployResource = (resourceId: string) => {
    setResources(prev => prev.map(resource => 
      resource.id === resourceId 
        ? { ...resource, status: 'deployed', lastUpdated: new Date().toISOString() }
        : resource
    ));
    alert('Resource deployed successfully!');
  };

  const recallResource = (resourceId: string) => {
    setResources(prev => prev.map(resource => 
      resource.id === resourceId 
        ? { ...resource, status: 'available', lastUpdated: new Date().toISOString() }
        : resource
    ));
    alert('Resource recalled and available for deployment!');
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-slate-900 text-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Emergency Resource Tracker</h1>
          <p className="text-slate-400">Monitor and manage emergency resources in real-time</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={loadResources}
            disabled={isLoading}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 rounded-lg transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors">
            <Plus className="w-4 h-4" />
            <span>Add Resource</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 mb-6 border-b border-slate-700">
        <button
          onClick={() => setActiveTab('resources')}
          className={`pb-3 px-1 border-b-2 font-medium transition-colors ${
            activeTab === 'resources'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-300'
          }`}
        >
          Available Resources ({resources.length})
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          className={`pb-3 px-1 border-b-2 font-medium transition-colors ${
            activeTab === 'requests'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-300'
          }`}
        >
          Resource Requests ({requests.length})
        </button>
      </div>

      {activeTab === 'resources' && (
        <>
          {/* Filters and Search */}
          <div className="bg-slate-800/60 backdrop-blur-sm rounded-xl p-6 border border-slate-700 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search resources..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                />
              </div>
              
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                aria-label="Filter by resource type"
                className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              >
                <option value="all">All Types</option>
                <option value="medical">Medical</option>
                <option value="rescue">Rescue</option>
                <option value="shelter">Shelter</option>
                <option value="supply">Supply</option>
                <option value="transport">Transport</option>
                <option value="communication">Communication</option>
              </select>
              
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                aria-label="Filter by resource status"
                className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              >
                <option value="all">All Status</option>
                <option value="available">Available</option>
                <option value="deployed">Deployed</option>
                <option value="maintenance">Maintenance</option>
                <option value="unavailable">Unavailable</option>
              </select>
              
              <div className="flex items-center space-x-2 text-slate-300">
                <Filter className="w-4 h-4" />
                <span className="text-sm">
                  Showing {filteredResources.length} of {resources.length} resources
                </span>
              </div>
            </div>
          </div>

          {/* Resources Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.map((resource) => (
              <div key={resource.id} className="bg-slate-800/60 backdrop-blur-sm rounded-xl p-6 border border-slate-700 hover:border-slate-600 transition-all duration-300 hover:transform hover:-translate-y-1">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${getStatusColor(resource.status).replace('text-', 'bg-').replace('/20', '/30').replace('/30', '/10')}`}>
                      {getResourceTypeIcon(resource.type)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{resource.name}</h3>
                      <p className="text-sm text-slate-400 capitalize">{resource.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(resource.status)}`}>
                      {resource.status}
                    </span>
                    <AlertTriangle className={`w-4 h-4 ${getPriorityColor(resource.priority)}`} />
                  </div>
                </div>

                {/* Description */}
                <p className="text-slate-300 text-sm mb-4">{resource.description}</p>

                {/* Capacity */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-slate-400">Capacity</span>
                    <span className="text-sm text-white">
                      {resource.capacity.current} / {resource.capacity.maximum}
                    </span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2 relative overflow-hidden">
                    <div 
                      className={`absolute left-0 top-0 h-full rounded-full transition-all duration-300 ${
                        resource.capacity.current / resource.capacity.maximum > 0.8 ? 'bg-red-500' : 
                        resource.capacity.current / resource.capacity.maximum > 0.6 ? 'bg-yellow-500' : 'bg-blue-500'
                      } ${
                        resource.capacity.current / resource.capacity.maximum >= 1 ? 'w-full' :
                        resource.capacity.current / resource.capacity.maximum >= 0.9 ? 'w-11/12' :
                        resource.capacity.current / resource.capacity.maximum >= 0.8 ? 'w-4/5' :
                        resource.capacity.current / resource.capacity.maximum >= 0.7 ? 'w-3/4' :
                        resource.capacity.current / resource.capacity.maximum >= 0.6 ? 'w-3/5' :
                        resource.capacity.current / resource.capacity.maximum >= 0.5 ? 'w-1/2' :
                        resource.capacity.current / resource.capacity.maximum >= 0.4 ? 'w-2/5' :
                        resource.capacity.current / resource.capacity.maximum >= 0.3 ? 'w-1/3' :
                        resource.capacity.current / resource.capacity.maximum >= 0.2 ? 'w-1/5' :
                        resource.capacity.current / resource.capacity.maximum >= 0.1 ? 'w-1/12' : 'w-0'
                      }`}
                    ></div>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-start space-x-2 mb-4">
                  <MapPin className="w-4 h-4 text-slate-400 mt-1 flex-shrink-0" />
                  <p className="text-sm text-slate-300">{resource.location.address}</p>
                </div>

                {/* Response Time */}
                <div className="flex items-center space-x-2 mb-4">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-slate-300">
                    ETA: {resource.estimatedResponseTime} minutes
                  </span>
                </div>

                {/* Actions */}
                <div className="space-y-2">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleCall(resource.contact.phone)}
                      className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white text-sm transition-colors"
                    >
                      <Phone className="w-3 h-3" />
                      <span>Call</span>
                    </button>
                    <button
                      onClick={() => handleNavigate(resource.location.lat, resource.location.lng)}
                      className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-green-600 hover:bg-green-700 rounded text-white text-sm transition-colors"
                    >
                      <MapPin className="w-3 h-3" />
                      <span>Navigate</span>
                    </button>
                  </div>
                  
                  <div className="flex space-x-2">
                    {resource.status === 'available' ? (
                      <button
                        onClick={() => deployResource(resource.id)}
                        className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-red-600 hover:bg-red-700 rounded text-white text-sm transition-colors"
                      >
                        <Shield className="w-3 h-3" />
                        <span>Deploy</span>
                      </button>
                    ) : resource.status === 'deployed' ? (
                      <button
                        onClick={() => recallResource(resource.id)}
                        className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-orange-600 hover:bg-orange-700 rounded text-white text-sm transition-colors"
                      >
                        <CheckCircle className="w-3 h-3" />
                        <span>Recall</span>
                      </button>
                    ) : (
                      <button
                        disabled
                        className="flex-1 px-3 py-2 bg-slate-600 rounded text-slate-400 text-sm cursor-not-allowed"
                      >
                        {resource.status}
                      </button>
                    )}
                  </div>
                </div>

                {/* Last Updated */}
                <p className="text-xs text-slate-500 mt-3">
                  Updated: {new Date(resource.lastUpdated).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </>
      )}

      {activeTab === 'requests' && (
        <div className="space-y-4">
          {requests.map((request) => (
            <div key={request.id} className="bg-slate-800/60 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${getUrgencyColor(request.urgency)}`}>
                    {request.urgency.toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{request.type}</h3>
                    <p className="text-sm text-slate-400">Quantity: {request.quantity}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(request.status)}`}>
                    {request.status}
                  </span>
                  <p className="text-xs text-slate-500 mt-1">
                    {new Date(request.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
              
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-400 mb-1">Location</p>
                  <p className="text-white">{request.location}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-1">Requested By</p>
                  <p className="text-white">{request.requestedBy}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ResourceTracker;
