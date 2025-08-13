import React, { useState, useEffect, useMemo } from 'react';
import { TrendingUp, TrendingDown, BarChart3, Activity, AlertTriangle, Users, MapPin, Clock, Shield, Heart } from 'lucide-react';
import './AnalyticsDashboard.css';

interface DisasterData {
  id: string;
  type: string;
  severity: number;
  location: { lat: number; lng: number; city: string; state: string };
  timestamp: string;
  affectedPopulation: number;
  casualties: number;
  rescueOperations: number;
  volunteersDeployed: number;
  status: 'active' | 'resolved' | 'monitoring';
}

interface AnalyticsMetric {
  title: string;
  value: string | number;
  change: number;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  color: string;
  description: string;
}

interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string;
    borderWidth?: number;
    fill?: boolean;
  }>;
}

export const AnalyticsDashboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | '1y'>('30d');
  const [disasterData, setDisasterData] = useState<DisasterData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Mock disaster data
  const mockDisasterData: DisasterData[] = [
    {
      id: '1',
      type: 'Earthquake',
      severity: 6.2,
      location: { lat: 28.6139, lng: 77.2090, city: 'New Delhi', state: 'Delhi' },
      timestamp: '2025-08-07T10:30:00Z',
      affectedPopulation: 15000,
      casualties: 23,
      rescueOperations: 8,
      volunteersDeployed: 45,
      status: 'active'
    },
    {
      id: '2',
      type: 'Flood',
      severity: 7.1,
      location: { lat: 22.5726, lng: 88.3639, city: 'Kolkata', state: 'West Bengal' },
      timestamp: '2025-08-06T14:15:00Z',
      affectedPopulation: 50000,
      casualties: 12,
      rescueOperations: 15,
      volunteersDeployed: 120,
      status: 'monitoring'
    },
    {
      id: '3',
      type: 'Cyclone',
      severity: 8.3,
      location: { lat: 13.0827, lng: 80.2707, city: 'Chennai', state: 'Tamil Nadu' },
      timestamp: '2025-08-05T20:45:00Z',
      affectedPopulation: 85000,
      casualties: 45,
      rescueOperations: 25,
      volunteersDeployed: 200,
      status: 'resolved'
    },
    {
      id: '4',
      type: 'Landslide',
      severity: 5.8,
      location: { lat: 32.2190, lng: 76.3234, city: 'Dharamshala', state: 'Himachal Pradesh' },
      timestamp: '2025-08-04T08:20:00Z',
      affectedPopulation: 8000,
      casualties: 8,
      rescueOperations: 5,
      volunteersDeployed: 30,
      status: 'resolved'
    },
    {
      id: '5',
      type: 'Fire',
      severity: 6.7,
      location: { lat: 19.0760, lng: 72.8777, city: 'Mumbai', state: 'Maharashtra' },
      timestamp: '2025-08-03T16:10:00Z',
      affectedPopulation: 25000,
      casualties: 15,
      rescueOperations: 12,
      volunteersDeployed: 80,
      status: 'resolved'
    }
  ];

  // Load data
  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      setDisasterData(mockDisasterData);
      setIsLoading(false);
    }, 1000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRange]);

  // Calculate metrics
  const metrics = useMemo(() => {
    const totalDisasters = disasterData.length;
    const activeDisasters = disasterData.filter(d => d.status === 'active').length;
    const totalAffected = disasterData.reduce((sum, d) => sum + d.affectedPopulation, 0);
    const totalCasualties = disasterData.reduce((sum, d) => sum + d.casualties, 0);
    const totalVolunteers = disasterData.reduce((sum, d) => sum + d.volunteersDeployed, 0);
    const totalOperations = disasterData.reduce((sum, d) => sum + d.rescueOperations, 0);
    const avgSeverity = disasterData.reduce((sum, d) => sum + d.severity, 0) / totalDisasters || 0;
    const responseRate = ((totalDisasters - activeDisasters) / totalDisasters * 100) || 0;

    const analyticsMetrics: AnalyticsMetric[] = [
      {
        title: 'Total Disasters',
        value: totalDisasters,
        change: 12,
        icon: AlertTriangle,
        color: 'text-red-400',
        description: 'Reported incidents in selected period'
      },
      {
        title: 'Active Incidents',
        value: activeDisasters,
        change: -8,
        icon: Activity,
        color: 'text-orange-400',
        description: 'Currently ongoing emergencies'
      },
      {
        title: 'People Affected',
        value: totalAffected.toLocaleString(),
        change: 15,
        icon: Users,
        color: 'text-blue-400',
        description: 'Total population impacted'
      },
      {
        title: 'Casualties',
        value: totalCasualties,
        change: -5,
        icon: Heart,
        color: 'text-red-500',
        description: 'Reported injuries and fatalities'
      },
      {
        title: 'Volunteers Deployed',
        value: totalVolunteers,
        change: 25,
        icon: Users,
        color: 'text-green-400',
        description: 'Active volunteers in field'
      },
      {
        title: 'Rescue Operations',
        value: totalOperations,
        change: 18,
        icon: Shield,
        color: 'text-purple-400',
        description: 'Completed rescue missions'
      },
      {
        title: 'Avg Severity',
        value: avgSeverity.toFixed(1),
        change: -3,
        icon: BarChart3,
        color: 'text-yellow-400',
        description: 'Average disaster severity score'
      },
      {
        title: 'Response Rate',
        value: `${responseRate.toFixed(1)}%`,
        change: 10,
        icon: TrendingUp,
        color: 'text-green-500',
        description: 'Incidents resolved successfully'
      }
    ];

    return analyticsMetrics;
  }, [disasterData]);

  // Chart data
  const chartData = useMemo(() => {
    // Disaster types distribution
    const typeCount = disasterData.reduce((acc, disaster) => {
      acc[disaster.type] = (acc[disaster.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const disasterTypeChart: ChartData = {
      labels: Object.keys(typeCount),
      datasets: [{
        label: 'Disaster Count',
        data: Object.values(typeCount),
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(139, 92, 246, 0.8)'
        ]
      }]
    };

    // Severity distribution over time
    const severityChart: ChartData = {
      labels: disasterData.map(d => new Date(d.timestamp).toLocaleDateString()),
      datasets: [{
        label: 'Severity Score',
        data: disasterData.map(d => d.severity),
        borderColor: 'rgba(59, 130, 246, 1)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        fill: true
      }]
    };

    // Response metrics
    const responseChart: ChartData = {
      labels: disasterData.map(d => d.type),
      datasets: [
        {
          label: 'Volunteers Deployed',
          data: disasterData.map(d => d.volunteersDeployed),
          backgroundColor: 'rgba(16, 185, 129, 0.8)'
        },
        {
          label: 'Rescue Operations',
          data: disasterData.map(d => d.rescueOperations),
          backgroundColor: 'rgba(139, 92, 246, 0.8)'
        }
      ]
    };

    return { disasterTypeChart, severityChart, responseChart };
  }, [disasterData]);

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-red-400 bg-red-500/20';
      case 'monitoring': return 'text-yellow-400 bg-yellow-500/20';
      case 'resolved': return 'text-green-400 bg-green-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  // Get dynamic width class
  const getWidthPercentage = (percentage: number) => {
    return Math.round(percentage / 5) * 5; // Round to nearest 5
  };

  // Simple bar chart component
  const SimpleBarChart: React.FC<{ data: ChartData; title: string }> = ({ data, title }) => {
    const maxValue = Math.max(...data.datasets[0].data);
    
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6">
        <h3 className="text-lg font-bold text-white mb-4">{title}</h3>
        <div className="space-y-3">
          {data.labels.map((label, index) => {
            const percentage = (data.datasets[0].data[index] / maxValue) * 100;
            const widthClass = getWidthPercentage(percentage);
            
            return (
              <div key={label} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">{label}</span>
                  <span className="text-white font-medium">{data.datasets[0].data[index]}</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all duration-500 progress-bar"
                    data-width={widthClass.toString()}
                    data-bg={Array.isArray(data.datasets[0].backgroundColor) 
                      ? data.datasets[0].backgroundColor[index] 
                      : (data.datasets[0].backgroundColor || 'rgb(59, 130, 246)')}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Simple line chart component
  const SimpleLineChart: React.FC<{ data: ChartData; title: string }> = ({ data, title }) => {
    const maxValue = Math.max(...data.datasets[0].data);
    const minValue = Math.min(...data.datasets[0].data);
    
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6">
        <h3 className="text-lg font-bold text-white mb-4">{title}</h3>
        <div className="relative h-40">
          <svg width="100%" height="100%" className="overflow-visible">
            {data.datasets[0].data.map((value, index) => {
              const x = (index / (data.datasets[0].data.length - 1)) * 100;
              const y = 100 - ((value - minValue) / (maxValue - minValue)) * 80;
              return (
                <g key={index}>
                  <circle
                    cx={`${x}%`}
                    cy={`${y}%`}
                    r="3"
                    fill="rgb(59, 130, 246)"
                  />
                  {index > 0 && (
                    <line
                      x1={`${((index - 1) / (data.datasets[0].data.length - 1)) * 100}%`}
                      y1={`${100 - ((data.datasets[0].data[index - 1] - minValue) / (maxValue - minValue)) * 80}%`}
                      x2={`${x}%`}
                      y2={`${y}%`}
                      stroke="rgb(59, 130, 246)"
                      strokeWidth="2"
                    />
                  )}
                </g>
              );
            })}
          </svg>
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-2">
          {data.labels.map((label, index) => (
            <span key={index}>{label.split('/')[1]}/{label.split('/')[2]}</span>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2 flex items-center">
              <BarChart3 className="h-6 w-6 mr-3 text-blue-400" />
              Analytics Dashboard
            </h2>
            <p className="text-gray-400">
              Real-time insights and trends from disaster management operations
            </p>
          </div>
          
          {/* Time Range Selector */}
          <div className="flex space-x-2">
            {[
              { key: '24h', label: '24H' },
              { key: '7d', label: '7D' },
              { key: '30d', label: '30D' },
              { key: '1y', label: '1Y' }
            ].map(range => (
              <button
                key={range.key}
                onClick={() => setTimeRange(range.key as '24h' | '7d' | '30d' | '1y')}
                className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                  timeRange === range.key
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto"></div>
          <p className="text-gray-400 mt-4">Loading analytics...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {metrics.map((metric, index) => {
              const Icon = metric.icon;
              return (
                <div key={index} className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6 hover:border-slate-600 transition-colors">
                  <div className="flex items-center justify-between mb-4">
                    <Icon className={`h-8 w-8 ${metric.color}`} />
                    <div className="flex items-center text-sm">
                      {metric.change > 0 ? (
                        <TrendingUp className="h-4 w-4 text-green-400 mr-1" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-400 mr-1" />
                      )}
                      <span className={metric.change > 0 ? 'text-green-400' : 'text-red-400'}>
                        {Math.abs(metric.change)}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-white">{metric.value}</h3>
                    <p className="text-gray-400 text-sm font-medium">{metric.title}</p>
                    <p className="text-gray-500 text-xs">{metric.description}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SimpleBarChart 
              data={chartData.disasterTypeChart} 
              title="Disaster Types Distribution" 
            />
            <SimpleLineChart 
              data={chartData.severityChart} 
              title="Severity Trends Over Time" 
            />
          </div>

          {/* Response Metrics Chart */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6">
            <h3 className="text-lg font-bold text-white mb-4">Response Metrics Comparison</h3>
            <div className="space-y-4">
              {disasterData.map((disaster) => (
                <div key={disaster.id} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300 font-medium">{disaster.type} - {disaster.location.city}</span>
                    <span className={`px-2 py-1 rounded text-xs ${getStatusColor(disaster.status)}`}>
                      {disaster.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400">Volunteers: {disaster.volunteersDeployed}</span>
                        <span className="text-green-400">{disaster.volunteersDeployed}</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full progress-bar"
                          data-width={getWidthPercentage(Math.min((disaster.volunteersDeployed / 200) * 100, 100)).toString()}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400">Operations: {disaster.rescueOperations}</span>
                        <span className="text-purple-400">{disaster.rescueOperations}</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div
                          className="bg-purple-500 h-2 rounded-full progress-bar"
                          data-width={getWidthPercentage(Math.min((disaster.rescueOperations / 25) * 100, 100)).toString()}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Incidents Table */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6">
            <h3 className="text-lg font-bold text-white mb-4">Recent Incidents</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-600">
                    <th className="text-left py-3 px-2 text-gray-400 font-medium">Type</th>
                    <th className="text-left py-3 px-2 text-gray-400 font-medium">Location</th>
                    <th className="text-left py-3 px-2 text-gray-400 font-medium">Severity</th>
                    <th className="text-left py-3 px-2 text-gray-400 font-medium">Affected</th>
                    <th className="text-left py-3 px-2 text-gray-400 font-medium">Status</th>
                    <th className="text-left py-3 px-2 text-gray-400 font-medium">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {disasterData.map((disaster) => (
                    <tr key={disaster.id} className="border-b border-slate-700/50 hover:bg-slate-700/20">
                      <td className="py-3 px-2">
                        <span className="text-white font-medium">{disaster.type}</span>
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                          <span className="text-gray-300">{disaster.location.city}, {disaster.location.state}</span>
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex items-center">
                          <div className={`w-2 h-2 rounded-full mr-2 ${
                            disaster.severity >= 8 ? 'bg-red-500' :
                            disaster.severity >= 6 ? 'bg-orange-500' :
                            disaster.severity >= 4 ? 'bg-yellow-500' : 'bg-green-500'
                          }`} />
                          <span className="text-white">{disaster.severity.toFixed(1)}</span>
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <span className="text-gray-300">{disaster.affectedPopulation.toLocaleString()}</span>
                      </td>
                      <td className="py-3 px-2">
                        <span className={`px-2 py-1 rounded text-xs ${getStatusColor(disaster.status)}`}>
                          {disaster.status}
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex items-center text-gray-400">
                          <Clock className="h-4 w-4 mr-1" />
                          <span className="text-sm">
                            {new Date(disaster.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
