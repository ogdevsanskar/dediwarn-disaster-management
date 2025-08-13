import React, { useState, useEffect } from 'react';
import { AlertTriangle, Shield, Zap, Globe, ArrowRight, Play, TrendingUp, Users, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import './Home.css';

export const Home: React.FC = () => {
  const [currentStat, setCurrentStat] = useState(0);
  const [typedText, setTypedText] = useState('');
  const fullText = 'Decentralized Digital Warning System';

  const stats = [
    { label: 'Warnings Issued', value: '1,247', icon: AlertTriangle },
    { label: 'Lives Protected', value: '50K+', icon: Shield },
    { label: 'Network Nodes', value: '2,500', icon: Globe },
    { label: 'Response Time', value: '<15s', icon: Zap }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStat((prev) => (prev + 1) % stats.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [stats.length]);

  useEffect(() => {
    let index = 0;
    const timer = setInterval(() => {
      if (index < fullText.length) {
        setTypedText(fullText.slice(0, index + 1));
        index++;
      } else {
        clearInterval(timer);
      }
    }, 100);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 bg-blue-600/20 text-blue-400 px-6 py-3 rounded-full text-sm font-medium mb-8 animate-fade-in-up border border-blue-500/30 backdrop-blur-sm">
              <Zap className="h-4 w-4 animate-pulse" />
              <span>Powered by Blockchain Technology</span>
            </div>
            
            {/* Main heading with typewriter effect */}
            <h1 className="text-4xl md:text-7xl font-bold text-white mb-6 leading-tight animate-fade-in-up">
              <span className="block">Decentralized Digital</span>
              <span className="block bg-gradient-to-r from-blue-400 via-purple-500 to-cyan-400 bg-clip-text text-transparent animate-gradient bg-400%">
                {typedText}
                <span className="animate-pulse">|</span>
              </span>
            </h1>
            <p className="text-xl text-slate-300 mb-10 max-w-3xl mx-auto animate-fade-in-up leading-relaxed animation-delay-02">
              Secure, transparent, and immutable warning distribution powered by smart contracts. 
              Protect communities with blockchain-verified alerts that can't be censored or manipulated.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16 animate-fade-in-up animation-delay-04">
              <Link 
                to="/warnings"
                className="group bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-2xl flex items-center space-x-2"
              >
                <span>View Warnings</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <button className="group border-2 border-slate-600 text-white px-8 py-4 rounded-xl font-semibold hover:border-blue-500 hover:bg-blue-500/10 transition-all duration-200 flex items-center space-x-2">
                <Play className="h-5 w-5" />
                <span>Watch Demo</span>
              </button>
            </div>

            {/* Animated stats carousel */}
            <div className="mb-16 animate-fade-in-up animation-delay-06">
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700 inline-block shadow-2xl">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
                    {React.createElement(stats[currentStat].icon, { className: "h-6 w-6 text-white" })}
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-white mb-1">
                      {stats[currentStat].value}
                    </div>
                    <div className="text-slate-400">
                      {stats[currentStat].label}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-slate-800/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4 animate-fade-in-up">
              Revolutionary Features
            </h2>
            <p className="text-xl text-slate-400 animate-fade-in-up animation-delay-01">
              Built for the future of emergency communications
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: 'Immutable Records',
                description: 'All warnings are stored on blockchain ensuring permanent, tamper-proof records that cannot be altered or deleted.',
                color: 'from-blue-500 to-cyan-500',
                delay: '0.2s'
              },
              {
                icon: AlertTriangle,
                title: 'Real-time Alerts',
                description: 'Instant warning distribution through smart contracts and decentralized networks with sub-15 second delivery.',
                color: 'from-yellow-500 to-orange-500',
                delay: '0.4s'
              },
              {
                icon: Globe,
                title: 'Global Network',
                description: 'Decentralized infrastructure ensures warnings reach everyone, everywhere, without single points of failure.',
                color: 'from-green-500 to-emerald-500',
                delay: '0.6s'
              }
            ].map((feature, index) => (
              <div
                key={index}
                className={`group bg-slate-800/60 backdrop-blur-sm p-8 rounded-2xl border border-slate-700 hover:border-slate-600 hover:shadow-2xl transition-all duration-500 hover:transform hover:-translate-y-4 animate-fade-in-up card-hover feature-delay-${index}`}
              >
                <div className="relative mb-6">
                  <div className={`p-4 bg-gradient-to-r ${feature.color} rounded-xl inline-block group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  <div className={`absolute inset-0 bg-gradient-to-r ${feature.color} opacity-20 rounded-xl blur-xl group-hover:opacity-40 transition-opacity`} />
                </div>
                <h3 className="text-xl font-semibold text-white mb-4 group-hover:text-blue-400 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-slate-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { icon: TrendingUp, label: 'Total Warnings', value: '1,247', change: '+12%' },
              { icon: Users, label: 'Active Users', value: '25.4K', change: '+8%' },
              { icon: Activity, label: 'Network Uptime', value: '99.9%', change: '+0.1%' },
              { icon: Globe, label: 'Countries', value: '156', change: '+3' }
            ].map((stat, index) => (
              <div
                key={index}
                className={`bg-slate-800/60 backdrop-blur-sm p-6 rounded-xl border border-slate-700 hover:border-slate-600 transition-all duration-300 hover:transform hover:scale-105 animate-fade-in-up stat-delay-${index}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <stat.icon className="h-8 w-8 text-blue-400" />
                  <span className="text-green-400 text-sm font-medium">{stat.change}</span>
                </div>
                <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-slate-400 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};