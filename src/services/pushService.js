import { fetchJson } from './api';
import { requestFcmTokenAndSubscribe } from './firebaseClient';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Unified Push Permission & VAPID / FCM Registration
 */
export async function requestPushPermissionAndSubscribe() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    throw new Error('Push notifications are not supported in this browser.');
  }

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    throw new Error('Push notification permission was denied.');
  }

  try {
    const keyData = await fetchJson('/notifications/vapid-public-key');
    if (!keyData.success || !keyData.publicKey) {
      throw new Error('Failed to retrieve VAPID public key from server.');
    }

    const registration = await navigator.serviceWorker.ready;
    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      const convertedVapidKey = urlBase64ToUint8Array(keyData.publicKey);
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey
      });
    }

    // Save Web Push Subscription to server
    await fetchJson('/notifications/subscribe', {
      method: 'POST',
      body: JSON.stringify(subscription)
    });

    // Optionally attempt Firebase FCM subscription if configured
    try {
      await requestFcmTokenAndSubscribe();
    } catch (fcmErr) {
      console.warn('FCM fallback notice:', fcmErr.message);
    }

    return subscription;
  } catch (err) {
    console.error('Error subscribing to push notifications:', err);
    throw err;
  }
}

export async function isPushSubscribed() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return false;
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    return !!subscription;
  } catch (err) {
    return false;
  }
}
