import React, { useEffect, useState, Suspense, lazy } from 'react';
import { motion } from 'framer-motion';
import {
  fetchGlobalEnvironmentalData,
  FIRMSFire,
  GDACSAlert,
  WeatherData,
  EONETEvent
} from '../services/GlobalEnvironmentalDataService';
import {
  Flame,
  AlertTriangle,
  Cloud,
  Globe,
  RefreshCw,
  MapPin,
  Thermometer,
  Wind,
  Zap
} from 'lucide-react';

// Lazy load the heavy GlobalMap component
const GlobalMap = lazy(() => import('./GlobalMap'));

// Loading component for the map
const MapLoadingSpinner = () => (
  <div className="flex items-center justify-center h-[600px] bg-slate-800/60 backdrop-blur-sm rounded-xl border border-slate-700/50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400 mx-auto mb-4"></div>
      <p className="text-slate-300">Loading Interactive Map...</p>
    </div>
  </div>
);

interface GlobalData {
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
  };
}

const GlobalEnvironmentalHub: React.FC = () => {
  const [globalData, setGlobalData] = useState<GlobalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState({ lat: 0, lon: 0, name: 'Global' });
  const [trackingEnabled, setTrackingEnabled] = useState(false);

  const regions = [
    { lat: 0, lon: 0, name: 'Global' },
    { lat: 40.7128, lon: -74.0060, name: 'North America' },
    { lat: 52.3676, lon: 4.9041, name: 'Europe' },
    { lat: 35.6762, lon: 139.6503, name: 'Asia-Pacific' },
    { lat: -14.2350, lon: -51.9253, name: 'South America' },
    { lat: -30.5595, lon: 22.9375, name: 'Africa' },
  ];

  const loadGlobalData = React.useCallback(async () => {
    console.log('Loading global environmental data...');
    setLoading(true);
    try {
      const data = await fetchGlobalEnvironmentalData(selectedRegion.lat, selectedRegion.lon);
      console.log('Global data loaded:', data);
      if (data) {
        setGlobalData(data);
      } else {
        console.warn('No data received from fetchGlobalEnvironmentalData');
      }
    } catch (error) {
      console.error('Error loading global data:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedRegion]);

  useEffect(() => {
    loadGlobalData();
    const interval = setInterval(loadGlobalData, 300000); // Refresh every 5 minutes
    return () => clearInterval(interval);
  }, [loadGlobalData]);

  const getAlertLevelColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'red': return 'text-red-400 bg-red-500/20 border-red-500/50';
      case 'orange': return 'text-orange-400 bg-orange-500/20 border-orange-500/50';
      case 'yellow': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/50';
      default: return 'text-green-400 bg-green-500/20 border-green-500/50';
    }
  };

  const getEventIcon = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'wildfires': return <Flame className="h-5 w-5 text-red-400" />;
      case 'severe storms': return <Zap className="h-5 w-5 text-blue-400" />;
      case 'volcanoes': return <AlertTriangle className="h-5 w-5 text-orange-400" />;
      default: return <Globe className="h-5 w-5 text-purple-400" />;
    }
  };

  if (loading && !globalData) {
    return (
      <div className="bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900 min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="text-blue-400 mr-4"
        >
          <RefreshCw className="h-12 w-12" />
        </motion.div>
        <span className="text-white text-xl">Loading Global Environmental Data...</span>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900 min-h-screen text-white">
      {/* Header */}
      <div className="p-6 bg-slate-800/50 backdrop-blur-sm border-b border-slate-700/50">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              🌐 Global Environmental Hub
            </h1>
            <p className="text-slate-300 mt-2">Real-time environmental data from NASA, GDACS, and OpenWeatherMap</p>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            {/* Region Selector */}
            <select
              value={selectedRegion.name}
              onChange={(e) => {
                const region = regions.find(r => r.name === e.target.value);
                if (region) setSelectedRegion(region);
              }}
              className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              title="Select region for weather data"
              aria-label="Select region for weather data"
            >
              {regions.map(region => (
                <option key={region.name} value={region.name}>{region.name}</option>
              ))}
            </select>
            
            {/* Refresh Button */}
            <button
              onClick={loadGlobalData}
              disabled={loading}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-4 py-2 rounded-lg transition-colors"
              title="Refresh global data"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
        
        {globalData && (
          <div className="mt-4 text-sm text-slate-400">
            Last updated: {new Date(globalData.lastUpdated).toLocaleString()}
          </div>
        )}
      </div>

      {globalData && (
        <div className="p-6 space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-800/60 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Active Fires</p>
                  <p className="text-2xl font-bold text-red-400">{globalData.summary.activeFires}</p>
                  <p className="text-xs text-slate-500 mt-1">NASA FIRMS</p>
                </div>
                <Flame className="h-8 w-8 text-red-400" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-slate-800/60 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Active Disasters</p>
                  <p className="text-2xl font-bold text-orange-400">{globalData.summary.activeDisasters}</p>
                  <p className="text-xs text-slate-500 mt-1">GDACS</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-orange-400" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-slate-800/60 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Natural Events</p>
                  <p className="text-2xl font-bold text-purple-400">{globalData.summary.naturalEvents}</p>
                  <p className="text-xs text-slate-500 mt-1">NASA EONET</p>
                </div>
                <Globe className="h-8 w-8 text-purple-400" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-slate-800/60 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Weather</p>
                  <p className="text-2xl font-bold text-blue-400">{globalData.summary.weatherCondition}</p>
                  <p className="text-xs text-slate-500 mt-1">OpenWeatherMap</p>
                </div>
                <Cloud className="h-8 w-8 text-blue-400" />
              </div>
            </motion.div>
          </div>

          {/* Interactive Global Map */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-slate-800/60 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <MapPin className="h-6 w-6 text-emerald-400" />
                <h2 className="text-xl font-semibold">Global Resource & Disaster Tracking</h2>
              </div>
              <div className="text-sm text-slate-400">
                Live OpenStreetMap Integration
              </div>
            </div>
            <Suspense fallback={<MapLoadingSpinner />}>
              <GlobalMap
                fires={globalData.fires}
                disasters={globalData.disasters}
                events={globalData.events}
                trackingEnabled={trackingEnabled}
                onTrackingToggle={() => setTrackingEnabled(!trackingEnabled)}
                onMarkerClick={(marker) => {
                  console.log('Marker clicked:', marker);
                  // You can add more interaction logic here
                }}
              />
            </Suspense>
          </motion.div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* NASA FIRMS - Active Fires */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-slate-800/60 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50"
            >
              <div className="flex items-center gap-3 mb-4">
                <Flame className="h-6 w-6 text-red-400" />
                <h2 className="text-xl font-semibold">NASA FIRMS - Active Fires</h2>
              </div>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {globalData.fires.slice(0, 10).map((fire, index) => (
                  <div key={index} className="bg-slate-700/50 rounded-lg p-3 border border-slate-600/50">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-red-300 flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          {fire.latitude.toFixed(3)}, {fire.longitude.toFixed(3)}
                        </p>
                        <p className="text-sm text-slate-400 mt-1">
                          🛰️ Satellite: {fire.satellite} | Confidence: {fire.confidence}%
                        </p>
                        <p className="text-sm text-slate-400">
                          🌡️ Brightness: {fire.bright_ti4}K | 🔥 FRP: {fire.frp} MW
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          📅 {fire.acq_date} at {fire.acq_time}
                        </p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded border ${
                        fire.daynight === 'D' 
                          ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50' 
                          : 'bg-blue-500/20 text-blue-300 border-blue-500/50'
                      }`}>
                        {fire.daynight === 'D' ? '☀️ Day' : '🌙 Night'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* GDACS - Disaster Alerts */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-slate-800/60 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50"
            >
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="h-6 w-6 text-orange-400" />
                <h2 className="text-xl font-semibold">GDACS - Disaster Alerts</h2>
              </div>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {globalData.disasters.map((disaster, index) => (
                  <div key={index} className="bg-slate-700/50 rounded-lg p-3 border border-slate-600/50">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-orange-300">{disaster.eventname}</h3>
                      <span className={`text-xs px-2 py-1 rounded border ${getAlertLevelColor(disaster.alertlevel)}`}>
                        {disaster.alertlevel}
                      </span>
                    </div>
                    <p className="text-sm text-slate-400 mb-2">{disaster.subject}</p>
                    <div className="flex justify-between items-center text-xs text-slate-500">
                      <span>🌍 {disaster.country}</span>
                      <span>📅 {disaster.fromdate}</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Second Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* OpenWeatherMap - Current Weather */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-slate-800/60 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50"
            >
              <div className="flex items-center gap-3 mb-4">
                <Cloud className="h-6 w-6 text-blue-400" />
                <h2 className="text-xl font-semibold">OpenWeatherMap - Current Weather</h2>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600/50">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-slate-400 text-sm">Location</p>
                    <p className="font-medium text-blue-300">{globalData.weather.name}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Condition</p>
                    <p className="font-medium text-blue-300">{globalData.weather.weather[0]?.description}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Temperature</p>
                    <p className="font-medium text-blue-300 flex items-center gap-1">
                      <Thermometer className="h-4 w-4" />
                      {globalData.weather.main.temp.toFixed(1)}°C
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Wind Speed</p>
                    <p className="font-medium text-blue-300 flex items-center gap-1">
                      <Wind className="h-4 w-4" />
                      {globalData.weather.wind.speed} m/s
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Humidity</p>
                    <p className="font-medium text-blue-300">{globalData.weather.main.humidity}%</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Pressure</p>
                    <p className="font-medium text-blue-300">{globalData.weather.main.pressure} hPa</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* NASA EONET - Natural Events */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-slate-800/60 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50"
            >
              <div className="flex items-center gap-3 mb-4">
                <Globe className="h-6 w-6 text-purple-400" />
                <h2 className="text-xl font-semibold">NASA EONET - Natural Events</h2>
              </div>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {globalData.events.slice(0, 5).map((event, index) => (
                  <div key={index} className="bg-slate-700/50 rounded-lg p-3 border border-slate-600/50">
                    <div className="flex items-start gap-3">
                      {getEventIcon(event.categories[0]?.title || '')}
                      <div className="flex-1">
                        <h3 className="font-medium text-purple-300">{event.title}</h3>
                        <p className="text-sm text-slate-400 mt-1">{event.description}</p>
                        <div className="flex justify-between items-center mt-2 text-xs text-slate-500">
                          <span>{event.categories[0]?.title || 'Unknown'}</span>
                          <span>📅 {new Date(event.geometry[0]?.date).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GlobalEnvironmentalHub;
