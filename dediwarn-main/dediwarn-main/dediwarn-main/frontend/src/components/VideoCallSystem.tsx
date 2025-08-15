import React, { useState, useEffect, useRef } from 'react';
import { 
  Phone, 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  PhoneOff, 
  Camera, 
  CameraOff,
  Users,
  Volume2,
  VolumeX,
  AlertTriangle,
  Shield,
  MapPin,
  Clock,
  Heart,
  Zap,
  Brain
} from 'lucide-react';
import RealTimeDataDisplay from './RealTimeDataDisplay';
import AIRiskDashboard from './AIRiskDashboard';
import { 
  globalRateLimiter, 
  InputSanitizer, 
  EmergencyCallVerifier 
} from '../security/securityMiddleware';
import EmergencyContactsSystem, { 
  LocalEmergencyNumbers 
} from '../services/EmergencyContactsSystem';

// Use the types from EmergencyContactsSystem to avoid conflicts
import type { 
  EmergencyContact as EContact, 
  MedicalInfo as EMedicalInfo 
} from '../services/EmergencyContactsSystem';

interface VideoCallSystemProps {
  emergencyNumber?: string;
  userLocation?: { lat: number; lng: number };
  emergencyType?: string;
  userProfile?: {
    name?: string;
    medicalInfo?: EMedicalInfo;
    emergencyContacts?: EContact[];
  };
  onPanicActivated?: () => void;
  onLocationShared?: (location: { lat: number; lng: number }) => void;
}

