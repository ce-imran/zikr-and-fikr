import React, { useState } from 'react';
import { X, Send, HelpCircle, User, Mail, Phone, MessageSquare } from 'lucide-react';

export default function AskFatwaModal({ isOpen, onClose }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [question, setQuestion] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!fullName.trim() || !whatsappNumber.trim() || !question.trim()) {
      setErrorMsg('Please fill in your name, WhatsApp number, and question.');
      return;
    }

    setErrorMsg('');

    // Format encoded message string for WhatsApp redirect
    const rawMessage = `Assalamu Alaikum,\n\nI have a Fatwa / Islamic Question from *Dhikr & Fikr*:\n\n👤 *Full Name:* ${fullName.trim()}\n📧 *Email:* ${email.trim() || 'N/A'}\n📱 *WhatsApp:* ${whatsappNumber.trim()}\n\n❓ *Question / Query:* ${question.trim()}`;

    const encodedText = encodeURIComponent(rawMessage);
    const whatsappUrl = `https://wa.me/919801649235?text=${encodedText}`;

    // Redirect user to WhatsApp chat
    window.open(whatsappUrl, '_blank');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#ffffff] dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] text-[#24292f] dark:text-[#c9d1d9] rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative space-y-6">
        
        {/* Decorative Top Accent */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 rounded-t-3xl"></div>

        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center font-bold shadow">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-amiri text-2xl font-bold text-[#24292f] dark:text-[#f0f6fc]">
                Ask a Fatwa / Question
              </h3>
              <p className="text-xs text-[#57606a] dark:text-[#8b949e]">
                Submit your query directly to our scholars via WhatsApp.
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="text-[#8b949e] hover:text-[#24292f] dark:hover:text-white p-1.5 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs rounded-xl font-semibold">
            {errorMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 font-sans">
          
          <div>
            <label className="block text-xs font-bold text-[#24292f] dark:text-[#c9d1d9] mb-1 flex items-center space-x-1">
              <User className="w-3.5 h-3.5 text-amber-500" />
              <span>Full Name *</span>
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Imran Ahmad"
              className="w-full px-4 py-2.5 bg-[#f6f8fa] dark:bg-[#0d1117] border border-[#d0d7de] dark:border-[#30363d] text-[#24292f] dark:text-[#c9d1d9] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#24292f] dark:text-[#c9d1d9] mb-1 flex items-center space-x-1">
                <Mail className="w-3.5 h-3.5 text-amber-500" />
                <span>Email Address</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full px-4 py-2.5 bg-[#f6f8fa] dark:bg-[#0d1117] border border-[#d0d7de] dark:border-[#30363d] text-[#24292f] dark:text-[#c9d1d9] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#24292f] dark:text-[#c9d1d9] mb-1 flex items-center space-x-1">
                <Phone className="w-3.5 h-3.5 text-amber-500" />
                <span>WhatsApp Number *</span>
              </label>
              <input
                type="tel"
                required
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                placeholder="+91 9801649235"
                className="w-full px-4 py-2.5 bg-[#f6f8fa] dark:bg-[#0d1117] border border-[#d0d7de] dark:border-[#30363d] text-[#24292f] dark:text-[#c9d1d9] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#24292f] dark:text-[#c9d1d9] mb-1 flex items-center space-x-1">
              <MessageSquare className="w-3.5 h-3.5 text-amber-500" />
              <span>Your Question / Fatwa *</span>
            </label>
            <textarea
              required
              rows="4"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Please type your question clearly..."
              className="w-full px-4 py-2.5 bg-[#f6f8fa] dark:bg-[#0d1117] border border-[#d0d7de] dark:border-[#30363d] text-[#24292f] dark:text-[#c9d1d9] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="pt-2 flex items-center justify-end space-x-3 border-t border-[#d0d7de] dark:border-[#30363d]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-[#57606a] dark:text-[#8b949e]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow transition-transform hover:scale-105"
            >
              <Send className="w-4 h-4" />
              <span>Send via WhatsApp</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
