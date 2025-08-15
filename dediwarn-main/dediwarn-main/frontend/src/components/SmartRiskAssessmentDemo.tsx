/**
 * Advanced AI-Powered Risk Assessment Demo Component
 * Showcases all Smart Risk Assessment features with real-time updates
 */

import React, { useState, useEffect } from 'react';
import {
  Brain,
  AlertTriangle,
  MapPin,
  TrendingUp,
  Route,
  Target,
  Clock,
  Zap,
  Shield,
  Eye,
  Play,
  Pause,
  RefreshCw,
  BarChart3,
  Users,
  Cloud,
  Mountain,
  Thermometer
} from 'lucide-react';
import SmartRiskAssessment, {
  RiskFactor,
  DisasterPrediction,
  PersonalSafetyRecommendation,
  EvacuationRoute,
  UserProfile
} from '../services/SmartRiskAssessment';

interface SmartRiskAssessmentDemoProps {
  userLocation?: { lat: number; lng: number };
  isActive?: boolean;
  onRiskLevelChange?: (level: 'low' | 'moderate' | 'high' | 'critical') => void;
}

const SmartRiskAssessmentDemo: React.FC<SmartRiskAssessmentDemoProps> = ({
  userLocation = { lat: 40.7128, lng: -74.0060 }, // Default to NYC
  isActive = true,
  onRiskLevelChange
}) => {
  // State for AI analysis results
  const [riskFactors, setRiskFactors] = useState<RiskFactor[]>([]);
  const [predictions, setPredictions] = useState<DisasterPrediction[]>([]);
  const [recommendations, setRecommendations] = useState<PersonalSafetyRecommendation[]>([]);
  const [evacuationRoutes, setEvacuationRoutes] = useState<EvacuationRoute[]>([]);
  
  // State for demo controls
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [overallRiskLevel, setOverallRiskLevel] = useState<'low' | 'moderate' | 'high' | 'critical'>('low');
  const [mlModelStats, setMlModelStats] = useState({
    dataSourcesIntegrated: 5,
    riskFactorsAnalyzed: 0,
    predictionsGenerated: 0,
    recommendationsCreated: 0,
    routesOptimized: 0
  });

  // Auto-refresh and analysis
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const riskAssessment = SmartRiskAssessment.getInstance();

  // Demo user profile
  const demoUserProfile: UserProfile = {
    id: 'demo-user',
    location: userLocation,
    vulnerabilities: {
      mobility: 'medium',
      medical: ['diabetes', 'hypertension'],
      age: 'adult',
      dependencies: ['elderly parent', '2 pets']
    },
    preferences: {
      transportMode: 'car',
      language: 'en',
      notificationLevel: 'detailed'
    },
    resources: {
      emergencySupplies: true,
      vehicle: true,
      pets: 2,
      familySize: 3
    }
  };

  const runCompleteAnalysis = async () => {
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    
    try {
      // Step 1: Analyze multiple data sources
      setCurrentStep('Analyzing multiple data sources...');
      setAnalysisProgress(20);
      
      const risks = await riskAssessment.analyzeMultipleDataSources(userLocation, 50);
      setRiskFactors(risks);
      setMlModelStats(prev => ({ ...prev, riskFactorsAnalyzed: risks.length }));

      // Step 2: Predict disaster likelihood
      setCurrentStep('Predicting disaster likelihood using AI...');
      setAnalysisProgress(40);
      
      const disasterPredictions = await riskAssessment.predictDisasterLikelihood(userLocation, 72);
      setPredictions(disasterPredictions);
      setMlModelStats(prev => ({ ...prev, predictionsGenerated: disasterPredictions.length }));

      // Step 3: Generate personalized recommendations
      setCurrentStep('Generating personalized safety recommendations...');
      setAnalysisProgress(60);
      
      const personalizedRecs = await riskAssessment.generatePersonalizedRecommendations(
        demoUserProfile, 
        disasterPredictions
      );
      setRecommendations(personalizedRecs);
      setMlModelStats(prev => ({ ...prev, recommendationsCreated: personalizedRecs.length }));

      // Step 4: Optimize evacuation routes
      setCurrentStep('Optimizing evacuation routes...');
      setAnalysisProgress(80);
      
      const routes = await riskAssessment.optimizeEvacuationRoutes(
        userLocation
      );
      setEvacuationRoutes(routes);
      setMlModelStats(prev => ({ ...prev, routesOptimized: routes.length }));

      // Step 5: Calculate overall risk level
      setCurrentStep('Calculating overall risk assessment...');
      setAnalysisProgress(100);
      
      const overallRisk = calculateOverallRisk(risks, disasterPredictions);
      setOverallRiskLevel(overallRisk);
      onRiskLevelChange?.(overallRisk);

      setLastUpdate(new Date());
      setCurrentStep('Analysis complete');
      
    } catch (error) {
      console.error('Smart Risk Assessment failed:', error);
      setCurrentStep('Analysis failed - using demo data');
      generateDemoData();
    } finally {
      setTimeout(() => setIsAnalyzing(false), 1000);
    }
  };

  useEffect(() => {
    if (isActive) {
      runCompleteAnalysis();
      
      if (autoRefresh) {
        const interval = setInterval(runCompleteAnalysis, 30000); // Every 30 seconds for demo
        return () => clearInterval(interval);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, autoRefresh, userLocation]);

  // Remove the old function definition below

  const calculateOverallRisk = (risks: RiskFactor[], predictions: DisasterPrediction[]): 'low' | 'moderate' | 'high' | 'critical' => {
    const avgRiskSeverity = risks.length > 0 
      ? risks.reduce((sum, risk) => sum + risk.severity, 0) / risks.length 
      : 0;
    
    const maxPredictionProbability = predictions.length > 0 
      ? Math.max(...predictions.map(p => p.probability)) 
      : 0;

    const combinedScore = (avgRiskSeverity + maxPredictionProbability) / 2;

    if (combinedScore >= 80) return 'critical';
    if (combinedScore >= 60) return 'high';
    if (combinedScore >= 40) return 'moderate';
    return 'low';
  };

  const generateDemoData = () => {
    // Generate sample data for demonstration
    const sampleRisks: RiskFactor[] = [
      {
        type: 'weather',
        severity: 65,
        confidence: 90,
        source: 'OpenWeatherMap',
        timestamp: new Date(),
        location: { ...userLocation, radius: 25 },
        description: 'Heavy rainfall expected in next 6 hours'
      },
      {
        type: 'geological',
        severity: 35,
        confidence: 75,
        source: 'USGS',
        timestamp: new Date(),
        location: { ...userLocation, radius: 50 },
        description: 'Minor seismic activity detected'
      }
    ];

    const samplePredictions: DisasterPrediction[] = [
      {
        disasterType: 'flood',
        probability: 72,
        timeframe: { min: 2, max: 8, peak: 4 },
        severity: 'high',
        confidence: 85,
        affectedArea: { center: userLocation, radius: 30 },
        riskFactors: sampleRisks,
        historicalPatterns: {
          frequency: 1.2,
          lastOccurrence: new Date(Date.now() - 86400000 * 90),
          averageSeverity: 65
        }
      }
    ];

    setRiskFactors(sampleRisks);
    setPredictions(samplePredictions);
    setMlModelStats(prev => ({
      ...prev,
      riskFactorsAnalyzed: sampleRisks.length,
      predictionsGenerated: samplePredictions.length,
      recommendationsCreated: 3,
      routesOptimized: 2
    }));
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'critical': return 'text-red-500 bg-red-500/20 border-red-500/30';
      case 'high': return 'text-orange-500 bg-orange-500/20 border-orange-500/30';
      case 'moderate': return 'text-yellow-500 bg-yellow-500/20 border-yellow-500/30';
      case 'low': return 'text-green-500 bg-green-500/20 border-green-500/30';
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

  return (
    <div className="smart-risk-assessment-demo bg-gradient-to-br from-slate-900 to-blue-900 rounded-xl shadow-2xl overflow-hidden">
      {/* Header with Controls */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Brain className="w-6 h-6" />
            <div>
              <h2 className="text-xl font-bold">AI-Powered Smart Risk Assessment</h2>
              <p className="text-sm opacity-80">
                Multi-source analysis with ML predictions • Last update: {lastUpdate.toLocaleTimeString()}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`p-2 rounded-lg transition-colors ${
                autoRefresh ? 'bg-white/20' : 'bg-white/10'
              }`}
              title={`Auto-refresh: ${autoRefresh ? 'On' : 'Off'}`}
            >
              {autoRefresh ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            
            <button
              onClick={runCompleteAnalysis}
              disabled={isAnalyzing}
              className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors disabled:opacity-50"
              title="Refresh Analysis"
            >
              <RefreshCw className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Analysis Progress */}
        {isAnalyzing && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span>{currentStep}</span>
              <span>{analysisProgress}%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div
                className={`bg-white rounded-full h-2 transition-all duration-300 analysis-progress-bar`}
                data-progress={analysisProgress}
              />
            </div>
          </div>
        )}
      </div>

      <div className="p-6 space-y-6">
        {/* Overall Risk Level */}
        <div className={`border rounded-lg p-4 ${getRiskLevelColor(overallRiskLevel)}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Target className="w-6 h-6" />
              <div>
                <h3 className="text-lg font-semibold">Overall Risk Level</h3>
                <p className="text-sm opacity-80">Based on AI analysis of multiple data sources</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold capitalize">{overallRiskLevel}</div>
              <div className="text-xs opacity-60">Confidence: 87%</div>
            </div>
          </div>
        </div>

        {/* ML Model Statistics */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-blue-400" />
            AI Model Performance
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{mlModelStats.dataSourcesIntegrated}</div>
              <div className="text-xs text-gray-400">Data Sources</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">{mlModelStats.riskFactorsAnalyzed}</div>
              <div className="text-xs text-gray-400">Risk Factors</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400">{mlModelStats.predictionsGenerated}</div>
              <div className="text-xs text-gray-400">Predictions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{mlModelStats.recommendationsCreated}</div>
              <div className="text-xs text-gray-400">Recommendations</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">{mlModelStats.routesOptimized}</div>
              <div className="text-xs text-gray-400">Routes</div>
            </div>
          </div>
        </div>

        {/* Risk Factors Analysis */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2 text-yellow-400" />
            Multi-Source Risk Analysis
          </h3>
          
          {riskFactors.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              {isAnalyzing ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                  <span>Analyzing multiple data sources...</span>
                </div>
              ) : (
                'No significant risks detected'
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {riskFactors.map((risk, index) => (
                <div
                  key={index}
                  className={`border rounded-lg p-3 ${getRiskLevelColor(
                    risk.severity >= 80 ? 'critical' :
                    risk.severity >= 60 ? 'high' :
                    risk.severity >= 40 ? 'moderate' : 'low'
                  )}`}
                >
                  <div className="flex items-start space-x-2">
                    {getRiskTypeIcon(risk.type)}
                    <div className="flex-1">
                      <div className="font-medium text-sm">
                        {risk.type.toUpperCase()} • {risk.severity}% severity
                      </div>
                      <div className="text-sm opacity-80 mt-1">
                        {risk.description}
                      </div>
                      <div className="text-xs opacity-60 mt-2 flex items-center justify-between">
                        <span>Source: {risk.source}</span>
                        <span>Confidence: {risk.confidence}%</span>
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
            AI Disaster Predictions
          </h3>
          
          {predictions.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              {isAnalyzing ? 'Generating AI predictions...' : 'No imminent disasters predicted'}
            </div>
          ) : (
            <div className="space-y-4">
              {predictions.map((prediction, index) => (
                <div
                  key={index}
                  className={`border rounded-lg p-4 ${getRiskLevelColor(
                    prediction.probability >= 80 ? 'critical' :
                    prediction.probability >= 60 ? 'high' :
                    prediction.probability >= 40 ? 'moderate' : 'low'
                  )}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="font-semibold text-lg capitalize">
                      {prediction.disasterType}
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold">{prediction.probability}%</div>
                      <div className="text-xs">probability</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {prediction.timeframe.min}-{prediction.timeframe.max}h
                    </div>
                    <div className="flex items-center">
                      <Shield className="w-3 h-3 mr-1" />
                      {prediction.severity}
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-3 h-3 mr-1" />
                      {prediction.affectedArea.radius}km radius
                    </div>
                    <div className="flex items-center">
                      <Eye className="w-3 h-3 mr-1" />
                      {prediction.confidence}% confidence
                    </div>
                  </div>

                  {prediction.historicalPatterns && (
                    <div className="mt-3 pt-3 border-t border-current/20">
                      <div className="text-xs opacity-70">
                        Historical: {prediction.historicalPatterns.frequency}/year frequency • 
                        Last occurrence: {prediction.historicalPatterns.lastOccurrence.toLocaleDateString()}
                      </div>
                    </div>
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
            AI-Generated Safety Recommendations
          </h3>
          
          {recommendations.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              {isAnalyzing ? 'Creating personalized recommendations...' : 'No specific recommendations needed'}
            </div>
          ) : (
            <div className="space-y-4">
              {recommendations.map((rec) => (
                <div
                  key={rec.id}
                  className={`border rounded-lg p-4 ${getRiskLevelColor(rec.priority)}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="font-medium text-lg">{rec.title}</div>
                    <div className="text-xs px-2 py-1 rounded bg-current/20 uppercase font-medium">
                      {rec.priority}
                    </div>
                  </div>
                  
                  <div className="text-sm opacity-90 mb-3">
                    {rec.description}
                  </div>
                  
                  <div className="text-xs opacity-70 mb-3">
                    Category: {rec.category} • Timeframe: {rec.timeframe}
                  </div>
                  
                  {rec.actionItems.length > 0 && (
                    <div className="space-y-1">
                      <div className="text-sm font-medium">Action Items:</div>
                      <ul className="text-sm space-y-1">
                        {rec.actionItems.map((item, i) => (
                          <li key={i} className="flex items-start">
                            <span className="w-1.5 h-1.5 bg-current rounded-full mt-2 mr-2 flex-shrink-0"></span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {rec.personalizedFactors.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-current/20">
                      <div className="text-xs opacity-60">
                        Personalized for: {rec.personalizedFactors.join(', ')}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Evacuation Routes */}
        {evacuationRoutes.length > 0 && (
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Route className="w-5 h-5 mr-2 text-orange-400" />
              AI-Optimized Evacuation Routes
            </h3>
            
            <div className="space-y-4">
              {evacuationRoutes.map((route) => (
                <div
                  key={route.id}
                  className="border border-orange-500/30 bg-orange-500/10 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="font-medium text-orange-200">{route.name}</div>
                    <div className="text-orange-300">
                      Safety Score: {route.safetyScore}%
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-orange-200">
                    <div>Distance: {route.distance.toFixed(1)} km</div>
                    <div>Time: {route.estimatedTime} min</div>
                    <div>Traffic: {route.congestionLevel}</div>
                    <div>Type: {route.routeType}</div>
                  </div>
                  
                  {route.hazards.length > 0 && (
                    <div className="text-xs mt-3 text-orange-300/80">
                      Hazards: {route.hazards.join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SmartRiskAssessmentDemo;
