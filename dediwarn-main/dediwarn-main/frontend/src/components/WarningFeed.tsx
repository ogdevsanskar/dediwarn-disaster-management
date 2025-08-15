import React, { useState } from 'react';
import { AlertTriangle, Shield, Info } from 'lucide-react';

interface Warning {
  id: string;
  type: 'severe' | 'moderate' | 'watch';
  title: string;
  description: string;
  location: string;
  timestamp: Date;
}

export const WarningFeed: React.FC = () => {
  const [filter, setFilter] = useState<string>('all');
  const [warnings] = useState<Warning[]>([
    {
      id: '1',
      type: 'severe',
      title: 'Flash Flood Warning',
      description: 'Heavy rainfall causing rapid water rise',
      location: 'Downtown District',
      timestamp: new Date()
    },
    {
      id: '2',
      type: 'moderate',
      title: 'Strong Wind Advisory',
      description: 'Gusts up to 45 mph expected',
      location: 'Coastal Area',
      timestamp: new Date()
    }
  ]);

  const filteredWarnings = warnings.filter(warning => 
    filter === 'all' || warning.type === filter
  );

  const getWarningIcon = (type: string) => {
    switch (type) {
      case 'severe':
        return <AlertTriangle className="text-red-500" size={20} />;
      case 'moderate':
        return <Shield className="text-yellow-500" size={20} />;
      default:
        return <Info className="text-blue-500" size={20} />;
    }
  };

  return (
    <div className="warning-feed">
      <div className="feed-header">
        <h2>Emergency Warning Feed</h2>
        
        {/* ✅ Accessible select with label */}
        <div className="filter-section">
          <label htmlFor="warning-type-filter" className="filter-label">
            Filter by Severity:
          </label>
          <select
            id="warning-type-filter"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="warning-filter-select"
          >
            <option value="all">All Warnings</option>
            <option value="severe">Severe Weather</option>
            <option value="moderate">Moderate Alerts</option>
            <option value="watch">Weather Watch</option>
          </select>
        </div>
      </div>

      <div className="warnings-list">
        {filteredWarnings.length === 0 ? (
          <div className="no-warnings">
            <Info size={24} />
            <p>No warnings match the selected filter.</p>
          </div>
        ) : (
          filteredWarnings.map(warning => (
            <div key={warning.id} className={`warning-card ${warning.type}`}>
              <div className="warning-header">
                {getWarningIcon(warning.type)}
                <h3>{warning.title}</h3>
                <span className="warning-time">
                  {warning.timestamp.toLocaleTimeString()}
                </span>
              </div>
              
              <div className="warning-content">
                <p>{warning.description}</p>
                <div className="warning-location">
                  📍 {warning.location}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};