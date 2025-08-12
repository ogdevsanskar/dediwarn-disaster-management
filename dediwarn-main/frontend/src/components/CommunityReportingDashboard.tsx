/**
 * Community Reporting Dashboard
 * Interface for crowdsourced incident reporting with real-time updates
 */

import React, { useState, useEffect, useCallback } from 'react';
import CommunityReportingService, { 
  IncidentReport, 
  IncidentUpdate,
  MediaEvidence, 
  CommunityVerification,
  ReportingAnalytics
} from '../services/CommunityReportingService';
import { 
  AlertTriangle,    // Warning/alert icon
  MapPin,          // Location marker
  Users,           // Community/people
  // MessageSquare,   // Reports/messages
  Shield,          // Safety/security
  Clock,           // Time/timestamps
  // Phone            // Emergency contact
} from 'lucide-react';

interface CommunityReportingDashboardProps {
  userLocation?: { lat: number; lng: number };
  userId: string;
  userName: string;
}

export const CommunityReportingDashboard: React.FC<CommunityReportingDashboardProps> = ({
  userLocation}) => {
  const [activeTab, setActiveTab] = useState('reports');
  const [reports, setReports] = useState<IncidentReport[]>([]);
  const [analytics, setAnalytics] = useState<ReportingAnalytics | null>(null);
  const [showReportForm, setShowReportForm] = useState(false);
  const [loading, setLoading] = useState(false);

  // Report form state
  const [reportForm, setReportForm] = useState({
    incidentType: 'other' as IncidentReport['incidentType'],
    severity: 'medium' as IncidentReport['severity'],
    title: '',
    description: '',
    tags: [] as string[],
    location: userLocation
      ? { ...userLocation, accuracy: 0 }
      : { lat: 0, lng: 0, accuracy: 0 },
    visibility: 'public' as IncidentReport['visibility']
  });

  // Evidence upload state
  // Removed unused evidenceFiles state

  // Filter state
  const [filters] = useState({
    incidentTypes: [] as string[],
    severity: [] as string[],
    verificationStatus: [] as string[],
    radius: 10, // km
    timeframe: 'day' as 'hour' | 'day' | 'week' | 'month'
  });

  const reportingService = CommunityReportingService.getInstance();

  const loadReports = useCallback(async () => {
    setLoading(true);
    try {
      const loadedReports = await reportingService.getReports({
        location: userLocation ? { ...userLocation, radius: filters.radius * 1000 } : undefined,
        incidentTypes: filters.incidentTypes.length > 0 ? filters.incidentTypes : undefined,
        severity: filters.severity.length > 0 ? filters.severity : undefined,
        verificationStatus: filters.verificationStatus.length > 0 ? filters.verificationStatus : undefined,
        limit: 50,
        sortBy: 'timestamp'
      });
      setReports(loadedReports);
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
  }, [reportingService, userLocation, filters]);

  const loadAnalytics = useCallback(async () => {
    try {
      const analyticsData = await reportingService.getAnalytics(filters.timeframe);
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  }, [reportingService, filters.timeframe]);

  // Real-time event handlers
  const handleNewReport = useCallback((data: unknown) => {
    const report = data as IncidentReport;
    setReports(prev => [report, ...prev]);
  }, []);

  const handleReportUpdate = useCallback((data: unknown) => {
    const updateData = data as { reportId: string; update: IncidentUpdate };
    setReports(prev => prev.map(report => 
      report.id === updateData.reportId 
        ? { ...report, updates: [...report.updates, updateData.update] }
        : report
    ));
  }, []);

  const handleVerificationAdded = useCallback((data: unknown) => {
    const verificationData = data as { reportId: string; verification: CommunityVerification };
    setReports(prev => prev.map(report => 
      report.id === verificationData.reportId 
        ? { ...report, verifications: [...report.verifications, verificationData.verification] }
        : report
    ));
  }, []);

  const handleEvidenceProcessed = useCallback((data: unknown) => {
    const evidenceData = data as { reportId: string; evidenceId: string; mediaEvidence: MediaEvidence };
    setReports(prev => prev.map(report => 
      report.id === evidenceData.reportId 
        ? { 
            ...report, 
            evidence: report.evidence.map(ev => 
              ev.id === evidenceData.evidenceId ? evidenceData.mediaEvidence : ev
            )
          }
        : report
    ));
  }, []);

  // Load initial data
  useEffect(() => {
    loadReports();
    loadAnalytics();
    
    // Set up real-time event listeners
    reportingService.addEventListener('new_report', handleNewReport);
    reportingService.addEventListener('report_updated', handleReportUpdate);
    reportingService.addEventListener('verification_added', handleVerificationAdded);
    reportingService.addEventListener('evidence_processed', handleEvidenceProcessed);

    return () => {
      reportingService.removeEventListener('new_report', handleNewReport);
      reportingService.removeEventListener('report_updated', handleReportUpdate);
      reportingService.removeEventListener('verification_added', handleVerificationAdded);
      reportingService.removeEventListener('evidence_processed', handleEvidenceProcessed);
    };
  }, [loadReports, loadAnalytics, handleNewReport, handleReportUpdate, handleVerificationAdded, handleEvidenceProcessed, reportingService]);

  // Submit new report
  const handleSubmitReport = async () => {
    // Validate and submit the report
    // Reset the form on success
  };

  // Handle file uploads
  const handleFileChange = () => {
    // Evidence file handling logic can be implemented here if needed
  };

  // Removed unused removeFile function

  // Submit verification
  // const handleSubmitVerification = async (reportId: string, status: 'confirmed' | 'disputed', confidence: number, comments: string) => {
  //   try {
  //     await reportingService.submitVerification(reportId, {
  //       verifierId: userId,
  //       verifierName: userName,
  //       verifierReputation: 100, // Get from user profile
  //       status,
  //       confidence,
  //       comments
  //     });
  //   } catch (error) {
  //     console.error('Error submitting verification:', error);
  //   }
  // };

  const renderReportForm = () => (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Submit a New Report</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label htmlFor="incidentType" className="block text-sm font-medium text-gray-700 mb-1">
            Incident Type
          </label>
          <select
            id="incidentType"
            value={reportForm.incidentType}
            onChange={e => setReportForm({ ...reportForm, incidentType: e.target.value as IncidentReport['incidentType'] })}
            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="other">Other</option>
            <option value="theft">Theft</option>
            <option value="vandalism">Vandalism</option>
            <option value="assault">Assault</option>
            <option value="emergency">Emergency</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="severity" className="block text-sm font-medium text-gray-700 mb-1">
            Severity
          </label>
          <select
            id="severity"
            value={reportForm.severity}
            onChange={e => setReportForm({ ...reportForm, severity: e.target.value as IncidentReport['severity'] })}
            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Title
        </label>
        <input
          type="text"
          value={reportForm.title}
          onChange={e => setReportForm({ ...reportForm, title: e.target.value })}
          className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          placeholder="Brief title of the incident"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          value={reportForm.description}
          onChange={e => setReportForm({ ...reportForm, description: e.target.value })}
          className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          rows={4}
          placeholder="Detailed description of the incident"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Location
          </label>
          <input
            type="text"
            value={reportForm.location.lat !== 0 && reportForm.location.lng !== 0 ? `${reportForm.location.lat}, ${reportForm.location.lng}` : ''}
            onChange={e => {
              const [lat, lng] = e.target.value.split(',').map(coord => parseFloat(coord.trim()));
              setReportForm({ 
                ...reportForm, 
                location: { lat: !isNaN(lat) ? lat : 0, lng: !isNaN(lng) ? lng : 0, accuracy: 0 } 
              });
            }}
            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            placeholder="Latitude, Longitude"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Visibility
          </label>
          <label htmlFor="visibility" className="block text-sm font-medium text-gray-700 mb-1">
            Visibility
          </label>
          <select
            id="visibility"
            value={reportForm.visibility}
            onChange={e => setReportForm({ ...reportForm, visibility: e.target.value as IncidentReport['visibility'] })}
            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="public">Public</option>
            <option value="private">Private</option>
          </select>
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tags (comma-separated)
        </label>
        <input
          type="text"
          value={reportForm.tags.join(', ')}
          onChange={e => setReportForm({ ...reportForm, tags: e.target.value.split(',').map(tag => tag.trim()) })}
          className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          placeholder="e.g. flood, emergency"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Evidence (optional)
        </label>
        <input
          type="file"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500
          file:mr-4 file:py-2 file:px-4
          file:rounded-md file:border-0
          file:bg-blue-600 file:text-white
          hover:file:bg-blue-700
          focus:ring-blue-500 focus:border-blue-500"
          multiple
          placeholder="Upload evidence files"
          title="Upload evidence files"
        />
      </div>

      <div className="flex justify-end gap-4">
        <button
          onClick={() => setShowReportForm(false)}
          className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
        >
          Cancel
        </button>
        
        <button
          onClick={handleSubmitReport}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <AlertTriangle className="w-4 h-4" />
          Submit Report
        </button>
      </div>
    </div>
  );

  const renderReportsList = () => (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Community Reports</h2>
      
      {loading ? (
        <div className="text-center py-4">
          <span className="loader"></span>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.length === 0 ? (
            <p className="text-center text-gray-500 py-4">No reports found.</p>
          ) : (
            reports.map(report => (
              <div key={report.id} className="border rounded-lg p-4 flex flex-col sm:flex-row gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-full bg-blue-100">
                      {getPriorityIcon(String(report.priority))}
                    </div>
                    
                    <div className="p-2 rounded-full bg-green-100">
                      {getStatusIcon(String(report.status))}
                    </div>
                  </div>
                </div>
                
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{report.title || 'Untitled Report'}</h3>
                  <p className="text-gray-700">{report.description}</p>
                  
                  <div className="mt-2 flex flex-col sm:flex-row gap-2">
                    <span className="text-sm text-gray-500 flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {`${report.location.lat}, ${report.location.lng}`}
                    </span>
                    
                    <span className="text-sm text-gray-500 flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {new Date(report.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );

  const renderAnalytics = () => (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Reporting Analytics</h2>
      
      {analytics ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Total Reports</h3>
            <p className="text-3xl font-bold text-blue-600">{analytics.totalReports}</p>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-green-900 mb-2">Verified Reports</h3>
            <p className="text-3xl font-bold text-green-600">{analytics.verifiedReports}</p>
          </div>
          
          <div className="bg-red-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-red-900 mb-2">Rejected Reports</h3>
            <p className="text-3xl font-bold text-red-600">{analytics.rejectedReports}</p>
          </div>
          
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-yellow-900 mb-2">Pending Verification</h3>
            <p className="text-3xl font-bold text-yellow-600">{analytics.pendingReports}</p>
          </div>
        </div>
      ) : (
        <p className="text-center text-gray-500 py-4">No analytics data available.</p>
      )}
    </div>
  );

  // Helper to get priority icon
  function getPriorityIcon(priority: string) {
    switch (priority) {
      case 'high':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'medium':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'low':
        return <AlertTriangle className="w-4 h-4 text-green-600" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-400" />;
    }
  }

  // Helper to get status icon
  function getStatusIcon(status: string) {
    switch (status) {
      case 'verified':
        return <Shield className="w-4 h-4 text-green-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'rejected':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default:
        return <Users className="w-4 h-4 text-gray-400" />;
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md mb-6">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Community Reporting</h1>
              <p className="text-gray-600">Crowdsourced incident reporting with real-time verification</p>
            </div>
            
            {!showReportForm && (
              <button
                onClick={() => setShowReportForm(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <AlertTriangle className="w-4 h-4" />
                Report Incident
              </button>
            )}
          </div>
        </div>
        
        <div className="flex border-b">
          {[
            { id: 'reports', label: 'Recent Reports', icon: Users },
            { id: 'analytics', label: 'Analytics', icon: Shield },
            { id: 'map', label: 'Incident Map', icon: MapPin }
          ].map((tab: { id: string; label: string; icon: React.ElementType }) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                activeTab === tab.id 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {React.createElement(tab.icon, { className: "w-4 h-4" })}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {showReportForm && renderReportForm()}
      
{activeTab === 'reports' && renderReportsList()}
{activeTab === 'analytics' && renderAnalytics()}
      {activeTab === 'map' && (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <MapPin className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Interactive Incident Map</h3>
          <p className="text-gray-600">Real-time visualization of reported incidents in your area</p>
          <p className="text-sm text-gray-500 mt-2">Map integration coming soon</p>
        </div>
      )}
    </div>
  );
};

export default CommunityReportingDashboard;
