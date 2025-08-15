import React, { useState } from 'react';
import { Shield, BarChart3, Zap, Settings } from 'lucide-react';
import { AnalyticsDashboard } from './AnalyticsDashboard';
import AdminDashboard from './AdminDashboard.tsx';
import './AdminPanel.css';

const AdminPanel: React.FC = () => {
  const [activeView, setActiveView] = useState<'admin' | 'analytics'>('admin');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)]"></div>
      </div>
      
      {/* Glass Navigation */}
      <nav className="relative z-10 backdrop-blur-md bg-white/10 border-b border-white/20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo & Title */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-xl blur-lg opacity-75"></div>
                <div className="relative bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-xl">
                  <Shield className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                  DediWARN Control
                </h1>
                <p className="text-blue-200/80 text-sm">Emergency Management System</p>
              </div>
            </div>
            
            {/* Modern Tab Navigation */}
            <div className="flex items-center bg-white/10 backdrop-blur-sm rounded-full p-1 border border-white/20">
              <button
                onClick={() => setActiveView('admin')}
                className={`flex items-center px-6 py-3 rounded-full font-medium transition-all duration-300 btn-enhanced hover-scale ${
                  activeView === 'admin' 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-2xl scale-105 animate-glow-pulse' 
                    : 'text-blue-100 hover:text-white hover:bg-white/10'
                }`}
              >
                <Settings className="w-4 h-4 mr-2" />
                Control Center
              </button>
              
              <button
                onClick={() => setActiveView('analytics')}
                className={`flex items-center px-6 py-3 rounded-full font-medium transition-all duration-300 btn-enhanced hover-scale ${
                  activeView === 'analytics' 
                    ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-2xl scale-105 animate-glow-pulse' 
                    : 'text-blue-100 hover:text-white hover:bg-white/10'
                }`}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Analytics Hub
              </button>
            </div>

            {/* Status Indicator */}
            <div className="flex items-center space-x-3 animate-slide-in-right">
              <div className="flex items-center space-x-2 bg-green-500/20 backdrop-blur-sm px-4 py-2 rounded-full border border-green-400/30 glass-card">
                <div className="w-2 h-2 bg-green-400 rounded-full status-pulse"></div>
                <span className="text-green-200 text-sm font-medium">System Active</span>
              </div>
              <div className="relative animate-float">
                <Zap className="w-5 h-5 text-yellow-400" />
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Content Area with Smooth Transitions */}
      <main className="relative z-10">
        <div className="transition-all duration-500 ease-in-out">
          {activeView === 'admin' && (
            <div className="animate-fade-in">
              <AdminDashboard />
            </div>
          )}
          {activeView === 'analytics' && (
            <div className="animate-fade-in">
              <AnalyticsDashboard />
            </div>
          )}
        </div>
      </main>

      {/* Floating Action Indicators */}
      <div className="fixed bottom-6 right-6 z-20 animate-float">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-full shadow-2xl backdrop-blur-sm glass-card hover-scale cursor-pointer">
          <span className="text-sm font-medium flex items-center">
            {activeView === 'admin' ? (
              <>
                <Shield className="w-4 h-4 mr-2" />
                Admin Mode
              </>
            ) : (
              <>
                <BarChart3 className="w-4 h-4 mr-2" />
                Analytics Mode
              </>
            )}
          </span>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
// Make sure AnalyticsDashboard is properly exported from './AnalyticsDashboard.tsx'.
