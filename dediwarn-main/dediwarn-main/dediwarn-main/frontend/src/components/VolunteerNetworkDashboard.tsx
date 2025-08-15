/**
 * Volunteer Network Dashboard
 * Real-time volunteer coordination and community management interface
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  MapPin,
  Clock,
  Star,
  Calendar,
  Search,
  Filter,
  CheckCircle,
  MessageSquare,
  Trophy,
  BookOpen,
  Heart,
  Target,
  TrendingUp
} from 'lucide-react';
import VolunteerNetworkService, { 
  Volunteer, 
  Mission, 
  TrainingProgram, 
  VolunteerMatch, 
  RecognitionAward 
} from '../services/VolunteerNetworkService';

interface VolunteerNetworkDashboardProps {
  currentUser?: {
    id: string;
    name: string;
    role: 'volunteer' | 'coordinator' | 'admin';
  };
  isVisible: boolean;
}

const VolunteerNetworkDashboard: React.FC<VolunteerNetworkDashboardProps> = ({
  currentUser,
  isVisible
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'volunteers' | 'missions' | 'training' | 'recognition'>('overview');
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [trainingPrograms, setTrainingPrograms] = useState<TrainingProgram[]>([]);
  const [volunteerMatches, setVolunteerMatches] = useState<VolunteerMatch[]>([]);
  const [selectedMission, setSelectedMission] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'available' | 'busy' | 'on-mission'>('all');

  const volunteerService = VolunteerNetworkService.getInstance();

  const loadData = useCallback(() => {
    setVolunteers(volunteerService.getAllVolunteers());
    setMissions(volunteerService.getAllMissions());
    setTrainingPrograms(volunteerService.getAllTrainingPrograms());
  }, [volunteerService]);

  const setupRealTimeUpdates = useCallback(() => {
    // Real-time event listeners
    volunteerService.addEventListener('volunteer-status-changed', (data: unknown) => {
      const eventData = data as { volunteerId: string; status: 'available' | 'busy' | 'on-mission' | 'offline' };
      setVolunteers(prev => prev.map(v => 
        v.id === eventData.volunteerId 
          ? { ...v, availability: { ...v.availability, status: eventData.status } }
          : v
      ));
    });

    volunteerService.addEventListener('mission-completed', () => {
      loadData();
    });

    volunteerService.addEventListener('volunteer-coordination', (data: unknown) => {
      const eventData = data as { matches: VolunteerMatch[] };
      setVolunteerMatches(eventData.matches);
    });
  }, [loadData, volunteerService]);

  useEffect(() => {
    if (isVisible) {
      loadData();
      setupRealTimeUpdates();
    }
  }, [isVisible, loadData, setupRealTimeUpdates]);

  const handleCoordinateVolunteers = async (missionId: string) => {
    const matches = await volunteerService.coordinateVolunteers(missionId);
    setVolunteerMatches(matches);
    setSelectedMission(missionId);
  };

  const filteredVolunteers = volunteers.filter(volunteer => {
    const matchesSearch = volunteer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         volunteer.skills.some(skill => skill.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter = filterStatus === 'all' || volunteer.availability.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'text-green-600 bg-green-100';
      case 'busy': return 'text-yellow-600 bg-yellow-100';
      case 'on-mission': return 'text-blue-600 bg-blue-100';
      case 'offline': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const OverviewTab = () => (
    <div className="space-y-6">
      {/* Real-time Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-green-800">Available Volunteers</h3>
              <p className="text-3xl font-bold text-green-600">
                {volunteers.filter(v => v.availability.status === 'available').length}
              </p>
            </div>
            <Users className="h-12 w-12 text-green-600" />
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-blue-800">Active Missions</h3>
              <p className="text-3xl font-bold text-blue-600">
                {missions.filter(m => m.status === 'in-progress').length}
              </p>
            </div>
            <Target className="h-12 w-12 text-blue-600" />
          </div>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-purple-800">Training Programs</h3>
              <p className="text-3xl font-bold text-purple-600">{trainingPrograms.length}</p>
            </div>
            <BookOpen className="h-12 w-12 text-purple-600" />
          </div>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-orange-800">Total Volunteers</h3>
              <p className="text-3xl font-bold text-orange-600">{volunteers.length}</p>
            </div>
            <Heart className="h-12 w-12 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Recent Activity Feed */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold mb-4 flex items-center">
          <TrendingUp className="mr-2" />
          Recent Activity
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
              <span>Dr. Sarah Mitchell completed emergency response mission</span>
            </div>
            <span className="text-sm text-gray-500">2 minutes ago</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center">
              <Users className="h-5 w-5 text-blue-600 mr-3" />
              <span>New volunteer Mark Johnson joined the network</span>
            </div>
            <span className="text-sm text-gray-500">15 minutes ago</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
            <div className="flex items-center">
              <BookOpen className="h-5 w-5 text-purple-600 mr-3" />
              <span>Basic First Aid training program started</span>
            </div>
            <span className="text-sm text-gray-500">1 hour ago</span>
          </div>
        </div>
      </div>
    </div>
  );

  const VolunteersTab = () => (
    <div className="space-y-6">
      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search volunteers by name or skill..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-gray-400" />
          <select
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as 'all' | 'available' | 'busy' | 'on-mission')}
            title="Filter volunteers by status"
          >
            <option value="all">All Status</option>
            <option value="available">Available</option>
            <option value="busy">Busy</option>
            <option value="on-mission">On Mission</option>
          </select>
        </div>
      </div>

      {/* Volunteers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVolunteers.map(volunteer => (
          <div key={volunteer.id} className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{volunteer.name}</h3>
                <p className="text-sm text-gray-600">{volunteer.experience.level} level</p>
              </div>
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(volunteer.availability.status)}`}>
                {volunteer.availability.status}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="h-4 w-4 mr-2" />
                {volunteer.location.address}
              </div>
              
              <div className="flex items-center text-sm text-gray-600">
                <Star className="h-4 w-4 mr-2 text-yellow-500" />
                {volunteer.rating.toFixed(1)} rating • {volunteer.experience.completedMissions} missions
              </div>

              <div className="flex items-center text-sm text-gray-600">
                <Clock className="h-4 w-4 mr-2" />
                {volunteer.experience.totalHours} total hours
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Skills:</p>
                <div className="flex flex-wrap gap-1">
                  {volunteer.skills.slice(0, 3).map(skill => (
                    <span key={skill.id} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-xs">
                      {skill.name}
                    </span>
                  ))}
                  {volunteer.skills.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-xs">
                      +{volunteer.skills.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  View Profile
                </button>
                <button className="text-green-600 hover:text-green-700 text-sm font-medium">
                  <MessageSquare className="h-4 w-4 inline mr-1" />
                  Contact
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const MissionsTab = () => (
    <div className="space-y-6">
      {/* Mission Coordination */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold mb-4">🎯 Mission Coordination</h3>
        <div className="flex gap-4 mb-4">
          <label htmlFor="mission-select" className="sr-only">Select a mission to coordinate volunteers</label>
          <label htmlFor="mission-select" className="sr-only">Select a mission to coordinate volunteers</label>
          <label htmlFor="mission-select" className="sr-only">Select a mission to coordinate volunteers</label>
          <select
            id="mission-select"
            title="Select a mission to coordinate volunteers"
            aria-label="Select a mission to coordinate volunteers"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
            value={selectedMission}
            onChange={(e) => setSelectedMission(e.target.value)}
          >
            <option value="">Select a mission to coordinate volunteers</option>
            {missions.filter(m => m.status === 'open').map(mission => (
              <option key={mission.id} value={mission.id}>
                {mission.title} - {mission.priority} priority
              </option>
            ))}
          </select>
          <button
            onClick={() => selectedMission && handleCoordinateVolunteers(selectedMission)}
            disabled={!selectedMission}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
          >
            Find Volunteers
          </button>
        </div>

        {/* Volunteer Matches */}
        {volunteerMatches.length > 0 && (
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Recommended Volunteers</h4>
            {volunteerMatches.slice(0, 5).map((match) => (
              <div key={match.volunteer.id} className={`p-4 rounded-lg border-l-4 ${
                match.recommended ? 'border-green-500 bg-green-50' : 'border-yellow-500 bg-yellow-50'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h5 className="font-semibold">{match.volunteer.name}</h5>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm text-gray-600 mt-2">
                      <div>Match: {match.matchScore.toFixed(0)}%</div>
                      <div>Skills: {match.matchFactors.skillMatch.toFixed(0)}%</div>
                      <div>Distance: {match.matchFactors.locationProximity.toFixed(0)}%</div>
                      <div>Available: {match.matchFactors.availability.toFixed(0)}%</div>
                      <div>Travel: {match.estimatedTravelTime}min</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {match.recommended && <Star className="h-5 w-5 text-green-600" />}
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                      Assign
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Missions List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {missions.map(mission => (
          <div key={mission.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{mission.title}</h3>
                <p className="text-sm text-gray-600">{mission.description}</p>
              </div>
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(mission.priority)}`}>
                {mission.priority}
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="h-4 w-4 mr-2" />
                {mission.location.address}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="h-4 w-4 mr-2" />
                {mission.startTime.toLocaleString()}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Users className="h-4 w-4 mr-2" />
                {mission.assignedVolunteers.length}/{mission.volunteersNeeded} volunteers
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                mission.status === 'open' ? 'text-green-600 bg-green-100' :
                mission.status === 'in-progress' ? 'text-blue-600 bg-blue-100' :
                'text-gray-600 bg-gray-100'
              }`}>
                {mission.status}
              </div>
              <button 
                onClick={() => handleCoordinateVolunteers(mission.id)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                Coordinate
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const TrainingTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {trainingPrograms.map(program => (
          <div key={program.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{program.title}</h3>
                <p className="text-sm text-gray-600">{program.description}</p>
              </div>
              <div className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                {program.level}
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="h-4 w-4 mr-2" />
                {program.duration} hours • {program.format}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Users className="h-4 w-4 mr-2" />
                {program.currentParticipants.length}/{program.maxParticipants} enrolled
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Star className="h-4 w-4 mr-2 text-yellow-500" />
                {program.rating.toFixed(1)} rating
              </div>
            </div>

            {program.schedule.sessions.length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Next Session:</p>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="font-medium">{program.schedule.sessions[0].title}</p>
                  <p className="text-sm text-gray-600">
                    {program.schedule.sessions[0].date.toLocaleDateString()} at {program.location?.address}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-green-600">
                {program.cost === 0 ? 'Free' : `$${program.cost}`}
              </span>
              <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm">
                Enroll Now
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const RecognitionTab = () => {
    const [selectedVolunteer, setSelectedVolunteer] = useState<string>('');
    const [volunteerAwards, setVolunteerAwards] = useState<RecognitionAward[]>([]);

    const handleViewRecognition = (volunteerId: string) => {
      const awards = volunteerService.getVolunteerRecognition(volunteerId);
      setVolunteerAwards(awards);
      setSelectedVolunteer(volunteerId);
    };

    return (
      <div className="space-y-6">
        {/* Volunteer Recognition Selection */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <Trophy className="mr-2 text-yellow-600" />
            Volunteer Recognition System
          </h3>
          
          <div className="flex gap-4 mb-6">
            <select
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
              value={selectedVolunteer}
              onChange={(e) => setSelectedVolunteer(e.target.value)}
              aria-label="Select a volunteer to view recognition"
            >
              <option value="">Select a volunteer to view recognition</option>
              {volunteers.map(volunteer => (
                <option key={volunteer.id} value={volunteer.id}>
                  {volunteer.name} - {volunteer.experience.completedMissions} missions
                </option>
              ))}
            </select>
            <button
              onClick={() => selectedVolunteer && handleViewRecognition(selectedVolunteer)}
              disabled={!selectedVolunteer}
              className="px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:bg-gray-400"
            >
              View Awards
            </button>
          </div>

          {/* Awards Display */}
          {volunteerAwards.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {volunteerAwards.map(award => (
                <div key={award.id} className={`p-4 rounded-lg border-2 ${
                  award.rarity === 'legendary' ? 'border-purple-300 bg-purple-50' :
                  award.rarity === 'rare' ? 'border-blue-300 bg-blue-50' :
                  award.rarity === 'uncommon' ? 'border-green-300 bg-green-50' :
                  'border-gray-300 bg-gray-50'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">{award.icon}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      award.rarity === 'legendary' ? 'text-purple-600 bg-purple-200' :
                      award.rarity === 'rare' ? 'text-blue-600 bg-blue-200' :
                      award.rarity === 'uncommon' ? 'text-green-600 bg-green-200' :
                      'text-gray-600 bg-gray-200'
                    }`}>
                      {award.rarity}
                    </span>
                  </div>
                  <h4 className="font-semibold text-gray-900">{award.name}</h4>
                  <p className="text-sm text-gray-600 mb-2">{award.description}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{award.points} points</span>
                    <span>{award.earnedDate.toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Leaderboard */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <TrendingUp className="mr-2" />
            Top Volunteers This Month
          </h3>
          <div className="space-y-3">
            {volunteers
              .sort((a, b) => b.experience.completedMissions - a.experience.completedMissions)
              .slice(0, 5)
              .map((volunteer, index) => (
                <div key={volunteer.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                      index === 0 ? 'bg-yellow-500' :
                      index === 1 ? 'bg-gray-400' :
                      index === 2 ? 'bg-amber-600' : 'bg-blue-500'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="ml-3">
                      <p className="font-semibold">{volunteer.name}</p>
                      <p className="text-sm text-gray-600">{volunteer.experience.completedMissions} missions completed</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-500 mr-1" />
                    <span className="font-medium">{volunteer.rating}</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    );
  };

  if (!isVisible) return null;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">🤝 Volunteer Network Dashboard</h1>
            <p className="text-blue-100">
              Real-time volunteer coordination and community management
            </p>
          </div>
          {currentUser && (
            <div className="text-right">
              <p className="text-blue-100">Welcome back,</p>
              <p className="text-xl font-semibold">{currentUser.name}</p>
              <p className="text-sm text-blue-200 capitalize">{currentUser.role}</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { key: 'overview', label: 'Overview', icon: TrendingUp },
              { key: 'volunteers', label: 'Volunteers', icon: Users },
              { key: 'missions', label: 'Missions', icon: Target },
              { key: 'training', label: 'Training', icon: BookOpen },
              { key: 'recognition', label: 'Recognition', icon: Trophy }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as 'overview' | 'volunteers' | 'missions' | 'training' | 'recognition')}
                className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === key
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

        <div className="p-6">
          {activeTab === 'overview' && <OverviewTab />}
          {activeTab === 'volunteers' && <VolunteersTab />}
          {activeTab === 'missions' && <MissionsTab />}
          {activeTab === 'training' && <TrainingTab />}
          {activeTab === 'recognition' && <RecognitionTab />}
        </div>
      </div>
    </div>
  );
};

export default VolunteerNetworkDashboard;
