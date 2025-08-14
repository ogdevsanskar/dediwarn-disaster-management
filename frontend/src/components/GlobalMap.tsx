import React from 'react';
import EnhancedGlobalMap from './EnhancedGlobalMap';
import {
  FIRMSFire,
  GDACSAlert,
  EONETEvent
} from '../services/GlobalEnvironmentalDataService';

interface GlobalMapComponentProps {
  fires?: FIRMSFire[];
  disasters?: GDACSAlert[];
  events?: EONETEvent[];
  onMarkerClick?: (marker: unknown) => void;
  trackingEnabled?: boolean;
  onTrackingToggle?: () => void;
}

const GlobalMap: React.FC<GlobalMapComponentProps> = (props) => {
  return <EnhancedGlobalMap {...props} />;
};

export default GlobalMap;
