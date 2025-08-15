import React, { useState, useRef } from 'react';
import { AlertTriangle, Camera, Video, MapPin, Upload, Send, ChevronDown } from 'lucide-react';

interface IncidentReport {
  type: string;
  urgencyLevel: 'Low' | 'Medium' | 'High';
  description: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  } | null;
  images: File[];
  videos: File[];
  reporterName: string;
  reporterPhone: string;
  timestamp: string;
}

interface IncidentType {
  id: string;
  label: string;
  icon: string;
  description: string;
}

const ReportIncident: React.FC = () => {
  const [report, setReport] = useState<IncidentReport>({
    type: '',
    urgencyLevel: 'Medium',
    description: '',
    location: null,
    images: [],
    videos: [],
    reporterName: '',
    reporterPhone: '',
    timestamp: new Date().toISOString()
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [showUrgencyDropdown, setShowUrgencyDropdown] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const incidentTypes: IncidentType[] = [
    { id: 'fire', label: 'Fire Emergency', icon: '🔥', description: 'Building fires, forest fires, explosions' },
    { id: 'flood', label: 'Flood/Water Emergency', icon: '🌊', description: 'Flooding, water damage, dam issues' },
    { id: 'earthquake', label: 'Earthquake', icon: '🌍', description: 'Seismic activity, building damage' },
    { id: 'medical', label: 'Medical Emergency', icon: '🏥', description: 'Medical emergencies, injuries, health crises' },
    { id: 'accident', label: 'Traffic Accident', icon: '🚗', description: 'Vehicle accidents, road incidents' },
    { id: 'violence', label: 'Violence/Crime', icon: '🚨', description: 'Criminal activity, violence, threats' },
    { id: 'gas', label: 'Gas Leak', icon: '⚠️', description: 'Gas leaks, chemical spills' },
    { id: 'power', label: 'Power Emergency', icon: '⚡', description: 'Power outages, electrical hazards' },
    { id: 'storm', label: 'Severe Weather', icon: '🌪️', description: 'Storms, tornadoes, severe weather' },
    { id: 'other', label: 'Other Emergency', icon: '📞', description: 'Other types of emergencies' }
  ];

  const urgencyLevels = [
    { value: 'Low', color: 'bg-green-500', description: 'Non-urgent situation' },
    { value: 'Medium', color: 'bg-yellow-500', description: 'Moderate urgency' },
    { value: 'High', color: 'bg-red-500', description: 'Immediate attention required' }
  ];

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          // Try to get address from coordinates (mock implementation)
          const address = `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`;
          
          setReport(prev => ({
            ...prev,
            location: {
              lat: latitude,
              lng: longitude,
              address
            }
          }));
        },
        (error) => {
          console.error('Geolocation error:', error);
          alert('Unable to get your location. Please enable location services.');
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setReport(prev => ({
      ...prev,
      images: [...prev.images, ...files]
    }));
  };

  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setReport(prev => ({
      ...prev,
      videos: [...prev.videos, ...files]
    }));
  };

  const startVideoRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 1280, height: 720 }, 
        audio: true 
      });
      
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];
      
      recorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };
      
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const file = new File([blob], `evidence-${Date.now()}.webm`, { type: 'video/webm' });
        
        setReport(prev => ({
          ...prev,
          videos: [...prev.videos, file]
        }));
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };
      
      setMediaRecorder(recorder);
      recorder.start();
      setIsRecording(true);
      
    } catch (error) {
      console.error('Error starting video recording:', error);
      alert('Unable to access camera. Please check permissions.');
    }
  };

  const stopVideoRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
      setIsRecording(false);
      setMediaRecorder(null);
    }
  };

  const removeFile = (index: number, type: 'images' | 'videos') => {
    setReport(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
    }));
  };

  const submitReport = async () => {
    // Validation
    if (!report.type) {
      alert('Please select an incident type.');
      return;
    }
    
    if (!report.description.trim()) {
      alert('Please provide a description of the incident.');
      return;
    }
    
    if (!report.reporterName.trim()) {
      alert('Please enter your name.');
      return;
    }
    
    if (!report.reporterPhone.trim()) {
      alert('Please enter your phone number.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create report summary
      const reportSummary = {
        ...report,
        id: `INC-${Date.now()}`,
        status: 'submitted',
        timestamp: new Date().toISOString()
      };
      
      console.log('Report submitted:', reportSummary);
      
      // Show success message
      alert(`
        Incident Report Submitted Successfully!
        
        Report ID: ${reportSummary.id}
        Type: ${incidentTypes.find(t => t.id === report.type)?.label}
        Urgency: ${report.urgencyLevel}
        
        Emergency services have been notified.
        You will receive updates on your phone: ${report.reporterPhone}
      `);
      
      // Reset form
      setReport({
        type: '',
        urgencyLevel: 'Medium',
        description: '',
        location: null,
        images: [],
        videos: [],
        reporterName: '',
        reporterPhone: '',
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Error submitting report:', error);
      alert('Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-slate-900 text-white">
      <div className="bg-slate-800/60 backdrop-blur-sm rounded-2xl p-8 border border-slate-700">
        {/* Header */}
        <div className="flex items-center space-x-3 mb-8">
          <AlertTriangle className="w-8 h-8 text-red-400" />
          <div>
            <h1 className="text-2xl font-bold">Report Emergency Incident</h1>
            <p className="text-slate-400">Provide detailed information about the emergency</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Incident Type */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Type of Incident *
            </label>
            <div className="relative">
              <button
                onClick={() => setShowTypeDropdown(!showTypeDropdown)}
                className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-left flex items-center justify-between hover:border-slate-500 transition-colors"
              >
                <span className="flex items-center space-x-2">
                  {report.type ? (
                    <>
                      <span>{incidentTypes.find(t => t.id === report.type)?.icon}</span>
                      <span>{incidentTypes.find(t => t.id === report.type)?.label}</span>
                    </>
                  ) : (
                    <span className="text-slate-400">Select incident type</span>
                  )}
                </span>
                <ChevronDown className={`w-5 h-5 transition-transform ${showTypeDropdown ? 'rotate-180' : ''}`} />
              </button>
              
              {showTypeDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-slate-700 border border-slate-600 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                  {incidentTypes.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => {
                        setReport(prev => ({ ...prev, type: type.id }));
                        setShowTypeDropdown(false);
                      }}
                      className="w-full p-3 text-left hover:bg-slate-600 flex items-start space-x-3 transition-colors"
                    >
                      <span className="text-xl">{type.icon}</span>
                      <div>
                        <div className="font-medium">{type.label}</div>
                        <div className="text-sm text-slate-400">{type.description}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Urgency Level */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Urgency Level *
            </label>
            <div className="relative">
              <button
                onClick={() => setShowUrgencyDropdown(!showUrgencyDropdown)}
                className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-left flex items-center justify-between hover:border-slate-500 transition-colors"
              >
                <span className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${urgencyLevels.find(u => u.value === report.urgencyLevel)?.color}`}></div>
                  <span>{report.urgencyLevel}</span>
                  <span className="text-slate-400 text-sm">
                    - {urgencyLevels.find(u => u.value === report.urgencyLevel)?.description}
                  </span>
                </span>
                <ChevronDown className={`w-5 h-5 transition-transform ${showUrgencyDropdown ? 'rotate-180' : ''}`} />
              </button>
              
              {showUrgencyDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-slate-700 border border-slate-600 rounded-lg shadow-xl">
                  {urgencyLevels.map((level) => (
                    <button
                      key={level.value}
                      onClick={() => {
                        setReport(prev => ({ ...prev, urgencyLevel: level.value as 'Low' | 'Medium' | 'High' }));
                        setShowUrgencyDropdown(false);
                      }}
                      className="w-full p-3 text-left hover:bg-slate-600 flex items-center space-x-3 transition-colors"
                    >
                      <div className={`w-3 h-3 rounded-full ${level.color}`}></div>
                      <div>
                        <div className="font-medium">{level.value}</div>
                        <div className="text-sm text-slate-400">{level.description}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Incident Description *
            </label>
            <textarea
              value={report.description}
              onChange={(e) => setReport(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Provide detailed information about what happened, when it occurred, and any immediate dangers..."
              className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              rows={4}
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Location
            </label>
            <div className="flex space-x-3">
              <button
                onClick={getCurrentLocation}
                className="flex items-center space-x-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition-colors"
              >
                <MapPin className="w-4 h-4" />
                <span>Get Current Location</span>
              </button>
              {report.location && (
                <div className="flex-1 p-3 bg-slate-700 border border-slate-600 rounded-lg">
                  <p className="text-sm text-slate-300">{report.location.address}</p>
                </div>
              )}
            </div>
          </div>

          {/* Reporter Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Your Name *
              </label>
              <input
                type="text"
                value={report.reporterName}
                onChange={(e) => setReport(prev => ({ ...prev, reporterName: e.target.value }))}
                placeholder="Enter your full name"
                className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                value={report.reporterPhone}
                onChange={(e) => setReport(prev => ({ ...prev, reporterPhone: e.target.value }))}
                placeholder="+91 XXXXX XXXXX"
                className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              />
            </div>
          </div>

          {/* Evidence Upload */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-slate-300">Evidence (Optional)</h3>
            
            {/* Photo Upload */}
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Photos
              </label>
              <div className="flex space-x-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                  aria-label="Upload photos"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center space-x-2 px-4 py-3 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-lg transition-colors"
                >
                  <Camera className="w-4 h-4" />
                  <span>Add Photos</span>
                </button>
              </div>
              
              {report.images.length > 0 && (
                <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3">
                  {report.images.map((file, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Evidence ${index + 1}`}
                        className="w-full h-20 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => removeFile(index, 'images')}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 text-white rounded-full text-xs hover:bg-red-700"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Video Upload/Recording */}
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Short Video Evidence
              </label>
              <div className="flex space-x-3">
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleVideoUpload}
                  className="hidden"
                  aria-label="Upload videos"
                />
                <button
                  onClick={() => videoInputRef.current?.click()}
                  className="flex items-center space-x-2 px-4 py-3 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-lg transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload Video</span>
                </button>
                
                <button
                  onClick={isRecording ? stopVideoRecording : startVideoRecording}
                  className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-colors ${
                    isRecording 
                      ? 'bg-red-600 hover:bg-red-700 animate-pulse' 
                      : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  <Video className="w-4 h-4" />
                  <span>{isRecording ? 'Stop Recording' : 'Record Video'}</span>
                </button>
              </div>
              
              {report.videos.length > 0 && (
                <div className="mt-3 space-y-2">
                  {report.videos.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Video className="w-4 h-4 text-blue-400" />
                        <span className="text-sm">{file.name}</span>
                        <span className="text-xs text-slate-400">
                          ({(file.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </div>
                      <button
                        onClick={() => removeFile(index, 'videos')}
                        className="text-red-400 hover:text-red-300"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-6 border-t border-slate-700">
            <button
              onClick={submitReport}
              disabled={isSubmitting}
              className="w-full flex items-center justify-center space-x-2 px-6 py-4 bg-red-600 hover:bg-red-700 disabled:bg-slate-600 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-colors"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Submitting Report...</span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>Submit Emergency Report</span>
                </>
              )}
            </button>
            
            <p className="text-center text-slate-400 text-sm mt-3">
              For immediate life-threatening emergencies, call <a href="tel:911" className="text-red-400 hover:text-red-300">911</a> directly
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportIncident;
