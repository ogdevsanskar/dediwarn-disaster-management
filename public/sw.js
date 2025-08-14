/**
 * Enhanced Service Worker with Cache Busting Support
 * Implements aggressive cache invalidation for emergency response
 */

const CACHE_NAME = 'disaster-management-v1';
const DYNAMIC_CACHE = 'disaster-dynamic-v1';
const CRITICAL_CACHE = 'disaster-critical-v1';

// Current app version - updated during build
let APP_VERSION = '1.0.0-1755202260333';

// Resources that should always be fresh
const NEVER_CACHE = [
  '/api/',
  '/version.json',
  '/sw.js',
  '/firebase-messaging-sw.js',
  'weather',
  'earthquake',
  'disaster',
  'emergency'
];

// Critical resources for offline functionality
const CRITICAL_RESOURCES = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json'
];

// Static assets that can be cached longer
const STATIC_RESOURCES = [
  '/assets/',
  '.js',
  '.css',
  '.png',
  '.jpg',
  '.jpeg',
  '.svg',
  '.woff',
  '.woff2'
];

/**
 * Install event - cache critical resources
 */
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  
  event.waitUntil(
    caches.open(CRITICAL_CACHE)
      .then((cache) => {
        console.log('Caching critical resources...');
        return cache.addAll(CRITICAL_RESOURCES.map(url => 
          `${url}?v=${APP_VERSION}&_t=${Date.now()}`
        ));
      })
      .then(() => {
        console.log('Critical resources cached');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Failed to cache critical resources:', error);
      })
  );
});

/**
 * Activate event - clean old caches and take control
 */
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  
  event.waitUntil(
    Promise.all([
      // Clean old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && 
                cacheName !== DYNAMIC_CACHE && 
                cacheName !== CRITICAL_CACHE) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Take control of all clients
      self.clients.claim()
    ])
  );
});

/**
 * Fetch event - implement cache busting strategy
 */
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }
  
  // Skip chrome-extension and other protocols
  if (!url.protocol.startsWith('http')) {
    return;
  }

  event.respondWith(handleFetch(event.request));
});

/**
 * Handle fetch requests with cache busting logic
 */
async function handleFetch(request) {
  const url = new URL(request.url);
  
  try {
    // Never cache certain resources
    if (shouldNeverCache(url.pathname)) {
      console.log('Bypassing cache for:', url.pathname);
      return await fetchWithCacheBust(request);
    }
    
    // Handle critical resources
    if (isCriticalResource(url.pathname)) {
      return await handleCriticalResource(request);
    }
    
    // Handle static assets
    if (isStaticResource(url.pathname)) {
      return await handleStaticResource(request);
    }
    
    // Default: network first with cache fallback
    return await networkFirstStrategy(request);
    
  } catch (error) {
    console.error('Fetch failed:', error);
    return await handleOfflineFallback(request);
  }
}

/**
 * Check if resource should never be cached
 */
function shouldNeverCache(pathname) {
  return NEVER_CACHE.some(pattern => 
    pathname.includes(pattern) || 
    pathname.match(new RegExp(pattern, 'i'))
  );
}

/**
 * Check if resource is critical
 */
function isCriticalResource(pathname) {
  return CRITICAL_RESOURCES.some(resource => 
    pathname === resource || pathname.endsWith(resource)
  );
}

/**
 * Check if resource is static
 */
function isStaticResource(pathname) {
  return STATIC_RESOURCES.some(pattern => 
    pathname.includes(pattern) || pathname.endsWith(pattern)
  );
}

/**
 * Fetch with cache busting headers
 */
async function fetchWithCacheBust(request) {
  const cacheBustRequest = new Request(request.url, {
    method: request.method,
    headers: {
      ...Object.fromEntries(request.headers.entries()),
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'X-Cache-Bust': `${APP_VERSION}-${Date.now()}`
    },
    mode: request.mode,
    credentials: request.credentials,
    redirect: request.redirect
  });
  
  return await fetch(cacheBustRequest);
}

/**
 * Handle critical resources with version checking
 */
async function handleCriticalResource(request) {
  const cache = await caches.open(CRITICAL_CACHE);
  
  try {
    // Try network first for critical resources
    const networkResponse = await fetchWithCacheBust(request);
    
    if (networkResponse.ok) {
      // Update cache with fresh content
      await cache.put(request, networkResponse.clone());
      return networkResponse;
    }
    
    throw new Error('Network response not ok');
    
  } catch (error) {
    console.log('Network failed for critical resource, trying cache:', request.url);
    
    // Fallback to cache
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Ultimate fallback
    if (request.url.includes('index.html') || request.url.endsWith('/')) {
      return await cache.match('/offline.html');
    }
    
    throw error;
  }
}

