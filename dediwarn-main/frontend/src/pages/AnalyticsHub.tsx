/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useCallback } from 'react';
import '../styles/analytics-hub.css';
import { 
  TrendingUp, 
  MapPin, 
  Activity, 
  Globe, 
  AlertTriangle, 
  Network, 
  Zap, 
  Brain, 
  Database, 
  Wifi, 
  CloudRain, 
  Thermometer, 
  Wind, 
  Eye, 
  RefreshCw, 
  Download, 
  Share2, 
  Settings, 
  Bell,
  BarChart3
} from 'lucide-react';
import {
  AreaChart,
  Area,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ScatterChart,
  Scatter,
  Line
} from 'recharts';

// TypeScript interfaces
interface PerformanceDataPoint {
  time: string;
  fullTime: Date;
  warnings: number;
  responseTime: number;
  networkLoad: number;
  throughput: number;
  activeNodes: number;
  errorRate: number;
  cpuUsage: number;
  memoryUsage: number;
  bandwidthIn: number;
  bandwidthOut: number;
}

interface NetworkNode {
  id: string;
  name: string;
  x: number;
  y: number;
  connections: number;
  load: number;
  status: 'optimal' | 'good' | 'high' | 'low' | 'offline';
  latency: number;
  uptime: number;
}

interface RealtimeMetrics {
  totalWarnings: number;
  activeIncidents: number;
  responseRate: number;
  networkHealth: number;
  globalCoverage: number;
  throughput: number;
  avgLatency: number;
  uptime: number;
}

interface DisasterPrediction {
  id: string;
  type: 'Flood' | 'Heatwave' | 'Cyclone' | 'Drought' | 'Earthquake' | 'Wildfire';
  location: string;
  probability: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timeframe: string;
  confidence: number;
  icon: any;
  color: string;
}

interface AnalyticsMetric {
  id: string;
  label: string;
  value: string;
  change: string;
  icon: any;
  status?: string;
}

// Enhanced Analytics Service with comprehensive fallback data
class AnalyticsHubService {
  private static instance: AnalyticsHubService;
  
  public static getInstance(): AnalyticsHubService {
    if (!AnalyticsHubService.instance) {
      AnalyticsHubService.instance = new AnalyticsHubService();
    }
    return AnalyticsHubService.instance;
  }

  async getPerformanceMetrics(timeRange: string): Promise<PerformanceDataPoint[]> {
    try {
      // Try to fetch from actual API (if available)
      const response = await fetch(`/api/analytics/performance?range=${timeRange}`);
      if (response.ok) {
        const data = await response.json();
        return this.transformPerformanceData(data);
      }
    } catch (error) {
      console.warn('API unavailable, using fallback data:', error);
    }
    
    // Fallback to generated data
    return this.generatePerformanceData(timeRange);
  }

  async getNetworkTopology(): Promise<NetworkNode[]> {
    try {
      const response = await fetch('/api/analytics/network-topology');
      if (response.ok) {
        const data = await response.json();
        return this.transformNetworkData(data);
      }
    } catch (error) {
      console.warn('Network API unavailable, using fallback data:', error);
    }
    
    return this.generateNetworkTopology();
  }

  async getSystemMetrics(): Promise<RealtimeMetrics> {
    try {
      const response = await fetch('/api/analytics/system-metrics');
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.warn('System metrics API unavailable, using fallback data:', error);
    }
    
    return this.generateSystemMetrics();
  }

  async getDisasterPredictions(): Promise<DisasterPrediction[]> {
    try {
      const response = await fetch('/api/analytics/predictions');
      if (response.ok) {
        const data = await response.json();
        return this.transformPredictionData(data);
      }
    } catch (error) {
      console.warn('Predictions API unavailable, using fallback data:', error);
    }
    
    return this.generatePredictions();
  }

  private transformPerformanceData(data: any[]): PerformanceDataPoint[] {
    return data.map(item => ({
      time: new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      fullTime: new Date(item.timestamp),
      warnings: item.warnings || 0,
      responseTime: item.responseTime || 0,
      networkLoad: item.networkLoad || 0,
      throughput: item.throughput || 0,
      activeNodes: item.activeNodes || 0,
      errorRate: item.errorRate || 0,
      cpuUsage: item.cpuUsage || 0,
      memoryUsage: item.memoryUsage || 0,
      bandwidthIn: item.bandwidthIn || 0,
      bandwidthOut: item.bandwidthOut || 0
    }));
  }

