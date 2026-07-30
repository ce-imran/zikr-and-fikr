import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import FirstVisitPopup from './components/FirstVisitPopup';
import PushNotificationModal from './components/PushNotificationModal';
import FloatingActionGroup from './components/FloatingActionGroup';
import FloatingLeftActionGroup from './components/FloatingLeftActionGroup';
import Home from './pages/Home';
import Reflections from './pages/Reflections';
import PostDetail from './pages/PostDetail';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AuthorProfile from './pages/AuthorProfile';
import QazaTracker from './pages/QazaTracker';
import { fetchJson } from './services/api';

function AppContent({ authState, setAuthState }) {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin') || 
                       location.pathname.startsWith('/cms-access');
  const isNoLayoutRoute = isAdminRoute || location.pathname.startsWith('/author/');

  return (
    <div className="flex flex-col min-h-screen relative transition-colors">
      
      {!isAdminRoute && (
        <>
          <FirstVisitPopup />
          <PushNotificationModal />
          <FloatingActionGroup />
          <FloatingLeftActionGroup />
        </>
      )}

      {!isNoLayoutRoute && <Navbar />}

      {/* Main Route Content */}
      <div className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/reflections" element={<Reflections />} />
          <Route path="/post/:slug" element={<PostDetail />} />
          <Route path="/author/:name" element={<AuthorProfile />} />
          <Route path="/qaza-tracker" element={<QazaTracker authState={authState} />} />
          
          {/* Hidden CMS Access Route */}
          <Route
            path="/cms-access"
            element={<AdminLogin authState={authState} setAuthState={setAuthState} />}
          />
          <Route
            path="/admin/login"
            element={<Navigate to="/cms-access" replace />}
          />
          <Route
            path="/admin/dashboard"
            element={<AdminDashboard authState={authState} setAuthState={setAuthState} />}
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      {!isNoLayoutRoute && <Footer />}

    </div>
  );
}

export default function App() {
  const [authState, setAuthState] = useState({
    authenticated: false,
    secretVerified: false,
    user: null
  });

  useEffect(() => {
    // Check auth status on load
    fetchJson('/auth/me')
      .then((data) => {
        if (data.authenticated) {
          setAuthState({
            authenticated: true,
            secretVerified: data.secretVerified,
            user: data.user
          });
        }
      })
      .catch(() => {});

    // Listen for beforeinstallprompt
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      window.deferredPrompt = e;
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  return (
    <Router>
      <AppContent authState={authState} setAuthState={setAuthState} />
    </Router>
  );
}
