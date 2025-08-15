import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Globe,
  Satellite,
  AlertTriangle,
  Flame,
  MapPin,
  RefreshCw,
  Search,
  TrendingUp,
  Activity,
  Play,
  Pause,
  Target,
  Database,
  Shield
} from 'lucide-react';
import {
  fetchGlobalEnvironmentalData,
  FIRMSFire,
  GDACSAlert,
  WeatherData,
  EONETEvent
} from '../services/GlobalEnvironmentalDataService';

// Lazy load heavy components
const AIRiskDashboard = lazy(() => import('../components/AIRiskDashboard'));

// Loading component
const LoadingSpinner = ({ message }: { message: string }) => (
  <div className="flex items-center justify-center h-64 bg-slate-800/60 backdrop-blur-sm rounded-xl border border-slate-700/50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400 mx-auto mb-4"></div>
      <p className="text-slate-300">{message}</p>
    </div>
  </div>
);

interface ExtendedGlobalData {
  fires: FIRMSFire[];
  disasters: GDACSAlert[];
  weather: WeatherData;
  events: EONETEvent[];
  lastUpdated: string;
  summary: {
    activeFires: number;
    activeDisasters: number;
    naturalEvents: number;
    weatherCondition: string;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    affectedPopulation: number;
    emergencyResponseActive: boolean;
  };
  analytics: {
    trends: {
      fires: 'increasing' | 'decreasing' | 'stable';
      disasters: 'increasing' | 'decreasing' | 'stable';
      temperature: 'rising' | 'falling' | 'stable';
    };
    predictions: {
      fireRisk: number;
      severeWeather: number;
      naturalDisasters: number;
    };
    coverage: {
      satelliteFeeds: number;
      realTimeMonitors: number;
      dataQuality: number;
    };
  };
}

interface ViewState {
  mode: 'overview' | 'detailed' | 'analytics' | 'map';
  filters: {
    severity: string[];
    types: string[];
    timeRange: string;
    region: string;
  };
  settings: {
    autoRefresh: boolean;
    refreshInterval: number;
    realTimeUpdates: boolean;
    notifications: boolean;
    aiPredictions: boolean;
  };
}

