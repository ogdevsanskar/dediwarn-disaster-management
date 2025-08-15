import React, { useState, useEffect } from 'react';
import { MapPin, Download, Wifi, WifiOff, Navigation } from 'lucide-react';

interface MapTile {
  id: string;
  region: string;
  size: string;
  status: 'downloaded' | 'downloading' | 'available';
  lastUpdated?: Date;
}

interface OfflineMapsDashboardProps {
  className?: string;
}

export const OfflineMapsDashboard: React.FC<OfflineMapsDashboardProps> = () => {
  const [isOffline, setIsOffline] = useState(false);
  const [downloadedMaps, setDownloadedMaps] = useState<MapTile[]>([]);
  const [availableMaps, setAvailableMaps] = useState<MapTile[]>([]);

  // Check online/offline status
  useEffect(() => {
    const handleOnlineStatus = () => setIsOffline(!navigator.onLine);
    
    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOnlineStatus);
    
    // Initial check
    setIsOffline(!navigator.onLine);
    
    return () => {
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOnlineStatus);
    };
  }, []);

  // Mock data for available maps
  useEffect(() => {
    const mockAvailableMaps: MapTile[] = [
      {
        id: 'region-1',
        region: 'Downtown Emergency Zone',
        size: '25 MB',
        status: 'available'
      },
      {
        id: 'region-2',
        region: 'Hospital District',
        size: '18 MB',
        status: 'downloaded',
        lastUpdated: new Date('2024-10-15')
      },
      {
        id: 'region-3',
        region: 'Flood Prone Areas',
        size: '32 MB',
        status: 'downloading'
      }
    ];
    
    setAvailableMaps(mockAvailableMaps);
    setDownloadedMaps(mockAvailableMaps.filter(map => map.status === 'downloaded'));
  }, []);

  const handleDownloadMap = (mapId: string) => {
    setAvailableMaps(prev => 
      prev.map(map => 
        map.id === mapId 
          ? { ...map, status: 'downloading' }
          : map
      )
    );

    // Simulate download process
    setTimeout(() => {
      setAvailableMaps(prev => 
        prev.map(map => 
          map.id === mapId 
            ? { ...map, status: 'downloaded', lastUpdated: new Date() }
            : map
        )
      );
    }, 3000);
  };

  return (
    <div className="offline-maps-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <h2>Offline Maps Dashboard</h2>
          <div className="connection-status">
            {isOffline ? (
              <div className="status-indicator offline">
                <WifiOff size={16} />
                <span>Offline Mode</span>
              </div>
            ) : (
              <div className="status-indicator online">
                <Wifi size={16} />
                <span>Online</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="stats-grid">
        <div className="stat-card">
          <MapPin size={24} />
          <div className="stat-info">
            <h3>Downloaded Maps</h3>
            <span className="stat-number">{downloadedMaps.length}</span>
          </div>
        </div>
        
        <div className="stat-card">
          <Download size={24} />
          <div className="stat-info">
            <h3>Storage Used</h3>
            <span className="stat-number">75 MB</span>
          </div>
        </div>
      </div>

      {/* Available Maps */}
      <div className="maps-section">
        <h3>Available Emergency Maps</h3>
        <div className="maps-grid">
          {availableMaps.map((mapTile) => (
            <div key={mapTile.id} className="map-tile-card">
              <div className="map-tile-header">
                <h4>{mapTile.region}</h4>
                <span className="map-size">{mapTile.size}</span>
              </div>
              
              <div className="map-tile-content">
                <div className="map-status">
                  <span className={`status-badge ${mapTile.status}`}>
                    {mapTile.status === 'downloaded' && '✓ Downloaded'}
                    {mapTile.status === 'downloading' && '↓ Downloading...'}
                    {mapTile.status === 'available' && 'Available'}
                  </span>
                </div>
                
                {mapTile.lastUpdated && (
                  <div className="last-updated">
                    Updated: {mapTile.lastUpdated.toLocaleDateString()}
                  </div>
                )}
              </div>
              
              <div className="map-tile-actions">
                {mapTile.status === 'available' && (
                  <button 
                    className="download-btn"
                    onClick={() => handleDownloadMap(mapTile.id)}
                  >
                    <Download size={16} />
                    Download
                  </button>
                )}
                
                {mapTile.status === 'downloaded' && (
                  <button className="view-btn">
                    <Navigation size={16} />
                    Open Map
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OfflineMapsDashboard;

// ❌ Incorrect computed property

// ✅ Correct computed properties

// ❌ Incorrect

// ✅ Correct

