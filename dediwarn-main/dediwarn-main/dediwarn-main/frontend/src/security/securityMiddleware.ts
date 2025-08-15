// Security Middleware for DeDiWARN Application
// Implements CSP headers, input sanitization, rate limiting, and emergency call verification

import DOMPurify from 'dompurify';

// Content Security Policy Configuration
export const CSP_CONFIG = {
  directives: {
    'default-src': ["'self'"],
    'script-src': [
      "'self'", 
      "'unsafe-inline'", 
      "https://cdn.jsdelivr.net",
      "https://unpkg.com",
      "https://cdnjs.cloudflare.com"
    ],
    'style-src': [
      "'self'", 
      "'unsafe-inline'", 
      "https://cdn.jsdelivr.net",
      "https://fonts.googleapis.com"
    ],
    'font-src': [
      "'self'",
      "https://fonts.gstatic.com",
      "https://cdnjs.cloudflare.com"
    ],
    'img-src': [
      "'self'", 
      "data:", 
      "blob:",
      "https:",
      "https://api.mapbox.com",
      "https://earthquake.usgs.gov"
    ],
    'connect-src': [
      "'self'",
      "https://api.openweathermap.org",
      "https://earthquake.usgs.gov",
      "https://api.here.com",
      "wss:",
      "ws:"
    ],
    'media-src': ["'self'", "blob:", "data:"],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
    'frame-ancestors': ["'none'"],
    'upgrade-insecure-requests': []
  }
};

// Generate CSP Header String
export const generateCSPHeader = (): string => {
  return Object.entries(CSP_CONFIG.directives)
    .map(([directive, sources]) => {
      if (sources.length === 0) return directive;
      return `${directive} ${sources.join(' ')}`;
    })
    .join('; ');
};

// Rate Limiting Implementation
class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private readonly windowMs: number;
  private readonly maxRequests: number;
  private readonly emergencyBypass: boolean;

  constructor(
    windowMs: number = 60000, // 1 minute
    maxRequests: number = 60,
    emergencyBypass: boolean = true
  ) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
    this.emergencyBypass = emergencyBypass;
  }

  public checkRateLimit(identifier: string, isEmergency: boolean = false): boolean {
    // Emergency bypass
    if (isEmergency && this.emergencyBypass) {
      return true;
    }

    const now = Date.now();
    const userRequests = this.requests.get(identifier) || [];
    
    // Filter out old requests
    const recentRequests = userRequests.filter(
      timestamp => now - timestamp < this.windowMs
    );

    // Check if limit exceeded
    if (recentRequests.length >= this.maxRequests) {
      return false;
    }

    // Add current request
    recentRequests.push(now);
    this.requests.set(identifier, recentRequests);
    
    return true;
  }

  public getRemainingRequests(identifier: string): number {
    const now = Date.now();
    const userRequests = this.requests.get(identifier) || [];
    const recentRequests = userRequests.filter(
      timestamp => now - timestamp < this.windowMs
    );
    
    return Math.max(0, this.maxRequests - recentRequests.length);
  }

  public getResetTime(identifier: string): number {
    const userRequests = this.requests.get(identifier) || [];
    if (userRequests.length === 0) return 0;
    
    const oldestRequest = Math.min(...userRequests);
    return oldestRequest + this.windowMs;
  }
}

// Global Rate Limiter Instance
export const globalRateLimiter = new RateLimiter(
  parseInt(process.env.REACT_APP_RATE_LIMIT_WINDOW_MS || '60000'),
  parseInt(process.env.REACT_APP_MAX_API_CALLS_PER_MINUTE || '60'),
  process.env.REACT_APP_EMERGENCY_BYPASS_RATE_LIMIT === 'true'
);

// Input Sanitization Functions
export class InputSanitizer {
  
  // Sanitize HTML content
  static sanitizeHTML(input: string): string {
    return DOMPurify.sanitize(input, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
      ALLOWED_ATTR: []
    });
  }

  // Sanitize plain text
  static sanitizeText(input: string): string {
    return input
      .replace(/[<>]/g, '') // Remove angle brackets
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim();
  }

  // Sanitize phone number
  static sanitizePhoneNumber(input: string): string {
    return input.replace(/[^\d+\-\s()]/g, '').trim();
  }

  // Sanitize coordinates
  static sanitizeCoordinates(lat: number, lng: number): { lat: number; lng: number } | null {
    const numLat = parseFloat(lat.toString());
    const numLng = parseFloat(lng.toString());
    
    if (
      isNaN(numLat) || isNaN(numLng) ||
      numLat < -90 || numLat > 90 ||
      numLng < -180 || numLng > 180
    ) {
      return null;
    }
    
    return { lat: numLat, lng: numLng };
  }

  // Sanitize emergency type
  static sanitizeEmergencyType(input: string): string {
    const allowedTypes = [
      'medical', 'fire', 'police', 'natural-disaster', 
      'accident', 'security', 'general'
    ];
    
    const sanitized = this.sanitizeText(input.toLowerCase());
    return allowedTypes.includes(sanitized) ? sanitized : 'general';
  }

  // General input sanitization with XSS protection
  static sanitizeInput(input: unknown): unknown {
    if (typeof input === 'string') {
      return this.sanitizeText(input);
    }
    
    if (Array.isArray(input)) {
      return input.map(item => this.sanitizeInput(item));
    }
    
    if (typeof input === 'object' && input !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(input)) {
        sanitized[this.sanitizeText(key)] = this.sanitizeInput(value);
      }
      return sanitized;
    }
    
    return input;
  }
}

