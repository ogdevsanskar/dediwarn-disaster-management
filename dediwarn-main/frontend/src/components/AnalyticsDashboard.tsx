import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  RadialLinearScale,
  Filler
} from 'chart.js';
import { Line, Bar, Doughnut, Radar, Scatter } from 'react-chartjs-2';
import { 
  TrendingUp, 
  TrendingDown,
  AlertTriangle, 
  Users, 
  Activity, 
  Clock, 
  BarChart3,
  PieChart,
  Zap,
  Shield,
  Globe,
  Flame,
  Wind,
  Mountain,
  Waves,
  Calendar,
  MapPin,
  Database
} from 'lucide-react';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  RadialLinearScale,
  Filler
);

interface DisasterData {
  id: string;
  type: string;
  magnitude: number;
  location: { lat: number; lng: number; name: string };
  timestamp: Date;
  affected: number;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Active' | 'Monitoring' | 'Resolved';
  economicLoss: number;
  responseTime: number;
}

interface AnalyticsStats {
  totalDisasters: number;
  activeIncidents: number;
  peopleAffected: number;
  responseTime: number;
  alertsSent: number;
  accuracy: number;
  economicLoss: number;
  predictedEvents: number;
}

export const AnalyticsDashboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | '1y'>('30d');
  const [stats, setStats] = useState<AnalyticsStats>({
    totalDisasters: 0,
    activeIncidents: 0,
    peopleAffected: 0,
    responseTime: 0,
    alertsSent: 0,
    accuracy: 0,
    economicLoss: 0,
    predictedEvents: 0
  });
  const [disasters, setDisasters] = useState<DisasterData[]>([]);
  const [loading, setLoading] = useState(true);

  // Generate realistic disaster data based on actual patterns
  useEffect(() => {
    const generateRealisticData = () => {
      const disasterTypes = [
        { type: 'Earthquake', frequency: 0.15, avgMagnitude: 5.2, avgAffected: 2500 },
        { type: 'Flood', frequency: 0.25, avgMagnitude: 3.8, avgAffected: 5000 },
        { type: 'Hurricane', frequency: 0.08, avgMagnitude: 6.1, avgAffected: 15000 },
        { type: 'Wildfire', frequency: 0.20, avgMagnitude: 4.5, avgAffected: 800 },
        { type: 'Tornado', frequency: 0.12, avgMagnitude: 4.2, avgAffected: 150 },
        { type: 'Tsunami', frequency: 0.02, avgMagnitude: 7.8, avgAffected: 25000 },
        { type: 'Drought', frequency: 0.10, avgMagnitude: 5.5, avgAffected: 50000 },
        { type: 'Volcanic Eruption', frequency: 0.05, avgMagnitude: 6.0, avgAffected: 8000 },
        { type: 'Landslide', frequency: 0.08, avgMagnitude: 3.2, avgAffected: 200 }
      ];

      const locations = [
        { lat: 35.6762, lng: 139.6503, name: 'Tokyo, Japan', riskLevel: 0.8 },
        { lat: 37.7749, lng: -122.4194, name: 'San Francisco, USA', riskLevel: 0.7 },
        { lat: -6.2088, lng: 106.8456, name: 'Jakarta, Indonesia', riskLevel: 0.9 },
        { lat: 19.4326, lng: -99.1332, name: 'Mexico City, Mexico', riskLevel: 0.75 },
        { lat: 26.2041, lng: 127.6793, name: 'Okinawa, Japan', riskLevel: 0.6 },
        { lat: 37.5665, lng: 126.9780, name: 'Seoul, South Korea', riskLevel: 0.5 },
        { lat: -33.8688, lng: 151.2093, name: 'Sydney, Australia', riskLevel: 0.4 },
        { lat: 40.7128, lng: -74.0060, name: 'New York, USA', riskLevel: 0.3 },
        { lat: 25.2048, lng: 55.2708, name: 'Dubai, UAE', riskLevel: 0.2 },
        { lat: 28.6139, lng: 77.2090, name: 'New Delhi, India', riskLevel: 0.6 },
        { lat: -23.5505, lng: -46.6333, name: 'São Paulo, Brazil', riskLevel: 0.4 },
        { lat: 51.5074, lng: -0.1278, name: 'London, UK', riskLevel: 0.2 }
      ];

      const sampleDisasters: DisasterData[] = [];
      const daysInRange = timeRange === '24h' ? 1 : timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 365;
      
      // Generate disasters based on realistic frequency patterns
      for (let day = 0; day < daysInRange; day++) {
        disasterTypes.forEach(disasterType => {
          // Calculate daily probability based on frequency
          const dailyProbability = disasterType.frequency / (365 / daysInRange);
          
          if (Math.random() < dailyProbability) {
            const timestamp = new Date();
            timestamp.setDate(timestamp.getDate() - day);
            timestamp.setHours(Math.floor(Math.random() * 24));

            const location = locations[Math.floor(Math.random() * locations.length)];
            const magnitudeVariation = (Math.random() - 0.5) * 2; // ±1 variation
            const magnitude = Math.max(1, disasterType.avgMagnitude + magnitudeVariation);
            
            // More realistic affected population based on magnitude and location risk
            const baseAffected = disasterType.avgAffected * location.riskLevel * (magnitude / disasterType.avgMagnitude);
            const affected = Math.floor(baseAffected * (0.5 + Math.random()));

            // Economic loss calculation (realistic formula)
            const economicLoss = affected * magnitude * (50 + Math.random() * 200); // $50-250 per person per magnitude

            // Response time varies by disaster type and location
            const baseResponseTime = disasterType.type === 'Earthquake' ? 15 : 
                                   disasterType.type === 'Tsunami' ? 8 :
                                   disasterType.type === 'Hurricane' ? 45 :
                                   disasterType.type === 'Wildfire' ? 25 : 20;
            const responseTime = baseResponseTime + (Math.random() * 20 - 10);

            const disaster: DisasterData = {
              id: `disaster_${sampleDisasters.length}`,
              type: disasterType.type,
              magnitude: magnitude,
              location: location,
              timestamp,
              affected,
              severity: magnitude > 6.5 ? 'Critical' : 
                       magnitude > 5 ? 'High' : 
                       magnitude > 3.5 ? 'Medium' : 'Low',
              status: day < 3 ? 'Active' : day < 7 ? 'Monitoring' : 'Resolved',
              economicLoss,
              responseTime: Math.max(5, responseTime)
            };

            sampleDisasters.push(disaster);
          }
        });
      }

      setDisasters(sampleDisasters);
      
      // Calculate realistic stats
      const activeIncidents = sampleDisasters.filter(d => d.status === 'Active').length;
      const totalPeopleAffected = sampleDisasters.reduce((sum, d) => sum + d.affected, 0);
      const totalEconomicLoss = sampleDisasters.reduce((sum, d) => sum + d.economicLoss, 0);
      const avgResponseTime = sampleDisasters.reduce((sum, d) => sum + d.responseTime, 0) / sampleDisasters.length;
      
      setStats({
        totalDisasters: sampleDisasters.length,
        activeIncidents,
        peopleAffected: totalPeopleAffected,
        responseTime: avgResponseTime || 0,
        alertsSent: Math.floor(totalPeopleAffected * 0.8), // 80% alert coverage
        accuracy: 88.5 + Math.random() * 8, // 88.5-96.5% accuracy
        economicLoss: totalEconomicLoss,
        predictedEvents: Math.floor(sampleDisasters.length * 1.15) // 15% more predicted
      });
      
      setLoading(false);
    };

    generateRealisticData();
  }, [timeRange]);

  // Enhanced chart configurations with realistic data patterns
  const generateMonthlyTrends = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    const last12Months = [];
    
    for (let i = 11; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12;
      last12Months.push(months[monthIndex]);
    }

    // Realistic seasonal patterns
    const earthquakePattern = [15, 18, 22, 19, 17, 14, 12, 13, 16, 20, 23, 18];
    const floodPattern = [8, 10, 15, 25, 35, 42, 48, 45, 38, 28, 18, 12];
    const hurricanePattern = [1, 2, 3, 4, 8, 12, 18, 22, 15, 8, 4, 2];
    const wildfirePattern = [5, 8, 12, 18, 25, 35, 45, 52, 38, 22, 12, 7];

    return {
      labels: last12Months,
      datasets: [
        {
          label: 'Earthquakes',
          data: earthquakePattern,
          borderColor: 'rgb(239, 68, 68)',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          fill: true,
          tension: 0.4,
        },
        {
          label: 'Floods',
          data: floodPattern,
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          fill: true,
          tension: 0.4,
        },
        {
          label: 'Hurricanes',
          data: hurricanePattern,
          borderColor: 'rgb(16, 185, 129)',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          fill: true,
          tension: 0.4,
        },
        {
          label: 'Wildfires',
          data: wildfirePattern,
          borderColor: 'rgb(245, 158, 11)',
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          fill: true,
          tension: 0.4,
        }
      ]
    };
  };

  const severityDistribution = {
    labels: ['Low Risk', 'Medium Risk', 'High Risk', 'Critical Risk'],
    datasets: [{
      data: [
        disasters.filter(d => d.severity === 'Low').length,
        disasters.filter(d => d.severity === 'Medium').length,
        disasters.filter(d => d.severity === 'High').length,
        disasters.filter(d => d.severity === 'Critical').length,
      ],
      backgroundColor: [
        'rgba(34, 197, 94, 0.8)',   // Green
        'rgba(245, 158, 11, 0.8)',  // Amber
        'rgba(249, 115, 22, 0.8)',  // Orange
        'rgba(239, 68, 68, 0.8)',   // Red
      ],
      borderWidth: 3,
      borderColor: '#1e293b',
      hoverBorderWidth: 4,
    }]
  };

  const responseTimeData = {
    labels: ['Earthquake', 'Tsunami', 'Hurricane', 'Wildfire', 'Flood', 'Tornado'],
    datasets: [{
      label: 'Average Response Time (minutes)',
      data: [12.5, 8.2, 35.7, 22.1, 18.4, 15.8],
      backgroundColor: [
        'rgba(239, 68, 68, 0.8)',
        'rgba(59, 130, 246, 0.8)',
        'rgba(16, 185, 129, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(139, 92, 246, 0.8)',
        'rgba(236, 72, 153, 0.8)'
      ],
      borderColor: [
        'rgb(239, 68, 68)',
        'rgb(59, 130, 246)',
        'rgb(16, 185, 129)',
        'rgb(245, 158, 11)',
        'rgb(139, 92, 246)',
        'rgb(236, 72, 153)'
      ],
      borderWidth: 2,
    }]
  };

  const riskAssessmentData = {
    labels: [
      'Seismic Activity',
      'Climate Patterns',
      'Population Density',
      'Infrastructure Quality',
      'Emergency Preparedness',
      'Historical Frequency'
    ],
    datasets: [{
      label: 'Risk Level (%)',
      data: [72, 68, 85, 45, 62, 78],
      backgroundColor: 'rgba(236, 72, 153, 0.2)',
      borderColor: 'rgba(236, 72, 153, 1)',
      borderWidth: 3,
      pointBackgroundColor: 'rgba(236, 72, 153, 1)',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(236, 72, 153, 1)',
      pointRadius: 6,
      pointHoverRadius: 8,
    }]
  };

  // Magnitude vs Impact correlation
  const impactCorrelationData = {
    datasets: [{
      label: 'Economic Impact vs Magnitude',
      data: disasters.slice(0, 50).map(d => ({
        x: d.magnitude,
        y: d.economicLoss / 1000000 // Convert to millions
      })),
      backgroundColor: 'rgba(59, 130, 246, 0.6)',
      borderColor: 'rgb(59, 130, 246)',
      borderWidth: 2,
      pointRadius: 6,
      pointHoverRadius: 8,
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#e2e8f0',
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleColor: '#e2e8f0',
        bodyColor: '#e2e8f0',
        borderColor: '#334155',
        borderWidth: 1,
      }
    },
    scales: {
      x: {
        ticks: {
          color: '#94a3b8'
        },
        grid: {
          color: 'rgba(51, 65, 85, 0.3)'
        }
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: '#94a3b8'
        },
        grid: {
          color: 'rgba(51, 65, 85, 0.3)'
        }
      },
    },
  };

  const StatCard = ({ title, value, icon: Icon, color, subtitle, trend }: {
    title: string;
    value: string | number;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    subtitle?: string;
    trend?: 'up' | 'down' | 'stable';
  }) => (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6 hover:border-slate-600 transition-all duration-300">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-slate-300 text-sm font-medium">{title}</p>
          <div className="flex items-center space-x-2">
            <p className={`text-2xl font-bold ${color} mt-1`}>
              {typeof value === 'number' && value > 1000000 
                ? `$${(value / 1000000).toFixed(1)}M`
                : typeof value === 'number' && value > 1000
                ? `${(value / 1000).toFixed(1)}K`
                : value
              }
            </p>
            {trend && (
              <div className={`flex items-center text-xs ${
                trend === 'up' ? 'text-red-400' : 
                trend === 'down' ? 'text-green-400' : 'text-slate-400'
              }`}>
                {trend === 'up' && <TrendingUp className="w-3 h-3" />}
                {trend === 'down' && <TrendingDown className="w-3 h-3" />}
                {trend === 'stable' && <Activity className="w-3 h-3" />}
              </div>
            )}
          </div>
          {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-lg ${
          color.includes('red') ? 'bg-red-900/30 border border-red-700/50' : 
          color.includes('blue') ? 'bg-blue-900/30 border border-blue-700/50' : 
          color.includes('green') ? 'bg-green-900/30 border border-green-700/50' : 
          color.includes('yellow') ? 'bg-yellow-900/30 border border-yellow-700/50' : 
          color.includes('purple') ? 'bg-purple-900/30 border border-purple-700/50' :
          'bg-orange-900/30 border border-orange-700/50'
        }`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Activity className="w-12 h-12 text-blue-400 animate-spin mx-auto mb-4" />
          <p className="text-slate-300 text-lg">Loading disaster analytics...</p>
          <p className="text-slate-500 text-sm mt-2">Analyzing global disaster patterns</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white flex items-center">
                <BarChart3 className="w-10 h-10 text-blue-400 mr-4" />
                Advanced Disaster Analytics
              </h1>
              <p className="text-slate-300 mt-2 text-lg">Real-time global disaster monitoring and predictive analysis</p>
              <div className="flex items-center space-x-6 mt-3 text-sm text-slate-400">
                <div className="flex items-center">
                  <Globe className="w-4 h-4 mr-1" />
                  Global Coverage
                </div>
                <div className="flex items-center">
                  <Database className="w-4 h-4 mr-1" />
                  Live Data Feed
                </div>
                <div className="flex items-center">
                  <Activity className="w-4 h-4 mr-1" />
                  AI-Powered Insights
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <label htmlFor="timeRangeSelect" className="sr-only">Select Time Range</label>
              <select
                id="timeRangeSelect"
                aria-label="Select Time Range"
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as '24h' | '7d' | '30d' | '1y')}
                className="px-4 py-2 border border-slate-600 bg-slate-800/50 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
              >
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="1y">Last Year</option>
              </select>
              <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                Generate Report
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-6 mb-8">
          <StatCard
            title="Total Events"
            value={stats.totalDisasters}
            icon={AlertTriangle}
            color="text-red-400"
            subtitle={`${timeRange} period`}
            trend="up"
          />
          <StatCard
            title="Active Incidents"
            value={stats.activeIncidents}
            icon={Activity}
            color="text-orange-400"
            subtitle="Requiring response"
            trend="stable"
          />
          <StatCard
            title="People Affected"
            value={stats.peopleAffected}
            icon={Users}
            color="text-purple-400"
            subtitle="Direct impact"
            trend="up"
          />
          <StatCard
            title="Avg Response"
            value={`${stats.responseTime.toFixed(1)}m`}
            icon={Clock}
            color="text-blue-400"
            subtitle="Emergency response"
            trend="down"
          />
          <StatCard
            title="Alerts Sent"
            value={stats.alertsSent}
            icon={Zap}
            color="text-yellow-400"
            subtitle="Multi-channel"
            trend="up"
          />
          <StatCard
            title="Accuracy Rate"
            value={`${stats.accuracy.toFixed(1)}%`}
            icon={Shield}
            color="text-green-400"
            subtitle="Prediction accuracy"
            trend="up"
          />
          <StatCard
            title="Economic Impact"
            value={stats.economicLoss}
            icon={TrendingDown}
            color="text-red-400"
            subtitle="USD losses"
            trend="up"
          />
          <StatCard
            title="Predicted Events"
            value={stats.predictedEvents}
            icon={Calendar}
            color="text-indigo-400"
            subtitle="Next 30 days"
            trend="stable"
          />
        </div>

        {/* Enhanced Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Disaster Trends */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6 hover:border-slate-600 transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white flex items-center">
                <TrendingUp className="w-5 h-5 text-blue-400 mr-2" />
                Disaster Trends (12 Months)
              </h3>
              <div className="flex items-center space-x-4 text-xs text-slate-300">
                <div className="flex items-center"><Flame className="w-3 h-3 text-red-400 mr-1" />Earthquakes</div>
                <div className="flex items-center"><Waves className="w-3 h-3 text-blue-400 mr-1" />Floods</div>
                <div className="flex items-center"><Wind className="w-3 h-3 text-green-400 mr-1" />Hurricanes</div>
                <div className="flex items-center"><Flame className="w-3 h-3 text-yellow-400 mr-1" />Wildfires</div>
              </div>
            </div>
            <div className="h-80">
              <Line data={generateMonthlyTrends()} options={chartOptions} />
            </div>
          </div>

          {/* Severity Distribution */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6 hover:border-slate-600 transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white flex items-center">
                <PieChart className="w-5 h-5 text-purple-400 mr-2" />
                Risk Severity Distribution
              </h3>
              <div className="text-sm text-slate-300 bg-slate-700/50 px-3 py-1 rounded-full">
                {timeRange} analysis
              </div>
            </div>
            <div className="h-80">
              <Doughnut 
                data={severityDistribution} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: {
                        color: '#e2e8f0',
                        font: { size: 12 },
                        padding: 20
                      }
                    },
                    tooltip: {
                      backgroundColor: 'rgba(15, 23, 42, 0.9)',
                      titleColor: '#e2e8f0',
                      bodyColor: '#e2e8f0',
                      borderColor: '#334155',
                      borderWidth: 1,
                    }
                  },
                }}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Response Time Analysis */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6 hover:border-slate-600 transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white flex items-center">
                <Clock className="w-5 h-5 text-indigo-400 mr-2" />
                Response Time by Disaster Type
              </h3>
              <div className="text-sm text-slate-300 bg-slate-700/50 px-3 py-1 rounded-full">
                Average minutes
              </div>
            </div>
            <div className="h-80">
              <Bar data={responseTimeData} options={chartOptions} />
            </div>
          </div>

          {/* Risk Assessment Radar */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6 hover:border-slate-600 transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white flex items-center">
                <Shield className="w-5 h-5 text-pink-400 mr-2" />
                Multi-Factor Risk Assessment
              </h3>
              <div className="text-sm text-slate-300 bg-slate-700/50 px-3 py-1 rounded-full">
                Global analysis
              </div>
            </div>
            <div className="h-80">
              <Radar 
                data={riskAssessmentData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false,
                    },
                    tooltip: {
                      backgroundColor: 'rgba(15, 23, 42, 0.9)',
                      titleColor: '#e2e8f0',
                      bodyColor: '#e2e8f0',
                      borderColor: '#334155',
                      borderWidth: 1,
                    }
                  },
                  scales: {
                    r: {
                      beginAtZero: true,
                      max: 100,
                      grid: {
                        color: 'rgba(51, 65, 85, 0.3)',
                      },
                      ticks: {
                        color: '#94a3b8',
                        font: { size: 10 }
                      },
                      pointLabels: {
                        color: '#e2e8f0',
                        font: { size: 11 }
                      }
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>

        {/* Impact Correlation Chart */}
        <div className="mb-8">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6 hover:border-slate-600 transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white flex items-center">
                <MapPin className="w-5 h-5 text-green-400 mr-2" />
                Magnitude vs Economic Impact Correlation
              </h3>
              <div className="text-sm text-slate-300 bg-slate-700/50 px-3 py-1 rounded-full">
                Impact in millions USD
              </div>
            </div>
            <div className="h-80">
              <Scatter 
                data={impactCorrelationData} 
                options={{
                  ...chartOptions,
                  scales: {
                    x: {
                      title: {
                        display: true,
                        text: 'Magnitude',
                        color: '#e2e8f0'
                      },
                      ticks: {
                        color: '#94a3b8'
                      },
                      grid: {
                        color: 'rgba(51, 65, 85, 0.3)'
                      }
                    },
                    y: {
                      title: {
                        display: true,
                        text: 'Economic Impact (Million USD)',
                        color: '#e2e8f0'
                      },
                      ticks: {
                        color: '#94a3b8'
                      },
                      grid: {
                        color: 'rgba(51, 65, 85, 0.3)'
                      }
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>

        {/* Enhanced Recent Activity Table */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6 hover:border-slate-600 transition-all duration-300">
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
            <Globe className="w-5 h-5 text-blue-400 mr-2" />
            Recent Disaster Activity
            <span className="ml-auto text-sm text-slate-400 bg-slate-700/50 px-3 py-1 rounded-full">
              Last {disasters.length} events
            </span>
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-600">
                  <th className="text-left py-3 px-4 text-slate-300 font-medium">Type</th>
                  <th className="text-left py-3 px-4 text-slate-300 font-medium">Location</th>
                  <th className="text-left py-3 px-4 text-slate-300 font-medium">Magnitude</th>
                  <th className="text-left py-3 px-4 text-slate-300 font-medium">Affected</th>
                  <th className="text-left py-3 px-4 text-slate-300 font-medium">Economic Loss</th>
                  <th className="text-left py-3 px-4 text-slate-300 font-medium">Severity</th>
                  <th className="text-left py-3 px-4 text-slate-300 font-medium">Status</th>
                  <th className="text-left py-3 px-4 text-slate-300 font-medium">Response Time</th>
                </tr>
              </thead>
              <tbody>
                {disasters.slice(0, 10).map((disaster) => (
                  <tr key={disaster.id} className="border-b border-slate-700 hover:bg-slate-700/30 transition-colors">
                    <td className="py-3 px-4 font-medium text-white">
                      <div className="flex items-center">
                        {disaster.type === 'Earthquake' && <Mountain className="w-4 h-4 text-red-400 mr-2" />}
                        {disaster.type === 'Flood' && <Waves className="w-4 h-4 text-blue-400 mr-2" />}
                        {disaster.type === 'Hurricane' && <Wind className="w-4 h-4 text-green-400 mr-2" />}
                        {disaster.type === 'Wildfire' && <Flame className="w-4 h-4 text-yellow-400 mr-2" />}
                        {disaster.type === 'Tornado' && <Wind className="w-4 h-4 text-purple-400 mr-2" />}
                        {disaster.type === 'Tsunami' && <Waves className="w-4 h-4 text-cyan-400 mr-2" />}
                        {!['Earthquake', 'Flood', 'Hurricane', 'Wildfire', 'Tornado', 'Tsunami'].includes(disaster.type) && 
                         <AlertTriangle className="w-4 h-4 text-orange-400 mr-2" />}
                        {disaster.type}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-300">{disaster.location.name}</td>
                    <td className="py-3 px-4 text-slate-300 font-mono">{disaster.magnitude.toFixed(1)}</td>
                    <td className="py-3 px-4 text-slate-300">{disaster.affected.toLocaleString()}</td>
                    <td className="py-3 px-4 text-slate-300 font-mono">
                      ${(disaster.economicLoss / 1000000).toFixed(1)}M
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                        disaster.severity === 'Critical' ? 'bg-red-900/30 text-red-300 border-red-700/50' :
                        disaster.severity === 'High' ? 'bg-orange-900/30 text-orange-300 border-orange-700/50' :
                        disaster.severity === 'Medium' ? 'bg-yellow-900/30 text-yellow-300 border-yellow-700/50' :
                        'bg-green-900/30 text-green-300 border-green-700/50'
                      }`}>
                        {disaster.severity}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                        disaster.status === 'Active' ? 'bg-red-900/30 text-red-300 border-red-700/50' :
                        disaster.status === 'Monitoring' ? 'bg-yellow-900/30 text-yellow-300 border-yellow-700/50' :
                        'bg-green-900/30 text-green-300 border-green-700/50'
                      }`}>
                        {disaster.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-300 font-mono">
                      {disaster.responseTime.toFixed(1)}m
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

export default AnalyticsDashboard;
