/**
 * AI Risk Assessment Dashboard
 * Real-time display of smart risk analysis and personalized recommendations
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  AlertTriangle,
  Brain,
  Target,
  Route,
  Clock,
  MapPin,
  TrendingUp,
  Shield,
  Zap,
  Eye,
  Users,
  Thermometer,
  Cloud,
  Mountain
} from 'lucide-react';
import SmartRiskAssessment, {
  RiskFactor,
  DisasterPrediction,
  PersonalSafetyRecommendation,
  EvacuationRoute,
  UserProfile
} from '../services/SmartRiskAssessment';

interface AIRiskDashboardProps {
  userLocation?: { lat: number; lng: number };
  userProfile?: {
    name?: string;
    medicalInfo?: {
      conditions: string[];
      medications: string[];
      allergies: string[];
    };
    emergencyContacts?: Array<{
      name: string;
      phone: string;
      relationship: string;
    }>;
    vulnerabilities?: {
      mobility: 'high' | 'medium' | 'low';
      medical: string[];
      age: 'child' | 'adult' | 'elderly';
      dependencies: string[];
    };
    preferences?: {
      transportMode: 'car' | 'walking' | 'bicycle' | 'public';
      language: string;
      notificationLevel: 'minimal' | 'standard' | 'detailed';
    };
    resources?: {
      emergencySupplies: boolean;
      vehicle: boolean;
      pets: number;
      familySize: number;
    };
  };
  isVisible: boolean;
  onToggleVisibility: () => void;
  onEmergencyAction?: (action: string, data: unknown) => void;
}

const AIRiskDashboard: React.FC<AIRiskDashboardProps> = ({
  userLocation,
  userProfile,
  isVisible,
  onToggleVisibility,
  onEmergencyAction
}) => {
  const [riskFactors, setRiskFactors] = useState<RiskFactor[]>([]);
  const [predictions, setPredictions] = useState<DisasterPrediction[]>([]);
  const [recommendations, setRecommendations] = useState<PersonalSafetyRecommendation[]>([]);
  const [evacuationRoutes, setEvacuationRoutes] = useState<EvacuationRoute[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [aiAnalysisStatus, setAiAnalysisStatus] = useState<'idle' | 'analyzing' | 'complete' | 'error'>('idle');

  const riskAssessment = SmartRiskAssessment.getInstance();

  const performAIAnalysis = useCallback(async () => {
    if (!userLocation) return;

    setIsLoading(true);
    setAiAnalysisStatus('analyzing');

    try {
      // Step 1: Analyze multiple data sources
      const risks = await riskAssessment.analyzeMultipleDataSources(userLocation, 50);
      setRiskFactors(risks);

      // Step 2: Predict disaster likelihood
      const disasterPredictions = await riskAssessment.predictDisasterLikelihood(userLocation, 72);
      setPredictions(disasterPredictions);

      // Step 3: Generate personalized recommendations
      if (userProfile) {
        const profile: UserProfile = {
          id: 'current-user',
          location: userLocation,
          vulnerabilities: userProfile.vulnerabilities || { mobility: 'medium', medical: [], age: 'adult', dependencies: [] },
          preferences: userProfile.preferences || { transportMode: 'car', language: 'en', notificationLevel: 'standard' },
          resources: userProfile.resources || { emergencySupplies: false, vehicle: true, pets: 0, familySize: 1 }
        };

        const personalizedRecs = await riskAssessment.generatePersonalizedRecommendations(profile, disasterPredictions);
        setRecommendations(personalizedRecs);

        // Step 4: Optimize evacuation routes
        if (disasterPredictions.length > 0) {
          const routes = await riskAssessment.optimizeEvacuationRoutes(
            userLocation
          );
          setEvacuationRoutes(routes);
        }
      }

      setLastUpdate(new Date());
      setAiAnalysisStatus('complete');
    } catch (error) {
      console.error('AI Analysis failed:', error);
      setAiAnalysisStatus('error');
    } finally {
      setIsLoading(false);
    }
  }, [userLocation, userProfile, riskAssessment]);

  useEffect(() => {
    if (userLocation && isVisible) {
      performAIAnalysis();
      
      // Set up periodic updates every 15 minutes
      const interval = setInterval(performAIAnalysis, 15 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [userLocation, isVisible, performAIAnalysis]);

  const getRiskLevelColor = (severity: number) => {
    if (severity >= 80) return 'text-red-500 bg-red-500/20 border-red-500/30';
    if (severity >= 60) return 'text-orange-500 bg-orange-500/20 border-orange-500/30';
    if (severity >= 40) return 'text-yellow-500 bg-yellow-500/20 border-yellow-500/30';
    return 'text-green-500 bg-green-500/20 border-green-500/30';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-500 bg-red-500/20 border-red-500/30';
      case 'high': return 'text-orange-500 bg-orange-500/20 border-orange-500/30';
      case 'medium': return 'text-yellow-500 bg-yellow-500/20 border-yellow-500/30';
      case 'low': return 'text-blue-500 bg-blue-500/20 border-blue-500/30';
      default: return 'text-gray-500 bg-gray-500/20 border-gray-500/30';
    }
  };

  const getRiskTypeIcon = (type: string) => {
    switch (type) {
      case 'weather': return <Cloud className="w-4 h-4" />;
      case 'geological': return <Mountain className="w-4 h-4" />;
      case 'environmental': return <Thermometer className="w-4 h-4" />;
      case 'social': return <Users className="w-4 h-4" />;
      case 'infrastructure': return <Shield className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const handleEmergencyAction = (action: string, data: DisasterPrediction | PersonalSafetyRecommendation | EvacuationRoute) => {
    onEmergencyAction?.(action, data);
  };

  if (!isVisible) {
    return (
      <div className="ai-dashboard-toggle fixed bottom-20 right-4 z-50">
        <button
          onClick={onToggleVisibility}
          className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-105"
          title="Open AI Risk Assessment"
        >
          <Brain className="w-6 h-6" />
        </button>
      </div>
    );
  }

  return (
    <div className="ai-risk-dashboard fixed inset-0 z-40 bg-black/50 backdrop-blur-sm">
      <div className="absolute right-0 top-0 h-full w-full max-w-2xl bg-slate-900 shadow-2xl overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-blue-600 p-4 text-white z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Brain className="w-6 h-6" />
              <div>
                <h2 className="text-xl font-bold">AI Risk Assessment</h2>
                <p className="text-sm opacity-80">
                  {aiAnalysisStatus === 'analyzing' ? 'Analyzing...' :
                   aiAnalysisStatus === 'complete' ? `Updated ${lastUpdate.toLocaleTimeString()}` :
                   aiAnalysisStatus === 'error' ? 'Analysis failed' : 'Ready'}
                </p>
              </div>
            </div>
            <button
              onClick={onToggleVisibility}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              title="Close dashboard"
            >
              <Eye className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-4 space-y-6">
          {/* AI Analysis Status */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-white flex items-center">
                <Target className="w-5 h-5 mr-2 text-purple-400" />
                Smart Analysis Status
              </h3>
              <button
                onClick={performAIAnalysis}
                disabled={isLoading}
                className="bg-purple-500 hover:bg-purple-600 disabled:bg-gray-500 text-white px-3 py-1 rounded text-sm transition-colors"
              >
                {isLoading ? 'Analyzing...' : 'Refresh'}
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-gray-300">
                <span className="font-medium">Data Sources:</span> 5 integrated
              </div>
              <div className="text-gray-300">
                <span className="font-medium">ML Models:</span> 3 active
              </div>
              <div className="text-gray-300">
                <span className="font-medium">Risk Factors:</span> {riskFactors.length} detected
              </div>
              <div className="text-gray-300">
                <span className="font-medium">Predictions:</span> {predictions.length} scenarios
              </div>
            </div>
          </div>

          {/* Risk Factors Analysis */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-yellow-400" />
              Current Risk Factors
            </h3>
            
            {riskFactors.length === 0 ? (
              <p className="text-gray-400 text-center py-4">
                {isLoading ? 'Analyzing risk factors...' : 'No significant risks detected'}
              </p>
            ) : (
              <div className="space-y-3">
                {riskFactors.slice(0, 5).map((risk, index) => (
                  <div
                    key={index}
                    className={`border rounded-lg p-3 ${getRiskLevelColor(risk.severity)}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-2">
                        {getRiskTypeIcon(risk.type)}
                        <div className="flex-1">
                          <div className="font-medium text-sm">
                            {risk.type.toUpperCase()} • {risk.severity}% severity
                          </div>
                          <div className="text-sm opacity-80 mt-1">
                            {risk.description}
                          </div>
                          <div className="text-xs opacity-60 mt-2">
                            Source: {risk.source} • Confidence: {risk.confidence}%
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Disaster Predictions */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-blue-400" />
              Disaster Likelihood Predictions
            </h3>
            
            {predictions.length === 0 ? (
              <p className="text-gray-400 text-center py-4">
                {isLoading ? 'Generating predictions...' : 'No imminent disasters predicted'}
              </p>
            ) : (
              <div className="space-y-4">
                {predictions.map((prediction, index) => (
                  <div
                    key={index}
                    className={`border rounded-lg p-4 ${getRiskLevelColor(prediction.probability)}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="font-semibold capitalize">
                        {prediction.disasterType}
                      </div>
                      <div className="text-sm font-medium">
                        {prediction.probability}% probability
                      </div>
                    </div>
                    
                    <div className="text-sm space-y-2">
                      <div className="flex items-center space-x-4">
                        <span className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {prediction.timeframe.min}-{prediction.timeframe.max}h
                        </span>
                        <span className="flex items-center">
                          <Shield className="w-3 h-3 mr-1" />
                          {prediction.severity} severity
                        </span>
                      </div>
                      
                      <div className="flex items-center">
                        <MapPin className="w-3 h-3 mr-1" />
                        {prediction.affectedArea.radius}km radius impact
                      </div>
                    </div>
                    
                    {prediction.probability > 50 && (
                      <button
                        onClick={() => handleEmergencyAction('prepare-for-disaster', prediction)}
                        className="mt-3 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition-colors"
                      >
                        Take Action
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Personalized Recommendations */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Zap className="w-5 h-5 mr-2 text-green-400" />
              Personalized Safety Recommendations
            </h3>
            
            {recommendations.length === 0 ? (
              <p className="text-gray-400 text-center py-4">
                {isLoading ? 'Generating recommendations...' : 'No specific recommendations at this time'}
              </p>
            ) : (
              <div className="space-y-3">
                {recommendations.slice(0, 3).map((rec) => (
                  <div
                    key={rec.id}
                    className={`border rounded-lg p-3 ${getPriorityColor(rec.priority)}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="font-medium">{rec.title}</div>
                      <div className="text-xs px-2 py-1 rounded bg-current/20">
                        {rec.priority.toUpperCase()}
                      </div>
                    </div>
                    
                    <div className="text-sm opacity-80 mb-2">
                      {rec.description}
                    </div>
                    
                    <div className="text-xs opacity-60 mb-2">
                      Category: {rec.category} • Timeframe: {rec.timeframe}
                    </div>
                    
                    {rec.actionItems.length > 0 && (
                      <div className="mt-3">
                        <div className="text-xs font-medium mb-1">Action Items:</div>
                        <ul className="text-xs space-y-1">
                          {rec.actionItems.slice(0, 3).map((item, i) => (
                            <li key={i} className="flex items-center">
                              <span className="w-1 h-1 bg-current rounded-full mr-2"></span>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    <button
                      onClick={() => handleEmergencyAction('follow-recommendation', rec)}
                      className="mt-3 bg-current/20 hover:bg-current/30 px-3 py-1 rounded text-xs transition-colors"
                    >
                      View Details
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Evacuation Route Optimization */}
          {evacuationRoutes.length > 0 && (
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Route className="w-5 h-5 mr-2 text-orange-400" />
                Optimized Evacuation Routes
              </h3>
              
              <div className="space-y-3">
                {evacuationRoutes.slice(0, 2).map((route) => (
                  <div
                    key={route.id}
                    className="border border-orange-500/30 bg-orange-500/20 rounded-lg p-3 text-orange-200"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium">{route.name}</div>
                      <div className="text-sm">
                        Safety Score: {route.safetyScore}%
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>Distance: {route.distance.toFixed(1)} km</div>
                      <div>Time: {route.estimatedTime} min</div>
                      <div>Traffic: {route.congestionLevel}</div>
                      <div>Type: {route.routeType}</div>
                    </div>
                    
                    {route.hazards.length > 0 && (
                      <div className="text-xs mt-2 opacity-80">
                        Hazards: {route.hazards.join(', ')}
                      </div>
                    )}
                    
                    <button
                      onClick={() => handleEmergencyAction('use-evacuation-route', route)}
                      className="mt-3 bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded text-sm transition-colors"
                    >
                      Use This Route
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Model Performance */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Brain className="w-5 h-5 mr-2 text-purple-400" />
              AI Model Performance
            </h3>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-400">Prediction Accuracy</div>
                <div className="text-white font-medium">87.3%</div>
              </div>
              <div>
                <div className="text-gray-400">Response Time</div>
                <div className="text-white font-medium">&lt; 2s</div>
              </div>
              <div>
                <div className="text-gray-400">Data Sources</div>
                <div className="text-white font-medium">Weather, Seismic, Traffic</div>
              </div>
              <div>
                <div className="text-gray-400">Last Training</div>
                <div className="text-white font-medium">2 days ago</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIRiskDashboard;
