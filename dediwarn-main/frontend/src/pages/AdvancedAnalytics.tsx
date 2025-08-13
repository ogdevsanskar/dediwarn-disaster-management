import React, { useState, useEffect, useMemo } from 'react';
import {
  Line, AreaChart, Area, BarChart, Bar,
  ScatterChart, Scatter, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ComposedChart, FunnelChart, Funnel, LabelList
} from 'recharts';
import {
  AlertTriangle, Users, Clock,
  Activity, Shield, Target, Brain, Database,
  Download, Share2, RefreshCw, BarChart3
} from 'lucide-react';
import '../styles/advanced-analytics.css';

// Type definitions
interface RiskData {
  category: string;
  probability: number;
  impact: number;
  preparedness: number;
}

interface ResourceData {
  resource: string;
  allocated: number;
  required: number;
  efficiency: number;
}

interface ModelData {
  model: string;
  accuracy: number;
  confidence: number;
  lastTrained: string;
}

interface MetricsData {
  activeAlerts: number;
  onlineUsers: number;
  responseTime: number;
  systemHealth: number;
  lastUpdate: Date;
}

// Enhanced Analytics Service with AI-powered insights
class AdvancedAnalyticsService {
  private data = {
    realTimeMetrics: {
      activeAlerts: 127,
      onlineUsers: 2547,
      responseTime: 1.2,
      systemHealth: 98.5,
      lastUpdate: new Date()
    },
    disasterTrends: [
      { month: 'Jan', earthquakes: 12, floods: 8, fires: 15, storms: 6, total: 41, severity: 7.2 },
      { month: 'Feb', earthquakes: 8, floods: 12, fires: 10, storms: 9, total: 39, severity: 6.8 },
      { month: 'Mar', earthquakes: 15, floods: 6, fires: 18, storms: 12, total: 51, severity: 8.1 },
      { month: 'Apr', earthquakes: 10, floods: 15, fires: 22, storms: 8, total: 55, severity: 7.9 },
      { month: 'May', earthquakes: 18, floods: 20, fires: 25, storms: 15, total: 78, severity: 8.5 },
      { month: 'Jun', earthquakes: 22, floods: 25, fires: 30, storms: 18, total: 95, severity: 9.2 }
    ],
    geographicData: [
      { region: 'North America', incidents: 245, population: 579000000, riskLevel: 'Medium', lat: 45, lon: -100 },
      { region: 'Europe', incidents: 189, population: 748000000, riskLevel: 'Low', lat: 50, lon: 10 },
      { region: 'Asia', incidents: 412, population: 4641000000, riskLevel: 'High', lat: 30, lon: 100 },
      { region: 'Africa', incidents: 298, population: 1340000000, riskLevel: 'High', lat: 0, lon: 20 },
      { region: 'South America', incidents: 156, population: 430000000, riskLevel: 'Medium', lat: -15, lon: -60 },
      { region: 'Oceania', incidents: 78, population: 45000000, riskLevel: 'Medium', lat: -25, lon: 140 }
    ],
    riskAssessment: [
      { category: 'Earthquake', probability: 0.65, impact: 0.89, preparedness: 0.78 },
      { category: 'Flood', probability: 0.78, impact: 0.72, preparedness: 0.85 },
      { category: 'Wildfire', probability: 0.82, impact: 0.69, preparedness: 0.72 },
      { category: 'Hurricane', probability: 0.45, impact: 0.95, preparedness: 0.88 },
      { category: 'Tornado', probability: 0.38, impact: 0.67, preparedness: 0.81 },
      { category: 'Tsunami', probability: 0.15, impact: 0.98, preparedness: 0.92 }
    ],
    resourceAllocation: [
      { resource: 'Emergency Personnel', allocated: 1250, required: 1400, efficiency: 89 },
      { resource: 'Medical Supplies', allocated: 850, required: 900, efficiency: 94 },
      { resource: 'Rescue Equipment', allocated: 320, required: 280, efficiency: 114 },
      { resource: 'Communication Systems', allocated: 180, required: 200, efficiency: 90 },
      { resource: 'Transportation', allocated: 95, required: 120, efficiency: 79 }
    ],
    predictiveModels: [
      { model: 'Earthquake Prediction', accuracy: 87.5, confidence: 0.82, lastTrained: '2024-12-01' },
      { model: 'Weather Pattern Analysis', accuracy: 92.3, confidence: 0.91, lastTrained: '2024-12-05' },
      { model: 'Population Movement', accuracy: 89.1, confidence: 0.85, lastTrained: '2024-12-03' },
      { model: 'Resource Demand', accuracy: 91.7, confidence: 0.88, lastTrained: '2024-12-07' }
    ],
    timeSeriesData: Array.from({ length: 24 }, (_, i) => ({
      hour: `${i}:00`,
      alerts: Math.floor(Math.random() * 50) + 10,
      responses: Math.floor(Math.random() * 45) + 5,
      resources: Math.floor(Math.random() * 100) + 50
    }))
  };

