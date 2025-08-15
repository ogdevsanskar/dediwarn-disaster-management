/* eslint-disable react-refresh/only-export-components */
import React, { useState } from 'react';
import { 
  RefreshCw
} from 'lucide-react';

// Global button functionality manager
export class ButtonFunctionality {
  private static instance: ButtonFunctionality;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private callbacks: Map<string, (...args: any[]) => any> = new Map();
  private analytics: Map<string, number> = new Map();

  public static getInstance(): ButtonFunctionality {
    if (!ButtonFunctionality.instance) {
      ButtonFunctionality.instance = new ButtonFunctionality();
    }
    return ButtonFunctionality.instance;
  }

  // Register button action
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public registerAction(buttonId: string, callback: (...args: any[]) => any): void {
    this.callbacks.set(buttonId, callback);
  }

  // Execute button action
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public executeAction(buttonId: string, ...args: any[]): void {
    const callback = this.callbacks.get(buttonId);
    if (callback) {
      callback(...args);
      this.trackClick(buttonId);
    } else {
      console.warn(`No action registered for button: ${buttonId}`);
    }
  }

  // Track button clicks for analytics
  private trackClick(buttonId: string): void {
    const currentCount = this.analytics.get(buttonId) || 0;
    this.analytics.set(buttonId, currentCount + 1);
  }

  // Get analytics data
  public getAnalytics(): Map<string, number> {
    return this.analytics;
  }
}

// Emergency Actions
export const emergencyActions = {
  // Call emergency number
  callEmergency: (number: string = "6001163688") => {
    console.log(`Calling emergency number: ${number}`);
    window.open(`tel:${number}`, '_self');
  },

  // Send emergency SMS
  sendEmergencySMS: (number: string = "6001163688", message: string = "EMERGENCY: Need immediate assistance") => {
    const smsUrl = `sms:${number}?body=${encodeURIComponent(message)}`;
    window.open(smsUrl, '_self');
  },

  // Share location
  shareLocation: async () => {
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });
      
      const { latitude, longitude } = position.coords;
      const locationUrl = `https://maps.google.com/?q=${latitude},${longitude}`;
      
      if (navigator.share) {
        await navigator.share({
          title: 'My Emergency Location',
          text: 'I need help at this location',
          url: locationUrl
        });
      } else {
        navigator.clipboard.writeText(locationUrl);
        alert('Location copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing location:', error);
      alert('Unable to get location. Please check permissions.');
    }
  },

  // Start camera for emergency reporting
  startCamera: async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      // Create a video element to show camera feed
      const video = document.createElement('video');
      video.srcObject = stream;
      video.autoplay = true;
      video.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:10000;width:80%;max-width:500px;border:3px solid red;border-radius:10px;';
      
      // Add close button
      const closeBtn = document.createElement('button');
      closeBtn.innerHTML = '×';
      closeBtn.style.cssText = 'position:absolute;top:-10px;right:-10px;width:30px;height:30px;background:red;color:white;border:none;border-radius:50%;font-size:20px;cursor:pointer;';
      closeBtn.onclick = () => {
        stream.getTracks().forEach(track => track.stop());
        document.body.removeChild(video);
      };
      
      video.appendChild(closeBtn);
      document.body.appendChild(video);
      
      return stream;
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Unable to access camera. Please check permissions.');
    }
  },

  // Start microphone for voice emergency
  startMicrophone: async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];
      
      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `emergency-recording-${Date.now()}.wav`;
        a.click();
      };
      
      mediaRecorder.start();
      
      // Auto-stop after 30 seconds
      setTimeout(() => {
        mediaRecorder.stop();
        stream.getTracks().forEach(track => track.stop());
      }, 30000);
      
      alert('Recording emergency message... Will auto-stop in 30 seconds.');
      
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Unable to access microphone. Please check permissions.');
    }
  }
};

// Communication Actions
export const communicationActions = {
  // Open video call system
  openVideoCall: () => {
    // This would open the VideoCallSystem component
    window.location.href = '/video-call';
  },

  // Send message to emergency services
  sendMessage: (message: string, priority: 'low' | 'medium' | 'high' | 'critical' = 'high') => {
    const messageData = {
      text: message,
      priority,
      timestamp: new Date().toISOString(),
      location: 'current_location'
    };
    
    console.log('Sending emergency message:', messageData);
    // In production, this would send to emergency services
  },

  // Join emergency chat
  joinEmergencyChat: () => {
    console.log('Joining emergency chat...');
    // Would open emergency chat interface
  }
};

