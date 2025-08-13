import React, { useState } from 'react';
import {
  Activity,
  AlertTriangle,
  Cloud,
  Car,
  Building2,
  MapPin,
  Clock,
  Wifi,
  WifiOff,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { useRealTimeData } from '../hooks/useRealTimeData';

interface RealTimeDataDisplayProps {
  userLocation?: { lat: number; lng: number };
  isMinimized?: boolean;
  onToggleMinimize?: () => void;
  showInCall?: boolean;
  className?: string;
}

const RealTimeDataDisplay: React.FC<RealTimeDataDisplayProps> = ({
  userLocation,
  isMinimized = false,
  onToggleMinimize,
  showInCall = false,
  className = ''
}) => {
  const [selectedTab, setSelectedTab] = useState<'alerts' | 'earthquakes' | 'weather' | 'traffic' | 'hospitals'>('alerts');
  const [autoRefresh, setAutoRefresh] = useState(true);

  const {
    earthquakes,
    weatherAlerts,
    trafficIncidents,
    hospitalCapacity,
    loading,
    error,
    lastUpdated,
    refresh,
    getHighPriorityAlerts,
    getStatistics
  } = useRealTimeData({
    location: userLocation ? { ...userLocation, radius: 100 } : undefined,
    autoRefresh,
    refreshInterval: 120000, // 2 minutes
    dataTypes: ['earthquakes', 'weather', 'traffic', 'hospitals', 'disasters']
  });

  const highPriorityAlerts = getHighPriorityAlerts();
  const statistics = getStatistics();

  // Format time ago
  const formatTimeAgo = (timestamp: string) => {
    const now = new Date().getTime();
    const time = new Date(timestamp).getTime();
    const diffMinutes = Math.floor((now - time) / 60000);
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
    return `${Math.floor(diffMinutes / 1440)}d ago`;
  };

  // Get severity color
  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': case 'extreme': case 'emergency': return 'text-red-500 bg-red-500/10 border-red-500/30';
      case 'high': case 'severe': case 'warning': return 'text-orange-500 bg-orange-500/10 border-orange-500/30';
      case 'medium': case 'moderate': case 'advisory': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/30';
      case 'low': case 'minor': case 'watch': return 'text-blue-500 bg-blue-500/10 border-blue-500/30';
      default: return 'text-gray-500 bg-gray-500/10 border-gray-500/30';
    }
  };

  // Get icon for data type
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'earthquake': return <Activity className="w-4 h-4" />;
      case 'weather': return <Cloud className="w-4 h-4" />;
      case 'traffic': return <Car className="w-4 h-4" />;
      case 'hospital': return <Building2 className="w-4 h-4" />;
      case 'disaster': return <AlertTriangle className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  if (isMinimized && showInCall) {
    return (
      <div className={`real-time-data-minimized bg-slate-800/90 backdrop-blur-sm rounded-lg p-2 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${loading ? 'bg-yellow-500 animate-pulse' : error ? 'bg-red-500' : 'bg-green-500'}`} />
            <span className="text-sm text-white font-medium">Real-time Data</span>
            {highPriorityAlerts.length > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {highPriorityAlerts.length}
              </span>
            )}
          </div>
          <button
            onClick={onToggleMinimize}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`real-time-data-display bg-slate-900/95 backdrop-blur-sm rounded-lg border border-slate-700 ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${loading ? 'bg-yellow-500 animate-pulse' : error ? 'bg-red-500' : 'bg-green-500'}`} />
              <h3 className="text-lg font-semibold text-white">Live Emergency Data</h3>
            </div>
            {error && !loading && <WifiOff className="w-4 h-4 text-red-500" />}
            {!error && !loading && <Wifi className="w-4 h-4 text-green-500" />}
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`p-2 rounded-lg transition-colors ${
                autoRefresh ? 'bg-blue-500 hover:bg-blue-600 text-white' : 'bg-slate-700 hover:bg-slate-600 text-gray-300'
              }`}
              title={`Auto-refresh ${autoRefresh ? 'enabled' : 'disabled'}`}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            
            <button
              onClick={refresh}
              className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-gray-300 hover:text-white transition-colors"
              title="Manual refresh"
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            
            {showInCall && onToggleMinimize && (
              <button
                onClick={onToggleMinimize}
                className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-gray-300 hover:text-white transition-colors"
                title="Minimize"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Status and Last Updated */}
        <div className="flex items-center justify-between text-sm text-gray-400">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>Updated: {lastUpdated ? formatTimeAgo(lastUpdated) : 'Never'}</span>
            </div>
            {userLocation && (
              <div className="flex items-center space-x-1">
                <MapPin className="w-3 h-3" />
                <span>Location: {userLocation.lat.toFixed(3)}, {userLocation.lng.toFixed(3)}</span>
              </div>
            )}
          </div>
          
          {error && (
            <div className="text-red-400 text-xs">
              Error: {error}
            </div>
          )}
        </div>
      </div>

      {/* Statistics Overview */}
      {!loading && (
        <div className="p-4 border-b border-slate-700">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-800/50 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-1">
                <Activity className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-medium text-white">Earthquakes</span>
              </div>
              <div className="text-lg font-bold text-white">{statistics.significantEarthquakes}</div>
              <div className="text-xs text-gray-400">M4.0+ in 24h</div>
            </div>

            <div className="bg-slate-800/50 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-1">
                <Cloud className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium text-white">Weather</span>
              </div>
              <div className="text-lg font-bold text-white">{statistics.severeWeatherAlerts}</div>
              <div className="text-xs text-gray-400">Severe alerts</div>
            </div>

            <div className="bg-slate-800/50 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-1">
                <Car className="w-4 h-4 text-red-500" />
                <span className="text-sm font-medium text-white">Traffic</span>
              </div>
              <div className="text-lg font-bold text-white">{statistics.criticalTrafficIncidents}</div>
              <div className="text-xs text-gray-400">Critical incidents</div>
            </div>

            <div className="bg-slate-800/50 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-1">
                <Building2 className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium text-white">Hospitals</span>
              </div>
              <div className="text-lg font-bold text-white">{statistics.availableHospitals}</div>
              <div className="text-xs text-gray-400">Available</div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="px-4 pt-4">
        <div className="flex space-x-1 mb-4 bg-slate-800/50 rounded-lg p-1">
          {[
            { id: 'alerts', label: 'High Priority', count: highPriorityAlerts.length },
            { id: 'earthquakes', label: 'Earthquakes', count: statistics.significantEarthquakes },
            { id: 'weather', label: 'Weather', count: weatherAlerts.length },
            { id: 'traffic', label: 'Traffic', count: trafficIncidents.length },
            { id: 'hospitals', label: 'Hospitals', count: hospitalCapacity.length }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id as 'alerts' | 'earthquakes' | 'weather' | 'traffic' | 'hospitals')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-2 ${
                selectedTab === tab.id
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  selectedTab === tab.id ? 'bg-white/20' : 'bg-slate-600'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="px-4 pb-4 max-h-64 overflow-y-auto">
        {loading && (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin text-blue-500 mr-2" />
            <span className="text-gray-400">Loading real-time data...</span>
          </div>
        )}

        {!loading && selectedTab === 'alerts' && (
          <div className="space-y-3">
            {highPriorityAlerts.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <AlertTriangle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No high priority alerts</p>
              </div>
            ) : (
              highPriorityAlerts.slice(0, 10).map(alert => (
                <div
                  key={alert.id}
                  className={`p-3 rounded-lg border ${getSeverityColor(alert.severity)}`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {getTypeIcon(alert.type)}
                    </div>
                    <div className="flex-grow min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-medium text-white text-sm truncate">{alert.title}</h4>
                        <span className={`text-xs px-2 py-1 rounded-full capitalize ${getSeverityColor(alert.severity)}`}>
                          {alert.severity}
                        </span>
                      </div>
                      <p className="text-xs text-gray-300 line-clamp-2">{alert.description}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-400">{formatTimeAgo(alert.timestamp)}</span>
                        {alert.coordinates && (
                          <button
                            onClick={() => window.open(`https://maps.google.com/?q=${alert.coordinates![0]},${alert.coordinates![1]}`, '_blank')}
                            className="text-xs text-blue-400 hover:text-blue-300 flex items-center space-x-1"
                          >
                            <MapPin className="w-3 h-3" />
                            <span>View on Map</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {!loading && selectedTab === 'earthquakes' && (
          <div className="space-y-3">
            {earthquakes.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No recent earthquakes</p>
              </div>
            ) : (
              earthquakes.slice(0, 10).map(eq => (
                <div key={eq.id} className="bg-slate-800/50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Activity className="w-4 h-4 text-orange-500" />
                      <span className="font-medium text-white">M{eq.magnitude}</span>
                      {eq.alert && (
                        <span className={`text-xs px-2 py-1 rounded-full capitalize ${getSeverityColor(eq.alert)}`}>
                          {eq.alert}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-400">{formatTimeAgo(eq.time)}</span>
                  </div>
                  <p className="text-sm text-gray-300 mb-2">{eq.place}</p>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>Depth: {eq.depth}km</span>
                    <button
                      onClick={() => window.open(eq.url, '_blank')}
                      className="text-blue-400 hover:text-blue-300 flex items-center space-x-1"
                    >
                      <span>Details</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {!loading && selectedTab === 'weather' && (
          <div className="space-y-3">
            {weatherAlerts.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Cloud className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No weather alerts</p>
              </div>
            ) : (
              weatherAlerts.slice(0, 10).map(alert => (
                <div key={alert.id} className="bg-slate-800/50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Cloud className="w-4 h-4 text-blue-500" />
                      <span className="font-medium text-white text-sm">{alert.event}</span>
                      <span className={`text-xs px-2 py-1 rounded-full capitalize ${getSeverityColor(alert.severity)}`}>
                        {alert.severity}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400">{formatTimeAgo(alert.effective)}</span>
                  </div>
                  <p className="text-sm text-gray-300 mb-2 line-clamp-2">{alert.headline}</p>
                  <div className="text-xs text-gray-400">
                    Areas: {alert.areas.slice(0, 2).join(', ')}
                    {alert.areas.length > 2 && ` +${alert.areas.length - 2} more`}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {!loading && selectedTab === 'traffic' && (
          <div className="space-y-3">
            {trafficIncidents.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Car className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No traffic incidents</p>
              </div>
            ) : (
              trafficIncidents.slice(0, 10).map(incident => (
                <div key={incident.id} className="bg-slate-800/50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Car className="w-4 h-4 text-red-500" />
                      <span className="font-medium text-white text-sm capitalize">{incident.type}</span>
                      <span className={`text-xs px-2 py-1 rounded-full capitalize ${getSeverityColor(incident.severity)}`}>
                        {incident.severity}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400">{formatTimeAgo(incident.start_time)}</span>
                  </div>
                  <p className="text-sm text-gray-300 mb-1">{incident.title}</p>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>{incident.roadName}</span>
                    <button
                      onClick={() => window.open(`https://maps.google.com/?q=${incident.coordinates[0]},${incident.coordinates[1]}`, '_blank')}
                      className="text-blue-400 hover:text-blue-300 flex items-center space-x-1"
                    >
                      <MapPin className="w-3 h-3" />
                      <span>View</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {!loading && selectedTab === 'hospitals' && (
          <div className="space-y-3">
            {hospitalCapacity.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Building2 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No hospital data available</p>
              </div>
            ) : (
              hospitalCapacity.map(hospital => (
                <div key={hospital.id} className="bg-slate-800/50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Building2 className="w-4 h-4 text-green-500" />
                      <span className="font-medium text-white text-sm">{hospital.name}</span>
                      <span className={`text-xs px-2 py-1 rounded-full capitalize ${getSeverityColor(hospital.status)}`}>
                        {hospital.status}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400">Wait: {hospital.current_wait_time}m</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="text-center bg-slate-700/50 rounded p-1">
                      <div className="text-white font-medium">{hospital.bed_capacity.available}</div>
                      <div className="text-gray-400">Beds</div>
                    </div>
                    <div className="text-center bg-slate-700/50 rounded p-1">
                      <div className="text-white font-medium">{hospital.bed_capacity.icu_available}</div>
                      <div className="text-gray-400">ICU</div>
                    </div>
                    <div className="text-center bg-slate-700/50 rounded p-1">
                      <div className="text-white font-medium">{hospital.bed_capacity.emergency_available}</div>
                      <div className="text-gray-400">ER</div>
                    </div>
                  </div>
                  {hospital.ambulance_diversion && (
                    <div className="mt-2 text-xs text-red-400 bg-red-500/10 rounded px-2 py-1">
                      ⚠️ On Ambulance Diversion
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RealTimeDataDisplay;
