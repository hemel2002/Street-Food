'use client';

import React, { useState } from 'react';
import { ArrowLeft, User, LogOut, ShieldCheck, ShoppingBag, PlusCircle, UserCheck, Lock, Sparkles, Phone, Compass } from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import { useRouter } from 'next/navigation';

export default function AuthView() {
  const { currentUser, loginUser, logoutUser, updateProfile } = useApp();
  const router = useRouter();
  
  // Login input states
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'customer' | 'vendor' | 'admin'>('customer');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Profile Edit States
  const [profileName, setProfileName] = useState(currentUser?.full_name || '');
  const [profilePhone, setProfilePhone] = useState(currentUser?.phone || '');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');

  // 3D Card States
  const [isFlipped, setIsFlipped] = useState(false);

  // Parallax motion tracking
  const x = useMotionValue(200);
  const y = useMotionValue(260);

  const rotateX = useTransform(y, [0, 520], [12, -12]);
  const rotateY = useTransform(x, [0, 400], [-12, 12]);

  React.useEffect(() => {
    if (currentUser) {
      setProfileName(currentUser.full_name);
      setProfilePhone(currentUser.phone || '');
    }
  }, [currentUser]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set(e.clientX - rect.left);
    y.set(e.clientY - rect.top);
  };

  const handleMouseLeave = () => {
    x.set(200);
    y.set(260);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setIsUpdatingProfile(true);
    setProfileSuccessMsg('');

    const success = await updateProfile({
      full_name: profileName,
      phone: profilePhone,
    });

    setIsUpdatingProfile(false);
    if (success) {
      setProfileSuccessMsg('✓ Profile details updated successfully!');
      setTimeout(() => setProfileSuccessMsg(''), 3000);
    } else {
      alert('Failed to update profile.');
    }
  };

  const handleQuickLogin = async (selectedEmail: string, selectedRole: 'customer' | 'vendor' | 'admin') => {
    setIsLoggingIn(true);
    await loginUser(selectedEmail, selectedRole);
    setIsLoggingIn(false);
    router.push(selectedRole === 'admin' ? '/admin' : selectedRole === 'vendor' ? '/dashboard' : '/menu');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsLoggingIn(true);
    await loginUser(email, role);
    setIsLoggingIn(false);
    router.push(role === 'admin' ? '/admin' : role === 'vendor' ? '/dashboard' : '/menu');
  };

  return (
    <div className="relative min-h-[90vh] flex flex-col items-center justify-center px-4 py-8 overflow-hidden text-foreground">
      
      {/* Animated ambient backdrop elements */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-gold/10 dark:bg-gold/5 blur-[80px] -z-10 animate-pulse pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-red-500/10 dark:bg-red-500/5 blur-[90px] -z-10 animate-pulse pointer-events-none" style={{ animationDelay: '2s' }} />

      <div className="w-full max-w-md mx-auto space-y-6">
        
        {/* Back Button */}
        <button 
          onClick={() => router.push('/menu')}
          className="flex items-center gap-2 text-xs font-black text-brand-gray hover:text-gold transition-colors uppercase tracking-wider pl-4"
        >
          <ArrowLeft size={14} />
          <span>Back to Stalls</span>
        </button>

        {currentUser ? (
          /* ==========================================
             LOGGED IN VIEW
             ========================================== */
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* 3D Glass Profile Card */}
            <div className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border border-neutral-200/50 dark:border-neutral-800 rounded-[35px] p-8 text-center shadow-2xl relative overflow-hidden">
              <div className="absolute -right-8 -top-8 w-24 h-24 bg-gold/10 rounded-full blur-xl pointer-events-none" />
              
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-gold to-yellow-400 text-brand-black flex items-center justify-center mx-auto mb-4 text-2xl font-black shadow-lg border-4 border-white dark:border-neutral-950">
                {currentUser.full_name[0]?.toUpperCase() || 'U'}
              </div>
              
              <h3 className="text-xl font-black font-outfit text-foreground leading-tight">
                {currentUser.full_name}
              </h3>
              
              <p className="text-xs text-brand-gray font-bold mt-1.5">
                {currentUser.email}
              </p>

              <div className="mt-4 inline-flex items-center gap-1.5 bg-neutral-100 dark:bg-neutral-800 text-[10px] font-black uppercase tracking-wider px-3.5 py-1.5 rounded-full text-neutral-500 dark:text-neutral-400 border border-neutral-200/40 dark:border-neutral-700/50">
                <Compass size={12} className="text-gold" />
                <span>Role: {currentUser.role}</span>
              </div>
            </div>

            {/* Edit Profile Form */}
            <div className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border border-neutral-200/50 dark:border-neutral-800 rounded-[32px] p-6 shadow-xl">
              <h4 className="text-[10px] font-black uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-4 flex items-center gap-1.5 pl-1">
                <User size={12} className="text-gold" />
                <span>Profile Settings</span>
              </h4>

              {profileSuccessMsg && (
                <div className="mb-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 text-emerald-600 dark:text-emerald-400 px-4 py-2.5 rounded-2xl text-[10px] font-bold">
                  {profileSuccessMsg}
                </div>
              )}

              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="text-[9px] font-black text-brand-gray uppercase tracking-wider pl-1 mb-1 block">
                    Full Name
                  </label>
                  <input 
                    type="text" 
                    required
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl px-4 py-3.5 text-xs font-semibold focus:outline-none focus:border-gold transition-colors text-foreground"
                  />
                </div>

                <div>
                  <label className="text-[9px] font-black text-brand-gray uppercase tracking-wider pl-1 mb-1 block">
                    Phone Number
                  </label>
                  <div className="relative">
                    <input 
                      type="text" 
                      value={profilePhone}
                      onChange={(e) => setProfilePhone(e.target.value)}
                      className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl pl-10 pr-4 py-3.5 text-xs font-semibold focus:outline-none focus:border-gold transition-colors text-foreground"
                    />
                    <Phone size={14} className="absolute left-3.5 top-[15px] text-brand-gray" />
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={isUpdatingProfile}
                  className="w-full bg-gold hover:bg-gold-hover text-brand-black disabled:opacity-50 font-black text-[11px] py-3.5 rounded-2xl transition-all shadow-md active:scale-[0.99] uppercase tracking-wider"
                >
                  {isUpdatingProfile ? 'Saving Details...' : 'Save Profile Changes'}
                </button>
              </form>
            </div>

            {/* Quick Actions Panel */}
            <div className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border border-neutral-200/50 dark:border-neutral-800 rounded-[32px] p-3 shadow-xl divide-y divide-neutral-100 dark:divide-neutral-800/60">
              {currentUser.role === 'vendor' && (
                <button 
                  onClick={() => router.push('/dashboard')}
                  className="w-full flex items-center gap-3.5 px-4 py-3.5 hover:bg-neutral-50 dark:hover:bg-neutral-850 rounded-2xl transition-colors text-left"
                >
                  <PlusCircle size={18} className="text-gold" />
                  <div>
                    <h4 className="text-xs font-bold text-foreground">Vendor Dashboard</h4>
                    <p className="text-[9px] text-brand-gray mt-0.5 font-medium">Add and manage stall foods</p>
                  </div>
                </button>
              )}

              {currentUser.role === 'admin' && (
                <button 
                  onClick={() => router.push('/admin')}
                  className="w-full flex items-center gap-3.5 px-4 py-3.5 hover:bg-neutral-50 dark:hover:bg-neutral-850 rounded-2xl transition-colors text-left"
                >
                  <ShieldCheck size={18} className="text-sky-500" />
                  <div>
                    <h4 className="text-xs font-bold text-foreground">Admin Board</h4>
                    <p className="text-[9px] text-brand-gray mt-0.5 font-medium">Moderate stalls and complaints</p>
                  </div>
                </button>
              )}

              <button 
                onClick={() => router.push('/menu')}
                className="w-full flex items-center gap-3.5 px-4 py-3.5 hover:bg-neutral-50 dark:hover:bg-neutral-850 rounded-2xl transition-colors text-left"
              >
                <ShoppingBag size={18} className="text-emerald-500" />
                <div>
                  <h4 className="text-xs font-bold text-foreground">Browse Stalls</h4>
                  <p className="text-[9px] text-brand-gray mt-0.5 font-medium">Explore and order street foods</p>
                </div>
              </button>

              <button 
                onClick={logoutUser}
                className="w-full flex items-center gap-3.5 px-4 py-3.5 text-brand-firebrick hover:bg-red-50/20 dark:hover:bg-red-950/20 rounded-2xl transition-colors text-left"
              >
                <LogOut size={18} />
                <div>
                  <h4 className="text-xs font-bold">Logout</h4>
                  <p className="text-[9px] text-red-400 mt-0.5 font-medium">Sign out from your account</p>
                </div>
              </button>
            </div>
          </motion.div>
        ) : (
          /* ==========================================
             3D FLIP & TILT LOGGED OUT VIEW
             ========================================== */
          <div 
            style={{ perspective: 1200 }} 
            className="w-full h-[540px] relative"
          >
            <motion.div
              style={{ 
                rotateX, 
                rotateY, 
                transformStyle: 'preserve-3d',
                width: '100%',
                height: '100%',
                position: 'relative'
              }}
              animate={{ rotateY: isFlipped ? 180 : 0 }}
              transition={{ type: 'spring', stiffness: 180, damping: 22 }}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              className="w-full h-full relative"
            >
              
              {/* FRONT SIDE: Email/Password Login Form */}
              <div 
                style={{ backfaceVisibility: 'hidden' }}
                className="absolute inset-0 w-full h-full bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border border-neutral-200/50 dark:border-neutral-800 rounded-[35px] p-8 shadow-2xl flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center gap-1.5 text-gold mb-1">
                      <Sparkles size={16} className="animate-spin" style={{ animationDuration: '4s' }} />
                      <span className="text-[10px] font-black uppercase tracking-wider">Dynamic Discovery</span>
                    </div>
                    <h3 className="text-2xl font-black font-outfit text-foreground leading-tight">Welcome Back</h3>
                    <p className="text-[10px] text-brand-gray font-semibold mt-1">Sign in to your Street Eats Hub account.</p>
                  </div>

                  <form onSubmit={handleLogin} className="space-y-3.5">
                    <div>
                      <label className="text-[9px] font-black text-brand-gray uppercase tracking-wider pl-1 mb-1 block">
                        Email Address
                      </label>
                      <div className="relative">
                        <input 
                          type="email" 
                          placeholder="yourname@gmail.com"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-850 rounded-2xl pl-10 pr-4 py-3.5 text-xs font-semibold focus:outline-none focus:border-gold transition-colors text-foreground"
                        />
                        <User size={14} className="absolute left-3.5 top-[15px] text-brand-gray" />
                      </div>
                    </div>

                    <div>
                      <label className="text-[9px] font-black text-brand-gray uppercase tracking-wider pl-1 mb-1 block">
                        Password
                      </label>
                      <div className="relative">
                        <input 
                          type="password" 
                          placeholder="••••••••"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-850 rounded-2xl pl-10 pr-4 py-3.5 text-xs font-semibold focus:outline-none focus:border-gold transition-colors text-foreground"
                        />
                        <Lock size={14} className="absolute left-3.5 top-[15px] text-brand-gray" />
                      </div>
                    </div>

                    <div>
                      <label className="text-[9px] font-black text-brand-gray uppercase tracking-wider pl-1 mb-1 block">
                        Select Role
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {(['customer', 'vendor', 'admin'] as const).map((r) => (
                          <button
                            key={r}
                            type="button"
                            onClick={() => setRole(r)}
                            className={`py-2 rounded-xl text-[9px] font-black uppercase tracking-wider border transition-all ${
                              role === r 
                                ? 'bg-gold border-gold text-brand-black shadow-md scale-[1.02]' 
                                : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-850 text-brand-gray hover:border-neutral-350'
                            }`}
                          >
                            {r}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button 
                      type="submit"
                      disabled={isLoggingIn}
                      className="w-full bg-gold hover:bg-gold-hover text-brand-black font-black text-xs py-4 rounded-2xl shadow-md transition-transform duration-200 active:scale-[0.98] mt-2 uppercase tracking-wider"
                    >
                      {isLoggingIn ? 'Signing In...' : 'Sign In'}
                    </button>
                  </form>
                </div>

                <button
                  type="button"
                  onClick={() => setIsFlipped(true)}
                  className="w-full text-center text-[10px] font-black text-gold hover:text-gold-hover uppercase tracking-wider py-2 mt-4 border border-dashed border-gold/30 hover:border-gold rounded-2xl transition-all"
                >
                  ⚡ Quick Demo Login Profiles
                </button>
              </div>

              {/* BACK SIDE: Quick Demo Profiles */}
              <div 
                style={{ 
                  backfaceVisibility: 'hidden', 
                  transform: 'rotateY(180deg)' 
                }}
                className="absolute inset-0 w-full h-full bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border border-neutral-200/50 dark:border-neutral-800 rounded-[35px] p-8 shadow-2xl flex flex-col justify-between"
              >
                <div className="space-y-5">
                  <div>
                    <div className="flex items-center gap-1.5 text-emerald-500 mb-1">
                      <ShieldCheck size={16} />
                      <span className="text-[10px] font-black uppercase tracking-wider">Demo Access</span>
                    </div>
                    <h3 className="text-2xl font-black font-outfit text-foreground leading-tight font-outfit">Demo Accounts</h3>
                    <p className="text-[10px] text-brand-gray font-semibold mt-1">Select one of our seeded database users to instantly log in.</p>
                  </div>

                  <div className="space-y-3">
                    <button 
                      onClick={() => handleQuickLogin('hemal@gmail.com', 'customer')}
                      disabled={isLoggingIn}
                      className="w-full flex items-center justify-between p-4 rounded-2xl bg-neutral-50 hover:bg-neutral-100 dark:bg-neutral-950 dark:hover:bg-neutral-850 border border-neutral-100 dark:border-neutral-800 transition-all text-left text-xs font-bold group hover:border-gold/30 hover:translate-x-1"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-gold/15 flex items-center justify-center text-gold group-hover:scale-105 transition-transform">
                          <User size={14} />
                        </div>
                        <div>
                          <span className="block font-black text-[11px] text-foreground">Customer (Hemal)</span>
                          <span className="text-[9px] text-brand-gray font-semibold">hemal@gmail.com</span>
                        </div>
                      </div>
                      <span className="text-[8px] bg-gold/20 text-gold font-black uppercase px-2 py-0.5 rounded-md">Login</span>
                    </button>

                    <button 
                      onClick={() => handleQuickLogin('vendor@gmail.com', 'vendor')}
                      disabled={isLoggingIn}
                      className="w-full flex items-center justify-between p-4 rounded-2xl bg-neutral-50 hover:bg-neutral-100 dark:bg-neutral-950 dark:hover:bg-neutral-850 border border-neutral-100 dark:border-neutral-800 transition-all text-left text-xs font-bold group hover:border-emerald-500/30 hover:translate-x-1"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-emerald-500/15 flex items-center justify-center text-emerald-500 group-hover:scale-105 transition-transform">
                          <UserCheck size={14} />
                        </div>
                        <div>
                          <span className="block font-black text-[11px] text-foreground">Vendor (Ahmed Khan)</span>
                          <span className="text-[9px] text-brand-gray font-semibold">vendor@gmail.com</span>
                        </div>
                      </div>
                      <span className="text-[8px] bg-emerald-500/20 text-emerald-500 font-black uppercase px-2 py-0.5 rounded-md">Login</span>
                    </button>

                    <button 
                      onClick={() => handleQuickLogin('admin@gmail.com', 'admin')}
                      disabled={isLoggingIn}
                      className="w-full flex items-center justify-between p-4 rounded-2xl bg-neutral-50 hover:bg-neutral-100 dark:bg-neutral-950 dark:hover:bg-neutral-850 border border-neutral-100 dark:border-neutral-800 transition-all text-left text-xs font-bold group hover:border-sky-500/30 hover:translate-x-1"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-sky-500/15 flex items-center justify-center text-sky-500 group-hover:scale-105 transition-transform">
                          <ShieldCheck size={14} />
                        </div>
                        <div>
                          <span className="block font-black text-[11px] text-foreground">System Administrator</span>
                          <span className="text-[9px] text-brand-gray font-semibold">admin@gmail.com</span>
                        </div>
                      </div>
                      <span className="text-[8px] bg-sky-500/20 text-sky-500 font-black uppercase px-2 py-0.5 rounded-md">Login</span>
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsFlipped(false)}
                  className="w-full text-center text-[10px] font-black text-brand-gray hover:text-foreground uppercase tracking-wider py-2 mt-4 transition-colors"
                >
                  ← Back to Email Sign In
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
