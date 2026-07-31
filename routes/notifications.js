const express = require('express');
const router = express.Router();
const { getPublicKey, broadcastNotification } = require('../services/pushService');
const { supabase } = require('../config/supabase');
const { requireAdminAuth } = require('../middleware/auth');

// GET /api/notifications/vapid-public-key
router.get('/vapid-public-key', (req, res) => {
  const publicKey = getPublicKey();
  return res.json({ success: true, publicKey });
});

// POST /api/notifications/subscribe - Save web push subscription
router.post('/subscribe', async (req, res) => {
  try {
    const subscription = req.body;

    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return res.status(400).json({ success: false, message: 'Invalid subscription object.' });
    }

    if (supabase) {
      // Check if subscription already exists in fcm_subscriptions
      const { data: existing } = await supabase
        .from('fcm_subscriptions')
        .select('id')
        .eq('endpoint', subscription.endpoint)
        .maybeSingle();

      if (!existing) {
        const { error: insertErr } = await supabase.from('fcm_subscriptions').insert([{
          endpoint: subscription.endpoint,
          keys_p256dh: subscription.keys.p256dh || subscription.keys.p256,
          keys_auth: subscription.keys.auth,
          user_agent: req.headers['user-agent'] || ''
        }]);

        if (insertErr) {
          console.error('Error inserting fcm_subscription to Supabase:', insertErr);
        }
      }
    }

    return res.status(201).json({
      success: true,
      message: 'Web push subscription saved successfully!'
    });
  } catch (err) {
    console.error('Error saving subscription:', err);
    return res.status(500).json({ success: false, message: 'Failed to subscribe to push notifications.' });
  }
});

// POST /api/notifications/test - Trigger a test notification (Admin Only)
router.post('/test', requireAdminAuth, async (req, res) => {
  try {
    const result = await broadcastNotification({
      title: '🌟 Welcome to Daily Islamic Reflections',
      body: 'Notifications are enabled! You will be notified when new daily posts are published.',
      url: '/'
    });
    return res.json({ success: true, message: 'Test notification triggered.', result });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to send test push.' });
  }
});

module.exports = router;

