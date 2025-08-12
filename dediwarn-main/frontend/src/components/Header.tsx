import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Shield, Menu, X } from 'lucide-react';
import { WalletConnect } from './WalletConnect';

export const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const mainNavItems = [
    { name: 'Dashboard', path: '/' },
    { name: 'Global Hub', path: '/enhanced-dashboard' },
    { name: 'Collaboration', path: '/collaboration' },
    { name: 'Contracts', path: '/contracts' },
    { name: 'Analytics Hub', path: '/analytics' },
    { name: 'Emergency Center', path: '/emergency-communication' },
    { name: 'Donations', path: '/donations' },
    { name: 'Education', path: '/education' },
  ];

  return (
    <header className="bg-slate-900/95 backdrop-blur-md border-b border-slate-700/50 sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2 xl:space-x-3 group flex-shrink-0">
            <div className="relative">
              <Shield className="h-6 xl:h-7 w-6 xl:w-7 text-blue-500 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300" />
              <div className="absolute inset-0 bg-blue-500 opacity-20 rounded-full blur-lg group-hover:opacity-40 transition-opacity" />
            </div>
            <span className="text-lg xl:text-xl font-bold text-white bg-gradient-to-r from-blue-400 via-purple-500 to-cyan-400 bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-200">
              DeDiWARN
            </span>
          </Link>

          <nav className="hidden md:flex items-center justify-center space-x-1 flex-1 mx-2 xl:mx-6">
            <div className="flex items-center justify-center space-x-1 bg-slate-800/50 rounded-xl p-1.5 xl:p-2 backdrop-blur-sm border border-slate-700/30">
              {mainNavItems.map((item, index) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`relative px-3 xl:px-4 py-2 xl:py-2.5 text-sm xl:text-sm rounded-lg transition-all duration-300 group whitespace-nowrap flex items-center font-medium ${
                    location.pathname === item.path
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-600/25 scale-105'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700/70 hover:scale-105'
                  }`}
                  style={{ animationDelay: `${index * 75}ms` }}
                >
                  <span>{item.name}</span>
                  {location.pathname === item.path && (
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-lg blur-xl" />
                  )}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-500 group-hover:w-full transition-all duration-500" />
                </Link>
              ))}
            </div>
          </nav>

          <div className="flex items-center space-x-2 xl:space-x-4 flex-shrink-0 min-w-fit">
            <div className="hidden md:block">
              <WalletConnect />
            </div>
            
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2.5 rounded-xl hover:bg-slate-700/70 transition-all duration-200 border border-slate-600/30 hover:border-slate-500/50"
            >
              {isMenuOpen ? 
                <X className="h-6 w-6 text-white" /> : 
                <Menu className="h-6 w-6 text-white" />
              }
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden bg-slate-900/98 backdrop-blur-md border-t border-slate-700/50 animate-slide-down shadow-2xl">
          <div className="px-4 py-4 space-y-3 max-h-96 overflow-y-auto">
            {/* Wallet Connect in mobile menu */}
            <div className="pb-3 border-b border-slate-700/50">
              <WalletConnect />
            </div>
            
            {mainNavItems.map((item, index) => (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center justify-between py-3 px-4 rounded-xl transition-all duration-200 ${
                  location.pathname === item.path
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-600/25'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/70 active:scale-95'
                }`}
                onClick={() => setIsMenuOpen(false)}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <span className="font-medium">{item.name}</span>
                {location.pathname === item.path && (
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                )}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};