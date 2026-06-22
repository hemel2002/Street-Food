'use client';

import React, { useState } from 'react';
import { Outfit, Inter } from "next/font/google";
import "./globals.css";
import { AppProvider, useApp } from "@/context/AppContext";
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ShoppingBag, Sun, Moon, MapPin, User, Settings, Key, Database, LogOut, Compass, ChefHat, Tag, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import FoodRoulette from '@/components/FoodRoulette';

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

// Separated client header and footer layout
function AppShell({ children }: { children: React.ReactNode }) {
  const { 
    cart, 
    isDarkMode, 
    toggleTheme, 
    currentLocation, 
    setCurrentLocation,
    currentUser,
    logoutUser,
    loginUser
  } = useApp();

  const [showDemoSettings, setShowDemoSettings] = useState(false);
  const [isRouletteOpen, setRouletteOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Client-side route guarding and roles access control
  const isAuthPage = pathname === '/auth';
  const isLandingPage = pathname === '/';
  const isTeamPage = pathname === '/team';
  const isContactPage = pathname === '/contact';
  
  const isProtectedRoute = !isAuthPage && !isLandingPage && !isTeamPage && !isContactPage;
  const isAdminRoute = pathname === '/admin';
  const isVendorRoute = pathname === '/dashboard';

  React.useEffect(() => {
    // 1. Redirect unauthenticated users trying to access protected routes
    if (!currentUser && isProtectedRoute) {
      router.push('/auth');
    }
    // 2. Redirect non-admins trying to access admin pages
    if (currentUser && isAdminRoute && currentUser.role !== 'admin') {
      router.push('/auth');
    }
    // 3. Redirect non-vendors trying to access vendor dashboards
    if (currentUser && isVendorRoute && currentUser.role !== 'vendor') {
      router.push('/auth');
    }
  }, [currentUser, pathname, isProtectedRoute, isAdminRoute, isVendorRoute, router]);

  // Determine guarded content
  let mainContent = children;

  if (!currentUser && isProtectedRoute) {
    mainContent = (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] text-center space-y-5 px-4 animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center text-gold animate-bounce">
          <Key size={28} />
        </div>
        <h3 className="text-lg font-black font-outfit text-foreground uppercase tracking-wider">Authentication Required</h3>
        <p className="text-xs text-brand-gray max-w-xs font-semibold leading-relaxed">
          You must be logged in to view this page. Redirecting you to the login screen...
        </p>
        <div className="w-12 h-1 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden relative">
          <div className="absolute inset-0 bg-gold animate-pulse" />
        </div>
      </div>
    );
  } else if (currentUser && isAdminRoute && currentUser.role !== 'admin') {
    mainContent = (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] text-center space-y-5 px-4 animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center text-brand-firebrick animate-pulse">
          <ShieldAlert size={28} className="text-red-500" />
        </div>
        <h3 className="text-lg font-black font-outfit text-foreground uppercase tracking-wider text-brand-firebrick">Access Denied</h3>
        <p className="text-xs text-brand-gray max-w-xs font-semibold leading-relaxed">
          This area is restricted to System Administrators only. You do not have permission to view this console.
        </p>
        <button
          onClick={() => router.push('/auth')}
          className="bg-gold hover:bg-gold-hover text-brand-black px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all hover:scale-105 active:scale-95 shadow-md"
        >
          Switch to Admin Profile
        </button>
      </div>
    );
  } else if (currentUser && isVendorRoute && currentUser.role !== 'vendor') {
    mainContent = (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] text-center space-y-5 px-4 animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 animate-pulse">
          <ChefHat size={28} />
        </div>
        <h3 className="text-lg font-black font-outfit text-foreground uppercase tracking-wider text-amber-500">Vendor Access Required</h3>
        <p className="text-xs text-brand-gray max-w-xs font-semibold leading-relaxed">
          This dashboard is restricted to registered Vendors only. You do not have permission to view these settings.
        </p>
        <button
          onClick={() => router.push('/auth')}
          className="bg-gold hover:bg-gold-hover text-brand-black px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all hover:scale-105 active:scale-95 shadow-md"
        >
          Switch to Vendor Profile
        </button>
      </div>
    );
  }

  const locations = [
    'Sterling place, Vrooklyn',
    'Grand Ave, Vrooklyn',
    'Flatbush Ave, Vrooklyn'
  ];

  return (
    <div className="min-h-screen flex flex-col bg-brand-light dark:bg-brand-dark text-foreground transition-colors duration-300">
      
      {/* Global Header */}
      <header className="sticky top-0 z-50 w-full bg-white/85 dark:bg-brand-black/85 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-900 px-4 sm:px-6 lg:px-8 py-3.5 shadow-sm">
        <div className="w-full flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 cursor-pointer group">
            <span className="text-2xl">🍔</span>
            <span className="text-base font-black font-outfit uppercase tracking-wider text-foreground group-hover:text-gold transition-colors">
              Vrooklyn <span className="text-gold">Street Food</span>
            </span>
          </Link>

          {/* Location Picker */}
          <div className="hidden md:flex items-center gap-2 bg-neutral-100 dark:bg-neutral-900 border border-neutral-205/30 dark:border-neutral-800 px-3.5 py-1.5 rounded-full text-xs font-semibold">
            <MapPin size={14} className="text-gold animate-pulse" />
            <span>{currentLocation}</span>
            <button 
              onClick={() => {
                const currentIdx = locations.indexOf(currentLocation);
                const nextIdx = (currentIdx + 1) % locations.length;
                setCurrentLocation(locations[nextIdx]);
              }}
              className="text-[10px] text-neutral-400 dark:text-neutral-500 hover:text-gold ml-1 font-bold"
            >
              (Cycle)
            </button>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-4">
            
            {/* Nav Menu */}
            <nav className="flex items-center gap-1 text-xs font-black uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              <Link 
                href="/"
                className={`px-3 py-2 rounded-xl transition-colors hover:text-foreground ${pathname === '/' ? 'text-gold dark:text-gold' : ''}`}
              >
                Home
              </Link>
              <Link 
                href="/menu"
                className={`px-3 py-2 rounded-xl transition-colors hover:text-foreground ${pathname === '/menu' || pathname.startsWith('/stall/') ? 'text-gold dark:text-gold' : ''}`}
              >
                Menu
              </Link>
              <Link 
                href="/team"
                className={`px-3 py-2 rounded-xl transition-colors hover:text-foreground ${pathname === '/team' ? 'text-gold dark:text-gold' : ''}`}
              >
                Team
              </Link>
              <Link 
                href="/contact"
                className={`px-3 py-2 rounded-xl transition-colors hover:text-foreground ${pathname === '/contact' ? 'text-gold dark:text-gold' : ''}`}
              >
                Contact
              </Link>
              <button 
                onClick={() => setRouletteOpen(true)}
                className="px-3 py-2 rounded-xl transition-colors hover:text-foreground text-neutral-500 cursor-pointer flex items-center gap-1 font-bold"
              >
                <span>🎰</span>
                <span className="hidden md:inline">Roulette</span>
              </button>
              {currentUser?.role === 'vendor' && (
                <Link 
                  href="/dashboard"
                  className={`px-3 py-2 rounded-xl transition-colors hover:text-foreground ${pathname === '/dashboard' ? 'text-gold dark:text-gold' : ''}`}
                >
                  Vendor Panel
                </Link>
              )}
              {currentUser?.role === 'admin' && (
                <Link 
                  href="/admin"
                  className={`px-3 py-2 rounded-xl transition-colors hover:text-foreground ${pathname === '/admin' ? 'text-gold dark:text-gold' : ''}`}
                >
                  Admin Panel
                </Link>
              )}
            </nav>

            {/* Dark Mode toggle */}
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200/40 dark:border-neutral-800 text-foreground hover:scale-105 active:scale-95 transition-all"
            >
              {isDarkMode ? <Sun size={15} className="text-gold" /> : <Moon size={15} className="text-indigo-500" />}
            </button>

            {/* Cart link */}
            <Link 
              href="/cart"
              className="px-3.5 py-2 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-brand-black hover:bg-neutral-800 dark:hover:bg-neutral-100 border border-transparent shadow flex items-center gap-2 relative transition-all"
            >
              <ShoppingBag size={14} />
              <span className="text-[11px] font-black uppercase tracking-wider hidden sm:inline">Cart</span>
              {cartCount > 0 && (
                <span className="bg-gold text-brand-black text-[9px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border border-neutral-900 dark:border-white shadow">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Profile status */}
            <div className="flex items-center gap-2 border-l border-neutral-200 dark:border-neutral-800 pl-4">
              {currentUser ? (
                <div className="flex items-center gap-2">
                  <Link 
                    href="/auth"
                    className="w-8.5 h-8.5 rounded-full bg-gold text-brand-black flex items-center justify-center font-black text-xs hover:scale-105 transition-all shadow-sm"
                  >
                    {currentUser.full_name[0].toUpperCase()}
                  </Link>
                  <button 
                    onClick={logoutUser}
                    title="Logout"
                    className="text-neutral-400 hover:text-brand-firebrick transition-colors"
                  >
                    <LogOut size={14} />
                  </button>
                </div>
              ) : (
                <Link 
                  href="/auth"
                  className="w-8.5 h-8.5 rounded-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-200/40 dark:border-neutral-800 flex items-center justify-center text-foreground hover:scale-105 transition-all"
                >
                  <User size={14} />
                </Link>
              )}
            </div>

            {/* Demo panel Settings */}
            <button 
              onClick={() => setShowDemoSettings(!showDemoSettings)}
              className="p-2 rounded-xl bg-gold/10 text-gold hover:bg-gold/25 transition-colors border border-gold/10"
              title="Developer Demo Panel"
            >
              <Settings size={15} />
            </button>

          </div>
        </div>
      </header>

      {/* Developers Demo Panel Drawer */}
      <AnimatePresence>
        {showDemoSettings && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full bg-neutral-50 dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-900 p-5 shadow-inner"
          >
            <div className="w-full grid grid-cols-1 md:grid-cols-4 gap-6 text-xs text-foreground font-semibold">
              
              <div>
                <h4 className="text-[10px] font-black uppercase text-brand-gray tracking-wider mb-2.5">
                  Simulate Geolocation
                </h4>
                <div className="flex flex-col gap-1.5">
                  {locations.map(loc => (
                    <button 
                      key={loc}
                      onClick={() => setCurrentLocation(loc)}
                      className={`text-left p-2 rounded-lg border transition-all ${currentLocation === loc ? 'bg-gold border-gold text-brand-black' : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-brand-gray'}`}
                    >
                      {loc}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-[10px] font-black uppercase text-brand-gray tracking-wider mb-2.5">
                  Demo User Profiles
                </h4>
                <div className="flex flex-col gap-1.5">
                  <button 
                    onClick={() => loginUser('hemal@gmail.com', 'customer')}
                    className="p-2 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-left"
                  >
                    Customer Profile (Hemal)
                  </button>
                  <button 
                    onClick={() => loginUser('vendor@gmail.com', 'vendor')}
                    className="p-2 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-left"
                  >
                    Vendor Owner Profile
                  </button>
                </div>
              </div>

              <div>
                <h4 className="text-[10px] font-black uppercase text-brand-gray tracking-wider mb-2.5">
                  Preset Coupons
                </h4>
                <div className="space-y-1.5">
                  <div className="flex justify-between p-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-805 rounded-lg">
                    <span className="text-gold font-black">WELCOME20</span>
                    <span className="text-[10px] text-brand-gray font-bold">Save $20 on Cart</span>
                  </div>
                  <div className="flex justify-between p-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-805 rounded-lg">
                    <span className="text-gold font-black">STREET30</span>
                    <span className="text-[10px] text-brand-gray font-bold">Save $30 on Cart</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-[10px] font-black uppercase text-brand-gray tracking-wider mb-2.5">
                  Database & Storage Connected
                </h4>
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-brand-gray font-medium flex items-center gap-1"><Key size={12} className="text-gold" /> Cloudinary API</span>
                    <span className="bg-emerald-500/10 text-emerald-500 text-[9px] font-black px-2 py-0.5 rounded-full">CONNECTED</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-brand-gray font-medium flex items-center gap-1"><Database size={12} className="text-emerald-500" /> Supabase DB</span>
                    {process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your-project-id') ? (
                      <span className="bg-emerald-500/10 text-emerald-500 text-[9px] font-black px-2 py-0.5 rounded-full">CONNECTED</span>
                    ) : (
                      <span className="bg-amber-500/10 text-amber-500 text-[9px] font-black px-2 py-0.5 rounded-full">SIMULATED</span>
                    )}
                  </div>
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main page content */}
      <main className="flex-1 w-full relative w-full px-4 sm:px-6 lg:px-8 py-8">
        {mainContent}
      </main>

      {/* Global Footer */}
      <footer className="w-full bg-white dark:bg-brand-black border-t border-neutral-200 dark:border-neutral-900 py-10 mt-20 text-center text-xs font-semibold text-brand-gray">
        <div className="w-full px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="flex justify-center gap-6 text-xs uppercase font-black tracking-wider text-neutral-450 dark:text-neutral-500">
            <Link href="/" className="hover:text-gold">Home</Link>
            <Link href="/menu" className="hover:text-gold">Menu</Link>
            <Link href="/team" className="hover:text-gold">Team</Link>
            <Link href="/contact" className="hover:text-gold">Contact</Link>
          </div>
          <p>© 2026 Vrooklyn Street Food. All rights reserved.</p>
        </div>
      </footer>

      {/* Unique Roulette modal */}
      <FoodRoulette isOpen={isRouletteOpen} onClose={() => setRouletteOpen(false)} />

    </div>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body 
        className="min-h-full flex flex-col bg-brand-light dark:bg-brand-dark text-foreground transition-colors duration-300"
        suppressHydrationWarning
      >
        <AppProvider>
          <AppShell>{children}</AppShell>
        </AppProvider>
      </body>
    </html>
  );
}
