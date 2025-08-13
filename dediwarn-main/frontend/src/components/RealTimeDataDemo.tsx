import React, { useState } from 'react';
import RealTimeDataDisplay from './RealTimeDataDisplay';
import { MapPin, Activity } from 'lucide-react';

const RealTimeDataDemo: React.FC = () => {
  const [userLocation] = useState<{ lat: number; lng: number }>({
    lat: 37.7749, // San Francisco coordinates for demo
    lng: -122.4194
  });

  return (
    <div className="real-time-data-demo p-6 bg-slate-900 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Demo Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <Activity className="w-8 h-8 text-blue-500" />
            <h1 className="text-3xl font-bold text-white">Real-Time Emergency Data Integration</h1>
          </div>
          <p className="text-gray-300 text-lg">
            Live emergency data from USGS Earthquakes, National Weather Service, Traffic APIs, and Hospital Systems
          </p>
          
          <div className="mt-4 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <MapPin className="w-4 h-4 text-blue-500" />
              <span className="text-blue-300 font-medium">Demo Location: San Francisco, CA</span>
            </div>
            <p className="text-sm text-blue-200">
              Coordinates: {userLocation.lat}, {userLocation.lng} | Radius: 100km
            </p>
          </div>
        </div>

        {/* Real-time Data Display */}
        <RealTimeDataDisplay
          userLocation={userLocation}
          isMinimized={false}
          showInCall={false}
          className="shadow-2xl"
        />

        {/* Integration Information */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-slate-800/50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-orange-500 mb-3 flex items-center">
              <Activity className="w-5 h-5 mr-2" />
              USGS Earthquakes
            </h3>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• Real-time earthquake data</li>
              <li>• Magnitude 2.5+ worldwide</li>
              <li>• Tsunami alerts</li>
              <li>• Color-coded severity</li>
              <li>• Updates every 5 minutes</li>
            </ul>
          </div>

          <div className="bg-slate-800/50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-500 mb-3 flex items-center">
              <Activity className="w-5 h-5 mr-2" />
              Weather Alerts
            </h3>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• NOAA Weather Service</li>
              <li>• Severe weather warnings</li>
              <li>• Hurricane/tornado alerts</li>
              <li>• Flood advisories</li>
              <li>• Updates every 10 minutes</li>
            </ul>
          </div>

          <div className="bg-slate-800/50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-red-500 mb-3 flex items-center">
              <Activity className="w-5 h-5 mr-2" />
              Traffic Incidents
            </h3>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• HERE Traffic API</li>
              <li>• Real-time accidents</li>
              <li>• Road closures</li>
              <li>• Construction zones</li>
              <li>• Updates every 2 minutes</li>
            </ul>
          </div>

          <div className="bg-slate-800/50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-green-500 mb-3 flex items-center">
              <Activity className="w-5 h-5 mr-2" />
              Hospital Capacity
            </h3>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• Bed availability</li>
              <li>• ICU capacity</li>
              <li>• Emergency room status</li>
              <li>• Wait times</li>
              <li>• Updates every 15 minutes</li>
            </ul>
          </div>
        </div>

        {/* Technical Features */}
        <div className="mt-8 bg-slate-800/30 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4">Technical Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <h4 className="font-semibold text-blue-400 mb-2">Real-time Updates</h4>
              <p className="text-sm text-gray-300">WebSocket connections provide live data streaming with automatic reconnection and error handling.</p>
            </div>
            <div>
              <h4 className="font-semibold text-green-400 mb-2">Intelligent Caching</h4>
              <p className="text-sm text-gray-300">Smart caching with TTL reduces API calls while ensuring fresh data during emergencies.</p>
            </div>
            <div>
              <h4 className="font-semibold text-purple-400 mb-2">Location-based</h4>
              <p className="text-sm text-gray-300">All data is filtered by user location with configurable radius for relevant emergency information.</p>
            </div>
            <div>
              <h4 className="font-semibold text-orange-400 mb-2">Priority Filtering</h4>
              <p className="text-sm text-gray-300">High-priority alerts are automatically identified and highlighted for immediate attention.</p>
            </div>
            <div>
              <h4 className="font-semibold text-red-400 mb-2">Rate Limiting</h4>
              <p className="text-sm text-gray-300">Built-in rate limiting with emergency bypass ensures system stability during high-load situations.</p>
            </div>
            <div>
              <h4 className="font-semibold text-cyan-400 mb-2">Fallback Systems</h4>
              <p className="text-sm text-gray-300">Mock data and cached responses ensure the system remains functional even when external APIs fail.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealTimeDataDemo;
