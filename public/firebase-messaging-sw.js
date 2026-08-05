// Firebase Messaging Service Worker for Background Push Notifications
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

// Firebase Project Credentials Configuration
const firebaseConfig = {
  apiKey: "AIzaSyCpEf_A-_WDncCDci0mmCWsjipCM8lDwJk",
  authDomain: "zikr-and-fikr-18041.firebaseapp.com",
  projectId: "zikr-and-fikr-18041",
  storageBucket: "zikr-and-fikr-18041.firebasestorage.app",
  messagingSenderId: "697784531043",
  appId: "1:697784531043:web:4cd894ba8cd1d02ca02056",
  measurementId: "G-DYZFJN8CN6"
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
