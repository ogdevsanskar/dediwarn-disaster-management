import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { motion } from 'framer-motion';
import {
  Globe,
  Navigation,
  AlertTriangle,
  Flame,
  MapPin,
  RefreshCw,
  Layers,
  Filter,
  Play,
  Pause,
  Zap,
  Clock
} from 'lucide-react';
import GlobalEnvironmentalHub from '../components/GlobalEnvironmentalHub';
import EnhancedGlobalMap from '../components/EnhancedGlobalMap';
import {
  fetchGlobalEnvironmentalData,
  FIRMSFire,
  GDACSAlert,
  EONETEvent,
  WeatherData
} from '../services/GlobalEnvironmentalDataService';

interface LiveMapData {
  fires: FIRMSFire[];
  disasters: GDACSAlert[];
  events: EONETEvent[];
  weather: WeatherData;
  lastUpdated: string;
}

interface LiveMapProps {
  userLocation?: { lat: number; lng: number };
}

const LiveMap: React.FC<LiveMapProps> = ({ userLocation }) => {
  const [activeView, setActiveView] = useState<'hub' | 'map' | 'combined'>('combined');
  const [liveData, setLiveData] = useState<LiveMapData | null>(null);
  const [isLiveUpdate, setIsLiveUpdate] = useState(true);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // Load real-time data
  const loadLiveData = useCallback(async () => {
    try {
      setLoading(true);
      // Use userLocation if available, otherwise use global coordinates
      const lat = userLocation?.lat || 0;
      const lon = userLocation?.lng || 0;
      const data = await fetchGlobalEnvironmentalData(lat, lon);
      if (data) {
        setLiveData({
          fires: data.fires,
          disasters: data.disasters,
          events: data.events,
          weather: data.weather,
          lastUpdated: new Date().toISOString()
        });
        setLastRefresh(new Date());
      }
    } catch (error) {
      console.error('Error loading live data:', error);
    } finally {
      setLoading(false);
    }
  }, [userLocation]);

  // Auto-refresh functionality
  useEffect(() => {
    loadLiveData();
    
    if (isLiveUpdate) {
      const interval = setInterval(loadLiveData, 300000); // Refresh every 5 minutes
      return () => clearInterval(interval);
    }
  }, [isLiveUpdate, loadLiveData]);

  const formatLastUpdate = (date: Date) => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-800/60 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Title */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-lg flex items-center justify-center">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Global Live Map</h1>
                <p className="text-sm text-slate-400">
                  Real-time disaster monitoring & resource tracking
                </p>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center space-x-4">
              {/* Live Update Toggle */}
              <button
                onClick={() => setIsLiveUpdate(!isLiveUpdate)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isLiveUpdate
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                }`}
              >
                {isLiveUpdate ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{isLiveUpdate ? 'Live' : 'Paused'}</span>
              </button>

              {/* Manual Refresh */}
              <button
                onClick={loadLiveData}
                disabled={loading}
                className="flex items-center space-x-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>

              {/* View Toggle */}
              <div className="flex bg-slate-700 rounded-lg p-1">
                {[
                  { key: 'hub', label: 'Hub', icon: Globe },
                  { key: 'map', label: 'Map', icon: MapPin },
                  { key: 'combined', label: 'Both', icon: Layers }
                ].map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => setActiveView(key as typeof activeView)}
                    className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeView === key
                        ? 'bg-emerald-600 text-white'
                        : 'text-slate-300 hover:text-white hover:bg-slate-600'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Status Bar */}
          <div className="mt-3 flex items-center justify-between text-sm">
            <div className="flex items-center space-x-6 text-slate-400">
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${isLiveUpdate ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
                <span>Status: {isLiveUpdate ? 'Live Updates Active' : 'Updates Paused'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>Last Update: {formatLastUpdate(lastRefresh)}</span>
              </div>
              {liveData && (
                <>
                  <div className="flex items-center space-x-2">
                    <Flame className="w-4 h-4 text-red-400" />
                    <span>{liveData.fires.length} Active Fires</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-orange-400" />
                    <span>{liveData.disasters.length} Disasters</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Zap className="w-4 h-4 text-purple-400" />
                    <span>{liveData.events.length} Natural Events</span>
                  </div>
                </>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <button className="text-slate-400 hover:text-white flex items-center space-x-1">
                <Filter className="w-4 h-4" />
                <span>Filters</span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeView === 'hub' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <GlobalEnvironmentalHub />
          </motion.div>
        )}

        {activeView === 'map' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-slate-800/60 backdrop-blur-sm rounded-xl border border-slate-700/50"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <MapPin className="w-6 h-6 text-emerald-400" />
                  <h2 className="text-xl font-semibold text-white">Interactive Live Map</h2>
                </div>
                <div className="text-sm text-slate-400">
                  Real-time global monitoring with OpenStreetMap
                </div>
              </div>
              <div className="h-[800px] rounded-lg overflow-hidden">
                <Suspense fallback={
                  <div className="flex items-center justify-center h-full bg-slate-700/50">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400 mx-auto mb-4"></div>
                      <p className="text-slate-300">Loading Interactive Map...</p>
                    </div>
                  </div>
                }>
                  {liveData && (
                    <EnhancedGlobalMap
                      fires={liveData.fires}
                      disasters={liveData.disasters}
                      events={liveData.events}
                      trackingEnabled={isLiveUpdate}
                      onTrackingToggle={() => setIsLiveUpdate(!isLiveUpdate)}
                      onMarkerClick={(marker) => {
                        console.log('Live marker clicked:', marker);
                      }}
                    />
                  )}
                </Suspense>
              </div>
            </div>
          </motion.div>
        )}

        {activeView === 'combined' && (
          <div className="space-y-6">
            {/* Global Hub */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <GlobalEnvironmentalHub />
            </motion.div>

            {/* Enhanced Map */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-slate-800/60 backdrop-blur-sm rounded-xl border border-slate-700/50"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <Navigation className="w-6 h-6 text-blue-400" />
                    <h2 className="text-xl font-semibold text-white">Enhanced Interactive Map</h2>
                  </div>
                  <div className="text-sm text-slate-400">
                    Integrated navigation & resource tracking
                  </div>
                </div>
                <div className="h-[600px] rounded-lg overflow-hidden">
                  <Suspense fallback={
                    <div className="flex items-center justify-center h-full bg-slate-700/50">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
                        <p className="text-slate-300">Loading Enhanced Map...</p>
                      </div>
                    </div>
                  }>
                    {liveData && (
                      <EnhancedGlobalMap
                        fires={liveData.fires}
                        disasters={liveData.disasters}
                        events={liveData.events}
                        trackingEnabled={isLiveUpdate}
                        onTrackingToggle={() => setIsLiveUpdate(!isLiveUpdate)}
                        onMarkerClick={(marker) => {
                          console.log('Enhanced marker clicked:', marker);
                        }}
                      />
                    )}
                  </Suspense>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveMap;
