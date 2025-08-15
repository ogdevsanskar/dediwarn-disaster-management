// Global initialization script for DeDiWARN application
// This ensures all components have proper button functionality

import { initializeButtonFunctionality } from '../components/ButtonFunctionality';

// Interface for PWA install prompt event
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

// Extend HTMLElement interface for storing install event
interface HTMLElementWithInstallEvent extends HTMLElement {
  installEvent?: BeforeInstallPromptEvent;
}

// Initialize app-wide functionality
export const initializeApp = () => {
  console.log('🚀 Initializing DeDiWARN Application...');
  
  // Initialize button functionality system
  initializeButtonFunctionality();
  
  // Setup global event listeners
  setupGlobalEventListeners();
  
  // Initialize PWA features
  initializePWAFeatures();
  
  // Setup emergency hotkeys
  setupEmergencyHotkeys();
  
  // Initialize offline capabilities
  initializeOfflineCapabilities();
  
  console.log('✅ DeDiWARN Application initialized successfully!');
};

// Setup global event listeners for emergency scenarios
const setupGlobalEventListeners = () => {
  // Global emergency call shortcut (Ctrl+E)
  document.addEventListener('keydown', (event) => {
    if (event.ctrlKey && event.key === 'e') {
      event.preventDefault();
      window.open('tel:6001163688', '_self');
    }
    
    // Global camera shortcut (Ctrl+C)
    if (event.ctrlKey && event.key === 'c' && event.shiftKey) {
      event.preventDefault();
      startEmergencyCamera();
    }
    
    // Global location sharing (Ctrl+L)
    if (event.ctrlKey && event.key === 'l') {
      event.preventDefault();
      shareEmergencyLocation();
    }
  });
  
  // Handle visibility change for emergency scenarios
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      // Check for emergency notifications when app becomes visible
      checkEmergencyNotifications();
    }
  });
  
  // Handle online/offline status
  window.addEventListener('online', handleOnlineStatus);
  window.addEventListener('offline', handleOfflineStatus);
};

// PWA features initialization
const initializePWAFeatures = () => {
  // Register service worker for offline functionality
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('ServiceWorker registered:', registration);
      })
      .catch(error => {
        console.log('ServiceWorker registration failed:', error);
      });
  }
  
  // Handle app install prompt
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    showInstallPrompt(event as BeforeInstallPromptEvent);
  });
  
  // Request notification permission
  if ('Notification' in window) {
    Notification.requestPermission().then(permission => {
      console.log('Notification permission:', permission);
    });
  }
};

// Emergency hotkey setup
const setupEmergencyHotkeys = () => {
  const hotkeys: Record<string, () => void> = {
    'F1': () => { window.open('tel:6001163688', '_self'); },
    'F2': () => { startEmergencyCamera(); },
    'F3': () => { shareEmergencyLocation(); },
    'F4': () => { window.location.href = '/video-call'; },
    'Escape': () => { showEmergencyMenu(); }
  };
  
  document.addEventListener('keydown', (event) => {
    const handler = hotkeys[event.key];
    if (handler) {
      event.preventDefault();
      handler();
    }
  });
};

