'use client';

import React from 'react';
import { Sparkles, Key, Database, RefreshCw, Sun, Moon, MapPin, Tag, UserCheck, Smartphone } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function SidebarController() {
  const { 
    isDarkMode, 
    toggleTheme, 
    currentLocation, 
    setCurrentLocation, 
    loginUser, 
    currentUser, 
    logoutUser,
    promoCode,
    applyPromoCode
  } = useApp();

  const locations = [
    'Sterling place, Vrooklyn',
    'Grand Ave, Vrooklyn',
    'Flatbush Ave, Vrooklyn'
  ];

  return (
    <div className="w-full lg:w-[360px] bg-white/70 dark:bg-neutral-900/70 backdrop-blur-md border border-neutral-200 dark:border-neutral-800 rounded-[35px] p-6 shadow-xl space-y-6 text-foreground">
      {/* Title */}
      <div>
        <div className="flex items-center gap-2 text-gold">
          <Sparkles size={20} className="animate-pulse" />
          <h1 className="text-lg font-black font-outfit uppercase tracking-wider text-foreground">
            Vrooklyn Street Food
          </h1>
        </div>
        <p className="text-[11px] text-brand-gray mt-1 leading-relaxed font-semibold">
          A fully complete dynamic Next.js 3D-style food delivery app migration with Supabase & Cloudinary.
        </p>
      </div>

      {/* Connection Status Indicator */}
      <div className="border border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/50 rounded-2xl p-4 space-y-3">
        <h3 className="text-xs font-black uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
          Backend Connections
        </h3>

        <div className="space-y-2">
          {/* Cloudinary connection */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-brand-gray font-semibold flex items-center gap-1.5">
              <Key size={13} className="text-gold" />
              Cloudinary Media
            </span>
            <span className="bg-emerald-500/10 text-emerald-500 text-[10px] font-black px-2 py-0.5 rounded-full border border-emerald-500/20">
              CONNECTED
            </span>
          </div>

          {/* Supabase connection */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-brand-gray font-semibold flex items-center gap-1.5">
              <Database size={13} className="text-emerald-500" />
              Supabase DB
            </span>
            {process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your-project-id') ? (
              <span className="bg-emerald-500/10 text-emerald-500 text-[10px] font-black px-2 py-0.5 rounded-full border border-emerald-500/20">
                CONNECTED
              </span>
            ) : (
              <span className="bg-amber-500/10 text-amber-500 text-[10px] font-black px-2 py-0.5 rounded-full border border-amber-500/20">
                SIMULATED (MOCK)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Theme Settings */}
      <div className="space-y-3">
        <h3 className="text-xs font-black uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
          Quick Options
        </h3>
        
        <div className="grid grid-cols-2 gap-2.5">
          {/* Theme switcher */}
          <button 
            onClick={toggleTheme}
            className="flex items-center justify-center gap-2 p-3 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-750 rounded-xl text-xs font-bold transition-all"
          >
            {isDarkMode ? (
              <>
                <Sun size={14} className="text-gold" />
                <span>Light Mode</span>
              </>
            ) : (
              <>
                <Moon size={14} className="text-indigo-400" />
                <span>Dark Mode</span>
              </>
            )}
          </button>

          {/* Switch Location simulation */}
          <button 
            onClick={() => {
              const currentIdx = locations.indexOf(currentLocation);
              const nextIdx = (currentIdx + 1) % locations.length;
              setCurrentLocation(locations[nextIdx]);
            }}
            className="flex items-center justify-center gap-2 p-3 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-750 rounded-xl text-xs font-bold transition-all"
          >
            <MapPin size={14} className="text-gold animate-bounce" />
            <span>Cycle Loc</span>
          </button>
        </div>
      </div>

      {/* Active Promo Codes list */}
      <div className="space-y-3">
        <h3 className="text-xs font-black uppercase tracking-wider text-neutral-400 dark:text-neutral-500 flex items-center gap-1">
          <Tag size={13} className="text-gold" />
          <span>Demo Promo Codes</span>
        </h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-2.5 bg-neutral-50 dark:bg-neutral-950 rounded-xl border border-neutral-100 dark:border-neutral-800">
            <span className="font-extrabold text-xs select-all text-foreground bg-gold/10 dark:bg-gold/5 px-2 py-0.5 rounded text-gold">WELCOME20</span>
            <span className="text-[10px] text-brand-gray font-bold">Save $20 on Checkout</span>
          </div>
          <div className="flex items-center justify-between p-2.5 bg-neutral-50 dark:bg-neutral-950 rounded-xl border border-neutral-100 dark:border-neutral-800">
            <span className="font-extrabold text-xs select-all text-foreground bg-gold/10 dark:bg-gold/5 px-2 py-0.5 rounded text-gold">STREET30</span>
            <span className="text-[10px] text-brand-gray font-bold">Save $30 on Checkout</span>
          </div>
        </div>
      </div>

      {/* Interactive Account Session Info */}
      <div className="space-y-3">
        <h3 className="text-xs font-black uppercase tracking-wider text-neutral-400 dark:text-neutral-500 flex items-center gap-1">
          <UserCheck size={13} className="text-emerald-500" />
          <span>Simulated Account</span>
        </h3>
        
        {currentUser ? (
          <div className="p-3 bg-neutral-50 dark:bg-neutral-950 rounded-xl border border-neutral-100 dark:border-neutral-800 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-brand-gray font-semibold">User:</span>
              <span className="font-bold">{currentUser.full_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-brand-gray font-semibold">Role:</span>
              <span className="font-black uppercase tracking-wider text-gold">{currentUser.role}</span>
            </div>
            <button 
              onClick={logoutUser}
              className="w-full text-center py-2 bg-brand-firebrick/10 hover:bg-brand-firebrick/20 text-brand-firebrick text-[11px] font-black rounded-lg transition-colors mt-2"
            >
              LOGOUT SESSION
            </button>
          </div>
        ) : (
          <div className="p-3 bg-neutral-50 dark:bg-neutral-950 rounded-xl border border-neutral-100 dark:border-neutral-800 text-center text-xs">
            <p className="text-brand-gray font-semibold mb-2.5">No simulated session active.</p>
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => loginUser('hemal@gmail.com', 'customer')}
                className="py-1.5 bg-gold hover:bg-gold-hover text-brand-black font-extrabold text-[10px] rounded-lg shadow-sm"
              >
                HEMAL (CUST)
              </button>
              <button 
                onClick={() => loginUser('vendor@gmail.com', 'vendor')}
                className="py-1.5 bg-neutral-950 dark:bg-white text-white dark:text-brand-black hover:bg-neutral-800 dark:hover:bg-neutral-100 font-extrabold text-[10px] rounded-lg shadow-sm"
              >
                OWNER (VENDOR)
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Guide Note */}
      <div className="text-[10px] text-brand-gray leading-relaxed bg-neutral-100/30 dark:bg-neutral-800/20 p-3 rounded-2xl font-semibold">
        <p className="flex gap-1.5 items-start">
          <Smartphone size={16} className="text-gold shrink-0 mt-0.5" />
          <span>
            The mobile layout simulates Screen 1 (Home Stalls), Screen 2 (Details/Menu), and Screen 3 (Cart Checkout) with real-time state updates.
          </span>
        </p>
      </div>
    </div>
  );
}
