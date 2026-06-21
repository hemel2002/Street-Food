'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Sparkles, MapPin, ChefHat, Heart, ShieldCheck, Flame, Compass, ArrowRight, Star, Quote } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function Page() {
  const { stalls, foods } = useApp();

  // Stats matching EJS home page
  const stats = [
    { label: 'Registered Stalls', value: stalls.length + 5, suffix: '+', icon: ChefHat, color: 'text-gold' },
    { label: 'Active Customers', value: 140, suffix: '+', icon: Heart, color: 'text-brand-firebrick' },
    { label: 'Dishes Served', value: foods.length + 15, suffix: '+', icon: Flame, color: 'text-emerald-500' },
    { label: 'Review Videos', value: 12, suffix: '', icon: Compass, color: 'text-sky-500' }
  ];

  const testimonials = [
    {
      name: 'Jessica Miller',
      role: 'Vrooklyn Local',
      comment: 'The street food here is outstanding. Ordering from the Double Hamburger stall was seamless, and the food arrived hot and fresh!',
      rating: 5
    },
    {
      name: 'Thomas Wright',
      role: 'Food Blogger',
      comment: 'A game-changer for Brooklyn street eats. Having Cloudinary video promotions and Supabase-backed reviews makes choosing stalls so easy.',
      rating: 5
    }
  ];

  return (
    <div className="w-full text-foreground space-y-20 pb-16">
      
      {/* 1. Hero Section */}
      <section className="w-full px-4 sm:px-6 lg:px-8 pt-8 md:pt-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Hero Text */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-1.5 bg-gold/10 text-gold px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider"
            >
              <Sparkles size={14} className="animate-spin-slow" />
              <span>Premium Food Delivery</span>
            </motion.div>
            
            <h1 className="text-4xl sm:text-6xl font-black font-outfit leading-none tracking-tight text-foreground">
              Street Food <br className="hidden sm:inline" />
              Delivered <span className="text-gold">Hot & Fresh</span>
            </h1>
            
            <p className="text-sm md:text-base text-brand-gray max-w-xl mx-auto lg:mx-0 font-medium leading-relaxed">
              Experience the best wood-fired pizzas, gourmet hamburgers, and handcrafted sushi rolls from local Brooklyn vendors, delivered directly to your doorstep.
            </p>

            <div className="pt-2 flex flex-wrap gap-4 justify-center lg:justify-start">
              <Link 
                href="/menu"
                className="px-8 py-4 bg-gold hover:bg-gold-hover text-brand-black font-extrabold text-xs rounded-xl shadow-lg shadow-gold/15 flex items-center gap-2 group transition-all"
              >
                <span>Order Dishes Now</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                href="/contact"
                className="px-8 py-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 text-foreground font-extrabold text-xs rounded-xl transition-all"
              >
                Contact Us
              </Link>
            </div>
          </div>

          {/* Right Hero Visuals */}
          <div className="lg:col-span-5 relative flex justify-center select-none">
            <div className="absolute inset-0 bg-gold/10 rounded-full blur-3xl transform scale-75"></div>
            <motion.div 
              animate={{ y: [0, -12, 0] }}
              transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
              className="text-[160px] md:text-[220px] filter drop-shadow-[0_20px_50px_rgba(0,0,0,0.15)]"
            >
              🍔
            </motion.div>
            
            <div className="absolute bottom-6 left-6 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800/80 p-3 rounded-2xl flex items-center gap-2.5 shadow-lg max-w-[170px]">
              <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold text-sm">✓</div>
              <p className="text-[10px] leading-tight font-extrabold text-brand-gray">
                Over <span className="text-foreground">500+ orders</span> delivered this week!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Stats Section (Legacy EJS counter metrics) */}
      <section className="bg-neutral-950 text-white py-12 border-y border-neutral-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-gold/[0.02] mix-blend-overlay"></div>
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div key={idx} className="text-center space-y-2 border-r last:border-0 border-neutral-900">
                  <div className={`w-10 h-10 rounded-full bg-neutral-900 flex items-center justify-center mx-auto ${stat.color}`}>
                    <Icon size={18} />
                  </div>
                  <div>
                    <h3 className="text-2xl sm:text-3xl font-black font-outfit text-white">
                      {stat.value}{stat.suffix}
                    </h3>
                    <p className="text-[11px] text-neutral-450 uppercase font-black tracking-wider mt-0.5">
                      {stat.label}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. Services / Why Choose Us */}
      <section className="w-full px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-12 space-y-2">
          <span className="text-xs text-gold font-black uppercase tracking-wider">Our Services</span>
          <h2 className="text-2xl sm:text-4xl font-black font-outfit">Why Choose Vrooklyn Street Food?</h2>
          <p className="text-xs text-brand-gray font-semibold leading-relaxed">
            We provide a premium digital experience linking hungry foodies with Brooklyn local stalls.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-800 rounded-[28px] p-6 text-center space-y-3.5 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-gold/10 text-gold flex items-center justify-center mx-auto">
              <ChefHat size={22} />
            </div>
            <h4 className="font-extrabold text-sm text-foreground">Artisan Local Vendors</h4>
            <p className="text-xs text-brand-gray font-medium leading-relaxed">
              Every single shop is locally operated, preparing authentic recipes passed down through generations.
            </p>
          </div>

          <div className="bg-white dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-800 rounded-[28px] p-6 text-center space-y-3.5 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-brand-firebrick/10 text-brand-firebrick flex items-center justify-center mx-auto">
              <ShieldCheck size={22} />
            </div>
            <h4 className="font-extrabold text-sm text-foreground">Verified Hygiene & Taste</h4>
            <p className="text-xs text-brand-gray font-medium leading-relaxed">
              Stalls are vetted for sanitation and food preparation quality, ensuring top-tier safety.
            </p>
          </div>

          <div className="bg-white dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-800 rounded-[28px] p-6 text-center space-y-3.5 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
              <Sparkles size={22} />
            </div>
            <h4 className="font-extrabold text-sm text-foreground">Cloudinary Video Reviews</h4>
            <p className="text-xs text-brand-gray font-medium leading-relaxed">
              Watch real video reviews uploaded by food bloggers to see your meal being prepared live.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Testimonial Reviews */}
      <section className="bg-white dark:bg-neutral-900 border-y border-neutral-200 dark:border-neutral-900 py-16">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-xs text-gold font-black uppercase tracking-wider">Testimonials</span>
            <h2 className="text-2xl sm:text-4xl font-black font-outfit mt-1">What Our Foodies Say</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonials.map((t, idx) => (
              <div 
                key={idx} 
                className="bg-brand-light dark:bg-neutral-950 p-8 rounded-3xl space-y-4 border border-neutral-200/30 dark:border-neutral-800 relative"
              >
                <Quote size={44} className="absolute right-6 top-6 text-neutral-200 dark:text-neutral-900 opacity-60" />
                <div className="flex gap-0.5 text-gold">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} size={13} fill="currentColor" />
                  ))}
                </div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 italic leading-relaxed font-semibold">
                  &quot;{t.comment}&quot;
                </p>
                <div>
                  <h4 className="text-xs font-black text-foreground">{t.name}</h4>
                  <p className="text-[10px] text-brand-gray font-bold">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
    </div>
  );
}
