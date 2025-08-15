import React, { useState, useEffect } from 'react';
import { CloudRain, Thermometer, Wind, Eye, AlertTriangle, TrendingUp, MapPin, Zap, Mountain, Waves } from 'lucide-react';
import { LiveChart } from '../components/LiveChart';

interface DisasterPrediction {
  id: string;
  type: string;
  location: string;
  probability: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timeframe: string;
  description: string;
  affectedPopulation: number;
  confidence: number;
  lastUpdated: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  color: string;
}

interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  pressure: number;
  visibility: number;
  uvIndex: number;
}

export const Prediction: React.FC = () => {
  const [selectedDisaster, setSelectedDisaster] = useState<string>('all');
  const [weatherData, setWeatherData] = useState<WeatherData>({
    temperature: 22,
    humidity: 65,
    windSpeed: 15,
    pressure: 1013,
    visibility: 10,
    uvIndex: 6
  });

  const disasterTypes = [
    { id: 'hurricane', name: 'Hurricane', icon: Wind, color: 'text-blue-400' },
    { id: 'earthquake', name: 'Earthquake', icon: Mountain, color: 'text-orange-400' },
    { id: 'flood', name: 'Flood', icon: Waves, color: 'text-cyan-400' },
    { id: 'wildfire', name: 'Wildfire', icon: Zap, color: 'text-red-400' },
    { id: 'tornado', name: 'Tornado', icon: Wind, color: 'text-purple-400' },
    { id: 'tsunami', name: 'Tsunami', icon: Waves, color: 'text-indigo-400' },
    { id: 'volcano', name: 'Volcanic Activity', icon: Mountain, color: 'text-yellow-400' },
    { id: 'drought', name: 'Drought', icon: Thermometer, color: 'text-amber-400' },
    { id: 'blizzard', name: 'Blizzard', icon: CloudRain, color: 'text-slate-400' },
    { id: 'heatwave', name: 'Heat Wave', icon: Thermometer, color: 'text-orange-500' }
  ];

  const predictions: DisasterPrediction[] = [
    {
      id: '1',
      type: 'Hurricane',
      location: 'Gulf of Mexico',
      probability: 85,
      severity: 'critical',
      timeframe: '3-5 days',
      description: 'Category 4 hurricane forming in the Gulf with potential landfall along the Texas coast.',
      affectedPopulation: 2500000,
      confidence: 92,
      lastUpdated: '2024-01-15 14:30',
      icon: Wind,
      color: 'text-blue-400'
    },
    {
      id: '2',
      type: 'Earthquake',
      location: 'San Andreas Fault, CA',
      probability: 72,
      severity: 'high',
      timeframe: '7-14 days',
      description: 'Increased seismic activity detected along the San Andreas Fault system.',
      affectedPopulation: 8000000,
      confidence: 78,
      lastUpdated: '2024-01-15 12:15',
      icon: Mountain,
      color: 'text-orange-400'
    },
    {
      id: '3',
      type: 'Wildfire',
      location: 'Southern California',
      probability: 68,
      severity: 'high',
      timeframe: '1-3 days',
      description: 'Extreme fire weather conditions with low humidity and high winds expected.',
      affectedPopulation: 1200000,
      confidence: 88,
      lastUpdated: '2024-01-15 16:45',
      icon: Zap,
      color: 'text-red-400'
    },
    {
      id: '4',
      type: 'Flood',
      location: 'Mississippi River Basin',
      probability: 55,
      severity: 'medium',
      timeframe: '5-7 days',
      description: 'Heavy rainfall and snowmelt may cause river levels to exceed flood stage.',
      affectedPopulation: 3500000,
      confidence: 71,
      lastUpdated: '2024-01-15 10:20',
      icon: Waves,
      color: 'text-cyan-400'
    },
    {
      id: '5',
      type: 'Tornado',
      location: 'Tornado Alley, TX-OK',
      probability: 45,
      severity: 'medium',
      timeframe: '2-4 days',
      description: 'Atmospheric conditions favorable for severe thunderstorm and tornado development.',
      affectedPopulation: 850000,
      confidence: 65,
      lastUpdated: '2024-01-15 09:10',
      icon: Wind,
      color: 'text-purple-400'
    },
    {
      id: '6',
      type: 'Tsunami',
      location: 'Pacific Ring of Fire',
      probability: 35,
      severity: 'critical',
      timeframe: '24-48 hours',
      description: 'Underwater seismic activity may trigger tsunami waves across the Pacific.',
      affectedPopulation: 15000000,
      confidence: 58,
      lastUpdated: '2024-01-15 08:30',
      icon: Waves,
      color: 'text-indigo-400'
    }
  ];

  useEffect(() => {
    // Simulate real-time weather data updates
    const interval = setInterval(() => {
      setWeatherData(prev => ({
        temperature: prev.temperature + (Math.random() - 0.5) * 2,
        humidity: Math.max(0, Math.min(100, prev.humidity + (Math.random() - 0.5) * 5)),
        windSpeed: Math.max(0, prev.windSpeed + (Math.random() - 0.5) * 3),
        pressure: prev.pressure + (Math.random() - 0.5) * 5,
        visibility: Math.max(0, Math.min(20, prev.visibility + (Math.random() - 0.5) * 2)),
        uvIndex: Math.max(0, Math.min(11, prev.uvIndex + (Math.random() - 0.5) * 1))
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const filteredPredictions = selectedDisaster === 'all' 
    ? predictions 
    : predictions.filter(p => p.type.toLowerCase() === selectedDisaster);

  return (
    <div className="min-h-screen pt-8 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in-up">
          <h1 className="text-4xl font-bold text-white mb-4">Disaster Prediction Center</h1>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto">
            Advanced AI-powered prediction system monitoring global weather patterns and geological activity to forecast natural disasters.
          </p>
        </div>

        {/* Real-time Weather Dashboard */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
          {[
            { label: 'Temperature', value: `${weatherData.temperature.toFixed(1)}°C`, icon: Thermometer, color: 'text-orange-400' },
            { label: 'Humidity', value: `${weatherData.humidity.toFixed(0)}%`, icon: CloudRain, color: 'text-blue-400' },
            { label: 'Wind Speed', value: `${weatherData.windSpeed.toFixed(1)} km/h`, icon: Wind, color: 'text-cyan-400' },
            { label: 'Pressure', value: `${weatherData.pressure.toFixed(0)} hPa`, icon: TrendingUp, color: 'text-green-400' },
            { label: 'Visibility', value: `${weatherData.visibility.toFixed(1)} km`, icon: Eye, color: 'text-purple-400' },
            { label: 'UV Index', value: weatherData.uvIndex.toFixed(1), icon: Zap, color: 'text-yellow-400' }
          ].map((metric, index) => (
            <div
              key={index}
              className={`bg-slate-800/60 backdrop-blur-sm rounded-xl p-4 border border-slate-700 hover:border-slate-600 transition-all duration-300 animate-fade-in-up fade-delay-${index}`}
            >
              <div className="flex items-center justify-between mb-2">
                <metric.icon className={`h-5 w-5 ${metric.color}`} />
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              </div>
              <div className="text-lg font-bold text-white">{metric.value}</div>
              <div className="text-slate-400 text-xs">{metric.label}</div>
            </div>
          ))}
        </div>

        {/* Disaster Type Filter */}
        <div className="bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 border border-slate-700 mb-8 animate-fade-in-up fade-delay-7">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setSelectedDisaster('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                selectedDisaster === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
              }`}
            >
              All Disasters
            </button>
            {disasterTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setSelectedDisaster(type.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  selectedDisaster === type.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                }`}
              >
                <type.icon className={`h-4 w-4 ${selectedDisaster === type.id ? 'text-white' : type.color}`} />
                <span>{type.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Prediction Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <div className="animate-fade-in-up fade-delay-8">
            <LiveChart 
              type="line" 
              title="Disaster Probability Trends" 
              height={300}
            />
          </div>
          <div className="animate-fade-in-up fade-delay-9">
            <LiveChart 
              type="bar" 
              title="Risk Distribution by Region" 
              height={300}
            />
          </div>
        </div>

        {/* Prediction Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {filteredPredictions.map((prediction, index) => (
            <div
              key={prediction.id}
              className={`bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 border border-slate-700 hover:border-slate-600 transition-all duration-300 hover:transform hover:scale-105 animate-fade-in-up prediction-delay-${index}`}
            >
              <>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-3 bg-slate-700 rounded-lg`}>
                      <prediction.icon className={`h-6 w-6 ${prediction.color}`} />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white">{prediction.type}</h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <MapPin className="h-4 w-4 text-slate-400" />
                        <span className="text-slate-400 text-sm">{prediction.location}</span>
                      </div>
                    </div>
                  </div>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getSeverityColor(prediction.severity)}`}>
                    {prediction.severity.toUpperCase()}
                  </span>
                </div>

                <p className="text-slate-400 mb-4 leading-relaxed">{prediction.description}</p>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-slate-700/30 rounded-lg p-3">
                    <div className="text-2xl font-bold text-white mb-1">{prediction.probability}%</div>
                    <div className="text-slate-400 text-sm">Probability</div>
                  </div>
                  <div className="bg-slate-700/30 rounded-lg p-3">
                    <div className="text-2xl font-bold text-white mb-1">{prediction.confidence}%</div>
                    <div className="text-slate-400 text-sm">Confidence</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400">Risk Level:</span>
                    <div
                      className={`h-2 rounded-full transition-all duration-1000 risk-bar-width-${Math.round(prediction.probability)} ${
                        prediction.probability >= 80 ? 'bg-red-500' :
                        prediction.probability >= 60 ? 'bg-orange-500' :
                        prediction.probability >= 40 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                    />
                  </div>

                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400">Timeframe:</span>
                    <span className="text-white font-medium">{prediction.timeframe}</span>
                  </div>

                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400">Affected Population:</span>
                    <span className="text-white font-medium">
                      {prediction.affectedPopulation.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400">Last Updated:</span>
                    <span className="text-white font-medium">{prediction.lastUpdated}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-700">
                  <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center space-x-2">
                    <AlertTriangle className="h-4 w-4" />
                    <span>Create Alert</span>
                  </button>
                </div>
              </>
            </div>
          ))}
        </div>

        {/* AI Model Information */}
        <div className="mt-12 bg-slate-800/60 backdrop-blur-sm rounded-2xl p-8 border border-slate-700 animate-fade-in-up fade-delay-15">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-4">AI Prediction Models</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Our advanced machine learning models analyze thousands of data points to provide accurate disaster predictions.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { 
                title: 'Weather Pattern Analysis', 
                accuracy: '94.2%', 
                description: 'Analyzes atmospheric conditions, temperature gradients, and pressure systems',
                dataPoints: '50,000+'
              },
              { 
                title: 'Seismic Activity Monitor', 
                accuracy: '87.8%', 
                description: 'Monitors tectonic plate movements and underground stress patterns',
                dataPoints: '25,000+'
              },
              { 
                title: 'Historical Data Correlation', 
                accuracy: '91.5%', 
                description: 'Compares current conditions with historical disaster patterns',
                dataPoints: '100,000+'
              }
            ].map((model, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold text-blue-400 mb-2">{model.accuracy}</div>
                <div className="text-white font-medium mb-2">{model.title}</div>
                <div className="text-slate-400 text-sm mb-2">{model.description}</div>
                <div className="text-slate-500 text-xs">{model.dataPoints} data points</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};