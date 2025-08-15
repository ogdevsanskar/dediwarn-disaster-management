import React, { useState, useEffect } from 'react';
import { X, Phone, MapPin, Clock, AlertTriangle, Navigation, Share2 } from 'lucide-react';

interface AlertDetails {
  id: string;
  title: string;
  description: string;
  location: {
    address: string;
    coordinates: { lat: number; lng: number };
  };
  severity: 'low' | 'medium' | 'high' | 'critical';
  timeIssued: string;
  instructions: string[];
  emergencyContacts: {
    type: string;
    number: string;
    name: string;
  }[];
  status: string;
  affectedArea: string;
  estimatedDuration: string;
}

interface AlertDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  alertId: string;
}

export const AlertDetailModal: React.FC<AlertDetailModalProps> = ({ isOpen, onClose, alertId }) => {
  const [alertDetails, setAlertDetails] = useState<AlertDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    if (isOpen && alertId) {
      fetchAlertDetails(alertId);
    }
  }, [isOpen, alertId]);

  const fetchAlertDetails = async (id: string) => {
    setLoading(true);
    try {
      // Simulate API call - replace with actual API
      const mockData: AlertDetails = {
        id,
        title: 'Severe Weather Alert - Hurricane Warning',
        description: 'A Category 3 hurricane is approaching the coastal region with sustained winds of 115 mph. Immediate evacuation is recommended for low-lying areas and coastal zones.',
        location: {
          address: 'Miami-Dade County, Florida, USA',
          coordinates: { lat: 25.7617, lng: -80.1918 }
        },
        severity: 'critical',
        timeIssued: new Date().toISOString(),
        instructions: [
          'Evacuate immediately if you are in a flood-prone or low-lying area',
          'Secure loose outdoor items or bring them indoors',
          'Stock up on water (1 gallon per person per day for 3 days minimum)',
          'Ensure you have flashlights, batteries, and a battery-powered radio',
          'Keep important documents in waterproof containers',
          'Follow official evacuation routes and avoid flooded roads'
        ],
        emergencyContacts: [
          { type: 'Emergency Services', number: '911', name: 'Fire, Police, Medical' },
          { type: 'Hurricane Hotline', number: '1-800-HURRICANE', name: 'Weather Emergency' },
          { type: 'Evacuation Centers', number: '311', name: 'Shelter Information' },
          { type: 'Red Cross', number: '1-800-RED-CROSS', name: 'Disaster Relief' }
        ],
        status: 'Active - Immediate Action Required',
        affectedArea: '50-mile radius from Miami',
        estimatedDuration: '24-48 hours'
      };
      setAlertDetails(mockData);
    } catch (error) {
      console.error('Error fetching alert details:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'text-green-400 bg-green-500/20 border-green-500/50';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/50';
      case 'high': return 'text-orange-400 bg-orange-500/20 border-orange-500/50';
      case 'critical': return 'text-red-400 bg-red-500/20 border-red-500/50';
      default: return 'text-slate-400 bg-slate-500/20 border-slate-500/50';
    }
  };

  const handleEmergencyCall = (number: string) => {
    // Web-based call using WebRTC (Twilio) or native phone call
    if (window.location.protocol === 'https:' || window.location.hostname === 'localhost') {
      // For production, integrate with Twilio Voice SDK
      window.open(`tel:${number}`, '_self');
    } else {
      window.open(`tel:${number}`, '_self');
    }
  };

  const handleNavigate = () => {
    if (alertDetails) {
      const { lat, lng } = alertDetails.location.coordinates;
      // Open in native maps app or Google Maps
      const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
      window.open(mapsUrl, '_blank');
    }
  };

  const handleShare = async () => {
    if (alertDetails) {
      const shareData = {
        title: alertDetails.title,
        text: `Emergency Alert: ${alertDetails.description}`,
        url: window.location.href
      };

      if (navigator.share) {
        try {
          await navigator.share(shareData);
        } catch (error) {
          console.log('Error sharing:', error);
        }
      } else {
        // Fallback to clipboard
        navigator.clipboard.writeText(`${shareData.title}\n${shareData.text}\n${shareData.url}`);
        alert('Alert details copied to clipboard!');
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-slate-900/75 backdrop-blur-sm" onClick={onClose} />
        
        <div className="inline-block w-full max-w-4xl my-8 overflow-hidden text-left align-middle transition-all transform bg-slate-800 shadow-2xl rounded-2xl border border-slate-700">
          {loading ? (
            <div className="flex items-center justify-center p-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : alertDetails ? (
            <>
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-700 bg-gradient-to-r from-red-600/20 to-orange-600/20">
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="h-6 w-6 text-red-400 animate-pulse" />
                  <div>
                    <h2 className="text-xl font-bold text-white">{alertDetails.title}</h2>
                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${getSeverityColor(alertDetails.severity)} mt-1`}>
                      {alertDetails.severity.toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleShare}
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    <Share2 className="h-5 w-5" />
                  </button>
                  <button
                    onClick={onClose}
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="max-h-[70vh] overflow-y-auto">
                <div className="p-6 space-y-6">
                  {/* Alert Info */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-slate-700/50 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Clock className="h-4 w-4 text-blue-400" />
                        <span className="text-sm font-medium text-slate-300">Time Issued</span>
                      </div>
                      <p className="text-white">{new Date(alertDetails.timeIssued).toLocaleString()}</p>
                    </div>
                    <div className="bg-slate-700/50 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <MapPin className="h-4 w-4 text-green-400" />
                        <span className="text-sm font-medium text-slate-300">Affected Area</span>
                      </div>
                      <p className="text-white">{alertDetails.affectedArea}</p>
                    </div>
                    <div className="bg-slate-700/50 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <AlertTriangle className="h-4 w-4 text-orange-400" />
                        <span className="text-sm font-medium text-slate-300">Duration</span>
                      </div>
                      <p className="text-white">{alertDetails.estimatedDuration}</p>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="bg-slate-700/30 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-white mb-2">Alert Description</h3>
                    <p className="text-slate-300 leading-relaxed">{alertDetails.description}</p>
                  </div>

                  {/* Location & Map */}
                  <div className="bg-slate-700/30 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-white">Location</h3>
                      <button
                        onClick={handleNavigate}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                      >
                        <Navigation className="h-4 w-4" />
                        <span>Navigate</span>
                      </button>
                    </div>
                    <p className="text-slate-300 mb-4">{alertDetails.location.address}</p>
                    
                    {/* Embedded Map */}
                    <div className="bg-slate-600 rounded-lg h-64 flex items-center justify-center">
                      <iframe
                        src={`https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=${alertDetails.location.coordinates.lat},${alertDetails.location.coordinates.lng}&zoom=12`}
                        width="100%"
                        height="100%"
                        className="rounded-lg"
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title="Alert Location"
                        onLoad={() => setMapLoaded(true)}
                      />
                      {!mapLoaded && (
                        <div className="text-slate-400">
                          <MapPin className="h-8 w-8 mx-auto mb-2" />
                          <p>Loading map...</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Instructions */}
                  <div className="bg-slate-700/30 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-white mb-4">Safety Instructions</h3>
                    <ul className="space-y-2">
                      {alertDetails.instructions.map((instruction, index) => (
                        <li key={index} className="flex items-start space-x-3">
                          <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                            {index + 1}
                          </span>
                          <span className="text-slate-300">{instruction}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Emergency Contacts */}
                  <div className="bg-slate-700/30 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-white mb-4">Emergency Contacts</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {alertDetails.emergencyContacts.map((contact, index) => (
                        <div key={index} className="bg-slate-600/50 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium text-white">{contact.name}</h4>
                              <p className="text-sm text-slate-400">{contact.type}</p>
                              <p className="text-blue-400 font-mono">{contact.number}</p>
                            </div>
                            <button
                              onClick={() => handleEmergencyCall(contact.number)}
                              className="flex items-center justify-center w-10 h-10 bg-green-600 hover:bg-green-700 text-white rounded-full transition-colors"
                            >
                              <Phone className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-between p-6 border-t border-slate-700 bg-slate-700/30">
                <div className="text-sm text-slate-400">
                  Status: <span className="text-orange-400 font-medium">{alertDetails.status}</span>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => handleEmergencyCall('911')}
                    className="flex items-center space-x-2 px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
                  >
                    <Phone className="h-4 w-4" />
                    <span>Call Emergency</span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="p-6 text-center text-slate-400">
              Failed to load alert details. Please try again.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
