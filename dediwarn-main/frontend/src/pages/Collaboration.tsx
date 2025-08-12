import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, 
  Globe, 
  Target, 
  TrendingUp, 
  MapPin, 
  Heart, 
  Building,
  Leaf,
  Shield,
  BookOpen,
  MessageSquare,
  Share2,
  Filter,
  Search,
  Plus
} from 'lucide-react';

// Progress bar component - using CSS custom properties for dynamic width
const ProgressBar: React.FC<{ percentage: number }> = ({ percentage }) => {
  const width = Math.min(percentage, 100);
  const progressRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (progressRef.current) {
      progressRef.current.style.transform = `scaleX(${width / 100})`;
    }
  }, [width]);
  
  return (
    <div className="w-full bg-slate-700 rounded-full h-2">
      <div 
        ref={progressRef}
        className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-500 origin-left"
      />
    </div>
  );
};

interface Project {
  id: string;
  title: string;
  description: string;
  category: 'disaster-prep' | 'marine-ecosystem' | 'biodiversity' | 'climate-adaptation' | 'education';
  stakeholders: string[];
  funding: {
    target: number;
    raised: number;
    currency: string;
  };
  location: {
    name: string;
    coordinates: [number, number];
  };
  sdgAlignment: number[];
  status: 'planning' | 'active' | 'completed' | 'seeking-funding';
  timeline: {
    start: Date;
    end: Date;
  };
  impact: {
    peopleReached: number;
    co2Reduced: number;
    ecosystemProtected: number;
  };
}

interface Stakeholder {
  id: string;
  name: string;
  type: 'government' | 'ngo' | 'research' | 'community' | 'citizen';
  logo?: string;
  expertise: string[];
  location: string;
  projects: number;
}

