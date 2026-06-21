'use client';

import React, { useState, useEffect } from 'react';
import { MapPin, Search, Star, Mic, Camera, Navigation, Heart, Filter, Activity, Compass, AlertCircle, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useApp, Stall, Food } from '@/context/AppContext';
import StreetFoodMap from '@/components/StreetFoodMap';

export default function HomeView() {
  const { 
    stalls, 
    foods, 
    setSelectedStall, 
    setSelectedFood,
    userLocation,
    detectUserLocation,
    favoriteStallIds,
    toggleFavoriteStall,
    favoriteFoodIds,
    toggleFavoriteFood
  } = useApp();

  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Burger');
  const [selectedRadius, setSelectedRadius] = useState(3000); // 3km default
  const [minRating, setMinRating] = useState(0);
  const [priceTier, setPriceTier] = useState<'all' | '$' | '$$' | '$$$'>('all');
  const [openNowOnly, setOpenNowOnly] = useState(false);
  const [heatmapMode, setHeatmapMode] = useState(false);
  const [isClassifying, setIsClassifying] = useState(false);
  const [alertMsg, setAlertMsg] = useState<string | null>(null);

  // Trigger alert when stall data is seeded or changes
  useEffect(() => {
    // Show a dynamic alert simulating a nearby notification
    const timer = setTimeout(() => {
      setAlertMsg("🔔 Alert: New Gourmet Hamburger Stall appeared 450m away from your coordinates!");
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  // Distance calculator helper
  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3; // meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // in meters
  };

  // Open status helper
  const isStallOpenNow = (stall: Stall) => {
    if (stall.status === 'closed' || stall.status === 'suspended') return false;
    if (!stall.hours) return true; // open by default if hours not set
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const todayName = days[new Date().getDay()];
    const hoursToday = stall.hours[todayName];
    if (!hoursToday || hoursToday.closed) return false;
    
    const now = new Date();
    const currentMins = now.getHours() * 60 + now.getMinutes();
    
    const [openH, openM] = hoursToday.open.split(':').map(Number);
    const [closeH, closeM] = hoursToday.close.split(':').map(Number);
    
    const openMins = openH * 60 + openM;
    const closeMins = closeH * 60 + closeM;
    
    return currentMins >= openMins && currentMins <= closeMins;
  };

  // Filter logic
  const filteredStalls = stalls.filter(stall => {
    // Admin approval check: only approved stalls are visible to customers
    if (stall.status !== 'approved' && stall.status !== 'closed') return false;

    const matchesSearch = 
      stall.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      stall.title.toLowerCase().includes(searchQuery.toLowerCase());
    
    const stallFoods = foods.filter(f => f.stall_id === stall.id);
    const matchesCategory = stallFoods.some(f => f.category === selectedCategory);

    // Distance calculation
    let matchesDistance = true;
    if (userLocation) {
      const dist = getDistance(userLocation.lat, userLocation.lng, stall.lat, stall.lng);
      matchesDistance = dist <= selectedRadius;
    }

    // Min rating filter
    const matchesRating = stall.avg_rating >= minRating;

    // Price range filter
    let matchesPrice = true;
    if (priceTier !== 'all') {
      const avgPrice = stallFoods.reduce((acc, item) => acc + item.price, 0) / (stallFoods.length || 1);
      if (priceTier === '$') matchesPrice = avgPrice < 15;
      else if (priceTier === '$$') matchesPrice = avgPrice >= 15 && avgPrice <= 25;
      else if (priceTier === '$$$') matchesPrice = avgPrice > 25;
    }

    // Open Now filter
    const matchesOpen = !openNowOnly || isStallOpenNow(stall);

    return matchesSearch && matchesCategory && matchesDistance && matchesRating && matchesPrice && matchesOpen;
  });

  const handleStallClick = (stall: Stall) => {
    setSelectedStall(stall);
    setSelectedFood(null);
    router.push(`/stall/${stall.id}`);
  };

  // Voice Search Trigger
  const startVoiceSearch = () => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        alert('Voice Speech Recognition is not supported in this browser.');
        return;
      }
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.start();
      recognition.onresult = (e: any) => {
        const text = e.results[0][0].transcript;
        setSearchQuery(text);
      };
    }
  };

  // Image search trigger
  const handleImageSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const name = file.name.toLowerCase();
    
    setIsClassifying(true);
    setTimeout(() => {
      setIsClassifying(false);
      let detectedCategory = 'Burger';
      if (name.includes('pizza') || name.includes('slice') || name.includes('pepperoni')) {
        detectedCategory = 'Pizza';
      } else if (name.includes('sushi') || name.includes('fish') || name.includes('roll') || name.includes('salmon')) {
        detectedCategory = 'Sushi';
      } else if (name.includes('drink') || name.includes('coke') || name.includes('juice') || name.includes('water')) {
        detectedCategory = 'Drinks';
      }
      setSelectedCategory(detectedCategory);
      setAlertMsg(`🤖 Image Scanner matched: "${detectedCategory}" category!`);
    }, 1200);
  };

  // AI Recommendation Engine
  const recommendedFoods = foods.filter(food => {
    const stall = stalls.find(s => s.id === food.stall_id);
    if (!stall || stall.status !== 'approved') return false;
    return food.rating >= 4.7;
  }).slice(0, 3);

  const categories = [
    { name: 'Burger', emoji: '🍔' },
    { name: 'Pizza', emoji: '🍕' },
    { name: 'Sushi', emoji: '🍣' },
    { name: 'Mexican', emoji: '🌮' },
    { name: 'Dessert', emoji: '🍰' },
    { name: 'Drinks', emoji: '🥤' }
  ];

  return (
    <div className="w-full py-6 px-4 sm:px-6 lg:px-8 text-foreground animate-fade-in">
      
      {/* Toast Notification Alert Banner */}
      <AnimatePresence>
        {alertMsg && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-6 bg-gold/10 border border-gold/40 text-gold-hover px-4 py-3 rounded-2xl text-xs font-black flex items-center justify-between shadow-sm"
          >
            <span className="flex items-center gap-2">
              <AlertCircle size={15} />
              <span>{alertMsg}</span>
            </span>
            <button onClick={() => setAlertMsg(null)} className="text-[10px] hover:underline uppercase pl-2">Dismiss</button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Interactive Map, Search Controls, Filters (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Header & Location detector */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-800 rounded-[28px] p-5 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold font-outfit text-foreground flex items-center gap-1.5">
                  <Compass size={16} className="text-gold" />
                  <span>Stalls Near You</span>
                </h3>
                <p className="text-[10px] text-brand-gray font-bold uppercase mt-0.5">Leaflet Interactive Map</p>
              </div>

              <button
                onClick={detectUserLocation}
                className="bg-gold hover:bg-gold-hover text-brand-black px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 transition-all active:scale-95 shadow-sm"
              >
                <Navigation size={10} className="fill-current" />
                <span>GPS Locate</span>
              </button>
            </div>

            {/* Map Element */}
            <StreetFoodMap
              stalls={filteredStalls}
              userLocation={userLocation}
              selectedRadius={selectedRadius}
              onStallSelect={handleStallClick}
              heatmapMode={heatmapMode}
            />

            {/* Map Controls */}
            <div className="flex gap-4 justify-between text-[10px] font-black text-brand-gray">
              <button 
                onClick={() => setHeatmapMode(!heatmapMode)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full border transition-all ${heatmapMode ? 'bg-brand-firebrick border-brand-firebrick text-white' : 'border-neutral-200 dark:border-neutral-800 hover:text-foreground'}`}
              >
                🔥 Heatmap Mode
              </button>
              <span>Coords: {userLocation ? `${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}` : 'Detecting...'}</span>
            </div>
          </div>

          {/* Search bar inputs */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-800 rounded-[28px] p-5 shadow-sm space-y-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-neutral-450 dark:text-neutral-500">Search & Filters</h4>
            
            {/* Search Input block */}
            <div className="flex gap-2">
              <div className="relative flex-1 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl flex items-center px-3 py-2.5 gap-2">
                <Search size={14} className="text-brand-gray" />
                <input 
                  type="text" 
                  placeholder="Search stall or dish..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent text-xs w-full focus:outline-none placeholder-brand-gray text-foreground font-semibold"
                />
              </div>

              <button 
                onClick={startVoiceSearch}
                className="w-10 h-10 rounded-2xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200/30 dark:border-neutral-700/50 flex items-center justify-center hover:bg-gold hover:text-brand-black transition-colors"
                title="Voice Search"
              >
                <Mic size={15} />
              </button>

              <div className="relative w-10 h-10 rounded-2xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200/30 dark:border-neutral-700/50 flex items-center justify-center hover:bg-gold hover:text-brand-black transition-colors overflow-hidden" title="Photo Search">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageSearch}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <Camera size={15} />
              </div>
            </div>

            {/* Radius Slider */}
            <div>
              <div className="flex justify-between text-[10px] font-bold text-brand-gray mb-1.5 uppercase">
                <span>Radius Limit</span>
                <span className="text-gold font-black">{(selectedRadius / 1000).toFixed(1)} km</span>
              </div>
              <input 
                type="range"
                min={500}
                max={5000}
                step={500}
                value={selectedRadius}
                onChange={(e) => setSelectedRadius(Number(e.target.value))}
                className="w-full accent-gold bg-neutral-100 dark:bg-neutral-800 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Advanced Filters */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <label className="text-[9px] font-black uppercase text-brand-gray block mb-1">Min Rating</label>
                <select 
                  value={minRating}
                  onChange={(e) => setMinRating(Number(e.target.value))}
                  className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl px-3 py-2 text-[10px] font-bold text-foreground focus:outline-none"
                >
                  <option value={0}>All Ratings</option>
                  <option value={4}>4.0+ Stars</option>
                  <option value={4.5}>4.5+ Stars</option>
                  <option value={4.8}>4.8+ Stars</option>
                </select>
              </div>

              <div>
                <label className="text-[9px] font-black uppercase text-brand-gray block mb-1">Price Range</label>
                <div className="grid grid-cols-4 gap-1 border border-neutral-200 dark:border-neutral-800 rounded-xl p-0.5 bg-neutral-50 dark:bg-neutral-950 text-[9px] font-black">
                  {(['all', '$', '$$', '$$$'] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriceTier(p)}
                      className={`py-1.5 rounded-lg text-center uppercase ${priceTier === p ? 'bg-gold text-brand-black' : 'text-brand-gray'}`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Open Now Toggle */}
            <div className="flex items-center justify-between border-t border-neutral-100 dark:border-neutral-800/80 pt-3.5">
              <span className="text-[10px] font-black text-brand-gray uppercase flex items-center gap-1">
                <Clock size={11} className="text-gold" />
                <span>Open Stalls Only</span>
              </span>

              <button
                type="button"
                onClick={() => setOpenNowOnly(!openNowOnly)}
                className={`w-9 h-5 rounded-full p-0.5 transition-colors focus:outline-none ${openNowOnly ? 'bg-gold' : 'bg-neutral-200 dark:bg-neutral-800'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white dark:bg-neutral-950 transform transition-transform ${openNowOnly ? 'translate-x-4' : 'translate-x-0'}`}></div>
              </button>
            </div>
          </div>

          {/* Favorites List */}
          {(favoriteStallIds.length > 0 || favoriteFoodIds.length > 0) && (
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-800 rounded-[28px] p-5 shadow-sm space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-neutral-450 dark:text-neutral-500">Your Wishlist</h3>
              <div className="space-y-3">
                {favoriteStallIds.map(id => {
                  const stall = stalls.find(s => s.id === id);
                  if (!stall) return null;
                  return (
                    <div key={stall.id} onClick={() => handleStallClick(stall)} className="flex items-center justify-between p-2 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200/20 hover:border-gold/30 cursor-pointer">
                      <span className="text-[10px] font-extrabold text-foreground truncate max-w-[150px]">📍 {stall.name}</span>
                      <button onClick={(e) => { e.stopPropagation(); toggleFavoriteStall(stall.id); }} className="text-brand-firebrick hover:scale-105"><Heart size={12} fill="currentColor" /></button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* Right Column: AI Recommendations, Hero, Stall list (7 cols) */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Main Hero Banner */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative bg-neutral-950 text-white rounded-[32px] p-8 md:p-10 overflow-hidden flex flex-col md:flex-row items-center justify-between shadow-lg"
          >
            <div className="absolute right-0 top-0 w-80 h-80 bg-gold/10 rounded-full blur-3xl"></div>
            
            <div className="max-w-md z-10 space-y-3 text-center md:text-left">
              <span className="inline-block bg-gold text-brand-black text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                Interactive Food Tour
              </span>
              <h1 className="text-2xl md:text-3xl font-black font-outfit leading-tight">
                Vrooklyn Street Food <span className="text-gold">Discovery Platform</span>
              </h1>
              <p className="text-xs text-neutral-450 leading-relaxed font-medium">
                Locate open stalls in real time, watch recipe preparation logs, and scan dishes with AI.
              </p>
            </div>

            <div className="relative w-36 h-36 mt-4 md:mt-0 select-none flex items-center justify-center text-[80px] animate-float">
              🍔
            </div>
          </motion.div>

          {/* AI Recommended Foods Section */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-4 flex items-center gap-1.5">
              <Activity size={14} className="text-emerald-500 animate-pulse" />
              <span>AI Recommendations (High Rated Near You)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {recommendedFoods.map(food => {
                const stall = stalls.find(s => s.id === food.stall_id);
                return (
                  <div 
                    key={food.id}
                    onClick={() => {
                      if (stall) {
                        setSelectedStall(stall);
                        setSelectedFood(food);
                        router.push(`/stall/${stall.id}`);
                      }
                    }}
                    className="bg-white dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-805 rounded-3xl p-3 flex flex-col justify-between cursor-pointer hover:border-gold/30 hover:shadow-md transition-all group"
                  >
                    <div className="w-full h-24 rounded-2xl overflow-hidden bg-neutral-100 mb-3 relative">
                      <img src={food.cover_pic} alt={food.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      <span className="absolute bottom-2 left-2 bg-neutral-950/80 backdrop-blur text-[8px] font-black text-gold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                        ★ {food.rating}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-[11px] font-black truncate text-foreground group-hover:text-gold transition-colors">{food.name}</h4>
                      <p className="text-[9px] text-brand-gray truncate font-bold uppercase">{stall?.name}</p>
                    </div>

                    <div className="flex justify-between items-center mt-3 pt-2 border-t border-neutral-100 dark:border-neutral-800/80">
                      <span className="text-[10px] font-black text-foreground">${food.price.toFixed(2)}</span>
                      <span className="text-[8px] text-emerald-500 font-extrabold uppercase bg-emerald-50 dark:bg-emerald-950/20 px-1.5 py-0.5 rounded-full">AI Match</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Categories Grid Selector */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-neutral-450 dark:text-neutral-500 mb-3">Filter Category</h3>
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              {categories.map((cat) => {
                const isActive = selectedCategory === cat.name;
                return (
                  <button
                    key={cat.name}
                    onClick={() => setSelectedCategory(cat.name)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-[10px] font-black uppercase whitespace-nowrap transition-all border ${
                      isActive 
                        ? 'bg-gold border-gold text-brand-black shadow-sm' 
                        : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-brand-gray hover:bg-neutral-50 dark:hover:bg-neutral-850'
                    }`}
                  >
                    <span>{cat.emoji}</span>
                    <span>{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Stalls List */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold font-outfit text-foreground">Matched Gourmet Stalls</h3>
                <p className="text-[10px] text-brand-gray font-bold uppercase mt-0.5">Sorted by rating & location</p>
              </div>
              <span className="text-[10px] text-brand-gray font-bold bg-neutral-100 dark:bg-neutral-800 px-3 py-1 rounded-full">{filteredStalls.length} Result(s)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <AnimatePresence mode="popLayout">
                {filteredStalls.length === 0 ? (
                  <div className="col-span-full text-center py-16 text-xs text-brand-gray font-bold bg-white dark:bg-neutral-900 border border-neutral-205 dark:border-neutral-800 rounded-3xl">
                    No open stalls match your filter radius or parameters. Try adjusting filters.
                  </div>
                ) : (
                  filteredStalls.map((stall) => {
                    const isOpen = isStallOpenNow(stall);
                    
                    // calculate distance
                    let distanceText = 'Simulated';
                    let walkTime = 15;
                    if (userLocation) {
                      const distMeters = getDistance(userLocation.lat, userLocation.lng, stall.lat, stall.lng);
                      distanceText = distMeters < 1000 
                        ? `${Math.round(distMeters)} m` 
                        : `${(distMeters / 1000).toFixed(1)} km`;
                      walkTime = Math.round(distMeters / 80);
                    }

                    return (
                      <motion.div
                        key={stall.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        onClick={() => handleStallClick(stall)}
                        className="bg-white dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-805 rounded-[28px] overflow-hidden cursor-pointer hover:border-gold/30 hover:shadow-lg transition-all duration-300 flex flex-col group relative"
                      >
                        {/* Stall Cover Image */}
                        <div className="w-full h-36 bg-neutral-100 dark:bg-neutral-850 relative overflow-hidden">
                          <img 
                            src={stall.cover_pic} 
                            alt={stall.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          
                          {/* Rating & Distance Badges */}
                          <div className="absolute top-3 left-3 bg-neutral-950/80 backdrop-blur-md px-2.5 py-0.5 rounded-full flex items-center gap-0.5 text-[9px] font-black text-gold border border-neutral-800/30">
                            ★ {stall.avg_rating}
                          </div>

                          <div className="absolute top-3 right-3 bg-neutral-950/80 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[9px] font-black text-white border border-neutral-800/30">
                            📍 {distanceText}
                          </div>
                        </div>
                        
                        {/* Card details */}
                        <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <h4 className="font-extrabold text-xs text-foreground group-hover:text-gold transition-colors leading-tight">
                                {stall.name}
                              </h4>
                              
                              <span className={`text-[8px] font-black px-2 py-0.5 rounded-full border ${isOpen ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500 border-emerald-200/30' : 'bg-red-50 dark:bg-red-950/20 text-red-500 border-red-200/30'}`}>
                                {isOpen ? 'OPEN' : 'CLOSED'}
                              </span>
                            </div>
                            
                            <p className="text-[10px] text-brand-gray mt-1 leading-relaxed font-semibold line-clamp-2">
                              {stall.title}
                            </p>
                          </div>

                          <div className="border-t border-neutral-100 dark:border-neutral-800/80 pt-3 flex items-center justify-between text-[9px] text-brand-gray font-bold">
                            <span className="flex items-center gap-0.5">⏱ Walk: {walkTime} min</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFavoriteStall(stall.id);
                              }}
                              className="text-brand-gray hover:text-brand-firebrick active:scale-90 transition-transform"
                            >
                              <Heart size={14} className={favoriteStallIds.includes(stall.id) ? 'fill-current text-brand-firebrick' : ''} />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </AnimatePresence>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
