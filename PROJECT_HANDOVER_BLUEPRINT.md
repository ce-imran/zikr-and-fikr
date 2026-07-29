# 🚀 Agent Handoff & Project Transfer Blueprint

**Project Name:** Nur & Hikmah — Daily Islamic Reflections & Custom CMS (PWA)  
**Handover Date:** July 25, 2026  
**Author / Maintained By:** Imran Ahmad ([https://ceimran.in](https://ceimran.in))

---

## 1. 📌 Executive Overview & Core Objective

**Nur & Hikmah** is a production-ready daily blogging Progressive Web Application (PWA) integrated with a Custom CMS. It is built with Node.js, Express.js, MongoDB (with an automatic out-of-the-box `mongodb-memory-server` fallback), Passport.js (Google OAuth 2.0 + Master Secret Key authentication), Web Push Notifications, Firebase Cloud Messaging (FCM), and a modern Islamic-themed React 19 frontend styled with Tailwind CSS.

---

## 2. 🛠️ Tech Stack & Key Dependencies

| Component | Technology / Library | Purpose |
| :--- | :--- | :--- |
| **Frontend Framework** | React 19, Vite 6, React Router DOM v7 | SPA Routing & Component Rendering |
| **Styling & Assets** | Tailwind CSS v4, Lucide React, Google Fonts (`Amiri`, `Outfit`, `Inter`) | Islamic Emerald (`#022c22`), Gold (`#d97706`), & Parchment theme |
| **Rich Text Editor** | `react-quill-new`, `quill` | Manual WYSIWYG article creation for CMS |
| **Backend Core** | Node.js, Express.js v4, Compression, Helmet, CORS | RESTful API, static serving, HTTP security headers |
| **Database & ODM** | MongoDB, Mongoose v9, `mongodb-memory-server` | User, Post, & Push Subscription data persistence |
| **Authentication** | Passport.js (`passport-google-oauth20`), Express Session | Dual-layer auth (Google OAuth + Master Secret Key) |
| **Push Notifications & PWA** | `web-push`, Firebase Cloud Messaging (`firebase`, `firebase-admin`), `sw.js` | Web Push notifications, offline fallback, PWA install prompt |
| **File Management** | Multer | Local cover image upload handling into `/public/uploads` |

---

## 3. 📂 Workspace Directory Structure

```
MM/
├── .env                          # Local Environment Configuration
├── server.js                     # Main Express App & Database Bootstrapper
├── package.json                  # Dependencies & npm scripts
├── vite.config.js                # Vite bundler & API dev proxy setup
├── tailwind.config.js            # Tailwind theme tokens & colors
├── config/
│   └── supabase.js               # Optional Supabase client configuration
├── models/
│   ├── User.js                   # Mongoose User Schema
│   ├── Post.js                   # Mongoose Post Schema (slug, status, category, tags)
│   └── Subscription.js           # Mongoose Web Push Subscription Schema
├── routes/
│   ├── auth.js                   # Google OAuth & Master Secret Key endpoints
│   ├── posts.js                  # Public blog feed, search & category filter
│   ├── admin.js                  # CMS Dashboard CRUD & publishing logic
│   ├── notifications.js          # VAPID public key & Web Push subscription API
│   └── upload.js                 # Image upload endpoint (Multer)
├── services/
│   ├── pushService.js            # Web Push broadcast logic via web-push
│   └── firebaseAdmin.js          # (NEW) Firebase Admin SDK backend setup
├── public/
│   ├── manifest.json             # PWA Web Manifest
│   ├── sw.js                     # Main PWA Service Worker
│   ├── firebase-messaging-sw.js  # (NEW) Firebase FCM Service Worker
│   ├── offline.html              # Islamic offline fallback page
│   └── uploads/                  # Local cover image uploads directory
└── src/
    ├── main.jsx                  # React application entrypoint
    ├── App.jsx                   # Application router & layout structure
    ├── index.css                 # Custom CSS directives & design tokens
    ├── components/
    │   ├── Navbar.jsx            # Header navigation & search bar
    │   ├── Footer.jsx            # Footer with author hyperlink credit
    │   ├── Hero.jsx              # Islamic Bismillah calligraphy hero section
    │   ├── PostCard.jsx          # Reflection card grid item
    │   ├── RichTextEditor.jsx    # Quill text editor for CMS
    │   ├── Toast.jsx             # (NEW) Global toast alert component
    │   ├── FloatingActionGroup.jsx # (NEW) Floating action buttons widget
    │   ├── AskFatwaModal.jsx     # (NEW) Modal for submitting religious questions
    │   ├── PushNotificationModal.jsx # (NEW) Web Push prompt modal
    │   ├── PwaInstallInstructionsModal.jsx # (NEW) iOS/Android installation guide
    │   └── FirstVisitPopup.jsx   # First-time visitor welcome modal
    ├── pages/
    │   ├── Home.jsx              # Home reflection feed page
    │   ├── Reflections.jsx       # (NEW) Dedicated reflections page
    │   ├── PostDetail.jsx        # Article reader view
    │   ├── AdminLogin.jsx        # Dual-authentication login screen
    │   └── AdminDashboard.jsx    # CMS management portal
    ├── services/
    │   ├── api.js                # API client helper
    │   ├── pushService.js        # Web Push client helper
    │   └── firebaseClient.js     # (NEW) Firebase Cloud Messaging client helper
    └── utils/                    # Helper utilities
```

---

## 4. 📊 Current Git Status & Uncommitted Work

The codebase has pending modifications and untracked components that represent recent feature enhancements.

### Modified Files:
- `.env`
- `config/supabase.js`
- `dist/index.html`, `dist/manifest.json`, `dist/offline.html`
- `index.html`, `package.json`, `package-lock.json`
- `models/Post.js`
- `public/manifest.json`, `public/offline.html`
- `routes/admin.js`, `routes/posts.js`
- `services/pushService.js`
- `src/App.jsx`, `src/index.css`
- `src/components/Footer.jsx`, `src/components/Hero.jsx`, `src/components/Navbar.jsx`, `src/components/PostCard.jsx`
- `src/pages/Home.jsx`, `src/pages/PostDetail.jsx`

### Newly Added (Untracked) Files:
- `services/firebaseAdmin.js`
- `public/firebase-messaging-sw.js` & `dist/firebase-messaging-sw.js`
- `src/services/firebaseClient.js`
- `src/components/AskFatwaModal.jsx`
- `src/components/FloatingActionGroup.jsx`
- `src/components/FloatingInstallButton.jsx`
- `src/components/PushNotificationModal.jsx`
- `src/components/PwaInstallInstructionsModal.jsx`
- `src/components/Toast.jsx`
- `src/pages/Reflections.jsx`
- `src/utils/`

---

## 5. 🔑 Environment Configuration & Credentials

Local environment configuration is stored in [`.env`](file:///D:/Downloads/MM/.env):

```env
PORT=5000
SESSION_SECRET=islamic_blog_pwa_secret_session_key_2026
ADMIN_SECRET_KEY=MasterKey2026#IslamicCMS
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
VAPID_MAILTO=mailto:admin@ceimran.in
```

> **Note on Database:** If `MONGODB_URI` is not provided in `.env`, the server automatically initializes an in-memory database (`mongodb-memory-server`) on startup with sample data pre-seeded.

---

## 6. 🔐 Admin Access & Credentials

- **Admin Login Endpoint:** `http://localhost:5000/admin/login`
- **Master Secret Key:** `MasterKey2026#IslamicCMS`
- **Authentication Strategy:** 
  1. Login via Google OAuth 2.0.
  2. Input the Master Secret Key to unlock full CMS administrative access (`req.session.user.isMasterAdmin = true`).

---

## 7. 🚀 Operational Commands for the Next Agent

### Start Development Server (Backend on Port 5000 + Frontend Vite Dev Server on Port 3000)
```bash
npm run dev
```

### Build Frontend & Launch Production Server
```bash
# Step 1: Compile React production bundle into dist/
npm run build

# Step 2: Start Express production server on Port 5000
npm start
```

### Commit Pending Changes to Git
```bash
git add .
git commit -m "feat: Add Firebase Messaging, Ask Fatwa Modal, and UI enhancements"
```

---

## 8. 🎯 Immediate Next Tasks for Incoming Agent

1. **Review and Commit Pending Changes:** Run `git status` and verify all new components (`AskFatwaModal`, `Firebase Client/Admin`, `FloatingActionGroup`, etc.) before committing to `master`.
2. **Verify Firebase FCM & VAPID Push Integration:** Test client push registration and backend broadcast functionality.
3. **Validate CMS Workflows:** Ensure rich text post creation, image uploads (`/uploads`), and status toggles operate smoothly.
4. **Production Build Check:** Execute `npm run build` and `npm start` to confirm static asset serving from `/dist`.
