'use client';

import React, { useState } from 'react';
import { ArrowLeft, User, LogOut, ShieldCheck, ShoppingBag, PlusCircle, UserCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import { useRouter } from 'next/navigation';

export default function AuthView() {
  const { currentUser, loginUser, logoutUser, updateProfile } = useApp();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'customer' | 'vendor' | 'admin'>('customer');
  const [password, setPassword] = useState('');

  // Profile Edit States
  const [profileName, setProfileName] = useState(currentUser?.full_name || '');
  const [profilePhone, setProfilePhone] = useState(currentUser?.phone || '');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');

  React.useEffect(() => {
    if (currentUser) {
      setProfileName(currentUser.full_name);
      setProfilePhone(currentUser.phone || '');
    }
  }, [currentUser]);

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

  const handleQuickLogin = (selectedEmail: string, selectedRole: 'customer' | 'vendor' | 'admin') => {
    loginUser(selectedEmail, selectedRole);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    loginUser(email, role);
  };

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-6 text-foreground">
      {/* Header Row */}
      <button 
        onClick={() => router.push('/menu')}
        className="flex items-center gap-2 text-xs font-black text-brand-gray hover:text-gold transition-colors mb-6 uppercase tracking-wider"
      >
        <ArrowLeft size={14} />
        <span>Back to Stalls</span>
      </button>

      {currentUser ? (
        /* Logged In View */
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* User Profile Card */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-800 rounded-[32px] p-8 text-center shadow-md">
            <div className="w-20 h-20 rounded-full bg-gold text-brand-black flex items-center justify-center mx-auto mb-4 text-2xl font-black shadow-md border-4 border-white dark:border-neutral-950">
              {currentUser.full_name[0].toUpperCase()}
            </div>
            
            <h3 className="text-xl font-extrabold font-outfit text-foreground leading-tight">
              {currentUser.full_name}
            </h3>
            
            <p className="text-xs text-brand-gray font-medium mt-1">
              {currentUser.email}
            </p>

            <span className="inline-block bg-neutral-100 dark:bg-neutral-800 text-[10px] font-black uppercase tracking-wider px-3.5 py-1 rounded-full text-neutral-500 dark:text-neutral-400 mt-4 border border-neutral-200/40 dark:border-neutral-700/50">
              Account Role: {currentUser.role}
            </span>
          </div>

          {/* Edit Profile Form */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-800 rounded-[28px] p-6 shadow-sm max-w-md mx-auto">
            <h4 className="text-xs font-black uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-4 block">
              Edit Profile Details
            </h4>

            {profileSuccessMsg && (
              <div className="mb-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-205 dark:border-emerald-900 text-emerald-600 dark:text-emerald-400 px-3.5 py-2 rounded-xl text-[10px] font-bold">
                {profileSuccessMsg}
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-brand-gray uppercase tracking-wider pl-1 mb-1 block">
                  Full Name
                </label>
                <input 
                  type="text" 
                  required
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl px-4 py-3 text-xs font-semibold focus:outline-none focus:border-gold transition-colors text-foreground"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-brand-gray uppercase tracking-wider pl-1 mb-1 block">
                  Phone Number
                </label>
                <input 
                  type="text" 
                  value={profilePhone}
                  onChange={(e) => setProfilePhone(e.target.value)}
                  className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl px-4 py-3 text-xs font-semibold focus:outline-none focus:border-gold transition-colors text-foreground"
                />
              </div>

              <button 
                type="submit"
                disabled={isUpdatingProfile}
                className="w-full bg-gold hover:bg-gold-hover text-brand-black disabled:opacity-50 font-extrabold text-[11px] py-3 rounded-xl transition-all shadow-sm active:scale-[0.99]"
              >
                {isUpdatingProfile ? 'Saving Details...' : 'Save Profile Changes'}
              </button>
            </form>
          </div>

          {/* Action List */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-800 rounded-[28px] p-3 shadow-sm divide-y divide-neutral-100 dark:divide-neutral-800/60 max-w-md mx-auto">
            {currentUser.role === 'vendor' && (
              <button 
                onClick={() => router.push('/dashboard')}
                className="w-full flex items-center gap-3.5 px-4 py-4 hover:bg-neutral-50 dark:hover:bg-neutral-850 rounded-2xl transition-colors text-left"
              >
                <PlusCircle size={18} className="text-gold" />
                <div>
                  <h4 className="text-xs font-bold text-foreground">Vendor Dashboard</h4>
                  <p className="text-[10px] text-brand-gray mt-0.5 font-medium">Add and manage stall foods</p>
                </div>
              </button>
            )}

            <button 
              onClick={() => router.push('/menu')}
              className="w-full flex items-center gap-3.5 px-4 py-4 hover:bg-neutral-50 dark:hover:bg-neutral-850 rounded-2xl transition-colors text-left"
            >
              <ShoppingBag size={18} className="text-emerald-500" />
              <div>
                <h4 className="text-xs font-bold text-foreground">Order Dishes</h4>
                <p className="text-[10px] text-brand-gray mt-0.5 font-medium">Browse street foods stalls</p>
              </div>
            </button>

            <button 
              onClick={logoutUser}
              className="w-full flex items-center gap-3.5 px-4 py-4 text-brand-firebrick hover:bg-red-50/20 dark:hover:bg-red-950/20 rounded-2xl transition-colors text-left"
            >
              <LogOut size={18} />
              <div>
                <h4 className="text-xs font-bold">Logout</h4>
                <p className="text-[10px] text-red-400 mt-0.5 font-medium">Sign out from your account</p>
              </div>
            </button>
          </div>
        </motion.div>
      ) : (
        /* Logged Out Login Form */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Quick Demo Selector */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-800 rounded-[28px] p-6 shadow-sm">
            <h4 className="text-xs font-extrabold font-outfit text-neutral-450 dark:text-neutral-500 uppercase tracking-wider mb-4">
              Quick Login Demo Profiles
            </h4>
            
            <div className="space-y-3">
              <button 
                onClick={() => handleQuickLogin('hemal@gmail.com', 'customer')}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-neutral-50 hover:bg-neutral-100 dark:bg-neutral-950 dark:hover:bg-neutral-850 border border-neutral-100 dark:border-neutral-800 transition-colors text-left text-xs font-bold"
              >
                <div className="flex items-center gap-2">
                  <User size={14} className="text-gold" />
                  <span>Customer (Hemal)</span>
                </div>
                <span className="text-[10px] text-brand-gray">hemal@gmail.com</span>
              </button>

              <button 
                onClick={() => handleQuickLogin('vendor@gmail.com', 'vendor')}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-neutral-50 hover:bg-neutral-100 dark:bg-neutral-950 dark:hover:bg-neutral-850 border border-neutral-100 dark:border-neutral-800 transition-colors text-left text-xs font-bold"
              >
                <div className="flex items-center gap-2">
                  <UserCheck size={14} className="text-emerald-500" />
                  <span>Vendor (Shop Owner)</span>
                </div>
                <span className="text-[10px] text-brand-gray">vendor@gmail.com</span>
              </button>

              <button 
                onClick={() => handleQuickLogin('admin@gmail.com', 'admin')}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-neutral-50 hover:bg-neutral-100 dark:bg-neutral-950 dark:hover:bg-neutral-850 border border-neutral-100 dark:border-neutral-800 transition-colors text-left text-xs font-bold"
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck size={14} className="text-sky-500" />
                  <span>Admin Mode</span>
                </div>
                <span className="text-[10px] text-brand-gray">admin@gmail.com</span>
              </button>
            </div>
          </div>

          {/* Core Email/Password Form */}
          <form onSubmit={handleLogin} className="bg-white dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-800 rounded-[28px] p-6 shadow-sm space-y-4">
            <div className="space-y-4">
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
                  className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl px-4 py-3 text-xs font-semibold focus:outline-none focus:border-gold transition-colors text-foreground"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-brand-gray uppercase tracking-wider pl-1 mb-1 block">
                  Password
                </label>
                <input 
                  type="password" 
                  placeholder="Enter your password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl px-4 py-3 text-xs font-semibold focus:outline-none focus:border-gold transition-colors text-foreground"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-brand-gray uppercase tracking-wider pl-1 mb-1 block">
                  Select Role
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['customer', 'vendor', 'admin'] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      className={`py-2 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all ${
                        role === r 
                          ? 'bg-gold border-gold text-brand-black shadow-sm' 
                          : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-brand-gray hover:border-neutral-350'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button 
              type="submit"
              className="w-full bg-gold hover:bg-gold-hover text-brand-black font-extrabold text-xs py-4 rounded-2xl shadow-md transition-transform duration-200 active:scale-[0.98] mt-2"
            >
              Sign In
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
