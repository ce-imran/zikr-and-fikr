import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

function TermsOfService() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-primary min-h-screen text-light text-left p-6 sm:p-10 font-sans">
      <div className="max-w-4xl mx-auto bg-white/5 backdrop-blur-md rounded-2xl p-8 sm:p-12 shadow-2xl border border-white/10 mt-10 sm:mt-16 mb-20 animate-fade-in-up">
        
        <div className="mb-10 border-b border-white/10 pb-6 flex items-center justify-between">
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-accent to-light bg-clip-text text-transparent">Terms of Service</h1>
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
              Please read these Terms of Service ("Terms", "Terms of Service") carefully before using the 
              Zikr and Fikr website and mobile application (the "Service").
            </p>
            <p className="mt-4">
              Your access to and use of the Service is conditioned on your acceptance of and compliance with 
              these Terms. These Terms apply to all visitors, users, and others who access or use the Service.
            </p>
          </section>

          <section className="bg-white/5 p-6 rounded-xl border border-white/5">
            <h2 className="text-2xl font-semibold text-accent mb-4">1. Accounts and Authentication</h2>
            <p className="mb-3">When you create an account with us, you must provide accurate, complete, and current information. Failure to do so constitutes a breach of the Terms.</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>You are responsible for safeguarding the credentials (e.g., Google Account) that you use to access the Service.</li>
              <li>You agree not to disclose your login credentials to any third party.</li>
              <li>We reserve the right to refuse service, terminate accounts, or remove content in our sole discretion.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-accent mb-4">2. Usage of Qaza Tracker</h2>
            <p>
              The Qaza Namaz Tracker provided within this application is intended as a personal spiritual aid. 
              While we strive to ensure data persistence and accuracy via cloud synchronization, we cannot 
              guarantee absolute data permanence. You agree that we are not liable for any data loss, 
              interruption, or discrepancies in the tracking service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-accent mb-4">3. Intellectual Property</h2>
            <p>
              The Service and its original content (excluding user-provided data), features, and functionality 
              are and will remain the exclusive property of Zikr and Fikr and its licensors. The Service is 
              protected by copyright, trademark, and other laws. Our content may not be used in connection 
              with any product or service without the prior written consent of the administrator.
            </p>
          </section>

          <section className="bg-white/5 p-6 rounded-xl border border-white/5">
            <h2 className="text-2xl font-semibold text-accent mb-4">4. Acceptable Use Policy</h2>
            <p className="mb-3">By using this application, you agree NOT to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Use the Service in any way that violates any applicable local, national, or international law.</li>
              <li>Attempt to bypass, exploit, or disrupt our security protocols or authentication systems.</li>
              <li>Use automated scripts, bots, or scrapers to access or modify data on the Service.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-accent mb-4">5. Disclaimer of Warranties</h2>
            <p>
              Your use of the Service is at your sole risk. The Service is provided on an "AS IS" and "AS AVAILABLE" 
              basis. The Service is provided without warranties of any kind, whether express or implied, including, 
              but not limited to, implied warranties of merchantability, fitness for a particular purpose, 
              non-infringement, or course of performance.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-accent mb-4">6. Changes to Terms</h2>
            <p>
              We reserve the right, at our sole discretion, to modify or replace these Terms at any time. 
              By continuing to access or use our Service after those revisions become effective, you agree 
              to be bound by the revised terms.
            </p>
          </section>

          <section className="mt-12 pt-8 border-t border-white/10 text-center">
            <p className="text-light/60">
              If you have any questions about these Terms, please contact the administrator.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

export default TermsOfService;
