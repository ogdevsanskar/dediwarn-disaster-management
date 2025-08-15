import React, { useState } from 'react';
import { Plus, AlertCircle, CheckCircle, Clock, TrendingUp, Activity, Users, Globe, Filter, Search, Phone, Camera, MapPin, Download, Share2, RefreshCw, Settings, Bell, Eye } from 'lucide-react';
import { EnhancedButton, initializeButtonFunctionality } from '../components/ButtonFunctionality';
import './Dashboard.css';

// Initialize button functionality
initializeButtonFunctionality();

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
  const [warnings, setWarnings] = useState<Warning[]>([
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

  const [searchTerm, setSearchTerm] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [loading, setLoading] = useState(false);

  // Button action handlers
  const handleCreateWarning = () => {
    const newWarning: Warning = {
      id: Date.now().toString(),
      title: `New Warning ${Date.now()}`,
      severity: 'medium',
      status: 'pending',
      timestamp: new Date().toLocaleString(),
      location: 'Current Location',
      txHash: `0x${Math.random().toString(16).substr(2, 8)}...${Math.random().toString(16).substr(2, 4)}`
    };
    setWarnings(prev => [newWarning, ...prev]);
  };

  const handleEmergencyCall = () => {
    window.open('tel:6001163688', '_self');
  };

  const handleEmergencyCamera = () => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(stream => {
        const video = document.createElement('video');
        video.srcObject = stream;
        video.autoplay = true;
        video.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:10000;width:80%;max-width:500px;border:3px solid red;border-radius:10px;box-shadow:0 25px 50px rgba(0,0,0,0.5);';
        
        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '×';
        closeBtn.style.cssText = 'position:absolute;top:-10px;right:-10px;width:30px;height:30px;background:red;color:white;border:none;border-radius:50%;font-size:20px;cursor:pointer;z-index:10001;';
        closeBtn.onclick = () => {
          stream.getTracks().forEach(track => track.stop());
          document.body.removeChild(video);
        };
        
        video.appendChild(closeBtn);
        document.body.appendChild(video);
      })
      .catch(() => alert('Camera access denied. Please allow camera permissions.'));
  };

  const handleShareLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const locationUrl = `https://maps.google.com/?q=${latitude},${longitude}`;
        navigator.clipboard.writeText(locationUrl);
        alert('Location copied to clipboard!');
      },
      () => alert('Location access denied.')
    );
  };

  const handleDownloadData = () => {
    const data = {
      warnings,
      timestamp: new Date().toISOString(),
      totalWarnings: warnings.length,
      activeWarnings: warnings.filter(w => w.status === 'active').length
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `warnings-dashboard-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleShareDashboard = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Warning Dashboard',
        text: `Current warnings: ${warnings.filter(w => w.status === 'active').length} active`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Dashboard URL copied to clipboard!');
    }
  };

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      // Simulate data refresh
      setLoading(false);
      alert('Dashboard refreshed!');
    }, 1000);
  };

  const handleSettings = () => {
    window.location.href = '/settings';
  };

  const handleNotifications = () => {
    window.location.href = '/notifications';
  };

  const handleViewWarning = (warningId: string) => {
    window.location.href = `/warning/${warningId}`;
  };

  const handleVideoCall = () => {
    window.location.href = '/video-call';
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <AlertCircle className="h-4 w-4 text-red-400 animate-pulse" />;
      case 'resolved': return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-400 animate-spin" />;
      default: return <Clock className="h-4 w-4 text-slate-400" />;
    }
  };

  const filteredWarnings = warnings.filter(warning => {
    const matchesSearch = warning.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         warning.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterSeverity === 'all' || warning.severity === filterSeverity;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen pt-8 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Emergency Actions Bar */}
        <div className="bg-red-600/20 backdrop-blur-sm border border-red-500/30 rounded-2xl p-4 mb-8 animate-fade-in-up">
          <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-6 h-6 text-red-400 animate-pulse" />
              <span className="text-red-300 font-semibold">Emergency Actions</span>
            </div>
            <div className="flex flex-wrap gap-3">
              <EnhancedButton
                id="dashboard_emergency_call"
                variant="danger"
                size="sm"
                icon={<Phone className="w-4 h-4" />}
                onClick={handleEmergencyCall}
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
              >
                Call 6001163688
              </EnhancedButton>
              
              <EnhancedButton
                id="dashboard_emergency_camera"
                variant="warning"
                size="sm"
                icon={<Camera className="w-4 h-4" />}
                onClick={handleEmergencyCamera}
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
              >
                Camera
              </EnhancedButton>
              
              <EnhancedButton
                id="dashboard_share_location"
                variant="warning"
                size="sm"
                icon={<MapPin className="w-4 h-4" />}
                onClick={handleShareLocation}
                className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
              >
                Location
              </EnhancedButton>

              <EnhancedButton
                id="dashboard_video_call"
                variant="primary"
                size="sm"
                icon={<Users className="w-4 h-4" />}
                onClick={handleVideoCall}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                Video Call
              </EnhancedButton>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-12 animate-fade-in-up space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Warning Dashboard</h1>
            <p className="text-slate-400">Monitor and manage blockchain-verified warnings</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <EnhancedButton
              id="dashboard_refresh"
              variant="secondary"
              icon={<RefreshCw className="w-5 h-5" />}
              onClick={handleRefresh}
              loading={loading}
              className="bg-slate-700 hover:bg-slate-600"
            >
              Refresh
            </EnhancedButton>

            <EnhancedButton
              id="dashboard_download"
              variant="success"
              icon={<Download className="w-5 h-5" />}
              onClick={handleDownloadData}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
            >
              Export
            </EnhancedButton>

            <EnhancedButton
              id="dashboard_share"
              variant="primary"
              icon={<Share2 className="w-5 h-5" />}
              onClick={handleShareDashboard}
              className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700"
            >
              Share
            </EnhancedButton>

            <EnhancedButton
              id="dashboard_create_warning"
              variant="primary"
              icon={<Plus className="w-5 h-5" />}
              onClick={handleCreateWarning}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-2xl"
            >
              Create Warning
            </EnhancedButton>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            { title: 'Total Warnings', value: warnings.length.toString(), change: '+12%', icon: TrendingUp, color: 'from-blue-500 to-cyan-500' },
            { title: 'Active Warnings', value: warnings.filter(w => w.status === 'active').length.toString(), change: '2 critical', icon: AlertCircle, color: 'from-red-500 to-pink-500' },
            { title: 'Network Nodes', value: '2,500', change: '+5%', icon: Globe, color: 'from-green-500 to-emerald-500' },
            { title: 'Response Time', value: '<15s', change: '99.9%', icon: Activity, color: 'from-purple-500 to-indigo-500' }
          ].map((stat, index) => (
            <div
              key={index}
              className={`bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 border border-slate-700 hover:border-slate-600 shadow-lg hover:shadow-2xl transition-all duration-300 hover:transform hover:-translate-y-1 animate-fade-in-up cursor-pointer dashboard-stat-delay-${index}`}
              onClick={() => {
                // Handle stat card click
                window.location.href = `/${stat.title.toLowerCase().replace(/\s+/g, '-')}`;
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 bg-gradient-to-r ${stat.color} rounded-lg`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <span className="text-green-400 text-sm font-medium">{stat.change}</span>
              </div>
              <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-slate-400 text-sm">{stat.title}</div>
            </div>
          ))}
        </div>

        {/* Search and Filter */}
        <div className="bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 border border-slate-700 mb-8 animate-fade-in-up dashboard-animation-delay-05">
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
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
              <select
                aria-label="Filter warnings by severity"
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value)}
                className="pl-10 pr-8 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none min-w-[150px] transition-all duration-200"
              >
                <option value="all">All Severities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <div className="flex space-x-2">
              <EnhancedButton
                id="dashboard_notifications"
                variant="secondary"
                icon={<Bell className="w-4 h-4" />}
                onClick={handleNotifications}
                className="bg-slate-700 hover:bg-slate-600"
              >
                Notifications
              </EnhancedButton>
              <EnhancedButton
                id="dashboard_settings"
                variant="secondary"
                icon={<Settings className="w-4 h-4" />}
                onClick={handleSettings}
                className="bg-slate-700 hover:bg-slate-600"
              >
                Settings
              </EnhancedButton>
            </div>
          </div>
        </div>

        {/* Warnings Table */}
        <div className="bg-slate-800/60 backdrop-blur-sm rounded-2xl shadow-2xl border border-slate-700 overflow-hidden animate-fade-in-up dashboard-animation-delay-06">
          <div className="px-6 py-4 border-b border-slate-700 bg-gradient-to-r from-blue-600/20 to-purple-600/20">
            <h3 className="text-lg font-semibold text-white">Recent Warnings ({filteredWarnings.length})</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-700/50">
                <tr>
                  {['Warning', 'Severity', 'Status', 'Location', 'Tx Hash', 'Timestamp', 'Actions'].map((header) => (
                    <th key={header} className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {filteredWarnings.map((warning, index) => (
                  <tr 
                    key={warning.id} 
                    className={`hover:bg-slate-700/30 transition-colors group animate-slide-in-left dashboard-row-delay-${index}`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors">
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
                        <span className="text-sm text-white capitalize">{warning.status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{warning.location}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <code className="text-xs bg-slate-700 px-2 py-1 rounded font-mono text-blue-400 border border-slate-600 cursor-pointer hover:bg-slate-600 transition-colors">
                        {warning.txHash}
                      </code>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">{warning.timestamp}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <EnhancedButton
                        id={`view_warning_${warning.id}`}
                        variant="primary"
                        size="sm"
                        icon={<Eye className="w-3 h-3" />}
                        onClick={() => handleViewWarning(warning.id)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        View
                      </EnhancedButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};