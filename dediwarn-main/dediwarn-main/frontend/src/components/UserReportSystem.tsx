import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MapPin, Send, Image, Video, AlertTriangle, Clock, X } from 'lucide-react';

interface UserReport {
  id: string;
  title: string;
  description: string;
  type: 'flood' | 'earthquake' | 'fire' | 'storm' | 'accident' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  media: {
    type: 'image' | 'video';
    url: string;
    thumbnail?: string;
  }[];
  timestamp: string;
  status: 'pending' | 'verified' | 'investigating' | 'resolved';
  reporter: {
    name: string;
    contact: string;
  };
  urgencyLevel: number; // 1-10
  affectedPeople: number;
}

interface UserReportSystemProps {
  onSubmitReport: (report: Omit<UserReport, 'id' | 'timestamp' | 'status'>) => void;
  userLocation?: { lat: number; lng: number };
}

export const UserReportSystem: React.FC<UserReportSystemProps> = ({ 
  onSubmitReport, 
  userLocation 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [reportData, setReportData] = useState({
    title: '',
    description: '',
    type: 'other' as UserReport['type'],
    severity: 'medium' as UserReport['severity'],
    urgencyLevel: 5,
    affectedPeople: 0,
    reporter: {
      name: '',
      contact: ''
    }
  });
  
  const [media, setMedia] = useState<{type: 'image' | 'video', url: string, file: File}[]>([]);
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number, address: string} | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Get current location
  const getCurrentLocation = useCallback(() => {
    setIsGettingLocation(true);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          // Reverse geocode to get address (mock implementation)
          const address = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
          
          setCurrentLocation({
            lat: latitude,
            lng: longitude,
            address: address
          });
          setIsGettingLocation(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          if (userLocation) {
            setCurrentLocation({
              lat: userLocation.lat,
              lng: userLocation.lng,
              address: `${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}`
            });
          }
          setIsGettingLocation(false);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      setIsGettingLocation(false);
      alert('Geolocation is not supported by this browser');
    }
  }, [userLocation]);

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      if (media.length >= 5) {
        alert('Maximum 5 files allowed');
        return;
      }

      const url = URL.createObjectURL(file);
      setMedia(prev => [...prev, { type, url, file }]);
    });
  };

  // Remove media
  const removeMedia = (index: number) => {
    setMedia(prev => prev.filter((_, i) => i !== index));
  };

  // Submit report
  const handleSubmit = async () => {
    if (!reportData.title || !reportData.description || !currentLocation) {
      alert('Please fill in all required fields and add location');
      return;
    }

    setIsSubmitting(true);

    try {
      const report = {
        ...reportData,
        location: currentLocation,
        media: media.map(m => ({
          type: m.type,
          url: m.url, // In real app, this would be uploaded to cloud storage
        }))
      };

      await onSubmitReport(report);
      
      // Reset form
      setReportData({
        title: '',
        description: '',
        type: 'other',
        severity: 'medium',
        urgencyLevel: 5,
        affectedPeople: 0,
        reporter: { name: '', contact: '' }
      });
      setMedia([]);
      setCurrentLocation(null);
      setIsOpen(false);
      
      alert('Report submitted successfully! Authorities have been notified.');
    } catch (error) {
      console.error('Error submitting report:', error);
      alert('Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get severity color
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'border-green-500 text-green-400';
      case 'medium': return 'border-yellow-500 text-yellow-400';
      case 'high': return 'border-orange-500 text-orange-400';
      case 'critical': return 'border-red-500 text-red-400';
      default: return 'border-gray-500 text-gray-400';
    }
  };

  useEffect(() => {
    if (isOpen && !currentLocation) {
      getCurrentLocation();
    }
  }, [isOpen, currentLocation, getCurrentLocation]);

  return (
    <>
      {/* Report Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-red-600 hover:bg-red-700 text-white p-4 rounded-full shadow-lg transition-all duration-200 hover:scale-110 z-50"
        title="Report Disaster"
      >
        <AlertTriangle className="h-6 w-6" />
      </button>

      {/* Report Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-700">
              <h2 className="text-xl font-bold text-white flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-red-400" />
                Report Disaster/Emergency
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Location *
                </label>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={getCurrentLocation}
                    disabled={isGettingLocation}
                    className="flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white rounded-lg transition-colors"
                  >
                    <MapPin className={`h-4 w-4 mr-2 ${isGettingLocation ? 'animate-pulse' : ''}`} />
                    {isGettingLocation ? 'Getting Location...' : 'Get Current Location'}
                  </button>
                  {currentLocation && (
                    <span className="text-green-400 text-sm">
                      ✓ Location: {currentLocation.address}
                    </span>
                  )}
                </div>
              </div>

              {/* Report Type */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Disaster Type *
                </label>
                <select
                  value={reportData.type}
                  onChange={(e) => setReportData(prev => ({ ...prev, type: e.target.value as UserReport['type'] }))}
                  title="Select disaster type"
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="flood">🌊 Flood</option>
                  <option value="earthquake">🌋 Earthquake</option>
                  <option value="fire">🔥 Fire</option>
                  <option value="storm">⛈️ Storm/Cyclone</option>
                  <option value="accident">🚗 Accident</option>
                  <option value="other">⚠️ Other Emergency</option>
                </select>
              </div>

              {/* Severity and Urgency */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Severity *
                  </label>
                  <select
                    value={reportData.severity}
                    onChange={(e) => setReportData(prev => ({ ...prev, severity: e.target.value as UserReport['severity'] }))}
                    title="Select severity level"
                    className={`w-full px-3 py-2 bg-slate-700 border rounded-lg focus:outline-none focus:border-blue-500 ${getSeverityColor(reportData.severity)}`}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Urgency Level (1-10)
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={reportData.urgencyLevel}
                    onChange={(e) => setReportData(prev => ({ ...prev, urgencyLevel: parseInt(e.target.value) }))}
                    title={`Urgency level: ${reportData.urgencyLevel}`}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>1 (Low)</span>
                    <span className="font-medium text-white">{reportData.urgencyLevel}</span>
                    <span>10 (Critical)</span>
                  </div>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={reportData.title}
                  onChange={(e) => setReportData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Brief title of the emergency"
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Description *
                </label>
                <textarea
                  value={reportData.description}
                  onChange={(e) => setReportData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Detailed description of the situation..."
                  rows={4}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Affected People */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Estimated Affected People
                </label>
                <input
                  type="number"
                  value={reportData.affectedPeople}
                  onChange={(e) => setReportData(prev => ({ ...prev, affectedPeople: parseInt(e.target.value) || 0 }))}
                  placeholder="Number of people affected"
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={reportData.reporter.name}
                    onChange={(e) => setReportData(prev => ({ 
                      ...prev, 
                      reporter: { ...prev.reporter, name: e.target.value }
                    }))}
                    placeholder="Your name (optional)"
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Contact Number
                  </label>
                  <input
                    type="tel"
                    value={reportData.reporter.contact}
                    onChange={(e) => setReportData(prev => ({ 
                      ...prev, 
                      reporter: { ...prev.reporter, contact: e.target.value }
                    }))}
                    placeholder="Phone number (optional)"
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Media Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Add Photos/Videos (Max 5)
                </label>
                <div className="flex space-x-2 mb-4">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                  >
                    <Image className="h-4 w-4 mr-2" />
                    Add Photos
                  </button>
                  <button
                    onClick={() => videoInputRef.current?.click()}
                    className="flex items-center px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                  >
                    <Video className="h-4 w-4 mr-2" />
                    Add Videos
                  </button>
                </div>

                {/* Media Preview */}
                {media.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {media.map((item, index) => (
                      <div key={index} className="relative">
                        {item.type === 'image' ? (
                          <img 
                            src={item.url} 
                            alt={`Upload ${index + 1}`}
                            className="w-full h-20 object-cover rounded-lg"
                          />
                        ) : (
                          <video 
                            src={item.url}
                            className="w-full h-20 object-cover rounded-lg"
                            controls
                          />
                        )}
                        <button
                          onClick={() => removeMedia(index)}
                          className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handleFileUpload(e, 'image')}
                  title="Select image files to upload"
                  className="hidden"
                />
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/*"
                  multiple
                  onChange={(e) => handleFileUpload(e, 'video')}
                  title="Select video files to upload"
                  className="hidden"
                />
              </div>

              {/* Submit Button */}
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setIsOpen(false)}
                  className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !currentLocation || !reportData.title || !reportData.description}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-800 disabled:opacity-50 text-white rounded-lg transition-colors flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Submit Report
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