// Emergency camera function
const startEmergencyCamera = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    
    // Create emergency video overlay
    const videoContainer = document.createElement('div');
    videoContainer.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.9);
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
    `;
    
    const video = document.createElement('video');
    video.srcObject = stream;
    video.autoplay = true;
    video.muted = true;
    video.style.cssText = `
      width: 80%;
      max-width: 600px;
      height: auto;
      border: 3px solid #ef4444;
      border-radius: 12px;
      box-shadow: 0 25px 50px rgba(0,0,0,0.5);
    `;
    
    // Emergency controls
    const controls = document.createElement('div');
    controls.style.cssText = `
      display: flex;
      gap: 15px;
      margin-top: 20px;
      z-index: 10001;
    `;
    
    const recordButton = createEmergencyButton('🔴 Record', () => startRecording(stream));
    const callButton = createEmergencyButton('📞 Call 6001163688', () => window.open('tel:6001163688', '_self'));
    const closeButton = createEmergencyButton('❌ Close', () => {
      stream.getTracks().forEach(track => track.stop());
      document.body.removeChild(videoContainer);
    });
    
    controls.appendChild(recordButton);
    controls.appendChild(callButton);
    controls.appendChild(closeButton);
    
    videoContainer.appendChild(video);
    videoContainer.appendChild(controls);
    document.body.appendChild(videoContainer);
    
  } catch (error) {
    console.error('Camera access denied:', error);
    alert('Camera access denied. Please check permissions and try again.');
  }
};

// Create emergency button helper
const createEmergencyButton = (text: string, onClick: () => void) => {
  const button = document.createElement('button');
  button.textContent = text;
  button.style.cssText = `
    background: linear-gradient(135deg, #ef4444, #dc2626);
    color: white;
    border: none;
    padding: 12px 20px;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(239,68,68,0.4);
  `;
  
  button.addEventListener('mouseover', () => {
    button.style.transform = 'translateY(-2px)';
    button.style.boxShadow = '0 8px 25px rgba(239,68,68,0.6)';
  });
  
  button.addEventListener('mouseout', () => {
    button.style.transform = 'translateY(0)';
    button.style.boxShadow = '0 4px 15px rgba(239,68,68,0.4)';
  });
  
  button.addEventListener('click', onClick);
  
  return button;
};

// Start recording function
const startRecording = (stream: MediaStream) => {
  const mediaRecorder = new MediaRecorder(stream);
  const chunks: BlobPart[] = [];
  
  mediaRecorder.ondataavailable = (event) => chunks.push(event.data);
  mediaRecorder.onstop = () => {
    const blob = new Blob(chunks, { type: 'video/webm' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `emergency-recording-${Date.now()}.webm`;
    a.click();
    URL.revokeObjectURL(url);
  };
  
  mediaRecorder.start();
  
  // Auto-stop after 5 minutes
  setTimeout(() => {
    if (mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
    }
  }, 300000);
  
  // Show recording indicator
  showRecordingIndicator();
};

// Share emergency location
const shareEmergencyLocation = () => {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      const locationUrl = `https://maps.google.com/?q=${latitude},${longitude}`;
      const message = `🚨 EMERGENCY LOCATION: ${locationUrl}\nRequesting immediate assistance!`;
      
      // Try to share via Web Share API
      if (navigator.share) {
        navigator.share({
          title: '🚨 Emergency Location',
          text: message,
          url: locationUrl
        });
      } else {
        // Fallback to clipboard
        navigator.clipboard.writeText(message).then(() => {
          showNotification('Emergency location copied to clipboard!', 'success');
        });
      }
      
      // Also try to send SMS
      const smsUrl = `sms:6001163688?body=${encodeURIComponent(message)}`;
      window.open(smsUrl, '_blank');
    },
    (error) => {
      console.error('Location error:', error);
      alert('Unable to get location. Please check location permissions.');
    },
    { enableHighAccuracy: true, timeout: 10000 }
  );
};