// Emergency Call Verification System
export class EmergencyCallVerifier {
  private static attempts: Map<string, number> = new Map();
  private static lastAttempt: Map<string, number> = new Map();
  
  static async verifyEmergencyCall(
    userIdentifier: string,
    location?: { lat: number; lng: number },
    emergencyType?: string
  ): Promise<{
    allowed: boolean;
    reason?: string;
    attemptsRemaining?: number;
    cooldownTime?: number;
  }> {
    
    const maxAttempts = parseInt(
      process.env.REACT_APP_MAX_EMERGENCY_ATTEMPTS || '3'
    );
    const cooldownPeriod = 300000; // 5 minutes
    const now = Date.now();
    
    // Check cooldown period
    const lastCall = this.lastAttempt.get(userIdentifier) || 0;
    const timeSinceLastCall = now - lastCall;
    
    if (timeSinceLastCall < cooldownPeriod) {
      const remainingCooldown = cooldownPeriod - timeSinceLastCall;
      return {
        allowed: false,
        reason: 'Cooldown period active',
        cooldownTime: remainingCooldown
      };
    }
    
    // Check attempt limit
    const attempts = this.attempts.get(userIdentifier) || 0;
    
    if (attempts >= maxAttempts) {
      return {
        allowed: false,
        reason: 'Maximum attempts exceeded',
        attemptsRemaining: 0
      };
    }
    
    // Validate location if provided
    if (location) {
      const sanitizedLocation = InputSanitizer.sanitizeCoordinates(
        location.lat, location.lng
      );
      
      if (!sanitizedLocation) {
        return {
          allowed: false,
          reason: 'Invalid location coordinates'
        };
      }
    }
    
    // Validate emergency type
    if (emergencyType) {
      const sanitizedType = InputSanitizer.sanitizeEmergencyType(emergencyType);
      if (!sanitizedType) {
        return {
          allowed: false,
          reason: 'Invalid emergency type'
        };
      }
    }
    
    // Update attempt counter
    this.attempts.set(userIdentifier, attempts + 1);
    this.lastAttempt.set(userIdentifier, now);
    
    return {
      allowed: true,
      attemptsRemaining: maxAttempts - (attempts + 1)
    };
  }
  
  static resetAttempts(userIdentifier: string): void {
    this.attempts.delete(userIdentifier);
    this.lastAttempt.delete(userIdentifier);
  }
}

// Security Headers Configuration
export const SECURITY_HEADERS = {
  'Content-Security-Policy': generateCSPHeader(),
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=*, camera=*, microphone=*, payment=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
};

// Apply Security Headers (for development server)
export const applySecurityHeaders = (): void => {
  if (typeof document !== 'undefined') {
    // Create meta tags for CSP and other security headers
    const cspMeta = document.createElement('meta');
    cspMeta.httpEquiv = 'Content-Security-Policy';
    cspMeta.content = generateCSPHeader();
    document.head.appendChild(cspMeta);
    
    // Add security event listeners
    document.addEventListener('securitypolicyviolation', (event) => {
      console.warn('CSP Violation:', {
        blockedURI: event.blockedURI,
        violatedDirective: event.violatedDirective,
        originalPolicy: event.originalPolicy
      });
      
      // Report to backend in production
      if (process.env.NODE_ENV === 'production') {
        fetch('/api/csp-report', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            'csp-report': {
              'blocked-uri': event.blockedURI,
              'violated-directive': event.violatedDirective,
              'original-policy': event.originalPolicy,
              'timestamp': new Date().toISOString()
            }
          })
        }).catch(console.error);
      }
    });
  }
};

// Export all security functions
export {
  RateLimiter
};

export default {
  CSP_CONFIG,
  generateCSPHeader,
  globalRateLimiter,
  InputSanitizer,
  EmergencyCallVerifier,
  SECURITY_HEADERS,
  applySecurityHeaders
};