/**
 * Handle static resources with cache first strategy
 */
async function handleStaticResource(request) {
  const cache = await caches.open(CACHE_NAME);
  
  // Check cache first for static resources
  const cachedResponse = await cache.match(request);
  if (cachedResponse) {
    // Serve from cache and update in background
    updateCacheInBackground(request, cache);
    return cachedResponse;
  }
  
  // Not in cache, fetch from network
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      await cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.error('Failed to fetch static resource:', error);
    throw error;
  }
}

/**
 * Network first strategy for dynamic content
 */
async function networkFirstStrategy(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  
  try {
    // Try network first
    const networkResponse = await fetchWithCacheBust(request);
    
    if (networkResponse.ok) {
      // Cache successful responses for short time
      await cache.put(request, networkResponse.clone());
      return networkResponse;
    }
    
    throw new Error('Network response not ok');
    
  } catch (error) {
    // Fallback to cache
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      console.log('Serving from cache (network failed):', request.url);
      return cachedResponse;
    }
    
    throw error;
  }
}

/**
 * Update cache in background
 */
async function updateCacheInBackground(request, cache) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      await cache.put(request, networkResponse.clone());
      console.log('Background cache update successful:', request.url);
    }
  } catch (error) {
    console.log('Background cache update failed:', request.url, error);
  }
}

/**
 * Handle offline fallback
 */
async function handleOfflineFallback(request) {
  // For navigation requests, return offline page
  if (request.mode === 'navigate') {
    const cache = await caches.open(CRITICAL_CACHE);
    return await cache.match('/offline.html');
  }
  
  // For other requests, return a basic offline response
  return new Response('Offline - Please check your connection', {
    status: 503,
    statusText: 'Service Unavailable',
    headers: new Headers({
      'Content-Type': 'text/plain',
    }),
  });
}

/**
 * Handle messages from main thread
 */
self.addEventListener('message', (event) => {
  if (event.data && event.data.type) {
    switch (event.data.type) {
      case 'VERSION_UPDATE':
        handleVersionUpdate(event.data.version);
        break;
        
      case 'SKIP_WAITING':
        self.skipWaiting();
        break;
        
      case 'CLEAR_CACHE':
        clearAllCaches();
        break;
        
      case 'CACHE_STATUS':
        sendCacheStatus(event.ports[0]);
        break;
        
      default:
        console.log('Unknown message type:', event.data.type);
    }
  }
});

/**
 * Handle version update
 */
async function handleVersionUpdate(newVersion) {
  if (newVersion && newVersion !== APP_VERSION) {
    console.log(`Version update detected: ${APP_VERSION} -> ${newVersion}`);
    APP_VERSION = newVersion;
    
    // Clear caches for fresh content
    await clearAllCaches();
    
    // Notify clients about update
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'CACHE_UPDATE_REQUIRED',
        oldVersion: APP_VERSION,
        newVersion: newVersion
      });
    });
  }
}

/**
 * Clear all caches
 */
async function clearAllCaches() {
  try {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map(cacheName => caches.delete(cacheName)));
    console.log('All caches cleared');
    return true;
  } catch (error) {
    console.error('Failed to clear caches:', error);
    return false;
  }
}

/**
 * Send cache status to client
 */
async function sendCacheStatus(port) {
  try {
    const cacheNames = await caches.keys();
    const status = {
      version: APP_VERSION,
      caches: cacheNames,
      timestamp: new Date().toISOString()
    };
    
    port.postMessage({
      type: 'CACHE_STATUS_RESPONSE',
      status: status
    });
  } catch (error) {
    port.postMessage({
      type: 'CACHE_STATUS_ERROR',
      error: error.message
    });
  }
}

/**
 * Periodic cache cleanup
 */
setInterval(async () => {
  try {
    const cache = await caches.open(DYNAMIC_CACHE);
    const requests = await cache.keys();
    
    // Remove old dynamic cache entries (older than 1 hour)
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    
    for (const request of requests) {
      const response = await cache.match(request);
      if (response) {
        const dateHeader = response.headers.get('date');
        if (dateHeader) {
          const responseDate = new Date(dateHeader).getTime();
          if (responseDate < oneHourAgo) {
            await cache.delete(request);
            console.log('Removed old cache entry:', request.url);
          }
        }
      }
    }
  } catch (error) {
    console.error('Cache cleanup failed:', error);
  }
}, 30 * 60 * 1000); // Run every 30 minutes

console.log('Disaster Management Service Worker loaded successfully');