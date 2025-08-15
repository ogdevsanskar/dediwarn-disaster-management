import React, { useState, useEffect, useRef } from 'react';
import { Radio, AlertTriangle, Eye, MapPin, Wifi, WifiOff, Activity } from 'lucide-react';

interface Alert {
  id: string;
  type: 'weather' | 'seismic' | 'fire' | 'flood' | 'general';
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  location?: { lat: number; lng: number };
  magnitude?: number; // For seismic alerts
}

interface WebSocketMessage {
  type: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any; // Allow any additional properties for flexible WebSocket messages
}

interface LiveStreamingProps {
  userLocation: { lat: number; lng: number };
  userRole: 'authority' | 'volunteer' | 'citizen';
  onAlertReceived: (alert: Alert) => void;
}

interface StreamData {
  id: string;
  streamerId: string;
  streamerName: string;
  title: string;
  location: { lat: number; lng: number };
  viewers: number;
  isLive: boolean;
  emergencyType: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  startTime: string;
}

interface WeatherAlert {
  id: string;
  type: 'flood' | 'earthquake' | 'storm' | 'fire' | 'tsunami' | 'tornado';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  area: string;
  expiresAt: string;
  coordinates: { lat: number; lng: number };
  instructions: string[];
}

interface SeismicData {
  magnitude: number;
  depth: number;
  location: string;
  coordinates: { lat: number; lng: number };
  timestamp: string;
  intensity: string;
}

