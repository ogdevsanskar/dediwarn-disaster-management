import React, { useState } from 'react';
// Removed unused lucide-react imports

interface Volunteer {
  id: string;
  name: string;
  skills: string[];
  location: string;
  availability: 'available' | 'busy' | 'offline';
}

interface Mission {
  id: string;
  title: string;
  description: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  volunteersNeeded: number;
  location: string;
}

export const Volunteers: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'missions' | 'volunteers' | 'register'>('missions');
  const [joinedMissions, setJoinedMissions] = useState<string[]>([]);
  // Removed unused selectedMission state

  const volunteers: Volunteer[] = [
    {
      id: '1',
      name: 'John Smith',
      skills: ['First Aid', 'Search & Rescue'],
      location: 'Downtown District',
      availability: 'available'
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      skills: ['Medical Support', 'Communications'],
      location: 'North Zone',
      availability: 'busy'
    }
  ];

  const missions: Mission[] = [
    {
      id: '1',
      title: 'Emergency Medical Support',
      description: 'Medical assistance needed at evacuation center',
      urgency: 'high',
      volunteersNeeded: 5,
      location: 'City Center'
    },
    {
      id: '2',
      title: 'Supply Distribution',
      description: 'Help distribute emergency supplies to affected families',
      urgency: 'medium',
      volunteersNeeded: 10,
      location: 'Community Center'
    }
  ];

  const handleJoinMission = (missionId: string) => {
    if (!joinedMissions.includes(missionId)) {
      setJoinedMissions([...joinedMissions, missionId]);
    }
    // Removed setSelectedMission(null) since selectedMission is unused
  };

  return (
    <div className="min-h-screen pt-8 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Emergency Volunteers</h1>
          <p className="text-lg text-gray-600">Join our community response team</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            {(['missions', 'volunteers', 'register'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 rounded-md font-medium capitalize transition-colors ${
                  activeTab === tab
                    ? 'bg-white text-blue-600 shadow'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Missions Tab */}
        {activeTab === 'missions' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-4">Active Missions</h2>
            {missions.map((mission) => (
              <div
                key={mission.id}
                className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{mission.title}</h3>
                    <p className="text-gray-600 mb-2">{mission.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>📍 {mission.location}</span>
                      <span>👥 {mission.volunteersNeeded} volunteers needed</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        mission.urgency === 'critical' ? 'bg-red-100 text-red-800' :
                        mission.urgency === 'high' ? 'bg-orange-100 text-orange-800' :
                        mission.urgency === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {mission.urgency} priority
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <button
                    onClick={() => handleJoinMission(mission.id)}
                    disabled={joinedMissions.includes(mission.id)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      joinedMissions.includes(mission.id)
                        ? 'bg-green-600 text-white cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {joinedMissions.includes(mission.id) ? 'Joined ✓' : 'Join Mission'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Volunteers Tab */}
        {activeTab === 'volunteers' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-4">Active Volunteers</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {volunteers.map((volunteer) => (
                <div key={volunteer.id} className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">{volunteer.name}</h3>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      volunteer.availability === 'available' ? 'bg-green-100 text-green-800' :
                      volunteer.availability === 'busy' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {volunteer.availability}
                    </span>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">📍 {volunteer.location}</p>
                    <div className="flex flex-wrap gap-1">
                      {volunteer.skills.map((skill, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Contact Volunteer
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Register Tab */}
        {activeTab === 'register' && (
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-center">Register as Volunteer</h2>
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input 
                    type="text" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your full name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Skills & Certifications
                  </label>
                  <textarea 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    placeholder="List your relevant skills (First Aid, CPR, etc.)"
                  />
                </div>
                
                <button 
                  type="submit"
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Register as Volunteer
                </button>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}; // ✅ Proper closing brace for the component