import React, { useState, useEffect } from 'react';
import { 
  Users, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Calendar, 
  Filter,
  Search,
  UserPlus,
  CheckCircle,
  AlertTriangle,
  Star,
  Activity,
  MessageSquare,
  Shield,
  Heart,
  Truck,
  Radio,
  FileText,
  RefreshCw
} from 'lucide-react';

interface Volunteer {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  skills: string[];
  availability: 'available' | 'deployed' | 'unavailable' | 'off-duty';
  certifications: string[];
  experience: number; // years
  rating: number; // 1-5
  completedMissions: number;
  joinedDate: string;
  lastActive: string;
  preferredMissions: string[];
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  status: 'active' | 'inactive' | 'training' | 'suspended';
  currentMission?: {
    id: string;
    type: string;
    location: string;
    startTime: string;
    estimatedDuration: number;
  };
}

interface Mission {
  id: string;
  title: string;
  type: 'rescue' | 'medical' | 'logistics' | 'communication' | 'shelter' | 'survey';
  urgency: 'low' | 'medium' | 'high' | 'critical';
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  description: string;
  requiredSkills: string[];
  volunteersNeeded: number;
  volunteersAssigned: string[];
  estimatedDuration: number; // hours
  startTime: string;
  status: 'open' | 'in-progress' | 'completed' | 'cancelled';
  createdBy: string;
  createdAt: string;
  priority: number; // 1-10
}

interface VolunteerApplication {
  id: string;
  volunteerId: string;
  missionId: string;
  volunteerName: string;
  missionTitle: string;
  appliedAt: string;
  status: 'pending' | 'approved' | 'rejected' | 'withdrawn';
  message: string;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;
}

