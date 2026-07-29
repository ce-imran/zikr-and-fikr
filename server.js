require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');
const fs = require('fs');

const { supabase, formatUser, isSupabaseConfigured } = require('./config/supabase');

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disabled for flexible PWA / inline icons / assets
  crossOriginEmbedderPolicy: false
}));
app.use(compression());
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Session Configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'islamic_blog_secret_key_2026',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production'
  }
}));

// Passport Setup
app.use(passport.initialize());
app.use(passport.session());

// Global User Identity Middleware: Ensure req.user and req.user.id are populated
app.use((req, res, next) => {
  if (!req.user && req.session && req.session.adminUser) {
    req.user = {
      id: req.session.adminUser.id || req.session.adminUser._id || 'admin-user-id',
      _id: req.session.adminUser.id || req.session.adminUser._id || 'admin-user-id',
      email: req.session.adminUser.email || 'admin@ceimran.in',
      name: req.session.adminUser.name || 'Authorized Manager',
      display_name: req.session.adminUser.name || 'Authorized Manager',
      role: req.session.adminUser.role || 'Content Administrator',
      avatar: req.session.adminUser.avatar || '',
      avatar_url: req.session.adminUser.avatar || ''
    };
  }
  if (req.user && !req.user.id) {
    req.user.id = req.user._id || req.session?.adminUser?.id || 'admin-user-id';
  }
  next();
});

// 1. Passport Session Serialization & Deserialization
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    if (!supabase) {
      return done(null, { id, email: 'admin@ceimran.in', full_name: 'Authorized Manager' });
    }
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error || !user) {
      return done(error || null, user ? formatUser(user) : false);
    }
    return done(null, formatUser(user));
  } catch (err) {
    return done(err, null);
  }
});

// 2. Google OAuth Strategy (Supabase PostgreSQL)
const googleClientId = process.env.GOOGLE_CLIENT_ID || 'dummy_google_client_id';
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET || 'dummy_google_client_secret';
const googleCallbackURL = process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback';

passport.use(new GoogleStrategy({
  clientID: googleClientId,
  clientSecret: googleClientSecret,
  callbackURL: googleCallbackURL,
  scope: ['profile', 'email']
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const googleId = profile.id;
    const email = profile.emails && profile.emails[0] ? profile.emails[0].value : `user_${googleId}@ceimran.in`;
    const fullName = profile.displayName || 'Authorized Manager';
    const avatar = profile.photos && profile.photos[0] ? profile.photos[0].value : '';

    if (!supabase) {
      return done(null, {
        id: googleId,
        google_id: googleId,
        email: email,
        full_name: fullName,
        avatar: avatar,
        is_admin: true
      });
    }

    // Query Supabase: Select user by google_id or email
    let existingUser = null;
    try {
      const { data } = await supabase
        .from('users')
        .select('*')
        .or(`google_id.eq.${googleId},email.eq.${email}`)
        .maybeSingle();
      existingUser = data;
    } catch (selectErr) {
      console.warn('Supabase users query warning:', selectErr.message);
    }

    if (existingUser) {
      return done(null, formatUser(existingUser));
    }

    // If user does not exist, attempt insert with schema fallback options
    let newUser = null;
    const candidatePayloads = [
      { google_id: googleId, email, full_name: fullName, avatar, is_admin: true },
      { google_id: googleId, email, full_name: fullName, is_admin: true },
      { google_id: googleId, email, name: fullName, is_admin: true },
      { email, full_name: fullName },
      { email }
    ];

    for (const payload of candidatePayloads) {
      try {
        const { data, error } = await supabase
          .from('users')
          .insert([payload])
          .select()
          .maybeSingle();

        if (!error && data) {
          newUser = data;
          break;
        }
      } catch (err) {
        // Try next candidate payload
      }
    }

    const finalUser = newUser || {
      id: googleId,
      google_id: googleId,
      email: email,
      full_name: fullName,
      avatar: avatar,
      is_admin: true
    };

    return done(null, formatUser(finalUser));
  } catch (err) {
    console.error('Google Strategy error:', err);
    return done(err, null);
  }
}));


// Serve Public Static Files & Uploads
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/auth'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/upload', require('./routes/upload'));

// Serve Frontend (dist or public fallback)
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(distPath, 'index.html'));
    }
  });
}

// Start Application Server
function startServer() {
  try {
    if (isSupabaseConfigured()) {
      console.log('⚡ Connected to Supabase PostgreSQL Database');
    } else {
      console.warn('⚠️ Running server without active Supabase configuration (mock fallback mode)');
    }

    app.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(`🕌 Islamic Daily Blog & CMS Application Active!`);
      console.log(`🌐 Server URL: http://localhost:${PORT}`);
      console.log(`🔑 Master Secret Key: ${process.env.ADMIN_SECRET_KEY || 'MasterKey2026#IslamicCMS'}`);
      console.log(`====================================================`);
    });
  } catch (err) {
    console.error('❌ Error launching application server:', err);
    process.exit(1);
  }
}

startServer();

