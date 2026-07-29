const admin = require('firebase-admin');

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
let privateKey = process.env.FIREBASE_PRIVATE_KEY;

let firebaseAdminApp = null;

if (projectId && clientEmail && privateKey) {
  try {
    // Process private key formatting for line breaks & quotes
    privateKey = privateKey.trim();
    if ((privateKey.startsWith('"') && privateKey.endsWith('"')) || (privateKey.startsWith("'") && privateKey.endsWith("'"))) {
      privateKey = privateKey.slice(1, -1);
    }
    if (privateKey.includes('\\n')) {
      privateKey = privateKey.replace(/\\n/g, '\n');
    }

    const existingApps = admin?.apps || admin?.default?.apps || (admin?.getApps ? admin.getApps() : []);
    if (!existingApps.length) {
      const certFunc = admin?.credential?.cert || admin?.default?.credential?.cert;
      const initAppFunc = admin?.initializeApp || admin?.default?.initializeApp;
      if (certFunc && initAppFunc) {
        firebaseAdminApp = initAppFunc({
          credential: certFunc({
            projectId: projectId.trim(),
            clientEmail: clientEmail.trim(),
            privateKey
          })
        });
        console.log('⚡ Firebase Admin SDK Initialized Successfully from .env!');
      }
    } else {
      firebaseAdminApp = (admin.app || admin.default?.app)();
    }
  } catch (err) {
    console.warn('⚠️ Firebase Admin SDK initialization warning:', err.message);
  }
} else {
  console.log('ℹ️ Firebase Admin credentials not set in .env; using Web-Push fallback.');
}

/**
 * Broadcast FCM Push Notification via Firebase Admin SDK
 * @param {Object} notificationData - { title, body, icon, url }
 * @param {Array<string>} tokens - Array of FCM device tokens
 */
const sendFirebaseMulticast = async (notificationData, tokens) => {
  if (!firebaseAdminApp || !tokens || tokens.length === 0) {
    return { success: false, count: 0, reason: 'No Firebase Admin app or target tokens' };
  }

  try {
    const message = {
      notification: {
        title: notificationData.title || '📖 New Daily Reflection Published',
        body: notificationData.body || 'A new spiritual post is now available on Zikr & Fikr.'
      },
      data: {
        url: notificationData.url || '/',
        icon: notificationData.icon || '/icons/icon-192x192.png'
      },
      tokens: tokens
    };

    const response = await admin.messaging().sendEachForMulticast(message);
    console.log(`📡 Broadcasted Firebase Push to ${response.successCount}/${tokens.length} devices.`);
    return { success: true, count: response.successCount };
  } catch (err) {
    console.error('Firebase Admin Broadcast Error:', err.message);
    return { success: false, error: err.message };
  }
};

module.exports = {
  admin,
  firebaseAdminApp,
  sendFirebaseMulticast,
  isFirebaseAdminConfigured: () => !!firebaseAdminApp
};
