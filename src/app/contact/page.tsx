'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2 } from 'lucide-react';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;

    setIsSubmitting(true);
    // Simulate sending message
    setTimeout(() => {
      setIsSubmitting(false);
      setSuccess(true);
      setName('');
      setEmail('');
      setMessage('');
      setTimeout(() => setSuccess(false), 5000);
    }, 1500);
  };

  return (
    <div className="w-full px-4 sm:px-6 py-6 text-foreground">
      <div className="text-center max-w-xl mx-auto mb-16 space-y-3">
        <span className="text-xs text-gold font-black uppercase tracking-wider">Contacts</span>
        <h1 className="text-3xl sm:text-5xl font-black font-outfit">How You Can Reach Us</h1>
        <p className="text-xs text-brand-gray font-semibold leading-relaxed">
          Have questions about orders, vendor registration, or system integrations? Drop us a line below.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Info Cards (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-805 rounded-[32px] p-6 shadow-sm space-y-6">
            
            {/* Phone */}
            <div className="flex gap-4 items-center">
              <div className="w-11 h-11 rounded-2xl bg-gold/10 text-gold flex items-center justify-center shrink-0">
                <Phone size={18} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-brand-gray uppercase tracking-wider">Call Support</h4>
                <p className="text-sm font-extrabold text-foreground mt-0.5">+1 (555) 019-9883</p>
              </div>
            </div>

            {/* Email */}
            <div className="flex gap-4 items-center">
              <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                <Mail size={18} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-brand-gray uppercase tracking-wider">Email Inquiry</h4>
                <p className="text-sm font-extrabold text-foreground mt-0.5">support@vrooklynfood.com</p>
              </div>
            </div>

            {/* Location */}
            <div className="flex gap-4 items-center">
              <div className="w-11 h-11 rounded-2xl bg-sky-500/10 text-sky-500 flex items-center justify-center shrink-0">
                <MapPin size={18} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-brand-gray uppercase tracking-wider">Our Headquarters</h4>
                <p className="text-sm font-extrabold text-foreground mt-0.5">12 Example Street, Brooklyn, NY</p>
              </div>
            </div>

            {/* Hours */}
            <div className="flex gap-4 items-center">
              <div className="w-11 h-11 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                <Clock size={18} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-brand-gray uppercase tracking-wider">Kitchen Hours</h4>
                <p className="text-sm font-extrabold text-foreground mt-0.5">Everyday: 10:00 AM - 11:00 PM</p>
              </div>
            </div>

          </div>
        </div>

        {/* Right Column: Contact Form (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-805 rounded-[32px] p-6 md:p-8 shadow-sm">
          
          {success && (
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mb-6 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 text-emerald-600 dark:text-emerald-400 px-4 py-3 rounded-2xl text-xs font-bold flex items-center gap-2"
            >
              <CheckCircle2 size={16} />
              <span>Message submitted successfully! We will get back to you shortly.</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-brand-gray uppercase tracking-wider pl-1 mb-1 block">
                Full Name
              </label>
              <input 
                type="text" 
                placeholder="Enter your name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl px-4 py-3.5 text-xs font-semibold focus:outline-none focus:border-gold transition-colors text-foreground"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-brand-gray uppercase tracking-wider pl-1 mb-1 block">
                Email Address
              </label>
              <input 
                type="email" 
                placeholder="Enter your email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl px-4 py-3.5 text-xs font-semibold focus:outline-none focus:border-gold transition-colors text-foreground"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-brand-gray uppercase tracking-wider pl-1 mb-1 block">
                Your Message
              </label>
              <textarea 
                rows={5}
                placeholder="Write your message details..."
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl px-4 py-3.5 text-xs font-semibold focus:outline-none focus:border-gold transition-colors text-foreground resize-none"
              />
            </div>

            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gold hover:bg-gold-hover text-brand-black disabled:opacity-50 font-extrabold text-xs py-4 rounded-2xl shadow-lg transition-transform duration-200 active:scale-[0.98] mt-2 flex items-center justify-center gap-1.5"
            >
              <Send size={14} />
              <span>{isSubmitting ? 'Submitting...' : 'Send Message'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