// Show emergency menu
const showEmergencyMenu = () => {
  const menu = document.createElement('div');
  menu.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: linear-gradient(135deg, #1e293b, #334155);
    border: 2px solid #ef4444;
    border-radius: 16px;
    padding: 30px;
    z-index: 10000;
    box-shadow: 0 25px 50px rgba(0,0,0,0.7);
    backdrop-filter: blur(10px);
  `;
  
  menu.innerHTML = `
    <h2 style="color: #ef4444; text-align: center; margin-bottom: 20px; font-size: 24px; font-weight: bold;">
      🚨 Emergency Menu
    </h2>
    <div style="display: grid; gap: 15px; min-width: 300px;">
      <button onclick="window.open('tel:6001163688', '_self')" style="background: linear-gradient(135deg, #ef4444, #dc2626); color: white; border: none; padding: 15px; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 16px;">
        📞 Call Emergency: 6001163688
      </button>
      <button onclick="window.location.href='/video-call'" style="background: linear-gradient(135deg, #3b82f6, #2563eb); color: white; border: none; padding: 15px; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 16px;">
        🎥 Start Video Call
      </button>
      <button onclick="window.startEmergencyCamera?.()" style="background: linear-gradient(135deg, #f97316, #ea580c); color: white; border: none; padding: 15px; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 16px;">
        📹 Emergency Camera
      </button>
      <button onclick="window.shareEmergencyLocation?.()" style="background: linear-gradient(135deg, #eab308, #ca8a04); color: white; border: none; padding: 15px; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 16px;">
        📍 Share Location
      </button>
      <button onclick="document.body.removeChild(this.closest('div'))" style="background: linear-gradient(135deg, #6b7280, #4b5563); color: white; border: none; padding: 15px; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 16px;">
        ❌ Close
      </button>
    </div>
  `;
  
  document.body.appendChild(menu);
  
  // Auto-close after 30 seconds
  setTimeout(() => {
    if (document.body.contains(menu)) {
      document.body.removeChild(menu);
    }
  }, 30000);
};

// Recording indicator
const showRecordingIndicator = () => {
  const indicator = document.createElement('div');
  indicator.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: #ef4444;
    color: white;
    padding: 10px 20px;
    border-radius: 20px;
    z-index: 10001;
    font-weight: 600;
    animation: pulse 2s infinite;
  `;
  indicator.textContent = '🔴 Recording Emergency Video...';
  
  document.body.appendChild(indicator);
  
  // Remove after recording stops
  setTimeout(() => {
    if (document.body.contains(indicator)) {
      document.body.removeChild(indicator);
    }
  }, 300000);
};

// Notification helper
const showNotification = (message: string, type: 'success' | 'error' | 'warning' = 'success') => {
  const colors = {
    success: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b'
  };
  
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${colors[type]};
    color: white;
    padding: 15px 20px;
    border-radius: 8px;
    z-index: 10000;
    font-weight: 600;
    max-width: 350px;
    box-shadow: 0 10px 25px rgba(0,0,0,0.3);
  `;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    if (document.body.contains(notification)) {
      document.body.removeChild(notification);
    }
  }, 5000);
};

// Handle online status
const handleOnlineStatus = () => {
  showNotification('🟢 Back online! Emergency services available.', 'success');
};

// Handle offline status
const handleOfflineStatus = () => {
  showNotification('🔴 Offline mode. Emergency calls still work: 6001163688', 'warning');
};

// Check emergency notifications
const checkEmergencyNotifications = () => {
  // This would check for pending emergency alerts
  console.log('Checking for emergency notifications...');
};

// Show install prompt
const showInstallPrompt = (installEvent: BeforeInstallPromptEvent) => {
  const prompt = document.createElement('div');
  prompt.style.cssText = `
    position: fixed;
    bottom: 20px;
    left: 20px;
    background: linear-gradient(135deg, #3b82f6, #2563eb);
    color: white;
    padding: 15px;
    border-radius: 12px;
    z-index: 10000;
    max-width: 300px;
    box-shadow: 0 10px 25px rgba(0,0,0,0.3);
  `;
  
  prompt.innerHTML = `
    <div style="font-weight: 600; margin-bottom: 10px;">Install DeDiWARN App</div>
    <div style="font-size: 14px; margin-bottom: 15px;">Get faster access and offline emergency features</div>
    <div style="display: flex; gap: 10px;">
      <button onclick="installEvent.prompt().then(() => document.body.removeChild(this.closest('div')))" style="background: white; color: #3b82f6; border: none; padding: 8px 15px; border-radius: 6px; font-weight: 600; cursor: pointer;">
        Install
      </button>
      <button onclick="document.body.removeChild(this.closest('div'))" style="background: transparent; color: white; border: 1px solid white; padding: 8px 15px; border-radius: 6px; font-weight: 600; cursor: pointer;">
        Later
      </button>
    </div>
  `;
  
  // Store the event for the install button
  (prompt as HTMLElementWithInstallEvent).installEvent = installEvent;
  
  document.body.appendChild(prompt);
};

// Offline capabilities
const initializeOfflineCapabilities = () => {
  // Store emergency numbers for offline access
  localStorage.setItem('emergency-numbers', JSON.stringify({
    primary: '6001163688',
    police: '100',
    fire: '101',
    ambulance: '108',
    disaster: '1077'
  }));
  
  // Store offline emergency guide
  localStorage.setItem('emergency-guide', JSON.stringify({
    steps: [
      'Stay calm and assess the situation',
      'Call emergency number: 6001163688',
      'Share your location if possible',
      'Follow emergency responder instructions',
      'Use app offline features if needed'
    ]
  }));
};

// Extend window interface for emergency functions
declare global {
  interface Window {
    startEmergencyCamera?: () => void;
    shareEmergencyLocation?: () => void;
  }
}

// Make functions globally available for emergency menu
window.startEmergencyCamera = startEmergencyCamera;
window.shareEmergencyLocation = shareEmergencyLocation;

export default { initializeApp };
