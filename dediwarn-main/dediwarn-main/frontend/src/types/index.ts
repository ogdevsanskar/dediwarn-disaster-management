// Shared type definitions for the disaster management application

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude?: number;
  heading?: number;
  speed?: number;
  timestamp: number;
}

export interface DamageReport {
  type: string;
  location: LocationData | { lat: number; lng: number } | null;
  timestamp: number;
  environmentalData?: EnvironmentalData | null;
  image?: Blob;
  video?: Blob;
  file?: File;
  id?: string;
  description?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  images?: string[] | File[];
  qrCode?: string;
  userId?: string;
}

export interface EnvironmentalData {
  deviceMotion?: {
    acceleration: { x: number; y: number; z: number };
    rotation: { alpha: number; beta: number; gamma: number };
  };
  ambientLight?: number;
  battery?: { level: number; charging: boolean };
  networkInfo?: {
    effectiveType: string;
    downlink: number;
    rtt: number;
  };
  type?: string;
  timestamp?: number;
  magnitude?: number;
  location?: LocationData | { lat: number; lng: number } | null;
  temperature?: number;
  humidity?: number;
  airQuality?: number;
  windSpeed?: number;
  rainfall?: number;
}

export interface BatteryInfo {
  level: number;
  charging: boolean;
  chargingTime?: number;
  dischargingTime?: number;
}

export interface NetworkInfo {
  effectiveType: string;
  downlink: number;
  rtt: number;
  saveData?: boolean;
}

export interface EthereumProvider {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  selectedAddress?: string;
  chainId?: string;
  isMetaMask?: boolean;
  on?: (event: string, callback: (...args: unknown[]) => void) => void;
  removeAllListeners?: (event: string) => void;
}

export interface WalletError {
  message?: string;
  code?: number;
}

export interface AppNotification {
  id: number;
  type: 'emergency_alert' | 'app_update' | 'app_install' | 'offline_report' | 'report_sent' | 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  location?: { lat: number; lng: number };
  actions?: Array<{ label: string; action: () => void }>;
  read?: boolean;
}

export interface EmergencyAlert {
  title?: string;
  description?: string;
  message?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  location?: {
    lat: number;
    lng: number;
  };
  timestamp?: string;
  type?: string;
  category?: string;
  isActive?: boolean;
  actions?: Array<{ label: string; action: () => void }>;
}
