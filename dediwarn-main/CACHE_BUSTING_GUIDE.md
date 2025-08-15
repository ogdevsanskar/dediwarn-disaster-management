# CDN Cache Busting Implementation Guide

## Overview

This document outlines the comprehensive cache busting strategy implemented for the Disaster Management System to ensure users always receive the latest critical information, especially important for emergency response scenarios.

## Problem Statement

CDN caching was preventing users from receiving fresh content updates, which is critical in disaster management where:
- Emergency alerts must reach users immediately
- Navigation routes need real-time hazard updates
- Resource availability information must be current
- System updates with new features need immediate deployment

## Solution Architecture

### 1. Server-Side Cache Control Headers (render.yaml)

```yaml
# Index.html - Never cache the main entry point
- path: /index.html
  name: Cache-Control
  value: no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0

# Service Workers - Always fresh for critical functionality
- path: /sw.js
  name: Cache-Control
  value: no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0

# Static Assets - Cache with filename hashing
- path: /assets/*
  name: Cache-Control
  value: public, max-age=31536000, immutable

# API Data - Never cache
- path: "*.json"
  name: Cache-Control
  value: no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0
```

### 2. Client-Side Cache Busting Service

**File**: `frontend/src/services/CacheBustingService.ts`

**Features**:
- Automatic fetch interceptor with cache-busting headers
- Version monitoring and update notifications
- Service worker cache invalidation
- Browser cache clearing utilities
- Progressive enhancement for offline scenarios

**Key Methods**:
```typescript
// Force refresh with cache clearing
cacheBustingService.forceRefresh()

// Clear all browser caches
cacheBustingService.clearAllCaches()

// Add version parameter to URLs
cacheBustingService.bustCache(url)

// Check content freshness
cacheBustingService.checkContentFreshness(url)
```

### 3. Enhanced Service Worker (public/sw.js)

**Cache Strategy**:
- **Never Cache**: API endpoints, version files, emergency data
- **Network First**: Critical resources with cache fallback
- **Cache First**: Static assets with background updates
- **Version Awareness**: Automatic cache invalidation on updates

**Background Processes**:
- Periodic cache cleanup (every 30 minutes)
- Version monitoring and client notification
- Offline support with fresh content priority

### 4. Build-Time Version Generation

**File**: `generate-version.js`

**Generated Files**:
- `public/version.json` - Version tracking for update detection
- Updates service worker with current build version
- Provides deployment metadata

**Build Integration**:
```yaml
# render.yaml
buildCommand: node generate-version.js && cd frontend && npm ci --silent && npm run build:render
```

### 5. Progressive Offline Support

**File**: `public/offline.html`

**Features**:
- Cache busting for retry attempts
- Automatic reconnection detection
- Service worker communication for updates
- Emergency contact information
- User-friendly update notifications

## Implementation Details

### Cache Busting Strategies Used

1. **HTTP Headers**
   ```
   Cache-Control: no-store, no-cache, must-revalidate, proxy-revalidate
   Pragma: no-cache
   Expires: 0
   ```

2. **URL Versioning**
   ```
   /api/data?v=1.0.0-1755202260333&_t=1692025200000
   ```

3. **ETag Invalidation**
   ```
   ETag: "off"
   ```

4. **Service Worker Messaging**
   ```javascript
   // Notify clients of cache updates
   client.postMessage({
     type: 'CACHE_UPDATE_REQUIRED',
     oldVersion: '1.0.0',
     newVersion: '1.1.0'
   });
   ```

### Critical Resources Handling

**Always Fresh**:
- `/index.html` - Main application entry
- `/sw.js` - Service worker updates
- `/manifest.json` - PWA configuration
- `/version.json` - Version tracking
- API endpoints - Real-time data
- Emergency alerts - Critical notifications

**Cached with Invalidation**:
- Static assets in `/assets/*` - Filename hashing
- Images and fonts - Long-term cache with version updates
- Component bundles - Cached until version change

## Testing Cache Busting

### 1. Local Testing
```bash
# Generate fresh version
node generate-version.js

# Build with cache busting
cd frontend && npm run build

# Verify version.json generation
cat public/version.json
```

### 2. Browser Testing
```javascript
// Check cache busting in browser console
fetch('/version.json', {
  headers: { 'Cache-Control': 'no-cache' }
}).then(r => r.json()).then(console.log);

// Force cache clear
if ('caches' in window) {
  caches.keys().then(names => 
    Promise.all(names.map(name => caches.delete(name)))
  );
}
```

### 3. Production Verification
```bash
# Check response headers
curl -I https://dediwarn-frontend.onrender.com/index.html

# Verify cache busting
curl -I "https://dediwarn-frontend.onrender.com/version.json"
```

## Monitoring and Maintenance

### 1. Version Tracking
- Build ID generation with timestamps
- Commit hash tracking (when available)
- Environment-specific versioning

### 2. User Experience
- Non-intrusive update notifications
- Automatic background updates
- Offline-first with fresh content priority

### 3. Performance Considerations
- Static asset caching for performance
- Critical path prioritization
- Progressive enhancement

## Emergency Scenarios

### 1. Critical Updates
- Immediate cache invalidation
- Force refresh for all clients
- Service worker update propagation

### 2. Disaster Response
- Real-time alert delivery
- Navigation route updates
- Resource availability changes

### 3. System Maintenance
- Graceful degradation
- Offline functionality
- Recovery mechanisms

## Benefits

1. **Immediate Updates**: Users receive critical information instantly
2. **Reliability**: Multiple fallback strategies ensure functionality
3. **Performance**: Smart caching for static assets
4. **User Experience**: Seamless updates with minimal disruption
5. **Emergency Ready**: Optimized for disaster response scenarios

## Configuration

### Environment Variables
```
NODE_ENV=production
COMMIT_SHA=<git-commit-hash>
BUILD_IGNORE_WARNINGS=true
```

### Build Commands
```bash
# Production build with cache busting
node generate-version.js && cd frontend && npm ci && npm run build:render
```

## Troubleshooting

### Common Issues

1. **Stale Content**
   - Check HTTP headers in browser DevTools
   - Verify service worker registration
   - Clear browser cache manually

2. **Version Mismatch**
   - Ensure generate-version.js runs before build
   - Check version.json file generation
   - Verify service worker update

3. **Offline Issues**
   - Check service worker installation
   - Verify offline.html accessibility
   - Test cache fallback strategies

### Debug Commands
```javascript
// Check service worker status
navigator.serviceWorker.getRegistrations()

// Check cache contents
caches.keys().then(console.log)

// Check version info
fetch('/version.json').then(r => r.json()).then(console.log)
```

This cache busting implementation ensures that the Disaster Management System delivers fresh, critical information to users when they need it most, while maintaining optimal performance through intelligent caching strategies.
