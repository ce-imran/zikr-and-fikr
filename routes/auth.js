const express = require('express');
const router = express.Router();
const passport = require('passport');
const { supabase, formatUser } = require('../config/supabase');

// In-memory store for session user profile state
const knownAdmins = new Map(); // email -> { name, role, avatar }

// Rate limiting state for brute-force protection
const failedAttempts = new Map(); // IP -> { count, lastAttempt }

// GET /api/auth/me - Return current user & CMS verification status
router.get('/me', async (req, res) => {
  if (req.user || req.session.adminUser) {
    const user = req.user || req.session.adminUser;
    const email = user.email || 'admin@ceimran.in';
    const userId = user._id || user.id || 'admin-1';
    let isFirstTime = user.isFirstTime === true;

    let dbUser = {};
    if (supabase) {
      try {
        const { data: userData } = await supabase
          .from('users')
          .select('display_name, title, role, avatar_url')
          .eq('id', userId)
          .single();
        
        if (userData) {
          dbUser = userData;
          if (dbUser.display_name) isFirstTime = false;
        }
      } catch (err) {
        console.error("Supabase fetch user error:", err);
      }
    }

    const knownAdmin = knownAdmins.get(email);

    return res.json({
      authenticated: true,
      googleAuthenticated: true,
      user: {
        id: userId,
        email: email,
        name: dbUser.display_name || (knownAdmin && knownAdmin.name) || user.name || 'Authorized Manager',
        display_name: dbUser.display_name || (knownAdmin && knownAdmin.name) || user.name || 'Authorized Manager',
        role: dbUser.role || dbUser.title || (knownAdmin && knownAdmin.role) || user.role || 'Content Administrator',
        title: dbUser.title || dbUser.role || (knownAdmin && knownAdmin.role) || user.role || 'Content Administrator',
        avatar: dbUser.avatar_url || (knownAdmin && knownAdmin.avatar) || user.avatar || 'https://ui-avatars.com/api/?name=Admin&background=0f172a&color=fff',
        avatar_url: dbUser.avatar_url || (knownAdmin && knownAdmin.avatar) || user.avatar || 'https://ui-avatars.com/api/?name=Admin&background=0f172a&color=fff',
        isFirstTime: isFirstTime
      },
      secretVerified: req.session.secretVerified === true
    });
  }

  return res.json({
    authenticated: false,
    googleAuthenticated: false,
    secretVerified: false,
    user: null
  });
});

