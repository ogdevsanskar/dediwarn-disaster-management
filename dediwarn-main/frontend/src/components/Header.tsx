import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Shield, Menu, X } from 'lucide-react';
import { WalletConnect } from './WalletConnect';
import theme from '../styles/theme';

export const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const mainNavItems = [
    { name: 'Home', path: '/' },
    { name: 'Global Hub', path: '/enhanced-dashboard' },
    { name: 'Collaboration', path: '/collaboration' },
    { name: 'Analytics', path: '/analytics' },
    { name: 'Emergency', path: '/emergency-communication' },
    { name: 'Education', path: '/education' },
    { name: 'Donations', path: '/donations' },
  ];

  return (
    <header className={`${theme.backgrounds.glass} border-b ${theme.borders.default} sticky top-0 z-50 ${theme.shadows.glow}`}>
      <div className={`${theme.spacing.containerMax} px-4 sm:px-6 lg:px-8`}>
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group flex-shrink-0 -ml-2">
            <div className="relative">
              <div className={`w-10 h-10 ${theme.backgrounds.card} rounded-xl flex items-center justify-center ${theme.hover.scale} ${theme.borders.accent}`}>
                <Shield className="h-6 w-6 text-blue-400 group-hover:text-blue-300 transition-colors" />
              </div>
              <div className="absolute inset-0 bg-blue-500 opacity-20 rounded-xl blur-lg group-hover:opacity-40 transition-opacity" />
            </div>
            <div className="flex flex-col -ml-1">
              <span className={`text-xl font-bold ${theme.text.gradient.primary} group-hover:scale-105 transition-transform duration-200`}>
                ClimaAid
              </span>
              <span className="text-xs text-slate-400">Climate Aid Platform</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center justify-center space-x-2 flex-1 mx-8">
            <div className={`flex items-center justify-center space-x-1 ${theme.backgrounds.glassCard} rounded-2xl p-2`}>
              {mainNavItems.map((item, index) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`relative px-4 py-2.5 text-sm rounded-xl transition-all duration-300 group whitespace-nowrap flex items-center font-medium ${
                    location.pathname === item.path
                      ? `bg-gradient-to-r ${theme.gradients.primary} text-white shadow-lg ${theme.shadows.glow} scale-105`
                      : `${theme.text.secondary} hover:text-white hover:bg-slate-700/70 ${theme.hover.scale}`
                  }`}
                  style={{ animationDelay: `${index * 75}ms` }}
                >
                  <span>{item.name}</span>
                  {location.pathname === item.path && (
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-xl blur-xl" />
                  )}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-500 group-hover:w-full transition-all duration-500" />
                </Link>
              ))}
            </div>
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4 flex-shrink-0">
            {/* Emergency Button */}
            <Link
              to="/emergency-communication"
              className={`hidden md:flex items-center space-x-2 px-4 py-2 bg-gradient-to-r ${theme.gradients.danger} rounded-xl font-semibold ${theme.hover.scale} ${theme.shadows.glowRed}`}
            >
              <span>🚨</span>
              <span>Emergency</span>
            </Link>

            {/* Wallet Connect */}
            <div className="hidden md:block">
              <WalletConnect />
            </div>
            
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`lg:hidden p-3 rounded-xl ${theme.backgrounds.cardHover} transition-all duration-200 ${theme.borders.default} hover:border-blue-400`}
            >
              {isMenuOpen ? 
                <X className="h-6 w-6 text-white" /> : 
                <Menu className="h-6 w-6 text-white" />
              }
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className={`lg:hidden ${theme.backgrounds.glass} border-t ${theme.borders.default} animate-slide-down ${theme.shadows['2xl']}`}>
          <div className="px-4 py-6 space-y-4 max-h-96 overflow-y-auto">
            {/* Emergency Button Mobile */}
            <Link
              to="/emergency-communication"
              className={`flex items-center justify-center space-x-2 py-3 px-4 bg-gradient-to-r ${theme.gradients.danger} rounded-xl font-semibold ${theme.hover.scale} mb-4`}
              onClick={() => setIsMenuOpen(false)}
            >
              <span>🚨</span>
              <span>Emergency Alert</span>
            </Link>

            {/* Wallet Connect in mobile menu */}
            <div className="pb-4 border-b border-slate-700/50">
              <WalletConnect />
            </div>
            
            {/* Navigation Items */}
            {mainNavItems.map((item, index) => (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center py-3 px-4 rounded-xl transition-all duration-200 ${
                  location.pathname === item.path
                    ? `bg-gradient-to-r ${theme.gradients.primary} text-white ${theme.shadows.glow}`
                    : `${theme.text.secondary} hover:text-white hover:bg-slate-700/70 active:scale-95`
                }`}
                onClick={() => setIsMenuOpen(false)}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <span className="font-medium flex-1">{item.name}</span>
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