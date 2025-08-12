/**
 * Community Verification Center
 * Interface for users to verify and validate incident reports
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Shield, CheckCircle, XCircle, AlertTriangle, Eye,
  MessageSquare, Star, Clock, MapPin, Camera,
  Video, Mic, Flag, Award, Users, TrendingUp
} from 'lucide-react';
import CommunityReportingService, { 
  IncidentReport
} from '../services/CommunityReportingService';

interface VerificationCenterProps {
  userId: string;
  userName: string;
  userReputation?: number;
}

export const VerificationCenter: React.FC<VerificationCenterProps> = ({
  userId,
  userName,
  userReputation = 100
}) => {
  const [pendingReports, setPendingReports] = useState<IncidentReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<IncidentReport | null>(null);
  const [verificationForm, setVerificationForm] = useState({
    status: 'confirmed' as 'confirmed' | 'disputed' | 'needs_clarification' | 'false_report',
    confidence: 75,
    comments: '',
    evidence: ''
  });
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');

  const reportingService = CommunityReportingService.getInstance();

  const loadPendingReports = useCallback(async () => {
    setLoading(true);
    try {
      const reports = await reportingService.getReports({
        verificationStatus: filter === 'all' ? undefined : [filter],
        limit: 20,
        sortBy: 'priority'
      });

      // Filter out reports the user has already verified
      const unverifiedReports = reports.filter(report => 
        !report.verifications.some(v => v.verifierId === userId)
      );

      setPendingReports(unverifiedReports);
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
  }, [filter, reportingService, userId]);

  useEffect(() => {
    loadPendingReports();
  }, [loadPendingReports]);

  const handleSubmitVerification = async () => {
    if (!selectedReport) return;

    try {
      await reportingService.submitVerification(selectedReport.id, {
        verifierId: userId,
        verifierName: userName,
        verifierReputation: userReputation,
        status: verificationForm.status,
        confidence: verificationForm.confidence,
        comments: verificationForm.comments,
        evidence: verificationForm.evidence || undefined
      });

      // Remove verified report from pending list
      setPendingReports(prev => prev.filter(r => r.id !== selectedReport.id));
      setSelectedReport(null);
      resetForm();
    } catch (error) {
      console.error('Error submitting verification:', error);
    }
  };

  const resetForm = () => {
    setVerificationForm({
      status: 'confirmed',
      confidence: 75,
      comments: '',
      evidence: ''
    });
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  const getSeverityColor = (severity: string) => {
    const colors = {
      low: 'bg-green-100 text-green-800 border-green-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      high: 'bg-orange-100 text-orange-800 border-orange-200',
      critical: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[severity as keyof typeof colors] || colors.medium;
  };

  const getVerificationStatusColor = (status: string) => {
    const colors = {
      confirmed: 'text-green-600',
      disputed: 'text-orange-600',
      needs_clarification: 'text-blue-600',
      false_report: 'text-red-600'
    };
    return colors[status as keyof typeof colors] || 'text-gray-600';
  };

  const renderReportsList = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Reports Pending Verification</h3>
        <div className="flex items-center gap-2">
          <label htmlFor="report-filter" className="sr-only">
            Filter reports
          </label>
          <select
            id="report-filter"
            aria-label="Filter reports"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Reports</option>
            <option value="pending">Pending</option>
            <option value="needs_more_info">Need More Info</option>
            <option value="disputed">Disputed</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Loading reports...</p>
        </div>
      ) : pendingReports.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <Shield className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-600">No reports pending verification</p>
          <p className="text-sm text-gray-500 mt-1">Check back later for new reports</p>
        </div>
      ) : (
        pendingReports.map(report => (
          <div
            key={report.id}
            className={`bg-white rounded-lg shadow-md p-4 border-l-4 cursor-pointer transition-all hover:shadow-lg ${
              selectedReport?.id === report.id ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-300'
            }`}
            onClick={() => setSelectedReport(report)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-orange-500" />
                  <span className="font-semibold text-gray-900">{report.title}</span>
                  <span className={`px-2 py-1 rounded-full text-xs border ${getSeverityColor(report.severity)}`}>
                    {report.severity}
                  </span>
                </div>

                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{report.description}</p>

                <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatTimeAgo(report.timestamp)}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {report.location.address || 'Location provided'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {report.verifications.length} verifications
                  </span>
                </div>

                {report.evidence.length > 0 && (
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Camera className="w-3 h-3" />
                      {report.evidence.filter(e => e.type === 'photo').length} photos
                    </span>
                    {report.evidence.filter(e => e.type === 'video').length > 0 && (
                      <span className="flex items-center gap-1">
                        <Video className="w-3 h-3" />
                        {report.evidence.filter(e => e.type === 'video').length} videos
                      </span>
                    )}
                    {report.evidence.filter(e => e.type === 'audio').length > 0 && (
                      <span className="flex items-center gap-1">
                        <Mic className="w-3 h-3" />
                        {report.evidence.filter(e => e.type === 'audio').length} audio
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="flex flex-col items-end gap-1">
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium text-blue-600">{Math.round(report.priority)}</span>
                </div>
                <span className="text-xs text-gray-500">Priority</span>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );

  const renderVerificationForm = () => {
    if (!selectedReport) return null;

    return (
      <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="w-6 h-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Verify Report</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Verification Status
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'confirmed', label: 'Confirmed', icon: CheckCircle, color: 'green' },
                { value: 'disputed', label: 'Disputed', icon: XCircle, color: 'red' },
                { value: 'needs_clarification', label: 'Need Info', icon: MessageSquare, color: 'blue' },
                { value: 'false_report', label: 'False Report', icon: Flag, color: 'gray' }
              ].map(option => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setVerificationForm(prev => ({ ...prev, status: option.value as 'confirmed' | 'disputed' | 'needs_clarification' | 'false_report' }))}
                  className={`p-3 border rounded-lg transition-colors flex items-center gap-2 ${
                    verificationForm.status === option.value
                      ? `border-${option.color}-500 bg-${option.color}-50`
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <option.icon className={`w-4 h-4 ${
                    verificationForm.status === option.value ? `text-${option.color}-600` : 'text-gray-500'
                  }`} />
                  <span className="text-sm">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confidence Level: {verificationForm.confidence}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={verificationForm.confidence}
              onChange={(e) => setVerificationForm(prev => ({ ...prev, confidence: parseInt(e.target.value) }))}
              className="w-full"
              placeholder="Select confidence level"
              title="Confidence Level"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Not Confident</span>
              <span>Very Confident</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Comments
            </label>
            <textarea
              value={verificationForm.comments}
              onChange={(e) => setVerificationForm(prev => ({ ...prev, comments: e.target.value }))}
              placeholder="Explain your verification decision..."
              rows={3}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Evidence (Optional)
            </label>
            <input
              type="text"
              value={verificationForm.evidence}
              onChange={(e) => setVerificationForm(prev => ({ ...prev, evidence: e.target.value }))}
              placeholder="Link to additional evidence or information..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex justify-between items-center pt-4 border-t">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Star className="w-4 h-4 text-yellow-500" />
              <span>Your reputation: {userReputation}</span>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setSelectedReport(null)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitVerification}
                disabled={!verificationForm.comments.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                <Shield className="w-4 h-4" />
                Submit Verification
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderReportDetails = () => {
    if (!selectedReport) return null;

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-orange-500" />
            <h3 className="text-xl font-semibold text-gray-900">{selectedReport.title}</h3>
            <span className={`px-3 py-1 rounded-full text-sm border ${getSeverityColor(selectedReport.severity)}`}>
              {selectedReport.severity}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Report Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Reporter:</span>
                  <span>{selectedReport.reporterName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Time:</span>
                  <span>{selectedReport.timestamp.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Type:</span>
                  <span className="capitalize">{selectedReport.incidentType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Priority:</span>
                  <span>{Math.round(selectedReport.priority)}/100</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">Current Verifications</h4>
              {selectedReport.verifications.length === 0 ? (
                <p className="text-sm text-gray-500">No verifications yet</p>
              ) : (
                <div className="space-y-2">
                  {selectedReport.verifications.slice(0, 3).map(verification => (
                    <div key={verification.id} className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">{verification.verifierName}</span>
                      <span className={`font-medium ${getVerificationStatusColor(verification.status)}`}>
                        {verification.status}
                      </span>
                    </div>
                  ))}
                  {selectedReport.verifications.length > 3 && (
                    <p className="text-xs text-gray-500">
                      +{selectedReport.verifications.length - 3} more verifications
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="mb-6">
            <h4 className="font-medium text-gray-900 mb-2">Description</h4>
            <p className="text-gray-700 text-sm leading-relaxed">{selectedReport.description}</p>
          </div>

          {selectedReport.evidence.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Evidence ({selectedReport.evidence.length} files)</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {selectedReport.evidence.map(evidence => (
                  <div key={evidence.id} className="relative">
                    {evidence.type === 'photo' ? (
                      <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                        <img
                          src={evidence.url}
                          alt="Evidence"
                          className="max-w-full max-h-full rounded-lg object-cover"
                        />
                      </div>
                    ) : evidence.type === 'video' ? (
                      <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                        <Video className="w-8 h-8 text-gray-500" />
                      </div>
                    ) : (
                      <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                        <Mic className="w-8 h-8 text-gray-500" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <div className={`w-2 h-2 rounded-full ${
                        evidence.verificationScore > 70 ? 'bg-green-500' :
                        evidence.verificationScore > 40 ? 'bg-yellow-500' : 'bg-red-500'
                      }`} title={`Verification Score: ${evidence.verificationScore}%`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {renderVerificationForm()}
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="w-6 h-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Verification Center</h1>
        </div>
        <p className="text-gray-600">
          Help verify incident reports from the community to ensure accuracy and reliability
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {selectedReport ? renderReportDetails() : renderReportsList()}
        </div>
        
        <div className="lg:col-span-1">
          {!selectedReport && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-center">
                <Eye className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a Report</h3>
                <p className="text-gray-600 text-sm">
                  Choose a report from the list to begin the verification process
                </p>
              </div>
              
              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Your Reputation:</span>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span className="font-semibold">{userReputation}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Verification Level:</span>
                  <span className="font-semibold text-blue-600">
                    {userReputation >= 800 ? 'Expert' : userReputation >= 500 ? 'Trusted' : 'Community'}
                  </span>
                </div>
                
                <div className="pt-4 border-t">
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="w-4 h-4 text-purple-600" />
                    <span className="font-medium text-gray-900">Verification Tips</span>
                  </div>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li>• Check evidence timestamps and location</li>
                    <li>• Look for inconsistencies in details</li>
                    <li>• Consider multiple perspectives</li>
                    <li>• Provide constructive comments</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerificationCenter;