const VolunteerModule: React.FC = () => {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [applications, setApplications] = useState<VolunteerApplication[]>([]);
  const [activeTab, setActiveTab] = useState<'volunteers' | 'missions' | 'applications'>('volunteers');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSkill, setFilterSkill] = useState('all');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadVolunteers();
    loadMissions();
    loadApplications();

    // Auto-refresh every 45 seconds
    const interval = setInterval(() => {
      loadVolunteers();
      loadMissions();
      loadApplications();
    }, 45000);

    return () => clearInterval(interval);
  }, []);

  const loadVolunteers = () => {
    setIsLoading(true);
    
    // Mock volunteer data with pre-filled details
    setTimeout(() => {
      setVolunteers([
        {
          id: 'vol-001',
          name: 'Priya Sharma',
          email: 'priya.sharma@volunteer.org',
          phone: '+91 6200943853',
          location: {
            lat: 19.0760,
            lng: 72.8777,
            address: 'Bandra West, Mumbai, Maharashtra'
          },
          skills: ['First Aid', 'Search & Rescue', 'Communication', 'Leadership'],
          availability: 'available',
          certifications: ['CPR Certified', 'Emergency Response Level 2', 'Team Leader'],
          experience: 3,
          rating: 4.8,
          completedMissions: 47,
          joinedDate: '2021-03-15',
          lastActive: new Date().toISOString(),
          preferredMissions: ['rescue', 'medical'],
          emergencyContact: {
            name: 'Rajesh Sharma',
            phone: '+91 9876543210',
            relationship: 'Father'
          },
          status: 'active',
          currentMission: {
            id: 'mis-003',
            type: 'rescue',
            location: 'Disaster Zone Alpha',
            startTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            estimatedDuration: 6
          }
        },
        {
          id: 'vol-002',
          name: 'Amit Singh',
          email: 'amit.singh@volunteer.org',
          phone: '+91 7477396342',
          location: {
            lat: 28.7041,
            lng: 77.1025,
            address: 'Connaught Place, New Delhi'
          },
          skills: ['Medical Aid', 'Logistics', 'Vehicle Operation', 'Documentation'],
          availability: 'available',
          certifications: ['Basic Life Support', 'Heavy Vehicle License', 'Medical Assistant'],
          experience: 5,
          rating: 4.9,
          completedMissions: 73,
          joinedDate: '2019-08-22',
          lastActive: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          preferredMissions: ['medical', 'logistics'],
          emergencyContact: {
            name: 'Sunita Singh',
            phone: '+91 8765432109',
            relationship: 'Wife'
          },
          status: 'active'
        },
        {
          id: 'vol-003',
          name: 'Dr. Rajesh Kumar',
          email: 'dr.rajesh@medvolunteer.org',
          phone: '+91 6001163688',
          location: {
            lat: 22.5726,
            lng: 88.3639,
            address: 'Salt Lake, Kolkata, West Bengal'
          },
          skills: ['Emergency Medicine', 'Surgery', 'Trauma Care', 'Medical Coordination'],
          availability: 'deployed',
          certifications: ['MBBS', 'Emergency Medicine Specialist', 'Disaster Medicine'],
          experience: 12,
          rating: 5.0,
          completedMissions: 156,
          joinedDate: '2018-01-10',
          lastActive: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          preferredMissions: ['medical'],
          emergencyContact: {
            name: 'Dr. Meera Kumar',
            phone: '+91 7654321098',
            relationship: 'Wife'
          },
          status: 'active',
          currentMission: {
            id: 'mis-001',
            type: 'medical',
            location: 'Emergency Medical Camp, Kolkata',
            startTime: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
            estimatedDuration: 8
          }
        },
        {
          id: 'vol-004',
          name: 'Sarah Johnson',
          email: 'sarah.j@commvolunteer.org',
          phone: '+91 9988776655',
          location: {
            lat: 12.9716,
            lng: 77.5946,
            address: 'Whitefield, Bangalore, Karnataka'
          },
          skills: ['Radio Communication', 'Technology Support', 'Coordination', 'Translation'],
          availability: 'off-duty',
          certifications: ['Ham Radio License', 'Emergency Communication', 'IT Support'],
          experience: 2,
          rating: 4.6,
          completedMissions: 32,
          joinedDate: '2022-06-18',
          lastActive: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          preferredMissions: ['communication', 'logistics'],
          emergencyContact: {
            name: 'Michael Johnson',
            phone: '+91 8877665544',
            relationship: 'Husband'
          },
          status: 'active'
        }
      ]);
      setIsLoading(false);
    }, 1000);
  };

  const loadMissions = () => {
    // Mock mission data
    setMissions([
      {
        id: 'mis-001',
        title: 'Emergency Medical Response - Flood Zone',
        type: 'medical',
        urgency: 'critical',
        location: {
          lat: 22.5726,
          lng: 88.3639,
          address: 'Flood Affected Area, Howrah, West Bengal'
        },
        description: 'Immediate medical assistance required for flood victims. Setting up emergency medical camp and providing first aid.',
        requiredSkills: ['Emergency Medicine', 'First Aid', 'Triage', 'Medical Equipment'],
        volunteersNeeded: 8,
        volunteersAssigned: ['vol-003'],
        estimatedDuration: 12,
        startTime: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        status: 'in-progress',
        createdBy: 'Emergency Coordinator',
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        priority: 9
      },
      {
        id: 'mis-002',
        title: 'Search and Rescue Operation - Building Collapse',
        type: 'rescue',
        urgency: 'critical',
        location: {
          lat: 19.0760,
          lng: 72.8777,
          address: 'Collapsed Building Site, Bandra, Mumbai'
        },
        description: 'Multi-story building collapse requires immediate search and rescue operations. Heavy machinery and specialized equipment needed.',
        requiredSkills: ['Search & Rescue', 'Heavy Equipment', 'Safety Protocols', 'First Aid'],
        volunteersNeeded: 15,
        volunteersAssigned: ['vol-001'],
        estimatedDuration: 18,
        startTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        status: 'in-progress',
        createdBy: 'Rescue Team Leader',
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        priority: 10
      },
      {
        id: 'mis-003',
        title: 'Emergency Shelter Setup - Cyclone Relief',
        type: 'shelter',
        urgency: 'high',
        location: {
          lat: 20.2961,
          lng: 85.8245,
          address: 'Cyclone Affected Village, Puri, Odisha'
        },
        description: 'Setting up temporary shelters and distributing relief materials to cyclone-affected families.',
        requiredSkills: ['Logistics', 'Construction', 'Community Coordination', 'Supply Management'],
        volunteersNeeded: 12,
        volunteersAssigned: [],
        estimatedDuration: 24,
        startTime: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
        status: 'open',
        createdBy: 'Relief Operations Head',
        createdAt: new Date().toISOString(),
        priority: 8
      },
      {
        id: 'mis-004',
        title: 'Communication Network Restoration',
        type: 'communication',
        urgency: 'medium',
        location: {
          lat: 28.7041,
          lng: 77.1025,
          address: 'Network Tower Site, Gurgaon, Haryana'
        },
        description: 'Restore emergency communication networks and establish backup communication systems.',
        requiredSkills: ['Radio Communication', 'Technical Support', 'Network Setup', 'Equipment Maintenance'],
        volunteersNeeded: 6,
        volunteersAssigned: [],
        estimatedDuration: 8,
        startTime: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
        status: 'open',
        createdBy: 'Communication Chief',
        createdAt: new Date().toISOString(),
        priority: 6
      }
    ]);
  };

  const loadApplications = () => {
    // Mock application data
    setApplications([
      {
        id: 'app-001',
        volunteerId: 'vol-002',
        missionId: 'mis-003',
        volunteerName: 'Amit Singh',
        missionTitle: 'Emergency Shelter Setup - Cyclone Relief',
        appliedAt: new Date().toISOString(),
        status: 'pending',
        message: 'I have experience in logistics coordination and have worked on similar cyclone relief operations. Available for full duration.'
      },
      {
        id: 'app-002',
        volunteerId: 'vol-004',
        missionId: 'mis-004',
        volunteerName: 'Sarah Johnson',
        missionTitle: 'Communication Network Restoration',
        appliedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        status: 'approved',
        message: 'Ham radio operator with technical background. Can assist with network setup and maintenance.',
        reviewedBy: 'Communication Chief',
        reviewedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        reviewNotes: 'Perfect match for communication role. Approved immediately.'
      }
    ]);
  };

  const getSkillIcon = (skill: string) => {
    const skillLower = skill.toLowerCase();
    if (skillLower.includes('medical') || skillLower.includes('first aid')) return <Heart className="w-4 h-4" />;
    if (skillLower.includes('rescue') || skillLower.includes('search')) return <Shield className="w-4 h-4" />;
    if (skillLower.includes('communication') || skillLower.includes('radio')) return <Radio className="w-4 h-4" />;
    if (skillLower.includes('logistics') || skillLower.includes('supply')) return <Truck className="w-4 h-4" />;
    if (skillLower.includes('leadership') || skillLower.includes('coordination')) return <Users className="w-4 h-4" />;
    return <Star className="w-4 h-4" />;
  };

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'available': return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'deployed': return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
      case 'unavailable': return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'off-duty': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'low': return 'text-green-400 bg-green-500/20';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20';
      case 'high': return 'text-orange-400 bg-orange-500/20';
      case 'critical': return 'text-red-400 bg-red-500/20 animate-pulse';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const handleCall = (phoneNumber: string) => {
    window.open(`tel:${phoneNumber}`, '_self');
  };

  const handleEmail = (email: string) => {
    window.open(`mailto:${email}`, '_blank');
  };

  const handleWhatsApp = (phoneNumber: string) => {
    const cleanNumber = phoneNumber.replace(/\D/g, '');
    window.open(`https://wa.me/${cleanNumber}`, '_blank');
  };

  const handleNavigate = (lat: number, lng: number) => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
  };

  const assignVolunteerToMission = (volunteerId: string, missionId: string) => {
    setMissions(prev => prev.map(mission => 
      mission.id === missionId 
        ? { ...mission, volunteersAssigned: [...mission.volunteersAssigned, volunteerId] }
        : mission
    ));
    
    setVolunteers(prev => prev.map(volunteer => 
      volunteer.id === volunteerId 
        ? { 
            ...volunteer, 
            availability: 'deployed',
            currentMission: missions.find(m => m.id === missionId) ? {
              id: missionId,
              type: missions.find(m => m.id === missionId)!.type,
              location: missions.find(m => m.id === missionId)!.location.address,
              startTime: new Date().toISOString(),
              estimatedDuration: missions.find(m => m.id === missionId)!.estimatedDuration
            } : undefined
          }
        : volunteer
    ));
    
    alert('Volunteer assigned to mission successfully!');
  };

  const approveApplication = (applicationId: string) => {
    const application = applications.find(app => app.id === applicationId);
    if (application) {
      assignVolunteerToMission(application.volunteerId, application.missionId);
      setApplications(prev => prev.map(app => 
        app.id === applicationId 
          ? { 
              ...app, 
              status: 'approved', 
              reviewedBy: 'System Administrator',
              reviewedAt: new Date().toISOString(),
              reviewNotes: 'Application approved and volunteer assigned'
            }
          : app
      ));
    }
  };

  const rejectApplication = (applicationId: string, reason: string) => {
    setApplications(prev => prev.map(app => 
      app.id === applicationId 
        ? { 
            ...app, 
            status: 'rejected', 
            reviewedBy: 'System Administrator',
            reviewedAt: new Date().toISOString(),
            reviewNotes: reason
          }
        : app
    ));
    alert('Application rejected');
  };

  const filteredVolunteers = volunteers.filter(volunteer => {
    const matchesSearch = volunteer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         volunteer.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         volunteer.location.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || volunteer.availability === filterStatus;
    const matchesSkill = filterSkill === 'all' || volunteer.skills.some(skill => skill.toLowerCase().includes(filterSkill.toLowerCase()));
    return matchesSearch && matchesStatus && matchesSkill;
  });

  return (
    <div className="max-w-7xl mx-auto p-6 bg-slate-900 text-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Volunteer Management System</h1>
          <p className="text-slate-400">Coordinate and manage emergency response volunteers</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={loadVolunteers}
            disabled={isLoading}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 rounded-lg transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors">
            <UserPlus className="w-4 h-4" />
            <span>Add Volunteer</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 mb-6 border-b border-slate-700">
        <button
          onClick={() => setActiveTab('volunteers')}
          className={`pb-3 px-1 border-b-2 font-medium transition-colors ${
            activeTab === 'volunteers'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-300'
          }`}
        >
          Volunteers ({volunteers.length})
        </button>
        <button
          onClick={() => setActiveTab('missions')}
          className={`pb-3 px-1 border-b-2 font-medium transition-colors ${
            activeTab === 'missions'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-300'
          }`}
        >
          Active Missions ({missions.filter(m => m.status !== 'completed').length})
        </button>
        <button
          onClick={() => setActiveTab('applications')}
          className={`pb-3 px-1 border-b-2 font-medium transition-colors ${
            activeTab === 'applications'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-300'
          }`}
        >
          Applications ({applications.filter(app => app.status === 'pending').length} pending)
        </button>
      </div>

      {activeTab === 'volunteers' && (
        <>
          {/* Filters */}
          <div className="bg-slate-800/60 backdrop-blur-sm rounded-xl p-6 border border-slate-700 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search volunteers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                />
              </div>
              
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                aria-label="Filter by availability status"
                className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              >
                <option value="all">All Status</option>
                <option value="available">Available</option>
                <option value="deployed">Deployed</option>
                <option value="unavailable">Unavailable</option>
                <option value="off-duty">Off Duty</option>
              </select>
              
              <select
                value={filterSkill}
                onChange={(e) => setFilterSkill(e.target.value)}
                aria-label="Filter by skill type"
                className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              >
                <option value="all">All Skills</option>
                <option value="medical">Medical</option>
                <option value="rescue">Search & Rescue</option>
                <option value="communication">Communication</option>
                <option value="logistics">Logistics</option>
                <option value="leadership">Leadership</option>
              </select>
              
              <div className="flex items-center space-x-2 text-slate-300">
                <Filter className="w-4 h-4" />
                <span className="text-sm">
                  Showing {filteredVolunteers.length} of {volunteers.length} volunteers
                </span>
              </div>
            </div>
          </div>

          {/* Volunteers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVolunteers.map((volunteer) => (
              <div key={volunteer.id} className="bg-slate-800/60 backdrop-blur-sm rounded-xl p-6 border border-slate-700 hover:border-slate-600 transition-all duration-300 hover:transform hover:-translate-y-1">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {volunteer.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{volunteer.name}</h3>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getAvailabilityColor(volunteer.availability)}`}>
                          {volunteer.availability}
                        </span>
                        <div className="flex items-center space-x-1">
                          <Star className="w-3 h-3 text-yellow-400" />
                          <span className="text-sm text-slate-300">{volunteer.rating}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-white">{volunteer.completedMissions}</p>
                    <p className="text-xs text-slate-400">Missions</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-white">{volunteer.experience}</p>
                    <p className="text-xs text-slate-400">Years Exp.</p>
                  </div>
                </div>

                {/* Skills */}
                <div className="mb-4">
                  <p className="text-sm text-slate-400 mb-2">Skills</p>
                  <div className="flex flex-wrap gap-1">
                    {volunteer.skills.slice(0, 3).map((skill, index) => (
                      <span key={index} className="flex items-center space-x-1 px-2 py-1 bg-slate-700 text-xs rounded text-slate-300">
                        {getSkillIcon(skill)}
                        <span>{skill}</span>
                      </span>
                    ))}
                    {volunteer.skills.length > 3 && (
                      <span className="px-2 py-1 bg-slate-700 text-xs rounded text-slate-400">
                        +{volunteer.skills.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Current Mission */}
                {volunteer.currentMission && (
                  <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    <div className="flex items-center space-x-2 mb-1">
                      <Activity className="w-4 h-4 text-blue-400" />
                      <span className="text-sm font-medium text-blue-400">Current Mission</span>
                    </div>
                    <p className="text-sm text-slate-300">{volunteer.currentMission.type} - {volunteer.currentMission.location}</p>
                    <p className="text-xs text-slate-400">
                      Started: {new Date(volunteer.currentMission.startTime).toLocaleString()}
                    </p>
                  </div>
                )}

                {/* Location */}
                <div className="flex items-start space-x-2 mb-4">
                  <MapPin className="w-4 h-4 text-slate-400 mt-1 flex-shrink-0" />
                  <p className="text-sm text-slate-300">{volunteer.location.address}</p>
                </div>

                {/* Contact Actions */}
                <div className="space-y-2">
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => handleCall(volunteer.phone)}
                      className="flex items-center justify-center space-x-1 px-2 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white text-sm transition-colors"
                    >
                      <Phone className="w-3 h-3" />
                      <span>Call</span>
                    </button>
                    <button
                      onClick={() => handleEmail(volunteer.email)}
                      className="flex items-center justify-center space-x-1 px-2 py-2 bg-green-600 hover:bg-green-700 rounded text-white text-sm transition-colors"
                    >
                      <Mail className="w-3 h-3" />
                      <span>Email</span>
                    </button>
                    <button
                      onClick={() => handleWhatsApp(volunteer.phone)}
                      className="flex items-center justify-center space-x-1 px-2 py-2 bg-emerald-600 hover:bg-emerald-700 rounded text-white text-sm transition-colors"
                    >
                      <MessageSquare className="w-3 h-3" />
                      <span>Chat</span>
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleNavigate(volunteer.location.lat, volunteer.location.lng)}
                      className="flex items-center justify-center space-x-1 px-3 py-2 bg-purple-600 hover:bg-purple-700 rounded text-white text-sm transition-colors"
                    >
                      <MapPin className="w-3 h-3" />
                      <span>Navigate</span>
                    </button>
                    <button
                      onClick={() => alert(`Showing details for ${volunteer.name}`)}
                      className="flex items-center justify-center space-x-1 px-3 py-2 bg-orange-600 hover:bg-orange-700 rounded text-white text-sm transition-colors"
                    >
                      <FileText className="w-3 h-3" />
                      <span>Details</span>
                    </button>
                  </div>
                </div>

                {/* Last Active */}
                <p className="text-xs text-slate-500 mt-3">
                  Last active: {new Date(volunteer.lastActive).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </>
      )}

      {activeTab === 'missions' && (
        <div className="space-y-6">
          {missions.filter(mission => mission.status !== 'completed').map((mission) => (
            <div key={mission.id} className="bg-slate-800/60 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-xl font-semibold text-white">{mission.title}</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getUrgencyColor(mission.urgency)}`}>
                      {mission.urgency.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-slate-300 mb-3">{mission.description}</p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-blue-400">Priority {mission.priority}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-medium text-white mb-2">Mission Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-300">{mission.location.address}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-300">Duration: {mission.estimatedDuration} hours</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-300">Start: {new Date(mission.startTime).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-white mb-2">Required Skills</h4>
                  <div className="flex flex-wrap gap-1">
                    {mission.requiredSkills.map((skill, index) => (
                      <span key={index} className="px-2 py-1 bg-slate-700 text-xs rounded text-slate-300">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-white mb-2">
                    Volunteers ({mission.volunteersAssigned.length}/{mission.volunteersNeeded})
                  </h4>
                  <div className="space-y-1">
                    {mission.volunteersAssigned.map((volunteerId) => {
                      const volunteer = volunteers.find(v => v.id === volunteerId);
                      return volunteer ? (
                        <div key={volunteerId} className="flex items-center space-x-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          <span className="text-slate-300">{volunteer.name}</span>
                        </div>
                      ) : null;
                    })}
                    {mission.volunteersNeeded > mission.volunteersAssigned.length && (
                      <p className="text-sm text-orange-400">
                        {mission.volunteersNeeded - mission.volunteersAssigned.length} more needed
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => handleNavigate(mission.location.lat, mission.location.lng)}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white transition-colors"
                >
                  <MapPin className="w-4 h-4" />
                  <span>Navigate</span>
                </button>
                <button
                  onClick={() => alert(`Assigning volunteers to ${mission.title}`)}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded text-white transition-colors"
                >
                  <Users className="w-4 h-4" />
                  <span>Assign Volunteers</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'applications' && (
        <div className="space-y-4">
          {applications.map((application) => (
            <div key={application.id} className="bg-slate-800/60 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="font-semibold text-white">{application.volunteerName}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                      application.status === 'pending' ? 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30' :
                      application.status === 'approved' ? 'text-green-400 bg-green-500/20 border-green-500/30' :
                      'text-red-400 bg-red-500/20 border-red-500/30'
                    }`}>
                      {application.status}
                    </span>
                  </div>
                  <p className="text-slate-400 mb-2">Applied for: <span className="text-white">{application.missionTitle}</span></p>
                  <p className="text-slate-300 mb-3">"{application.message}"</p>
                  <p className="text-xs text-slate-500">
                    Applied: {new Date(application.appliedAt).toLocaleString()}
                  </p>
                  {application.reviewedAt && (
                    <div className="mt-2 p-2 bg-slate-700/50 rounded">
                      <p className="text-xs text-slate-400">
                        Reviewed by {application.reviewedBy} on {new Date(application.reviewedAt).toLocaleString()}
                      </p>
                      {application.reviewNotes && (
                        <p className="text-sm text-slate-300 mt-1">"{application.reviewNotes}"</p>
                      )}
                    </div>
                  )}
                </div>
                
                {application.status === 'pending' && (
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => approveApplication(application.id)}
                      className="flex items-center space-x-1 px-3 py-2 bg-green-600 hover:bg-green-700 rounded text-white text-sm transition-colors"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={() => rejectApplication(application.id, 'Requirements not met')}
                      className="flex items-center space-x-1 px-3 py-2 bg-red-600 hover:bg-red-700 rounded text-white text-sm transition-colors"
                    >
                      <AlertTriangle className="w-4 h-4" />
                      <span>Reject</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VolunteerModule;
