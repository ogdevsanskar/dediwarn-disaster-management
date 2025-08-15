// Type augmentation for Vite env variables
declare global {
  interface ImportMetaEnv {
    readonly VITE_API_URL?: string;
    readonly VITE_WS_URL?: string;
    // add other env variables here as needed
  }
}

// Single DEV flag for the entire application
const DEV = import.meta.env.DEV || process.env.NODE_ENV === 'development';

// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '' : 'https://disaster-management-backend.onrender.com'),
  WS_URL: import.meta.env.VITE_WS_URL || (import.meta.env.DEV ? 'ws://localhost:5173' : 'wss://disaster-management-backend.onrender.com'),
  ENDPOINTS: {
    AI_CHAT: '/api/ai/chat',
    EMERGENCY_REPORTS: '/api/emergency-reports',
    ENVIRONMENTAL_DATA: '/api/environmental-data',
    NOTIFICATIONS: '/api/subscribe-notifications',
    WEATHER_ALERTS: '/api/weather-alerts',
    SEISMIC_DATA: '/api/seismic-data',
    TRANSLATE: '/api/translate',
    STATUS: '/api/status',

    // Emergency Management Endpoints
    DISASTERS: '/disasters',
    ALERTS: '/alerts',
    VOLUNTEERS: '/volunteers',
    RESOURCES: '/resources',
    WEATHER: '/weather',
    REPORTS: '/reports'
  },

  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },

  TIMEOUT: 10000, // 10 seconds

  // Development settings
  DEBUG: DEV,
  MOCK_DATA: DEV
} as const;

// Helper function to get full API URL
export const getApiUrl = (endpoint: string) => `${API_CONFIG.BASE_URL}${endpoint}`;

// Helper function to get WebSocket URL
export const getWsUrl = (path: string) => `${API_CONFIG.WS_URL}${path}`;

// Type definitions for API data
export interface AlertData {
  type: 'flood' | 'earthquake' | 'fire' | 'storm' | 'medical' | 'other';
  location: string;
  severity: 'low' | 'moderate' | 'high' | 'critical';
  description: string;
  coordinates?: { lat: number; lng: number };
  timestamp?: string;
}

export interface ReportData {
  type: 'incident' | 'resource_request' | 'volunteer_offer' | 'status_update';
  title: string;
  description: string;
  location: string;
  coordinates?: { lat: number; lng: number };
  severity?: 'low' | 'moderate' | 'high' | 'critical';
  contact?: string;
  timestamp?: string;
}

// API Client Class
export class ApiClient {
  private baseUrl: string;
  private headers: Record<string, string>;

  constructor() {
    this.baseUrl = API_CONFIG.BASE_URL;
    this.headers = { ...API_CONFIG.HEADERS };
  }

  // Set authentication token
  setAuthToken(token: string): void {
    this.headers['Authorization'] = `Bearer ${token}`;
  }

  // Generic request method
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const config: RequestInit = {
      ...options,
      headers: {
        ...this.headers,
        ...options.headers
      }
    };

    if (DEV) {
      console.log(`API Request: ${config.method || 'GET'} ${url}`);
    }

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      if (DEV) {
        console.error('API Error:', error);
      }
      throw error;
    }
  }

  // Emergency Management API Methods
  async getDisasters() {
    return this.request(API_CONFIG.ENDPOINTS.DISASTERS);
  }

  async createAlert(alertData: AlertData) {
    return this.request(API_CONFIG.ENDPOINTS.ALERTS, {
      method: 'POST',
      body: JSON.stringify(alertData)
    });
  }

  async getVolunteers() {
    return this.request(API_CONFIG.ENDPOINTS.VOLUNTEERS);
  }

  async submitReport(reportData: ReportData) {
    return this.request(API_CONFIG.ENDPOINTS.REPORTS, {
      method: 'POST',
      body: JSON.stringify(reportData)
    });
  }

  async getWeatherData(location: { lat: number; lng: number }) {
    return this.request(`${API_CONFIG.ENDPOINTS.WEATHER}?lat=${location.lat}&lng=${location.lng}`);
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Environment utilities
export const isProduction = () => !DEV;
export const isDevelopment = () => DEV;

// Mock data for development
export const MOCK_DISASTERS = DEV ? [
  {
    id: '1',
    type: 'flood',
    location: 'Downtown Area',
    severity: 'high',
    timestamp: new Date().toISOString()
  },
  {
    id: '2',
    type: 'earthquake',
    location: 'North District',
    severity: 'moderate',
    timestamp: new Date().toISOString()
  }
] : [];
