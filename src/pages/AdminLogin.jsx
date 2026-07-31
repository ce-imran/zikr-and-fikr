import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { fetchJson } from '../services/api';
import SeoHead from '../components/SeoHead';
import { ShieldCheck, Key, Lock, CheckCircle2, AlertCircle, ArrowRight, Check, AlertTriangle } from 'lucide-react';

export default function AdminLogin({ authState, setAuthState }) {
  const [secretKey, setSecretKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [googleDone, setGoogleDone] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const formatError = (err) => {
    if (!err) return '';
    if (typeof err === 'string') return err;
    if (err.message && typeof err.message === 'string') return err.message;
    try {
      return JSON.stringify(err);
    } catch (e) {
      return 'An error occurred during authentication.';
    }
  };

  useEffect(() => {
    if (authState?.authenticated && authState?.secretVerified) {
      navigate('/admin/dashboard');
      return;
    }

    const queryParams = new URLSearchParams(location.search);
    const errParam = queryParams.get('error');
    const detailsParam = queryParams.get('details');
    
    if (errParam) {
      if (errParam === 'oauth_failed' || errParam === 'redirect_uri_mismatch') {
        const extra = detailsParam ? ` Details: ${detailsParam}` : '';
        setErrorMsg(`Google OAuth failed or configuration missing. Please try again or check Vercel environment variables.${extra}`);
      } else {
        setErrorMsg(formatError(errParam));
      }
    }

    // Check if Google login session is active
    fetchJson('/auth/me')
      .then((data) => {
        if (data.authenticated || data.googleAuthenticated) {
          setGoogleDone(true);
          setAuthState(prev => ({
            ...prev,
            authenticated: true,
            user: data.user
          }));
        }
      })
      .catch(() => {});
  }, [authState, location.search, navigate, setAuthState]);

  const handleGoogleOAuth = () => {
    window.location.href = '/api/auth/google';
  };

  const handleVerifySecret = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!googleDone) {
      setErrorMsg('Step 1 Required: Please sign in with Google first.');
      return;
    }

    if (!secretKey) {
      setErrorMsg('Step 2 Required: Please enter your Admin Password.');
      return;
    }

    setLoading(true);
    try {
      const data = await fetchJson('/auth/verify-secret', {
        method: 'POST',
        body: JSON.stringify({ secretKey })
      });

      if (data.success) {
        setSuccessMsg('Password Verified! Opening CMS Dashboard...');
        setAuthState({
          authenticated: true,
          secretVerified: true,
          user: data.user
        });
        setTimeout(() => {
          navigate('/admin/dashboard');
        }, 600);
      }
    } catch (err) {
      setErrorMsg(formatError(err) || 'Wrong Password! Access Denied. Redirecting to home page...');
      setAuthState({ authenticated: false, secretVerified: false, user: null });
      setTimeout(() => {
        navigate('/');
      }, 1400);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f1419] text-stone-100 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
      <SeoHead
        title="CMS Admin Access — Nur &amp; Hikmah"
        description="Dual Mandatory CMS Login (Google OAuth + Password)"
      />

      <div className="max-w-md w-full space-y-8 bg-[#161b22] border border-[#30363d] p-8 rounded-3xl shadow-2xl relative overflow-hidden">
        
        {/* Top Accent Line */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500"></div>

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-stone-900 border border-[#30363d] rounded-2xl flex items-center justify-center mx-auto text-amber-400 shadow-md">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="font-amiri text-3xl font-bold text-stone-100">
            CMS Admin Portal
          </h2>
          <p className="text-xs text-stone-400">
            Dual Mandatory Login: Google OAuth → Admin Password
          </p>
        </div>

        {errorMsg && (
          <div className="bg-red-950/80 border border-red-800 text-red-300 text-xs p-3.5 rounded-xl flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs p-3.5 rounded-xl flex items-start space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        <div className="space-y-6 pt-2">
          
          {/* STEP 1: MANDATORY GOOGLE OAUTH LOGIN */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-stone-300 flex items-center justify-between">
              <span>Step 1: Google OAuth Login (Mandatory)</span>
              {googleDone && (
                <span className="inline-flex items-center space-x-1 text-emerald-400 text-[11px]">
                  <Check className="w-3.5 h-3.5" />
                  <span>Authenticated</span>
                </span>
              )}
            </label>

            <button
              type="button"
              onClick={handleGoogleOAuth}
              className={`w-full flex items-center justify-center space-x-3 py-3 px-4 rounded-xl border font-semibold text-sm transition-all ${
                googleDone
                  ? 'bg-emerald-950/60 border-emerald-800 text-emerald-200 cursor-default'
                  : 'bg-[#0d1117] hover:bg-[#21262d] text-stone-200 border-[#30363d] shadow-sm'
              }`}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>{googleDone ? '✔ Google OAuth Verified' : 'Sign in with Google OAuth'}</span>
            </button>

          </div>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#30363d]"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#161b22] px-3 text-stone-400 text-[10px] font-semibold tracking-wider">
                Step 2 Verification
              </span>
            </div>
          </div>

          {/* STEP 2: MANDATORY PASSWORD VERIFICATION */}
          <form onSubmit={handleVerifySecret} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-300 mb-1.5 flex items-center space-x-1.5">
                <Key className="w-3.5 h-3.5 text-amber-400" />
                <span>Step 2: Enter Admin Password (Mandatory)</span>
              </label>
              <input
                type="password"
                required
                disabled={!googleDone}
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
                placeholder={googleDone ? "Enter admin password..." : "Complete Step 1 Google login first..."}
                className="w-full px-4 py-3 bg-[#0d1117] border border-[#30363d] rounded-xl text-sm font-sans focus:outline-none focus:ring-2 focus:ring-amber-500 text-white placeholder-stone-500 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !googleDone}
              className="w-full flex items-center justify-center space-x-2 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-sm py-3 px-4 rounded-xl shadow transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Lock className="w-4 h-4" />
              <span>{loading ? 'Verifying Password...' : 'Verify Password & Unlock CMS'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

        </div>

      </div>
    </div>
  );
}
