// Backend Security Middleware for DeDiWARN API
// Implements CSP headers, rate limiting, and input validation

import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import validator from 'validator';

// Content Security Policy configuration
const cspConfig = {
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: [
      "'self'",
      "'unsafe-inline'",
      "https://cdn.jsdelivr.net",
      "https://unpkg.com",
      "https://cdnjs.cloudflare.com"
    ],
    styleSrc: [
      "'self'",
      "'unsafe-inline'",
      "https://cdn.jsdelivr.net",
      "https://fonts.googleapis.com"
    ],
    fontSrc: [
      "'self'",
      "https://fonts.gstatic.com",
      "https://cdnjs.cloudflare.com"
    ],
    imgSrc: [
      "'self'",
      "data:",
      "blob:",
      "https:",
      "https://api.mapbox.com",
      "https://earthquake.usgs.gov"
    ],
    connectSrc: [
      "'self'",
      "https://api.openweathermap.org",
      "https://earthquake.usgs.gov",
      "https://api.here.com",
      "wss:",
      "ws:"
    ],
    mediaSrc: ["'self'", "blob:", "data:"],
    objectSrc: ["'none'"],
    baseUri: ["'self'"],
    formAction: ["'self'"],
    frameAncestors: ["'none'"]
  }
};

// Rate limiting configurations
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: Math.ceil(15 * 60) // 15 minutes in seconds
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const emergencyLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 20, // Allow more requests for emergency endpoints
  message: {
    error: 'Too many emergency requests from this IP.',
    retryAfter: Math.ceil(5 * 60)
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limiting for verified emergency calls
  skip: (req: Request) => {
    return req.headers['emergency-bypass'] === process.env.EMERGENCY_BYPASS_TOKEN;
  }
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // Strict limit for authentication endpoints
  message: {
    error: 'Too many authentication attempts from this IP.',
    retryAfter: Math.ceil(15 * 60)
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Input validation middleware
export const validateEmergencyCall = (req: Request, res: Response, next: NextFunction) => {
  try {
    const { phone, location, emergencyType, userProfile } = req.body;

    // Validate phone number
    if (phone && !validator.isMobilePhone(phone, 'any', { strictMode: false })) {
      return res.status(400).json({
        error: 'Invalid phone number format',
        code: 'INVALID_PHONE'
      });
    }

    // Validate location coordinates
    if (location) {
      const { lat, lng } = location;
      if (!validator.isFloat(String(lat), { min: -90, max: 90 }) ||
          !validator.isFloat(String(lng), { min: -180, max: 180 })) {
        return res.status(400).json({
          error: 'Invalid location coordinates',
          code: 'INVALID_COORDINATES'
        });
      }
    }

    // Validate emergency type
    if (emergencyType) {
      const allowedTypes = ['medical', 'fire', 'police', 'natural-disaster', 'accident', 'security', 'general'];
      if (!allowedTypes.includes(emergencyType.toLowerCase())) {
        return res.status(400).json({
          error: 'Invalid emergency type',
          code: 'INVALID_EMERGENCY_TYPE'
        });
      }
    }

    // Sanitize user profile
    if (userProfile && userProfile.name) {
      // Remove potentially dangerous characters
      req.body.userProfile.name = validator.escape(userProfile.name);
    }

    next();
  } catch {
    return res.status(400).json({
      error: 'Input validation failed',
      code: 'VALIDATION_ERROR'
    });
  }
};

// Location validation middleware
export const validateLocation = (req: Request, res: Response, next: NextFunction) => {
  try {
    const { lat, lng } = req.query;

    if (lat && lng) {
      if (!validator.isFloat(String(lat), { min: -90, max: 90 }) ||
          !validator.isFloat(String(lng), { min: -180, max: 180 })) {
        return res.status(400).json({
          error: 'Invalid latitude or longitude values',
          code: 'INVALID_COORDINATES'
        });
      }
    }

    next();
  } catch {
    return res.status(400).json({
      error: 'Location validation failed',
      code: 'VALIDATION_ERROR'
    });
  }
};

// General input sanitization middleware
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Sanitize request body
    if (req.body && typeof req.body === 'object') {
      req.body = sanitizeObject(req.body);
    }

    // Sanitize query parameters
    if (req.query && typeof req.query === 'object') {
      req.query = sanitizeObject(req.query);
    }

    next();
  } catch {
    return res.status(400).json({
      error: 'Input sanitization failed',
      code: 'SANITIZATION_ERROR'
    });
  }
};

// Helper function to sanitize objects
const sanitizeObject = (obj: any): any => {
  if (typeof obj === 'string') {
    // Remove potential XSS and script injection
    return validator.escape(obj)
      .replace(/javascript:/gi, '')
      .replace(/on\w+=/gi, '')
      .trim();
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }

  if (typeof obj === 'object' && obj !== null) {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      const sanitizedKey = validator.escape(String(key));
      sanitized[sanitizedKey] = sanitizeObject(value);
    }
    return sanitized;
  }

  return obj;
};

// CSP violation reporting endpoint
export const cspReportHandler = (req: Request, res: Response) => {
  try {
    const report = req.body;
    console.warn('CSP Violation Report:', {
      timestamp: new Date().toISOString(),
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      report: report
    });

    // In production, you might want to store these reports
    // or send them to a monitoring service
    
    res.status(204).end();
  } catch (error) {
    console.error('Failed to process CSP report:', error);
    res.status(500).json({ error: 'Failed to process CSP report' });
  }
};

// Security headers middleware using Helmet
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: cspConfig.directives,
    reportOnly: false
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  noSniff: true,
  frameguard: {
    action: 'deny'
  },
  xssFilter: true,
  referrerPolicy: {
    policy: 'strict-origin-when-cross-origin'
  }
});

// Emergency bypass token validation
export const validateEmergencyBypass = (req: Request, res: Response, next: NextFunction) => {
  const bypassToken = req.headers['emergency-bypass'];
  
  if (bypassToken === process.env.EMERGENCY_BYPASS_TOKEN) {
    // Allow emergency requests to bypass certain restrictions
    req.headers['emergency-validated'] = 'true';
  }
  
  next();
};

// API key validation (for external integrations)
export const validateApiKey = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey) {
    return res.status(401).json({
      error: 'API key required',
      code: 'MISSING_API_KEY'
    });
  }
  
  // In production, validate against your API key database
  const validApiKeys = process.env.VALID_API_KEYS?.split(',') || [];
  
  if (!validApiKeys.includes(String(apiKey))) {
    return res.status(401).json({
      error: 'Invalid API key',
      code: 'INVALID_API_KEY'
    });
  }
  
  next();
};

// Export all middleware
export default {
  generalLimiter,
  emergencyLimiter,
  authLimiter,
  validateEmergencyCall,
  validateLocation,
  sanitizeInput,
  cspReportHandler,
  securityHeaders,
  validateEmergencyBypass,
  validateApiKey
};
