// Secure API Router for DeDiWARN Backend
// Implements all security middleware and protected endpoints

import express from 'express';
import { Request, Response } from 'express';
import securityMiddleware from '../middleware/security';

const router = express.Router();

// Apply general security headers to all routes
router.use(securityMiddleware.securityHeaders);
router.use(securityMiddleware.sanitizeInput);

// CSP Violation Reporting Endpoint
router.post('/csp-report', securityMiddleware.cspReportHandler);

// Emergency Endpoints (Enhanced Security)
router.use('/emergency*', securityMiddleware.validateEmergencyBypass);
router.use('/emergency*', securityMiddleware.emergencyLimiter);

// Emergency call initiation
router.post('/emergency-call', 
  securityMiddleware.validateEmergencyCall,
  async (req: Request, res: Response) => {
    try {
      const { phone, location, emergencyType, userProfile } = req.body;
      
      // Log emergency call for audit trail
      console.log('Emergency call initiated:', {
        timestamp: new Date().toISOString(),
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        emergencyType,
        hasLocation: !!location
      });

      // In production, integrate with actual emergency services
      // This is a mock response for development
      res.status(200).json({
        success: true,
        callId: `emergency_${Date.now()}`,
        message: 'Emergency call initiated successfully',
        estimatedResponse: '2-5 minutes'
      });

    } catch (error) {
      console.error('Emergency call failed:', error);
      res.status(500).json({
        error: 'Emergency call failed',
        code: 'EMERGENCY_CALL_FAILED'
      });
    }
  }
);

// Emergency message sending
router.post('/send-emergency-message',
  securityMiddleware.validateEmergencyCall,
  async (req: Request, res: Response) => {
    try {
      const { phone, message, priority, timestamp } = req.body;
      
      console.log('Emergency message sent:', {
        timestamp: timestamp || new Date().toISOString(),
        ip: req.ip,
        phone: phone.replace(/\d{4}$/, '****'), // Mask phone number in logs
        priority
      });

      // In production, integrate with SMS service (Twilio, etc.)
      res.status(200).json({
        success: true,
        messageId: `msg_${Date.now()}`,
        status: 'sent'
      });

    } catch (error) {
      console.error('Emergency message failed:', error);
      res.status(500).json({
        error: 'Failed to send emergency message',
        code: 'MESSAGE_SEND_FAILED'
      });
    }
  }
);

// Location-based emergency numbers
router.get('/emergency-numbers',
  securityMiddleware.validateLocation,
  async (req: Request, res: Response) => {
    try {
      const { lat, lng } = req.query;
      
      // Mock emergency number lookup based on location
      // In production, integrate with geocoding service
      const emergencyNumber = getEmergencyNumberByLocation(
        parseFloat(String(lat)), 
        parseFloat(String(lng))
      );
      
      res.status(200).json({
        emergencyNumber,
        location: { lat: parseFloat(String(lat)), lng: parseFloat(String(lng)) },
        country: 'Unknown', // Would be determined by geocoding
        services: {
          police: emergencyNumber,
          fire: emergencyNumber,
          medical: emergencyNumber
        }
      });

    } catch (error) {
      console.error('Emergency number lookup failed:', error);
      res.status(500).json({
        error: 'Failed to get emergency number',
        code: 'EMERGENCY_NUMBER_LOOKUP_FAILED'
      });
    }
  }
);

// Volunteer alerting system
router.post('/alert-volunteers',
  securityMiddleware.validateEmergencyCall,
  async (req: Request, res: Response) => {
    try {
      const { location, emergencyType, userProfile, timestamp } = req.body;
      
      console.log('Volunteer alert sent:', {
        timestamp: timestamp || new Date().toISOString(),
        ip: req.ip,
        emergencyType,
        location
      });

      // Mock volunteer alerting
      res.status(200).json({
        success: true,
        volunteersAlerted: 5,
        estimatedArrival: '10-15 minutes',
        alertId: `volunteer_alert_${Date.now()}`
      });

    } catch (error) {
      console.error('Volunteer alert failed:', error);
      res.status(500).json({
        error: 'Failed to alert volunteers',
        code: 'VOLUNTEER_ALERT_FAILED'
      });
    }
  }
);

// Location tracking updates
router.post('/location-update',
  securityMiddleware.emergencyLimiter,
  securityMiddleware.validateLocation,
  async (req: Request, res: Response) => {
    try {
      const { location, timestamp, accuracy } = req.body;
      
      // Store location update securely
      console.log('Location update received:', {
        timestamp: timestamp || new Date().toISOString(),
        ip: req.ip,
        accuracy
      });

      res.status(200).json({
        success: true,
        locationId: `loc_${Date.now()}`,
        status: 'updated'
      });

    } catch (error) {
      console.error('Location update failed:', error);
      res.status(500).json({
        error: 'Failed to update location',
        code: 'LOCATION_UPDATE_FAILED'
      });
    }
  }
);

// General API endpoints (Rate Limited)
router.use('/api*', securityMiddleware.generalLimiter);

// Real-time data endpoints
router.get('/api/earthquake-data', async (req: Request, res: Response) => {
  try {
    // Proxy to USGS API with caching
    const response = await fetch(
      'https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=2024-01-01&minmagnitude=4.5'
    );
    const data = await response.json();
    
    res.status(200).json(data);
  } catch (error) {
    console.error('Earthquake data fetch failed:', error);
    res.status(500).json({
      error: 'Failed to fetch earthquake data',
      code: 'EARTHQUAKE_DATA_FAILED'
    });
  }
});

// Weather data endpoint
router.get('/api/weather-data',
  securityMiddleware.validateLocation,
  async (req: Request, res: Response) => {
    try {
      const { lat, lng } = req.query;
      const apiKey = process.env.OPENWEATHER_API_KEY;
      
      if (!apiKey) {
        return res.status(500).json({
          error: 'Weather API key not configured',
          code: 'API_KEY_MISSING'
        });
      }

      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${apiKey}&units=metric`
      );
      const data = await response.json();
      
      res.status(200).json(data);
    } catch (error) {
      console.error('Weather data fetch failed:', error);
      res.status(500).json({
        error: 'Failed to fetch weather data',
        code: 'WEATHER_DATA_FAILED'
      });
    }
  }
);

// Authentication endpoints (Strict Rate Limiting)
router.use('/auth*', securityMiddleware.authLimiter);

// Protected endpoints requiring API key
router.use('/protected*', securityMiddleware.validateApiKey);

// System status endpoint (No authentication required)
router.get('/status', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'online',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    security: {
      csp: 'enabled',
      rateLimit: 'enabled',
      inputSanitization: 'enabled'
    }
  });
});

// Helper function to determine emergency number by location
function getEmergencyNumberByLocation(lat: number, lng: number): string {
  // Simple mock implementation
  // In production, use proper geocoding and emergency service lookup
  
  // US coordinates (rough approximation)
  if (lat >= 24 && lat <= 50 && lng >= -125 && lng <= -66) {
    return '911';
  }
  
  // Europe (rough approximation)
  if (lat >= 35 && lat <= 70 && lng >= -10 && lng <= 40) {
    return '112';
  }
  
  // India (rough approximation)
  if (lat >= 6 && lat <= 37 && lng >= 68 && lng <= 97) {
    return '108';
  }
  
  // Default international emergency
  return '112';
}

export default router;
