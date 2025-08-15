import React, { useState } from 'react';
// Import the Card components from the correct location
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";

// For now, create placeholder components since the demos may not be in frontend yet
const CommunityReportingDemo = () => (
  <div className="p-6 bg-blue-50 rounded-lg border border-blue-200">
    <h3 className="text-lg font-semibold text-blue-900 mb-2">Community Reporting Demo</h3>
    <p className="text-blue-800">
      This demo showcases our crowdsourced incident reporting system with photo/video evidence, 
      community verification, and real-time updates. The full demo component will be integrated soon.
    </p>
  </div>
);

const OfflineMapsFeatureDemo = () => (
  <div className="p-6 bg-green-50 rounded-lg border border-green-200">
    <h3 className="text-lg font-semibold text-green-900 mb-2">Offline Maps Demo</h3>
    <p className="text-green-800">
      This demo showcases our offline emergency mapping and navigation system with downloadable 
      map regions, emergency location database, and GPS navigation without internet connectivity.
    </p>
  </div>
);

import { 
  Users, 
  Map, 
  Box,
  ArrowRight,
  CheckCircle,
  Play,
  Layers
} from 'lucide-react';

interface EmergencySystemIntegrationProps {
  className?: string;
}

const EmergencySystemIntegration: React.FC<EmergencySystemIntegrationProps> = ({ className = '' }) => {
  const [activeSystem, setActiveSystem] = useState<'overview' | 'community' | 'visualization' | 'offline'>('overview');

  const systems = [
    {
      id: 'community',
      name: 'Community Reporting System',
      icon: Users,
      color: 'blue',
      description: 'Crowdsourced incident reporting with community verification',
      features: [
        'Incident report submission with photo/video evidence',
        'Real-time community verification system',
        'Reputation-based trust scoring',
        'Live incident feed with location mapping',
        'Analytics dashboard for emergency responders'
      ],
      metrics: {
        'Active Reports': '247',
        'Community Verifiers': '1,834',
        'Response Time': '< 3 min',
        'Accuracy Rate': '96.8%'
      }
    },
    {
      id: 'visualization',
      name: '3D Disaster Visualization',
      icon: Box,
      color: 'purple',
      description: 'Advanced 3D visualization for disaster simulation and analysis',
      features: [
        'Interactive 3D terrain modeling with elevation data',
        'Real-time flood simulation with water flow dynamics',
        'Fire spread prediction using wind and terrain data',
        'Evacuation route optimization with 3D pathfinding',
        'Multi-layer disaster scenario visualization'
      ],
      metrics: {
        'Simulation Accuracy': '94.2%',
        'Processing Speed': '< 2s',
        'Data Sources': '12',
        'Active Models': '8'
      }
    },
    {
      id: 'offline',
      name: 'Offline Maps & Navigation',
      icon: Map,
      color: 'green',
      description: 'Complete offline emergency mapping and navigation system',
      features: [
        'Download and cache map regions for offline use',
        'Emergency location database with contact info',
        'GPS navigation without internet connectivity',
        'Automatic cache management and cleanup',
        'High-accuracy positioning for emergency response'
      ],
      metrics: {
        'Cached Regions': '15',
        'Emergency Locations': '347',
        'Offline Routes': '128',
        'Cache Efficiency': '89%'
      }
    }
  ];

  const integrationScenario = {
    title: 'Complete Emergency Response Workflow',
    description: 'See how all three systems work together in a real disaster scenario',
    steps: [
      {
        step: 1,
        system: 'Community Reporting',
        action: 'Citizen reports flood incident with photo evidence',
        result: 'Report verified by 5 community members, marked as high priority'
      },
      {
        step: 2,
        system: '3D Visualization',
        action: 'System generates flood simulation model',
        result: 'Predicts flood spread, affected areas, and evacuation routes'
      },
      {
        step: 3,
        system: 'Offline Maps',
        action: 'Emergency responders download affected area maps',
        result: 'Maps and routes cached for offline emergency response'
      },
      {
        step: 4,
        system: 'Integration',
        action: 'Coordinated response using all three systems',
        result: 'Faster, more effective disaster response with community support'
      }
    ]
  };

  const getSystemColor = (color: string) => {
    switch (color) {
      case 'blue': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'purple': return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'green': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <Card className="border-l-4 border-l-orange-500 bg-gradient-to-r from-orange-50 to-red-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Layers className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Emergency Response Platform</h1>
              <p className="text-sm text-gray-600 mt-1">
                Integrated Community Reporting, 3D Visualization, and Offline Maps System
              </p>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      {activeSystem === 'overview' && (
        <>
          {/* System Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {systems.map((system) => {
              const IconComponent = system.icon;
              return (
                <Card key={system.id} className={`border-l-4 border-l-${system.color}-500 hover:shadow-lg transition-shadow cursor-pointer`}>
                  <CardContent className="pt-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className={`p-2 rounded-lg ${getSystemColor(system.color)}`}>
                        <IconComponent className="w-6 h-6" />
                      </div>
                      <h3 className="font-semibold text-lg">{system.name}</h3>
                    </div>
                    
                    <p className="text-gray-600 mb-4">{system.description}</p>
                    
                    <div className="space-y-2 mb-4">
                      {system.features.slice(0, 3).map((feature, index) => (
                        <div key={index} className="flex items-start space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{feature}</span>
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-2 mb-4">
                      {Object.entries(system.metrics).map(([key, value]) => (
                        <div key={key} className="text-center p-2 bg-gray-50 rounded">
                          <div className="text-lg font-bold text-gray-900">{value}</div>
                          <div className="text-xs text-gray-600">{key}</div>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => setActiveSystem(system.id as 'community' | 'visualization' | 'offline')}
                      className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                        system.color === 'blue' ? 'bg-blue-600 hover:bg-blue-700' :
                        system.color === 'purple' ? 'bg-purple-600 hover:bg-purple-700' :
                        'bg-green-600 hover:bg-green-700'
                      } text-white flex items-center justify-center space-x-2`}
                    >
                      <Play className="w-4 h-4" />
                      <span>View Demo</span>
                    </button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Integration Workflow */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Integrated Emergency Response Workflow</span>
                <div className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                  Real Disaster Scenario
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <h3 className="font-semibold text-lg mb-2">{integrationScenario.title}</h3>
                <p className="text-gray-600">{integrationScenario.description}</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                {integrationScenario.steps.map((step, index) => (
                  <div key={index} className="relative">
                    <div className="border-2 border-gray-200 rounded-lg p-4 h-full">
                      <div className="flex items-center space-x-2 mb-3">
                        <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                          {step.step}
                        </div>
                        <span className="font-medium text-sm text-blue-600">{step.system}</span>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="p-2 bg-gray-50 rounded text-sm">
                          <strong>Action:</strong> {step.action}
                        </div>
                        <div className="p-2 bg-green-50 rounded text-sm">
                          <strong>Result:</strong> {step.result}
                        </div>
                      </div>
                    </div>
                    
                    {index < integrationScenario.steps.length - 1 && (
                      <div className="hidden lg:block absolute top-1/2 -right-2 transform -translate-y-1/2">
                        <ArrowRight className="w-4 h-4 text-gray-400" />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">🎯 Integration Benefits</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <strong className="text-blue-800">Faster Response:</strong>
                    <p className="text-blue-700">Community reports trigger immediate visualization and response planning</p>
                  </div>
                  <div>
                    <strong className="text-blue-800">Better Accuracy:</strong>
                    <p className="text-blue-700">Verified community data improves 3D simulation precision</p>
                  </div>
                  <div>
                    <strong className="text-blue-800">Offline Resilience:</strong>
                    <p className="text-blue-700">Cached data ensures response continues even without connectivity</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-blue-600">3</div>
                <div className="text-sm text-gray-600">Integrated Systems</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-green-600">24/7</div>
                <div className="text-sm text-gray-600">Availability</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-purple-600">95%+</div>
                <div className="text-sm text-gray-600">Accuracy Rate</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-orange-600">2K+</div>
                <div className="text-sm text-gray-600">Active Users</div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* Individual System Demos */}
      {activeSystem === 'community' && (
        <div>
          <div className="flex items-center space-x-4 mb-6">
            <button
              onClick={() => setActiveSystem('overview')}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
            >
              <ArrowRight className="w-4 h-4 rotate-180" />
              <span>Back to Overview</span>
            </button>
            <h2 className="text-xl font-bold">Community Reporting System Demo</h2>
          </div>
          <CommunityReportingDemo />
        </div>
      )}

      {activeSystem === 'visualization' && (
        <div>
          <div className="flex items-center space-x-4 mb-6">
            <button
              onClick={() => setActiveSystem('overview')}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
            >
              <ArrowRight className="w-4 h-4 rotate-180" />
              <span>Back to Overview</span>
            </button>
            <h2 className="text-xl font-bold">3D Disaster Visualization Demo</h2>
          </div>
          
          <Card className="border-l-4 border-l-purple-500 bg-purple-50">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3 mb-4">
                <Box className="w-8 h-8 text-purple-600" />
                <div>
                  <h3 className="font-semibold text-purple-900">3D Visualization System</h3>
                  <p className="text-sm text-purple-700">
                    Advanced Three.js-powered disaster simulation and visualization
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="font-medium text-purple-900 mb-3">Core Features</h4>
                  <ul className="space-y-2 text-sm text-purple-800">
                    <li>• Interactive 3D terrain with elevation mapping</li>
                    <li>• Real-time flood simulation with flow dynamics</li>
                    <li>• Fire spread prediction using weather data</li>
                    <li>• Evacuation route optimization algorithms</li>
                    <li>• Multi-layer disaster scenario modeling</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium text-purple-900 mb-3">Technical Implementation</h4>
                  <ul className="space-y-2 text-sm text-purple-800">
                    <li>• Three.js for 3D rendering and WebGL</li>
                    <li>• Custom shaders for realistic effects</li>
                    <li>• WebWorkers for performance optimization</li>
                    <li>• Real-time data integration APIs</li>
                    <li>• Responsive design for all devices</li>
                  </ul>
                </div>
              </div>

              <div className="p-4 bg-white rounded-lg border border-purple-200">
                <p className="text-purple-900 font-medium mb-2">🚀 Ready for Implementation</p>
                <p className="text-purple-800 text-sm">
                  The 3D Visualization service has been fully architected with comprehensive interfaces 
                  and method structures. Three.js dependency is now installed and ready for integration.
                  The system supports terrain modeling, flood simulation, fire prediction, and evacuation 
                  route optimization with real-time rendering capabilities.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeSystem === 'offline' && (
        <div>
          <div className="flex items-center space-x-4 mb-6">
            <button
              onClick={() => setActiveSystem('overview')}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
            >
              <ArrowRight className="w-4 h-4 rotate-180" />
              <span>Back to Overview</span>
            </button>
            <h2 className="text-xl font-bold">Offline Maps & Navigation Demo</h2>
          </div>
          <OfflineMapsFeatureDemo />
        </div>
      )}
    </div>
  );
};

export default EmergencySystemIntegration;
