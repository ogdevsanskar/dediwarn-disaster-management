import React, { useState } from 'react';
import { BookOpen, Play, Award, Clock, Users, CheckCircle, Star, Download, Video, FileText, X } from 'lucide-react';
import '../styles/Training.css';

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  duration: string;
  modules: number;
  enrolled: number;
  rating: number;
  instructor: string;
  image: string;
  progress?: number;
  completed?: boolean;
  type: 'video' | 'interactive' | 'simulation' | 'assessment';
}

interface Certificate {
  id: string;
  title: string;
  issueDate: string;
  validUntil: string;
  credentialId: string;
  skills: string[];
}

export const Training: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'courses' | 'progress' | 'certificates'>('courses');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [enrollmentStatus, setEnrollmentStatus] = useState<{[key: string]: boolean}>({});
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [currentVideo, setCurrentVideo] = useState<string>('');
  const [showEnrollmentForm, setShowEnrollmentForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [enrollmentData, setEnrollmentData] = useState({
    fullName: '',
    email: '',
    phone: '',
    experience: '',
    motivation: ''
  });

  const courses: Course[] = [
    {
      id: '1',
      title: 'Emergency Response Fundamentals',
      description: 'Learn the basics of emergency response, including first aid, evacuation procedures, and crisis communication.',
      category: 'Emergency Response',
      level: 'beginner',
      duration: '4 hours',
      modules: 8,
      enrolled: 2847,
      rating: 4.8,
      instructor: 'Dr. Sarah Mitchell',
      image: 'https://images.pexels.com/photos/6303773/pexels-photo-6303773.jpeg',
      progress: 75,
      type: 'video'
    },
    {
      id: '2',
      title: 'Disaster Risk Assessment',
      description: 'Advanced techniques for assessing and mitigating disaster risks in various environments and scenarios.',
      category: 'Risk Management',
      level: 'advanced',
      duration: '6 hours',
      modules: 12,
      enrolled: 1523,
      rating: 4.9,
      instructor: 'Prof. Michael Chen',
      image: 'https://images.pexels.com/photos/8728382/pexels-photo-8728382.jpeg',
      progress: 30,
      type: 'interactive'
    },
    {
      id: '3',
      title: 'Search and Rescue Operations',
      description: 'Comprehensive training on search and rescue techniques for various disaster scenarios.',
      category: 'Search & Rescue',
      level: 'intermediate',
      duration: '8 hours',
      modules: 15,
      enrolled: 1876,
      rating: 4.7,
      instructor: 'Captain Lisa Rodriguez',
      image: 'https://images.pexels.com/photos/8728380/pexels-photo-8728380.jpeg',
      type: 'simulation'
    },
    {
      id: '4',
      title: 'Psychological First Aid',
      description: 'Learn to provide psychological support to disaster survivors and manage trauma responses.',
      category: 'Mental Health',
      level: 'intermediate',
      duration: '5 hours',
      modules: 10,
      enrolled: 2156,
      rating: 4.6,
      instructor: 'Dr. Amanda Foster',
      image: 'https://images.pexels.com/photos/5699456/pexels-photo-5699456.jpeg',
      completed: true,
      type: 'video'
    },
    {
      id: '5',
      title: 'Hazmat Response Certification',
      description: 'Specialized training for handling hazardous materials during emergency situations.',
      category: 'Specialized Response',
      level: 'advanced',
      duration: '12 hours',
      modules: 20,
      enrolled: 892,
      rating: 4.9,
      instructor: 'Chief Robert Kim',
      image: 'https://images.pexels.com/photos/8728381/pexels-photo-8728381.jpeg',
      type: 'assessment'
    },
    {
      id: '6',
      title: 'Community Disaster Preparedness',
      description: 'Strategies for building resilient communities and preparing for various disaster scenarios.',
      category: 'Community Preparedness',
      level: 'beginner',
      duration: '3 hours',
      modules: 6,
      enrolled: 3421,
      rating: 4.5,
      instructor: 'Maria Gonzalez',
      image: 'https://images.pexels.com/photos/6303776/pexels-photo-6303776.jpeg',
      progress: 100,
      completed: true,
      type: 'interactive'
    }
  ];

  const certificates: Certificate[] = [
    {
      id: '1',
      title: 'Emergency Response Specialist',
      issueDate: '2024-01-10',
      validUntil: '2026-01-10',
      credentialId: 'ERS-2024-001234',
      skills: ['First Aid', 'Crisis Communication', 'Evacuation Planning']
    },
    {
      id: '2',
      title: 'Psychological First Aid Certified',
      issueDate: '2023-12-15',
      validUntil: '2025-12-15',
      credentialId: 'PFA-2023-005678',
      skills: ['Trauma Response', 'Crisis Counseling', 'Mental Health Support']
    },
    {
      id: '3',
      title: 'Community Preparedness Leader',
      issueDate: '2023-11-20',
      validUntil: '2025-11-20',
      credentialId: 'CPL-2023-009876',
      skills: ['Community Engagement', 'Disaster Planning', 'Risk Communication']
    }
  ];

  const categories = [
    'Emergency Response',
    'Risk Management', 
    'Search & Rescue',
    'Mental Health',
    'Specialized Response',
    'Community Preparedness'
  ];

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'intermediate': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'advanced': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="h-4 w-4" />;
      case 'interactive': return <Play className="h-4 w-4" />;
      case 'simulation': return <Users className="h-4 w-4" />;
      case 'assessment': return <FileText className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  const filteredCourses = courses.filter(course => {
    const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory;
    const matchesLevel = selectedLevel === 'all' || course.level === selectedLevel;
    return matchesCategory && matchesLevel;
  });

  const handleCourseAction = (course: Course) => {
    if (course.progress !== undefined) {
      // Continue - show video player
      setSelectedCourse(course);
      setCurrentVideo(`https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&start=0`); // Emergency training video
      setShowVideoPlayer(true);
    } else {
      // Enroll - show enrollment form
      setSelectedCourse(course);
      setShowEnrollmentForm(true);
    }
  };

  const handleEnrollmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCourse) {
      setEnrollmentStatus({ ...enrollmentStatus, [selectedCourse.id]: true });
      setShowEnrollmentForm(false);
      setSelectedCourse(null);
      setEnrollmentData({
        fullName: '',
        email: '',
        phone: '',
        experience: '',
        motivation: ''
      });
      alert(`Successfully enrolled in ${selectedCourse.title}!`);
    }
  };

  return (
    <div className="min-h-screen pt-8 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in-up">
          <h1 className="text-4xl font-bold text-white mb-4">Emergency Response Training</h1>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto">
            Comprehensive training programs to prepare you for emergency response and disaster management. Learn from experts and earn certifications.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {[
            { title: 'Available Courses', value: '47', icon: BookOpen, color: 'from-blue-500 to-cyan-500' },
            { title: 'Active Students', value: '12,847', icon: Users, color: 'from-green-500 to-emerald-500' },
            { title: 'Certificates Issued', value: '3,456', icon: Award, color: 'from-purple-500 to-pink-500' },
            { title: 'Training Hours', value: '89,234', icon: Clock, color: 'from-orange-500 to-red-500' }
          ].map((stat, index) => (
            <div
              key={index}
              className={`bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 border border-slate-700 hover:border-slate-600 shadow-lg hover:shadow-2xl transition-all duration-300 hover:transform hover:-translate-y-1 animate-fade-in-up animation-delay-${index}`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 bg-gradient-to-r ${stat.color} rounded-lg`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <Star className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-slate-400 text-sm">{stat.title}</div>
            </div>
          ))}
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8 animate-fade-in-up animation-delay-05">
          <div className="bg-slate-800/60 backdrop-blur-sm rounded-xl p-1 border border-slate-700">
            {[
              { id: 'courses', label: 'Browse Courses', icon: BookOpen },
              { id: 'progress', label: 'My Progress', icon: Clock },
              { id: 'certificates', label: 'Certificates', icon: Award }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'courses' | 'progress' | 'certificates')}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Courses Tab */}
        {activeTab === 'courses' && (
          <div className="animate-fade-in-up animation-delay-06">
            {/* Filters */}
            <div className="bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 border border-slate-700 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="category-select" className="block text-sm font-medium text-slate-300 mb-2">Category</label>
                  <select
                    id="category-select"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="all">All Categories</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="level-select" className="block text-sm font-medium text-slate-300 mb-2">Level</label>
                  <select
                    id="level-select"
                    value={selectedLevel}
                    onChange={(e) => setSelectedLevel(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="all">All Levels</option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Course Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {filteredCourses.map((course, index) => (
                <div
                  key={course.id}
                  className={`bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-slate-700 overflow-hidden hover:border-slate-600 transition-all duration-300 hover:transform hover:scale-105 animate-fade-in-up animation-delay-${index}`}
                >
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={course.image} 
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 left-4 flex items-center space-x-2">
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getLevelColor(course.level)}`}>
                        {course.level.toUpperCase()}
                      </span>
                      <div className="bg-slate-900/80 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center space-x-1">
                        {getTypeIcon(course.type)}
                        <span className="text-white text-xs">{course.type}</span>
                      </div>
                    </div>
                    {course.completed && (
                      <div className="absolute top-4 right-4 bg-green-600 p-2 rounded-full">
                        <CheckCircle className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-blue-400 text-sm font-medium">{course.category}</span>
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-white text-sm">{course.rating}</span>
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-semibold text-white mb-2">{course.title}</h3>
                    <p className="text-slate-400 mb-4 leading-relaxed">{course.description}</p>
                    
                    <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                      <div className="text-center">
                        <div className="text-white font-medium">{course.duration}</div>
                        <div className="text-slate-400">Duration</div>
                      </div>
                      <div className="text-center">
                        <div className="text-white font-medium">{course.modules}</div>
                        <div className="text-slate-400">Modules</div>
                      </div>
                      <div className="text-center">
                        <div className="text-white font-medium">{course.enrolled.toLocaleString()}</div>
                        <div className="text-slate-400">Enrolled</div>
                      </div>
                    </div>

                    {course.progress !== undefined && (
                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-slate-400 text-sm">Progress</span>
                          <span className="text-white text-sm font-medium">{course.progress}%</span>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-2">
                          <div
                            className={`bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-1000 progress-bar`}
                            data-progress={course.progress}
                          />
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-sm">by {course.instructor}</span>
                      <button 
                        onClick={() => handleCourseAction(course)}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2"
                      >
                        {course.progress !== undefined ? (
                          <>
                            <Play className="h-4 w-4" />
                            <span>Continue</span>
                          </>
                        ) : (
                          <>
                            <BookOpen className="h-4 w-4" />
                            <span>Enroll</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Progress Tab */}
        {activeTab === 'progress' && (
          <div className="animate-fade-in-up animation-delay-06">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <h2 className="text-2xl font-bold text-white mb-6">My Learning Progress</h2>
                
                {courses.filter(c => c.progress !== undefined).map((course, index) => (
                  <div
                    key={course.id}
                    className={`bg-slate-800/60 backdrop-blur-sm rounded-xl p-6 border border-slate-700 animate-fade-in-up animation-delay-${index}`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-white">{course.title}</h3>
                        <p className="text-slate-400 text-sm">{course.category}</p>
                      </div>
                      {course.completed && (
                        <div className="bg-green-600 p-2 rounded-full">
                          <CheckCircle className="h-5 w-5 text-white" />
                        </div>
                      )}
                    </div>
                    
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-slate-400 text-sm">Progress</span>
                        <span className="text-white text-sm font-medium">{course.progress}%</span>
                      </div>
                      <div
                        className={`h-3 rounded-full transition-all duration-1000 ${course.completed ? 'bg-green-500' : 'bg-gradient-to-r from-blue-500 to-purple-500'} progress-bar`}
                        data-progress={course.progress}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-sm">
                        {course.completed ? 'Completed' : `${Math.floor((course.progress || 0) / 100 * course.modules)} of ${course.modules} modules`}
                      </span>
                      <button className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors">
                        {course.completed ? 'Review' : 'Continue Learning'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="space-y-6">
                <div className="bg-slate-800/60 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
                  <h3 className="text-lg font-semibold text-white mb-4">Learning Stats</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Courses Enrolled:</span>
                      <span className="text-white font-medium">3</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Completed:</span>
                      <span className="text-white font-medium">2</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Hours Learned:</span>
                      <span className="text-white font-medium">12</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Certificates:</span>
                      <span className="text-white font-medium">3</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-slate-800/60 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
                  <h3 className="text-lg font-semibold text-white mb-4">Recommended</h3>
                  <div className="space-y-3">
                    <div className="p-3 bg-slate-700/30 rounded-lg">
                      <h4 className="text-white font-medium text-sm">Advanced Incident Command</h4>
                      <p className="text-slate-400 text-xs mt-1">Based on your progress</p>
                    </div>
                    <div className="p-3 bg-slate-700/30 rounded-lg">
                      <h4 className="text-white font-medium text-sm">Crisis Leadership</h4>
                      <p className="text-slate-400 text-xs mt-1">Popular among peers</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Certificates Tab */}
        {activeTab === 'certificates' && (
          <div className="animate-fade-in-up animation-delay-06">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {certificates.map((cert, index) => (
                <div
                  key={cert.id}
                  className={`bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 border border-slate-700 hover:border-slate-600 transition-all duration-300 hover:transform hover:scale-105 animate-fade-in-up animation-delay-0${7 + index}`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg">
                        <Award className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">{cert.title}</h3>
                        <p className="text-slate-400 text-sm">Credential ID: {cert.credentialId}</p>
                      </div>
                    </div>
                    <button className="text-slate-400 hover:text-blue-400 transition-colors" title="Download Certificate">
                      <Download className="h-5 w-5" />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div>
                      <span className="text-slate-400">Issued:</span>
                      <div className="text-white font-medium">{new Date(cert.issueDate).toLocaleDateString()}</div>
                    </div>
                    <div>
                      <span className="text-slate-400">Valid Until:</span>
                      <div className="text-white font-medium">{new Date(cert.validUntil).toLocaleDateString()}</div>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <span className="text-slate-400 text-sm mb-2 block">Skills Certified:</span>
                    <div className="flex flex-wrap gap-2">
                      {cert.skills.map((skill) => (
                        <span
                          key={skill}
                          className="px-2 py-1 bg-blue-600/20 text-blue-400 text-xs rounded-lg border border-blue-500/30"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-slate-700">
                    <span className="text-green-400 text-sm font-medium">✓ Verified</span>
                    <div className="flex space-x-2">
                      <button className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors">
                        Share
                      </button>
                      <button className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors">
                        Verify
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Video Player Modal */}
      {showVideoPlayer && selectedCourse && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto border border-slate-700">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-white">{selectedCourse ? selectedCourse.title : ''}</h3>
              <button
                onClick={() => {
                  setShowVideoPlayer(false);
                  setCurrentVideo('');
                  setSelectedCourse(null);
                }}
                className="text-slate-400 hover:text-white transition-colors"
                title="Close Video Player"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden mb-4">
              <iframe
                src={currentVideo}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="Emergency Training Video"
              />
            </div>
            
            <div className="text-slate-300 mb-4">
              <p>{selectedCourse.description}</p>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="text-sm text-slate-400">
                Duration: {selectedCourse.duration} • Modules: {selectedCourse.modules}
              </div>
              <button
                onClick={() => {
                  setShowVideoPlayer(false);
                  setCurrentVideo('');
                  setSelectedCourse(null);
                }}
                className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-2 rounded-lg font-medium hover:from-green-700 hover:to-emerald-700 transition-all duration-200"
              >
                Mark as Complete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enrollment Form Modal */}
      {showEnrollmentForm && selectedCourse && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto border border-slate-700">
            <div className="flex justify-between items-center mb-6">
              <button
                onClick={() => {
                  setShowEnrollmentForm(false);
                  setSelectedCourse(null);
                }}
                className="text-slate-400 hover:text-white transition-colors"
                title="Close Enrollment Form"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleEnrollmentSubmit} className="space-y-6">
              <div>
                <label className="block text-white font-medium mb-2">Full Name</label>
                <input
                  type="text"
                  value={enrollmentData.fullName}
                  onChange={(e) => setEnrollmentData({...enrollmentData, fullName: e.target.value})}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
                  placeholder="Enter your full name"
                  required
                />
              </div>
              
              <div>
                <label className="block text-white font-medium mb-2">Email Address</label>
                <input
                  type="email"
                  value={enrollmentData.email}
                  onChange={(e) => setEnrollmentData({...enrollmentData, email: e.target.value})}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
                  placeholder="Enter your email"
                  required
                />
              </div>
              
              <div>
                <label className="block text-white font-medium mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={enrollmentData.phone}
                  onChange={(e) => setEnrollmentData({...enrollmentData, phone: e.target.value})}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
                  placeholder="Enter your phone number"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="experience-select" className="block text-white font-medium mb-2">Previous Experience</label>
                <select
                  id="experience-select"
                  value={enrollmentData.experience}
                  onChange={(e) => setEnrollmentData({...enrollmentData, experience: e.target.value})}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
                  required
                >
                  <option value="">Select your experience level</option>
                  <option value="none">No prior experience</option>
                  <option value="basic">Basic knowledge</option>
                  <option value="intermediate">Some experience</option>
                  <option value="advanced">Extensive experience</option>
                </select>
              </div>
              
              <div>
                <label className="block text-white font-medium mb-2">Motivation</label>
                <textarea
                  value={enrollmentData.motivation}
                  onChange={(e) => setEnrollmentData({...enrollmentData, motivation: e.target.value})}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
                  placeholder="Why do you want to take this course?"
                  rows={4}
                  required
                />
              </div>
              
              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEnrollmentForm(false);
                    setSelectedCourse(null);
                  }}
                  className="px-6 py-3 text-slate-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                >
                  Enroll Now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
// Store selected course in local state for enrollment/continuation
// (Removed duplicate declaration and function)

