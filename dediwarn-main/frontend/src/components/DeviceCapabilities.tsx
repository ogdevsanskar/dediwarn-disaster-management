import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Camera, Activity, Upload, QrCode } from 'lucide-react';
import { LocationData, DamageReport, EnvironmentalData, BatteryInfo, NetworkInfo } from '../types';

interface DeviceCapabilitiesProps {
  onLocationUpdate: (location: { lat: number; lng: number; accuracy: number }) => void;
  onDamageReport: (report: DamageReport) => void;
  onEnvironmentalData: (data: EnvironmentalData) => void;
}

const DeviceCapabilities: React.FC<DeviceCapabilitiesProps> = ({
  onLocationUpdate,
  onDamageReport,
  onEnvironmentalData
}) => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [isTrackingLocation, setIsTrackingLocation] = useState(false);
  const [locationWatchId, setLocationWatchId] = useState<number | null>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [environmentalData, setEnvironmentalData] = useState<EnvironmentalData | null>(null);
  const [batteryInfo, setBatteryInfo] = useState<BatteryInfo | null>(null);
  const [networkInfo, setNetworkInfo] = useState<NetworkInfo | null>(null);
  const [qrScanResult, setQrScanResult] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize device capabilities
  useEffect(() => {
    initializeDeviceCapabilities();
    requestLocationPermission();
    
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
      if (locationWatchId) {
        navigator.geolocation.clearWatch(locationWatchId);
      }
      window.removeEventListener('devicemotion', handleDeviceMotion);
      window.removeEventListener('deviceorientation', handleDeviceOrientation);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initializeDeviceCapabilities = async () => {
    // Battery API
    if ('getBattery' in navigator) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const battery = await (navigator as any).getBattery();
        setBatteryInfo({
          level: battery.level,
          charging: battery.charging,
          chargingTime: battery.chargingTime,
          dischargingTime: battery.dischargingTime
        });

        // Listen for battery changes
        battery.addEventListener('chargingchange', updateBatteryInfo);
        battery.addEventListener('levelchange', updateBatteryInfo);
      } catch (error) {
        console.warn('Battery API not supported:', error);
      }
    }

    // Network Information API
    if ('connection' in navigator) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const connection = (navigator as any).connection;
      setNetworkInfo({
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt,
        saveData: connection.saveData
      });

      connection.addEventListener('change', updateNetworkInfo);
    }

    // Device Motion API
    if ('DeviceMotionEvent' in window) {
      // Request permission for iOS 13+
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const permission = await (DeviceMotionEvent as any).requestPermission();
        if (permission === 'granted') {
          startMotionTracking();
        }
      } else {
        startMotionTracking();
      }
    }

    // Ambient Light API
    if ('AmbientLightSensor' in window) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const sensor = new (window as any).AmbientLightSensor();
        sensor.addEventListener('reading', () => {
          setEnvironmentalData(prev => ({
            ...prev!,
            ambientLight: sensor.illuminance
          }));
        });
        sensor.start();
      } catch (error) {
        console.warn('Ambient Light Sensor not supported:', error);
      }
    }
  };

  const updateBatteryInfo = (event: Event) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const battery = event.target as any;
    setBatteryInfo({
      level: battery.level,
      charging: battery.charging,
      chargingTime: battery.chargingTime,
      dischargingTime: battery.dischargingTime
    });
  };

  const updateNetworkInfo = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const connection = (navigator as any).connection;
    setNetworkInfo({
      effectiveType: connection.effectiveType,
      downlink: connection.downlink,
      rtt: connection.rtt,
      saveData: connection.saveData
    });
  };

  const startMotionTracking = () => {
    window.addEventListener('devicemotion', handleDeviceMotion);
    window.addEventListener('deviceorientation', handleDeviceOrientation);
  };

  const handleDeviceMotion = (event: DeviceMotionEvent) => {
    if (event.acceleration && event.rotationRate) {
      const motionData = {
        acceleration: {
          x: event.acceleration.x || 0,
          y: event.acceleration.y || 0,
          z: event.acceleration.z || 0
        },
        rotation: {
          alpha: event.rotationRate.alpha || 0,
          beta: event.rotationRate.beta || 0,
          gamma: event.rotationRate.gamma || 0
        }
      };

      setEnvironmentalData(prev => ({
        ...prev!,
        deviceMotion: motionData
      }));

      // Detect potential earthquake or strong vibration
      const magnitude = Math.sqrt(
        motionData.acceleration.x ** 2 +
        motionData.acceleration.y ** 2 +
        motionData.acceleration.z ** 2
      );

      if (magnitude > 20) { // Threshold for significant motion
        onEnvironmentalData({
          type: 'seismic_activity',
          magnitude,
          timestamp: Date.now(),
          location
        });
      }
    }
  };

  const handleDeviceOrientation = (event: DeviceOrientationEvent) => {
    // This can be used for compass functionality
    console.log('Device orientation:', {
      alpha: event.alpha, // Compass heading
      beta: event.beta,   // Front-to-back tilt
      gamma: event.gamma  // Left-to-right tilt
    });
  };

  const requestLocationPermission = async () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser.');
      return;
    }

    try {
      const position = await getCurrentPosition();
      const locationData: LocationData = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        altitude: position.coords.altitude || undefined,
        heading: position.coords.heading || undefined,
        speed: position.coords.speed || undefined,
        timestamp: position.timestamp
      };

      setLocation(locationData);
      onLocationUpdate({
        lat: locationData.latitude,
        lng: locationData.longitude,
        accuracy: locationData.accuracy
      });
    } catch (error) {
      console.error('Error getting location:', error);
      alert('Unable to get your location. Please enable location services.');
    }
  };

  const getCurrentPosition = (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        resolve,
        reject,
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    });
  };

  const startLocationTracking = () => {
    if (!navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const locationData: LocationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude || undefined,
          heading: position.coords.heading || undefined,
          speed: position.coords.speed || undefined,
          timestamp: position.timestamp
        };

        setLocation(locationData);
        onLocationUpdate({
          lat: locationData.latitude,
          lng: locationData.longitude,
          accuracy: locationData.accuracy
        });
      },
      (error) => {
        console.error('Location tracking error:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 30000
      }
    );

    setLocationWatchId(watchId);
    setIsTrackingLocation(true);
  };

  const stopLocationTracking = () => {
    if (locationWatchId) {
      navigator.geolocation.clearWatch(locationWatchId);
      setLocationWatchId(null);
      setIsTrackingLocation(false);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment', // Use back camera
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: true
      });

      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Unable to access camera. Please check permissions.');
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current || !cameraStream) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext('2d');

    if (context) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0);

      canvas.toBlob((blob) => {
        if (blob) {
          const report = {
            type: 'damage_report',
            image: blob,
            location,
            timestamp: Date.now(),
            environmentalData
          };
          onDamageReport(report);
        }
      }, 'image/jpeg', 0.9);
    }
  };

  const startRecording = async () => {
    if (!cameraStream) return;

    try {
      const mediaRecorder = new MediaRecorder(cameraStream, {
        mimeType: 'video/webm;codecs=vp9'
      });

      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        
        const report = {
          type: 'video_report',
          video: blob,
          location,
          timestamp: Date.now(),
          environmentalData
        };
        onDamageReport(report);
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const scanQRCode = async () => {
    if (!cameraStream || !videoRef.current || !canvasRef.current) return;

    setIsScanning(true);
    
    try {
      // This is a simplified QR code scanning implementation
      // In a real app, you'd use a library like @zxing/library
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext('2d');

      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0);

        // Here you would use a QR code library to decode the image
        // For demo purposes, we'll simulate a scan result
        setTimeout(() => {
          const mockQRResult = 'EMERGENCY_KIT_ID_12345';
          setQrScanResult(mockQRResult);
          setIsScanning(false);
          
          // Process QR code result
          onDamageReport({
            type: 'qr_scan',
            qrCode: mockQRResult,
            location,
            timestamp: Date.now()
          });
        }, 2000);
      }
    } catch (error) {
      console.error('QR scanning error:', error);
      setIsScanning(false);
    }
  };

  const uploadFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const report = {
        type: 'file_upload',
        file: file,
        location,
        timestamp: Date.now(),
        environmentalData
      };
      onDamageReport(report);
    }
  };

  return (
    <div className="device-capabilities bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Device Capabilities</h2>

      {/* Location Section */}
      <div className="location-section mb-6">
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <MapPin size={20} />
          Location Services
        </h3>
        
        {location && (
          <div className="bg-green-50 border border-green-200 rounded-md p-3 mb-3">
            <div className="text-sm text-green-800">
              <div>📍 Lat: {location.latitude.toFixed(6)}</div>
              <div>📍 Lng: {location.longitude.toFixed(6)}</div>
              <div>🎯 Accuracy: {location.accuracy.toFixed(0)}m</div>
              {location.altitude && <div>⛰️ Altitude: {location.altitude.toFixed(0)}m</div>}
              {location.speed && <div>🚗 Speed: {location.speed.toFixed(1)} m/s</div>}
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={isTrackingLocation ? stopLocationTracking : startLocationTracking}
            className={`px-4 py-2 rounded-md ${
              isTrackingLocation 
                ? 'bg-red-500 hover:bg-red-600 text-white' 
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            {isTrackingLocation ? 'Stop Tracking' : 'Start Tracking'}
          </button>
          <button
            onClick={requestLocationPermission}
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
          >
            Refresh Location
          </button>
        </div>
      </div>

      {/* Camera Section */}
      <div className="camera-section mb-6">
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Camera size={20} />
          Camera & Recording
        </h3>

        {cameraStream && (
          <div className="camera-preview mb-4">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full max-w-md h-64 bg-gray-900 rounded-lg object-cover"
            />
            <canvas ref={canvasRef} className="hidden" />
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <button
            onClick={cameraStream ? () => setCameraStream(null) : startCamera}
            className={`px-4 py-2 rounded-md ${
              cameraStream 
                ? 'bg-red-500 hover:bg-red-600' 
                : 'bg-green-500 hover:bg-green-600'
            } text-white`}
          >
            {cameraStream ? 'Stop Camera' : 'Start Camera'}
          </button>

          {cameraStream && (
            <>
              <button
                onClick={capturePhoto}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                title="Capture Photo"
              >
                📸 Capture
              </button>

              <button
                onClick={isRecording ? stopRecording : startRecording}
                className={`px-4 py-2 rounded-md text-white ${
                  isRecording 
                    ? 'bg-red-500 hover:bg-red-600' 
                    : 'bg-purple-500 hover:bg-purple-600'
                }`}
                title={isRecording ? 'Stop Recording' : 'Start Recording'}
              >
                {isRecording ? '⏹️ Stop' : '🎥 Record'}
              </button>

              <button
                onClick={scanQRCode}
                disabled={isScanning}
                className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 disabled:bg-gray-400"
                title="Scan QR Code"
              >
                {isScanning ? '🔍 Scanning...' : <><QrCode size={16} className="inline mr-1" /> QR Scan</>}
              </button>
            </>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            onChange={uploadFile}
            className="hidden"
            title="Upload image or video files"
            aria-label="Upload image or video files"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
            title="Upload File"
          >
            <Upload size={16} className="inline mr-1" />
            Upload
          </button>
        </div>

        {qrScanResult && (
          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <div className="text-sm text-yellow-800">
              QR Code Result: {qrScanResult}
            </div>
          </div>
        )}
      </div>

      {/* Environmental Data Section */}
      <div className="environmental-section mb-6">
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Activity size={20} />
          Environmental Sensors
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {batteryInfo && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
              <div className="text-sm text-blue-800">
                <div className="font-medium mb-1">🔋 Battery</div>
                <div>Level: {(batteryInfo.level * 100).toFixed(0)}%</div>
                <div>Status: {batteryInfo.charging ? 'Charging' : 'Discharging'}</div>
              </div>
            </div>
          )}

          {networkInfo && (
            <div className="bg-purple-50 border border-purple-200 rounded-md p-3">
              <div className="text-sm text-purple-800">
                <div className="font-medium mb-1">📶 Network</div>
                <div>Type: {networkInfo.effectiveType}</div>
                <div>Speed: {networkInfo.downlink} Mbps</div>
                <div>Latency: {networkInfo.rtt} ms</div>
              </div>
            </div>
          )}

          {environmentalData?.deviceMotion && (
            <div className="bg-green-50 border border-green-200 rounded-md p-3">
              <div className="text-sm text-green-800">
                <div className="font-medium mb-1">📱 Motion</div>
                <div>X: {environmentalData.deviceMotion.acceleration.x.toFixed(2)}</div>
                <div>Y: {environmentalData.deviceMotion.acceleration.y.toFixed(2)}</div>
                <div>Z: {environmentalData.deviceMotion.acceleration.z.toFixed(2)}</div>
              </div>
            </div>
          )}

          {environmentalData?.ambientLight && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
              <div className="text-sm text-yellow-800">
                <div className="font-medium mb-1">💡 Light</div>
                <div>{environmentalData.ambientLight.toFixed(0)} lux</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeviceCapabilities;