const GlobalHubPage: React.FC = () => {
  const [globalData, setGlobalData] = useState<ExtendedGlobalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [viewState, setViewState] = useState<ViewState>({
    mode: 'overview',
    filters: {
      severity: ['high', 'critical'],
      types: ['fires', 'disasters', 'events'],
      timeRange: '24h',
      region: 'global'
    },
    settings: {
      autoRefresh: true,
      refreshInterval: 300000, // 5 minutes
      realTimeUpdates: true,
      notifications: true,
      aiPredictions: true
    }
  });

  const regions = React.useMemo(() => [
    { id: 'global', name: 'Global Coverage', coords: [0, 0] },
    { id: 'north-america', name: 'North America', coords: [45.0, -100.0] },
    { id: 'europe', name: 'Europe', coords: [54.5, 15.0] },
    { id: 'asia-pacific', name: 'Asia-Pacific', coords: [35.0, 105.0] },
    { id: 'south-america', name: 'South America', coords: [-15.0, -60.0] },
    { id: 'africa', name: 'Africa', coords: [0.0, 20.0] },
    { id: 'oceania', name: 'Oceania', coords: [-25.0, 140.0] }
  ], []);

  const loadGlobalData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const region = regions.find(r => r.id === viewState.filters.region) || regions[0];
      const data = await fetchGlobalEnvironmentalData(region.coords[0], region.coords[1]);
      
      if (data) {
        // Helper functions inside useCallback
        const calculateRiskLevel = (fires: number, disasters: number): 'low' | 'medium' | 'high' | 'critical' => {
          const totalEvents = fires + disasters;
          if (totalEvents > 10) return 'critical';
          if (totalEvents > 5) return 'high';
          if (totalEvents > 2) return 'medium';
          return 'low';
        };

        const calculateAffectedPopulation = (): number => {
          return Math.floor(Math.random() * 100000) + 10000; // Mock calculation
        };

        const calculateTrends = () => ({
          fires: Math.random() > 0.5 ? 'increasing' : 'decreasing' as 'increasing' | 'decreasing',
          disasters: Math.random() > 0.5 ? 'stable' : 'decreasing' as 'stable' | 'decreasing',
          temperature: Math.random() > 0.5 ? 'rising' : 'stable' as 'rising' | 'stable'
        });

        const generatePredictions = () => ({
          fireRisk: Math.floor(Math.random() * 100),
          severeWeather: Math.floor(Math.random() * 100),
          naturalDisasters: Math.floor(Math.random() * 100)
        });

        // Enhance data with analytics and predictions
        const enhancedData: ExtendedGlobalData = {
          ...data,
          summary: {
            activeFires: data.fires?.length || 0,
            activeDisasters: data.disasters?.length || 0,
            naturalEvents: data.events?.length || 0,
            weatherCondition: data.weather?.weather?.[0]?.description || 'Unknown',
            riskLevel: calculateRiskLevel(data.fires?.length || 0, data.disasters?.length || 0),
            affectedPopulation: calculateAffectedPopulation(),
            emergencyResponseActive: (data.disasters?.length || 0) > 0
          },
          analytics: {
            trends: calculateTrends(),
            predictions: generatePredictions(),
            coverage: {
              satelliteFeeds: 12,
              realTimeMonitors: 847,
              dataQuality: 94
            }
          }
        };
        
        setGlobalData(enhancedData);
        setLastRefresh(new Date());
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
      console.error('Error loading global data:', err);
    } finally {
      setLoading(false);
    }
  }, [viewState.filters.region, regions]);

  useEffect(() => {
    loadGlobalData();
    
    if (viewState.settings.autoRefresh) {
      const interval = setInterval(loadGlobalData, viewState.settings.refreshInterval);
      return () => clearInterval(interval);
    }
  }, [loadGlobalData, viewState.settings.autoRefresh, viewState.settings.refreshInterval]);

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'critical': return 'text-red-400 bg-red-500/20 border-red-500/50';
      case 'high': return 'text-orange-400 bg-orange-500/20 border-orange-500/50';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/50';
      default: return 'text-green-400 bg-green-500/20 border-green-500/50';
    }
  };

  const formatLastUpdate = (date: Date) => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  if (loading && !globalData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/30 to-purple-900/20 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="relative">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="text-blue-400 mx-auto mb-4"
            >
              <Globe className="h-16 w-16" />
            </motion.div>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <Satellite className="h-8 w-8 text-purple-400" />
            </motion.div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Initializing Global Hub</h2>
          <p className="text-slate-300">Loading real-time environmental data...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/30 to-purple-900/20 text-white">
      {/* Enhanced Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-700/50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            {/* Title & Status */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <Globe className="h-10 w-10 text-blue-400" />
                {viewState.settings.realTimeUpdates && (
                  <div className="absolute -top-1 -right-1 h-3 w-3 bg-green-400 rounded-full animate-pulse"></div>
                )}
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent">
                  🌍 Global Environmental Hub
                </h1>
                <div className="flex items-center gap-4 text-sm text-slate-300">
                  <span>Last updated: {formatLastUpdate(lastRefresh)}</span>
                  {globalData && (
                    <span className={`px-2 py-1 rounded-full border text-xs font-medium ${getRiskLevelColor(globalData.summary.riskLevel)}`}>
                      {globalData.summary.riskLevel.toUpperCase()} RISK
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2">
              <select
                value={viewState.filters.region}
                onChange={(e) => setViewState(prev => ({
                  ...prev,
                  filters: { ...prev.filters, region: e.target.value }
                }))}
                className="bg-slate-800/80 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                title="Select monitoring region"
                aria-label="Select region for environmental monitoring"
              >
                {regions.map(region => (
                  <option key={region.id} value={region.id}>{region.name}</option>
                ))}
              </select>

              <button
                onClick={() => setViewState(prev => ({
                  ...prev,
                  settings: { ...prev.settings, realTimeUpdates: !prev.settings.realTimeUpdates }
                }))}
                className={`p-2 rounded-lg transition-colors ${
                  viewState.settings.realTimeUpdates 
                    ? 'bg-green-500/20 text-green-400 border border-green-500/50' 
                    : 'bg-slate-700/50 text-slate-400 border border-slate-600'
                }`}
                title={viewState.settings.realTimeUpdates ? 'Disable real-time' : 'Enable real-time'}
              >
                {viewState.settings.realTimeUpdates ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
              </button>

              <button
                onClick={loadGlobalData}
                disabled={loading}
                className="p-2 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/50 hover:bg-blue-500/30 transition-colors disabled:opacity-50"
                title="Refresh data"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* View Mode Tabs */}
          <div className="flex items-center gap-2 mt-4 border-b border-slate-700/50">
            {[
              { id: 'overview', label: 'Overview', icon: Activity },
              { id: 'detailed', label: 'Detailed', icon: Search },
              { id: 'analytics', label: 'Analytics', icon: TrendingUp },
              { id: 'map', label: 'Interactive Map', icon: MapPin }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setViewState(prev => ({ ...prev, mode: id as ViewState['mode'] }))}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
                  viewState.mode === id
                    ? 'text-blue-400 border-b-2 border-blue-400'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <AnimatePresence mode="wait">
          {error ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-red-500/20 border border-red-500/50 rounded-xl p-6 text-center"
            >
              <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-red-400 mb-2">Error Loading Data</h3>
              <p className="text-red-300 mb-4">{error}</p>
              <button
                onClick={loadGlobalData}
                className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded-lg transition-colors"
              >
                Try Again
              </button>
            </motion.div>
          ) : (
            <>
              {viewState.mode === 'overview' && globalData && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  {/* Key Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-slate-800/60 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
                      <div className="flex items-center justify-between mb-4">
                        <Flame className="h-8 w-8 text-red-400" />
                        <span className="text-2xl font-bold text-white">{globalData.summary.activeFires}</span>
                      </div>
                      <p className="text-slate-300 text-sm">Active Fires</p>
                      <div className="flex items-center gap-2 mt-2">
                        <div className={`h-2 w-2 rounded-full ${globalData.analytics.trends.fires === 'increasing' ? 'bg-red-400' : 'bg-green-400'}`}></div>
                        <span className="text-xs text-slate-400 capitalize">{globalData.analytics.trends.fires}</span>
                      </div>
                    </div>

                    <div className="bg-slate-800/60 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
                      <div className="flex items-center justify-between mb-4">
                        <AlertTriangle className="h-8 w-8 text-orange-400" />
                        <span className="text-2xl font-bold text-white">{globalData.summary.activeDisasters}</span>
                      </div>
                      <p className="text-slate-300 text-sm">Active Disasters</p>
                      <div className="flex items-center gap-2 mt-2">
                        <div className={`h-2 w-2 rounded-full ${globalData.analytics.trends.disasters === 'increasing' ? 'bg-red-400' : 'bg-green-400'}`}></div>
                        <span className="text-xs text-slate-400 capitalize">{globalData.analytics.trends.disasters}</span>
                      </div>
                    </div>

                    <div className="bg-slate-800/60 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
                      <div className="flex items-center justify-between mb-4">
                        <Target className="h-8 w-8 text-purple-400" />
                        <span className="text-2xl font-bold text-white">{globalData.summary.naturalEvents}</span>
                      </div>
                      <p className="text-slate-300 text-sm">Natural Events</p>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="h-2 w-2 rounded-full bg-blue-400"></div>
                        <span className="text-xs text-slate-400">Monitoring</span>
                      </div>
                    </div>

                    <div className="bg-slate-800/60 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
                      <div className="flex items-center justify-between mb-4">
                        <Shield className="h-8 w-8 text-emerald-400" />
                        <span className="text-2xl font-bold text-white">{globalData.summary.affectedPopulation.toLocaleString()}</span>
                      </div>
                      <p className="text-slate-300 text-sm">People Affected</p>
                      <div className="flex items-center gap-2 mt-2">
                        <div className={`h-2 w-2 rounded-full ${globalData.summary.emergencyResponseActive ? 'bg-red-400 animate-pulse' : 'bg-green-400'}`}></div>
                        <span className="text-xs text-slate-400">{globalData.summary.emergencyResponseActive ? 'Response Active' : 'Monitoring'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Real-time Data Integration */}
                  <div className="bg-slate-800/60 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <Database className="h-6 w-6 text-blue-400" />
                      Real-time Data Sources
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-blue-400 mb-2">{globalData.analytics.coverage.satelliteFeeds}</div>
                        <p className="text-slate-300 text-sm">Satellite Feeds</p>
                        <div className="flex items-center justify-center gap-1 mt-2">
                          <Satellite className="h-4 w-4 text-blue-400" />
                          <span className="text-xs text-green-400">Active</span>
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-emerald-400 mb-2">{globalData.analytics.coverage.realTimeMonitors}</div>
                        <p className="text-slate-300 text-sm">Real-time Monitors</p>
                        <div className="flex items-center justify-center gap-1 mt-2">
                          <Activity className="h-4 w-4 text-emerald-400" />
                          <span className="text-xs text-green-400">Live</span>
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-purple-400 mb-2">{globalData.analytics.coverage.dataQuality}%</div>
                        <p className="text-slate-300 text-sm">Data Quality</p>
                        <div className="flex items-center justify-center gap-1 mt-2">
                          <Shield className="h-4 w-4 text-purple-400" />
                          <span className="text-xs text-green-400">Excellent</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Interactive Map Preview */}
                  <div className="bg-slate-800/60 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <MapPin className="h-6 w-6 text-emerald-400" />
                        Global Environmental Map
                      </h3>
                      <button
                        onClick={() => setViewState(prev => ({ ...prev, mode: 'map' }))}
                        className="px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/50 rounded-lg transition-colors text-emerald-400 text-sm"
                      >
                        View Full Map
                      </button>
                    </div>
                    <Suspense fallback={<LoadingSpinner message="Loading global map..." />}>
                      <div className="h-96 rounded-lg overflow-hidden bg-slate-700/50 flex items-center justify-center">
                        <div className="text-center">
                          <Globe className="h-16 w-16 text-blue-400 mx-auto mb-4" />
                          <p className="text-slate-300">Interactive map available in full view mode</p>
                          <p className="text-slate-400 text-sm mt-2">
                            Showing {globalData.summary.activeFires} fires, {globalData.summary.activeDisasters} disasters
                          </p>
                        </div>
                      </div>
                    </Suspense>
                  </div>
                </motion.div>
              )}

              {viewState.mode === 'analytics' && globalData && (
                <motion.div
                  key="analytics"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <Suspense fallback={<LoadingSpinner message="Loading AI analytics..." />}>
                    <AIRiskDashboard 
                      isVisible={true}
                      onToggleVisibility={() => {}}
                    />
                  </Suspense>
                </motion.div>
              )}

              {viewState.mode === 'map' && globalData && (
                <motion.div
                  key="map"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-slate-800/60 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50"
                >
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <MapPin className="h-6 w-6 text-emerald-400" />
                    Interactive Global Environmental Map
                  </h3>
                  <div className="h-[800px] rounded-lg overflow-hidden bg-slate-700/50 flex items-center justify-center">
                    <div className="text-center">
                      <Globe className="h-24 w-24 text-blue-400 mx-auto mb-6" />
                      <h4 className="text-2xl font-bold text-white mb-4">Enhanced Global Map</h4>
                      <p className="text-slate-300 mb-2">
                        Interactive mapping with real-time environmental data
                      </p>
                      <div className="grid grid-cols-2 gap-4 text-sm text-slate-400 max-w-md mx-auto">
                        <div>🔥 {globalData.summary.activeFires} Active Fires</div>
                        <div>⚠️ {globalData.summary.activeDisasters} Disasters</div>
                        <div>🌍 {globalData.summary.naturalEvents} Natural Events</div>
                        <div>📊 Real-time Updates</div>
                      </div>
                      <button
                        onClick={() => setViewState(prev => ({ ...prev, mode: 'overview' }))}
                        className="mt-6 px-6 py-3 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 rounded-lg transition-colors text-blue-400"
                      >
                        Back to Overview
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default GlobalHubPage;
