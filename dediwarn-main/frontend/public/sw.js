// Service Worker for PWA functionality
const CACHE_NAME = 'dediwarn-v1';
const STATIC_CACHE = 'dediwarn-static-v1';
const DYNAMIC_CACHE = 'dediwarn-dynamic-v1';

// Static assets to cache
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/offline.html',
  '/assets/index.css',
  '/assets/index.js'
];

// Emergency data that should be cached for offline access
const EMERGENCY_ENDPOINTS = [
  '/api/emergency-contacts',
  '/api/evacuation-routes',
  '/api/safe-zones',
  '/api/emergency-procedures'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            console.log('Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle navigation requests
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful responses
          const responseClone = response.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(request, responseClone);
          });
          return response;
        })
        .catch(() => {
          // Serve offline page if network fails
          return caches.match('/offline.html');
        })
    );
    return;
  }

  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache emergency endpoints
          if (EMERGENCY_ENDPOINTS.some(endpoint => url.pathname.includes(endpoint))) {
            const responseClone = response.clone();
            caches.open(DYNAMIC_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Serve from cache if network fails
          return caches.match(request);
        })
    );
    return;
  }

  // Handle other requests
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(request).then((response) => {
          // Cache successful responses
          const responseClone = response.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(request, responseClone);
          });
          return response;
        });
      })
  );
});

// Background sync for when user comes back online
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync triggered', event.tag);
  
  if (event.tag === 'sync-emergency-reports') {
    event.waitUntil(syncEmergencyReports());
  }
  
  if (event.tag === 'sync-location-updates') {
    event.waitUntil(syncLocationUpdates());
  }
});

// Push notifications for emergency alerts
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push notification received', event);
  
  const options = {
    body: event.data ? event.data.text() : 'Emergency Alert',
    icon: '/icon-192.png',
    badge: '/badge-72.png',
    vibrate: [200, 100, 200],
    requireInteraction: true,
    actions: [
      {
        action: 'view',
        title: 'View Details',
        icon: '/action-view.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: '/action-dismiss.png'
      }
    ],
    tag: 'emergency-alert',
    data: {
      url: '/emergency-alerts',
      timestamp: Date.now()
    }
  };

  event.waitUntil(
    self.registration.showNotification('DeDiWARN Emergency Alert', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked', event);
  
  event.notification.close();
  
  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow(event.notification.data.url)
    );
  }
});

// Sync functions
async function syncEmergencyReports() {
  try {
    const db = await openDB();
    const reports = await getAllPendingReports(db);
    
    for (const report of reports) {
      await fetch('/api/emergency-reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(report)
      });
      await removePendingReport(db, report.id);
    }
  } catch (error) {
    console.error('Sync failed:', error);
  }
}

async function syncLocationUpdates() {
  try {
    const db = await openDB();
    const locations = await getAllPendingLocations(db);
    
    for (const location of locations) {
      await fetch('/api/user-location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(location)
      });
      await removePendingLocation(db, location.id);
    }
  } catch (error) {
    console.error('Location sync failed:', error);
  }
}

// IndexedDB helpers for offline storage
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('DeDiWARN_OfflineDB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // Store for pending emergency reports
      if (!db.objectStoreNames.contains('pendingReports')) {
        db.createObjectStore('pendingReports', { keyPath: 'id' });
      }
      
      // Store for pending location updates
      if (!db.objectStoreNames.contains('pendingLocations')) {
        db.createObjectStore('pendingLocations', { keyPath: 'id' });
      }
    };
  });
}

function getAllPendingReports(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['pendingReports'], 'readonly');
    const store = transaction.objectStore('pendingReports');
    const request = store.getAll();
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

function getAllPendingLocations(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['pendingLocations'], 'readonly');
    const store = transaction.objectStore('pendingLocations');
    const request = store.getAll();
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

function removePendingReport(db, id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['pendingReports'], 'readwrite');
    const store = transaction.objectStore('pendingReports');
    const request = store.delete(id);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

function removePendingLocation(db, id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['pendingLocations'], 'readwrite');
    const store = transaction.objectStore('pendingLocations');
    const request = store.delete(id);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}
