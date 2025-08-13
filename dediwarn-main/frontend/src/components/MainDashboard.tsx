import React, { useState, useEffect } from 'react';
import { AlertTriangle, Users, BarChart3, Phone, MapPin, Clock, Activity, Shield, Heart } from 'lucide-react';
import { UserReportSystem } from './UserReportSystem';
import { ResourceDirectory } from './ResourceDirectory';
import { VolunteerPortal } from './VolunteerPortal';
import { AnalyticsDashboard } from './EnhancedAnalyticsDashboard';
import { Map } from '../pages/Map';

interface MainDashboardProps {
  userLocation?: { lat: number; lng: number };
}

interface QuickStat {
  title: string;
  value: string | number;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  color: string;
  trend?: number;
}

interface ActiveAlert {
  id: string;
  type: 'earthquake' | 'flood' | 'fire' | 'cyclone' | 'landslide';
  severity: 'low' | 'medium' | 'high' | 'critical';
  location: string;
  timestamp: string;
  description: string;
  affectedArea: string;
}

export const MainDashboard: React.FC<MainDashboardProps> = ({ userLocation }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'map' | 'reports' | 'resources' | 'volunteers' | 'analytics'>('overview');
  const [activeAlerts, setActiveAlerts] = useState<ActiveAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Mock active alerts data
  const mockAlerts: ActiveAlert[] = [
    {
      id: '1',
      type: 'earthquake',
      severity: 'high',
      location: 'New Delhi, Delhi',
      timestamp: '2025-08-07T10:30:00Z',
      description: 'Magnitude 6.2 earthquake detected',
      affectedArea: '15 km radius'
    },
    {
      id: '2',
      type: 'flood',
      severity: 'critical',
      location: 'Kolkata, West Bengal',
      timestamp: '2025-08-07T09:15:00Z',
      description: 'Heavy rainfall causing urban flooding',
      affectedArea: '25 km radius'
    },
    {
      id: '3',
      type: 'fire',
      severity: 'medium',
      location: 'Mumbai, Maharashtra',
      timestamp: '2025-08-07T08:45:00Z',
      description: 'Industrial area fire spreading',
      affectedArea: '8 km radius'
    }
  ];

  // Quick stats
  const quickStats: QuickStat[] = [
    {
      title: 'Active Incidents',
      value: activeAlerts.length,
      icon: AlertTriangle,
      color: 'text-red-400',
      trend: -12
    },
    {
      title: 'People Affected',
      value: '89,450',
      icon: Users,
      color: 'text-blue-400',
      trend: 8
    },
    {
      title: 'Active Volunteers',
      value: '1,247',
      icon: Users,
      color: 'text-green-400',
      trend: 25
    },
    {
      title: 'Emergency Resources',
      value: '156',
      icon: Shield,
      color: 'text-purple-400',
      trend: 5
    }
  ];

  // Load alerts
  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      setActiveAlerts(mockAlerts);
      setIsLoading(false);
    }, 1000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Get severity color
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'high': return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'low': return 'text-green-400 bg-green-500/20 border-green-500/30';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  // Get disaster type icon
  const getDisasterIcon = (type: string) => {
    switch (type) {
      case 'earthquake': return <Activity className="h-5 w-5" />;
      case 'flood': return <MapPin className="h-5 w-5" />;
      case 'fire': return <AlertTriangle className="h-5 w-5" />;
      case 'cyclone': return <Activity className="h-5 w-5" />;
      case 'landslide': return <MapPin className="h-5 w-5" />;
      default: return <AlertTriangle className="h-5 w-5" />;
    }
  };

  const tabs = [
    { key: 'overview', label: 'Overview', icon: BarChart3 },
    { key: 'map', label: 'Live Map', icon: MapPin },
    { key: 'reports', label: 'Report Incident', icon: AlertTriangle },
    { key: 'resources', label: 'Emergency Resources', icon: Shield },
    { key: 'volunteers', label: 'Volunteers', icon: Users },
    { key: 'analytics', label: 'Analytics', icon: BarChart3 }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  Disaster Management Command Center
                </h1>
                <p className="text-gray-400">
                  Real-time monitoring, response coordination, and emergency management
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center text-green-400">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse" />
                  <span className="text-sm">System Online</span>
                </div>
                <div className="text-gray-400 text-sm">
                  <Clock className="h-4 w-4 inline mr-1" />
                  {new Date().toLocaleString()}
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickStats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div key={index} className="bg-slate-800/70 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <Icon className={`h-6 w-6 ${stat.color}`} />
                      {stat.trend && (
                        <span className={`text-xs px-2 py-1 rounded ${
                          stat.trend > 0 ? 'text-green-400 bg-green-500/20' : 'text-red-400 bg-red-500/20'
                        }`}>
                          {stat.trend > 0 ? '+' : ''}{stat.trend}%
                        </span>
                      )}
                    </div>
                    <div className="mt-2">
                      <div className="text-2xl font-bold text-white">{stat.value}</div>
                      <div className="text-sm text-gray-400">{stat.title}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-6 bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-2">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as 'overview' | 'map' | 'reports' | 'resources' | 'volunteers' | 'analytics')}
                className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                  activeTab === tab.key
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'overview' && (
            <>
              {/* Active Alerts */}
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-3 text-red-400" />
                  Active Emergency Alerts
                </h2>
                
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto"></div>
                    <p className="text-gray-400 mt-2">Loading alerts...</p>
                  </div>
                ) : activeAlerts.length === 0 ? (
                  <div className="text-center py-8">
                    <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-white mb-2">No Active Alerts</h3>
                    <p className="text-gray-400">All systems are operating normally</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {activeAlerts.map((alert) => (
                      <div key={alert.id} className={`border rounded-lg p-4 ${getSeverityColor(alert.severity)}`}>
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center">
                            {getDisasterIcon(alert.type)}
                            <div className="ml-3">
                              <h3 className="font-bold capitalize">{alert.type}</h3>
                              <p className="text-sm opacity-90">{alert.location}</p>
                            </div>
                          </div>
                          <span className="text-xs px-2 py-1 rounded capitalize bg-current/20">
                            {alert.severity}
                          </span>
                        </div>
                        
                        <p className="text-sm mb-3 opacity-90">{alert.description}</p>
                        
                        <div className="flex items-center justify-between text-xs opacity-75">
                          <span>Affected: {alert.affectedArea}</span>
                          <span>{new Date(alert.timestamp).toLocaleTimeString()}</span>
                        </div>
                        
                        <div className="mt-3 flex space-x-2">
                          <button className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors">
                            View Details
                          </button>
                          <button className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition-colors">
                            <Phone className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6">
                <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <button
                    onClick={() => setActiveTab('reports')}
                    className="p-4 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 rounded-lg transition-colors"
                  >
                    <AlertTriangle className="h-8 w-8 text-red-400 mx-auto mb-2" />
                    <div className="text-white font-medium">Report Emergency</div>
                    <div className="text-gray-400 text-sm">Submit incident report</div>
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('resources')}
                    className="p-4 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 rounded-lg transition-colors"
                  >
                    <Shield className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                    <div className="text-white font-medium">Find Resources</div>
                    <div className="text-gray-400 text-sm">Emergency contacts & shelters</div>
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('volunteers')}
                    className="p-4 bg-green-600/20 hover:bg-green-600/30 border border-green-500/30 rounded-lg transition-colors"
                  >
                    <Users className="h-8 w-8 text-green-400 mx-auto mb-2" />
                    <div className="text-white font-medium">Volunteer Portal</div>
                    <div className="text-gray-400 text-sm">Join or coordinate missions</div>
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('map')}
                    className="p-4 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 rounded-lg transition-colors"
                  >
                    <MapPin className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                    <div className="text-white font-medium">Live Map</div>
                    <div className="text-gray-400 text-sm">Real-time disaster tracking</div>
                  </button>
                </div>
              </div>

              {/* Emergency Contacts */}
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                  <Phone className="h-5 w-5 mr-3 text-green-400" />
                  Emergency Contacts
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center p-3 bg-slate-700/50 rounded-lg">
                    <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center mr-3">
                      <Phone className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <div className="text-white font-medium">Fire Brigade</div>
                      <div className="text-gray-400">101</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center p-3 bg-slate-700/50 rounded-lg">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                      <Phone className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <div className="text-white font-medium">Police</div>
                      <div className="text-gray-400">100</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center p-3 bg-slate-700/50 rounded-lg">
                    <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mr-3">
                      <Heart className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <div className="text-white font-medium">Medical Emergency</div>
                      <div className="text-gray-400">108</div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'map' && (
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-2">
              <Map />
            </div>
          )}

          {activeTab === 'reports' && (
            <UserReportSystem 
              onSubmitReport={(report) => {
                console.log('Emergency report submitted:', report);
                // Handle report submission logic here
              }} 
            />
          )}

          {activeTab === 'resources' && (
            <ResourceDirectory 
              userLocation={userLocation} 
              onNavigate={(resource) => {
                console.log('Navigate to:', resource);
              }}
            />
          )}

          {activeTab === 'volunteers' && (
            <VolunteerPortal />
          )}

          {activeTab === 'analytics' && <AnalyticsDashboard />}
        </div>
      </div>
    </div>
  );
};