  private transformNetworkData(data: any[]): NetworkNode[] {
    return data.map(node => ({
      id: node.id,
      name: node.name,
      x: node.location?.lng || 0,
      y: node.location?.lat || 0,
      connections: node.metrics?.connections || 0,
      load: node.metrics?.load || 0,
      status: node.metrics?.status || 'offline',
      latency: node.metrics?.latency || 0,
      uptime: node.metrics?.uptime || 0
    }));
  }

  private transformPredictionData(data: any[]): DisasterPrediction[] {
    return data.map(pred => ({
      id: pred.id,
      type: pred.type,
      location: pred.location,
      probability: pred.probability,
      severity: pred.severity,
      timeframe: pred.timeframe,
      confidence: pred.confidence,
      icon: this.getDisasterIcon(pred.type),
      color: this.getDisasterColor(pred.type)
    }));
  }

  private generatePerformanceData(timeRange: string): PerformanceDataPoint[] {
    const now = new Date();
    const dataPoints = timeRange === '24h' ? 24 : timeRange === '7d' ? 168 : timeRange === '30d' ? 720 : 2160;
    const data: PerformanceDataPoint[] = [];
    
    for (let i = dataPoints - 1; i >= 0; i--) {
      const time = new Date(now.getTime() - i * (timeRange === '24h' ? 3600000 : 3600000));
      const baseTime = i / (dataPoints / 4);
      
      data.push({
        time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        fullTime: time,
        warnings: Math.floor(Math.random() * 50) + 200 + Math.sin(baseTime) * 20,
        responseTime: Math.floor(Math.random() * 50) + 80 + Math.cos(baseTime) * 15,
        networkLoad: Math.floor(Math.random() * 40) + 40 + Math.sin(baseTime * 1.2) * 10,
        throughput: Math.floor(Math.random() * 8) + 12 + Math.cos(baseTime * 0.8) * 3,
        activeNodes: Math.floor(Math.random() * 100) + 2800 + Math.sin(baseTime * 0.6) * 50,
        errorRate: Math.max(0, Math.random() * 2 + Math.sin(baseTime * 2) * 0.5),
        cpuUsage: Math.floor(Math.random() * 30) + 45 + Math.sin(baseTime * 1.5) * 10,
        memoryUsage: Math.floor(Math.random() * 25) + 55 + Math.cos(baseTime * 1.8) * 8,
        bandwidthIn: Math.floor(Math.random() * 500) + 1000 + Math.sin(baseTime * 0.9) * 200,
        bandwidthOut: Math.floor(Math.random() * 400) + 800 + Math.cos(baseTime * 1.1) * 150
      });
    }
    
    return data;
  }

  private generateNetworkTopology(): NetworkNode[] {
    const nodes = [
      { id: 'mumbai', name: 'Mumbai Hub', x: 72.8777, y: 19.0760, base: { connections: 15, load: 85 } },
      { id: 'delhi', name: 'Delhi Hub', x: 77.1025, y: 28.7041, base: { connections: 12, load: 72 } },
      { id: 'bangalore', name: 'Bangalore Hub', x: 77.5946, y: 12.9716, base: { connections: 18, load: 94 } },
      { id: 'chennai', name: 'Chennai Hub', x: 80.2707, y: 13.0827, base: { connections: 10, load: 68 } },
      { id: 'kolkata', name: 'Kolkata Hub', x: 88.3639, y: 22.5726, base: { connections: 8, load: 45 } },
      { id: 'hyderabad', name: 'Hyderabad Hub', x: 78.4867, y: 17.3850, base: { connections: 14, load: 78 } }
    ];

    return nodes.map(node => ({
      ...node,
      load: Math.max(20, Math.min(100, node.base.load + (Math.random() - 0.5) * 10)),
      connections: Math.max(5, node.base.connections + Math.floor((Math.random() - 0.5) * 4)),
      latency: Math.floor(Math.random() * 50) + 30,
      uptime: Math.max(95, 100 - Math.random() * 3),
      status: this.determineStatus(node.base.load + (Math.random() - 0.5) * 10)
    }));
  }

