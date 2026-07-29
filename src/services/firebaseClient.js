import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { fetchJson } from './api';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSy_demo_key_placeholder",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "daily-islamic-reflections.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "daily-islamic-reflections",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "daily-islamic-reflections.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "100000000000",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:100000000000:web:abcdef123456"
};

let app = null;
let messaging = null;

try {
  if (typeof window !== 'undefined' && 'Notification' in window) {
    app = initializeApp(firebaseConfig);
    messaging = getMessaging(app);
  }
} catch (err) {
  console.warn('Firebase Client Messaging initialization notice:', err.message);
}

export async function requestFcmTokenAndSubscribe() {
  if (!messaging) {
    throw new Error('Push messaging is not supported by this browser/environment.');
  }

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    throw new Error('Push notification permission was denied.');
  }

  try {
    const rawVapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY || import.meta.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
    console.log("Checking VAPID Key length:", rawVapidKey ? rawVapidKey.length : "UNDEFINED");
    
    if (!rawVapidKey) {
      console.error("VAPID Key is missing from environment variables.");
      return null;
    }

    // Strictly clean the key inline, relying on Firebase's native handling
    const cleanKey = String(rawVapidKey).replace(/['"\s]/g, '');
    console.log("Cleaned VAPID Key length:", cleanKey.length);

    const currentToken = await getToken(messaging, { vapidKey: cleanKey });

    if (currentToken) {
      console.log("Token generated successfully:", currentToken);
      // Save FCM device token to backend database
      await fetchJson('/notifications/subscribe', {
        method: 'POST',
        body: JSON.stringify({
          endpoint: currentToken,
          keys: {
            p256dh: 'fcm-device-token',
            auth: 'fcm-device-auth'
          }
        })
      });
    } else {
      console.log("No registration token available. Request permission to generate one.");
    }

    return currentToken;
  } catch (error) {
    console.error("Firebase getToken Error:", error);
    throw error;
  }
}

export function listenForegroundMessages(callback) {
  if (!messaging) return () => {};
  return onMessage(messaging, (payload) => {
    console.log('Received foreground FCM push message:', payload);
    if (callback) callback(payload);
  });
}
