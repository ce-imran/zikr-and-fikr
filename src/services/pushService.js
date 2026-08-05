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

    // 1. Attempt Web Push Subscription First
    let webPushSuccess = false;
    try {
      const keyData = await fetchJson('/notifications/vapid-public-key');
      if (keyData.success && keyData.publicKey) {
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
          body: JSON.stringify({
            endpoint: subscription.endpoint,
            keys: {
              p256dh: subscription.toJSON().keys.p256dh,
              auth: subscription.toJSON().keys.auth
            }
          })
        });
        webPushSuccess = true;
      }
    } catch (webPushErr) {
      console.warn('Web Push fallback notice:', webPushErr.message);
    }

    // 2. Attempt Firebase FCM subscription
    let fcmSuccess = false;
    try {
      await requestFcmTokenAndSubscribe();
      fcmSuccess = true;
    } catch (fcmErr) {
      console.warn('FCM fallback notice:', fcmErr.message);
    }

    if (!webPushSuccess && !fcmSuccess) {
      throw new Error('Both Web Push and Firebase Cloud Messaging failed to subscribe.');
    }

    return true;
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