  getRealTimeMetrics(): MetricsData {
    // Simulate real-time updates
    this.data.realTimeMetrics = {
      ...this.data.realTimeMetrics,
      activeAlerts: this.data.realTimeMetrics.activeAlerts + Math.floor(Math.random() * 10 - 5),
      onlineUsers: this.data.realTimeMetrics.onlineUsers + Math.floor(Math.random() * 100 - 50),
      responseTime: +(this.data.realTimeMetrics.responseTime + (Math.random() * 0.5 - 0.25)).toFixed(1),
      systemHealth: +(this.data.realTimeMetrics.systemHealth + (Math.random() * 2 - 1)).toFixed(1),
      lastUpdate: new Date()
    };
    return this.data.realTimeMetrics;
  }

  getDisasterTrends() { return this.data.disasterTrends; }
  getGeographicData() { return this.data.geographicData; }
  getRiskAssessment(): RiskData[] { return this.data.riskAssessment; }
  getResourceAllocation(): ResourceData[] { return this.data.resourceAllocation; }
  getPredictiveModels(): ModelData[] { return this.data.predictiveModels; }
  getTimeSeriesData() { return this.data.timeSeriesData; }

  generateAIInsights(): string[] {
    return [
      "🔥 Wildfire risk increased by 23% in the last month due to drought conditions",
      "📊 Emergency response efficiency improved by 15% with new AI routing",
      "🌊 Flood prediction model accuracy reached 94.2% after recent updates",
      "⚡ Real-time alert system reduced average response time by 8 minutes",
      "🎯 Resource allocation optimization saved $2.3M in operational costs"
    ];
  }
}