// POST /api/auth/verify-secret - Verify Secret Master Key (MANDATORY STEP 2 after Google Login)
router.post('/verify-secret', async (req, res) => {
  const ip = req.ip || req.socket.remoteAddress || 'client-ip';
  const now = Date.now();
  const attemptInfo = failedAttempts.get(ip) || { count: 0, lastAttempt: 0 };

  // Check if Google OAuth login (Step 1) is completed
  const activeUser = req.user || req.session.adminUser;
  if (!activeUser) {
    return res.status(401).json({
      success: false,
      message: 'Google login is mandatory before entering password.',
      redirectUrl: '/cms-access'
    });
  }

  // Rate limiting check
  if (attemptInfo.count >= 5 && (now - attemptInfo.lastAttempt) < 30000) {
    const remainingSec = Math.ceil((30000 - (now - attemptInfo.lastAttempt)) / 1000);
    return res.status(429).json({
      success: false,
      message: `Too many failed attempts. Please wait ${remainingSec} seconds.`
    });
  }

  const { secretKey, fullName } = req.body;
  const masterKey = process.env.SECRET_MASTER_KEY || process.env.ADMIN_SECRET_KEY || 'MasterKey2026#IslamicCMS';

  if (!secretKey) {
    return res.status(400).json({ success: false, message: 'Admin Password is required.' });
  }

  // IF PASSWORD IS WRONG: Return 401, destroy session, and instruct redirect to main frontend page (/)
  if (secretKey.trim() !== masterKey.trim()) {
    failedAttempts.set(ip, { count: attemptInfo.count + 1, lastAttempt: now });

    req.logout(() => {
      req.session.destroy(() => {
        res.clearCookie('connect.sid');
        return res.status(401).json({
          success: false,
          redirectUrl: '/',
          message: 'Wrong Password! Access Denied. Redirecting to home page...'
        });
      });
    });
    return;
  }

  // IF PASSWORD IS CORRECT: Grant access & unlock CMS Dashboard
  failedAttempts.delete(ip);

  const userEmail = activeUser.email || 'admin@ceimran.in';
  let existingAdmin = knownAdmins.get(userEmail);

  let finalName = existingAdmin?.name || activeUser.name || fullName || 'Authorized Manager';
  if (fullName && fullName.trim()) {
    finalName = fullName.trim();
  }

  const isFirstTime = !existingAdmin && !fullName && (!activeUser || !activeUser.name);

  knownAdmins.set(userEmail, {
    name: finalName,
    role: existingAdmin?.role || 'Content Administrator',
    email: userEmail
  });

  // Upsert user in Supabase users table
  if (supabase) {
    try {
      await supabase.from('users').upsert({
        email: userEmail,
        full_name: finalName,
        secret_verified: true,
        last_login: new Date().toISOString()
      }, { onConflict: 'email' });
    } catch (sbErr) {
      console.warn('Supabase user upsert warning:', sbErr.message);
    }
  }

  req.session.secretVerified = true;
  req.session.adminUser = {
    id: activeUser._id || activeUser.id || 'admin-cms-1',
    name: finalName,
    email: userEmail,
    role: existingAdmin?.role || 'Content Administrator',
    avatar: activeUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(finalName)}&background=0f172a&color=fff`,
    isFirstTime: isFirstTime
  };

  return res.json({
    success: true,
    message: 'Password Verified! CMS Dashboard Unlocked.',
    user: req.session.adminUser,
    secretVerified: true
  });
});

const multer = require('multer');
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// POST & PUT /api/auth/profile & /api/users/profile - Save Profile Setup details strictly in Supabase
const handleProfileUpdate = async (req, res) => {
  try {
    if (!req.user && req.session?.adminUser) {
      req.user = req.session.adminUser;
    }
    if (req.user && !req.user.id) {
      req.user.id = req.user._id || req.session?.adminUser?.id;
    }

    console.log("Profile Update Payload:", req.body, "For User ID:", req.user?.id);

    if (!req.user?.id) {
      return res.status(401).json({ error: "Unauthorized: Missing user ID" });
    }

    if (!supabase) {
      console.error("Supabase Profile Update Error: Supabase client is not connected.");
      return res.status(500).json({ error: "Supabase client is not connected." });
    }

    const userId = req.user.id;
    const email = req.user.email || req.session?.adminUser?.email || 'admin@ceimran.in';

    const fullName = (req.body.fullName || req.body.display_name || req.body.name || req.body.full_name || '').trim();
    const role = (req.body.role || req.body.title || '').trim();
    let avatarUrl = (req.body.avatarUrl || req.body.avatar_url || req.body.avatar || '').trim();

    // If an image file was provided in the profile update request, upload it directly to Supabase Storage
    if (req.file) {
      const filePath = `avatars/${userId}_${Date.now()}_${req.file.originalname}`;
      const { data: storageData, error: storageError } = await supabase
        .storage
        .from('profile_pictures')
        .upload(filePath, req.file.buffer, {
          contentType: req.file.mimetype
        });

      if (storageError) {
        console.error("Supabase Profile Update Error:", storageError);
        return res.status(500).json({ error: storageError.message });
      }

      const { data: urlData } = supabase
        .storage
        .from('profile_pictures')
        .getPublicUrl(filePath);

      avatarUrl = urlData?.publicUrl || '';
    }

    // Build update object for Supabase users table strictly mapping display_name, title, role, avatar_url
    const updatePayload = {
      display_name: req.body.fullName || req.body.display_name || req.body.name || req.body.full_name || fullName,
      role: req.body.role || req.body.title || role,
      title: req.body.title || req.body.role || role,
      avatar_url: avatarUrl || req.body.avatarUrl || req.body.avatar_url || req.body.avatar
    };

    // Clean undefined values
    Object.keys(updatePayload).forEach(k => (updatePayload[k] === undefined || updatePayload[k] === '') && delete updatePayload[k]);

    // Strict Supabase Database Update targeting user ID
    let query = supabase.from('users').update(updatePayload);
    if (userId) {
      query = query.eq('id', userId);
    } else if (email) {
      query = query.eq('email', email);
    }

    const { data, error } = await query.select();

    if (error) {
      console.error("Supabase Profile Update Error:", error);
      return res.status(500).json({ error: error.message });
    }

    // Update in-memory session user state
    if (req.session?.adminUser) {
      if (fullName) req.session.adminUser.name = fullName;
      if (role) req.session.adminUser.role = role;
      if (avatarUrl) req.session.adminUser.avatar = avatarUrl;
      req.session.adminUser.isFirstTime = false;
    }
    if (req.user) {
      if (fullName) req.user.name = fullName;
      if (role) req.user.role = role;
      if (avatarUrl) req.user.avatar = avatarUrl;
      req.user.isFirstTime = false;
    }

    knownAdmins.set(email, {
      name: fullName || req.user.name,
      role: role || req.user.role,
      avatar: avatarUrl || req.user.avatar
    });

    const updatedUser = {
      id: userId,
      email: email,
      name: fullName || req.user.name,
      display_name: fullName || req.user.name,
      title: req.body.title || role || req.user.title || req.user.role,
      role: role || req.body.title || req.user.role || req.user.title,
      avatar: avatarUrl || req.user.avatar,
      avatar_url: avatarUrl || req.user.avatar,
      isFirstTime: false
    };

    return res.status(200).json({
      success: true,
      message: 'Profile setup updated successfully!',
      user: updatedUser,
      data
    });
  } catch (err) {
    console.error('Profile Update Exception:', err);
    return res.status(500).json({ error: err.message });
  }
};

router.post('/profile', upload.single('image'), handleProfileUpdate);
router.put('/profile', upload.single('image'), handleProfileUpdate);

// PUT & POST /api/auth/update-dp & /api/users/avatar - Upload Custom Profile Picture directly to Supabase Storage
const handleAvatarUpload = async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    if (!supabase) {
      console.error('Supabase Storage Error: Supabase client is not connected.');
      return res.status(500).json({ error: 'Supabase client is not connected.' });
    }

    const userId = req.user?.id || req.user?._id || req.session?.adminUser?.id || req.session?.adminUser?._id || 'user';
    const filePath = `avatars/${userId}_${Date.now()}_${file.originalname}`;

    // Upload buffer directly to Supabase Storage bucket 'profile_pictures'
    const { data, error } = await supabase
      .storage
      .from('profile_pictures')
      .upload(filePath, file.buffer, {
        contentType: file.mimetype
      });

    if (error) {
      console.error('Supabase Storage Upload Error:', error);
      return res.status(500).json({ error: error.message });
    }

    // Fetch public URL
    const { data: urlData } = supabase
      .storage
      .from('profile_pictures')
      .getPublicUrl(filePath);

    const publicUrl = urlData?.publicUrl || '';

    // Update avatar_url column in users table for authenticated user
    const { error: dbError } = await supabase
      .from('users')
      .update({ avatar_url: publicUrl, avatar: publicUrl })
      .eq('id', userId);

    if (dbError) {
      console.warn('Supabase DB avatar update warning:', dbError.message);
    }

    // Update session user state
    if (req.session?.adminUser) {
      req.session.adminUser.avatar = publicUrl;
    }
    if (req.user) {
      req.user.avatar = publicUrl;
    }

    return res.status(200).json({
      success: true,
      message: 'Profile picture uploaded to Supabase Storage successfully!',
      avatar_url: publicUrl,
      publicUrl: publicUrl,
      url: publicUrl
    });
  } catch (err) {
    console.error('Update DP Error:', err);
    return res.status(500).json({ error: err.message });
  }
};

router.put('/update-dp', upload.single('image'), handleAvatarUpload);
router.post('/update-dp', upload.single('image'), handleAvatarUpload);
router.put('/avatar', upload.single('image'), handleAvatarUpload);
router.post('/avatar', upload.single('image'), handleAvatarUpload);

// Google OAuth Login Trigger (Step 1)
router.get('/google', (req, res, next) => {
  passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
});

// POST /api/auth/google-dev - Local Dev Fallback for Google Step 1
router.post('/google-dev', (req, res) => {
  req.session.adminUser = {
    id: 'google-oauth-user-dev',
    name: 'Authorized Google Manager',
    email: 'admin@ceimran.in',
    avatar: 'https://ui-avatars.com/api/?name=Google+Admin&background=0f172a&color=fff',
    isFirstTime: false
  };
  return res.json({
    success: true,
    message: 'Google Step 1 completed via local fallback!',
    googleAuthenticated: true,
    user: req.session.adminUser
  });
});

// Google OAuth Callback
router.get('/google/callback', (req, res, next) => {
  passport.authenticate('google', { failureRedirect: '/cms-access?error=oauth_failed' }, (err, user) => {
    if (err || !user) {
      return res.redirect('/cms-access?error=oauth_failed');
    }
    req.logIn(user, (loginErr) => {
      if (loginErr) return res.redirect('/cms-access?error=session_error');
      const targetUrl = req.session.secretVerified ? '/admin/dashboard' : '/cms-access?step=password_required';
      return res.redirect(targetUrl);
    });
  })(req, res, next);
});

// POST /api/auth/logout - End admin CMS session
router.post('/logout', (req, res) => {
  req.logout(() => {
    req.session.destroy(() => {
      res.clearCookie('connect.sid');
      return res.json({ success: true, message: 'CMS Session Terminated.' });
    });
  });
});

module.exports = router;

