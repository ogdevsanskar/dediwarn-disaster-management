import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Shield, 
  AlertTriangle, 
  Activity, 
  MessageSquare,
  Server,
  Bell,
  RotateCcw,
  Download,
  TrendingUp,
  BarChart3,
  PieChart as PieChartIcon
} from 'lucide-react';
import { Line, Doughnut } from 'react-chartjs-2';

interface SystemStatus {
  server: 'Online' | 'Offline' | 'Maintenance';
  database: 'Connected' | 'Disconnected' | 'Syncing';
  aiServices: 'Active' | 'Inactive' | 'Error';
  communications: 'Operational' | 'Degraded' | 'Failed';
  mapping: 'Online' | 'Offline' | 'Limited';
  uptime: number;
  lastUpdate: Date;
}

interface UserData {
  id: string;
  name: string;
  role: 'Admin' | 'Operator' | 'Viewer' | 'Responder';
  status: 'Online' | 'Offline' | 'Away';
  lastActive: Date;
  permissions: string[];
  location?: string;
}

interface AlertData {
  id: string;
  type: 'System' | 'Disaster' | 'Communication' | 'Security';
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  title: string;
  description: string;
  timestamp: Date;
  status: 'New' | 'Acknowledged' | 'Resolved';
  assignedTo?: string;
}

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'alerts' | 'system' | 'reports'>('overview');
  const [systemStatus] = useState<SystemStatus>({
    server: 'Online',
    database: 'Connected',
    aiServices: 'Active',
    communications: 'Operational',
    mapping: 'Online',
    uptime: 99.8,
    lastUpdate: new Date()
  });
  const [users, setUsers] = useState<UserData[]>([]);
  const [alerts, setAlerts] = useState<AlertData[]>([]);
  // Removed unused selectedTimeRange state to fix compile error.

  // Generate sample data
  useEffect(() => {
    // Sample users
    const sampleUsers: UserData[] = [
      {
        id: '1',
        name: 'Dr. Sarah Chen',
        role: 'Admin',
        status: 'Online',
        lastActive: new Date(),
        permissions: ['full_access', 'user_management', 'system_config'],
        location: 'Emergency Command Center'
      },
      {
        id: '2',
        name: 'Mark Johnson',
        role: 'Operator',
        status: 'Online',
        lastActive: new Date(Date.now() - 300000),
        permissions: ['disaster_management', 'alerts', 'communications'],
        location: 'Field Operations'
      },
      {
        id: '3',
        name: 'Lisa Rodriguez',
        role: 'Responder',
        status: 'Away',
        lastActive: new Date(Date.now() - 3600000),
        permissions: ['field_access', 'status_updates'],
        location: 'Mobile Unit 1'
      },
      {
        id: '4',
        name: 'James Park',
        role: 'Viewer',
        status: 'Offline',
        lastActive: new Date(Date.now() - 7200000),
        permissions: ['read_only'],
        location: 'Regional Office'
      }
    ];

    // Sample alerts
    const sampleAlerts: AlertData[] = [
      {
        id: '1',
        type: 'Disaster',
        severity: 'Critical',
        title: 'Earthquake Detected - Magnitude 6.2',
        description: 'Seismic activity detected 15km northeast of San Francisco',
        timestamp: new Date(Date.now() - 900000),
        status: 'Acknowledged',
        assignedTo: 'Mark Johnson'
      },
      {
        id: '2',
        type: 'System',
        severity: 'Medium',
        title: 'High Server Load',
        description: 'Server CPU usage at 87% for the last 10 minutes',
        timestamp: new Date(Date.now() - 1800000),
        status: 'New'
      },
      {
        id: '3',
        type: 'Communication',
        severity: 'Low',
        title: 'SMS Gateway Latency',
        description: 'Slight delay in SMS delivery, investigating',
        timestamp: new Date(Date.now() - 3600000),
        status: 'Resolved'
      }
    ];

    setUsers(sampleUsers);
    setAlerts(sampleAlerts);
  }, []);

  // Chart data for system metrics
  const systemMetricsData = {
    labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
    datasets: [
      {
        label: 'CPU Usage (%)',
        data: [45, 52, 68, 75, 83, 67],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
      },
      {
        label: 'Memory Usage (%)',
        data: [38, 42, 56, 64, 71, 58],
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
      }
    ]
  };

  const alertDistribution = {
    labels: ['System', 'Disaster', 'Communication', 'Security'],
    datasets: [{
      data: [12, 8, 5, 3],
      backgroundColor: [
        '#3B82F6', // Blue
        '#EF4444', // Red
        '#10B981', // Green
        '#F59E0B', // Yellow
      ],
    }]
  };

  // Removed unused StatusIndicator component to fix the error.

  const TabButton = ({ label, icon: Icon, active, onClick }: {
    label: string;
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    active: boolean;
    onClick: () => void;
  }) => (
    <button
      onClick={onClick}
      className={`flex items-center px-6 py-3 rounded-lg font-medium transition-all ${
        active 
          ? 'bg-blue-600 text-white shadow-lg' 
          : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
      }`}
    >
      <Icon className="w-5 h-5 mr-2" />
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Shield className="w-8 h-8 text-blue-600 mr-3" />
                Admin Control Center
              </h1>
              <p className="text-gray-600 mt-2">Emergency Management System Administration</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">System Uptime</p>
                <p className="text-lg font-bold text-green-600">{systemStatus.uptime}%</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Last Update</p>
                <p className="text-sm font-medium text-gray-900">
                  {systemStatus.lastUpdate.toLocaleTimeString()}
                </p>
              </div>
              <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center">
                <RotateCcw className="w-4 h-4 mr-2" />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-4 mb-8 overflow-x-auto pb-2">
          <TabButton
            label="System Overview"
            icon={BarChart3}
            active={activeTab === 'overview'}
            onClick={() => setActiveTab('overview')}
          />
          <TabButton
            label="User Management"
            icon={Users}
            active={activeTab === 'users'}
            onClick={() => setActiveTab('users')}
          />
          <TabButton
            label="Alert Center"
            icon={Bell}
            active={activeTab === 'alerts'}
            onClick={() => setActiveTab('alerts')}
          />
          <TabButton
            label="System Status"
            icon={Server}
            active={activeTab === 'system'}
            onClick={() => setActiveTab('system')}
          />
          <TabButton
            label="Reports"
            icon={Download}
            active={activeTab === 'reports'}
            onClick={() => setActiveTab('reports')}
          />
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Active Users</p>
                    <p className="text-3xl font-bold text-blue-600 mt-2">
                      {users.filter(u => u.status === 'Online').length}
                    </p>
                  </div>
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Critical Alerts</p>
                    <p className="text-3xl font-bold text-red-600 mt-2">
                      {alerts.filter(a => a.severity === 'Critical' && a.status !== 'Resolved').length}
                    </p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">System Health</p>
                    <p className="text-3xl font-bold text-green-600 mt-2">{systemStatus.uptime}%</p>
                  </div>
                  <Activity className="w-8 h-8 text-green-600" />
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Communications</p>
                    <p className="text-3xl font-bold text-purple-600 mt-2">Operational</p>
                  </div>
                  <MessageSquare className="w-8 h-8 text-purple-600" />
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                  <TrendingUp className="w-5 h-5 text-blue-600 mr-2" />
                  System Performance
                </h3>
                <div className="h-80">
                  <Line 
                    data={systemMetricsData} 
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true,
                          max: 100,
                        },
                      },
                    }} 
                  />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                  <PieChartIcon className="w-5 h-5 text-purple-600 mr-2" />
                  Alert Distribution
                </h3>
                <div className="h-80">
                  <Doughnut 
                    data={alertDistribution}
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
          </div>
        )}

        {/* Other tabs content would go here... */}
        {/* For brevity, showing just the overview tab. Other tabs would follow similar pattern */}
      </div>
    </div>
  );
};

export default AdminDashboard;