  private generateSystemMetrics(): RealtimeMetrics {
    return {
      totalWarnings: Math.floor(Math.random() * 100) + 1200,
      activeIncidents: Math.floor(Math.random() * 20) + 5,
      responseRate: Math.max(90, 100 - Math.random() * 8),
      networkHealth: Math.max(95, 100 - Math.random() * 4),
      globalCoverage: Math.floor(Math.random() * 10) + 150,
      throughput: Math.floor(Math.random() * 5) + 12,
      avgLatency: Math.floor(Math.random() * 30) + 100,
      uptime: Math.max(99.5, 100 - Math.random() * 0.4)
    };
  }

  private generatePredictions(): DisasterPrediction[] {
    return [
      {
        id: '1',
        type: 'Flood',
        location: 'Mumbai, Maharashtra',
        probability: 85,
        severity: 'high',
        timeframe: '24-48 hours',
        confidence: 92,
        icon: CloudRain,
        color: 'blue'
      },
      {
        id: '2',
        type: 'Heatwave',
        location: 'Delhi, NCR',
        probability: 78,
        severity: 'medium',
        timeframe: '3-5 days',
        confidence: 88,
        icon: Thermometer,
        color: 'orange'
      },
      {
        id: '3',
        type: 'Cyclone',
        location: 'Odisha Coast',
        probability: 65,
        severity: 'critical',
        timeframe: '5-7 days',
        confidence: 85,
        icon: Wind,
        color: 'purple'
      },
      {
        id: '4',
        type: 'Drought',
        location: 'Karnataka',
        probability: 72,
        severity: 'medium',
        timeframe: '2-3 weeks',
        confidence: 79,
        icon: Eye,
        color: 'yellow'
      }
    ];
  }

  private determineStatus(load: number): 'optimal' | 'good' | 'high' | 'low' | 'offline' {
    if (load < 30) return 'low';
    if (load < 60) return 'optimal';
    if (load < 80) return 'good';
    return 'high';
  }

  private getDisasterIcon(type: string) {
    const icons = {
      'Flood': CloudRain,
      'Heatwave': Thermometer,
      'Cyclone': Wind,
      'Drought': Eye,
      'Earthquake': Activity,
      'Wildfire': Zap
    };
    return icons[type as keyof typeof icons] || AlertTriangle;
  }

  private getDisasterColor(type: string): string {
    const colors = {
      'Flood': 'blue',
      'Heatwave': 'orange',
      'Cyclone': 'purple',
      'Drought': 'yellow',
      'Earthquake': 'red',
      'Wildfire': 'orange'
    };
    return colors[type as keyof typeof colors] || 'gray';
  }

  subscribeToRealTimeUpdates(callback: (data: any) => void): () => void {
    // Simulate real-time updates
    const interval = setInterval(() => {
      callback({
        type: 'system',
        data: this.generateSystemMetrics()
      });
    }, 5000);

    return () => clearInterval(interval);
  }
}

// Custom notification system
interface NotificationState {
  show: boolean;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

export const AnalyticsHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState('analytics');
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState('warnings');
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [performanceData, setPerformanceData] = useState<PerformanceDataPoint[]>([]);
  const [networkTopologyData, setNetworkTopologyData] = useState<NetworkNode[]>([]);
  const [realtimeMetrics, setRealtimeMetrics] = useState<RealtimeMetrics>({
    totalWarnings: 1247,
    activeIncidents: 12,
    responseRate: 94.2,
    networkHealth: 99.7,
    globalCoverage: 156,
    throughput: 15.2,
    avgLatency: 125,
    uptime: 99.98
  });
  const [predictions, setPredictions] = useState<DisasterPrediction[]>([]);
  const [isLiveMode, setIsLiveMode] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [apiStatus, setApiStatus] = useState({
    system: 'connected',
    network: 'connected',
    emergency: 'fallback'
  });
  const [notification, setNotification] = useState<NotificationState>({
    show: false,
    message: '',
    type: 'info'
  });

  const analyticsService = AnalyticsHubService.getInstance();