// Data Actions
export const dataActions = {
  // Download emergency data
  downloadData: (type: string) => {
    const data = {
      type,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      location: 'user_location'
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `emergency-${type}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },

  // Upload file
  uploadFile: (acceptedTypes: string = '*') => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = acceptedTypes;
    input.multiple = true;
    
    input.onchange = (event) => {
      const files = (event.target as HTMLInputElement).files;
      if (files) {
        Array.from(files).forEach(file => {
          console.log(`Uploading file: ${file.name}`);
          // Handle file upload logic here
        });
      }
    };
    
    input.click();
  },

  // Export report
  exportReport: (data: Record<string, unknown>, filename: string = 'emergency-report') => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
};

// Navigation Actions
export const navigationActions = {
  // Navigate to page
  navigateTo: (path: string) => {
    window.location.href = path;
  },

  // Go back
  goBack: () => {
    window.history.back();
  },

  // Refresh page
  refresh: () => {
    window.location.reload();
  },

  // Open external link
  openExternal: (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
};

// UI Actions
export const uiActions = {
  // Show notification
  showNotification: (title: string, message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    // Browser notification
    if (Notification.permission === 'granted') {
      new Notification(title, {
        body: message,
        icon: '/icon-192.png'
      });
    }
    
    // Custom toast notification
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm ${
      type === 'error' ? 'bg-red-500' :
      type === 'warning' ? 'bg-yellow-500' :
      type === 'success' ? 'bg-green-500' : 'bg-blue-500'
    } text-white`;
    
    toast.innerHTML = `
      <div class="font-semibold">${title}</div>
      <div class="text-sm">${message}</div>
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      if (document.body.contains(toast)) {
        document.body.removeChild(toast);
      }
    }, 5000);
  },

  // Toggle theme
  toggleTheme: () => {
    const isDark = document.documentElement.classList.contains('dark');
    document.documentElement.classList.toggle('dark', !isDark);
    localStorage.setItem('theme', isDark ? 'light' : 'dark');
  },

  // Show modal
  showModal: (content: string, title: string = 'Information') => {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50';
    modal.innerHTML = `
      <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 class="text-lg font-semibold mb-4">${title}</h3>
        <div class="text-gray-700 mb-4">${content}</div>
        <button onclick="this.closest('.fixed').remove()" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          Close
        </button>
      </div>
    `;
    document.body.appendChild(modal);
  }
};

// Search and Filter Actions
export const searchActions = {
  // Perform search
  search: (query: string, type: string = 'general') => {
    console.log(`Searching for: ${query} in ${type}`);
    // Implement search logic
  },

  // Apply filter
  applyFilter: (filters: Record<string, unknown>) => {
    console.log('Applying filters:', filters);
    // Implement filter logic
  },

  // Sort data
  sortData: (field: string, direction: 'asc' | 'desc') => {
    console.log(`Sorting by ${field} ${direction}`);
    // Implement sort logic
  }
};

// Initialize all button functionality
export const initializeButtonFunctionality = () => {
  const buttonManager = ButtonFunctionality.getInstance();
  
  // Register all emergency actions
  Object.entries(emergencyActions).forEach(([key, action]) => {
    buttonManager.registerAction(`emergency_${key}`, action);
  });
  
  // Register all communication actions
  Object.entries(communicationActions).forEach(([key, action]) => {
    buttonManager.registerAction(`comm_${key}`, action);
  });
  
  // Register all data actions
  Object.entries(dataActions).forEach(([key, action]) => {
    buttonManager.registerAction(`data_${key}`, action);
  });
  
  // Register all navigation actions
  Object.entries(navigationActions).forEach(([key, action]) => {
    buttonManager.registerAction(`nav_${key}`, action);
  });
  
  // Register all UI actions
  Object.entries(uiActions).forEach(([key, action]) => {
    buttonManager.registerAction(`ui_${key}`, action);
  });
  
  // Register all search actions
  Object.entries(searchActions).forEach(([key, action]) => {
    buttonManager.registerAction(`search_${key}`, action);
  });
  
  console.log('Button functionality initialized');
};

// Enhanced Button Component
interface EnhancedButtonProps {
  id: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  children: React.ReactNode;
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  className?: string;
}

export const EnhancedButton: React.FC<EnhancedButtonProps> = ({
  id,
  variant = 'primary',
  size = 'md',
  icon,
  children,
  disabled = false,
  loading = false,
  onClick,
  className = ''
}) => {
  const [clicked, setClicked] = useState(false);
  
  const handleClick = () => {
    if (disabled || loading) return;
    
    setClicked(true);
    setTimeout(() => setClicked(false), 150);
    
    const buttonManager = ButtonFunctionality.getInstance();
    
    if (onClick) {
      onClick();
    } else {
      buttonManager.executeAction(id);
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-blue-500 hover:bg-blue-600 text-white';
      case 'secondary':
        return 'bg-gray-500 hover:bg-gray-600 text-white';
      case 'danger':
        return 'bg-red-500 hover:bg-red-600 text-white';
      case 'success':
        return 'bg-green-500 hover:bg-green-600 text-white';
      case 'warning':
        return 'bg-yellow-500 hover:bg-yellow-600 text-white';
      default:
        return 'bg-blue-500 hover:bg-blue-600 text-white';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-1.5 text-sm';
      case 'md':
        return 'px-4 py-2 text-base';
      case 'lg':
        return 'px-6 py-3 text-lg';
      default:
        return 'px-4 py-2 text-base';
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled || loading}
      className={`
        ${getVariantClasses()}
        ${getSizeClasses()}
        ${clicked ? 'scale-95' : 'scale-100'}
        ${disabled || loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        inline-flex items-center justify-center space-x-2 rounded-lg font-medium
        transition-all duration-150 ease-in-out transform
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
        ${className}
      `}
    >
      {loading ? (
        <RefreshCw className="w-4 h-4 animate-spin" />
      ) : icon ? (
        <span>{icon}</span>
      ) : null}
      <span>{children}</span>
    </button>
  );
};

export default {
  ButtonFunctionality,
  emergencyActions,
  communicationActions,
  dataActions,
  navigationActions,
  uiActions,
  searchActions,
  initializeButtonFunctionality,
  EnhancedButton
};
