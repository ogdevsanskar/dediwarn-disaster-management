import React, { useState, useEffect, useRef } from 'react';
import { Camera, MapPin, Upload, Send, User, Phone, AlertTriangle, FileText, Video, Navigation, X } from 'lucide-react';

interface IncidentFormData {
  name: string;
  contactNumber: string;
  incidentType: string;
  description: string;
  location: {
    address: string;
    coordinates: { lat: number; lng: number };
  };
  media: File[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  witnesses: string;
  timeOfIncident: string;
}

interface IncidentReportFormProps {
  onSubmit: (data: IncidentFormData) => void;
  onCancel?: () => void;
}

export const IncidentReportForm: React.FC<IncidentReportFormProps> = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<IncidentFormData>({
    name: '',
    contactNumber: '',
    incidentType: '',
    description: '',
    location: {
      address: '',
      coordinates: { lat: 0, lng: 0 }
    },
    media: [],
    priority: 'medium',
    witnesses: '',
    timeOfIncident: new Date().toISOString().slice(0, 16)
  });

  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const incidentTypes = [
    'Natural Disaster',
    'Fire Emergency',
    'Medical Emergency',
    'Traffic Accident',
    'Building Collapse',
    'Gas Leak',
    'Power Outage',
    'Flooding',
    'Earthquake',
    'Violence/Crime',
    'Chemical Spill',
    'Other Emergency'
  ];