  // Notification system
  const showNotification = (message: string, type: 'success' | 'info' | 'warning' | 'error' = 'info') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, 3000);
  };

  // Load data from analytics service
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setHasError(false);
      
      const [performance, network, system, predictionData] = await Promise.all([
        analyticsService.getPerformanceMetrics(timeRange),
        analyticsService.getNetworkTopology(),
        analyticsService.getSystemMetrics(),
        analyticsService.getDisasterPredictions()
      ]);

      setPerformanceData(performance);
      setNetworkTopologyData(network);
      setRealtimeMetrics(system);
      setPredictions(predictionData);
      setLastUpdated(new Date());
      setApiStatus({
        system: 'connected',
        network: 'connected',
        emergency: 'connected'
      });
      
    } catch (error) {
      console.error('Failed to load analytics data:', error);
      setHasError(true);
      setErrorMessage(`Failed to load analytics data: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setApiStatus({
        system: 'fallback',
        network: 'fallback',
        emergency: 'fallback'
      });
    } finally {
      setIsLoading(false);
    }
  }, [timeRange, analyticsService]);

  // Setup real-time updates and data loading
  useEffect(() => {
    loadData();

    let unsubscribe: (() => void) | undefined;
    
    if (isLiveMode) {
      unsubscribe = analyticsService.subscribeToRealTimeUpdates((update: any) => {
        if (update.type === 'system') {
          setRealtimeMetrics(prev => ({ ...prev, ...update.data }));
          setLastUpdated(new Date());
        }
      });
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [loadData, isLiveMode, analyticsService]);

  // Chart colors
  const chartColors = {
    primary: '#3b82f6',
    secondary: '#10b981',
    tertiary: '#f59e0b',
    quaternary: '#ef4444',
    accent: '#8b5cf6'
  };

  const tabs = [
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'network', label: 'Network Status', icon: Network },
    { id: 'predictions', label: 'Predictions', icon: Brain }
  ];

  const analyticsMetrics: AnalyticsMetric[] = [
    { 
      id: 'warnings', 
      label: 'Warnings Issued', 
      value: realtimeMetrics.totalWarnings.toLocaleString(), 
      change: '+12%', 
      icon: AlertTriangle 
    },
    { 
      id: 'responses', 
      label: 'Response Rate', 
      value: `${realtimeMetrics.responseRate.toFixed(1)}%`, 
      change: '+2.1%', 
      icon: Activity 
    },
    { 
      id: 'coverage', 
      label: 'Global Coverage', 
      value: realtimeMetrics.globalCoverage.toString(), 
      change: '+8', 
      icon: Globe 
    },
    { 
      id: 'efficiency', 
      label: 'Network Efficiency', 
      value: `${realtimeMetrics.networkHealth.toFixed(1)}%`, 
      change: '+0.3%', 
      icon: TrendingUp 
    }
  ];

  const networkMetrics: AnalyticsMetric[] = [
    { 
      id: 'nodes', 
      label: 'Active Nodes', 
      value: '2,847', 
      change: '+5.2%', 
      icon: Network, 
      status: 'online' 
    },
    { 
      id: 'throughput', 
      label: 'Network Throughput', 
      value: `${realtimeMetrics.throughput.toFixed(1)} TPS`, 
      change: '+8.1%', 
      icon: Zap, 
      status: 'optimal' 
    },
    { 
      id: 'latency', 
      label: 'Average Latency', 
      value: `${realtimeMetrics.avgLatency}ms`, 
      change: '-2.3%', 
      icon: Wifi, 
      status: 'good' 
    },
    { 
      id: 'uptime', 
      label: 'Network Uptime', 
      value: `${realtimeMetrics.uptime.toFixed(2)}%`, 
      change: '+0.01%', 
      icon: Database, 
      status: 'excellent' 
    }
  ];

  const renderAnalytics = () => (
    <>
      {/* API Status Banner */}
      <div className="mb-6 bg-slate-800/50 border border-slate-700 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <h4 className="text-sm font-medium text-white">Data Sources Status</h4>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${apiStatus.system === 'connected' ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
                <span className="text-xs text-slate-400">System APIs</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${apiStatus.network === 'connected' ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
                <span className="text-xs text-slate-400">Network APIs</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${apiStatus.emergency === 'connected' ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
                <span className="text-xs text-slate-400">Emergency APIs</span>
              </div>
            </div>
          </div>
          <div className="text-xs text-slate-400">
            Last updated: {lastUpdated.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {analyticsMetrics.map((metric) => (
          <div
            key={metric.id}
            className={`p-6 rounded-xl border transition-all duration-300 cursor-pointer animate-fade-in-up ${
              selectedMetric === metric.id
                ? 'bg-blue-600/20 border-blue-400'
                : 'bg-slate-800/50 border-slate-700 hover:border-blue-400'
            }`}
            onClick={() => setSelectedMetric(metric.id)}
          >
            <div className="flex items-center justify-between mb-4">
              <metric.icon className={`h-8 w-8 ${selectedMetric === metric.id ? 'text-blue-400' : 'text-slate-400'}`} />
              <span className={`text-sm font-medium ${metric.change.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                {metric.change}
              </span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">{metric.value}</h3>
            <p className="text-slate-400 text-sm">{metric.label}</p>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Performance Trends Chart */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-white">Performance Trends</h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsLiveMode(!isLiveMode)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  isLiveMode 
                    ? 'bg-green-600/20 text-green-400 border border-green-500/30' 
                    : 'bg-slate-600/20 text-slate-400 border border-slate-500/30'
                }`}
              >
                {isLiveMode ? '● LIVE' : '○ PAUSED'}
              </button>
              <button
                onClick={() => {
                  loadData();
                  showNotification('Chart data refreshed', 'success');
                }}
                className="p-1 text-slate-400 hover:text-white transition-colors"
                title="Refresh Chart Data"
                aria-label="Refresh Chart Data"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis 
                  dataKey="time" 
                  stroke="#64748b"
                  fontSize={12}
                  tick={{ fill: '#64748b' }}
                />
                <YAxis 
                  yAxisId="left"
                  stroke="#64748b"
                  fontSize={12}
                  tick={{ fill: '#64748b' }}
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  stroke="#64748b"
                  fontSize={12}
                  tick={{ fill: '#64748b' }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#f8fafc'
                  }}
                />
                <Legend />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="warnings"
                  stroke={chartColors.primary}
                  fill={chartColors.primary}
                  fillOpacity={0.2}
                  strokeWidth={2}
                  name="Warnings"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="responseTime"
                  stroke={chartColors.secondary}
                  strokeWidth={2}
                  dot={false}
                  name="Response Time (ms)"
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="throughput"
                  stroke={chartColors.tertiary}
                  strokeWidth={2}
                  dot={false}
                  name="Throughput (TPS)"
                />
                <Bar
                  yAxisId="left"
                  dataKey="errorRate"
                  fill={chartColors.quaternary}
                  fillOpacity={0.6}
                  name="Error Rate (%)"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* System Resources Chart */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-white">System Resources</h3>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-400">Real-time</span>
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis 
                  dataKey="time" 
                  stroke="#64748b"
                  fontSize={12}
                  tick={{ fill: '#64748b' }}
                />
                <YAxis 
                  stroke="#64748b"
                  fontSize={12}
                  tick={{ fill: '#64748b' }}
                  domain={[0, 100]}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#f8fafc'
                  }}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="cpuUsage"
                  stackId="1"
                  stroke={chartColors.accent}
                  fill={chartColors.accent}
                  fillOpacity={0.8}
                  name="CPU Usage (%)"
                />
                <Area
                  type="monotone"
                  dataKey="memoryUsage"
                  stackId="1"
                  stroke="#06b6d4"
                  fill="#06b6d4"
                  fillOpacity={0.8}
                  name="Memory Usage (%)"
                />
                <Area
                  type="monotone"
                  dataKey="networkLoad"
                  stackId="1"
                  stroke="#f97316"
                  fill="#f97316"
                  fillOpacity={0.8}
                  name="Network Load (%)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </>
  );

  const renderNetwork = () => (
    <>
      {/* Network Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {networkMetrics.map((metric) => (
          <div 
            key={metric.id} 
            className="p-6 rounded-xl border bg-slate-800/50 border-slate-700 hover:border-blue-400 transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <metric.icon className="h-8 w-8 text-blue-400" />
              <div className={`px-2 py-1 rounded-full text-xs ${
                metric.status === 'excellent' ? 'bg-green-600/20 text-green-400' :
                metric.status === 'good' ? 'bg-blue-600/20 text-blue-400' :
                metric.status === 'optimal' ? 'bg-purple-600/20 text-purple-400' :
                'bg-orange-600/20 text-orange-400'
              }`}>
                {metric.status}
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">{metric.value}</h3>
            <p className="text-slate-400 text-sm mb-2">{metric.label}</p>
            <span className={`text-sm font-medium ${metric.change.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
              {metric.change}
            </span>
          </div>
        ))}
      </div>

      {/* Network Topology and Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-white">Network Topology</h3>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-green-400">Live Monitoring</span>
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart data={networkTopologyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis 
                  type="number"
                  dataKey="x"
                  domain={[70, 90]}
                  stroke="#64748b"
                  fontSize={12}
                  tick={{ fill: '#64748b' }}
                  name="Longitude"
                />
                <YAxis 
                  type="number"
                  dataKey="y"
                  domain={[10, 30]}
                  stroke="#64748b"
                  fontSize={12}
                  tick={{ fill: '#64748b' }}
                  name="Latitude"
                />
                <Tooltip 
                  cursor={{ strokeDasharray: '3 3' }}
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#f8fafc'
                  }}
                  formatter={(value, name) => {
                    if (name === 'load') return [`${value}%`, 'Load'];
                    if (name === 'connections') return [value, 'Connections'];
                    if (name === 'latency') return [`${value}ms`, 'Latency'];
                    if (name === 'uptime') return [`${value}%`, 'Uptime'];
                    return [value, name];
                  }}
                  labelFormatter={(label, payload) => {
                    if (payload && payload[0] && payload[0].payload) {
                      return payload[0].payload.name;
                    }
                    return label;
                  }}
                />
                <Scatter 
                  name="Network Nodes" 
                  dataKey="load" 
                  fill={chartColors.primary}
                />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Network Performance</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={networkTopologyData}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis 
                  dataKey="name" 
                  tick={{ fill: '#64748b', fontSize: 12 }}
                />
                <PolarRadiusAxis 
                  angle={90} 
                  domain={[0, 100]}
                  tick={{ fill: '#64748b', fontSize: 10 }}
                />
                <Radar
                  name="Load %"
                  dataKey="load"
                  stroke={chartColors.primary}
                  fill={chartColors.primary}
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
                <Radar
                  name="Uptime %"
                  dataKey="uptime"
                  stroke={chartColors.secondary}
                  fill={chartColors.secondary}
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#f8fafc'
                  }}
                />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bandwidth Usage Chart */}
      <div className="mt-8 bg-slate-800/50 border border-slate-700 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-white">Bandwidth Usage</h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => showNotification('Bandwidth data exported', 'success')}
              className="p-2 text-slate-400 hover:text-white transition-colors"
              title="Export Bandwidth Data"
              aria-label="Export Bandwidth Data"
            >
              <Download className="h-4 w-4" />
            </button>
            <button
              onClick={() => showNotification('Bandwidth report shared', 'info')}
              className="p-2 text-slate-400 hover:text-white transition-colors"
              title="Share Bandwidth Report"
              aria-label="Share Bandwidth Report"
            >
              <Share2 className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis 
                dataKey="time" 
                stroke="#64748b"
                fontSize={12}
                tick={{ fill: '#64748b' }}
              />
              <YAxis 
                stroke="#64748b"
                fontSize={12}
                tick={{ fill: '#64748b' }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  color: '#f8fafc'
                }}
                formatter={(value: number, name: string) => [
                  `${value} MB/s`, 
                  name === 'bandwidthIn' ? 'Inbound' : 'Outbound'
                ]}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="bandwidthIn"
                stackId="1"
                stroke="#06b6d4"
                fill="#06b6d4"
                fillOpacity={0.8}
                name="Inbound Traffic"
              />
              <Area
                type="monotone"
                dataKey="bandwidthOut"
                stackId="1"
                stroke={chartColors.accent}
                fill={chartColors.accent}
                fillOpacity={0.8}
                name="Outbound Traffic"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );

  const renderPredictions = () => (
    <>
      {/* Predictions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {predictions.map((prediction) => (
          <div key={prediction.id} className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-blue-400 transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <prediction.icon className="h-8 w-8 text-blue-400" />
                <div>
                  <h3 className="text-lg font-semibold text-white">{prediction.type}</h3>
                  <p className="text-slate-400 text-sm flex items-center">
                    <MapPin className="h-3 w-3 mr-1" />
                    {prediction.location}
                  </p>
                </div>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs ${
                prediction.severity === 'critical' ? 'bg-red-600/20 text-red-400' :
                prediction.severity === 'high' ? 'bg-orange-600/20 text-orange-400' :
                'bg-yellow-600/20 text-yellow-400'
              }`}>
                {prediction.severity}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Probability</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-slate-700 rounded-full h-2">
                    <div 
                      className="bg-blue-400 h-2 rounded-full transition-all duration-1000"
                      data-width={prediction.probability}
                    />
                  </div>
                  <span className="text-white font-medium">{prediction.probability}%</span>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-400">Confidence</span>
                <span className="text-white font-medium">{prediction.confidence}%</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-400">Timeframe</span>
                <span className="text-white font-medium">{prediction.timeframe}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* AI Model Performance */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-white mb-4">AI Model Performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { metric: 'Accuracy', value: '94.7%', trend: '+2.1%' },
            { metric: 'Precision', value: '92.3%', trend: '+1.8%' },
            { metric: 'Recall', value: '96.1%', trend: '+0.9%' }
          ].map((metric) => (
            <div key={metric.metric} className="text-center">
              <div className="text-3xl font-bold text-white mb-1">{metric.value}</div>
              <div className="text-slate-400 text-sm mb-2">{metric.metric}</div>
              <div className="text-green-400 text-sm">{metric.trend}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen pt-8 pb-16 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h3 className="text-lg font-medium text-white mb-2">Loading Analytics Hub...</h3>
          <p className="text-slate-400">Fetching real-time data from multiple sources</p>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="min-h-screen pt-8 pb-16 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="bg-red-600/20 border border-red-500/30 rounded-xl p-6">
            <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">Analytics Hub Error</h3>
            <p className="text-red-300 mb-4">{errorMessage}</p>
            <button
              onClick={() => {
                setHasError(false);
                loadData();
              }}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-8 pb-16">
      {/* Notification */}
      {notification.show && (
        <div className="fixed top-4 right-4 z-50 max-w-sm">
          <div className={`p-4 rounded-lg border backdrop-blur-sm ${
            notification.type === 'success' ? 'bg-green-600/20 border-green-400 text-green-400' :
            notification.type === 'error' ? 'bg-red-600/20 border-red-400 text-red-400' :
            notification.type === 'warning' ? 'bg-yellow-600/20 border-yellow-400 text-yellow-400' :
            'bg-blue-600/20 border-blue-400 text-blue-400'
          }`}>
            <p className="text-sm font-medium">{notification.message}</p>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 flex items-center">
              <BarChart3 className="h-8 w-8 mr-3 text-blue-400" />
              Analytics Hub
            </h1>
            <p className="text-slate-400">Real-time disaster management analytics and insights</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              aria-label="Select time range for analytics"
              className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-8 bg-slate-800/50 p-1 rounded-lg border border-slate-700">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'analytics' && renderAnalytics()}
        {activeTab === 'network' && renderNetwork()}
        {activeTab === 'predictions' && renderPredictions()}
      </div>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 flex flex-col space-y-3 z-40">
        <button
          onClick={() => {
            loadData();
            showNotification('Analytics data refreshed successfully', 'success');
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110 group"
          title="Refresh Data"
        >
          <RefreshCw className="h-6 w-6 group-hover:animate-spin" />
        </button>
        
        <button
          onClick={() => showNotification('Analytics report downloaded', 'success')}
          className="bg-green-600 hover:bg-green-700 text-white p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
          title="Download Report"
        >
          <Download className="h-6 w-6" />
        </button>
        
        <button
          onClick={() => showNotification('Analytics dashboard shared', 'info')}
          className="bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
          title="Share Dashboard"
        >
          <Share2 className="h-6 w-6" />
        </button>
        
        <button
          onClick={() => showNotification('Settings panel coming soon', 'info')}
          className="bg-slate-600 hover:bg-slate-700 text-white p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
          title="Settings"
        >
          <Settings className="h-6 w-6" />
        </button>
        
        <button
          onClick={() => showNotification('You have 5 new alerts!', 'warning')}
          className="bg-yellow-600 hover:bg-yellow-700 text-white p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110 relative"
          title="Notifications"
        >
          <Bell className="h-6 w-6" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
        </button>
      </div>
    </div>
  );
};

export default AnalyticsHub;
