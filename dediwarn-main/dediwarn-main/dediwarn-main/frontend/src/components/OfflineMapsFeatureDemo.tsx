import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import OfflineMapsDashboard from './OfflineMapsDashboard';
import { 
  Download, 
  Map, 
  MapPin, 
  Navigation, 
  Wifi, 
  WifiOff, 
  Play,
  Pause,
  RotateCcw,
  Activity
} from 'lucide-react';

interface OfflineMapsFeatureDemoProps {
  className?: string;
}

interface DemoScenario {
  id: string;
  title: string;
  description: string;
  steps: Array<{
    step: number;
    action: string;
    result: string;
    duration: number;
  }>;
}

const OfflineMapsFeatureDemo: React.FC<OfflineMapsFeatureDemoProps> = ({ className = '' }) => {
  const [isDemoRunning, setIsDemoRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedScenario, setSelectedScenario] = useState<string>('download');
  const [demoProgress, setDemoProgress] = useState(0);
  const [isOnline, setIsOnline] = useState(true);

  const scenarios: DemoScenario[] = [
    {
      id: 'download',
      title: 'Map Region Download',
      description: 'Demonstrate downloading and caching map regions for offline use',
      steps: [
        {
          step: 1,
          action: 'User selects "Downtown Emergency Zone" region',
          result: 'Region boundaries displayed on map',
          duration: 2000
        },
        {
          step: 2,
          action: 'Initiate download process',
          result: 'Download starts, progress bar appears',
          duration: 3000
        },
        {
          step: 3,
          action: 'Download map tiles (zoom levels 8-15)',
          result: 'Progress updates: 0% → 100%',
          duration: 5000
        },
        {
          step: 4,
          action: 'Cache tiles in IndexedDB',
          result: 'Region marked as "Downloaded" (87 MB)',
          duration: 2000
        },
        {
          step: 5,
          action: 'Verify offline access',
          result: 'Maps available without internet',
          duration: 2000
        }
      ]
    },
    {
      id: 'locations',
      title: 'Emergency Locations Caching',
      description: 'Cache critical emergency facilities and services for offline access',
      steps: [
        {
          step: 1,
          action: 'Fetch emergency locations from API',
          result: 'Retrieved 127 locations (hospitals, police, etc.)',
          duration: 2000
        },
        {
          step: 2,
          action: 'Process location metadata',
          result: 'Added contact info, services, capacity data',
          duration: 2000
        },
        {
          step: 3,
          action: 'Store in local database',
          result: 'Locations cached with offline access',
          duration: 2000
        },
        {
          step: 4,
          action: 'Enable location search',
          result: 'Search by type, distance, status works offline',
          duration: 2000
        },
        {
          step: 5,
          action: 'Test offline functionality',
          result: 'All 127 locations accessible without network',
          duration: 2000
        }
      ]
    },
    {
      id: 'navigation',
      title: 'Offline GPS Navigation',
      description: 'Navigate to emergency locations using cached routes and GPS',
      steps: [
        {
          step: 1,
          action: 'User selects "General Hospital" destination',
          result: 'Route calculated using cached road data',
          duration: 2000
        },
        {
          step: 2,
          action: 'Start GPS navigation',
          result: 'Turn-by-turn directions begin',
          duration: 2000
        },
        {
          step: 3,
          action: 'GPS tracking active (High accuracy mode)',
          result: 'Position: 38.9072° N, 77.0369° W (3m accuracy)',
          duration: 3000
        },
        {
          step: 4,
          action: 'Navigate using offline maps',
          result: 'Next: "Turn left on Main Street in 200m"',
          duration: 4000
        },
        {
          step: 5,
          action: 'Arrive at destination',
          result: 'Navigation complete - Hospital reached',
          duration: 2000
        }
      ]
    },
    {
      id: 'offline',
      title: 'Complete Offline Operation',
      description: 'Simulate full offline emergency response scenario',
      steps: [
        {
          step: 1,
          action: 'Internet connection lost',
          result: 'System switches to offline mode',
          duration: 2000
        },
        {
          step: 2,
          action: 'Access cached emergency locations',
          result: 'All 127 locations available offline',
          duration: 2000
        },
        {
          step: 3,
          action: 'Find nearest hospital',
          result: 'General Hospital - 0.8 km away',
          duration: 2000
        },
        {
          step: 4,
          action: 'Start offline navigation',
          result: 'GPS navigation using cached maps',
          duration: 3000
        },
        {
          step: 5,
          action: 'Complete emergency response',
          result: 'Successfully reached help without internet',
          duration: 3000
        }
      ]
    }
  ];

  const currentScenario = scenarios.find(s => s.id === selectedScenario);

  useEffect(() => {
    let interval: ReturnType<typeof setTimeout>;

    if (isDemoRunning && currentScenario) {
      const totalSteps = currentScenario.steps.length;
      const currentStepData = currentScenario.steps[currentStep];

      if (currentStep < totalSteps) {
        interval = setTimeout(() => {
          if (currentStep === totalSteps - 1) {
            setIsDemoRunning(false);
            setDemoProgress(100);
          } else {
            setCurrentStep(currentStep + 1);
            setDemoProgress(((currentStep + 1) / totalSteps) * 100);
          }
        }, currentStepData.duration);
      }
    }

    return () => {
      if (interval) clearTimeout(interval);
    };
  }, [isDemoRunning, currentStep, currentScenario]);

  const startDemo = () => {
    setIsDemoRunning(true);
    setCurrentStep(0);
    setDemoProgress(0);

    // Simulate offline mode for offline scenario
    if (selectedScenario === 'offline') {
      setTimeout(() => setIsOnline(false), 2000);
    }
  };

  const pauseDemo = () => {
    setIsDemoRunning(false);
  };

  const resetDemo = () => {
    setIsDemoRunning(false);
    setCurrentStep(0);
    setDemoProgress(0);
    setIsOnline(true);
  };

  const getCurrentStepData = () => {
    if (!currentScenario || currentStep >= currentScenario.steps.length) return null;
    return currentScenario.steps[currentStep];
  };

  const stepData = getCurrentStepData();

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Demo Header */}
      <Card className="border-l-4 border-l-purple-500 bg-gradient-to-r from-purple-50 to-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Map className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Offline Maps System Demo</h2>
              <p className="text-sm text-gray-600 mt-1">
                Interactive demonstration of emergency offline mapping capabilities
              </p>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Scenario Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Demo Scenario</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {scenarios.map((scenario) => (
              <button
                key={scenario.id}
                onClick={() => setSelectedScenario(scenario.id)}
                className={`p-4 border-2 rounded-lg text-left transition-all ${
                  selectedScenario === scenario.id
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-purple-300 hover:bg-purple-25'
                }`}
              >
                <h3 className="font-semibold text-gray-900 mb-2">{scenario.title}</h3>
                <p className="text-sm text-gray-600">{scenario.description}</p>
                <div className="mt-3 flex items-center space-x-2">
                  <div className="text-xs bg-gray-100 px-2 py-1 rounded">
                    {scenario.steps.length} steps
                  </div>
                  <div className="text-xs text-gray-500">
                    ~{Math.round(scenario.steps.reduce((sum, step) => sum + step.duration, 0) / 1000)}s
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Demo Controls */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-4">
              <button
                onClick={isDemoRunning ? pauseDemo : startDemo}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  isDemoRunning
                    ? 'bg-orange-600 text-white hover:bg-orange-700'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {isDemoRunning ? (
                  <>
                    <Pause className="w-4 h-4" />
                    <span>Pause Demo</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    <span>Start Demo</span>
                  </>
                )}
              </button>

              <button
                onClick={resetDemo}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset</span>
              </button>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                {isOnline ? (
                  <Wifi className="w-5 h-5 text-green-500" />
                ) : (
                  <WifiOff className="w-5 h-5 text-red-500" />
                )}
                <span className="text-sm font-medium">
                  {isOnline ? 'Online' : 'Offline'} Mode
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <Activity className="w-5 h-5 text-blue-500" />
                <span className="text-sm font-medium">
                  Progress: {Math.round(demoProgress)}%
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Step Display */}
      {currentScenario && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Demo: {currentScenario.title}</span>
              <div className="flex items-center space-x-2 text-sm">
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
                  Step {Math.min(currentStep + 1, currentScenario.steps.length)} of {currentScenario.steps.length}
                </span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`bg-blue-500 h-2 rounded-full transition-all duration-500 progress-bar-width`}
                  data-progress={demoProgress}
                />
              </div>
            </div>

            {stepData && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">Current Action</h4>
                    <p className="text-blue-800">{stepData.action}</p>
                  </div>

                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h4 className="font-semibold text-green-900 mb-2">Expected Result</h4>
                    <p className="text-green-800">{stepData.result}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 border rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-3">All Demo Steps</h4>
                    <div className="space-y-2">
                      {currentScenario.steps.map((step, index) => (
                        <div
                          key={index}
                          className={`flex items-center space-x-3 p-2 rounded ${
                            index === currentStep 
                              ? 'bg-blue-100 border border-blue-300'
                              : index < currentStep 
                                ? 'bg-green-50 border border-green-200'
                                : 'bg-white border border-gray-200'
                          }`}
                        >
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                              index === currentStep
                                ? 'bg-blue-500 text-white'
                                : index < currentStep
                                  ? 'bg-green-500 text-white'
                                  : 'bg-gray-300 text-gray-600'
                            }`}
                          >
                            {step.step}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{step.action}</p>
                            <p className="text-xs text-gray-600">{step.result}</p>
                          </div>
                          {index === currentStep && isDemoRunning && (
                            <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {!isDemoRunning && demoProgress === 100 && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-semibold text-green-900 mb-2">✅ Demo Complete!</h4>
                <p className="text-green-800">
                  The {currentScenario.title.toLowerCase()} demonstration has finished successfully. 
                  All offline mapping features are now ready for emergency use.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Feature Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3 mb-3">
              <Download className="w-8 h-8 text-blue-500" />
              <div>
                <h3 className="font-semibold">Map Caching</h3>
                <p className="text-sm text-gray-600">Download regions for offline use</p>
              </div>
            </div>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Multiple zoom levels (8-15)</li>
              <li>• Configurable cache size</li>
              <li>• Automatic cleanup</li>
              <li>• Progress tracking</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3 mb-3">
              <MapPin className="w-8 h-8 text-green-500" />
              <div>
                <h3 className="font-semibold">Emergency Locations</h3>
                <p className="text-sm text-gray-600">Critical facilities database</p>
              </div>
            </div>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Hospitals, police, fire stations</li>
              <li>• Contact information</li>
              <li>• Operational status</li>
              <li>• Distance-based search</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3 mb-3">
              <Navigation className="w-8 h-8 text-purple-500" />
              <div>
                <h3 className="font-semibold">GPS Navigation</h3>
                <p className="text-sm text-gray-600">Turn-by-turn directions</p>
              </div>
            </div>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Works completely offline</li>
              <li>• High-accuracy positioning</li>
              <li>• Route optimization</li>
              <li>• Real-time tracking</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Live Dashboard */}
      <Card>
        <CardHeader>
          <CardTitle>Live Offline Maps Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <OfflineMapsDashboard />
        </CardContent>
      </Card>
    </div>
  );
};

export default OfflineMapsFeatureDemo;
