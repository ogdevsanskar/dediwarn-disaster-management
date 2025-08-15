import React, { useState, useEffect } from 'react';
import { AlertTriangle, Phone, MessageCircle, MapPin, Clock, Users, Activity, Navigation, Wifi, WifiOff, RefreshCw } from 'lucide-react';

interface EmergencyAlert {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  timestamp: string;
  category: string;
  isActive: boolean;
  affectedArea: string;
  evacuationRequired: boolean;
  contactNumbers: {
    primary: string;
    secondary: string;
    whatsapp?: string;
  };
  estimatedAffected: number;
  responseTeams: number;
}

interface Contact {
  id: string;
  name: string;
  role: string;
  phone: string;
  whatsapp?: string;
  status: 'available' | 'busy' | 'offline';
  specialization: string;
}

const EmergencyOverview: React.FC = () => {
  const [activeAlert, setActiveAlert] = useState<EmergencyAlert | null>(null);
  const [emergencyContacts, setEmergencyContacts] = useState<Contact[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    // Simulate active emergency alert
    setActiveAlert({
      id: 'alert-001',
      title: 'Severe Cyclone Warning',
      description: 'Cyclone Mocha approaching coastal areas with wind speeds up to 180 km/h. Immediate evacuation recommended for low-lying areas.',
      severity: 'critical',
      location: {
        lat: 21.1458,
        lng: 79.0882,
        address: 'Nagpur, Maharashtra, India'
      },
      timestamp: new Date().toISOString(),
      category: 'Natural Disaster',
      isActive: true,
      affectedArea: '50 km radius',
      evacuationRequired: true,
      contactNumbers: {
        primary: '+91 6001163688',
        secondary: '+91 6200943853',
        whatsapp: '+91 6001163688'
      },
      estimatedAffected: 125000,
      responseTeams: 45
    });

    // Set emergency contacts with updated numbers
    setEmergencyContacts([
      {
        id: 'contact-1',
        name: 'Dr. Rajesh Kumar',
        role: 'Emergency Coordinator',
        phone: '+91 6001163688',
        whatsapp: '+91 6001163688',
        status: 'available',
        specialization: 'Disaster Management'
      },
      {
        id: 'contact-2',
        name: 'Priya Sharma',
        role: 'Rescue Operations Head',
        phone: '+91 6200943853',
        status: 'available',
        specialization: 'Search & Rescue'
      },
      {
        id: 'contact-3',
        name: 'Amit Singh',
        role: 'Medical Emergency Chief',
        phone: '+91 7477396342',
        status: 'busy',
        specialization: 'Emergency Medicine'
      }
    ]);

    // Monitor online status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleCall = (phoneNumber: string) => {
    window.open(`tel:${phoneNumber}`, '_self');
  };

  const handleWhatsApp = (phoneNumber: string, contactName: string) => {
    const message = encodeURIComponent(`Hello ${contactName}, I need emergency assistance. Current emergency: ${activeAlert?.title || 'Emergency situation'}. My location: ${activeAlert?.location.address || 'Location not available'}.`);
    window.open(`https://wa.me/${phoneNumber.replace(/\+/g, '')}?text=${message}`, '_blank');
  };

  const handleNavigation = () => {
    if (activeAlert?.location) {
      const { lat, lng } = activeAlert.location;
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
    }
  };

  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500/20 border-red-500 text-red-300 animate-pulse';
      case 'high':
        return 'bg-orange-500/20 border-orange-500 text-orange-300';
      case 'medium':
        return 'bg-yellow-500/20 border-yellow-500 text-yellow-300';
      case 'low':
        return 'bg-green-500/20 border-green-500 text-green-300';
      default:
        return 'bg-gray-500/20 border-gray-500 text-gray-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'text-green-400';
      case 'busy': return 'text-yellow-400';
      case 'offline': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Network Status */}
      <div className={`flex items-center justify-between p-4 rounded-lg border ${isOnline ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
        <div className="flex items-center space-x-2">
          {isOnline ? <Wifi className="w-5 h-5 text-green-400" /> : <WifiOff className="w-5 h-5 text-red-400" />}
          <span className={isOnline ? 'text-green-300' : 'text-red-300'}>
            {isOnline ? 'Connected' : 'Offline - Emergency numbers still work'}
          </span>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="flex items-center space-x-1 px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-sm"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Active Emergency Alert Details */}
      {activeAlert && (
        <div className={`p-6 rounded-xl border-2 ${getSeverityStyles(activeAlert.severity)}`}>
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-8 h-8 text-red-400 animate-pulse" />
              <div>
                <h2 className="text-xl font-bold text-white">{activeAlert.title}</h2>
                <p className="text-sm text-gray-300 capitalize">{activeAlert.category}</p>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getSeverityStyles(activeAlert.severity)}`}>
              {activeAlert.severity.toUpperCase()}
            </span>
          </div>

          <p className="text-gray-300 mb-4">{activeAlert.description}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-blue-400" />
              <div>
                <p className="text-sm text-gray-400">Location</p>
                <p className="text-white font-medium">{activeAlert.location.address}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-green-400" />
              <div>
                <p className="text-sm text-gray-400">Time</p>
                <p className="text-white font-medium">
                  {new Date(activeAlert.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-yellow-400" />
              <div>
                <p className="text-sm text-gray-400">Affected</p>
                <p className="text-white font-medium">{activeAlert.estimatedAffected.toLocaleString()}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-purple-400" />
              <div>
                <p className="text-sm text-gray-400">Response Teams</p>
                <p className="text-white font-medium">{activeAlert.responseTeams}</p>
              </div>
            </div>
          </div>

          {/* Emergency Actions */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => handleCall(activeAlert.contactNumbers.primary)}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white font-medium transition-colors"
            >
              <Phone className="w-4 h-4" />
              <span>Call Emergency</span>
            </button>
            
            <button
              onClick={() => handleWhatsApp(activeAlert.contactNumbers.whatsapp || activeAlert.contactNumbers.primary, 'Emergency Team')}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white font-medium transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp</span>
            </button>
            
            <button
              onClick={handleNavigation}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-colors"
            >
              <Navigation className="w-4 h-4" />
              <span>Navigate</span>
            </button>
            
            <button
              onClick={() => {
                if (navigator.geolocation) {
                  navigator.geolocation.getCurrentPosition((position) => {
                    const message = `Emergency location shared: https://maps.google.com/?q=${position.coords.latitude},${position.coords.longitude}`;
                    navigator.clipboard.writeText(message);
                    alert('Location copied to clipboard!');
                  });
                } else {
                  alert('Geolocation not supported');
                }
              }}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-medium transition-colors"
            >
              <MapPin className="w-4 h-4" />
              <span>Share Location</span>
            </button>
          </div>
        </div>
      )}

      {/* Emergency Contacts */}
      <div className="bg-slate-800/60 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
          <Phone className="w-5 h-5 text-blue-400" />
          <span>Emergency Contacts</span>
        </h3>
        
        <div className="space-y-3">
          {emergencyContacts.map((contact) => (
            <div key={contact.id} className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${getStatusColor(contact.status)} animate-pulse`} />
                <div>
                  <h4 className="font-medium text-white">{contact.name}</h4>
                  <p className="text-sm text-gray-400">{contact.role} • {contact.specialization}</p>
                  <p className="text-sm text-gray-500">{contact.phone}</p>
                </div>
              </div>
              
              <div className="flex space-x-2">
                {contact.name === 'Dr. Rajesh Kumar' ? (
                  <button
                    onClick={() => handleWhatsApp(contact.whatsapp || contact.phone, contact.name)}
                    className="flex items-center space-x-1 px-3 py-2 bg-green-600 hover:bg-green-700 rounded text-white text-sm transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Chat</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleCall(contact.phone)}
                    className="flex items-center space-x-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white text-sm transition-colors"
                  >
                    <Phone className="w-4 h-4" />
                    <span>Call</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EmergencyOverview;
