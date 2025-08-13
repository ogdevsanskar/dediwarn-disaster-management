import React, { useState, useEffect, useCallback } from 'react';
import { 
  Phone, 
  MessageSquare, 
  Mail, 
  MapPin, 
  Clock, 
  Users, 
  Shield, 
  Heart, 
  Truck, 
  AlertTriangle,
  Star,
  Search,
  Filter,
  RefreshCw,
  UserPlus,
  Building,
  Zap
} from 'lucide-react';

interface EmergencyContact {
  id: string;
  name: string;
  designation: string;
  department: string;
  primaryPhone: string;
  secondaryPhone?: string;
  email: string;
  whatsapp?: string;
  location: {
    lat: number;
    lng: number;
    address: string;
    jurisdiction: string;
  };
  specialties: string[];
  availability: 'available' | 'busy' | 'unavailable' | 'off-duty';
  responseTime: number; // minutes
  priority: 'high' | 'medium' | 'low' | 'critical';
  lastContact: string;
  rating: number;
  totalCalls: number;
  department_type: 'police' | 'fire' | 'medical' | 'disaster' | 'utility' | 'government' | 'ngo';
  languages: string[];
  backup_contacts: string[];
  emergency_protocols: string[];
}

interface ContactCategory {
  name: string;
  type: string;
  icon: React.ReactNode;
  color: string;
  description: string;
}

