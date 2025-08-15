import React, { useState, useEffect } from 'react';
import { AlertTriangle, Shield, Zap, Globe, ArrowRight, Play, Phone, Camera, MapPin } from 'lucide-react';
import { EnhancedButton, initializeButtonFunctionality } from './ButtonFunctionality';
import './Hero.css';

// Initialize button functionality
initializeButtonFunctionality();

export const Hero: React.FC = () => {
  const [currentStat, setCurrentStat] = useState(0);
  const stats = [
    { label: 'Warnings Issued', value: '1,247' },
    { label: 'Lives Protected', value: '50K+' },
    { label: 'Network Nodes', value: '2,500' },
    { label: 'Response Time', value: '<15s' }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStat((prev) => (prev + 1) % stats.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [stats.length]);

  const handleLaunchDashboard = () => {
    window.location.href = '/dashboard';
  };

  const handleWatchDemo = () => {
    window.open('https://www.youtube.com/watch?v=demo123', '_blank');
  };

  const handleEmergencyCall = () => {
    window.open('tel:6001163688', '_self');
  };

  const handleEmergencyCamera = () => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(stream => {
        const video = document.createElement('video');
        video.srcObject = stream;
        video.autoplay = true;
        video.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:10000;width:80%;max-width:500px;border:3px solid red;border-radius:10px;box-shadow:0 25px 50px rgba(0,0,0,0.5);';
        
        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '×';
        closeBtn.style.cssText = 'position:absolute;top:-10px;right:-10px;width:30px;height:30px;background:red;color:white;border:none;border-radius:50%;font-size:20px;cursor:pointer;z-index:10001;';
        closeBtn.onclick = () => {
          stream.getTracks().forEach(track => track.stop());
          document.body.removeChild(video);
        };
        
        video.appendChild(closeBtn);
        document.body.appendChild(video);
        
        setTimeout(() => {
          stream.getTracks().forEach(track => track.stop());
          if (document.body.contains(video)) {
            document.body.removeChild(video);
          }
        }, 30000);
      })
      .catch(() => alert('Camera access denied. Please allow camera permissions.'));
  };

  const handleShareLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const locationUrl = `https://maps.google.com/?q=${latitude},${longitude}`;
        const message = `Emergency Location: ${locationUrl}`;
        
        if (navigator.share) {
          navigator.share({
            title: 'Emergency Location',
            text: message,
            url: locationUrl
          });
        } else {
          navigator.clipboard.writeText(message);
          alert('Emergency location copied to clipboard!');
        }
      },
      () => alert('Location access denied. Please allow location permissions.')
    );
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Emergency Alert Banner */}
      <div className="fixed top-0 left-0 right-0 bg-red-600 text-white py-2 text-center z-50 animate-pulse">
        <div className="flex items-center justify-center space-x-2">
          <AlertTriangle className="w-5 h-5" />
          <span className="font-semibold">Emergency Hotline: 6001163688 • 24/7 Response Available</span>
        </div>
      </div>

      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-surface to-background">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        
        {/* Floating elements */}
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-primary rounded-full animate-float opacity-30 hero-float-element"
          />
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-16">
        <div className="text-center">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 bg-primary bg-opacity-10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-8 animate-fade-in-up border border-primary border-opacity-20">
            <Zap className="h-4 w-4 animate-pulse" />
            <span>Powered by Blockchain Technology</span>
          </div>
          
          {/* Main heading with typewriter effect */}
          <h1 className="text-4xl md:text-7xl font-bold text-text mb-6 leading-tight animate-fade-in-up">
            Decentralized Digital
            <span className="block bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent animate-gradient">
              Warning System
            </span>
          </h1>
          
          <p className="text-xl text-textSecondary mb-10 max-w-3xl mx-auto animate-fade-in-up hero-subtitle">
            Secure, transparent, and immutable warning distribution powered by smart contracts. 
            Protect communities with blockchain-verified alerts that can't be censored or manipulated.
          </p>
          
          {/* Emergency Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8 animate-fade-in-up hero-emergency-buttons">
            <EnhancedButton
              id="emergency_call_hero"
              variant="danger"
              size="lg"
              icon={<Phone className="w-5 h-5" />}
              onClick={handleEmergencyCall}
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-2xl transform hover:scale-105 transition-all duration-300 animate-pulse"
            >
              Emergency Call 6001163688
            </EnhancedButton>

            <EnhancedButton
              id="emergency_camera_hero"
              variant="warning"
              size="lg"
              icon={<Camera className="w-5 h-5" />}
              onClick={handleEmergencyCamera}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-2xl transform hover:scale-105 transition-all duration-300"
            >
              Emergency Camera
            </EnhancedButton>

            <EnhancedButton
              id="share_location_hero"
              variant="warning"
              size="lg"
              icon={<MapPin className="w-5 h-5" />}
              onClick={handleShareLocation}
              className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 shadow-2xl transform hover:scale-105 transition-all duration-300"
            >
              Share Location
            </EnhancedButton>
          </div>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16 animate-fade-in-up hero-cta-buttons">
            <EnhancedButton
              id="launch_dashboard"
              variant="primary"
              size="lg"
              icon={<ArrowRight className="w-5 h-5" />}
              onClick={handleLaunchDashboard}
              className="bg-primary text-white hover:bg-opacity-90 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-2xl"
            >
              Launch Dashboard
            </EnhancedButton>

            <EnhancedButton
              id="watch_demo"
              variant="secondary"
              size="lg"
              icon={<Play className="w-5 h-5" />}
              onClick={handleWatchDemo}
              className="border-2 border-border text-text hover:border-primary hover:text-primary transition-all duration-200"
            >
              Watch Demo
            </EnhancedButton>
          </div>

          {/* Animated stats */}
          <div className="mb-16 animate-fade-in-up hero-stats">
            <div className="bg-surface bg-opacity-50 backdrop-blur-sm rounded-2xl p-6 border border-border inline-block">
              <div className="text-3xl font-bold text-primary mb-2">
                {stats[currentStat].value}
              </div>
              <div className="text-textSecondary">
                {stats[currentStat].label}
              </div>
            </div>
          </div>
          
          {/* Feature cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            {[
              {
                icon: Shield,
                title: 'Immutable Records',
                description: 'All warnings are stored on blockchain ensuring permanent, tamper-proof records.',
                color: 'text-primary',
                className: 'hero-feature-1'
              },
              {
                icon: AlertTriangle,
                title: 'Real-time Alerts',
                description: 'Instant warning distribution through smart contracts and decentralized networks.',
                color: 'text-warning',
                className: 'hero-feature-2'
              },
              {
                icon: Globe,
                title: 'Global Network',
                description: 'Decentralized infrastructure ensures warnings reach everyone, everywhere.',
                color: 'text-success',
                className: 'hero-feature-3'
              }
            ].map((feature, index) => (
              <div
                key={index}
                className={`group bg-surface bg-opacity-60 backdrop-blur-sm p-8 rounded-2xl border border-border hover:shadow-2xl transition-all duration-500 hover:transform hover:-translate-y-4 animate-fade-in-up cursor-pointer ${feature.className}`}
                onClick={() => {
                  // Handle feature card click
                  window.location.href = `/${feature.title.toLowerCase().replace(/\s+/g, '-')}`;
                }}
              >
                <div className="relative mb-6">
                  <feature.icon className={`h-12 w-12 ${feature.color} mx-auto group-hover:scale-110 transition-transform duration-300`} />
                  <div className={`absolute inset-0 ${feature.color.replace('text-', 'bg-')} opacity-20 rounded-full blur-xl group-hover:opacity-40 transition-opacity`} />
                </div>
                <h3 className="text-xl font-semibold text-text mb-4 group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                <p className="text-textSecondary leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating Emergency Buttons */}
      <div className="fixed bottom-6 right-6 z-50 space-y-3">
        <EnhancedButton
          id="float_emergency_call"
          variant="danger"
          className="w-16 h-16 rounded-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-2xl animate-pulse"
          onClick={handleEmergencyCall}
        >
          📞
        </EnhancedButton>

        <EnhancedButton
          id="float_emergency_camera"
          variant="warning"
          className="w-16 h-16 rounded-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-2xl"
          onClick={handleEmergencyCamera}
        >
          📹
        </EnhancedButton>

        <EnhancedButton
          id="float_location_share"
          variant="warning"
          className="w-16 h-16 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 shadow-2xl"
          onClick={handleShareLocation}
        >
          📍
        </EnhancedButton>
      </div>
    </section>
  );
};