const VideoCallSystem: React.FC<VideoCallSystemProps> = ({
  emergencyNumber = "6001163688", // Real emergency number provided
  userLocation,
  emergencyType = "general",
  userProfile,
  onPanicActivated,
  onLocationShared
}) => {
  // Call States
  const [isCallActive, setIsCallActive] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [callStatus, setCallStatus] = useState<'idle' | 'connecting' | 'connected' | 'ended'>('idle');
  
  // Emergency States
  const [isPanicMode, setIsPanicMode] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [emergencyContacts] = useState<EContact[]>(
    userProfile?.emergencyContacts || []
  );
  const [locationSharing, setLocationSharing] = useState(false);
  
  // Emergency Contacts System
  const [detectedCountry, setDetectedCountry] = useState<string>('US');
  const [localEmergencyNumbers, setLocalEmergencyNumbers] = useState<LocalEmergencyNumbers>({
    police: '911',
    fire: '911',
    medical: '911',
    general: '911',
    country: 'United States',
    countryCode: 'US'
  });
  const [medicalInfo] = useState<EMedicalInfo | null>(
    userProfile?.medicalInfo || null
  );
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  // Location Detection Effect
  useEffect(() => {
    if (locationSharing) {
      setIsLoadingLocation(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          // Automatically detects country and gets local numbers
          const country = EmergencyContactsSystem.detectCountryFromGPS(latitude, longitude);
          const numbers = await EmergencyContactsSystem.getLocalEmergencyNumbers(latitude, longitude);
          
          setDetectedCountry(country);
          setLocalEmergencyNumbers(numbers);
          setIsLoadingLocation(false);
        },
        (error) => {
          console.error('Location detection failed:', error);
          setIsLoadingLocation(false);
        }
      );
    }
  }, [locationSharing]);
  
  // Media States
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isSpeakerEnabled, setIsSpeakerEnabled] = useState(false);
  const [cameraFacing, setCameraFacing] = useState<'user' | 'environment'>('user');
  
  // UI States
  const [connectionQuality, setConnectionQuality] = useState<'excellent' | 'good' | 'poor' | 'disconnected'>('excellent');
  const [highContrastMode, setHighContrastMode] = useState(false);
  const [showRealTimeData] = useState(true);
  const [realTimeDataMinimized, setRealTimeDataMinimized] = useState(false);
  
  // AI Risk Assessment States
  const [showAIRiskDashboard, setShowAIRiskDashboard] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState<number>(0);
  
  // Security & Rate Limiting
  const [callAttempts, setCallAttempts] = useState(0);
  const maxCallAttempts = 3;

  // Refs for media elements
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const callTimerRef = useRef<NodeJS.Timeout | null>(null);

  // WebRTC Configuration
  const rtcConfig = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' }
    ]
  };

  useEffect(() => {
    // Initialize accessibility features
    setupAccessibility();
    
    // Setup emergency hotkeys
    const handleKeyDown = (event: KeyboardEvent) => {
      // Emergency panic button (Ctrl + Shift + E)
      if (event.ctrlKey && event.shiftKey && event.key === 'E') {
        event.preventDefault();
        handlePanicButton();
      }
      // Quick call emergency (Ctrl + Shift + C)
      if (event.ctrlKey && event.shiftKey && event.key === 'C') {
        event.preventDefault();
        handleQuickCall();
      }
      // Toggle high contrast (Ctrl + Shift + H)
      if (event.ctrlKey && event.shiftKey && event.key === 'H') {
        event.preventDefault();
        setHighContrastMode(prev => !prev);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      endCall();
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
      }
      document.removeEventListener('keydown', handleKeyDown);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Security: Input sanitization
  const sanitizeInput = (input: string): string => {
    return input.replace(/[<>"']/g, '').trim();
  };

  // Security: Rate limiting for calls

  // Setup accessibility features
  const setupAccessibility = () => {
    // Add ARIA labels and screen reader support
    const root = document.documentElement;
    root.setAttribute('data-emergency-system', 'active');
    
    // Announce system status to screen readers
    const announceToScreenReader = (message: string) => {
      const announcement = document.createElement('div');
      announcement.setAttribute('aria-live', 'assertive');
      announcement.setAttribute('aria-atomic', 'true');
      announcement.className = 'sr-only';
      announcement.textContent = message;
      document.body.appendChild(announcement);
      setTimeout(() => document.body.removeChild(announcement), 1000);
    };

    announceToScreenReader('Emergency communication system activated');
  };

  // Enhanced Emergency Panic Button
  const handlePanicButton = async () => {
    if (isPanicMode) return;
    
    setIsPanicMode(true);
    onPanicActivated?.();
    
    try {
      // 1. Immediately call emergency services
      await handleEmergencyCall();
      
      // 2. Send location to emergency contacts
      if (userLocation) {
        await shareLocationWithContacts();
      }
      
      // 3. Start recording audio/video
      await startEmergencyRecording();
      
      // 4. Alert nearby volunteers (would integrate with backend)
      await alertNearbyVolunteers();
      
      // 5. Share live location tracking
      startLocationTracking();
      
    } catch (error) {
      console.error('Emergency panic activation failed:', error);
    }
  };

  // Emergency call with enhanced security verification
  const handleEmergencyCall = async (): Promise<void> => {
    try {
      // Generate unique user identifier for rate limiting
      const userIdentifier = `${userProfile?.name || 'anonymous'}_${navigator.userAgent.slice(-10)}`;
      
      // Check rate limiting with emergency bypass
      const rateLimitCheck = globalRateLimiter.checkRateLimit(userIdentifier, true);
      if (!rateLimitCheck && !isPanicMode) {
        const remainingRequests = globalRateLimiter.getRemainingRequests(userIdentifier);
        alert(`Rate limit exceeded. ${remainingRequests} requests remaining. Emergency calls bypass this limit.`);
        return;
      }

      // Verify emergency call legitimacy
      const verificationResult = await EmergencyCallVerifier.verifyEmergencyCall(
        userIdentifier,
        userLocation,
        emergencyType
      );

      if (!verificationResult.allowed) {
        alert(`Emergency call verification failed: ${verificationResult.reason}`);
        if (verificationResult.attemptsRemaining !== undefined) {
          alert(`Attempts remaining: ${verificationResult.attemptsRemaining}`);
        }
        return;
      }

      // Sanitize emergency type and user inputs
      const sanitizedEmergencyType = InputSanitizer.sanitizeEmergencyType(emergencyType);

      setCallAttempts(prev => prev + 1);
      setCallAttempts(prev => prev + 1);
      // Log security event (for audit trail)
      console.log(`Emergency call initiated: ${new Date().toISOString()}`, {
        userIdentifier: userIdentifier.replace(/[^a-zA-Z0-9_]/g, ''), // Sanitize for logging
        emergencyType: sanitizedEmergencyType,
        location: userLocation ? InputSanitizer.sanitizeCoordinates(userLocation.lat, userLocation.lng) : null,
        isPanic: isPanicMode
      });

      // Get local emergency number based on GPS location
      const localEmergencyNumber = await getLocalEmergencyNumber();
      await startVideoCall(localEmergencyNumber);

    } catch (error) {
      console.error('Emergency call security check failed:', error);
      alert('Emergency call failed security verification. Please try again.');
    }
  };

  // Get local emergency number based on GPS
  const getLocalEmergencyNumber = async (): Promise<string> => {
    if (!userLocation) return emergencyNumber;
    
    try {
      // Use Emergency Contacts System for GPS-based detection
      const numbers = await EmergencyContactsSystem.getLocalEmergencyNumbers(userLocation.lat, userLocation.lng);
      // Return the general emergency number or police if available
      return numbers.general || numbers.police || emergencyNumber;
    } catch (error) {
      console.error('Failed to get local emergency number:', error);
      return emergencyNumber;
    }
  };

  // Share location with emergency contacts - Enhanced Security
  const shareLocationWithContacts = async (): Promise<void> => {
    if (!userLocation || emergencyContacts.length === 0) return;
    
    // Sanitize location coordinates
    const sanitizedLocation = InputSanitizer.sanitizeCoordinates(userLocation.lat, userLocation.lng);
    if (!sanitizedLocation) {
      console.error('Invalid location coordinates');
      return;
    }
    
    // Sanitize user name and create secure message
    const sanitizedUserName = userProfile?.name ? InputSanitizer.sanitizeText(userProfile.name) : 'User';
    const locationMessage = `Emergency Alert: ${sanitizedUserName} needs help. Location: https://maps.google.com/maps?q=${sanitizedLocation.lat},${sanitizedLocation.lng}`;
    
    for (const contact of emergencyContacts) {
      try {
        // Sanitize contact information
        const sanitizedPhone = InputSanitizer.sanitizePhoneNumber(contact.phone);
        const sanitizedMessage = InputSanitizer.sanitizeText(locationMessage);
        
        if (!sanitizedPhone) {
          console.error(`Invalid phone number for contact: ${contact.name}`);
          continue;
        }
        
        // This would integrate with SMS/messaging service
        await fetch('/api/send-emergency-message', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phone: sanitizedPhone,
            message: sanitizedMessage,
            priority: 'emergency',
            timestamp: new Date().toISOString()
          })
        });
      } catch (error) {
        console.error(`Failed to alert ${contact.name}:`, error);
      }
    }
    
    onLocationShared?.(sanitizedLocation);
    setLocationSharing(true);
  };

  // Start emergency recording
  const startEmergencyRecording = async (): Promise<void> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      const mediaRecorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];
      
      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };
      
      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        // Upload to secure emergency storage
        await uploadEmergencyRecording(blob);
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      
      // Auto-stop after 10 minutes to save storage
      setTimeout(() => {
        mediaRecorder.stop();
        setIsRecording(false);
      }, 600000);
      
    } catch (error) {
      console.error('Failed to start emergency recording:', error);
    }
  };

  // Alert nearby volunteers
  const alertNearbyVolunteers = async (): Promise<void> => {
    if (!userLocation) return;
    
    try {
      await fetch('/api/alert-volunteers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: userLocation,
          emergencyType: sanitizeInput(emergencyType),
          userProfile: {
            name: userProfile?.name ? sanitizeInput(userProfile.name) : 'Anonymous',
            medicalInfo: userProfile?.medicalInfo
          },
          timestamp: new Date().toISOString()
        })
      });
    } catch (error) {
      console.error('Failed to alert volunteers:', error);
    }
  };

  // Handle AI Risk Assessment emergency actions
  const handleAIEmergencyAction = (action: string, data: unknown) => {
    const parsedData = data as Record<string, unknown>;
    
    switch (action) {
      case 'prepare-for-disaster':
        console.log('Preparing for disaster:', parsedData);
        // Trigger preparation protocols
        if (typeof parsedData.probability === 'number' && parsedData.probability > 70) {
          setIsPanicMode(true);
          onPanicActivated?.();
        }
        break;
      
      case 'follow-recommendation':
        console.log('Following AI recommendation:', parsedData);
        setAiRecommendations(prev => prev + 1);
        // Execute recommendation actions
        if (parsedData.category === 'evacuate') {
          handleEmergencyCall();
        }
        break;
      
      case 'use-evacuation-route':
        console.log('Using evacuation route:', parsedData);
        // Open navigation or emergency contacts
        if (parsedData.startPoint && typeof parsedData.startPoint === 'object') {
          const location = parsedData.startPoint as { lat: number; lng: number };
          if (typeof location.lat === 'number' && typeof location.lng === 'number') {
            onLocationShared?.(location);
          }
        }
        break;
      
      default:
        console.log('AI Emergency Action:', action, data);
    }
  };
  // Start live location tracking
  const startLocationTracking = (): void => {
    if (!navigator.geolocation) return;
    
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const newLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        
        // Send location updates to emergency services
        fetch('/api/location-update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            location: newLocation,
            timestamp: new Date().toISOString(),
            accuracy: position.coords.accuracy
          })
        }).catch(console.error);
        
        onLocationShared?.(newLocation);
      },
      (error) => console.error('Location tracking error:', error),
      { enableHighAccuracy: true, maximumAge: 30000, timeout: 27000 }
    );
    
    // Clean up tracking after 2 hours
    setTimeout(() => {
      navigator.geolocation.clearWatch(watchId);
    }, 7200000);
  };

  // Upload emergency recording securely
  const uploadEmergencyRecording = async (blob: Blob): Promise<void> => {
    const formData = new FormData();
    formData.append('recording', blob);
    formData.append('timestamp', new Date().toISOString());
    formData.append('location', JSON.stringify(userLocation));
    formData.append('emergencyType', emergencyType);
    
    try {
      await fetch('/api/emergency-recording', {
        method: 'POST',
        body: formData
      });
    } catch (error) {
      console.error('Failed to upload emergency recording:', error);
    }
  };

  // Quick emergency call
  const handleQuickCall = (): void => {
    makePhoneCall(emergencyNumber);
  };

  // Initialize WebRTC peer connection
  const initializePeerConnection = () => {
    peerConnectionRef.current = new RTCPeerConnection(rtcConfig);
    
    peerConnectionRef.current.onicecandidate = (event) => {
      if (event.candidate) {
        // Send ICE candidate to remote peer
        console.log('ICE candidate:', event.candidate);
      }
    };

    peerConnectionRef.current.ontrack = (event) => {
      if (remoteVideoRef.current && event.streams[0]) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    peerConnectionRef.current.onconnectionstatechange = () => {
      const state = peerConnectionRef.current?.connectionState;
      switch (state) {
        case 'connecting':
          setConnectionQuality('poor');
          break;
        case 'connected':
          setConnectionQuality('excellent');
          break;
        case 'disconnected':
        case 'failed':
          setConnectionQuality('disconnected');
          break;
      }
    };
  };

  // Handle start call button click
  const handleStartCall = () => {
    startVideoCall();
  };

  // Start video call
  const startVideoCall = async (customEmergencyNumber?: string) => {
    try {
      setCallStatus('connecting');
      
      // Get user media
      const constraints = {
        video: {
          facingMode: cameraFacing,
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      localStreamRef.current = stream;
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Initialize peer connection
      initializePeerConnection();
      
      // Add stream to peer connection
      stream.getTracks().forEach(track => {
        peerConnectionRef.current?.addTrack(track, stream);
      });

      // For demo purposes, we'll simulate a call to the emergency number
      // In a real implementation, this would connect to a SIP server or WebRTC gateway
      simulateEmergencyCall(customEmergencyNumber);
      
      setIsCallActive(true);
      setCallStatus('connected');
      startCallTimer();
      
    } catch (error) {
      console.error('Error starting video call:', error);
      alert('Unable to access camera/microphone. Please check permissions and try again.');
      setCallStatus('idle');
    }
  };

  // Simulate emergency call connection
  const simulateEmergencyCall = (customEmergencyNumber?: string) => {
    // This simulates connecting to emergency services
    const callNumber = customEmergencyNumber || emergencyNumber;
    console.log(`Connecting video call to emergency number: ${callNumber}`);
    
    // In production, this would:
    // 1. Connect to emergency services via SIP/WebRTC gateway
    // 2. Include location data and emergency type
    // 3. Route to appropriate emergency response center
    
    // Send emergency data
    const emergencyData = {
      phoneNumber: callNumber,
      location: userLocation,
      emergencyType: emergencyType,
      timestamp: new Date().toISOString(),
      isPanicMode: isPanicMode,
      userProfile: userProfile,
      medicalInfo: userProfile?.medicalInfo || null,
      deviceInfo: {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language
      }
    };
    
    console.log('Emergency call data:', emergencyData);
    
    // Simulate incoming call acceptance after 2 seconds
    setTimeout(() => {
      console.log('Emergency services connected');
      // You could add remote video stream simulation here
    }, 2000);
  };

  // Start voice call
  const startVoiceCall = async () => {
    try {
      setCallStatus('connecting');
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStreamRef.current = stream;
      
      initializePeerConnection();
      
      stream.getTracks().forEach(track => {
        peerConnectionRef.current?.addTrack(track, stream);
      });

      // Make actual phone call to emergency number
      makePhoneCall(emergencyNumber);
      
      setIsCallActive(true);
      setCallStatus('connected');
      startCallTimer();
      
    } catch (error) {
      console.error('Error starting voice call:', error);
      alert('Unable to access microphone. Please check permissions and try again.');
      setCallStatus('idle');
    }
  };

  // Make actual phone call
  const makePhoneCall = (phoneNumber: string) => {
    // Open phone dialer with the emergency number
    const telUrl = `tel:${phoneNumber}`;
    window.open(telUrl, '_self');
  };

  // Start call timer
  const startCallTimer = () => {
    callTimerRef.current = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
  };

  // Toggle video
  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  };

  // Toggle audio
  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  };

  // Switch camera
  const switchCamera = async () => {
    try {
      const newFacing = cameraFacing === 'user' ? 'environment' : 'user';
      
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: newFacing },
        audio: true
      });

      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      setCameraFacing(newFacing);
    } catch (error) {
      console.error('Error switching camera:', error);
    }
  };

  // Toggle speaker
  const toggleSpeaker = () => {
    setIsSpeakerEnabled(!isSpeakerEnabled);
    // In a real implementation, this would route audio output
  };

  // End call
  const endCall = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }
    
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
    }
    
    setIsCallActive(false);
    setCallStatus('ended');
    setCallDuration(0);
    setIsVideoEnabled(true);
    setIsAudioEnabled(true);
  };

  // Format call duration
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Get connection status color
  const getConnectionStatusColor = () => {
    switch (connectionQuality) {
      case 'excellent': return 'text-green-500';
      case 'good': return 'text-yellow-500';
      case 'poor': return 'text-orange-500';
      case 'disconnected': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="video-call-system bg-gradient-to-br from-slate-900 to-blue-900 rounded-xl shadow-2xl overflow-hidden">
      {/* Call Header */}
      <div className="call-header bg-slate-800/50 backdrop-blur-sm p-4 border-b border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
              <Phone className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-white font-semibold">Emergency Services</h3>
              <p className="text-gray-300 text-sm">{emergencyNumber}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {isCallActive && (
              <>
                <div className={`text-sm ${getConnectionStatusColor()}`}>
                  {connectionQuality.toUpperCase()}
                </div>
                <div className="text-white text-sm font-mono">
                  {formatDuration(callDuration)}
                </div>
              </>
            )}
            <div className="flex items-center space-x-1 text-gray-300">
              <Users className="w-4 h-4" />
              <span className="text-sm">
                {callStatus === 'connected' ? '2' : '1'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Video Interface */}
      <div className="video-interface relative">
        {isCallActive ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 p-2">
            {/* Local Video */}
            <div className="relative bg-slate-800 rounded-lg overflow-hidden aspect-video">
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className={`w-full h-full object-cover ${!isVideoEnabled ? 'hidden' : ''}`}
              />
              {!isVideoEnabled && (
                <div className="absolute inset-0 bg-slate-700 flex items-center justify-center">
                  <CameraOff className="w-12 h-12 text-gray-400" />
                </div>
              )}
              <div className="absolute bottom-2 left-2 bg-black/50 backdrop-blur-sm px-2 py-1 rounded text-white text-xs">
                You
              </div>
              <div className="absolute top-2 right-2 flex space-x-1">
                {!isAudioEnabled && (
                  <div className="bg-red-500 rounded-full p-1">
                    <MicOff className="w-3 h-3 text-white" />
                  </div>
                )}
                {!isVideoEnabled && (
                  <div className="bg-red-500 rounded-full p-1">
                    <CameraOff className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>
            </div>

            {/* Remote Video */}
            <div className="relative bg-slate-800 rounded-lg overflow-hidden aspect-video">
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-slate-700 flex items-center justify-center">
                <div className="text-center text-white">
                  <Users className="w-16 h-16 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm">Emergency Responder</p>
                  <p className="text-xs text-gray-400">Waiting to connect...</p>
                </div>
              </div>
              <div className="absolute bottom-2 left-2 bg-black/50 backdrop-blur-sm px-2 py-1 rounded text-white text-xs">
                Emergency Services
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Phone className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Emergency Communication</h2>
            <p className="text-gray-300 mb-6">Connect with emergency services instantly</p>
            <p className="text-sm text-gray-400 mb-8">
              Location services and camera access will be used to provide emergency responders with critical information.
            </p>
          </div>
        )}

        {/* Call Controls */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-4 transition-opacity duration-300 opacity-100">
          <div className="flex justify-center items-center space-x-4">
            {!isCallActive ? (
              <>
                {/* Start Call Buttons */}
                <button
                  onClick={handleStartCall}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-full flex items-center space-x-2 transition-all duration-200 hover:scale-105 shadow-lg"
                  title="Start Video Call"
                >
                  <Video className="w-5 h-5" />
                  <span className="font-medium">Video Call</span>
                </button>
                
                <button
                  onClick={startVoiceCall}
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-3 rounded-full flex items-center space-x-2 transition-all duration-200 hover:scale-105 shadow-lg"
                  title="Start Voice Call"
                >
                  <Phone className="w-5 h-5" />
                  <span className="font-medium">Voice Call</span>
                </button>
                
                <button
                  onClick={() => makePhoneCall(emergencyNumber)}
                  className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-3 rounded-full flex items-center space-x-2 transition-all duration-200 hover:scale-105 shadow-lg"
                  title={`Call ${emergencyNumber}`}
                >
                  <Phone className="w-5 h-5" />
                  <span className="font-medium">Call {emergencyNumber}</span>
                </button>
              </>
            ) : (
              <>
                {/* Active Call Controls */}
                <button
                  onClick={toggleAudio}
                  className={`p-4 rounded-full transition-all duration-200 hover:scale-110 ${
                    isAudioEnabled 
                      ? 'bg-slate-600 hover:bg-slate-700 text-white' 
                      : 'bg-red-500 hover:bg-red-600 text-white'
                  }`}
                  title={isAudioEnabled ? "Mute microphone" : "Unmute microphone"}
                >
                  {isAudioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                </button>

                <button
                  onClick={toggleVideo}
                  className={`p-4 rounded-full transition-all duration-200 hover:scale-110 ${
                    isVideoEnabled 
                      ? 'bg-slate-600 hover:bg-slate-700 text-white' 
                      : 'bg-red-500 hover:bg-red-600 text-white'
                  }`}
                  title={isVideoEnabled ? "Turn off camera" : "Turn on camera"}
                >
                  {isVideoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                </button>

                <button
                  onClick={switchCamera}
                  className="p-4 rounded-full bg-slate-600 hover:bg-slate-700 text-white transition-all duration-200 hover:scale-110"
                  title="Switch camera"
                >
                  <Camera className="w-5 h-5" />
                </button>

                <button
                  onClick={toggleSpeaker}
                  className={`p-4 rounded-full transition-all duration-200 hover:scale-110 ${
                    isSpeakerEnabled 
                      ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                      : 'bg-slate-600 hover:bg-slate-700 text-white'
                  }`}
                  title="Toggle speaker"
                >
                  {isSpeakerEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                </button>

                <button
                  onClick={endCall}
                  className="p-4 rounded-full bg-red-500 hover:bg-red-600 text-white transition-all duration-200 hover:scale-110 shadow-lg"
                  title="End call"
                >
                  <PhoneOff className="w-5 h-5" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Emergency Controls Panel */}
      {isCallActive && (
        <div className="emergency-controls bg-slate-900/90 backdrop-blur-sm p-4 border-t border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <Shield className="w-5 h-5 mr-2 text-red-500" />
              Emergency Controls
            </h3>
            {isPanicMode && (
              <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium animate-pulse">
                PANIC MODE ACTIVE
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {/* Panic Button */}
            <button
              onClick={handlePanicButton}
              className={`p-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center ${
                isPanicMode 
                  ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse' 
                  : 'bg-red-500 hover:bg-red-600 text-white hover:scale-105'
              }`}
              title="Panic Button (Ctrl+Shift+E)"
            >
              <AlertTriangle className="w-5 h-5 mr-2" />
              {isPanicMode ? 'PANIC ON' : 'PANIC'}
            </button>

            {/* AI Risk Assessment */}
            <button
              onClick={() => setShowAIRiskDashboard(!showAIRiskDashboard)}
              className={`p-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center ${
                showAIRiskDashboard 
                  ? 'bg-purple-500 hover:bg-purple-600 text-white' 
                  : 'bg-slate-600 hover:bg-slate-700 text-white'
              }`}
              title="AI Risk Assessment Dashboard"
            >
              <Brain className="w-5 h-5 mr-2" />
              AI Risk
              {aiRecommendations > 0 && (
                <span className="ml-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {aiRecommendations}
                </span>
              )}
            </button>

            {/* Location Sharing */}
            <button
              onClick={() => setLocationSharing(!locationSharing)}
              className={`p-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center ${
                locationSharing 
                  ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                  : 'bg-slate-600 hover:bg-slate-700 text-white'
              }`}
              title="Share Location"
            >
              <MapPin className="w-5 h-5 mr-2" />
              Location
            </button>

            {/* Recording */}
            <button
              onClick={() => setIsRecording(!isRecording)}
              className={`p-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center ${
                isRecording 
                  ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' 
                  : 'bg-slate-600 hover:bg-slate-700 text-white'
              }`}
              title="Record Call"
            >
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-2 ${isRecording ? 'bg-white animate-pulse' : 'bg-gray-400'}`} />
                Record
              </div>
            </button>

            {/* High Contrast */}
            <button
              onClick={() => setHighContrastMode(!highContrastMode)}
              className={`p-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center ${
                highContrastMode 
                  ? 'bg-yellow-500 hover:bg-yellow-600 text-black' 
                  : 'bg-slate-600 hover:bg-slate-700 text-white'
              }`}
              title="High Contrast Mode"
            >
              <Zap className="w-5 h-5 mr-2" />
              Contrast
            </button>
          </div>

          {/* Emergency Info Display */}
          {(userLocation || userProfile?.medicalInfo) && (
            <div className="mt-4 p-3 bg-slate-800/50 rounded-lg">
              <h4 className="text-sm font-medium text-white mb-2 flex items-center">
                <Heart className="w-4 h-4 mr-2 text-red-500" />
                Emergency Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                {userLocation && (
                  <div className="text-gray-300">
                    <span className="font-medium">Location: </span>
                    {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
                  </div>
                )}
                {userProfile?.medicalInfo && (
                  <div className="text-gray-300">
                    <span className="font-medium">Medical: </span>
                    {userProfile.medicalInfo.conditions?.join(', ') || 'No conditions listed'}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* GPS-Based Emergency Contacts System */}
          {(detectedCountry || localEmergencyNumbers) && (
            <div className="mt-4 p-3 bg-blue-900/30 border border-blue-500/30 rounded-lg">
              <h4 className="text-sm font-medium text-blue-300 mb-2 flex items-center">
                <MapPin className="w-4 h-4 mr-2 text-blue-400" />
                Local Emergency Numbers
                {isLoadingLocation && <div className="ml-2 w-3 h-3 border border-blue-400 border-t-transparent rounded-full animate-spin"></div>}
              </h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {detectedCountry && (
                  <div className="col-span-2 text-blue-200 mb-2">
                    <span className="font-medium">Detected Location: </span>
                    {localEmergencyNumbers.country} ({detectedCountry})
                  </div>
                )}
                <div className="text-blue-200">
                  <span className="font-medium">Police: </span>
                  <a href={`tel:${localEmergencyNumbers.police}`} className="text-blue-400 hover:text-blue-300 underline">
                    {localEmergencyNumbers.police}
                  </a>
                </div>
                <div className="text-blue-200">
                  <span className="font-medium">Fire: </span>
                  <a href={`tel:${localEmergencyNumbers.fire}`} className="text-blue-400 hover:text-blue-300 underline">
                    {localEmergencyNumbers.fire}
                  </a>
                </div>
                <div className="text-blue-200">
                  <span className="font-medium">Medical: </span>
                  <a href={`tel:${localEmergencyNumbers.medical}`} className="text-blue-400 hover:text-blue-300 underline">
                    {localEmergencyNumbers.medical}
                  </a>
                </div>
                <div className="text-blue-200">
                  <span className="font-medium">General: </span>
                  <a href={`tel:${localEmergencyNumbers.general}`} className="text-blue-400 hover:text-blue-300 underline">
                    {localEmergencyNumbers.general}
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Medical Information Quick Access */}
          {medicalInfo && (
            <div className="mt-4 p-3 bg-red-900/30 border border-red-500/30 rounded-lg">
              <h4 className="text-sm font-medium text-red-300 mb-2 flex items-center">
                <Heart className="w-4 h-4 mr-2 text-red-400" />
                Medical Information for First Responders
              </h4>
              <div className="text-sm text-red-200">
                {/* Display formatted medical information */}
                {medicalInfo.conditions?.length ? `Conditions: ${medicalInfo.conditions.join(', ')}` : ''}
                {medicalInfo.allergies?.length ? ` | Allergies: ${medicalInfo.allergies.join(', ')}` : ''}
                {medicalInfo.medications?.length ? ` | Medications: ${medicalInfo.medications.join(', ')}` : ''}
                {medicalInfo.bloodType ? ` | Blood Type: ${medicalInfo.bloodType}` : ''}
              </div>
            </div>
          )}

          {/* Call Timer and Status */}
          {callDuration > 0 && (
            <div className="mt-3 flex items-center justify-center space-x-4 text-sm text-gray-400">
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                Call Duration: {formatDuration(callDuration)}
              </div>
              {callAttempts > 0 && (
                <div className="text-yellow-500">
                  Rate Limited: {callAttempts}/{maxCallAttempts}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Real-Time Emergency Data Display */}
      {showRealTimeData && (
        <div className="real-time-data-container">
          <RealTimeDataDisplay
            userLocation={userLocation}
            isMinimized={realTimeDataMinimized}
            onToggleMinimize={() => setRealTimeDataMinimized(!realTimeDataMinimized)}
            showInCall={isCallActive}
            className="border-t border-slate-700"
          />
        </div>
      )}

      {/* Status Messages */}
      {callStatus !== 'idle' && (
        <div className="status-bar bg-slate-800/50 backdrop-blur-sm p-3 text-center">
          <p className="text-sm text-gray-300">
            {callStatus === 'connecting' && 'Connecting to emergency services...'}
            {callStatus === 'connected' && `Connected to emergency services • ${formatDuration(callDuration)}`}
            {callStatus === 'ended' && 'Call ended'}
          </p>
        </div>
      )}

      {/* AI Risk Assessment Dashboard */}
      <AIRiskDashboard
        userLocation={userLocation}
        userProfile={{
          name: userProfile?.name,
          medicalInfo: userProfile?.medicalInfo ? {
            conditions: userProfile.medicalInfo.conditions || [],
            medications: userProfile.medicalInfo.medications || [],
            allergies: userProfile.medicalInfo.allergies || []
          } : undefined,
          emergencyContacts: userProfile?.emergencyContacts,
          vulnerabilities: { mobility: 'medium', medical: [], age: 'adult', dependencies: [] },
          preferences: { transportMode: 'car', language: 'en', notificationLevel: 'standard' },
          resources: { emergencySupplies: false, vehicle: true, pets: 0, familySize: 1 }
        }}
        isVisible={showAIRiskDashboard}
        onToggleVisibility={() => setShowAIRiskDashboard(!showAIRiskDashboard)}
        onEmergencyAction={handleAIEmergencyAction}
      />
    </div>
  );
};

export default VideoCallSystem;