const AdvancedAnalytics: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('24h');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [showInsights, setShowInsights] = useState(false);
  
  const analyticsService = useMemo(() => new AdvancedAnalyticsService(), []);
  
  const [metrics, setMetrics] = useState<MetricsData>(analyticsService.getRealTimeMetrics());
  const [insights, setInsights] = useState<string[]>([]);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        setMetrics(analyticsService.getRealTimeMetrics());
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, analyticsService]);

  useEffect(() => {
    setInsights(analyticsService.generateAIInsights());
  }, [analyticsService]);

  const chartColors = {
    primary: '#3B82F6',
    secondary: '#10B981',
    accent: '#F59E0B',
    danger: '#EF4444',
    warning: '#F97316',
    success: '#22C55E',
    info: '#06B6D4'
  };

  const getProgressWidth = (percentage: number) => {
    const rounded = Math.round(percentage / 5) * 5; // Round to nearest 5
    return `progress-${Math.min(100, Math.max(0, rounded))}`;
  };

  const MetricCard: React.FC<{
    title: string;
    value: string | number;
    change: string;
    icon: React.ReactNode;
    color: string;
  }> = ({ title, value, change, icon, color }) => {
    const getCardClass = () => {
      switch (color) {
        case chartColors.danger: return 'metric-card metric-card--danger';
        case chartColors.primary: return 'metric-card metric-card--primary';
        case chartColors.success: return 'metric-card metric-card--success';
        case chartColors.info: return 'metric-card metric-card--info';
        default: return 'metric-card';
      }
    };

    const getIconClass = () => {
      switch (color) {
        case chartColors.danger: return 'metric-icon metric-icon--danger';
        case chartColors.primary: return 'metric-icon metric-icon--primary';
        case chartColors.success: return 'metric-icon metric-icon--success';
        case chartColors.info: return 'metric-icon metric-icon--info';
        default: return 'metric-icon';
      }
    };

    return (
      <div className={getCardClass()}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            <p className={`text-sm mt-2 ${change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
              {change}
            </p>
          </div>
          <div className={getIconClass()}>
            {icon}
          </div>
        </div>
      </div>
    );
  };

  const renderOverview = () => (
    <div className="space-y-8">
      {/* Real-time Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Active Alerts"
          value={metrics.activeAlerts}
          change="+12% from yesterday"
          icon={<AlertTriangle size={32} color={chartColors.danger} />}
          color={chartColors.danger}
        />
        <MetricCard
          title="Online Users"
          value={metrics.onlineUsers.toLocaleString()}
          change="+5.2% from last hour"
          icon={<Users size={32} color={chartColors.primary} />}
          color={chartColors.primary}
        />
        <MetricCard
          title="Response Time"
          value={`${metrics.responseTime}s`}
          change="-0.3s improvement"
          icon={<Clock size={32} color={chartColors.success} />}
          color={chartColors.success}
        />
        <MetricCard
          title="System Health"
          value={`${metrics.systemHealth}%`}
          change="+2.1% optimized"
          icon={<Activity size={32} color={chartColors.info} />}
          color={chartColors.info}
        />
      </div>

      {/* Disaster Trends Chart */}
      <div className="chart-container">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Disaster Trends & Severity Analysis</h3>
          <div className="flex gap-2">
            <button 
              className="control-button control-button--blue"
              title="Export chart data"
              aria-label="Export chart data"
            >
              <Download size={16} />
            </button>
            <button 
              className="control-button control-button--green"
              title="Share chart"
              aria-label="Share chart"
            >
              <Share2 size={16} />
            </button>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart data={analyticsService.getDisasterTrends()}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="month" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                border: 'none', 
                borderRadius: '8px',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Legend />
            <Bar yAxisId="left" dataKey="earthquakes" fill={chartColors.danger} name="Earthquakes" />
            <Bar yAxisId="left" dataKey="floods" fill={chartColors.info} name="Floods" />
            <Bar yAxisId="left" dataKey="fires" fill={chartColors.warning} name="Wildfires" />
            <Bar yAxisId="left" dataKey="storms" fill={chartColors.secondary} name="Storms" />
            <Line yAxisId="right" type="monotone" dataKey="severity" stroke={chartColors.primary} 
                  strokeWidth={3} name="Severity Index" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* AI Insights Panel */}
      {showInsights && (
        <div className="insights-panel">
          <div className="flex items-center gap-3 mb-4">
            <Brain className="text-purple-600" size={24} />
            <h3 className="text-xl font-bold text-gray-900">AI-Powered Insights</h3>
          </div>
          <div className="space-y-3">
            {insights.map((insight, index) => (
              <div key={index} className="insight-item">
                <div className="insight-dot"></div>
                <p className="text-gray-700">{insight}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderRiskAnalysis = () => (
    <div className="space-y-8">
      {/* Risk Assessment Radar */}
      <div className="chart-container">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Multi-Dimensional Risk Assessment</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ResponsiveContainer width="100%" height={350}>
            <RadarChart data={analyticsService.getRiskAssessment()}>
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis dataKey="category" className="text-sm" />
              <PolarRadiusAxis angle={60} domain={[0, 1]} tick={false} />
              <Radar
                name="Probability"
                dataKey="probability"
                stroke={chartColors.danger}
                fill={chartColors.danger}
                fillOpacity={0.3}
                strokeWidth={2}
              />
              <Radar
                name="Impact"
                dataKey="impact"
                stroke={chartColors.warning}
                fill={chartColors.warning}
                fillOpacity={0.3}
                strokeWidth={2}
              />
              <Radar
                name="Preparedness"
                dataKey="preparedness"
                stroke={chartColors.success}
                fill={chartColors.success}
                fillOpacity={0.3}
                strokeWidth={2}
              />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
          
          <div className="space-y-4">
            {analyticsService.getRiskAssessment().map((risk, index) => (
              <div key={index} className="border rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">{risk.category}</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Probability</span>
                    <span>{(risk.probability * 100).toFixed(1)}%</span>
                  </div>
                  <div className="progress-bar">
                    <div className={`progress-bar__fill progress-bar__fill--red ${getProgressWidth(risk.probability * 100)}`}></div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Impact</span>
                    <span>{(risk.impact * 100).toFixed(1)}%</span>
                  </div>
                  <div className="progress-bar">
                    <div className={`progress-bar__fill progress-bar__fill--orange ${getProgressWidth(risk.impact * 100)}`}></div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Preparedness</span>
                    <span>{(risk.preparedness * 100).toFixed(1)}%</span>
                  </div>
                  <div className="progress-bar">
                    <div className={`progress-bar__fill progress-bar__fill--green ${getProgressWidth(risk.preparedness * 100)}`}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Geographic Distribution */}
      <div className="chart-container">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Global Incident Distribution</h3>
        <ResponsiveContainer width="100%" height={400}>
          <ScatterChart data={analyticsService.getGeographicData()}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              type="number" 
              dataKey="lon" 
              name="Longitude" 
              domain={[-180, 180]}
              tickFormatter={(value) => `${value}°`}
            />
            <YAxis 
              type="number" 
              dataKey="lat" 
              name="Latitude" 
              domain={[-90, 90]}
              tickFormatter={(value) => `${value}°`}
            />
            <Tooltip 
              cursor={{ strokeDasharray: '3 3' }}
              formatter={(value, name) => [
                name === 'incidents' ? `${value} incidents` : value,
                name
              ]}
              labelFormatter={(_, payload) => 
                payload?.[0]?.payload?.region || 'Unknown Region'
              }
            />
            <Scatter 
              dataKey="incidents" 
              fill={chartColors.primary}
              shape="circle"
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  const renderResourceManagement = () => (
    <div className="space-y-8">
      {/* Resource Allocation */}
      <div className="chart-container">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Resource Allocation & Efficiency</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={analyticsService.getResourceAllocation()} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="resource" type="category" width={120} />
              <Tooltip />
              <Legend />
              <Bar dataKey="allocated" fill={chartColors.primary} name="Allocated" />
              <Bar dataKey="required" fill={chartColors.secondary} name="Required" />
            </BarChart>
          </ResponsiveContainer>
          
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900">Efficiency Metrics</h4>
            {analyticsService.getResourceAllocation().map((resource, index) => (
              <div key={index} className="resource-card">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">{resource.resource}</span>
                  <span className={`efficiency-badge ${
                    resource.efficiency >= 100 ? 'efficiency-badge--excellent' :
                    resource.efficiency >= 90 ? 'efficiency-badge--good' :
                    'efficiency-badge--poor'
                  }`}>
                    {resource.efficiency}% efficient
                  </span>
                </div>
                <div className="progress-bar progress-bar--small">
                  <div className={`progress-bar__fill ${
                    resource.efficiency >= 100 ? 'progress-bar__fill--green' :
                    resource.efficiency >= 90 ? 'progress-bar__fill--yellow' :
                    'progress-bar__fill--red'
                  } ${getProgressWidth(Math.min(resource.efficiency, 100))}`}></div>
                </div>
                <div className="flex justify-between text-sm text-gray-600 mt-2">
                  <span>Allocated: {resource.allocated}</span>
                  <span>Required: {resource.required}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Time Series Analysis */}
      <div className="chart-container">
        <h3 className="text-xl font-bold text-gray-900 mb-6">24-Hour Activity Timeline</h3>
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={analyticsService.getTimeSeriesData()}>
            <defs>
              <linearGradient id="alertsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={chartColors.danger} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={chartColors.danger} stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="responsesGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={chartColors.success} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={chartColors.success} stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="hour" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area
              type="monotone"
              dataKey="alerts"
              stroke={chartColors.danger}
              fillOpacity={1}
              fill="url(#alertsGradient)"
              name="Alerts"
            />
            <Area
              type="monotone"
              dataKey="responses"
              stroke={chartColors.success}
              fillOpacity={1}
              fill="url(#responsesGradient)"
              name="Responses"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  const renderPredictiveAnalytics = () => (
    <div className="space-y-8">
      {/* AI Model Performance */}
      <div className="chart-container">
        <h3 className="text-xl font-bold text-gray-900 mb-6">AI Model Performance Dashboard</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {analyticsService.getPredictiveModels().map((model, index) => (
            <div key={index} className="model-card">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-gray-900">{model.model}</h4>
                <div className="flex items-center gap-2">
                  <Target size={16} className="text-blue-500" />
                  <span className="text-sm text-gray-600">{model.accuracy}%</span>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Accuracy</span>
                    <span>{model.accuracy}%</span>
                  </div>
                  <div className="progress-bar">
                    <div className={`progress-bar__fill progress-bar__fill--blue ${getProgressWidth(model.accuracy)}`}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Confidence</span>
                    <span>{(model.confidence * 100).toFixed(1)}%</span>
                  </div>
                  <div className="progress-bar">
                    <div className={`progress-bar__fill progress-bar__fill--green ${getProgressWidth(model.confidence * 100)}`}></div>
                  </div>
                </div>
                
                <div className="flex justify-between text-sm text-gray-600 pt-2 border-t">
                  <span>Last Training</span>
                  <span>{model.lastTrained}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Prediction Funnel */}
      <div className="chart-container">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Prediction Pipeline Flow</h3>
        <ResponsiveContainer width="100%" height={400}>
          <FunnelChart>
            <Tooltip />
            <Funnel
              dataKey="value"
              data={[
                { name: 'Raw Data Inputs', value: 100, fill: chartColors.primary },
                { name: 'Data Processing', value: 85, fill: chartColors.info },
                { name: 'Feature Extraction', value: 75, fill: chartColors.secondary },
                { name: 'Model Analysis', value: 65, fill: chartColors.warning },
                { name: 'Validated Predictions', value: 55, fill: chartColors.success }
              ]}
            >
              <LabelList position="center" fill="#fff" stroke="none" />
            </Funnel>
          </FunnelChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="dashboard-header">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Advanced Analytics Dashboard
              </h1>
              <p className="text-gray-600">
                AI-powered disaster management analytics with real-time insights
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Last updated: {metrics.lastUpdate.toLocaleTimeString()}
              </p>
            </div>
            
            {/* Controls */}
            <div className="flex flex-wrap gap-3">
              <select 
                value={timeRange} 
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                title="Select time range"
                aria-label="Select time range for analytics data"
              >
                <option value="1h">Last Hour</option>
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
              </select>
              
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`control-button ${
                  autoRefresh 
                    ? 'control-button--success' 
                    : 'control-button--secondary'
                }`}
                title={autoRefresh ? "Disable auto-refresh" : "Enable auto-refresh"}
                aria-label={autoRefresh ? "Disable auto-refresh" : "Enable auto-refresh"}
              >
                <RefreshCw size={16} className={autoRefresh ? 'spinning' : ''} />
                Auto Refresh
              </button>
              
              <button
                onClick={() => setShowInsights(!showInsights)}
                className={`control-button ${
                  showInsights 
                    ? 'control-button--purple' 
                    : 'control-button--secondary'
                }`}
                title={showInsights ? "Hide AI insights" : "Show AI insights"}
                aria-label={showInsights ? "Hide AI insights" : "Show AI insights"}
              >
                <Brain size={16} />
                AI Insights
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="tab-navigation">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'risk', label: 'Risk Analysis', icon: Shield },
              { id: 'resources', label: 'Resource Management', icon: Database },
              { id: 'predictions', label: 'Predictive Analytics', icon: Brain }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`tab-button ${
                  activeTab === tab.id
                    ? 'tab-button--active'
                    : 'tab-button--inactive'
                }`}
                title={`Switch to ${tab.label}`}
                aria-label={`Switch to ${tab.label}`}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="fade-in">
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'risk' && renderRiskAnalysis()}
          {activeTab === 'resources' && renderResourceManagement()}
          {activeTab === 'predictions' && renderPredictiveAnalytics()}
        </div>
      </div>
    </div>
  );
};

export default AdvancedAnalytics;
