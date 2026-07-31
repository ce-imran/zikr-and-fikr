import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

function PrivacyPolicy() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-primary min-h-screen text-light text-left p-6 sm:p-10 font-sans">
      <div className="max-w-4xl mx-auto bg-white/5 backdrop-blur-md rounded-2xl p-8 sm:p-12 shadow-2xl border border-white/10 mt-10 sm:mt-16 mb-20 animate-fade-in-up">
        
        <div className="mb-10 border-b border-white/10 pb-6 flex items-center justify-between">
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-accent to-light bg-clip-text text-transparent">Privacy Policy</h1>
          <Link to="/" className="text-accent hover:text-light transition-colors duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </Link>
        </div>

        <div className="space-y-8 text-light/80 leading-relaxed text-lg">
          <section>
            <p className="mb-4 text-light">Last Updated: {new Date().toLocaleDateString()}</p>
            <p>
              Welcome to Zikr and Fikr ("we," "our," or "us"). Your privacy is deeply important to us. 
              This Privacy Policy explains how we collect, use, and protect your personal information 
              when you use our website, mobile application, and related services (collectively, the "Service").
            </p>
          </section>

          <section className="bg-white/5 p-6 rounded-xl border border-white/5">
            <h2 className="text-2xl font-semibold text-accent mb-4">1. Information We Collect</h2>
            <ul className="list-disc pl-6 space-y-3">
              <li>
                <strong>Google Account Data:</strong> When you log in using Google OAuth, we receive your basic profile information including your Name, Email Address, and Profile Picture. We do not have access to your Google password.
              </li>
              <li>
                <strong>App Usage Data (Qaza Tracker):</strong> If you use the Qaza Namaz Tracker, we securely store your tracking data (number of prayers missed/completed) linked to your account to provide you with seamless synchronization across devices.
              </li>
              <li>
                <strong>Cookies & Sessions:</strong> We use secure, HTTP-only cookies to maintain your login session. We do not use third-party tracking cookies for advertising.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-accent mb-4">2. How We Use Your Information</h2>
            <p className="mb-3">The information we collect is strictly used to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide, maintain, and improve the Service.</li>
              <li>Authenticate your identity and secure your account.</li>
              <li>Synchronize your personal Qaza Tracker data across your devices.</li>
              <li>Send you push notifications (only if you explicitly opt-in).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-accent mb-4">3. Data Security & Storage</h2>
            <p>
              Your data is stored securely using industry-standard encryption (Supabase). 
              We implement stringent security measures to protect against unauthorized access, alteration, 
              disclosure, or destruction of your personal information. Your Qaza Namaz records are private 
              to you and are never shared publicly.
            </p>
          </section>

          <section className="bg-white/5 p-6 rounded-xl border border-white/5">
            <h2 className="text-2xl font-semibold text-accent mb-4">4. Third-Party Services</h2>
            <p className="mb-3">We utilize trusted third-party services to operate our infrastructure:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Google:</strong> For secure OAuth authentication.</li>
              <li><strong>Supabase:</strong> For secure database and data storage.</li>
              <li><strong>Vercel:</strong> For secure web hosting.</li>
            </ul>
            <p className="mt-3 text-sm italic">These providers have their own privacy policies governing the data they process on our behalf.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-accent mb-4">5. Your Rights & Data Deletion</h2>
            <p>
              You have the right to access, update, or delete your personal information at any time. 
              If you wish to permanently delete your account and all associated Qaza Tracker data, 
              please contact us or use the account deletion options within the app (if available).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-accent mb-4">6. Changes to This Policy</h2>
            <p>
              We may update our Privacy Policy from time to time. We will notify you of any changes by 
              posting the new Privacy Policy on this page. You are advised to review this Privacy Policy 
              periodically for any changes.
            </p>
          </section>

          <section className="mt-12 pt-8 border-t border-white/10 text-center">
            <p className="text-light/60">
              If you have any questions about this Privacy Policy, please contact the administrator.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

export default PrivacyPolicy;