const Collaboration: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'projects' | 'stakeholders' | 'create' | 'funding'>('projects');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [projects, setProjects] = useState<Project[]>([]);
  const [stakeholders, setStakeholders] = useState<Stakeholder[]>([]);

  useEffect(() => {
    // Load initial data
    loadProjects();
    loadStakeholders();
  }, []);

  const loadProjects = () => {
    // Mock data - would be loaded from API
    setProjects([
      {
        id: '1',
        title: 'Coastal Resilience Network',
        description: 'Building early warning systems and mangrove restoration to protect coastal communities from rising sea levels.',
        category: 'marine-ecosystem',
        stakeholders: ['UN Environment', 'Local Fishermen Association', 'Marine Research Institute'],
        funding: { target: 500000, raised: 275000, currency: 'USD' },
        location: { name: 'Bangladesh Coast', coordinates: [22.3569, 91.7832] },
        sdgAlignment: [13, 14, 15],
        status: 'active',
        timeline: { start: new Date('2024-01-15'), end: new Date('2025-12-31') },
        impact: { peopleReached: 50000, co2Reduced: 1200, ecosystemProtected: 2500 }
      },
      {
        id: '2',
        title: 'Urban Forest Guardian Network',
        description: 'Citizen-led monitoring and protection of urban biodiversity through AI-powered species tracking.',
        category: 'biodiversity',
        stakeholders: ['City Council', 'Wildlife Conservation Society', 'Local Schools'],
        funding: { target: 150000, raised: 89000, currency: 'USD' },
        location: { name: 'São Paulo, Brazil', coordinates: [-23.5505, -46.6333] },
        sdgAlignment: [15, 11, 4],
        status: 'seeking-funding',
        timeline: { start: new Date('2024-03-01'), end: new Date('2024-11-30') },
        impact: { peopleReached: 25000, co2Reduced: 800, ecosystemProtected: 1200 }
      }
    ]);
  };

  const loadStakeholders = () => {
    // Mock data - would be loaded from API
    setStakeholders([
      {
        id: '1',
        name: 'UN Environment Programme',
        type: 'government',
        expertise: ['Climate Action', 'Marine Conservation', 'Policy Development'],
        location: 'Nairobi, Kenya',
        projects: 24
      },
      {
        id: '2',
        name: 'Global Forest Watch',
        type: 'research',
        expertise: ['Satellite Monitoring', 'Deforestation Tracking', 'Data Analytics'],
        location: 'Washington, DC',
        projects: 18
      },
      {
        id: '3',
        name: 'Coastal Communities Alliance',
        type: 'community',
        expertise: ['Traditional Knowledge', 'Community Mobilization', 'Local Adaptation'],
        location: 'Multiple Coastal Regions',
        projects: 32
      }
    ]);
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || project.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'disaster-prep': return <Shield className="h-4 w-4" />;
      case 'marine-ecosystem': return <Globe className="h-4 w-4" />;
      case 'biodiversity': return <Leaf className="h-4 w-4" />;
      case 'climate-adaptation': return <TrendingUp className="h-4 w-4" />;
      case 'education': return <BookOpen className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  const getStakeholderIcon = (type: string) => {
    switch (type) {
      case 'government': return <Building className="h-4 w-4" />;
      case 'ngo': return <Heart className="h-4 w-4" />;
      case 'research': return <BookOpen className="h-4 w-4" />;
      case 'community': return <Users className="h-4 w-4" />;
      case 'citizen': return <Users className="h-4 w-4" />;
      default: return <Users className="h-4 w-4" />;
    }
  };

  const renderProjectCard = (project: Project) => (
    <div key={project.id} className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6 hover:border-blue-500/50 transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          {getCategoryIcon(project.category)}
          <div>
            <h3 className="text-lg font-semibold text-white">{project.title}</h3>
            <div className="flex items-center text-sm text-gray-400 mt-1">
              <MapPin className="h-3 w-3 mr-1" />
              {project.location.name}
            </div>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
          project.status === 'active' ? 'bg-green-500/20 text-green-400' :
          project.status === 'seeking-funding' ? 'bg-orange-500/20 text-orange-400' :
          project.status === 'completed' ? 'bg-blue-500/20 text-blue-400' :
          'bg-gray-500/20 text-gray-400'
        }`}>
          {project.status.replace('-', ' ').toUpperCase()}
        </div>
      </div>

      <p className="text-gray-300 text-sm mb-4 line-clamp-2">{project.description}</p>

      {/* Funding Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-1">
          <span className="text-gray-400">Funding Progress</span>
          <span className="text-white">{Math.round((project.funding.raised / project.funding.target) * 100)}%</span>
        </div>
        <ProgressBar percentage={(project.funding.raised / project.funding.target) * 100} />
        <div className="flex items-center justify-between text-xs text-gray-400 mt-1">
          <span>${project.funding.raised.toLocaleString()} raised</span>
          <span>Goal: ${project.funding.target.toLocaleString()}</span>
        </div>
      </div>

      {/* SDG Alignment */}
      <div className="mb-4">
        <div className="text-xs text-gray-400 mb-2">SDG Alignment</div>
        <div className="flex space-x-1">
          {project.sdgAlignment.map(sdg => (
            <div key={sdg} className="w-6 h-6 bg-blue-600 rounded text-xs text-white flex items-center justify-center font-bold">
              {sdg}
            </div>
          ))}
        </div>
      </div>

      {/* Impact Metrics */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="text-center">
          <div className="text-lg font-bold text-blue-400">{project.impact.peopleReached.toLocaleString()}</div>
          <div className="text-xs text-gray-400">People Reached</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-green-400">{project.impact.co2Reduced}t</div>
          <div className="text-xs text-gray-400">CO2 Reduced</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-purple-400">{project.impact.ecosystemProtected}</div>
          <div className="text-xs text-gray-400">Hectares Protected</div>
        </div>
      </div>

      {/* Stakeholders */}
      <div className="mb-4">
        <div className="text-xs text-gray-400 mb-2">Key Stakeholders</div>
        <div className="flex flex-wrap gap-1">
          {project.stakeholders.slice(0, 3).map((stakeholder, index) => (
            <span key={index} className="px-2 py-1 bg-slate-700 rounded text-xs text-gray-300">
              {stakeholder}
            </span>
          ))}
          {project.stakeholders.length > 3 && (
            <span className="px-2 py-1 bg-slate-700 rounded text-xs text-gray-300">
              +{project.stakeholders.length - 3} more
            </span>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-2">
        <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors">
          View Details
        </button>
        <button className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm transition-colors">
          <Heart className="h-4 w-4" />
        </button>
        <button className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm transition-colors">
          <Share2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );

  const renderStakeholderCard = (stakeholder: Stakeholder) => (
    <div key={stakeholder.id} className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6 hover:border-blue-500/50 transition-all duration-300">
      <div className="flex items-start space-x-4">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
          {getStakeholderIcon(stakeholder.type)}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white">{stakeholder.name}</h3>
          <p className="text-sm text-gray-400 capitalize">{stakeholder.type}</p>
          <div className="flex items-center text-sm text-gray-400 mt-1">
            <MapPin className="h-3 w-3 mr-1" />
            {stakeholder.location}
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-blue-400">{stakeholder.projects}</div>
          <div className="text-xs text-gray-400">Projects</div>
        </div>
      </div>

      <div className="mt-4">
        <div className="text-xs text-gray-400 mb-2">Expertise</div>
        <div className="flex flex-wrap gap-1">
          {stakeholder.expertise.map((skill, index) => (
            <span key={index} className="px-2 py-1 bg-blue-600/20 text-blue-400 rounded text-xs">
              {skill}
            </span>
          ))}
        </div>
      </div>

      <div className="flex space-x-2 mt-4">
        <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors">
          Connect
        </button>
        <button className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm transition-colors">
          <MessageSquare className="h-4 w-4" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  Global Collaboration Hub
                </h1>
                <p className="text-gray-400">
                  Unite governments, NGOs, researchers, and communities for environmental resilience
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors">
                  <Plus className="h-5 w-5" />
                  <span>New Project</span>
                </button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-slate-700/50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-blue-400">127</div>
                    <div className="text-sm text-gray-400">Active Projects</div>
                  </div>
                  <Target className="h-8 w-8 text-blue-400" />
                </div>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-green-400">1,247</div>
                    <div className="text-sm text-gray-400">Stakeholders</div>
                  </div>
                  <Users className="h-8 w-8 text-green-400" />
                </div>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-purple-400">$12.4M</div>
                    <div className="text-sm text-gray-400">Funds Raised</div>
                  </div>
                  <TrendingUp className="h-8 w-8 text-purple-400" />
                </div>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-orange-400">2.1M</div>
                    <div className="text-sm text-gray-400">People Impacted</div>
                  </div>
                  <Globe className="h-8 w-8 text-orange-400" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-6 bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-2">
          {[
            { key: 'projects', label: 'Active Projects', icon: Target },
            { key: 'stakeholders', label: 'Stakeholders', icon: Users },
            { key: 'create', label: 'Create Project', icon: Plus },
            { key: 'funding', label: 'Funding Hub', icon: TrendingUp }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as 'projects' | 'stakeholders' | 'create' | 'funding')}
                className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                  activeTab === tab.key
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="space-y-6">
          {activeTab === 'projects' && (
            <>
              {/* Search and Filter */}
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search projects..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div className="relative">
                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <label htmlFor="filter-category" className="sr-only">Filter by category</label>
                    <select
                      id="filter-category"
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                      className="pl-10 pr-8 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none appearance-none"
                      aria-label="Filter projects by category"
                    >
                      <option value="all">All Categories</option>
                      <option value="disaster-prep">Disaster Preparedness</option>
                      <option value="marine-ecosystem">Marine Ecosystem</option>
                      <option value="biodiversity">Biodiversity</option>
                      <option value="climate-adaptation">Climate Adaptation</option>
                      <option value="education">Education</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Projects Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProjects.map(renderProjectCard)}
              </div>
            </>
          )}

          {activeTab === 'stakeholders' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stakeholders.map(renderStakeholderCard)}
            </div>
          )}

          {activeTab === 'create' && (
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6">
              <h2 className="text-2xl font-bold text-white mb-6">Create New Project</h2>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Project Title</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                      placeholder="Enter project title..."
                    />
                  </div>
                  <div>
                    <label htmlFor="project-category" className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                    <select 
                      id="project-category" 
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                      aria-label="Select project category"
                    >
                      <option value="">Select category...</option>
                      <option value="disaster-prep">Disaster Preparedness</option>
                      <option value="marine-ecosystem">Marine Ecosystem</option>
                      <option value="biodiversity">Biodiversity</option>
                      <option value="climate-adaptation">Climate Adaptation</option>
                      <option value="education">Education</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                  <textarea
                    rows={4}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                    placeholder="Describe your project goals, methodology, and expected impact..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Funding Target</label>
                    <input
                      type="number"
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                      placeholder="Amount in USD"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Location</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                      placeholder="Project location"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Timeline (months)</label>
                    <input
                      type="number"
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                      placeholder="Duration"
                    />
                  </div>
                </div>

                <div className="flex space-x-4">
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors">
                    Create Project
                  </button>
                  <button className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-lg transition-colors">
                    Save as Draft
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'funding' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-green-600/20 to-blue-600/20 rounded-xl border border-green-500/30 p-6">
                <h2 className="text-2xl font-bold text-white mb-4">Funding Hub</h2>
                <p className="text-gray-300 mb-6">
                  Connect with global investors, grants, and crowdfunding opportunities for environmental and disaster resilience projects.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-slate-800/50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-white mb-2">Active Grants</h3>
                    <div className="text-2xl font-bold text-green-400 mb-2">$2.3M</div>
                    <p className="text-sm text-gray-400">Available funding</p>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-white mb-2">Success Rate</h3>
                    <div className="text-2xl font-bold text-blue-400 mb-2">73%</div>
                    <p className="text-sm text-gray-400">Funded projects</p>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-white mb-2">Avg. Timeline</h3>
                    <div className="text-2xl font-bold text-purple-400 mb-2">45</div>
                    <p className="text-sm text-gray-400">Days to funding</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Collaboration;