  useEffect(() => {
    // Auto-detect location on component mount
    getCurrentLocation();
    
    return () => {
      // Cleanup camera stream
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraStream]); // eslint-disable-line react-hooks/exhaustive-deps

  const getCurrentLocation = async () => {
    setLocationLoading(true);
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        });
      });

      const { latitude, longitude } = position.coords;
      
      // Reverse geocoding to get address
      const address = await reverseGeocode(latitude, longitude);
      
      setFormData(prev => ({
        ...prev,
        location: {
          address,
          coordinates: { lat: latitude, lng: longitude }
        }
      }));
    } catch (error) {
      console.error('Error getting location:', error);
      alert('Location access denied or unavailable. Please enter location manually.');
    } finally {
      setLocationLoading(false);
    }
  };

  const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
    try {
      // In production, use Google Maps Geocoding API or similar service
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
      );
      const data = await response.json();
      return data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    } catch {
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
  };

  const handleInputChange = (field: keyof IncidentFormData, value: string | File[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLocationChange = (address: string) => {
    setFormData(prev => ({
      ...prev,
      location: { ...prev.location, address }
    }));
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' }, 
        audio: true 
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Camera access denied. Please check permissions.');
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && cameraStream) {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (context) {
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], `incident-photo-${Date.now()}.jpg`, { type: 'image/jpeg' });
            setFormData(prev => ({
              ...prev,
              media: [...prev.media, file]
            }));
          }
        }, 'image/jpeg', 0.8);
      }
    }
  };

  const startRecording = async () => {
    if (cameraStream) {
      try {
        const recorder = new MediaRecorder(cameraStream);
        const chunks: BlobPart[] = [];
        
        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            chunks.push(event.data);
          }
        };
        
        recorder.onstop = () => {
          const blob = new Blob(chunks, { type: 'video/webm' });
          const file = new File([blob], `incident-video-${Date.now()}.webm`, { type: 'video/webm' });
          setFormData(prev => ({
            ...prev,
            media: [...prev.media, file]
          }));
        };
        
        setMediaRecorder(recorder);
        recorder.start();
        setRecording(true);
      } catch (error) {
        console.error('Error starting recording:', error);
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && recording) {
      mediaRecorder.stop();
      setRecording(false);
      setMediaRecorder(null);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setFormData(prev => ({
      ...prev,
      media: [...prev.media, ...files]
    }));
  };

  const removeMedia = (index: number) => {
    setFormData(prev => ({
      ...prev,
      media: prev.media.filter((_, i) => i !== index)
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      alert('Please enter your name');
      return false;
    }
    if (!formData.contactNumber.trim()) {
      alert('Please enter your contact number');
      return false;
    }
    if (!formData.incidentType) {
      alert('Please select incident type');
      return false;
    }
    if (!formData.description.trim()) {
      alert('Please provide a description of the incident');
      return false;
    }
    if (!formData.location.address.trim()) {
      alert('Please provide incident location');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      // AI-based classification (mock implementation)
      const aiClassification = classifyIncident(formData.description, formData.incidentType);
      
      const submissionData = {
        ...formData,
        aiClassification,
        submittedAt: new Date().toISOString(),
        id: `incident-${Date.now()}`
      };
      
      // Simulate API submission
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      onSubmit(submissionData);
      
      // Reset form
      setFormData({
        name: '',
        contactNumber: '',
        incidentType: '',
        description: '',
        location: { address: '', coordinates: { lat: 0, lng: 0 } },
        media: [],
        priority: 'medium',
        witnesses: '',
        timeOfIncident: new Date().toISOString().slice(0, 16)
      });
      
      alert('Incident report submitted successfully!');
    } catch (error) {
      console.error('Error submitting report:', error);
      alert('Failed to submit report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const classifyIncident = (description: string, type: string): { priority: string; category: string; keywords: string[] } => {
    // Mock AI classification - in production, use actual AI service
    const criticalKeywords = ['fire', 'explosion', 'collapse', 'trapped', 'bleeding', 'unconscious', 'emergency'];
    const highKeywords = ['accident', 'injury', 'damage', 'leak', 'flood'];
    
    const descLower = description.toLowerCase();
    const hasCritical = criticalKeywords.some(keyword => descLower.includes(keyword));
    const hasHigh = highKeywords.some(keyword => descLower.includes(keyword));
    
    return {
      priority: hasCritical ? 'critical' : hasHigh ? 'high' : 'medium',
      category: type,
      keywords: criticalKeywords.filter(keyword => descLower.includes(keyword))
    };
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/50';
      case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/50';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/50';
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-slate-700 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-700 bg-gradient-to-r from-red-600/20 to-orange-600/20">
        <div className="flex items-center space-x-3">
          <AlertTriangle className="h-6 w-6 text-red-400" />
          <h2 className="text-xl font-bold text-white">Report Emergency Incident</h2>
        </div>
        <p className="text-slate-300 mt-1">Provide detailed information about the emergency situation</p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Personal Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              <User className="inline h-4 w-4 mr-1" />
              Full Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your full name"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              <Phone className="inline h-4 w-4 mr-1" />
              Contact Number *
            </label>
            <input
              type="tel"
              value={formData.contactNumber}
              onChange={(e) => handleInputChange('contactNumber', e.target.value)}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="+1 (555) 123-4567"
              required
            />
          </div>
        </div>

        {/* Incident Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              <AlertTriangle className="inline h-4 w-4 mr-1" />
              Type of Incident *
            </label>
            <select
              value={formData.incidentType}
              onChange={(e) => handleInputChange('incidentType', e.target.value)}
              aria-label="Select incident type"
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Select incident type...</option>
              {incidentTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Time of Incident
            </label>
            <input
              type="datetime-local"
              value={formData.timeOfIncident}
              onChange={(e) => handleInputChange('timeOfIncident', e.target.value)}
              aria-label="Time of incident"
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Priority */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Priority Level</label>
          <div className="flex space-x-4">
            {(['low', 'medium', 'high', 'critical'] as const).map((priority) => (
              <label key={priority} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="priority"
                  value={priority}
                  checked={formData.priority === priority}
                  onChange={(e) => handleInputChange('priority', e.target.value)}
                  className="text-blue-500 focus:ring-blue-500"
                />
                <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getPriorityColor(priority)}`}>
                  {priority.toUpperCase()}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            <MapPin className="inline h-4 w-4 mr-1" />
            Location *
          </label>
          <div className="flex space-x-2">
            <input
              type="text"
              value={formData.location.address}
              onChange={(e) => handleLocationChange(e.target.value)}
              className="flex-1 px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter incident location"
              required
            />
            <button
              type="button"
              onClick={getCurrentLocation}
              disabled={locationLoading}
              className="flex items-center space-x-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white rounded-lg transition-colors"
            >
              {locationLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Navigation className="h-4 w-4" />
              )}
              <span>Auto-detect</span>
            </button>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            <FileText className="inline h-4 w-4 mr-1" />
            Incident Description *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows={4}
            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Provide detailed description of the incident..."
            required
          />
        </div>

        {/* Witnesses */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Witnesses (Optional)
          </label>
          <textarea
            value={formData.witnesses}
            onChange={(e) => handleInputChange('witnesses', e.target.value)}
            rows={2}
            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Names and contact information of witnesses..."
          />
        </div>

        {/* Media Upload */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            <Camera className="inline h-4 w-4 mr-1" />
            Photos/Videos (Optional)
          </label>
          
          <div className="space-y-4">
            {/* Camera Controls */}
            <div className="flex flex-wrap gap-3">
              {!cameraStream ? (
                <button
                  type="button"
                  onClick={startCamera}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  <Camera className="h-4 w-4" />
                  <span>Start Camera</span>
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={capturePhoto}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    <Camera className="h-4 w-4" />
                    <span>Take Photo</span>
                  </button>
                  
                  {!recording ? (
                    <button
                      type="button"
                      onClick={startRecording}
                      className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                    >
                      <Video className="h-4 w-4" />
                      <span>Start Recording</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={stopRecording}
                      className="flex items-center space-x-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors animate-pulse"
                    >
                      <div className="h-4 w-4 bg-white rounded-full"></div>
                      <span>Stop Recording</span>
                    </button>
                  )}
                  
                  <button
                    type="button"
                    onClick={stopCamera}
                    className="flex items-center space-x-2 px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors"
                  >
                    <X className="h-4 w-4" />
                    <span>Stop Camera</span>
                  </button>
                </>
              )}
              
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                <Upload className="h-4 w-4" />
                <span>Upload Files</span>
              </button>
            </div>

            {/* Camera Preview */}
            {cameraStream && (
              <div className="bg-black rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  className="w-full h-64 object-cover"
                />
              </div>
            )}

            {/* File Input */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={handleFileUpload}
              aria-label="Upload incident photos or videos"
              className="hidden"
            />

            {/* Media Preview */}
            {formData.media.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {formData.media.map((file, index) => (
                  <div key={index} className="relative bg-slate-700 rounded-lg p-2">
                    <div className="text-center">
                      {file.type.startsWith('image/') ? (
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Upload ${index + 1}`}
                          className="w-full h-20 object-cover rounded mb-2"
                        />
                      ) : (
                        <div className="w-full h-20 bg-slate-600 rounded mb-2 flex items-center justify-center">
                          <Video className="h-8 w-8 text-slate-400" />
                        </div>
                      )}
                      <p className="text-xs text-slate-300 truncate">{file.name}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeMedia(index)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-700"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-slate-700">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            className="flex items-center space-x-2 px-8 py-3 bg-red-600 hover:bg-red-700 disabled:bg-red-800 text-white rounded-lg transition-colors font-medium"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Send className="h-4 w-4" />
            )}
            <span>{loading ? 'Submitting...' : 'Submit Report'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
