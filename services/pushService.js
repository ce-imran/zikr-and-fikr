const webPush = require('web-push');
const { supabase, formatSubscription } = require('../config/supabase');
const { sendFirebaseMulticast, isFirebaseAdminConfigured } = require('./firebaseAdmin');

let publicKey = process.env.VAPID_PUBLIC_KEY;
let privateKey = process.env.VAPID_PRIVATE_KEY;
const mailto = process.env.VAPID_MAILTO || 'mailto:admin@ceimran.in';

function isValidVapidKey(key) {
  return typeof key === 'string' && key.length > 50 && !key.includes('your_vapid');
}

if (!isValidVapidKey(publicKey) || !isValidVapidKey(privateKey)) {
  const vapidKeys = webPush.generateVAPIDKeys();
  publicKey = vapidKeys.publicKey;
  privateKey = vapidKeys.privateKey;
  console.log('⚡ Generated valid runtime VAPID keypair for Web Push Notifications.');
}

try {
  webPush.setVapidDetails(mailto, publicKey, privateKey);
} catch (err) {
  console.warn('VAPID setup warning:', err.message);
}

const getPublicKey = () => publicKey;

/**
 * Broadcast push notification via Web Push VAPID & Firebase Admin SDK
 * @param {Object} payloadData - { title, body, icon, url }
 */
const broadcastNotification = async (payloadData) => {
  try {
    let subscriptions = [];

    if (supabase) {
      const { data, error } = await supabase.from('fcm_subscriptions').select('*');
      if (!error && data) {
        subscriptions = data.map(formatSubscription);
      }
    }

    if (!subscriptions || subscriptions.length === 0) {
      console.log('No push subscribers to notify yet.');
      return { success: true, count: 0 };
    }

    const payload = JSON.stringify({
      title: payloadData.title || '📖 New Daily Reflection Published',
      body: payloadData.body || 'A new spiritual post is available on Nur & Hikmah.',
      icon: payloadData.icon || '/icons/icon-192x192.png',
      badge: '/icons/icon-192x192.png',
      url: payloadData.url || '/',
      timestamp: Date.now()
    });

    let successCount = 0;
    const fcmDeviceTokens = [];

    const pushPromises = subscriptions.map(async (sub) => {
      // Collect FCM device tokens if stored
      if (sub.endpoint && !sub.endpoint.startsWith('http')) {
        fcmDeviceTokens.push(sub.endpoint);
        return;
      }

      const pushSubscription = {
        endpoint: sub.endpoint,
        keys: sub.keys
      };

      try {
        await webPush.sendNotification(pushSubscription, payload);
        successCount++;
      } catch (err) {
        if (err.statusCode === 404 || err.statusCode === 410) {
          console.log(`Removing expired subscription: ${sub.endpoint}`);
          if (supabase && sub.id) {
            await supabase.from('fcm_subscriptions').delete().eq('id', sub.id);
          }
        } else {
          console.error(`Push notification error for ${sub.endpoint}:`, err.message);
        }
      }
    });

    await Promise.all(pushPromises);

    // If Firebase Admin SDK is configured and device tokens exist
    if (isFirebaseAdminConfigured() && fcmDeviceTokens.length > 0) {
      const fbResult = await sendFirebaseMulticast(payloadData, fcmDeviceTokens);
      if (fbResult.success) {
        successCount += fbResult.count;
      }
    }

    console.log(`📡 Broadcasted Push Notification to ${successCount} active subscribers.`);
    return { success: true, count: successCount };
  } catch (err) {
    console.error('Error broadcasting push notification:', err);
    return { success: false, error: err.message };
  }
};

module.exports = {
  getPublicKey,
  broadcastNotification
};

