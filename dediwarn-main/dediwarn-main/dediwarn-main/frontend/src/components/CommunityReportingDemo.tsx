/**
 * Community Reporting Demo
 * Comprehensive demonstration of crowdsourced incident reporting system
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
  AlertTriangle, Users, Camera, Shield, MapPin, Clock, 
  CheckCircle, Eye, MessageSquare, Star,
  Activity, Zap, Globe, Award, Navigation, RefreshCw
} from 'lucide-react';
import CommunityReportingService, { 
  ReportingAnalytics 
} from '../services/CommunityReportingService';

interface CommunityReportingDemoProps {
  onNavigate?: (component: string) => void;
}

export const CommunityReportingDemo: React.FC<CommunityReportingDemoProps> = ({
  onNavigate
}) => {
  const [activeDemo, setActiveDemo] = useState('overview');
  const [analytics, setAnalytics] = useState<ReportingAnalytics | null>(null);
  // Removed unused recentReports state
  const [loading, setLoading] = useState(false);

  const reportingService = CommunityReportingService.getInstance();

  const loadDemoData = useCallback(async () => {
    setLoading(true);
    try {
      // Load sample analytics
      const analyticsData = await reportingService.getAnalytics('day');
      setAnalytics(analyticsData);

      // Load sample reports
      // const reports = await reportingService.getReports({
      //   limit: 10,
      //   sortBy: 'timestamp'
      // });
      // setRecentReports(reports);
    } catch (error) {
      console.error('Error loading demo data:', error);
    } finally {
      setLoading(false);
    }
  }, [reportingService]);

  useEffect(() => {
    loadDemoData();
  }, [loadDemoData]);

  const demoFeatures = [
    {
      id: 'crowdsourced',
      title: 'Crowdsourced Reporting',
      description: 'Citizens report incidents in real-time with location data and detailed descriptions',
      icon: Users,
      stats: { value: '2,400+', label: 'Active Reporters' },
      color: 'blue'
    },
    {
      id: 'evidence',
      title: 'Photo/Video Evidence',
      description: 'Upload multimedia evidence with automatic metadata extraction and verification',
      icon: Camera,
      stats: { value: '15,000+', label: 'Media Files' },
      color: 'green'
    },
    {
      id: 'verification',
      title: 'Community Verification',
      description: 'Multi-tier verification system with reputation scoring and consensus building',
      icon: Shield,
      stats: { value: '95%', label: 'Accuracy Rate' },
      color: 'purple'
    },
    {
      id: 'realtime',
      title: 'Real-time Updates',
      description: 'Live incident updates, status changes, and official responses',
      icon: Zap,
      stats: { value: '<30s', label: 'Avg Update Time' },
      color: 'orange'
    }
  ];

  const systemCapabilities = [
    {
      category: 'Incident Types',
      items: [
        'Fire emergencies',
        'Flood conditions',
        'Infrastructure damage',
        'Traffic accidents',
        'Medical emergencies',
        'Security incidents',
        'Weather events',
        'Environmental hazards'
      ]
    },
    {
      category: 'Evidence Processing',
      items: [
        'Photo/video upload',
        'Audio recordings',
        'GPS location tagging',
        'Timestamp verification',
        'Metadata analysis',
        'Duplicate detection',
        'Quality assessment',
        'Content moderation'
      ]
    },
    {
      category: 'Verification System',
      items: [
        'Community consensus',
        'Expert validation',
        'Cross-reference checking',
        'Reputation weighting',
        'False report detection',
        'Bias mitigation',
        'Quality scoring',
        'Trust metrics'
      ]
    },
    {
      category: 'Real-time Features',
      items: [
        'Live incident feed',
        'Push notifications',
        'Status updates',
        'Location-based alerts',
        'Response coordination',
        'Resource deployment',
        'Evacuation routing',
        'Emergency broadcasts'
      ]
    }
  ];

  const renderOverview = () => (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl p-8">
        <AlertTriangle className="mx-auto h-16 w-16 mb-4" />
        <h2 className="text-3xl font-bold mb-4">Community Reporting System</h2>
        <p className="text-xl opacity-90 max-w-3xl mx-auto">
          Empowering citizens to report incidents with photo/video evidence, 
          community verification, and real-time updates for enhanced emergency response
        </p>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {demoFeatures.map(feature => (
          <div
            key={feature.id}
            className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => setActiveDemo(feature.id)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-lg bg-${feature.color}-100`}>
                <feature.icon className={`w-6 h-6 text-${feature.color}-600`} />
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">{feature.stats.value}</p>
                <p className="text-sm text-gray-600">{feature.stats.label}</p>
              </div>
            </div>
            
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
            <p className="text-gray-600">{feature.description}</p>
            
            <div className="mt-4 flex items-center text-blue-600 text-sm font-medium">
              <Eye className="w-4 h-4 mr-1" />
              View Details
            </div>
          </div>
        ))}
      </div>

      {/* Statistics Dashboard */}
      {analytics && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">System Performance (24h)</h3>
            <RefreshCw 
              className={`w-5 h-5 text-gray-500 cursor-pointer hover:text-blue-600 ${loading ? 'animate-spin' : ''}`}
              onClick={loadDemoData}
            />
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Activity className="mx-auto w-8 h-8 text-blue-600 mb-2" />
              <p className="text-2xl font-bold text-gray-900">{analytics.totalReports}</p>
              <p className="text-sm text-gray-600">Reports Submitted</p>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <CheckCircle className="mx-auto w-8 h-8 text-green-600 mb-2" />
              <p className="text-2xl font-bold text-gray-900">{analytics.verifiedReports}</p>
              <p className="text-sm text-gray-600">Community Verified</p>
            </div>
            
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <Clock className="mx-auto w-8 h-8 text-orange-600 mb-2" />
              <p className="text-2xl font-bold text-gray-900">{Math.round(analytics.averageVerificationTime)}m</p>
              <p className="text-sm text-gray-600">Avg Verification</p>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <Shield className="mx-auto w-8 h-8 text-purple-600 mb-2" />
              <p className="text-2xl font-bold text-gray-900">{Math.round(analytics.responseMetrics.responseRate)}%</p>
              <p className="text-sm text-gray-600">Response Rate</p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Navigation */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Explore Components</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => onNavigate?.('CommunityReportingDashboard')}
            className="p-4 text-left border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
          >
            <MessageSquare className="w-6 h-6 text-blue-600 mb-2" />
            <h4 className="font-semibold text-gray-900">Reporting Dashboard</h4>
            <p className="text-sm text-gray-600">Submit and manage incident reports</p>
          </button>
          
          <button
            onClick={() => onNavigate?.('VerificationCenter')}
            className="p-4 text-left border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
          >
            <Shield className="w-6 h-6 text-purple-600 mb-2" />
            <h4 className="font-semibold text-gray-900">Verification Center</h4>
            <p className="text-sm text-gray-600">Community verification and validation</p>
          </button>
          
          <button
            onClick={() => onNavigate?.('IncidentMap')}
            className="p-4 text-left border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
          >
            <MapPin className="w-6 h-6 text-green-600 mb-2" />
            <h4 className="font-semibold text-gray-900">Incident Map</h4>
            <p className="text-sm text-gray-600">Real-time incident visualization</p>
          </button>
        </div>
      </div>
    </div>
  );

  const renderFeatureDetail = (featureId: string) => {
    const feature = demoFeatures.find(f => f.id === featureId);
    if (!feature) return null;

    const capabilities = systemCapabilities.find(c => 
      c.category.toLowerCase().includes(featureId) || 
      featureId.includes(c.category.toLowerCase())
    );

    return (
      <div className="space-y-6">
        <button
          onClick={() => setActiveDemo('overview')}
          className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
        >
          <Navigation className="w-4 h-4 mr-2 rotate-180" />
          Back to Overview
        </button>

        <div className={`bg-gradient-to-r from-${feature.color}-600 to-${feature.color}-800 text-white rounded-xl p-8`}>
          <div className="flex items-center gap-4 mb-4">
            <div className={`p-4 rounded-lg bg-${feature.color}-500 bg-opacity-50`}>
              <feature.icon className="w-12 h-12" />
            </div>
            <div>
              <h2 className="text-3xl font-bold">{feature.title}</h2>
              <p className="text-xl opacity-90">{feature.description}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className={`bg-${feature.color}-500 bg-opacity-50 rounded-lg p-4`}>
              <p className="text-3xl font-bold">{feature.stats.value}</p>
              <p className="text-sm opacity-90">{feature.stats.label}</p>
            </div>
            <div className={`bg-${feature.color}-500 bg-opacity-50 rounded-lg p-4`}>
              <p className="text-3xl font-bold">24/7</p>
              <p className="text-sm opacity-90">System Uptime</p>
            </div>
          </div>
        </div>

        {/* Feature-specific content */}
        {featureId === 'crowdsourced' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Crowdsourced Reporting Process</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">1</div>
                <div>
                  <h4 className="font-semibold text-gray-900">Incident Detection</h4>
                  <p className="text-gray-600">Citizens observe and decide to report incidents in their area</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">2</div>
                <div>
                  <h4 className="font-semibold text-gray-900">Report Submission</h4>
                  <p className="text-gray-600">Quick form with incident type, severity, location, and description</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">3</div>
                <div>
                  <h4 className="font-semibold text-gray-900">Evidence Upload</h4>
                  <p className="text-gray-600">Optional photo/video evidence with automatic metadata extraction</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">4</div>
                <div>
                  <h4 className="font-semibold text-gray-900">Community Review</h4>
                  <p className="text-gray-600">Other users verify and validate the reported incident</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {featureId === 'verification' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Multi-Tier Verification System</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Verification Levels</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Star className="w-5 h-5 text-yellow-500" />
                    <div>
                      <p className="font-medium">Community Consensus</p>
                      <p className="text-sm text-gray-600">Multiple user verifications</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Award className="w-5 h-5 text-purple-500" />
                    <div>
                      <p className="font-medium">Expert Validation</p>
                      <p className="text-sm text-gray-600">Subject matter expert review</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-green-500" />
                    <div>
                      <p className="font-medium">Official Confirmation</p>
                      <p className="text-sm text-gray-600">Authority verification</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Quality Metrics</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Accuracy Rate</span>
                    <span className="font-semibold">95.2%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">False Positive Rate</span>
                    <span className="font-semibold">2.8%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Avg Verification Time</span>
                    <span className="font-semibold">8.5 min</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Community Participation</span>
                    <span className="font-semibold">78%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* System capabilities */}
        {capabilities && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">{capabilities.category} Capabilities</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {capabilities.items.map((item, index) => (
                <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Globe className="w-6 h-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Community Reporting System Demo</h1>
        </div>
        <p className="text-gray-600">
          Explore our comprehensive crowdsourced incident reporting platform with photo/video evidence, 
          community verification, and real-time updates
        </p>
      </div>

      {activeDemo === 'overview' ? renderOverview() : renderFeatureDetail(activeDemo)}
    </div>
  );
};

export default CommunityReportingDemo;