const EmergencyContacts: React.FC = () => {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<EmergencyContact[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLocation, setFilterLocation] = useState('all');
  const [filterAvailability, setFilterAvailability] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const categories: ContactCategory[] = [
    {
      name: 'All Contacts',
      type: 'all',
      icon: <Users className="w-5 h-5" />,
      color: 'text-slate-400',
      description: 'All emergency contacts'
    },
    {
      name: 'Police & Security',
      type: 'police',
      icon: <Shield className="w-5 h-5" />,
      color: 'text-blue-400',
      description: 'Law enforcement and security services'
    },
    {
      name: 'Medical Services',
      type: 'medical',
      icon: <Heart className="w-5 h-5" />,
      color: 'text-red-400',
      description: 'Hospitals, ambulances, and medical personnel'
    },
    {
      name: 'Fire & Rescue',
      type: 'fire',
      icon: <Truck className="w-5 h-5" />,
      color: 'text-orange-400',
      description: 'Fire departments and rescue services'
    },
    {
      name: 'Disaster Management',
      type: 'disaster',
      icon: <AlertTriangle className="w-5 h-5" />,
      color: 'text-yellow-400',
      description: 'Emergency management and disaster response'
    },
    {
      name: 'Utilities',
      type: 'utility',
      icon: <Zap className="w-5 h-5" />,
      color: 'text-green-400',
      description: 'Power, water, gas, and communication services'
    },
    {
      name: 'Government',
      type: 'government',
      icon: <Building className="w-5 h-5" />,
      color: 'text-purple-400',
      description: 'Government officials and administrative contacts'
    }
  ];

  useEffect(() => {
    loadContacts();
    
    // Auto-refresh every 2 minutes
    const interval = setInterval(() => {
      loadContacts();
    }, 120000);

    return () => clearInterval(interval);
  }, []);

  const loadContacts = () => {
    setIsLoading(true);
    
    // Load updated emergency contacts with pre-filled details
    setTimeout(() => {
      setContacts([
        {
          id: 'contact-001',
          name: 'Dr. Rajesh Kumar',
          designation: 'Chief Medical Officer',
          department: 'Emergency Medical Services',
          primaryPhone: '+91 6001163688',
          secondaryPhone: '+91 9876543210',
          email: 'dr.rajesh@emergency.gov.in',
          whatsapp: '+91 6001163688',
          location: {
            lat: 22.5726,
            lng: 88.3639,
            address: 'SSKM Hospital, Kolkata',
            jurisdiction: 'West Bengal'
          },
          specialties: ['Emergency Medicine', 'Trauma Surgery', 'Disaster Medical Response', 'Triage Management'],
          availability: 'available',
          responseTime: 15,
          priority: 'critical',
          lastContact: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          rating: 5.0,
          totalCalls: 247,
          department_type: 'medical',
          languages: ['English', 'Hindi', 'Bengali'],
          backup_contacts: ['contact-002', 'contact-003'],
          emergency_protocols: ['Medical Emergency Protocol', 'Mass Casualty Response', 'Bio-hazard Protocol']
        },
        {
          id: 'contact-002',
          name: 'Priya Sharma',
          designation: 'Emergency Response Coordinator',
          department: 'Disaster Management Authority',
          primaryPhone: '+91 6200943853',
          secondaryPhone: '+91 8765432109',
          email: 'priya.sharma@disaster.gov.in',
          location: {
            lat: 19.0760,
            lng: 72.8777,
            address: 'State Disaster Management Office, Mumbai',
            jurisdiction: 'Maharashtra'
          },
          specialties: ['Crisis Management', 'Resource Coordination', 'Emergency Planning', 'Community Response'],
          availability: 'available',
          responseTime: 10,
          priority: 'high',
          lastContact: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          rating: 4.8,
          totalCalls: 189,
          department_type: 'disaster',
          languages: ['English', 'Hindi', 'Marathi'],
          backup_contacts: ['contact-001', 'contact-004'],
          emergency_protocols: ['Natural Disaster Response', 'Evacuation Procedures', 'Inter-agency Coordination']
        },
        {
          id: 'contact-003',
          name: 'Amit Singh',
          designation: 'Fire Chief',
          department: 'Delhi Fire Services',
          primaryPhone: '+91 7477396342',
          secondaryPhone: '+91 9988776655',
          email: 'amit.singh@delhifire.gov.in',
          location: {
            lat: 28.7041,
            lng: 77.1025,
            address: 'Central Fire Station, New Delhi',
            jurisdiction: 'Delhi NCR'
          },
          specialties: ['Fire Suppression', 'Urban Search & Rescue', 'Hazmat Response', 'Technical Rescue'],
          availability: 'busy',
          responseTime: 8,
          priority: 'critical',
          lastContact: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
          rating: 4.9,
          totalCalls: 312,
          department_type: 'fire',
          languages: ['English', 'Hindi', 'Punjabi'],
          backup_contacts: ['contact-005', 'contact-006'],
          emergency_protocols: ['Fire Response Protocol', 'HAZMAT Response', 'Building Collapse Response']
        },
        {
          id: 'contact-004',
          name: 'Inspector Sarah Johnson',
          designation: 'Emergency Response Inspector',
          department: 'Mumbai Police',
          primaryPhone: '+91 9876543211',
          secondaryPhone: '+91 8765432100',
          email: 'sarah.johnson@mumbaipolice.gov.in',
          location: {
            lat: 19.0760,
            lng: 72.8777,
            address: 'Mumbai Police Headquarters',
            jurisdiction: 'Mumbai Metropolitan'
          },
          specialties: ['Law Enforcement', 'Crowd Control', 'Emergency Coordination', 'Traffic Management'],
          availability: 'available',
          responseTime: 12,
          priority: 'high',
          lastContact: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          rating: 4.7,
          totalCalls: 156,
          department_type: 'police',
          languages: ['English', 'Hindi', 'Marathi'],
          backup_contacts: ['contact-002', 'contact-007'],
          emergency_protocols: ['Public Safety Protocol', 'Emergency Evacuation', 'Crowd Management']
        },
        {
          id: 'contact-005',
          name: 'Engineer Rakesh Patel',
          designation: 'Emergency Power Coordinator',
          department: 'State Electricity Board',
          primaryPhone: '+91 8877665544',
          email: 'rakesh.patel@electricity.gov.in',
          location: {
            lat: 23.0225,
            lng: 72.5714,
            address: 'Gujarat State Electricity Board, Ahmedabad',
            jurisdiction: 'Gujarat'
          },
          specialties: ['Power Grid Management', 'Emergency Restoration', 'Infrastructure Assessment', 'Generator Deployment'],
          availability: 'available',
          responseTime: 25,
          priority: 'medium',
          lastContact: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          rating: 4.5,
          totalCalls: 98,
          department_type: 'utility',
          languages: ['English', 'Hindi', 'Gujarati'],
          backup_contacts: ['contact-008', 'contact-009'],
          emergency_protocols: ['Power Restoration Protocol', 'Grid Emergency Response', 'Infrastructure Assessment']
        },
        {
          id: 'contact-006',
          name: 'Dr. Meera Reddy',
          designation: 'Emergency Medical Director',
          department: 'Apollo Emergency Services',
          primaryPhone: '+91 7766554433',
          secondaryPhone: '+91 6655443322',
          email: 'dr.meera@apollo.hospital',
          whatsapp: '+91 7766554433',
          location: {
            lat: 17.3850,
            lng: 78.4867,
            address: 'Apollo Hospital, Hyderabad',
            jurisdiction: 'Telangana'
          },
          specialties: ['Critical Care', 'Emergency Surgery', 'Pediatric Emergency', 'Poison Control'],
          availability: 'available',
          responseTime: 18,
          priority: 'critical',
          lastContact: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
          rating: 4.9,
          totalCalls: 203,
          department_type: 'medical',
          languages: ['English', 'Hindi', 'Telugu', 'Tamil'],
          backup_contacts: ['contact-001', 'contact-010'],
          emergency_protocols: ['Medical Emergency Protocol', 'Poison Control Response', 'Pediatric Emergency Care']
        },
        {
          id: 'contact-007',
          name: 'Commissioner Ravi Kumar',
          designation: 'District Collector',
          department: 'District Administration',
          primaryPhone: '+91 5544332211',
          email: 'ravi.kumar@district.gov.in',
          location: {
            lat: 12.9716,
            lng: 77.5946,
            address: 'District Collectorate, Bangalore',
            jurisdiction: 'Karnataka'
          },
          specialties: ['Administrative Coordination', 'Resource Allocation', 'Inter-department Liaison', 'Policy Implementation'],
          availability: 'busy',
          responseTime: 30,
          priority: 'high',
          lastContact: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
          rating: 4.6,
          totalCalls: 134,
          department_type: 'government',
          languages: ['English', 'Hindi', 'Kannada'],
          backup_contacts: ['contact-011', 'contact-012'],
          emergency_protocols: ['Administrative Emergency Response', 'Resource Mobilization', 'Inter-agency Coordination']
        },
        {
          id: 'contact-008',
          name: 'Captain Vikram Sinha',
          designation: 'NDRF Team Leader',
          department: 'National Disaster Response Force',
          primaryPhone: '+91 4433221100',
          secondaryPhone: '+91 3322110099',
          email: 'vikram.sinha@ndrf.gov.in',
          location: {
            lat: 26.9124,
            lng: 75.7873,
            address: 'NDRF Battalion, Jaipur',
            jurisdiction: 'Rajasthan'
          },
          specialties: ['Disaster Response', 'Search & Rescue', 'Flood Rescue', 'High Altitude Rescue'],
          availability: 'available',
          responseTime: 20,
          priority: 'critical',
          lastContact: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          rating: 5.0,
          totalCalls: 87,
          department_type: 'disaster',
          languages: ['English', 'Hindi', 'Rajasthani'],
          backup_contacts: ['contact-002', 'contact-013'],
          emergency_protocols: ['NDRF Standard Operating Procedures', 'Disaster Response Protocol', 'Multi-hazard Response']
        }
      ]);
      
      setLastUpdated(new Date().toISOString());
      setIsLoading(false);
    }, 1000);
  };

  const applyFilters = useCallback(() => {
    let filtered = contacts;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(contact => contact.department_type === selectedCategory);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(contact => 
        contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.specialties.some(specialty => specialty.toLowerCase().includes(searchTerm.toLowerCase())) ||
        contact.location.address.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by location
    if (filterLocation !== 'all') {
      filtered = filtered.filter(contact => 
        contact.location.jurisdiction.toLowerCase().includes(filterLocation.toLowerCase())
      );
    }

    // Filter by availability
    if (filterAvailability !== 'all') {
      filtered = filtered.filter(contact => contact.availability === filterAvailability);
    }

    // Sort by priority and response time
    filtered.sort((a, b) => {
      const priorityOrder = { 'critical': 0, 'high': 1, 'medium': 2, 'low': 3 };
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return a.responseTime - b.responseTime;
    });

    setFilteredContacts(filtered);
  }, [contacts, selectedCategory, searchTerm, filterLocation, filterAvailability]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'available': return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'busy': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'unavailable': return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'off-duty': return 'text-slate-400 bg-slate-500/20 border-slate-500/30';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-400 animate-pulse';
      case 'high': return 'text-orange-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-green-400';
      default: return 'text-slate-400';
    }
  };

  const getDepartmentIcon = (type: string) => {
    switch (type) {
      case 'medical': return <Heart className="w-5 h-5 text-red-400" />;
      case 'police': return <Shield className="w-5 h-5 text-blue-400" />;
      case 'fire': return <Truck className="w-5 h-5 text-orange-400" />;
      case 'disaster': return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      case 'utility': return <Zap className="w-5 h-5 text-green-400" />;
      case 'government': return <Building className="w-5 h-5 text-purple-400" />;
      default: return <Users className="w-5 h-5 text-slate-400" />;
    }
  };

  const handleCall = (phoneNumber: string, contactName: string) => {
    // Log the call attempt
    setContacts(prev => prev.map(contact => 
      contact.name === contactName 
        ? { 
            ...contact, 
            totalCalls: contact.totalCalls + 1,
            lastContact: new Date().toISOString()
          }
        : contact
    ));
    
    window.open(`tel:${phoneNumber}`, '_self');
  };

  const handleWhatsApp = (phoneNumber: string) => {
    const cleanNumber = phoneNumber.replace(/\D/g, '');
    window.open(`https://wa.me/${cleanNumber}?text=Hello, this is regarding an emergency situation. Please respond when available.`, '_blank');
  };

  const handleEmail = (email: string, contactName: string) => {
    const subject = 'Emergency Contact - Immediate Response Required';
    const body = `Dear ${contactName},\n\nThis is regarding an emergency situation that requires your immediate attention.\n\nPlease respond as soon as possible.\n\nThank you,\nEmergency Response Team`;
    window.open(`mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank');
  };

  const handleNavigate = (lat: number, lng: number) => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-slate-900 text-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Emergency Contacts</h1>
          <p className="text-slate-400">
            Quick access to emergency services and key personnel - 
            {lastUpdated && ` Last updated: ${new Date(lastUpdated).toLocaleString()}`}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={loadContacts}
            disabled={isLoading}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 rounded-lg transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors">
            <UserPlus className="w-4 h-4" />
            <span>Add Contact</span>
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
        {categories.map((category) => (
          <button
            key={category.type}
            onClick={() => setSelectedCategory(category.type)}
            className={`p-4 rounded-xl border transition-all duration-300 ${
              selectedCategory === category.type
                ? 'bg-blue-500/20 border-blue-500/50 text-blue-400'
                : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-300'
            }`}
          >
            <div className="flex items-center justify-center mb-2">
              {category.icon}
            </div>
            <p className="text-xs font-medium text-center">{category.name}</p>
            <p className="text-xs text-center mt-1 opacity-75">
              {contacts.filter(c => category.type === 'all' || c.department_type === category.type).length}
            </p>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-slate-800/60 backdrop-blur-sm rounded-xl p-6 border border-slate-700 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search contacts, departments, specialties..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            />
          </div>
          
          <select
            value={filterLocation}
            onChange={(e) => setFilterLocation(e.target.value)}
            aria-label="Filter by location"
            className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
          >
            <option value="all">All Locations</option>
            <option value="mumbai">Mumbai</option>
            <option value="delhi">Delhi</option>
            <option value="kolkata">Kolkata</option>
            <option value="bangalore">Bangalore</option>
            <option value="gujarat">Gujarat</option>
            <option value="telangana">Telangana</option>
            <option value="rajasthan">Rajasthan</option>
          </select>
          
          <select
            value={filterAvailability}
            onChange={(e) => setFilterAvailability(e.target.value)}
            aria-label="Filter by availability"
            className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
          >
            <option value="all">All Availability</option>
            <option value="available">Available</option>
            <option value="busy">Busy</option>
            <option value="unavailable">Unavailable</option>
            <option value="off-duty">Off Duty</option>
          </select>
          
          <div className="flex items-center space-x-2 text-slate-300">
            <Filter className="w-4 h-4" />
            <span className="text-sm">
              Showing {filteredContacts.length} of {contacts.length} contacts
            </span>
          </div>
        </div>
      </div>

      {/* Contacts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredContacts.map((contact) => (
          <div key={contact.id} className="bg-slate-800/60 backdrop-blur-sm rounded-xl p-6 border border-slate-700 hover:border-slate-600 transition-all duration-300 hover:transform hover:-translate-y-1">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-slate-700">
                  {getDepartmentIcon(contact.department_type)}
                </div>
                <div>
                  <h3 className="font-semibold text-white">{contact.name}</h3>
                  <p className="text-sm text-slate-400">{contact.designation}</p>
                </div>
              </div>
              <div className="text-right">
                <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getAvailabilityColor(contact.availability)}`}>
                  {contact.availability}
                </span>
                <div className="flex items-center space-x-1 mt-1">
                  <Star className="w-3 h-3 text-yellow-400" />
                  <span className="text-xs text-slate-300">{contact.rating}</span>
                  <AlertTriangle className={`w-3 h-3 ml-1 ${getPriorityColor(contact.priority)}`} />
                </div>
              </div>
            </div>

            {/* Department */}
            <div className="mb-4">
              <p className="text-sm text-slate-300">{contact.department}</p>
              <p className="text-xs text-slate-500">Response Time: {contact.responseTime} minutes</p>
            </div>

            {/* Specialties */}
            <div className="mb-4">
              <p className="text-sm text-slate-400 mb-2">Specialties</p>
              <div className="flex flex-wrap gap-1">
                {contact.specialties.slice(0, 2).map((specialty, index) => (
                  <span key={index} className="px-2 py-1 bg-slate-700 text-xs rounded text-slate-300">
                    {specialty}
                  </span>
                ))}
                {contact.specialties.length > 2 && (
                  <span className="px-2 py-1 bg-slate-700 text-xs rounded text-slate-400">
                    +{contact.specialties.length - 2} more
                  </span>
                )}
              </div>
            </div>

            {/* Location */}
            <div className="flex items-start space-x-2 mb-4">
              <MapPin className="w-4 h-4 text-slate-400 mt-1 flex-shrink-0" />
              <div>
                <p className="text-sm text-slate-300">{contact.location.address}</p>
                <p className="text-xs text-slate-500">{contact.location.jurisdiction}</p>
              </div>
            </div>

            {/* Contact Stats */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center">
                <p className="text-lg font-bold text-white">{contact.totalCalls}</p>
                <p className="text-xs text-slate-400">Total Calls</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-white">{contact.languages.length}</p>
                <p className="text-xs text-slate-400">Languages</p>
              </div>
            </div>

            {/* Contact Actions */}
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleCall(contact.primaryPhone, contact.name)}
                  className="flex items-center justify-center space-x-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white text-sm transition-colors"
                >
                  <Phone className="w-3 h-3" />
                  <span>Call</span>
                </button>
                <button
                  onClick={() => handleEmail(contact.email, contact.name)}
                  className="flex items-center justify-center space-x-1 px-3 py-2 bg-green-600 hover:bg-green-700 rounded text-white text-sm transition-colors"
                >
                  <Mail className="w-3 h-3" />
                  <span>Email</span>
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                {contact.whatsapp && (
                  <button
                    onClick={() => handleWhatsApp(contact.whatsapp!)}
                    className="flex items-center justify-center space-x-1 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 rounded text-white text-sm transition-colors"
                  >
                    <MessageSquare className="w-3 h-3" />
                    <span>WhatsApp</span>
                  </button>
                )}
                <button
                  onClick={() => handleNavigate(contact.location.lat, contact.location.lng)}
                  className="flex items-center justify-center space-x-1 px-3 py-2 bg-purple-600 hover:bg-purple-700 rounded text-white text-sm transition-colors"
                >
                  <MapPin className="w-3 h-3" />
                  <span>Navigate</span>
                </button>
              </div>

              {/* Secondary Contact */}
              {contact.secondaryPhone && (
                <button
                  onClick={() => handleCall(contact.secondaryPhone!, contact.name)}
                  className="w-full flex items-center justify-center space-x-1 px-3 py-2 bg-slate-600 hover:bg-slate-700 rounded text-white text-sm transition-colors"
                >
                  <Phone className="w-3 h-3" />
                  <span>Secondary: {contact.secondaryPhone}</span>
                </button>
              )}
            </div>

            {/* Last Contact */}
            <div className="flex items-center space-x-2 mt-4 pt-3 border-t border-slate-700">
              <Clock className="w-3 h-3 text-slate-500" />
              <p className="text-xs text-slate-500">
                Last contact: {new Date(contact.lastContact).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions Bar */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
        <div className="bg-slate-800/90 backdrop-blur-sm rounded-full p-3 border border-slate-700 shadow-2xl">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => handleCall('112', 'Emergency Services')}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-full text-white transition-colors"
            >
              <Phone className="w-4 h-4" />
              <span className="font-medium">112</span>
            </button>
            <button
              onClick={() => handleCall('101', 'Fire Services')}
              className="flex items-center space-x-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded-full text-white transition-colors"
            >
              <Truck className="w-4 h-4" />
              <span className="font-medium">101</span>
            </button>
            <button
              onClick={() => handleCall('102', 'Medical Emergency')}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-full text-white transition-colors"
            >
              <Heart className="w-4 h-4" />
              <span className="font-medium">102</span>
            </button>
            <button
              onClick={() => handleCall('100', 'Police')}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-full text-white transition-colors"
            >
              <Shield className="w-4 h-4" />
              <span className="font-medium">100</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmergencyContacts;
