/**
 * Community Features Demo
 * Comprehensive demonstration of volunteer network and resource sharing
 */

import React, { useState } from 'react';
import {
  Users,
  Heart,
  Share2,
  Award,
  BookOpen,
  Target,
  MessageCircle,
  TrendingUp,
  Clock,
  Star,
  Trophy,
  Zap
} from 'lucide-react';
import VolunteerNetworkDashboard from './VolunteerNetworkDashboard';
import ResourceSharingComponent from './ResourceSharingComponent';

const CommunityFeaturesDemo: React.FC = () => {
  const [activeFeature, setActiveFeature] = useState<'overview' | 'volunteer-network' | 'resource-sharing'>('overview');
  const [isRunning, setIsRunning] = useState(false);
  const [demoProgress, setDemoProgress] = useState(0);

  const mockCurrentUser = {
    id: 'vol-001',
    name: 'Demo User',
    role: 'coordinator' as const
  };

  const runCommunityDemo = async () => {
    setIsRunning(true);
    setDemoProgress(0);

    const steps = [
      'Initializing Community Network...',
      'Loading Volunteer Profiles...',
      'Analyzing Skill Sets and Availability...',
      'Matching Volunteers to Missions...',
      'Coordinating Resource Sharing...',
      'Processing Training Enrollments...',
      'Calculating Recognition Awards...',
      'Generating Community Insights...'
    ];

    for (let i = 0; i < steps.length; i++) {
      setDemoProgress(((i + 1) / steps.length) * 100);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    setIsRunning(false);
  };

  const CommunityOverview = () => (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-green-600 text-white rounded-xl p-8 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-4">🤝 Community Features</h1>
          <p className="text-xl mb-6 text-blue-100">
            Building stronger communities through volunteer coordination, resource sharing, 
            and skill-based matching for emergency response
          </p>
          <div className="flex justify-center items-center gap-6 text-blue-100">
            <div className="flex items-center">
              <Users className="h-6 w-6 mr-2" />
              Real-time Volunteer Coordination
            </div>
            <div className="flex items-center">
              <Share2 className="h-6 w-6 mr-2" />
              Resource Sharing Network
            </div>
            <div className="flex items-center">
              <Award className="h-6 w-6 mr-2" />
              Recognition System
            </div>
          </div>
        </div>
      </div>

      {/* Key Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-blue-500">
          <div className="flex items-center mb-4">
            <div className="p-3 bg-blue-100 rounded-lg mr-4">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Volunteer Network</h3>
          </div>
          <ul className="space-y-2 text-gray-600">
            <li>✅ Real-time volunteer coordination</li>
            <li>✅ Skill-based matching algorithms</li>
            <li>✅ Availability scheduling system</li>
            <li>✅ Mission assignment optimization</li>
            <li>✅ Performance tracking & analytics</li>
          </ul>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-green-500">
          <div className="flex items-center mb-4">
            <div className="p-3 bg-green-100 rounded-lg mr-4">
              <Share2 className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Resource Sharing</h3>
          </div>
          <ul className="space-y-2 text-gray-600">
            <li>✅ Community resource inventory</li>
            <li>✅ Smart resource matching</li>
            <li>✅ Borrowing & lending system</li>
            <li>✅ Usage tracking & maintenance</li>
            <li>✅ Emergency resource prioritization</li>
          </ul>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-purple-500">
          <div className="flex items-center mb-4">
            <div className="p-3 bg-purple-100 rounded-lg mr-4">
              <BookOpen className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Training Programs</h3>
          </div>
          <ul className="space-y-2 text-gray-600">
            <li>✅ Comprehensive training catalog</li>
            <li>✅ Skill certification tracking</li>
            <li>✅ Prerequisite management</li>
            <li>✅ Progress monitoring</li>
            <li>✅ Continuing education paths</li>
          </ul>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-yellow-500">
          <div className="flex items-center mb-4">
            <div className="p-3 bg-yellow-100 rounded-lg mr-4">
              <Trophy className="h-8 w-8 text-yellow-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Recognition System</h3>
          </div>
          <ul className="space-y-2 text-gray-600">
            <li>✅ Achievement badges & awards</li>
            <li>✅ Point-based reward system</li>
            <li>✅ Milestone celebrations</li>
            <li>✅ Community leaderboards</li>
            <li>✅ Impact visualization</li>
          </ul>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-red-500">
          <div className="flex items-center mb-4">
            <div className="p-3 bg-red-100 rounded-lg mr-4">
              <Target className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Mission Coordination</h3>
          </div>
          <ul className="space-y-2 text-gray-600">
            <li>✅ Emergency response missions</li>
            <li>✅ Automated volunteer matching</li>
            <li>✅ Real-time status updates</li>
            <li>✅ Resource requirements planning</li>
            <li>✅ Post-mission evaluation</li>
          </ul>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-indigo-500">
          <div className="flex items-center mb-4">
            <div className="p-3 bg-indigo-100 rounded-lg mr-4">
              <MessageCircle className="h-8 w-8 text-indigo-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Communication Hub</h3>
          </div>
          <ul className="space-y-2 text-gray-600">
            <li>✅ Multi-channel messaging</li>
            <li>✅ Emergency broadcast system</li>
            <li>✅ Team coordination tools</li>
            <li>✅ Status update notifications</li>
            <li>✅ Community announcements</li>
          </ul>
        </div>
      </div>

      {/* Demo Launch Section */}
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">🚀 Interactive Community Demo</h2>
          <p className="text-gray-600 mb-6">
            Experience the full community features system in action. Run a simulation to see 
            volunteer coordination, resource sharing, and community engagement in real-time.
          </p>
          
          <button
            onClick={runCommunityDemo}
            disabled={isRunning}
            className={`px-8 py-4 rounded-lg font-semibold text-lg transition-colors ${
              isRunning 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
            }`}
          >
            {isRunning ? '⚙️ Running Community Simulation...' : '🚀 Launch Community Demo'}
          </button>

          {isRunning && (
            <div className="mt-6">
              <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                <div 
                  className={`bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500 demo-progress-bar`}
                  data-progress={demoProgress}
                ></div>
              </div>
              <p className="text-sm text-gray-600">Initializing community systems... {demoProgress.toFixed(0)}%</p>
            </div>
          )}
        </div>

        {/* Quick Access Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => setActiveFeature('volunteer-network')}
            className="flex items-center justify-center p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <Users className="h-6 w-6 text-blue-600 mr-3" />
            <span className="font-semibold text-blue-700">Explore Volunteer Network</span>
          </button>
          
          <button
            onClick={() => setActiveFeature('resource-sharing')}
            className="flex items-center justify-center p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
          >
            <Share2 className="h-6 w-6 text-green-600 mr-3" />
            <span className="font-semibold text-green-700">Explore Resource Sharing</span>
          </button>
        </div>
      </div>

      {/* Impact Statistics */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-8">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">Community Impact</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="flex items-center justify-center w-16 h-16 bg-blue-500 text-white rounded-full mx-auto mb-4">
              <Users className="h-8 w-8" />
            </div>
            <div className="text-3xl font-bold text-blue-600 mb-2">1,247</div>
            <div className="text-gray-600">Active Volunteers</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center w-16 h-16 bg-green-500 text-white rounded-full mx-auto mb-4">
              <Share2 className="h-8 w-8" />
            </div>
            <div className="text-3xl font-bold text-green-600 mb-2">892</div>
            <div className="text-gray-600">Resources Shared</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center w-16 h-16 bg-purple-500 text-white rounded-full mx-auto mb-4">
              <Target className="h-8 w-8" />
            </div>
            <div className="text-3xl font-bold text-purple-600 mb-2">2,156</div>
            <div className="text-gray-600">Missions Completed</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center w-16 h-16 bg-yellow-500 text-white rounded-full mx-auto mb-4">
              <Clock className="h-8 w-8" />
            </div>
            <div className="text-3xl font-bold text-yellow-600 mb-2">15,680</div>
            <div className="text-gray-600">Volunteer Hours</div>
          </div>
        </div>
      </div>

      {/* Feature Demonstration Cards */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900 text-center">System Capabilities</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Zap className="h-6 w-6 text-yellow-500 mr-2" />
              Real-time Coordination
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span>Emergency Mission Alert</span>
                <span className="text-green-600 font-semibold">3 volunteers matched</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <span>Resource Request</span>
                <span className="text-blue-600 font-semibold">Generator available</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <span>Training Enrollment</span>
                <span className="text-purple-600 font-semibold">15 spots remaining</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <TrendingUp className="h-6 w-6 text-blue-500 mr-2" />
              Performance Analytics
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Response Time</span>
                <span className="font-semibold text-green-600">⬇️ 15% faster</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Volunteer Satisfaction</span>
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-500 mr-1" />
                  <span className="font-semibold">4.8/5</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Resource Utilization</span>
                <span className="font-semibold text-blue-600">📈 87%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Mission Success Rate</span>
                <span className="font-semibold text-purple-600">🎯 94%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Navigation */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { key: 'overview', label: 'Community Overview', icon: Heart },
                { key: 'volunteer-network', label: 'Volunteer Network', icon: Users },
                { key: 'resource-sharing', label: 'Resource Sharing', icon: Share2 }
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveFeature(key as 'overview' | 'volunteer-network' | 'resource-sharing')}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeFeature === key
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-2" />
                  {label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        {activeFeature === 'overview' && <CommunityOverview />}
        {activeFeature === 'volunteer-network' && (
          <VolunteerNetworkDashboard 
            currentUser={mockCurrentUser}
            isVisible={true}
          />
        )}
        {activeFeature === 'resource-sharing' && (
          <ResourceSharingComponent 
            currentUserId={mockCurrentUser.id}
            isVisible={true}
          />
        )}
      </div>
    </div>
  );
};

export default CommunityFeaturesDemo;
