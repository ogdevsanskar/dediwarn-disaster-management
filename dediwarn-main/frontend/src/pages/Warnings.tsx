import React, { useState } from 'react';
import { Search, Filter, AlertTriangle, MapPin, Clock, ExternalLink, Eye, Share2 } from 'lucide-react';

interface Warning {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  location: string;
  timestamp: string;
  txHash: string;
  issuer: string;
  views: number;
  shares: number;
}

export const Warnings: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [selectedWarning, setSelectedWarning] = useState<Warning | null>(null);
  
  const warnings: Warning[] = [
    {
      id: '1',
      title: 'Severe Thunderstorm Warning',
      description: 'Heavy rain, strong winds, and hail expected in the area. Seek indoor shelter immediately. Avoid travel if possible.',
      severity: 'high',
      location: 'San Francisco, CA',
      timestamp: '2024-01-15 18:30:00',
      txHash: '0x1a2b3c4d5e6f7890abcdef1234567890abcdef12',
      issuer: '0x742d35Cc6665C0532846b18b4A7b283c42c8A52f',
      views: 1247,
      shares: 89
    },
    {
      id: '2',
      title: 'Road Construction Alert',
      description: 'Main Street will be closed for emergency repairs. Use alternate routes. Expected completion by 6 PM.',
      severity: 'medium',
      location: 'New York, NY',
      timestamp: '2024-01-15 17:45:00',
      txHash: '0x2b3c4d5e6f7890abcdef1234567890abcdef1234',
      issuer: '0x8a3e45Bb7429c1234567890abcdef1234567890',
      views: 856,
      shares: 34
    },
    {
      id: '3',
      title: 'Emergency Services Disruption',
      description: 'Fire department responding to major incident. Emergency response times may be delayed. Call 911 for emergencies.',
      severity: 'critical',
      location: 'London, UK',
      timestamp: '2024-01-15 19:15:00',
      txHash: '0x3c4d5e6f7890abcdef1234567890abcdef123456',
      issuer: '0x9b4f56Cc8540d345678901bcdef234567890abcd',
      views: 2341,
      shares: 156
    },
    {
      id: '4',
      title: 'Air Quality Advisory',
      description: 'Elevated pollution levels detected. Sensitive individuals should limit outdoor activities. Use air purifiers indoors.',
      severity: 'low',
      location: 'Los Angeles, CA',
      timestamp: '2024-01-15 16:20:00',
      txHash: '0x4d5e6f7890abcdef1234567890abcdef12345678',
      issuer: '0xa5c67Dd9651e456789012cdef345678901bcdef2',
      views: 634,
      shares: 23
    }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'border-l-green-500 bg-green-500/10';
      case 'medium': return 'border-l-yellow-500 bg-yellow-500/10';
      case 'high': return 'border-l-orange-500 bg-orange-500/10';
      case 'critical': return 'border-l-red-500 bg-red-500/10';
      default: return 'border-l-slate-500 bg-slate-500/10';
    }
  };

  const getSeverityIcon = (severity: string) => {
    const baseClasses = "h-5 w-5";
    switch (severity) {
      case 'low': return <AlertTriangle className={`${baseClasses} text-green-400`} />;
      case 'medium': return <AlertTriangle className={`${baseClasses} text-yellow-400`} />;
      case 'high': return <AlertTriangle className={`${baseClasses} text-orange-400`} />;
      case 'critical': return <AlertTriangle className={`${baseClasses} text-red-400`} />;
      default: return <AlertTriangle className={`${baseClasses} text-slate-400`} />;
    }
  };

  const filteredWarnings = warnings.filter(warning => {
    const matchesSearch = warning.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         warning.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         warning.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = selectedSeverity === 'all' || warning.severity === selectedSeverity;
    return matchesSearch && matchesSeverity;
  });

  return (
    <div className="min-h-screen pt-8 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in-up">
          <h1 className="text-4xl font-bold text-white mb-4">Live Warning Feed</h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Real-time warnings verified on the blockchain with complete transparency
          </p>
        </div>

        {/* Search and Filter */}
        <div className="bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-slate-700 mb-8 animate-fade-in-up animation-delay-01s">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search warnings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            <div className="relative">
              <label htmlFor="severity-select" className="sr-only">Filter by severity</label>
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
              <select
                id="severity-select"
                value={selectedSeverity}
                onChange={(e) => setSelectedSeverity(e.target.value)}
                className="pl-10 pr-8 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none min-w-[150px] transition-all duration-200"
              >
                <option value="all">All Severities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>
        </div>

        {/* Warning Cards */}
        <div className="space-y-6">
          {filteredWarnings.map((warning, index) => (
            <div
              key={warning.id}
              className={`bg-slate-800/60 backdrop-blur-sm rounded-2xl border-l-4 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-slate-700 hover:border-slate-600 card-hover animate-fade-in-up ${getSeverityColor(warning.severity)} delay-${index}`}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {getSeverityIcon(warning.severity)}
                    <h3 className="text-xl font-semibold text-white">{warning.title}</h3>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full uppercase ${
                      warning.severity === 'critical' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                      warning.severity === 'high' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                      warning.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                      'bg-green-500/20 text-green-400 border border-green-500/30'
                    }`}>
                      {warning.severity}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => setSelectedWarning(warning)}
                      className="text-slate-400 hover:text-blue-400 transition-colors p-2 hover:bg-slate-700 rounded-lg"
                    >
                      <Eye className="h-5 w-5" />
                    </button>
                    <button className="text-slate-400 hover:text-blue-400 transition-colors p-2 hover:bg-slate-700 rounded-lg">
                      <Share2 className="h-5 w-5" />
                    </button>
                    <button className="text-slate-400 hover:text-blue-400 transition-colors p-2 hover:bg-slate-700 rounded-lg">
                      <ExternalLink className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <p className="text-slate-300 mb-6 leading-relaxed">{warning.description}</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="flex items-center space-x-2 text-sm text-slate-400">
                    <MapPin className="h-4 w-4" />
                    <span>{warning.location}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-slate-400">
                    <Clock className="h-4 w-4" />
                    <span>{new Date(warning.timestamp).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-slate-400">
                    <div className="h-4 w-4 bg-blue-500 rounded-full flex items-center justify-center">
                      <div className="h-2 w-2 bg-white rounded-full animate-pulse"></div>
                    </div>
                    <span>Verified on blockchain</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600 flex-1 mr-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-slate-300">Transaction Hash:</span>
                        <code className="block mt-1 text-xs bg-slate-800 px-2 py-1 rounded border border-slate-600 font-mono text-blue-400 break-all">
                          {warning.txHash}
                        </code>
                      </div>
                      <div>
                        <span className="font-medium text-slate-300">Issued by:</span>
                        <code className="block mt-1 text-xs bg-slate-800 px-2 py-1 rounded border border-slate-600 font-mono text-blue-400 break-all">
                          {warning.issuer}
                        </code>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-slate-400">
                    <div className="flex items-center space-x-1">
                      <Eye className="h-4 w-4" />
                      <span>{warning.views}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Share2 className="h-4 w-4" />
                      <span>{warning.shares}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredWarnings.length === 0 && (
          <div className="text-center py-12 animate-fade-in-up">
            <AlertTriangle className="h-12 w-12 text-slate-500 mx-auto mb-4" />
            <p className="text-slate-400 text-lg">No warnings match your search criteria</p>
          </div>
        )}

        {/* Warning Detail Modal */}
        {selectedWarning && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-scale-in">
            <div className="bg-slate-800 rounded-2xl border border-slate-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-slate-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-white">Warning Details</h2>
                  <button 
                    onClick={() => setSelectedWarning(null)}
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    ×
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  {getSeverityIcon(selectedWarning.severity)}
                  <h3 className="text-lg font-semibold text-white">{selectedWarning.title}</h3>
                </div>
                <p className="text-slate-300 mb-6">{selectedWarning.description}</p>
                <div className="space-y-4">
                  <div>
                    <span className="text-slate-400">Location:</span>
                    <span className="text-white ml-2">{selectedWarning.location}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Timestamp:</span>
                    <span className="text-white ml-2">{selectedWarning.timestamp}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Transaction Hash:</span>
                    <code className="block mt-1 text-xs bg-slate-700 px-2 py-1 rounded font-mono text-blue-400">
                      {selectedWarning.txHash}
                    </code>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};