const LiveStreaming: React.FC<LiveStreamingProps> = ({
  userLocation,
  userRole,
  onAlertReceived
}) => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [activeStreams, setActiveStreams] = useState<StreamData[]>([]);
  const [selectedStream, setSelectedStream] = useState<StreamData | null>(null);
  const [weatherAlerts, setWeatherAlerts] = useState<WeatherAlert[]>([]);
  const [seismicData, setSeismicData] = useState<SeismicData[]>([]);
  const [isConnected, setIsConnected] = useState(true);
  const [streamQuality, setStreamQuality] = useState<'low' | 'medium' | 'high'>('medium');
  const [viewerCount, setViewerCount] = useState(0);
  const [streamTitle, setStreamTitle] = useState('');
  const [emergencyType, setEmergencyType] = useState('general');

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map());

  useEffect(() => {
    initializeWebSocket();
    fetchWeatherAlerts();
    fetchSeismicData();
    
    // Set up periodic data refresh
    const intervalId = setInterval(() => {
      fetchWeatherAlerts();
      fetchSeismicData();
    }, 30000); // Refresh every 30 seconds

    return () => {
      cleanup();
      clearInterval(intervalId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initializeWebSocket = () => {
    const wsUrl = process.env.NODE_ENV === 'production'
      ? 'wss://your-domain.com/streaming'
      : 'ws://localhost:3001/streaming';

    socketRef.current = new WebSocket(wsUrl);

    socketRef.current.onopen = () => {
      console.log('Streaming WebSocket connected');
      setIsConnected(true);
      
      // Join streaming room
      socketRef.current?.send(JSON.stringify({
        type: 'join_streaming',
        userRole,
        location: userLocation
      }));
    };

    socketRef.current.onclose = () => {
      setIsConnected(false);
      // Attempt to reconnect after 3 seconds
      setTimeout(initializeWebSocket, 3000);
    };

    socketRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      handleWebSocketMessage(data);
    };

    socketRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsConnected(false);
    };
  };

  const handleWebSocketMessage = (data: WebSocketMessage) => {
    switch (data.type) {
      case 'streams_update':
        setActiveStreams(data.streams);
        break;
      
      case 'viewer_count':
        setViewerCount(data.count);
        break;
      
      case 'emergency_alert':
        onAlertReceived(data.alert);
        break;
      
      case 'weather_alert':
        setWeatherAlerts(prev => [data.alert, ...prev]);
        onAlertReceived({
          type: 'weather',
          ...data.alert
        });
        break;
      
      case 'seismic_alert':
        setSeismicData(prev => [data.data, ...prev]);
        if (data.data.magnitude > 4.0) {
          onAlertReceived({
            id: `seismic-${Date.now()}`,
            type: 'seismic',
            message: `Magnitude ${data.data.magnitude} earthquake detected`,
            magnitude: data.data.magnitude,
            location: data.data.location,
            severity: data.data.magnitude > 6.0 ? 'critical' : 'high',
            timestamp: new Date().toISOString()
          });
        }
        break;
      
      case 'webrtc_offer':
        handleStreamOffer(data.offer, data.streamerId);
        break;
      
      case 'webrtc_answer':
        handleStreamAnswer(data.answer, data.streamerId);
        break;
      
      case 'webrtc_ice_candidate':
        handleICECandidate(data.candidate, data.streamerId);
        break;
    }
  };

  const fetchWeatherAlerts = async () => {
    try {
      const response = await fetch(`/api/weather-alerts?lat=${userLocation.lat}&lng=${userLocation.lng}`);
      const alerts = await response.json();
      setWeatherAlerts(alerts.filter((alert: WeatherAlert) => alert.severity !== 'low'));
    } catch (error) {
      console.error('Error fetching weather alerts:', error);
    }
  };

  const fetchSeismicData = async () => {
    try {
      const response = await fetch(`/api/seismic-data?lat=${userLocation.lat}&lng=${userLocation.lng}&radius=500`);
      const data = await response.json();
      setSeismicData(data.slice(0, 10)); // Keep only recent 10 events
    } catch (error) {
      console.error('Error fetching seismic data:', error);
    }
  };

  const startStreaming = async () => {
    if (userRole === 'citizen') {
      alert('Only authorities and volunteers can start live streams');
      return;
    }

    if (!streamTitle.trim()) {
      alert('Please enter a stream title');
      return;
    }

    try {
      const constraints = getStreamConstraints();
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Notify server about new stream
      socketRef.current?.send(JSON.stringify({
        type: 'start_stream',
        title: streamTitle,
        emergencyType,
        location: userLocation,
        quality: streamQuality
      }));

      setIsStreaming(true);
    } catch (error) {
      console.error('Error starting stream:', error);
      alert('Unable to access camera/microphone. Please check permissions.');
    }
  };

  const stopStreaming = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }

    // Close all peer connections
    peerConnectionsRef.current.forEach(pc => pc.close());
    peerConnectionsRef.current.clear();

    socketRef.current?.send(JSON.stringify({
      type: 'stop_stream'
    }));

    setIsStreaming(false);
    setViewerCount(0);
  };

  const getStreamConstraints = () => {
    const qualitySettings = {
      low: { width: 640, height: 480, frameRate: 15 },
      medium: { width: 1280, height: 720, frameRate: 30 },
      high: { width: 1920, height: 1080, frameRate: 30 }
    };

    return {
      video: {
        ...qualitySettings[streamQuality],
        facingMode: 'environment' // Use back camera
      },
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        sampleRate: 44100
      }
    };
  };

  const joinStream = async (stream: StreamData) => {
    setSelectedStream(stream);
    
    socketRef.current?.send(JSON.stringify({
      type: 'join_stream',
      streamId: stream.id
    }));

    // Create peer connection for viewing
    const peerConnection = createPeerConnection(stream.streamerId);
    peerConnectionsRef.current.set(stream.streamerId, peerConnection);
  };

  const createPeerConnection = (streamerId: string): RTCPeerConnection => {
    const peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    });

    peerConnection.onicecandidate = (event) => {
      if (event.candidate && socketRef.current) {
        socketRef.current.send(JSON.stringify({
          type: 'webrtc_ice_candidate',
          candidate: event.candidate,
          targetId: streamerId
        }));
      }
    };

    peerConnection.ontrack = (event) => {
      if (remoteVideoRef.current && event.streams[0]) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    return peerConnection;
  };

  const handleStreamOffer = async (offer: RTCSessionDescriptionInit, streamerId: string) => {
    const peerConnection = peerConnectionsRef.current.get(streamerId) || createPeerConnection(streamerId);
    
    await peerConnection.setRemoteDescription(offer);
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);

    socketRef.current?.send(JSON.stringify({
      type: 'webrtc_answer',
      answer: answer,
      targetId: streamerId
    }));
  };

  const handleStreamAnswer = async (answer: RTCSessionDescriptionInit, streamerId: string) => {
    const peerConnection = peerConnectionsRef.current.get(streamerId);
    if (peerConnection) {
      await peerConnection.setRemoteDescription(answer);
    }
  };

  const handleICECandidate = async (candidate: RTCIceCandidateInit, streamerId: string) => {
    const peerConnection = peerConnectionsRef.current.get(streamerId);
    if (peerConnection) {
      await peerConnection.addIceCandidate(candidate);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'medium': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'critical': return 'text-red-800 bg-red-100 border-red-300';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const cleanup = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    peerConnectionsRef.current.forEach(pc => pc.close());
    peerConnectionsRef.current.clear();
    socketRef.current?.close();
  };

  return (
    <div className="live-streaming bg-white rounded-lg shadow-lg p-6">
      <div className="header mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Live Emergency Broadcasting</h2>
          <div className="flex items-center gap-2">
            {isConnected ? (
              <div className="flex items-center gap-1 text-green-600">
                <Wifi size={16} />
                <span className="text-sm">Connected</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-red-600">
                <WifiOff size={16} />
                <span className="text-sm">Reconnecting...</span>
              </div>
            )}
          </div>
        </div>

        {/* Emergency Alerts */}
        {weatherAlerts.length > 0 && (
          <div className="alerts-section mb-4">
            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
              <AlertTriangle size={18} />
              Active Weather Alerts
            </h3>
            <div className="space-y-2">
              {weatherAlerts.slice(0, 3).map(alert => (
                <div key={alert.id} className={`p-3 rounded-md border ${getSeverityColor(alert.severity)}`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-semibold">{alert.title}</div>
                      <div className="text-sm">{alert.description}</div>
                      <div className="text-xs mt-1">📍 {alert.area}</div>
                    </div>
                    <span className="text-xs font-medium px-2 py-1 rounded bg-white">
                      {alert.severity.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Seismic Activity */}
        {seismicData.length > 0 && (
          <div className="seismic-section mb-4">
            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
              <Activity size={18} />
              Recent Seismic Activity
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {seismicData.slice(0, 4).map((data, index) => (
                <div key={index} className="p-2 bg-gray-50 rounded border text-sm">
                  <div className="font-medium">Magnitude {data.magnitude}</div>
                  <div className="text-gray-600">{data.location}</div>
                  <div className="text-xs text-gray-500">
                    {new Date(data.timestamp).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Streaming Controls */}
      {(userRole === 'authority' || userRole === 'volunteer') && (
        <div className="streaming-controls mb-6">
          <h3 className="text-lg font-semibold mb-3">Broadcast Live Stream</h3>
          
          {!isStreaming ? (
            <div className="setup-form space-y-4">
              <div>
                <input
                  type="text"
                  value={streamTitle}
                  onChange={(e) => setStreamTitle(e.target.value)}
                  placeholder="Stream title (e.g., 'Flood Response - Downtown Area')"
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              
              <div className="flex gap-4">
                <label htmlFor="emergencyType" className="sr-only">Emergency Type</label>
                <select
                  id="emergencyType"
                  value={emergencyType}
                  onChange={(e) => setEmergencyType(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2"
                  aria-label="Emergency Type"
                >
                  <option value="general">General Emergency</option>
                  <option value="flood">Flood</option>
                  <option value="fire">Fire</option>
                  <option value="earthquake">Earthquake</option>
                  <option value="storm">Storm</option>
                  <option value="rescue">Rescue Operation</option>
                </select>

                <select
                  aria-label="Stream Quality"
                  value={streamQuality}
                  onChange={(e) => setStreamQuality(e.target.value as 'low' | 'medium' | 'high')}
                  className="border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="low">Low Quality (Data Saver)</option>
                  <option value="medium">Medium Quality</option>
                  <option value="high">High Quality</option>
                </select>
              </div>

              <button
                onClick={startStreaming}
                className="px-6 py-3 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors flex items-center gap-2"
              >
                <Radio size={20} />
                Start Live Stream
              </button>
            </div>
          ) : (
            <div className="active-stream">
              <div className="mb-4">
                <video
                  ref={localVideoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full max-w-md h-64 bg-gray-900 rounded-lg object-cover"
                />
              </div>
              
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="font-medium">LIVE</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye size={16} />
                    <span>{viewerCount} viewers</span>
                  </div>
                </div>
                
                <button
                  onClick={stopStreaming}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  End Stream
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Active Streams */}
      <div className="active-streams">
        <h3 className="text-lg font-semibold mb-3">Live Emergency Streams</h3>
        
        {selectedStream && (
          <div className="viewer-interface mb-6">
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-64 bg-gray-900 rounded-lg object-cover mb-2"
            />
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">{selectedStream.title}</div>
                <div className="text-sm text-gray-600">
                  {selectedStream.streamerName} • {selectedStream.viewers} viewers
                </div>
              </div>
              <button
                onClick={() => setSelectedStream(null)}
                className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
              >
                Close
              </button>
            </div>
          </div>
        )}

        <div className="streams-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeStreams.map(stream => (
            <div key={stream.id} className="stream-card border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="font-medium text-sm">{stream.title}</div>
                  <div className="text-xs text-gray-600">{stream.streamerName}</div>
                </div>
                <span className={`text-xs px-2 py-1 rounded ${getSeverityColor(stream.severity)}`}>
                  {stream.severity}
                </span>
              </div>
              
              <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                <div className="flex items-center gap-1">
                  <MapPin size={12} />
                  {stream.location.lat.toFixed(3)}, {stream.location.lng.toFixed(3)}
                </div>
                <div className="flex items-center gap-1">
                  <Eye size={12} />
                  {stream.viewers}
                </div>
              </div>
              
              <button
                onClick={() => joinStream(stream)}
                className="w-full px-3 py-2 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors"
              >
                Watch Stream
              </button>
            </div>
          ))}
        </div>

        {activeStreams.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Radio size={48} className="mx-auto mb-4 opacity-50" />
            <div>No active emergency streams</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveStreaming;
