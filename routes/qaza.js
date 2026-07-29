const express = require('express');
const router = express.Router();
const supabase = require('../config/supabaseClient');

// Middleware to check authentication
const requireAuth = (req, res, next) => {
  if (!req.user && !req.session?.adminUser) {
    return res.status(401).json({ success: false, message: 'Authentication required to save Qaza tracker.' });
  }
  next();
};

// GET /api/qaza - Get user's qaza tracker
router.get('/', requireAuth, async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id || req.session?.adminUser?.id;
    
    if (!supabase) {
      return res.status(500).json({ success: false, message: 'Database connection failed.' });
    }

    let { data, error } = await supabase
      .from('qaza_tracker')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      return res.status(500).json({ success: false, message: error.message });
    }

    if (!data) {
      // Return default empty tracker
      data = { fajr: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0, witr: 0 };
    }

    res.json({ success: true, tracker: data });
  } catch (err) {
    console.error('Error fetching Qaza tracker:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/qaza - Update user's qaza tracker
router.post('/', requireAuth, async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id || req.session?.adminUser?.id;
    
    if (!supabase) {
      return res.status(500).json({ success: false, message: 'Database connection failed.' });
    }

    const { fajr = 0, dhuhr = 0, asr = 0, maghrib = 0, isha = 0, witr = 0 } = req.body;

    const payload = {
      user_id: userId,
      fajr: Math.max(0, fajr),
      dhuhr: Math.max(0, dhuhr),
      asr: Math.max(0, asr),
      maghrib: Math.max(0, maghrib),
      isha: Math.max(0, isha),
      witr: Math.max(0, witr),
      updated_at: new Date().toISOString()
    };

    // Upsert (insert or update) based on user_id
    const { data, error } = await supabase
      .from('qaza_tracker')
      .upsert(payload, { onConflict: 'user_id' })
      .select();

    if (error) {
      return res.status(500).json({ success: false, message: error.message });
    }

    res.json({ success: true, tracker: data[0] });
  } catch (err) {
    console.error('Error updating Qaza tracker:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
