/**
 * Resource Sharing Component
 * Community resource sharing and coordination system
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Package,
  Truck,
  Wrench,
  Home,
  Radio,
  MapPin,
  Clock,
  User,
  Star,
  Search,
  Filter,
  Plus,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  Trophy
} from 'lucide-react';
import VolunteerNetworkService, { Resource } from '../services/VolunteerNetworkService';

interface ExtendedResource extends Resource {
  ownerId?: string;
  ownerName?: string;
  ownerLocation?: { lat: number; lng: number; address: string };
}

interface ResourceSharingProps {
  currentUserId?: string;
  isVisible: boolean;
}

interface ResourceRequest {
  id: string;
  resourceType: string;
  description: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  requester: {
    id: string;
    name: string;
    location: { lat: number; lng: number; address: string };
  };
  needed: Date;
  duration: number; // hours
  status: 'open' | 'matched' | 'fulfilled' | 'closed';
  createdAt: Date;
}

const ResourceSharingComponent: React.FC<ResourceSharingProps> = ({
  currentUserId = 'vol-001',
  isVisible
}) => {
  const [activeTab, setActiveTab] = useState<'available' | 'requests' | 'my-resources' | 'sharing-history'>('available');
  const [availableResources, setAvailableResources] = useState<ExtendedResource[]>([]);
  const [resourceRequests, setResourceRequests] = useState<ResourceRequest[]>([]);
  const [myResources, setMyResources] = useState<Resource[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | Resource['type']>('all');
  // Removed unused showRequestModal state

  const volunteerService = VolunteerNetworkService.getInstance();

  const loadResourceData = useCallback(() => {
    // Load available resources from all volunteers
    const allVolunteers = volunteerService.getAllVolunteers();
    const resources: Resource[] = [];
    
    allVolunteers.forEach(volunteer => {
      volunteer.resources.forEach(resource => {
        if (resource.availability === 'available') {
          resources.push({
            ...resource,
            // Add owner information for display
            ownerId: volunteer.id,
            ownerName: volunteer.name,
            ownerLocation: volunteer.location
          } as ExtendedResource);
        }
      });
    });

    setAvailableResources(resources);

    // Load current user's resources
    const currentUser = volunteerService.getVolunteer(currentUserId);
    if (currentUser) {
      setMyResources(currentUser.resources);
    }

    // Load resource requests (simulated)
    setResourceRequests([
      {
        id: 'req-001',
        resourceType: 'vehicle',
        description: 'Need a pickup truck for debris removal after storm cleanup',
        urgency: 'high',
        requester: {
          id: 'vol-002',
          name: 'Mike Rodriguez',
          location: { lat: 37.7849, lng: -122.4194, address: 'Mission District, SF' }
        },
        needed: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours from now
        duration: 8,
        status: 'open',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
      },
      {
        id: 'req-002',
        resourceType: 'equipment',
        description: 'Emergency generator needed for community center during power outage',
        urgency: 'critical',
        requester: {
          id: 'vol-003',
          name: 'Lisa Chen',
          location: { lat: 37.7649, lng: -122.4194, address: 'Chinatown, SF' }
        },
        needed: new Date(Date.now() + 1 * 60 * 60 * 1000), // 1 hour from now
        duration: 24,
        status: 'open',
        createdAt: new Date(Date.now() - 30 * 60 * 1000) // 30 minutes ago
      }
    ]);
  }, [volunteerService, currentUserId]);

  useEffect(() => {
    if (isVisible) {
      loadResourceData();
    }
  }, [isVisible, loadResourceData]);

  const handleResourceShare = async (resourceId: string, ownerId: string) => {
    try {
      const success = await volunteerService.shareResource(ownerId, resourceId, currentUserId, 24);
      if (success) {
        // Update UI to show resource as shared
        setAvailableResources(prev => 
          prev.map(resource => 
            resource.id === resourceId 
              ? { ...resource, availability: 'in-use' as const }
              : resource
          )
        );
        alert('Resource sharing request sent! The owner will be notified.');
      } else {
        alert('Unable to request resource sharing at this time.');
      }
    } catch (error) {
      console.error('Error sharing resource:', error);
      alert('Error occurred while requesting resource sharing.');
    }
  };

  const getResourceIcon = (type: Resource['type']) => {
    switch (type) {
      case 'vehicle': return <Truck className="h-6 w-6" />;
      case 'equipment': return <Wrench className="h-6 w-6" />;
      case 'supplies': return <Package className="h-6 w-6" />;
      case 'shelter': return <Home className="h-6 w-6" />;
      case 'communication': return <Radio className="h-6 w-6" />;
      default: return <Package className="h-6 w-6" />;
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'text-red-600 bg-red-100 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-100 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-100 border-green-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'fair': return 'text-yellow-600';
      case 'needs-repair': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const filteredResources = availableResources.filter(resource => {
    const matchesSearch = resource.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || resource.type === filterType;
    return matchesSearch && matchesType;
  });

  const AvailableResourcesTab = () => (
    <div className="space-y-6">
      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search resources by name or description..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-gray-400" />
          <select
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as 'all' | 'vehicle' | 'equipment' | 'supplies' | 'shelter' | 'communication')}
            aria-label="Filter resources by type"
          >
            <option value="all">All Types</option>
            <option value="vehicle">Vehicles</option>
            <option value="equipment">Equipment</option>
            <option value="supplies">Supplies</option>
            <option value="shelter">Shelter</option>
            <option value="communication">Communication</option>
          </select>
        </div>
      </div>

      {/* Resources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResources.map(resource => (
          <div key={resource.id} className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg mr-3">
                  {getResourceIcon(resource.type)}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{resource.name}</h3>
                  <p className="text-sm text-gray-600 capitalize">{resource.type}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium mb-1">
                  Available
                </div>
                <div className={`text-xs font-medium ${getConditionColor(resource.condition)}`}>
                  {resource.condition}
                </div>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-4">{resource.description}</p>

            <div className="space-y-2 mb-4">
              <div className="flex items-center text-sm text-gray-600">
                <User className="h-4 w-4 mr-2" />
                {resource.ownerName}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="h-4 w-4 mr-2" />
                {resource.ownerLocation?.address || 'Location available on contact'}
              </div>
              {resource.quantity > 1 && (
                <div className="flex items-center text-sm text-gray-600">
                  <Package className="h-4 w-4 mr-2" />
                  Quantity: {resource.quantity}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <button
                onClick={() => handleResourceShare(resource.id, resource.ownerId || '')}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors mr-2"
              >
                Request to Borrow
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredResources.length === 0 && (
        <div className="text-center py-12">
          <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No resources found</h3>
          <p className="text-gray-600">Try adjusting your search terms or filters.</p>
        </div>
      )}
    </div>
  );

  const ResourceRequestsTab = () => (
    <div className="space-y-6">
      {/* Add Request Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Resource Requests</h2>
        <button
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="h-5 w-5 mr-2" />
          Create Request
        </button>
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {resourceRequests.map(request => (
          <div key={request.id} className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${
            request.urgency === 'critical' ? 'border-red-500' :
            request.urgency === 'high' ? 'border-orange-500' :
            request.urgency === 'medium' ? 'border-yellow-500' : 'border-green-500'
          }`}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <div className="p-2 bg-gray-100 rounded-lg mr-3">
                    {getResourceIcon(request.resourceType as Resource['type'])}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 capitalize">
                      {request.resourceType} Needed
                    </h3>
                    <p className="text-sm text-gray-600">by {request.requester.name}</p>
                  </div>
                </div>
                <p className="text-gray-700 mb-3">{request.description}</p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    Needed: {request.needed.toLocaleString()}
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    Duration: {request.duration}h
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {request.requester.location.address}
                  </div>
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-1" />
                    {request.status}
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getUrgencyColor(request.urgency)}`}>
                  {request.urgency} urgency
                </div>
                <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">
                  Offer Help
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const MyResourcesTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">My Resources</h2>
        <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Plus className="h-5 w-5 mr-2" />
          Add Resource
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {myResources.map(resource => (
          <div key={resource.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg mr-3">
                  {getResourceIcon(resource.type)}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{resource.name}</h3>
                  <p className="text-sm text-gray-600 capitalize">{resource.type}</p>
                </div>
              </div>
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                resource.availability === 'available' ? 'text-green-600 bg-green-100' :
                resource.availability === 'in-use' ? 'text-blue-600 bg-blue-100' :
                'text-yellow-600 bg-yellow-100'
              }`}>
                {resource.availability}
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-4">{resource.description}</p>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Condition:</span>
                <span className={`font-medium ${getConditionColor(resource.condition)}`}>
                  {resource.condition}
                </span>
              </div>
              {resource.quantity > 1 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Quantity:</span>
                  <span className="font-medium">{resource.quantity}</span>
                </div>
              )}
              {resource.lastMaintenance && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Last Maintenance:</span>
                  <span className="font-medium">
                    {resource.lastMaintenance.toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200">
                Edit
              </button>
              <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700">
                Share
              </button>
            </div>
          </div>
        ))}
      </div>

      {myResources.length === 0 && (
        <div className="text-center py-12">
          <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No resources added</h3>
          <p className="text-gray-600">Add your first resource to start sharing with the community.</p>
          <button className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Add Your First Resource
          </button>
        </div>
      )}
    </div>
  );

  const SharingHistoryTab = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Sharing History</h2>
      
      <div className="space-y-4">
        {/* Sample sharing history */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <CheckCircle className="h-6 w-6 text-green-600 mr-3" />
              <div>
                <h3 className="text-lg font-semibold">Emergency Generator</h3>
                <p className="text-sm text-gray-600">Shared with Mike Rodriguez</p>
              </div>
            </div>
            <span className="text-sm text-gray-500">Completed</span>
          </div>
          <p className="text-gray-600 mb-2">Helped power community center during outage</p>
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>Duration: 24 hours</span>
            <span>Oct 15, 2024</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Clock className="h-6 w-6 text-blue-600 mr-3" />
              <div>
                <h3 className="text-lg font-semibold">Medical Supplies</h3>
                <p className="text-sm text-gray-600">Borrowed from Dr. Sarah Mitchell</p>
              </div>
            </div>
            <span className="text-sm text-blue-600">In Progress</span>
          </div>
          <p className="text-gray-600 mb-2">Emergency first aid supplies for training event</p>
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>Duration: 8 hours</span>
            <span>Started 2 hours ago</span>
          </div>
        </div>
      </div>
    </div>
  );

  if (!isVisible) return null;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg p-6">
        <h1 className="text-3xl font-bold mb-2">🔄 Resource Sharing Network</h1>
        <p className="text-green-100">
          Share resources and support your community during emergencies
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Available Resources</h3>
              <p className="text-3xl font-bold text-green-600">{availableResources.length}</p>
            </div>
            <Package className="h-12 w-12 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Active Requests</h3>
              <p className="text-3xl font-bold text-orange-600">{resourceRequests.length}</p>
            </div>
            <AlertTriangle className="h-12 w-12 text-orange-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">My Resources</h3>
              <p className="text-3xl font-bold text-blue-600">{myResources.length}</p>
            </div>
            <User className="h-12 w-12 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Sharing Score</h3>
              <p className="text-3xl font-bold text-purple-600">
                <Star className="h-8 w-8 inline text-yellow-500" />
                4.8
              </p>
            </div>
            <Trophy className="h-12 w-12 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { key: 'available', label: 'Available Resources', icon: Package },
              { key: 'requests', label: 'Resource Requests', icon: AlertTriangle },
              { key: 'my-resources', label: 'My Resources', icon: User },
              { key: 'sharing-history', label: 'Sharing History', icon: CheckCircle }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as 'available' | 'requests' | 'my-resources' | 'sharing-history')}
                className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-5 w-5 mr-2" />
                {label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'available' && <AvailableResourcesTab />}
          {activeTab === 'requests' && <ResourceRequestsTab />}
          {activeTab === 'my-resources' && <MyResourcesTab />}
          {activeTab === 'sharing-history' && <SharingHistoryTab />}
        </div>
      </div>
    </div>
  );
};

export default ResourceSharingComponent;
