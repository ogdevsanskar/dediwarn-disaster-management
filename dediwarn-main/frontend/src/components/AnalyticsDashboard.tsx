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
import { Line, Bar, Doughnut, Radar } from 'react-chartjs-2';
import { 
  TrendingUp, 
  AlertTriangle, 
  Users, 
  Activity, 
  Clock, 
  BarChart3,
  PieChart,
  Zap,
  Shield,
  Globe
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
}

interface AnalyticsStats {
  totalDisasters: number;
  activeIncidents: number;
  peopleAffected: number;
  responseTime: number;
  alertsSent: number;
  accuracy: number;
}

export const AnalyticsDashboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | '1y'>('7d');
  const [stats, setStats] = useState<AnalyticsStats>({
    totalDisasters: 0,
    activeIncidents: 0,
    peopleAffected: 0,
    responseTime: 0,
    alertsSent: 0,
    accuracy: 0
  });
  const [disasters, setDisasters] = useState<DisasterData[]>([]);
  const [loading, setLoading] = useState(true);

  // Generate sample disaster data
  useEffect(() => {
    const generateSampleData = () => {
      const disasterTypes = ['Earthquake', 'Flood', 'Hurricane', 'Wildfire', 'Tornado', 'Tsunami'];
      const locations = [
        { lat: 40.7128, lng: -74.0060, name: 'New York, USA' },
        { lat: 35.6762, lng: 139.6503, name: 'Tokyo, Japan' },
        { lat: 28.6139, lng: 77.2090, name: 'New Delhi, India' },
        { lat: -33.8688, lng: 151.2093, name: 'Sydney, Australia' },
        { lat: 51.5074, lng: -0.1278, name: 'London, UK' },
        { lat: 37.7749, lng: -122.4194, name: 'San Francisco, USA' }
      ];

      const sampleDisasters: DisasterData[] = [];
      
      for (let i = 0; i < 50; i++) {
        const daysAgo = Math.floor(Math.random() * 30);
        const timestamp = new Date();
        timestamp.setDate(timestamp.getDate() - daysAgo);

        sampleDisasters.push({
          id: `disaster_${i}`,
          type: disasterTypes[Math.floor(Math.random() * disasterTypes.length)],
          magnitude: Math.random() * 8 + 1,
          location: locations[Math.floor(Math.random() * locations.length)],
          timestamp,
          affected: Math.floor(Math.random() * 10000),
          severity: ['Low', 'Medium', 'High', 'Critical'][Math.floor(Math.random() * 4)] as 'Low' | 'Medium' | 'High' | 'Critical',
          status: ['Active', 'Monitoring', 'Resolved'][Math.floor(Math.random() * 3)] as 'Active' | 'Monitoring' | 'Resolved'
        });
      }

      setDisasters(sampleDisasters);
      
      // Calculate stats
      const activeIncidents = sampleDisasters.filter(d => d.status === 'Active').length;
      const totalPeopleAffected = sampleDisasters.reduce((sum, d) => sum + d.affected, 0);
      
      setStats({
        totalDisasters: sampleDisasters.length,
        activeIncidents,
        peopleAffected: totalPeopleAffected,
        responseTime: Math.random() * 5 + 2, // 2-7 minutes
        alertsSent: Math.floor(Math.random() * 1000) + 500,
        accuracy: Math.random() * 20 + 80 // 80-100%
      });
      
      setLoading(false);
    };

    generateSampleData();
  }, [timeRange]);

  // Chart data configurations
  const disasterTrendsData = {
    labels: disasters.slice(0, 10).map(d => d.timestamp.toLocaleDateString()),
    datasets: [
      {
        label: 'Earthquake',
        data: disasters.filter(d => d.type === 'Earthquake').slice(0, 10).map(d => d.magnitude),
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        fill: true,
      },
      {
        label: 'Flood',
        data: disasters.filter(d => d.type === 'Flood').slice(0, 10).map(d => d.magnitude),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
      },
      {
        label: 'Hurricane',
        data: disasters.filter(d => d.type === 'Hurricane').slice(0, 10).map(d => d.magnitude),
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
      }
    ]
  };

  const severityDistribution = {
    labels: ['Low', 'Medium', 'High', 'Critical'],
    datasets: [{
      data: [
        disasters.filter(d => d.severity === 'Low').length,
        disasters.filter(d => d.severity === 'Medium').length,
        disasters.filter(d => d.severity === 'High').length,
        disasters.filter(d => d.severity === 'Critical').length,
      ],
      backgroundColor: [
        '#10B981', // Green
        '#F59E0B', // Yellow
        '#F97316', // Orange
        '#EF4444', // Red
      ],
      borderWidth: 2,
      borderColor: '#ffffff',
    }]
  };

  const responseTimeData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      label: 'Average Response Time (minutes)',
      data: [4.2, 3.8, 4.5, 3.2, 2.9, 3.4],
      backgroundColor: 'rgba(99, 102, 241, 0.8)',
      borderColor: 'rgb(99, 102, 241)',
      borderWidth: 1,
    }]
  };

  const riskAssessmentData = {
    labels: ['Seismic Activity', 'Weather Patterns', 'Population Density', 'Infrastructure', 'Emergency Resources', 'Historical Data'],
    datasets: [{
      label: 'Risk Level',
      data: [65, 59, 90, 81, 56, 55],
      backgroundColor: 'rgba(236, 72, 153, 0.2)',
      borderColor: 'rgba(236, 72, 153, 1)',
      borderWidth: 2,
      pointBackgroundColor: 'rgba(236, 72, 153, 1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(236, 72, 153, 1)'
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const StatCard = ({ title, value, icon: Icon, color, subtitle }: {
    title: string;
    value: string | number;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    subtitle?: string;
  }) => (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className={`text-3xl font-bold ${color} mt-2`}>{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-lg ${color.includes('red') ? 'bg-red-100' : 
          color.includes('blue') ? 'bg-blue-100' : 
          color.includes('green') ? 'bg-green-100' : 
          color.includes('yellow') ? 'bg-yellow-100' : 'bg-purple-100'}`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Activity className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading disaster analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <BarChart3 className="w-8 h-8 text-blue-600 mr-3" />
                Disaster Analytics Dashboard
              </h1>
              <p className="text-gray-600 mt-2">Real-time disaster monitoring and trend analysis</p>
            </div>
            <div className="flex items-center space-x-4">
              <label htmlFor="timeRangeSelect" className="sr-only">Select Time Range</label>
              <select
                id="timeRangeSelect"
                aria-label="Select Time Range"
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as '24h' | '7d' | '30d' | '1y')}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="1y">Last Year</option>
              </select>
              <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Export Report
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          <StatCard
            title="Total Disasters"
            value={stats.totalDisasters}
            icon={AlertTriangle}
            color="text-red-600"
            subtitle={`${timeRange} period`}
          />
          <StatCard
            title="Active Incidents"
            value={stats.activeIncidents}
            icon={Activity}
            color="text-orange-600"
            subtitle="Requiring attention"
          />
          <StatCard
            title="People Affected"
            value={stats.peopleAffected.toLocaleString()}
            icon={Users}
            color="text-purple-600"
            subtitle="Cumulative impact"
          />
          <StatCard
            title="Response Time"
            value={`${stats.responseTime.toFixed(1)}m`}
            icon={Clock}
            color="text-blue-600"
            subtitle="Average response"
          />
          <StatCard
            title="Alerts Sent"
            value={stats.alertsSent.toLocaleString()}
            icon={Zap}
            color="text-yellow-600"
            subtitle="Multi-channel alerts"
          />
          <StatCard
            title="Accuracy Rate"
            value={`${stats.accuracy.toFixed(1)}%`}
            icon={Shield}
            color="text-green-600"
            subtitle="Prediction accuracy"
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Disaster Trends */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                <TrendingUp className="w-5 h-5 text-blue-600 mr-2" />
                Disaster Trends
              </h3>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span>Earthquake</span>
                <div className="w-3 h-3 bg-blue-500 rounded-full ml-4"></div>
                <span>Flood</span>
                <div className="w-3 h-3 bg-green-500 rounded-full ml-4"></div>
                <span>Hurricane</span>
              </div>
            </div>
            <div className="h-80">
              <Line data={disasterTrendsData} options={chartOptions} />
            </div>
          </div>

          {/* Severity Distribution */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                <PieChart className="w-5 h-5 text-purple-600 mr-2" />
                Severity Distribution
              </h3>
              <div className="text-sm text-gray-600">
                Current {timeRange} period
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
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Response Time Analysis */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                <Clock className="w-5 h-5 text-indigo-600 mr-2" />
                Response Time Analysis
              </h3>
              <div className="text-sm text-gray-600">
                Monthly averages
              </div>
            </div>
            <div className="h-80">
              <Bar data={responseTimeData} options={chartOptions} />
            </div>
          </div>

          {/* Risk Assessment Radar */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                <Shield className="w-5 h-5 text-pink-600 mr-2" />
                Risk Assessment Matrix
              </h3>
              <div className="text-sm text-gray-600">
                Multi-factor analysis
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
                  },
                  scales: {
                    r: {
                      beginAtZero: true,
                      max: 100,
                      grid: {
                        color: 'rgba(0, 0, 0, 0.1)',
                      },
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
            <Globe className="w-5 h-5 text-blue-600 mr-2" />
            Recent Disaster Activity
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4">Type</th>
                  <th className="text-left py-3 px-4">Location</th>
                  <th className="text-left py-3 px-4">Magnitude</th>
                  <th className="text-left py-3 px-4">Affected</th>
                  <th className="text-left py-3 px-4">Severity</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Time</th>
                </tr>
              </thead>
              <tbody>
                {disasters.slice(0, 8).map((disaster) => (
                  <tr key={disaster.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{disaster.type}</td>
                    <td className="py-3 px-4 text-gray-600">{disaster.location.name}</td>
                    <td className="py-3 px-4">{disaster.magnitude.toFixed(1)}</td>
                    <td className="py-3 px-4">{disaster.affected.toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        disaster.severity === 'Critical' ? 'bg-red-100 text-red-800' :
                        disaster.severity === 'High' ? 'bg-orange-100 text-orange-800' :
                        disaster.severity === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {disaster.severity}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        disaster.status === 'Active' ? 'bg-red-100 text-red-800' :
                        disaster.status === 'Monitoring' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {disaster.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {disaster.timestamp.toLocaleString()}
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
