import React, { useState, useEffect, useRef } from 'react';
import {
  Camera,
  MapPin,
  Upload,
  Mic,
  Video,
  Send,
  AlertTriangle,
  Droplets,
  Flame,
  Bird,
  Wind,
  CloudRain,
  Eye,
  Clock,
  CheckCircle,
  X,
  Star,
  Award,
  Users,
  TrendingUp
} from 'lucide-react';

interface Report {
  id: string;
  type: 'flooding' | 'wildfire' | 'pollution' | 'species-sighting' | 'environmental-hazard' | 'weather-event';
  title: string;
  description: string;
  location: {
    name: string;
    coordinates: [number, number];
  };
  media: {
    photos: string[];
    videos: string[];
    audio?: string;
  };
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  reporter: {
    id: string;
    name: string;
    credibilityScore: number;
  };
  verification: {
    status: 'pending' | 'verified' | 'disputed' | 'false';
    verifications: number;
    aiConfidence?: number;
  };
  impact: {
    peopleAffected?: number;
    areaAffected?: number;
    speciesCount?: number;
  };
}

interface ReportFormData {
  type: string;
  title: string;
  description: string;
  severity: string;
  media: File[];
  location?: GeolocationPosition;
}

const CrowdsourcedReporting: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'report' | 'feed' | 'verify' | 'stats'>('report');
  const [reportForm, setReportForm] = useState<ReportFormData>({
    type: '',
    title: '',
    description: '',
    severity: 'medium',
    media: []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [location, setLocation] = useState<GeolocationPosition | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [reports, setReports] = useState<Report[]>([]);
  const [userStats] = useState({
    totalReports: 47,
    verifiedReports: 42,
    credibilityScore: 94,
    impactPoints: 1247,
    badge: 'Environmental Guardian'
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    loadReports();
    getCurrentLocation();
  }, []);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation(position);
          setReportForm(prev => ({ ...prev, location: position }));
        },
        (error) => console.error('Location error:', error),
        { enableHighAccuracy: true }
      );
    }
  };

  const loadReports = () => {
    // Mock data - would be loaded from API
    setReports([
      {
        id: '1',
        type: 'flooding',
        title: 'Street flooding on Main Avenue',
        description: 'Heavy rainfall has caused significant flooding on Main Avenue. Water level approximately 2 feet deep, affecting vehicle traffic.',
        location: { name: 'Main Avenue, Downtown', coordinates: [40.7128, -74.0060] },
        media: { photos: ['/api/photos/flood1.jpg'], videos: [] },
        severity: 'high',
        timestamp: new Date('2024-08-10T10:30:00'),
        reporter: { id: 'user1', name: 'Sarah Chen', credibilityScore: 92 },
        verification: { status: 'verified', verifications: 5, aiConfidence: 87 },
        impact: { peopleAffected: 150, areaAffected: 2.5 }
      },
      {
        id: '2',
        type: 'species-sighting',
        title: 'Rare bird species spotted',
        description: 'Spotted what appears to be a Golden-winged Warbler in Central Park. Species rarely seen in this region.',
        location: { name: 'Central Park, NYC', coordinates: [40.7829, -73.9654] },
        media: { photos: ['/api/photos/bird1.jpg'], videos: [] },
        severity: 'low',
        timestamp: new Date('2024-08-10T08:15:00'),
        reporter: { id: 'user2', name: 'Mike Rodriguez', credibilityScore: 88 },
        verification: { status: 'pending', verifications: 2, aiConfidence: 72 },
        impact: { speciesCount: 1 }
      }
    ]);
  };

  const getIncidentIcon = (type: string) => {
    switch (type) {
      case 'flooding': return <Droplets className="h-5 w-5" />;
      case 'wildfire': return <Flame className="h-5 w-5" />;
      case 'pollution': return <Wind className="h-5 w-5" />;
      case 'species-sighting': return <Bird className="h-5 w-5" />;
      case 'environmental-hazard': return <AlertTriangle className="h-5 w-5" />;
      case 'weather-event': return <CloudRain className="h-5 w-5" />;
      default: return <Eye className="h-5 w-5" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const getVerificationColor = (status: string) => {
    switch (status) {
      case 'verified': return 'text-green-400';
      case 'pending': return 'text-yellow-400';
      case 'disputed': return 'text-orange-400';
      case 'false': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setReportForm(prev => ({
      ...prev,
      media: [...prev.media, ...files]
    }));
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Camera access error:', error);
    }
  };

  const submitReport = async () => {
    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Reset form
      setReportForm({
        type: '',
        title: '',
        description: '',
        severity: 'medium',
        media: []
      });
      
      // Show success message
      alert('Report submitted successfully! It will be reviewed and verified by our community.');
      
    } catch (error) {
      console.error('Submission error:', error);
      alert('Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderReportForm = () => (
    <div className="space-y-6">
      {/* Quick Action Buttons */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { type: 'flooding', label: 'Flooding', icon: Droplets, color: 'blue' },
          { type: 'wildfire', label: 'Wildfire', icon: Flame, color: 'red' },
          { type: 'pollution', label: 'Pollution', icon: Wind, color: 'gray' },
          { type: 'species-sighting', label: 'Wildlife', icon: Bird, color: 'green' },
          { type: 'environmental-hazard', label: 'Hazard', icon: AlertTriangle, color: 'orange' },
          { type: 'weather-event', label: 'Weather', icon: CloudRain, color: 'purple' }
        ].map(({ type, label, icon: Icon, color }) => (
          <button
            key={type}
            onClick={() => setReportForm(prev => ({ ...prev, type }))}
            className={`p-4 rounded-xl border-2 transition-all ${
              reportForm.type === type
                ? `border-${color}-500 bg-${color}-500/20`
                : 'border-slate-600 bg-slate-700/50 hover:border-slate-500'
            }`}
          >
            <Icon className={`h-8 w-8 mx-auto mb-2 ${
              reportForm.type === type ? `text-${color}-400` : 'text-gray-400'
            }`} />
            <div className="text-sm font-medium text-white">{label}</div>
          </button>
        ))}
      </div>

      {reportForm.type && (
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
            <input
              type="text"
              value={reportForm.title}
              onChange={(e) => setReportForm(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
              placeholder="Brief description of the incident..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Detailed Description</label>
            <textarea
              rows={4}
              value={reportForm.description}
              onChange={(e) => setReportForm(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
              placeholder="Provide detailed information about what you observed..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Severity Level</label>
              <select
                value={reportForm.severity}
                onChange={(e) => setReportForm(prev => ({ ...prev, severity: e.target.value }))}
                title="Select severity level"
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
              >
                <option value="low">Low Impact</option>
                <option value="medium">Medium Impact</option>
                <option value="high">High Impact</option>
                <option value="critical">Critical - Immediate Action Required</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Location</label>
              <div className="flex items-center space-x-2">
                <div className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white">
                  {location ? 'GPS Location Captured' : 'Getting location...'}
                </div>
                <button
                  onClick={getCurrentLocation}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <MapPin className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Media Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Evidence (Photos/Videos)</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="aspect-square bg-slate-700 border-2 border-dashed border-slate-600 rounded-lg flex flex-col items-center justify-center hover:border-blue-500 transition-colors"
              >
                <Upload className="h-8 w-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-400">Upload</span>
              </button>

              <button
                onClick={startCamera}
                className="aspect-square bg-slate-700 border-2 border-dashed border-slate-600 rounded-lg flex flex-col items-center justify-center hover:border-blue-500 transition-colors"
              >
                <Camera className="h-8 w-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-400">Camera</span>
              </button>

              <button
                onClick={() => setIsRecording(!isRecording)}
                className={`aspect-square border-2 border-dashed rounded-lg flex flex-col items-center justify-center transition-colors ${
                  isRecording 
                    ? 'bg-red-500/20 border-red-500 text-red-400' 
                    : 'bg-slate-700 border-slate-600 text-gray-400 hover:border-blue-500'
                }`}
              >
                <Video className="h-8 w-8 mb-2" />
                <span className="text-sm">{isRecording ? 'Stop' : 'Video'}</span>
              </button>

              <button
                className="aspect-square bg-slate-700 border-2 border-dashed border-slate-600 rounded-lg flex flex-col items-center justify-center hover:border-blue-500 transition-colors"
              >
                <Mic className="h-8 w-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-400">Audio</span>
              </button>
            </div>

            {reportForm.media.length > 0 && (
              <div className="mt-4">
                <div className="text-sm text-gray-400 mb-2">Uploaded Files ({reportForm.media.length})</div>
                <div className="flex flex-wrap gap-2">
                  {reportForm.media.map((file, index) => (
                    <div key={index} className="flex items-center space-x-2 bg-slate-700 px-3 py-2 rounded-lg">
                      <span className="text-sm text-white">{file.name}</span>
                      <button
                        onClick={() => setReportForm(prev => ({
                          ...prev,
                          media: prev.media.filter((_, i) => i !== index)
                        }))}
                        className="text-red-400 hover:text-red-300"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex space-x-4">
            <button
              onClick={submitReport}
              disabled={isSubmitting || !reportForm.title || !reportForm.description}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg flex items-center justify-center space-x-2 transition-colors"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>Submit Report</span>
                </>
              )}
            </button>
            <button
              onClick={() => setReportForm({ type: '', title: '', description: '', severity: 'medium', media: [] })}
              className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
            >
              Clear
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*"
            onChange={handleFileUpload}
            className="hidden"
            aria-label="Upload media files"
            title="Upload media files"
          />

          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="hidden"
          />
        </div>
      )}
    </div>
  );

  const renderReportsFeed = () => (
    <div className="space-y-4">
      {reports.map(report => (
        <div key={report.id} className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-slate-700 rounded-lg">
                {getIncidentIcon(report.type)}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">{report.title}</h3>
                <div className="flex items-center space-x-4 text-sm text-gray-400">
                  <span className="flex items-center">
                    <MapPin className="h-3 w-3 mr-1" />
                    {report.location.name}
                  </span>
                  <span className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {report.timestamp.toLocaleString()}
                  </span>
                  <span className="flex items-center">
                    <Users className="h-3 w-3 mr-1" />
                    {report.reporter.name}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getSeverityColor(report.severity)}`}>
                {report.severity.toUpperCase()}
              </span>
              <span className={`flex items-center text-sm ${getVerificationColor(report.verification.status)}`}>
                <CheckCircle className="h-4 w-4 mr-1" />
                {report.verification.status}
              </span>
            </div>
          </div>

          <p className="text-gray-300 mb-4">{report.description}</p>

          {report.media.photos.length > 0 && (
            <div className="mb-4">
              <div className="text-sm text-gray-400 mb-2">Evidence</div>
              <div className="flex space-x-2">
                {report.media.photos.map((_, index) => (
                  <div key={index} className="w-20 h-20 bg-slate-700 rounded-lg flex items-center justify-center">
                    <Camera className="h-6 w-6 text-gray-400" />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="text-lg font-bold text-blue-400">{report.verification.verifications}</div>
              <div className="text-xs text-gray-400">Verifications</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-400">{report.verification.aiConfidence}%</div>
              <div className="text-xs text-gray-400">AI Confidence</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-purple-400">{report.reporter.credibilityScore}</div>
              <div className="text-xs text-gray-400">Reporter Score</div>
            </div>
          </div>

          <div className="flex space-x-2">
            <button className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm transition-colors">
              Verify
            </button>
            <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors">
              Share
            </button>
            <button className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm transition-colors">
              More Info
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  const renderUserStats = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-xl border border-blue-500/30 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">{userStats.badge}</h2>
            <p className="text-blue-400">Your community impact</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-purple-400">{userStats.credibilityScore}</div>
            <div className="text-sm text-gray-400">Credibility Score</div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-800/50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-400">{userStats.totalReports}</div>
            <div className="text-sm text-gray-400">Total Reports</div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-400">{userStats.verifiedReports}</div>
            <div className="text-sm text-gray-400">Verified</div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-400">{userStats.impactPoints}</div>
            <div className="text-sm text-gray-400">Impact Points</div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-4 text-center">
            <div className="flex justify-center mb-2">
              <Award className="h-6 w-6 text-yellow-400" />
            </div>
            <div className="text-xs text-gray-400">Achievement</div>
          </div>
        </div>
      </div>

      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Recent Achievements</h3>
        <div className="space-y-3">
          {[
            { title: 'First Responder', description: 'Submitted 5 verified emergency reports', date: '2 days ago', points: 100 },
            { title: 'Wildlife Guardian', description: 'Documented 10 species sightings', date: '1 week ago', points: 75 },
            { title: 'Community Verifier', description: 'Verified 20 community reports', date: '2 weeks ago', points: 150 }
          ].map((achievement, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
                  <Star className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="text-white font-medium">{achievement.title}</div>
                  <div className="text-sm text-gray-400">{achievement.description}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-green-400 font-bold">+{achievement.points}</div>
                <div className="text-xs text-gray-400">{achievement.date}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  Community Reporting Hub
                </h1>
                <p className="text-gray-400">
                  Help build environmental resilience through crowdsourced data collection
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-400">+{userStats.impactPoints}</div>
                <div className="text-sm text-gray-400">Impact Points</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-6 bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-2">
          {[
            { key: 'report', label: 'Submit Report', icon: Camera },
            { key: 'feed', label: 'Community Feed', icon: Eye },
            { key: 'verify', label: 'Verify Reports', icon: CheckCircle },
            { key: 'stats', label: 'My Impact', icon: TrendingUp }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as typeof activeTab)}
                className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                  activeTab === tab.key
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div>
          {activeTab === 'report' && renderReportForm()}
          {activeTab === 'feed' && renderReportsFeed()}
          {activeTab === 'verify' && renderReportsFeed()}
          {activeTab === 'stats' && renderUserStats()}
        </div>
      </div>
    </div>
  );
};

export default CrowdsourcedReporting;
