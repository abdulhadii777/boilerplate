// Import Firebase scripts
importScripts("https://www.gstatic.com/firebasejs/12.1.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/12.1.0/firebase-messaging-compat.js");

// Service worker lifecycle events
self.addEventListener('install', function(event) {
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  event.waitUntil(self.clients.claim());
});

// Initialize Firebase with proper error handling
function initializeFirebase() {
  try {
    // Check if Firebase is available
    if (typeof firebase === 'undefined') {
      console.error('Firebase scripts not loaded yet');
      return false;
    }

    // Check if Firebase is already initialized
    if (firebase.apps && firebase.apps.length > 0) {
      console.log('Firebase already initialized');
      return true;
    }

    // Initialize Firebase
    firebase.initializeApp({
      apiKey: "AIzaSyDTZh6cvEgkvw4MytQwRLzr4ArMytrsx5Y",
      authDomain: "laravle-12-boiler-plate.firebaseapp.com",
      projectId: "laravle-12-boiler-plate",
      storageBucket: "laravle-12-boiler-plate.firebasestorage.app",
      messagingSenderId: "284475299533",
      appId: "1:284475299533:web:706e8af684c7fcb702fb84"
    });

    console.log('Firebase initialized successfully');
    return true;
  } catch (error) {
    console.error('Failed to initialize Firebase:', error);
    return false;
  }
}

// Initialize messaging
function initializeMessaging() {
  try {
    if (typeof firebase === 'undefined' || !firebase.messaging) {
      console.error('Firebase or messaging not available');
      return false;
    }

    if (self.backgroundMessageHandlerActive) {
      console.log('Messaging already initialized');
      return true;
    }

    const messaging = firebase.messaging();
    
    // Store messaging instance globally
    self.messaging = messaging;
    
    // Flag to prevent duplicate handlers
    self.backgroundMessageHandlerActive = true;
    
    messaging.onBackgroundMessage(function(payload) {
      // Create a unique identifier for this notification
      const notificationTitle = payload.notification.title;
      const notificationBody = payload.notification.body;
      const notificationId = `${notificationTitle}-${notificationBody}-${Math.floor(Date.now() / 1000)}`;
      
      const notificationOptions = {
        body: notificationBody,
        icon: payload.notification.image,
        data: payload.data,
        requireInteraction: true,
        tag: notificationId,
      };

      self.registration.showNotification(notificationTitle, notificationOptions)
        .catch((error) => {
          console.error('Failed to display background notification:', error);
        });
    });

    console.log('Messaging initialized successfully');
    return true;
  } catch (error) {
    console.error('Failed to initialize messaging:', error);
    return false;
  }
}

// Initialize everything when the service worker starts
function initializeServiceWorker() {
  // Try to initialize Firebase first
  if (initializeFirebase()) {
    // If Firebase is initialized, try to initialize messaging
    initializeMessaging();
  } else {
    // If Firebase fails to initialize, retry after a delay
    setTimeout(() => {
      if (initializeFirebase()) {
        initializeMessaging();
      }
    }, 1000);
  }
}

// Start initialization
initializeServiceWorker();

// Handle notification clicks
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  
  const targetUrl = event.notification.data?.url || self.location.origin;
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
      // If app is already open, focus it
      for (let client of windowClients) {
        if (client.url.includes(self.location.origin)) {
          return client.focus();
        }
      }
      // If app not open, open a new tab
      return clients.openWindow(targetUrl);
    })
  );
});
