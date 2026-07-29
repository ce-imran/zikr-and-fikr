// Firebase Messaging Service Worker for Background Push Notifications
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

// Firebase Project Credentials Configuration
const firebaseConfig = {
  apiKey: "AIzaSy_demo_key_placeholder",
  authDomain: "daily-islamic-reflections.firebaseapp.com",
  projectId: "daily-islamic-reflections",
  storageBucket: "daily-islamic-reflections.appspot.com",
  messagingSenderId: "100000000000",
  appId: "1:100000000000:web:abcdef123456"
};

try {
  firebase.initializeApp(firebaseConfig);
  const messaging = firebase.messaging();

  messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background push message:', payload);

    const notificationTitle = payload.notification ? payload.notification.title : '📖 Daily Islamic Reflection';
    const notificationOptions = {
      body: payload.notification ? payload.notification.body : 'A new spiritual reflection is available.',
      icon: (payload.data && payload.data.icon) || '/icons/icon-192x192.png',
      data: {
        url: (payload.data && payload.data.url) || '/'
      }
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
  });
} catch (err) {
  console.warn('Firebase Messaging Service Worker setup warning:', err);
}

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data ? event.notification.data.url : '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (let client of windowClients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(urlToOpen);
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
