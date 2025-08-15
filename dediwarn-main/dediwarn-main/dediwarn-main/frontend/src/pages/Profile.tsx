import React, { useState } from 'react';
import { User, Bell, Shield, Activity, Award, Edit, Save, X } from 'lucide-react';

export const Profile: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'Emergency Coordinator',
    organization: 'City Emergency Services',
    location: 'San Francisco, CA',
    bio: 'Experienced emergency coordinator with 10+ years in disaster management and public safety.'
  });

  const [editedProfile, setEditedProfile] = useState(profile);

  const handleSave = () => {
    setProfile(editedProfile);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedProfile(profile);
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen pt-8 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in-up">
          <h1 className="text-4xl font-bold text-white mb-4">User Profile</h1>
          <p className="text-xl text-slate-400">Manage your account and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 border border-slate-700 animate-fade-in-up animation-delay-01">
              <div className="text-center">
                <div className="relative inline-block mb-4">
                  <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <User className="h-12 w-12 text-white" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-400 rounded-full border-2 border-slate-800 animate-pulse" />
                </div>
                <h2 className="text-xl font-semibold text-white mb-1">{profile.name}</h2>
                <p className="text-slate-400 mb-2">{profile.role}</p>
                <p className="text-sm text-slate-500">{profile.organization}</p>
                
                <div className="mt-6 space-y-3">
                  <div className="flex items-center justify-center space-x-2 text-sm text-slate-400">
                    <Shield className="h-4 w-4" />
                    <span>Verified Account</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2 text-sm text-slate-400">
                    <Award className="h-4 w-4" />
                    <span>Level 3 Coordinator</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 border border-slate-700 mt-6 animate-fade-in-up animation-delay-2">
              <h3 className="text-lg font-semibold text-white mb-4">Activity Stats</h3>
              <div className="space-y-4">
                {[
                  { label: 'Warnings Issued', value: '47', icon: Bell },
                  { label: 'Responses', value: '156', icon: Activity },
                  { label: 'Reputation Score', value: '98%', icon: Award }
                ].map((stat, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <stat.icon className="h-4 w-4 text-blue-400" />
                      <span className="text-sm text-slate-400">{stat.label}</span>
                    </div>
                    <span className="text-sm font-medium text-white">{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Information */}
            <div className="bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 border border-slate-700 animate-fade-in-up animation-delay-3" >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">Profile Information</h3>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                    <span>Edit</span>
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSave}
                      className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Save className="h-4 w-4" />
                      <span>Save</span>
                    </button>
                    <button
                      onClick={handleCancel}
                      className="flex items-center space-x-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
                    >
                      <X className="h-4 w-4" />
                      <span>Cancel</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { label: 'Full Name', key: 'name' },
                  { label: 'Email', key: 'email' },
                  { label: 'Role', key: 'role' },
                  { label: 'Organization', key: 'organization' },
                  { label: 'Location', key: 'location' }
                ].map((field) => (
                  <div key={field.key}>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      {field.label}
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedProfile[field.key as keyof typeof editedProfile]}
                        onChange={(e) => setEditedProfile({
                          ...editedProfile,
                          [field.key]: e.target.value
                        })}
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder={`Enter ${field.label}`}
                        title={field.label}
                      />
                    ) : (
                      <p className="text-white bg-slate-700/50 px-3 py-2 rounded-lg">
                        {profile[field.key as keyof typeof profile]}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Bio
                </label>
                {isEditing ? (
                  <textarea
                    value={editedProfile.bio}
                    onChange={(e) => setEditedProfile({
                      ...editedProfile,
                      bio: e.target.value
                    })}
                    rows={3}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter your bio"
                    title="Bio"
                  />
                ) : (
                  <p className="text-white bg-slate-700/50 px-3 py-2 rounded-lg">
                    {profile.bio}
                  </p>
                )}
              </div>
            </div>

            {/* Settings */}
            <div className="bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 border border-slate-700 animate-fade-in-up animation-delay-4">
              <h3 className="text-lg font-semibold text-white mb-6">Notification Settings</h3>
              <div className="space-y-4">
                {[
                  { label: 'Email Notifications', description: 'Receive email alerts for new warnings' },
                  { label: 'Push Notifications', description: 'Get push notifications on your device' },
                  { label: 'SMS Alerts', description: 'Receive SMS for critical warnings' },
                  { label: 'Weekly Reports', description: 'Get weekly activity summaries' }
                ].map((setting, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                    <div>
                      <h4 className="text-white font-medium">{setting.label}</h4>
                      <p className="text-sm text-slate-400">{setting.description}</p>
                    </div>
                    <label
                      htmlFor={`setting-checkbox-${index}`}
                      className="relative inline-flex items-center cursor-pointer"
                    >
                      <input
                        id={`setting-checkbox-${index}`}
                        type="checkbox"
                        className="sr-only peer"
                        defaultChecked={index < 2}
                        title={setting.label}
                        placeholder={setting.label}
                      />
                      <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-slate-800/60 backdrop-blur-sm rounded-2xl p-6 border border-slate-700 animate-fade-in-up animation-delay-5">
              <h3 className="text-lg font-semibold text-white mb-6">Recent Activity</h3>
              <div className="space-y-4">
                {[
                  { action: 'Issued critical weather warning', time: '2 hours ago', type: 'warning' },
                  { action: 'Resolved traffic alert', time: '1 day ago', type: 'success' },
                  { action: 'Updated profile information', time: '3 days ago', type: 'info' },
                  { action: 'Joined emergency response team', time: '1 week ago', type: 'info' }
                ].map((activity, index) => (
                  <div key={index} className="flex items-center space-x-4 p-3 bg-slate-700/30 rounded-lg">
                    <div className={`w-2 h-2 rounded-full ${
                      activity.type === 'warning' ? 'bg-yellow-400' :
                      activity.type === 'success' ? 'bg-green-400' : 'bg-blue-400'
                    } animate-pulse`} />
                    <div className="flex-1">
                      <p className="text-white text-sm">{activity.action}</p>
                      <p className="text-slate-400 text-xs">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};