import React, { useState, useEffect, useRef } from 'react';
import { Phone, Video, Mic, MicOff, VideoOff, Users, MessageCircle, Globe, PhoneCall } from 'lucide-react';

interface EmergencyCommunicationProps {
  emergencyType: 'medical' | 'fire' | 'police' | 'rescue' | 'general';
  userLocation: { lat: number; lng: number };
}

interface ChatMessage {
  id: string;
  user: string;
  sender?: string;
  message: string;
  timestamp: Date;
  translated?: string;
  translatedMessage?: string;
}

const EmergencyCommunication: React.FC<EmergencyCommunicationProps> = ({
  emergencyType,
  userLocation
}) => {
  const [isVideoCall, setIsVideoCall] = useState(false);
  const [isVoiceCall, setIsVoiceCall] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [connectedUsers, setConnectedUsers] = useState<string[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [isTranslating, setIsTranslating] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const socketRef = useRef<WebSocket | null>(null);

  // Emergency contact numbers by type
  const emergencyContacts = {
    medical: { number: '108', name: 'Medical Emergency' },
    fire: { number: '101', name: 'Fire Department' },
    police: { number: '100', name: 'Police' },
    rescue: { number: '112', name: 'Rescue Services' },
    general: { number: '911', name: 'General Emergency' }
  };

  // Supported languages for translation
  const languages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'Hindi' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'ar', name: 'Arabic' },
    { code: 'zh', name: 'Chinese' },
    { code: 'ru', name: 'Russian' }
  ];

  useEffect(() => {
    // Initialize WebSocket connection for real-time communication
    initializeWebSocket();
    
    // Initialize WebRTC for video/audio calls
    initializeWebRTC();

    return () => {
      cleanup();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initializeWebSocket = () => {
    const wsUrl = process.env.NODE_ENV === 'production' 
      ? 'wss://your-domain.com/ws' 
      : 'ws://localhost:3001/ws';
    
    socketRef.current = new WebSocket(wsUrl);
    
    socketRef.current.onopen = () => {
      console.log('WebSocket connected');
      // Join emergency room
      socketRef.current?.send(JSON.stringify({
        type: 'join_emergency_room',
        emergencyType,
        location: userLocation,
        language: selectedLanguage
      }));
    };

    socketRef.current.onmessage = async (event) => {
      const data = JSON.parse(event.data);
      
      switch (data.type) {
        case 'new_message': {
          const translatedMessage = await translateMessage(data.message, selectedLanguage);
          setChatMessages(prev => [...prev, { ...data, translatedMessage }]);
          break;
        }
        
        case 'user_joined':
          setConnectedUsers(prev => [...prev, data.userId]);
          break;
        
        case 'user_left':
          setConnectedUsers(prev => prev.filter(id => id !== data.userId));
          break;
        
        case 'webrtc_offer':
          await handleWebRTCOffer(data.offer, data.from);
          break;
        
        case 'webrtc_answer':
          await handleWebRTCAnswer(data.answer);
          break;
        
        case 'webrtc_ice_candidate':
          await handleICECandidate(data.candidate);
          break;
      }
    };
  };

  const initializeWebRTC = () => {
    peerConnectionRef.current = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    });

    peerConnectionRef.current.onicecandidate = (event) => {
      if (event.candidate && socketRef.current) {
        socketRef.current.send(JSON.stringify({
          type: 'webrtc_ice_candidate',
          candidate: event.candidate
        }));
      }
    };

    peerConnectionRef.current.ontrack = (event) => {
      if (remoteVideoRef.current && event.streams[0]) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };
  };

  const startVideoCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });

      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      stream.getTracks().forEach(track => {
        peerConnectionRef.current?.addTrack(track, stream);
      });

      const offer = await peerConnectionRef.current?.createOffer();
      await peerConnectionRef.current?.setLocalDescription(offer);

      socketRef.current?.send(JSON.stringify({
        type: 'webrtc_offer',
        offer: offer
      }));

      setIsVideoCall(true);
    } catch (error) {
      console.error('Error starting video call:', error);
      alert('Unable to access camera/microphone. Please check permissions.');
    }
  };

  const startVoiceCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: false,
        audio: true
      });

      localStreamRef.current = stream;
      
      stream.getTracks().forEach(track => {
        peerConnectionRef.current?.addTrack(track, stream);
      });

      const offer = await peerConnectionRef.current?.createOffer();
      await peerConnectionRef.current?.setLocalDescription(offer);

      socketRef.current?.send(JSON.stringify({
        type: 'webrtc_offer',
        offer: offer
      }));

      setIsVoiceCall(true);
    } catch (error) {
      console.error('Error starting voice call:', error);
      alert('Unable to access microphone. Please check permissions.');
    }
  };

  const handleWebRTCOffer = async (offer: RTCSessionDescriptionInit, from: string) => {
    await peerConnectionRef.current?.setRemoteDescription(offer);
    
    const answer = await peerConnectionRef.current?.createAnswer();
    await peerConnectionRef.current?.setLocalDescription(answer);

    socketRef.current?.send(JSON.stringify({
      type: 'webrtc_answer',
      answer: answer,
      to: from
    }));
  };

  const handleWebRTCAnswer = async (answer: RTCSessionDescriptionInit) => {
    await peerConnectionRef.current?.setRemoteDescription(answer);
  };

  const handleICECandidate = async (candidate: RTCIceCandidateInit) => {
    await peerConnectionRef.current?.addIceCandidate(candidate);
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  };

  const endCall = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    
    peerConnectionRef.current?.close();
    initializeWebRTC();
    
    setIsVideoCall(false);
    setIsVoiceCall(false);
    setIsMuted(false);
    setIsVideoEnabled(true);
  };

  const sendMessage = async () => {
    if (newMessage.trim() && socketRef.current) {
      const messageData = {
        type: 'send_message',
        message: newMessage,
        timestamp: new Date().toISOString(),
        language: selectedLanguage,
        location: userLocation
      };

      socketRef.current.send(JSON.stringify(messageData));
      setNewMessage('');
    }
  };

  const translateMessage = async (message: string, targetLanguage: string): Promise<string> => {
    if (targetLanguage === 'en') return message;
    
    try {
      setIsTranslating(true);
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: message,
          targetLanguage: targetLanguage,
          sourceLanguage: 'auto'
        })
      });
      
      const data = await response.json();
      return data.translatedText || message;
    } catch (error) {
      console.error('Translation error:', error);
      return message;
    } finally {
      setIsTranslating(false);
    }
  };

  const callEmergencyNumber = () => {
    const contact = emergencyContacts[emergencyType];
    window.open(`tel:${contact.number}`, '_self');
  };

  const cleanup = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    peerConnectionRef.current?.close();
    socketRef.current?.close();
  };

  return (
    <div className="emergency-communication bg-white rounded-lg shadow-lg p-6">
      <div className="header mb-6">
        <h2 className="text-2xl font-bold text-red-600 mb-2">
          Emergency Communication Center
        </h2>
        <div className="flex items-center gap-4 mb-4">
          <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
            {emergencyContacts[emergencyType].name}
          </span>
          <div className="flex items-center gap-2">
            <Users size={16} />
            <span className="text-sm text-gray-600">
              {connectedUsers.length} responders online
            </span>
          </div>
        </div>
      </div>

      {/* Video Call Interface */}
      {(isVideoCall || isVoiceCall) && (
        <div className="video-interface mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {isVideoCall && (
              <>
                <div className="relative">
                  <video
                    ref={localVideoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-48 bg-gray-900 rounded-lg object-cover"
                  />
                  <div className="absolute bottom-2 left-2 text-white text-xs bg-black bg-opacity-50 px-2 py-1 rounded">
                    You
                  </div>
                </div>
                <div className="relative">
                  <video
                    ref={remoteVideoRef}
                    autoPlay
                    playsInline
                    className="w-full h-48 bg-gray-900 rounded-lg object-cover"
                  />
                  <div className="absolute bottom-2 left-2 text-white text-xs bg-black bg-opacity-50 px-2 py-1 rounded">
                    Emergency Responder
                  </div>
                </div>
              </>
            )}
          </div>
          
          <div className="call-controls flex justify-center gap-4">
            <button
              onClick={toggleMute}
              className={`p-3 rounded-full ${isMuted ? 'bg-red-500' : 'bg-gray-500'} text-white hover:opacity-80`}
              title={isMuted ? "Unmute microphone" : "Mute microphone"}
            >
              {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
            </button>
            
            {isVideoCall && (
              <button
                onClick={toggleVideo}
                className={`p-3 rounded-full ${!isVideoEnabled ? 'bg-red-500' : 'bg-gray-500'} text-white hover:opacity-80`}
              >
                {isVideoEnabled ? <Video size={20} /> : <VideoOff size={20} />}
              </button>
            )}
            
            <button
              onClick={endCall}
              className="p-3 rounded-full bg-red-600 text-white hover:bg-red-700"
              title="End Call"
            >
              <Phone size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Communication Options */}
      {!isVideoCall && !isVoiceCall && (
        <div className="communication-options mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={startVideoCall}
              className="flex items-center justify-center gap-2 p-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              title="Start Video Call"
            >
              <Video size={20} />
              Start Video Call
            </button>
            
            <button
              onClick={startVoiceCall}
              className="flex items-center justify-center gap-2 p-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              title="Start Voice Call"
            >
              <Phone size={20} />
              Voice Call
            </button>
            
            <button
              onClick={callEmergencyNumber}
              className="flex items-center justify-center gap-2 p-4 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              <PhoneCall size={20} />
              Call {emergencyContacts[emergencyType].number}
            </button>
          </div>
        </div>
      )}

      {/* Language Selection */}
      <div className="language-selection mb-4">
        <div className="flex items-center gap-4">
          <Globe size={16} />
          <label htmlFor="language-select" className="sr-only">Select language</label>
          <select
            id="language-select"
            aria-label="Select language"
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm"
          >
            {languages.map(lang => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
          {isTranslating && (
            <span className="text-xs text-blue-600">Translating...</span>
          )}
        </div>
      </div>

      {/* Chat Interface */}
      <div className="chat-interface">
        <div className="chat-messages bg-gray-50 rounded-lg p-4 h-64 overflow-y-auto mb-4">
          {chatMessages.map((msg, index) => (
            <div key={index} className="message mb-3">
              <div className="flex items-start gap-2">
                <div className="font-semibold text-sm text-gray-700">
                  {msg.sender || 'Emergency Responder'}
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </div>
              </div>
              <div className="message-content">
                <div className="text-gray-900">{msg.message}</div>
                {msg.translatedMessage && msg.translatedMessage !== msg.message && (
                  <div className="text-blue-600 text-sm italic mt-1">
                    Translation: {msg.translatedMessage}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        
        <div className="chat-input flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Type your message..."
            className="flex-1 border border-gray-300 rounded-md px-3 py-2"
          />
          <button
            onClick={sendMessage}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            title="Send Message"
          >
            <MessageCircle size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmergencyCommunication;
