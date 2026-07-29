# Nur & Hikmah — Daily Islamic Reflections & Custom CMS (PWA)

A complete, production-ready daily blogging Progressive Web Application (PWA) with a Custom CMS, built with Node.js, Express.js, MongoDB (Mongoose), Passport.js (Google OAuth + Secret Master Key Authentication), Web Push Notifications, and a modern Islamic-themed React frontend.

---

## 🌟 Key Features

### 1. 🕌 Islamic Aesthetic & UI/UX
- **Color Palette:** Deep Islamic Emerald (`#022c22`, `#044e37`), Warm Gold accents (`#d97706`, `#f59e0b`, `#fbbf24`), and Ivory/Parchment background (`#faf7f2`).
- **Typography:** Google Fonts `Amiri` (Arabic & Islamic title calligraphy) combined with `Outfit` and `Inter` for clean reading readability.
- **Backgrounds:** Subtle geometric arabesque SVG patterns with light & obsidian dark mode support.
- **Mobile-First Responsiveness:** Optimized for smartphones, tablets, and desktop devices.

### 2. 📱 Full PWA (Progressive Web App) Integration
- **Manifest File (`manifest.json`):** App name, icons (192x192, 512x512), theme colors, and display configuration.
- **Service Worker (`sw.js`):** Asset precaching, offline fallback strategy, and Push Notification event handling.
- **Offline Page (`offline.html`):** Custom Islamic-themed offline screen when disconnected.
- **Install App Banner:** Native "Add to Home Screen" prompt trigger.

### 3. 🔐 Restricted Admin CMS & Authentication
- **Dual Authentication System:**
  1. **Google OAuth 2.0 (Passport.js):** Secure login via Google Account.
  2. **Secret Master Key:** Restricted 2-4 authorized managers. Admins MUST enter the Secret Master Key to unlock the CMS.
- **CMS Dashboard Portal (`/admin/dashboard`):**
  - Live Analytics (Total Posts, Published Count, Draft Count, View Counter, Web Push Subscriber count).
  - Full CRUD operations (Create, Read, Update, Delete).
  - Draft vs. Published status toggle.
  - Quick Post Search & Filtering.
- **Manual Entry Only:** No AI auto-generation. Content is formatted via a Rich Text Editor (`react-quill-new`).
- **Multer Image Uploads:** Local storage image upload into `/uploads` with file extension validation and preview.

### 4. 📡 Web Push Notifications
- **VAPID Keys:** Web Push integration via `web-push`.
- **Automatic Broadcast:** When a new post is published from the CMS, a push notification is automatically broadcasted to all subscribed users.
- **One-Click Subscription:** Visitors can enable/disable push notifications from the site header or home page CTA.

### 5. 🔍 Search, Filtering & SEO Optimization
- **Full-Text Search:** Search past reflections by title, excerpt, content, or tags.
- **Category Filter:** Filter posts by *Daily Reflection*, *Quranic Insights*, *Hadith Commentary*, *Islamic History*, and *Fiqh & Character*.
- **Social Media Meta Tags:** Dynamic OpenGraph (`og:title`, `og:image`, `og:description`) and Twitter cards for WhatsApp, Telegram, and social sharing.

### 6. 💖 Custom Mandatory Footer
- Includes credit line:  
  **Made with ❤️ by [Imran Ahmad](https://ceimran.in)**

---

## 📁 Project Structure

```
MM/
├── .env                     # Environment Configuration
├── .env.example             # Configuration Template
├── server.js                # Node.js Express Application Entrypoint
├── package.json             # NPM Dependencies & Scripts
├── vite.config.js           # Vite Configuration with API Proxy
├── tailwind.config.js       # Tailwind CSS Config with Islamic Theme Tokens
├── postcss.config.js        # PostCSS Configuration
├── index.html               # Main HTML Template & PWA Service Worker Registration
├── models/
│   ├── User.js              # Mongoose User Schema
│   ├── Post.js              # Mongoose Post Schema
│   └── Subscription.js      # Mongoose Web Push Subscription Schema
├── routes/
│   ├── auth.js              # Google OAuth & Secret Key Verification Routes
│   ├── posts.js             # Public Blog & Search Routes
│   ├── admin.js             # CMS Dashboard CRUD Routes
│   ├── notifications.js     # Web Push VAPID & Subscription Routes
│   └── upload.js            # Multer Image Upload Route
├── services/
│   └── pushService.js       # Web Push Broadcast & VAPID Key Manager
├── public/
│   ├── manifest.json        # PWA Web Manifest
│   ├── sw.js                # PWA Service Worker & Push Event Listener
│   ├── offline.html         # PWA Offline Fallback Screen
│   ├── assets/              # SVG Icons & Default Cover Asset
│   ├── icons/               # 192x192 & 512x512 PWA Icons
│   └── uploads/             # Multer Uploaded Post Cover Images
└── src/
    ├── main.jsx             # React Application Entrypoint
    ├── App.jsx              # Main App Routing & State Management
    ├── index.css            # Tailwind Directives & Islamic Design Tokens
    ├── components/
    │   ├── Navbar.jsx       # Header Navigation with PWA Install & Push Buttons
    │   ├── Footer.jsx       # Footer with Imran Ahmad Hyperlink Credit
    │   ├── Hero.jsx         # Bismillah Calligraphy & Search Hero Section
    │   ├── PostCard.jsx     # Blog Card with Hover Effects & Category Badges
    │   ├── RichTextEditor.jsx # Quill Editor for Manual Post Creation
    │   ├── InstallPwaBanner.jsx # Add to Home Screen Banner
    │   └── SeoHead.jsx      # Dynamic Document Title & Meta Tag Setter
    ├── pages/
    │   ├── Home.jsx         # Public Blog Feed with Search & Filters
    │   ├── PostDetail.jsx   # Article Reader View with Social Share Buttons
    │   ├── AdminLogin.jsx   # Restricted Login (Google + Secret Key)
    │   └── AdminDashboard.jsx # CMS Portal (CRUD, Stats, Image Upload)
    └── services/
        ├── api.js           # API Fetch Helper
        └── pushService.js   # Push Notification Subscription Helper
```

---

## 🚀 Quick Start Guide

### 1. Environment Setup
The `.env` file is pre-configured with default values. You can customize variables:

```env
PORT=5000
SESSION_SECRET=islamic_blog_pwa_secret_session_key_2026
ADMIN_SECRET_KEY=MasterKey2026#IslamicCMS
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
VAPID_MAILTO=mailto:admin@ceimran.in
```

> **Note:** If `MONGODB_URI` is omitted, the application automatically boots an embedded `mongodb-memory-server` out-of-the-box!

### 2. Development Mode
To run both the Express backend API (Port 5000) and Vite frontend dev server (Port 3000):

```bash
npm run dev
```

### 3. Production Build & Server Launch
To build the frontend and serve it directly via Express:

```bash
# Step 1: Build Vite frontend assets into dist/
npm run build

# Step 2: Start Express production server
npm start
```

Open `http://localhost:5000` in your browser.

---

## 🔑 Admin CMS Access
- **Admin Login URL:** `http://localhost:5000/admin/login`
- **Secret Master Key:** `MasterKey2026#IslamicCMS`

---

## 👤 Author Credit
Made with ❤️ by **[Imran Ahmad](https://ceimran.in)**
