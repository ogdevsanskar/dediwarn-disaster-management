import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Home } from './pages/Home';
import { Warnings } from './pages/Warnings';
import { SmartContracts } from './pages/SmartContracts';
import { Analytics } from './pages/Analytics';
import { EmergencyCenter } from './pages/EmergencyCenter';
import { Donations } from './pages/Donations';
import { Volunteers } from './pages/Volunteers';
import { Dashboard } from './components/Dashboard';
import { MainDashboard } from './components/MainDashboard';
import { AnimatedBackground } from './components/AnimatedBackground';
import { AIAssistant } from './components/AIAssistant';
import { NotificationCenter } from './components/NotificationCenter';
import ReportIncident from './components/ReportIncident';
import Collaboration from './pages/Collaboration';
import EnhancedDashboard from './pages/EnhancedDashboard';
import EducationGamification from './pages/EducationGamification';
import { initializeButtonFunctionality } from './components/ButtonFunctionality';
import { AppNotification } from './types';

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
}

function App() {
  const [userLocation, setUserLocation] = useState({ lat: 0, lng: 0 });
  const [userRole, setUserRole] = useState<'authority' | 'volunteer' | 'citizen'>('citizen');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [showRoleSelector, setShowRoleSelector] = useState(false);

  useEffect(() => {
    // Initialize button functionality
    initializeButtonFunctionality();
    
    // Initialize PWA features
    initializePWA();
    
    // Get user location
    getCurrentLocation();
    
    // Set up online/offline detection
    window.addEventListener('online', () => setIsOnline(true));
    window.addEventListener('offline', () => setIsOnline(false));
    
    // Request notification permission
    requestNotificationPermission();
    
    return () => {
      window.removeEventListener('online', () => setIsOnline(true));
      window.removeEventListener('offline', () => setIsOnline(false));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initializePWA = () => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
          
          // Check for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New content available
                  showUpdateNotification();
                }
              });
            }
          });
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    }

    // Handle app install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      showInstallPrompt(e as InstallPromptEvent);
    });
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Location error:', error);
          // Default to a safe location if needed
          setUserLocation({ lat: 28.6139, lng: 77.2090 }); // Delhi
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 600000 }
      );
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window && 'serviceWorker' in navigator) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        // Subscribe to push notifications
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: import.meta.env.VITE_VAPID_PUBLIC_KEY
        });
        
        // Send subscription to server
        await fetch('/api/subscribe-notifications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subscription,
            location: userLocation,
            role: userRole
          })
        });
      }
    }
  };

  const showUpdateNotification = () => {
    const notification = {
      id: Date.now(),
      type: 'app_update' as const,
      title: 'App Update Available',
      message: 'A new version of DeDiWARN is available. Refresh to update.',
      severity: 'medium' as const,
      timestamp: new Date().toISOString(),
      actions: [
        { label: 'Refresh Now', action: () => window.location.reload() },
        { label: 'Later', action: () => {} }
      ]
    };
    setNotifications(prev => [notification, ...prev]);
  };

  const showInstallPrompt = (event: InstallPromptEvent) => {
    const notification = {
      id: Date.now(),
      type: 'app_install' as const,
      title: 'Install DeDiWARN',
      message: 'Install the app for faster access and offline capabilities.',
      severity: 'low' as const,
      timestamp: new Date().toISOString(),
      actions: [
        { label: 'Install', action: () => event.prompt() },
        { label: 'Not Now', action: () => {} }
      ]
    };
    setNotifications(prev => [notification, ...prev]);
  };

  return (
    <Router>
      <div className="min-h-screen bg-slate-900 text-white relative overflow-x-hidden">
        <AnimatedBackground />
        
        {/* Online/Offline Status */}
        {!isOnline && (
          <div className="fixed top-0 left-0 right-0 bg-red-600 text-white text-center py-2 z-50">
            <span className="text-sm">📶 You're offline. Emergency numbers still work: 911, 108, 101, 100</span>
          </div>
        )}
        
        <Header />
        
        {/* Role Selector */}
        {showRoleSelector && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-slate-800 p-6 rounded-lg border border-slate-600">
              <h3 className="text-lg font-semibold mb-4">Select Your Role</h3>
              <div className="space-y-2">
                {(['citizen', 'volunteer', 'authority'] as const).map((role) => (
                  <button
                    key={role}
                    onClick={() => {
                      setUserRole(role);
                      setShowRoleSelector(false);
                    }}
                    className={`w-full p-3 rounded text-left hover:bg-slate-700 ${
                      userRole === role ? 'bg-blue-600' : 'bg-slate-700'
                    }`}
                  >
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* Current Role Display */}
        <div className="fixed top-20 left-4 z-40">
          <button
            onClick={() => setShowRoleSelector(true)}
            className="bg-slate-800/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm border border-slate-600 hover:border-blue-400"
          >
            Role: {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
          </button>
        </div>
        
        {/* Notification Center */}
        <NotificationCenter
          notifications={notifications}
          onDismiss={(id) => setNotifications(prev => prev.filter(n => n.id !== id))}
          onClearAll={() => setNotifications([])}
        />
        
        <main className={`relative z-10 ${!isOnline ? 'pt-12' : ''}`}>
          <Routes>
            <Route path="/" element={<MainDashboard userLocation={userLocation} />} />
            <Route path="/home" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/report-incident" element={<ReportIncident />} />
            <Route path="/warnings" element={<Warnings />} />
            <Route path="/contracts" element={<SmartContracts />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/emergency-communication" element={<EmergencyCenter />} />
            <Route path="/donations" element={<Donations />} />
            <Route path="/volunteers" element={<Volunteers />} />
            <Route path="/collaboration" element={<Collaboration />} />
            <Route path="/enhanced-dashboard" element={<EnhancedDashboard />} />
            <Route path="/education" element={<EducationGamification />} />
          </Routes>
        </main>
        
        <AIAssistant />
        
        {/* Enhanced Footer with emergency features */}
        <footer className="relative z-10 bg-slate-800/50 backdrop-blur-sm border-t border-slate-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="animate-fade-in-up">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">D</span>
                  </div>
                  <h3 className="text-lg font-semibold text-white">DeDiWARN</h3>
                </div>
                <p className="text-slate-400 mb-4">
                  Decentralized digital warning system powered by blockchain technology for a safer world.
                </p>
                
                {/* Emergency Contacts */}
                <div className="bg-red-600/20 border border-red-400 rounded-lg p-3 mb-4">
                  <h4 className="text-red-400 font-semibold text-sm mb-2">🚨 EMERGENCY HOTLINES</h4>
                  <div className="space-y-1 text-xs">
                    <div>Police: <a href="tel:100" className="text-white font-bold hover:text-blue-400">100</a></div>
                    <div>Fire: <a href="tel:101" className="text-white font-bold hover:text-blue-400">101</a></div>
                    <div>Ambulance: <a href="tel:108" className="text-white font-bold hover:text-blue-400">108</a></div>
                    <div>Disaster: <a href="tel:1077" className="text-white font-bold hover:text-blue-400">1077</a></div>
                  </div>
                </div>
                
                <div className="flex space-x-4">
                  {['T', 'G', 'D', 'TG'].map((social, index) => (
                    <div
                      key={index}
                      className="w-10 h-10 bg-slate-700 rounded-lg flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all duration-200 cursor-pointer hover:scale-110"
                    >
                      <span className="text-sm font-medium">{social}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              {[
                {
                  title: 'Platform',
                  links: ['Warnings', 'Smart Contracts', 'API Documentation', 'Network Status']
                },
                {
                  title: 'Resources',
                  links: ['White Paper', 'Developer Guide', 'Community', 'Support']
                },
                {
                  title: 'Networks',
                  links: ['Ethereum Mainnet', 'Polygon', 'BSC', 'Avalanche']
                }
              ].map((section, index) => (
                <div key={section.title} className={`animate-fade-in-up animation-delay-${(index + 1) * 100}`}>
                  <h4 className="font-semibold text-white mb-4">{section.title}</h4>
                  <ul className="space-y-2">
                    {section.links.map((link) => (
                      <li key={link}>
                        <a
                          href="#"
                          className="text-slate-400 hover:text-blue-400 transition-colors duration-200 hover:translate-x-1 transform inline-block"
                        >
                          {link}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            
            <div className="border-t border-slate-700 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center animate-fade-in-up animation-delay-500">
              <p className="text-slate-400 text-center md:text-left">
                &copy; 2024 DeDiWARN. All rights reserved. Built with ❤️ for a safer world.
              </p>
              <div className="flex items-center space-x-6 mt-4 md:mt-0">
                <a href="#" className="text-slate-400 hover:text-blue-400 transition-colors">Privacy Policy</a>
                <a href="#" className="text-slate-400 hover:text-blue-400 transition-colors">Terms of Service</a>
                <a href="#" className="text-slate-400 hover:text-blue-400 transition-colors">Cookie Policy</a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;