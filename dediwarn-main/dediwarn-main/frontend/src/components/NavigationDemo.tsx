import React from 'react';
import EnhancedGlobalMap from './EnhancedGlobalMap';
import { motion } from 'framer-motion';
import { MapPin, Navigation, Route, Search } from 'lucide-react';

/**
 * Demo component showcasing the enhanced map navigation features
 */
const NavigationDemo: React.FC = () => {
  const sampleFires = [
    {
      latitude: 34.0522,
      longitude: -118.2437,
      confidence: 85,
      brightness: 350.5,
      scan: 1.0,
      track: 1.0,
      acq_date: '2024-08-14',
      acq_time: '1200',
      satellite: 'T',
      instrument: 'MODIS',
      version: '6.1NRT',
      bright_t31: 280.5,
      bright_ti4: 290.3,
      bright_ti5: 285.7,
      frp: 15.2,
      daynight: 'D'
    },
    {
      latitude: 40.7589,
      longitude: -73.9851,
      confidence: 75,
      brightness: 320.3,
      scan: 1.0,
      track: 1.0,
      acq_date: '2024-08-14',
      acq_time: '1400',
      satellite: 'T',
      instrument: 'MODIS',
      version: '6.1NRT',
      bright_t31: 275.2,
      bright_ti4: 282.1,
      bright_ti5: 278.9,
      frp: 12.8,
      daynight: 'D'
    }
  ];

  const sampleDisasters = [
    {
      eventid: 'TC2024001',
      eventname: 'Hurricane Alexandra',
      subject: 'Tropical Cyclone',
      eventtype: 'TC',
      alertlevel: 'Orange',
      country: 'USA',
      fromdate: '2024-08-10T00:00:00Z',
      todate: '2024-08-16T00:00:00Z',
      coordinate: '25.7617,-80.1918',
      description: 'Category 3 hurricane approaching Florida coast',
      htmldescription: '<p>Category 3 hurricane approaching Florida coast with sustained winds of 120 mph</p>'
    },
    {
      eventid: 'EQ2024005',
      eventname: 'California Earthquake',
      subject: 'Magnitude 6.2 Earthquake',
      eventtype: 'EQ',
      alertlevel: 'Red',
      country: 'USA',
      fromdate: '2024-08-14T08:30:00Z',
      todate: '2024-08-14T12:00:00Z',
      coordinate: '37.7749,-122.4194',
      description: 'Strong earthquake near San Francisco',
      htmldescription: '<p>Magnitude 6.2 earthquake struck near San Francisco causing moderate damage</p>'
    }
  ];

  const sampleEvents = [
    {
      id: 'EONET_123',
      title: 'Wildfire in California',
      description: 'Large wildfire burning in Northern California',
      link: 'https://eonet.sci.gsfc.nasa.gov/api/v3/events/EONET_123',
      closed: undefined,
      categories: [
        {
          id: '8',
          title: 'Wildfires'
        }
      ],
      sources: [
        {
          id: 'InciWeb',
          url: 'http://inciweb.nwcg.gov/'
        }
      ],
      geometry: [
        {
          magnitudeValue: undefined,
          magnitudeUnit: undefined,
          date: '2024-08-14T00:00:00Z',
          type: 'Point',
          coordinates: [-121.5654, 39.7391]
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Enhanced Navigation Map
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Interactive disaster management map with real-time navigation, resource tracking, 
            and OpenStreetMap integration for emergency response coordination.
          </p>
        </motion.div>

        {/* Feature Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
        >
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
            <div className="flex items-center space-x-2 mb-2">
              <Search className="w-5 h-5 text-blue-500" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Location Search</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Search for any location worldwide using OpenStreetMap's Nominatim API
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
            <div className="flex items-center space-x-2 mb-2">
              <Route className="w-5 h-5 text-green-500" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Route Planning</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Calculate optimal routes with multiple alternatives for emergency response
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
            <div className="flex items-center space-x-2 mb-2">
              <Navigation className="w-5 h-5 text-purple-500" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Turn-by-Turn</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Real-time GPS navigation with voice instructions and hazard warnings
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
            <div className="flex items-center space-x-2 mb-2">
              <MapPin className="w-5 h-5 text-red-500" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Resource Tracking</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Track emergency resources and find nearest hospitals, fire stations
            </p>
          </div>
        </motion.div>

        {/* Instructions Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-6 mb-8"
        >
          <h3 className="text-xl font-semibold text-blue-900 dark:text-blue-100 mb-4">
            How to Use Navigation Features
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">🔍 Search & Navigate</h4>
              <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <li>• Click the search icon (🔍) to find any location</li>
                <li>• Click navigation icon (🧭) to start route planning</li>
                <li>• Click on map to set start and destination points</li>
                <li>• View multiple route alternatives with hazard warnings</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">🗺️ Navigation & Tracking</h4>
              <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <li>• Start turn-by-turn navigation with GPS tracking</li>
                <li>• View real-time progress and estimated arrival</li>
                <li>• Receive hazard warnings and route updates</li>
                <li>• Access emergency resources along your route</li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Enhanced Map */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-xl"
        >
          <EnhancedGlobalMap
            fires={sampleFires}
            disasters={sampleDisasters}
            events={sampleEvents}
            onMarkerClick={(marker) => {
              console.log('Marker clicked:', marker);
            }}
            trackingEnabled={false}
            onTrackingToggle={() => {
              console.log('Tracking toggled');
            }}
          />
        </motion.div>

        {/* Footer Information */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400"
        >
          <p>
            Powered by OpenStreetMap, OSRM Routing Service, and Nominatim Geocoding API
          </p>
          <p className="mt-2">
            Real-time disaster data integration with GPS navigation for emergency response teams
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default NavigationDemo;
