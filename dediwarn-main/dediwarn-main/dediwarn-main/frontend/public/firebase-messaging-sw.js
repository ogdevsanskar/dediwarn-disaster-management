// Firebase service worker for push notifications
importScripts('https://www.gstatic.com/firebasejs/10.4.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.4.0/firebase-messaging-compat.js');

// Initialize Firebase (configuration will be set dynamically)
const firebaseConfig = {
  // This will be populated by the main app
};

firebase.initializeApp(firebaseConfig);

// Retrieve Firebase Messaging object
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification?.title || 'Disaster Alert';
  const notificationOptions = {
    body: payload.notification?.body || 'Emergency notification from Disaster Management System',
    icon: '/disaster-icon.png',
    badge: '/disaster-badge.png',
    tag: 'disaster-alert',
    data: payload.data,
    actions: [
      {
        action: 'view',
        title: 'View Details',
        icon: '/icons/view.png'
      },
      {
        action: 'emergency',
        title: 'Call Emergency',
        icon: '/icons/emergency.png'
      }
    ],
    vibrate: [200, 100, 200, 100, 200, 100, 200],
    silent: false,
    urgency: 'high',
    requireInteraction: true
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification clicks
self.addEventListener('notificationclick', function(event) {
  console.log('[Service Worker] Notification click received.');

  event.notification.close();

  if (event.action === 'emergency') {
    // Handle emergency action
    event.waitUntil(
      clients.openWindow('tel:911')
    );
  } else if (event.action === 'view' || !event.action) {
    // Handle view action or default click
    event.waitUntil(
      clients.matchAll().then(function(clientList) {
        for (var i = 0; i < clientList.length; i++) {
          var client = clientList[i];
          if (client.url == '/' && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
    );
  }
});
