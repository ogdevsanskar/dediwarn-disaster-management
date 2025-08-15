import React, { useState } from 'react';
import { Plus, AlertCircle, CheckCircle, Clock, TrendingUp, Activity, Globe } from 'lucide-react';
import { StatsCard } from './StatsCard';
import { AlertDetailModal } from './AlertDetailModal';
import { IncidentReportForm } from './IncidentReportForm';
import { EmergencyResourceTracker } from './EmergencyResourceTracker';

interface Warning {
  id: string;
  title: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'resolved' | 'pending';
  timestamp: string;
  location: string;
  txHash: string;
}

export const Dashboard: React.FC = () => {
  const [warnings] = useState<Warning[]>([
    {
      id: '1',
      title: 'Severe Weather Alert',
      severity: 'high',
      status: 'active',
      timestamp: '2024-01-15 14:30',
      location: 'California, USA',
      txHash: '0x1234...abcd'
    },
    {
      id: '2',
      title: 'Traffic Disruption',
      severity: 'medium',
      status: 'resolved',
      timestamp: '2024-01-15 12:15',
      location: 'New York, USA',
      txHash: '0x5678...efgh'
    },
    {
      id: '3',
      title: 'Emergency Services Alert',
      severity: 'critical',
      status: 'active',
      timestamp: '2024-01-15 16:45',
      location: 'London, UK',
      txHash: '0x9abc...ijkl'
    }
  ]);

  // Emergency features state
  const [selectedAlert, setSelectedAlert] = useState<Warning | null>(null);
  const [showIncidentReport, setShowIncidentReport] = useState(false);
  const [showResourceTracker, setShowResourceTracker] = useState(false);
  const [userLocation] = useState({ lat: 37.7749, lng: -122.4194 }); // Default to San Francisco

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-success bg-opacity-10 text-success border-success border-opacity-30';
      case 'medium': return 'bg-warning bg-opacity-10 text-warning border-warning border-opacity-30';
      case 'high': return 'bg-accent bg-opacity-10 text-accent border-accent border-opacity-30';
      case 'critical': return 'bg-error bg-opacity-10 text-error border-error border-opacity-30';
      default: return 'bg-textSecondary bg-opacity-10 text-textSecondary border-textSecondary border-opacity-30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <AlertCircle className="h-4 w-4 text-error animate-pulse" />;
      case 'resolved': return <CheckCircle className="h-4 w-4 text-success" />;
      case 'pending': return <Clock className="h-4 w-4 text-warning animate-spin" />;
      default: return <Clock className="h-4 w-4 text-textSecondary" />;
    }
  };

  return (
    <section id="dashboard" className="py-20 bg-background relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-12 animate-fade-in-up">
          <div>
            <h2 className="text-4xl font-bold text-text mb-2">Warning Dashboard</h2>
            <p className="text-textSecondary">Monitor and manage blockchain-verified warnings</p>
          </div>
          <button className="group bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-opacity-90 transform hover:scale-105 transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-2xl">
            <Plus className="h-5 w-5 group-hover:rotate-90 transition-transform duration-200" />
            <span>Create Warning</span>
          </button>
        </div>

        {/* Stats Grid */}
          <div className="animate-fade-in-up delay-1">
            <StatsCard
              title="Total Warnings"
              value="1,247"
              change="+12% from last month"
              changeType="positive"
              icon={TrendingUp}
            />
          </div>
          
          <div className="animate-fade-in-up delay-2">
            <StatsCard
              title="Active Warnings"
              value="23"
              change="2 critical alerts"
              changeType="negative"
              icon={AlertCircle}
              gradient
            />
          </div>
          
          <div className="animate-fade-in-up delay-3">
            <StatsCard
              title="Network Nodes"
              value="2,500"
              change="+5% uptime"
              changeType="positive"
              icon={Globe}
            />
          </div>
          
          <div className="animate-fade-in-up delay-4">
            <StatsCard
              title="Response Time"
              value="<15s"
              change="99.9% reliability"
              changeType="positive"
              icon={Activity}
            />
          </div>
        {/* Warnings Table */}
        <div className="bg-surface rounded-2xl shadow-xl border border-border overflow-hidden animate-fade-in-up dashboard-animation-delay">
          <div className="px-6 py-4 border-b border-border bg-gradient-to-r from-primary to-secondary">
            <h3 className="text-lg font-semibold text-white">Recent Warnings</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-background">
                <tr>
                  {['Warning', 'Severity', 'Status', 'Location', 'Tx Hash', 'Timestamp', 'Actions'].map((header) => (
                    <th key={header} className="px-6 py-4 text-left text-xs font-medium text-textSecondary uppercase tracking-wider">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {warnings.map((warning, index) => (
                  <tr 
                    key={warning.id} 
                    className={`hover:bg-background transition-colors group animate-slide-in-left animation-delay-${index}`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-text group-hover:text-primary transition-colors">
                        {warning.title}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${getSeverityColor(warning.severity)}`}>
                        {warning.severity}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(warning.status)}
                        <span className="text-sm text-text capitalize">{warning.status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text">{warning.location}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <code className="text-xs bg-background px-2 py-1 rounded font-mono text-primary border border-border">
                        {warning.txHash}
                      </code>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-textSecondary">{warning.timestamp}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => setSelectedAlert(warning)}
                        className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
                      >
                        View More
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Emergency Action Buttons */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <button
            onClick={() => setShowIncidentReport(true)}
            className="bg-red-600 hover:bg-red-700 text-white p-6 rounded-xl border border-red-500/20 transition-all duration-300 hover:shadow-lg hover:shadow-red-500/20"
          >
            <Plus className="h-8 w-8 mx-auto mb-2" />
            <h3 className="text-lg font-semibold mb-2">Report Emergency</h3>
            <p className="text-sm text-red-100">Report incidents with AI classification</p>
          </button>
          
          <button
            onClick={() => setShowResourceTracker(!showResourceTracker)}
            className="bg-blue-600 hover:bg-blue-700 text-white p-6 rounded-xl border border-blue-500/20 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20"
          >
            <Activity className="h-8 w-8 mx-auto mb-2" />
            <h3 className="text-lg font-semibold mb-2">Track Resources</h3>
            <p className="text-sm text-blue-100">Real-time emergency services tracking</p>
          </button>
          
          <button
            onClick={() => navigator.geolocation?.getCurrentPosition(
              (position) => {
                const { latitude, longitude } = position.coords;
                const mapsUrl = `https://www.google.com/maps/@${latitude},${longitude},15z`;
                window.open(mapsUrl, '_blank');
              },
              (error) => {
                console.error('Error getting location:', error);
                alert('Location access denied. Please enable location services.');
              }
            )}
            className="bg-green-600 hover:bg-green-700 text-white p-6 rounded-xl border border-green-500/20 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/20"
          >
            <Globe className="h-8 w-8 mx-auto mb-2" />
            <h3 className="text-lg font-semibold mb-2">Emergency Map</h3>
            <p className="text-sm text-green-100">View nearby emergency services</p>
          </button>
        </div>

        {/* Emergency Resource Tracker */}
        {showResourceTracker && (
          <div className="mt-8">
            <EmergencyResourceTracker userLocation={userLocation} />
          </div>
        )}
      </div>

      {/* Emergency Modals */}
      {selectedAlert && (
        <AlertDetailModal
          alertId={selectedAlert.id}
          isOpen={true}
          onClose={() => setSelectedAlert(null)}
        />
      )}

      {showIncidentReport && (
        <IncidentReportForm
          onSubmit={(data) => {
            console.log('Incident report submitted:', data);
            setShowIncidentReport(false);
            // Here you would typically send the data to your backend
          }}
          onCancel={() => setShowIncidentReport(false)}
        />
      )}
    </section>
  );
};