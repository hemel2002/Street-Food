'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Plus, Image as ImageIcon, Check, Loader2, Landmark, ListPlus, Flame, DollarSign, ToggleLeft, ToggleRight, Sparkles, MessageSquare, Percent, BarChart3, TrendingUp, Calendar, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp, Food, Review, VendorPromoCode } from '@/context/AppContext';
import { useRouter } from 'next/navigation';
import StallLocationMap from '@/components/StallLocationMap';

export default function DashboardView() {
  const { 
    foods, 
    addFood, 
    deleteFood,
    selectedStall, 
    updateStall, 
    toggleFoodAvailability, 
    orders, 
    updateOrderStatus,
    vendorPromoCodes,
    addVendorPromoCode,
    togglePromoCodeStatus,
    reviews,
    addReviewReply
  } = useApp();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState<'menu' | 'stall' | 'orders' | 'analytics'>('menu');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  
  // Food States
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [calories, setCalories] = useState('');
  const [prepTime, setPrepTime] = useState('15');
  const [ingredients, setIngredients] = useState('');
  const [category, setCategory] = useState('Burger');
  const [videoUrl, setVideoUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Stall States
  const [stallName, setStallName] = useState('');
  const [stallTitle, setStallTitle] = useState('');
  const [stallDescription, setStallDescription] = useState('');
  const [stallArea, setStallArea] = useState('');
  const [stallPrepTime, setStallPrepTime] = useState('');
  const [stallCaloriesInfo, setStallCaloriesInfo] = useState('');
  const [stallCoverUrl, setStallCoverUrl] = useState('');
  const [stallStatus, setStallStatus] = useState<'approved' | 'closed'>('approved');
  const [stallHours, setStallHours] = useState<any>({
    Monday: { open: '09:00', close: '21:00', closed: false },
    Tuesday: { open: '09:00', close: '21:00', closed: false },
    Wednesday: { open: '09:00', close: '21:00', closed: false },
    Thursday: { open: '09:00', close: '21:00', closed: false },
    Friday: { open: '09:00', close: '23:00', closed: false },
    Saturday: { open: '10:00', close: '23:00', closed: false },
    Sunday: { open: '10:00', close: '20:00', closed: true }
  });
  
  const [isStallUploading, setIsStallUploading] = useState(false);
  const [isStallSubmitting, setIsStallSubmitting] = useState(false);
  const [stallSuccessMsg, setStallSuccessMsg] = useState('');

  // Promo Code States
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [promoDiscountInput, setPromoDiscountInput] = useState('');
  const [promoType, setPromoType] = useState<'percentage' | 'fixed'>('percentage');

  // Review Response States
  const [replyInput, setReplyInput] = useState<{ [reviewId: string]: string }>({});

  const [stallLat, setStallLat] = useState(selectedStall?.lat || 40.6782);
  const [stallLng, setStallLng] = useState(selectedStall?.lng || -73.9442);
  const [locationSuggestions, setLocationSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);

  const searchTimeoutRef = useRef<any>(null);

  const handleLocationChange = async (val: string) => {
    setStallArea(val);
    if (val.length < 3) {
      setLocationSuggestions([]);
      return;
    }

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    setIsSearchingLocation(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(val)}&limit=5`);
        const data = await res.json();
        setLocationSuggestions(data);
        setShowSuggestions(true);
      } catch (e) {
        console.error('Failed to fetch suggestions', e);
      } finally {
        setIsSearchingLocation(false);
      }
    }, 600);
  };

  const handleMapLocationChange = async (lat: number, lng: number) => {
    setStallLat(lat);
    setStallLng(lng);
    
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      const data = await res.json();
      if (data && data.display_name) {
        setStallArea(data.display_name);
      }
    } catch (e) {
      console.error('Failed to reverse geocode', e);
    }
  };

  const vendorFoods = foods.filter(f => f.stall_id === selectedStall?.id);
  const vendorReviews = reviews.filter(r => r.stall_id === selectedStall?.id);
  const vendorPromo = vendorPromoCodes.filter(p => p.stall_id === selectedStall?.id);

  // Daily upload limit calculations
  const todayStr = new Date().toDateString();
  const todaysAddedFoodsCount = vendorFoods.filter(f => {
    if (f.id.startsWith('food-')) {
      const ts = parseInt(f.id.replace('food-', ''));
      return !isNaN(ts) && new Date(ts).toDateString() === todayStr;
    }
    return false;
  }).length;
  const isLimitReached = todaysAddedFoodsCount >= 4;

  useEffect(() => {
    if (orders.length > 0 && !selectedOrderId) {
      setSelectedOrderId(orders[0].id);
    }
  }, [orders, selectedOrderId]);

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (selectedStall) {
      setStallName(selectedStall.name);
      setStallTitle(selectedStall.title || '');
      setStallDescription(selectedStall.description || '');
      setStallArea(selectedStall.area || '');
      setStallPrepTime(selectedStall.prep_time || '15 min');
      setStallCaloriesInfo(selectedStall.calories_info || '200kcal');
      setStallCoverUrl(selectedStall.cover_pic || '');
      setStallStatus(selectedStall.status === 'closed' ? 'closed' : 'approved');
      setStallLat(selectedStall.lat || 40.6782);
      setStallLng(selectedStall.lng || -73.9442);
      if (selectedStall.hours) {
        setStallHours(selectedStall.hours);
      }
    }
  }, [selectedStall]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setImageFile(file);
    setIsUploading(true);
    setUploadedUrl('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.url) {
        setUploadedUrl(data.url);
      } else {
        alert('Upload failed: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      console.error(err);
      alert('Upload failed. Please check environment variables.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleStallImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setIsStallUploading(true);
    setStallCoverUrl('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.url) {
        setStallCoverUrl(data.url);
      } else {
        alert('Upload failed: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      console.error(err);
      alert('Upload failed. Please check environment variables.');
    } finally {
      setIsStallUploading(false);
    }
  };

  const handleStallSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStall) return;
    setIsStallSubmitting(true);
    setStallSuccessMsg('');

    const success = await updateStall(selectedStall.id, {
      name: stallName,
      title: stallTitle,
      description: stallDescription,
      area: stallArea,
      prep_time: stallPrepTime,
      calories_info: stallCaloriesInfo,
      cover_pic: stallCoverUrl,
      status: stallStatus,
      hours: stallHours,
      lat: stallLat,
      lng: stallLng
    });

    setIsStallSubmitting(false);
    if (success) {
      setStallSuccessMsg('✓ Stall settings & business hours updated!');
      setTimeout(() => setStallSuccessMsg(''), 3000);
    } else {
      alert('Failed to update stall settings.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStall) return;
    if (isLimitReached) {
      alert('Daily upload limit of 4 foods reached. Try again tomorrow.');
      return;
    }
    if (!name || !price || !ingredients) {
      alert('Please fill out all required fields');
      return;
    }

    setIsSubmitting(true);
    setSuccessMsg('');

    const coverPic = uploadedUrl || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80';

    const newFood = {
      stall_id: selectedStall.id,
      name,
      price: parseFloat(price),
      rating: 5.0,
      calories: parseInt(calories) || 200,
      prep_time_mins: parseInt(prepTime) || 15,
      ingredients,
      availability: true,
      cover_pic: coverPic,
      category,
      video_url: videoUrl
    };

    const success = await addFood(newFood);
    setIsSubmitting(false);

    if (success) {
      setSuccessMsg('✓ Dish added successfully!');
      setName('');
      setPrice('');
      setCalories('');
      setPrepTime('15');
      setIngredients('');
      setImageFile(null);
      setUploadedUrl('');
      setVideoUrl('');
      
      setTimeout(() => setSuccessMsg(''), 3000);
    }
  };

  const handleCreatePromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStall || !promoCodeInput || !promoDiscountInput) return;
    
    const disc = parseFloat(promoDiscountInput);
    if (isNaN(disc)) return;

    // percentage values: 20% -> 0.20
    const finalDiscValue = promoType === 'percentage' ? disc / 100 : disc;

    const success = await addVendorPromoCode({
      stall_id: selectedStall.id,
      code: promoCodeInput.trim().toUpperCase(),
      discount: finalDiscValue,
      type: promoType,
      active: true
    });

    if (success) {
      setPromoCodeInput('');
      setPromoDiscountInput('');
      alert('✓ Stall coupon created successfully!');
    }
  };

  const handlePostReply = async (reviewId: string) => {
    const reply = replyInput[reviewId];
    if (!reply || !reply.trim()) return;

    const success = await addReviewReply(reviewId, reply);
    if (success) {
      setReplyInput(prev => ({ ...prev, [reviewId]: '' }));
      alert('✓ Response posted to customer!');
    }
  };

  return (
    <div className="w-full px-4 sm:px-6 py-6 text-foreground">
      {/* Header Row */}
      <div className="flex items-center justify-between mb-8">
        <button 
          onClick={() => router.push('/auth')}
          className="flex items-center gap-2 text-xs font-black text-brand-gray hover:text-gold transition-colors uppercase tracking-wider"
        >
          <ArrowLeft size={14} />
          <span>Back to Profile</span>
        </button>
        <h1 className="text-2xl font-black font-outfit text-foreground">
          Vendor Management Dashboard
        </h1>
        <div className="w-10"></div>
      </div>

      {/* Vendor Stats Cards Grid */}
      {selectedStall && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
          <div className="bg-neutral-950 text-white p-5 rounded-3xl flex gap-4 items-center relative overflow-hidden shadow">
            <div className="absolute right-[-10px] bottom-[-10px] text-neutral-900 text-7xl select-none opacity-20">🍔</div>
            <div className="w-14 h-14 rounded-2xl overflow-hidden shrink-0 border border-neutral-850">
              <img src={selectedStall.cover_pic} alt={selectedStall.name} className="w-full h-full object-cover" />
            </div>
            <div>
              <span className="text-[9px] text-gold font-bold uppercase tracking-wider">Vendor Stall</span>
              <h3 className="text-sm font-extrabold font-outfit mt-0.5 leading-tight">{selectedStall.name}</h3>
              <p className="text-[10px] text-neutral-400 font-semibold mt-1">Status: {stallStatus === 'approved' ? '🟢 OPEN' : '🔴 CLOSED'}</p>
            </div>
          </div>

          <div className="bg-white dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-800 rounded-3xl p-5 shadow-sm flex flex-col justify-between">
            <span className="text-[10px] text-brand-gray font-bold uppercase tracking-wider block">Today's Uploads</span>
            <div className="flex items-end justify-between mt-2">
              <span className="text-2xl font-black text-foreground">{todaysAddedFoodsCount} / 4</span>
              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${isLimitReached ? 'bg-red-50 dark:bg-red-950 text-red-500' : 'bg-emerald-50 dark:bg-emerald-950 text-emerald-500'}`}>
                {isLimitReached ? 'LIMIT MET' : 'AVAILABLE'}
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-800 rounded-3xl p-5 shadow-sm flex flex-col justify-between">
            <span className="text-[10px] text-brand-gray font-bold uppercase tracking-wider block">Average Rating</span>
            <div className="flex items-end justify-between mt-2">
              <span className="text-2xl font-black text-foreground">{selectedStall.avg_rating}</span>
              <span className="text-[10px] text-gold font-extrabold bg-gold/10 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                ★ OUTSTANDING
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-800 rounded-3xl p-5 shadow-sm flex flex-col justify-between">
            <span className="text-[10px] text-brand-gray font-bold uppercase tracking-wider block">Completed Orders</span>
            <div className="flex items-end justify-between mt-2">
              <span className="text-2xl font-black text-foreground">
                {orders.filter(o => o.status === 'delivered').length}
              </span>
              <span className="text-[10px] text-sky-500 font-extrabold bg-sky-50 dark:bg-sky-950/20 px-2 py-0.5 rounded-full">DELIVERED</span>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-6 mb-6 border-b border-neutral-105 dark:border-neutral-805 pb-px text-xs font-black uppercase tracking-wider">
        {(['menu', 'stall', 'orders', 'analytics'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 relative transition-colors ${activeTab === tab ? 'text-gold' : 'text-brand-gray hover:text-foreground'}`}
          >
            {tab === 'menu' ? 'Manage Menu' : tab === 'stall' ? 'Stall Settings' : tab === 'orders' ? 'Live Orders' : 'Performance & Analytics'}
            {activeTab === tab && (
              <motion.div layoutId="dash-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold" />
            )}
          </button>
        ))}
      </div>

      {/* Conditional Rendering Tab View */}
      {activeTab === 'menu' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Add Dish Form */}
          <div className="lg:col-span-7 bg-white dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-800 rounded-[28px] p-5 md:p-6 shadow-sm">
            <h3 className="text-sm font-bold font-outfit mb-5 flex items-center gap-2 text-foreground">
              <ListPlus size={16} className="text-gold" />
              <span>Add New Dish</span>
            </h3>

            {isLimitReached && (
              <div className="mb-5 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 text-amber-600 px-4 py-2.5 rounded-xl text-xs font-black">
                ⚠️ Daily limit reached. You cannot add more than 4 dishes today.
              </div>
            )}

            {successMsg && (
              <div className="mb-5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 text-emerald-600 px-4 py-2.5 rounded-xl text-xs font-bold">
                {successMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] font-black uppercase text-brand-gray block mb-1">Dish Name *</label>
                  <input type="text" required disabled={isLimitReached} value={name} onChange={e => setName(e.target.value)} className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl px-3 py-2.5 text-xs text-foreground focus:outline-none focus:border-gold" />
                </div>
                <div>
                  <label className="text-[9px] font-black uppercase text-brand-gray block mb-1">Price ($) *</label>
                  <input type="number" step="0.01" required disabled={isLimitReached} value={price} onChange={e => setPrice(e.target.value)} className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl px-3 py-2.5 text-xs text-foreground focus:outline-none focus:border-gold" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-[9px] font-black uppercase text-brand-gray block mb-1">Calories (kcal)</label>
                  <input type="number" disabled={isLimitReached} value={calories} onChange={e => setCalories(e.target.value)} className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl px-3 py-2.5 text-xs text-foreground focus:outline-none focus:border-gold" />
                </div>
                <div>
                  <label className="text-[9px] font-black uppercase text-brand-gray block mb-1">Prep Time (mins)</label>
                  <input type="number" disabled={isLimitReached} value={prepTime} onChange={e => setPrepTime(e.target.value)} className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl px-3 py-2.5 text-xs text-foreground focus:outline-none focus:border-gold" />
                </div>
                <div>
                  <label className="text-[9px] font-black uppercase text-brand-gray block mb-1">Category</label>
                  <select disabled={isLimitReached} value={category} onChange={e => setCategory(e.target.value)} className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl px-3 py-2.5 text-xs text-foreground focus:outline-none">
                    <option value="Burger">Burger</option>
                    <option value="Pizza">Pizza</option>
                    <option value="Sushi">Sushi</option>
                    <option value="Drinks">Drinks</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[9px] font-black uppercase text-brand-gray block mb-1">Video Preparation Link (raw mp4 or embed)</label>
                <input type="text" placeholder="https://assets.mixkit.co/..." disabled={isLimitReached} value={videoUrl} onChange={e => setVideoUrl(e.target.value)} className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl px-3 py-2.5 text-xs text-foreground focus:outline-none focus:border-gold" />
              </div>

              <div>
                <label className="text-[9px] font-black uppercase text-brand-gray block mb-1">Ingredients *</label>
                <textarea rows={3} required disabled={isLimitReached} value={ingredients} onChange={e => setIngredients(e.target.value)} className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl px-3 py-2.5 text-xs text-foreground resize-none focus:outline-none focus:border-gold" />
              </div>

              {/* Upload image */}
              <div>
                <label className="text-[9px] font-black uppercase text-brand-gray block mb-1">Dish Cover Image</label>
                <div className="relative border border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 flex flex-col items-center bg-neutral-50 dark:bg-neutral-950 hover:bg-neutral-100/50 transition-colors">
                  <input type="file" accept="image/*" disabled={isLimitReached} onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
                  
                  {isUploading ? (
                    <div className="flex flex-col items-center gap-1.5 text-neutral-400">
                      <Loader2 size={20} className="animate-spin text-gold" />
                      <span className="text-[9px] font-black">Uploading to Cloudinary...</span>
                    </div>
                  ) : uploadedUrl ? (
                    <div className="flex flex-col items-center gap-1.5">
                      <img src={uploadedUrl} className="w-16 h-12 rounded object-cover" />
                      <span className="text-[9px] text-emerald-500 font-bold">Uploaded successfully</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-neutral-400">
                      <ImageIcon size={20} />
                      <span className="text-[9px] font-bold">Upload Cover Pic</span>
                    </div>
                  )}
                </div>
              </div>

              <button type="submit" disabled={isSubmitting || isUploading || isLimitReached} className="w-full bg-gold hover:bg-gold-hover text-brand-black disabled:opacity-50 py-3.5 rounded-2xl font-black text-xs transition-transform active:scale-98">
                {isSubmitting ? 'Adding Dish...' : 'Add Dish'}
              </button>
            </form>
          </div>

          {/* Right: Menu list */}
          <div className="lg:col-span-5 bg-white dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-800 rounded-[28px] p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold font-outfit text-foreground">Menu Items</h3>
            <div className="divide-y divide-neutral-100 dark:divide-neutral-800/60 space-y-3 max-h-[500px] overflow-y-auto no-scrollbar">
              {vendorFoods.map(item => (
                <div key={item.id} className="flex justify-between items-center py-2.5">
                  <div className="flex items-center gap-3">
                    <img src={item.cover_pic} className="w-10 h-10 rounded-lg object-cover" />
                    <div>
                      <h4 className="text-xs font-black text-foreground">{item.name}</h4>
                      <p className="text-[9px] text-brand-gray font-bold uppercase mt-0.5">${item.price.toFixed(2)}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button 
                      onClick={() => toggleFoodAvailability(item.id)}
                      className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-full border ${item.availability ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500 border-emerald-200/50' : 'bg-neutral-55 text-neutral-400 border-neutral-200'}`}
                    >
                      {item.availability ? 'Active' : 'Inactive'}
                    </button>
                    <button 
                      onClick={async () => {
                        if (confirm('Delete this food item?')) await deleteFood(item.id);
                      }}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : activeTab === 'stall' && selectedStall ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Settings form & hours */}
          <div className="lg:col-span-7 bg-white dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-800 rounded-[28px] p-6 shadow-sm space-y-6">
            <h3 className="text-sm font-bold font-outfit flex items-center gap-2 text-foreground">
              <Sparkles size={16} className="text-gold" />
              <span>Edit Stall details</span>
            </h3>

            {stallSuccessMsg && (
              <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-250 text-emerald-600 px-4 py-2.5 rounded-xl text-xs font-bold">
                {stallSuccessMsg}
              </div>
            )}

            <form onSubmit={handleStallSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] font-black uppercase text-brand-gray block mb-1">Stall Name</label>
                  <input type="text" required value={stallName} onChange={e => setStallName(e.target.value)} className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl px-3 py-2.5 text-xs text-foreground focus:outline-none" />
                </div>
                <div>
                  <label className="text-[9px] font-black uppercase text-brand-gray block mb-1">Tagline</label>
                  <input type="text" value={stallTitle} onChange={e => setStallTitle(e.target.value)} className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl px-3 py-2.5 text-xs text-foreground focus:outline-none" />
                </div>
              </div>

              <div>
                <label className="text-[9px] font-black uppercase text-brand-gray block mb-1">Description</label>
                <textarea rows={2} value={stallDescription} onChange={e => setStallDescription(e.target.value)} className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl px-3 py-2.5 text-xs text-foreground resize-none focus:outline-none" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] font-black uppercase text-brand-gray block mb-1">Est Prep Time</label>
                  <input type="text" value={stallPrepTime} onChange={e => setStallPrepTime(e.target.value)} className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl px-3 py-2.5 text-xs text-foreground focus:outline-none" />
                </div>
                <div>
                  <label className="text-[9px] font-black uppercase text-brand-gray block mb-1">Operating Status</label>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setStallStatus('approved')} className={`flex-1 py-2 text-[10px] font-black rounded-lg border uppercase ${stallStatus === 'approved' ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm' : 'border-neutral-200 text-brand-gray'}`}>OPEN</button>
                    <button type="button" onClick={() => setStallStatus('closed')} className={`flex-1 py-2 text-[10px] font-black rounded-lg border uppercase ${stallStatus === 'closed' ? 'bg-red-500 border-red-500 text-white shadow-sm' : 'border-neutral-200 text-brand-gray'}`}>CLOSED</button>
                  </div>
                </div>
              </div>

              {/* Autocomplete Location Field */}
              <div className="relative">
                <label className="text-[9px] font-black uppercase text-brand-gray block mb-1">Stall Location Address (Autocomplete)</label>
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Type address to search..."
                    value={stallArea} 
                    onChange={e => handleLocationChange(e.target.value)} 
                    className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-205 dark:border-neutral-800 rounded-xl px-3 py-2.5 text-xs text-foreground focus:outline-none" 
                  />
                  {isSearchingLocation && (
                    <div className="absolute right-3 bottom-2.5">
                      <Loader2 size={12} className="animate-spin text-gold" />
                    </div>
                  )}
                </div>

                {showSuggestions && locationSuggestions.length > 0 && (
                  <div className="absolute left-0 right-0 z-50 mt-1 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-lg max-h-40 overflow-y-auto divide-y divide-neutral-100 dark:divide-neutral-800/80">
                    {locationSuggestions.map((item, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setStallArea(item.display_name);
                          setStallLat(parseFloat(item.lat));
                          setStallLng(parseFloat(item.lon));
                          setLocationSuggestions([]);
                          setShowSuggestions(false);
                        }}
                        className="w-full text-left px-3 py-2.5 text-[10px] font-bold text-brand-gray hover:bg-neutral-50 dark:hover:bg-neutral-950 hover:text-foreground transition-colors truncate"
                      >
                        📍 {item.display_name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Draggable location Map */}
              <div>
                <label className="text-[9px] font-black uppercase text-brand-gray block">Shop Location Map</label>
                <StallLocationMap 
                  lat={stallLat} 
                  lng={stallLng} 
                  onLocationChange={handleMapLocationChange} 
                />
                <div className="flex justify-between text-[8px] text-brand-gray font-bold mt-1.5 uppercase pl-0.5">
                  <span>Latitude: {stallLat.toFixed(5)}</span>
                  <span>Longitude: {stallLng.toFixed(5)}</span>
                </div>
              </div>

              {/* Hours Grid */}
              <div className="border-t border-neutral-100 dark:border-neutral-800 pt-4 space-y-3">
                <span className="text-[10px] font-black uppercase text-neutral-450 dark:text-neutral-500 flex items-center gap-1">
                  <Calendar size={13} />
                  <span>Stall Business Hours</span>
                </span>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[180px] overflow-y-auto pr-1">
                  {Object.keys(stallHours).map(day => (
                    <div key={day} className="flex justify-between items-center text-[10px] bg-neutral-50 dark:bg-neutral-950 p-2.5 rounded-xl border border-neutral-200/50 dark:border-neutral-850">
                      <span className="font-extrabold w-16">{day}</span>
                      <div className="flex items-center gap-1.5">
                        <input 
                          type="text" 
                          disabled={stallHours[day].closed}
                          value={stallHours[day].open} 
                          onChange={(e) => setStallHours((prev: any) => ({
                            ...prev,
                            [day]: { ...prev[day], open: e.target.value }
                          }))}
                          className="w-10 bg-white dark:bg-neutral-900 border border-neutral-250 dark:border-neutral-800 rounded px-1 text-center py-0.5"
                        />
                        <span>-</span>
                        <input 
                          type="text" 
                          disabled={stallHours[day].closed}
                          value={stallHours[day].close} 
                          onChange={(e) => setStallHours((prev: any) => ({
                            ...prev,
                            [day]: { ...prev[day], close: e.target.value }
                          }))}
                          className="w-10 bg-white dark:bg-neutral-900 border border-neutral-250 dark:border-neutral-800 rounded px-1 text-center py-0.5"
                        />
                      </div>
                      <label className="flex items-center gap-1 font-bold text-neutral-450">
                        <input 
                          type="checkbox" 
                          checked={stallHours[day].closed}
                          onChange={(e) => setStallHours((prev: any) => ({
                            ...prev,
                            [day]: { ...prev[day], closed: e.target.checked }
                          }))}
                          className="accent-gold rounded"
                        />
                        <span>Closed</span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[9px] font-black uppercase text-brand-gray block mb-1">Stall Cover Photo</label>
                <div className="relative border border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 flex flex-col items-center bg-neutral-50 dark:bg-neutral-950">
                  <input type="file" accept="image/*" onChange={handleStallImageChange} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
                  {isStallUploading ? (
                    <div className="flex flex-col items-center gap-1 text-neutral-400">
                      <Loader2 size={16} className="animate-spin text-gold" />
                      <span className="text-[9px] font-bold">Uploading...</span>
                    </div>
                  ) : stallCoverUrl ? (
                    <div className="flex flex-col items-center gap-1">
                      <img src={stallCoverUrl} className="w-20 h-10 rounded object-cover" />
                      <span className="text-[9px] text-emerald-500 font-bold">Cover uploaded</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-neutral-400">
                      <ImageIcon size={16} />
                      <span className="text-[9px] font-bold font-outfit">Click to upload cover photo</span>
                    </div>
                  )}
                </div>
              </div>

              <button type="submit" disabled={isStallSubmitting || isStallUploading} className="w-full bg-gold hover:bg-gold-hover text-brand-black disabled:opacity-50 py-3.5 rounded-2xl font-black text-xs shadow-md">
                {isStallSubmitting ? 'Saving settings...' : 'Save Settings'}
              </button>
            </form>
          </div>

          {/* Coupon codes & details (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Promo creator form */}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-800 rounded-[28px] p-5 shadow-sm space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-neutral-450 dark:text-neutral-500 flex items-center gap-1.5">
                <Percent size={14} className="text-gold" />
                <span>Stall Coupon Codes</span>
              </h3>

              <form onSubmit={handleCreatePromo} className="space-y-3">
                <div>
                  <label className="text-[9px] font-black uppercase text-brand-gray block mb-1">Coupon Code (e.g. TACO50)</label>
                  <input type="text" required value={promoCodeInput} onChange={e => setPromoCodeInput(e.target.value)} className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-805 rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[9px] font-black uppercase text-brand-gray block mb-1">Discount Value</label>
                    <input type="number" required placeholder={promoType === 'percentage' ? '%' : '$'} value={promoDiscountInput} onChange={e => setPromoDiscountInput(e.target.value)} className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-805 rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none" />
                  </div>
                  <div>
                    <label className="text-[9px] font-black uppercase text-brand-gray block mb-1">Type</label>
                    <select value={promoType} onChange={e => setPromoType(e.target.value as any)} className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-805 rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none">
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed ($)</option>
                    </select>
                  </div>
                </div>

                <button type="submit" className="w-full bg-gold hover:bg-gold-hover text-brand-black py-2.5 rounded-xl text-[10px] font-black uppercase shadow-sm">Create Coupon</button>
              </form>

              {/* Promo List */}
              <div className="border-t border-neutral-105 dark:border-neutral-855 pt-3 space-y-2.5">
                <span className="text-[9px] font-black uppercase text-neutral-400 block">Active Coupons</span>
                {vendorPromo.length === 0 ? (
                  <p className="text-[9px] text-brand-gray font-bold text-center py-2">No coupons created yet.</p>
                ) : (
                  vendorPromo.map(p => (
                    <div key={p.id} className="flex justify-between items-center text-[10px] bg-neutral-50 dark:bg-neutral-950 p-2.5 rounded-xl border border-neutral-200/20">
                      <div>
                        <span className="font-black text-foreground">{p.code}</span>
                        <span className="text-[8px] text-brand-gray pl-2">({p.type === 'percentage' ? `${Math.round(p.discount * 100)}%` : `$${p.discount}`} off)</span>
                      </div>
                      <button 
                        onClick={() => togglePromoCodeStatus(p.id)}
                        className={`text-[8px] font-black px-2 py-0.5 rounded-full ${p.active ? 'bg-emerald-50 text-emerald-500' : 'bg-neutral-100 text-neutral-400'}`}
                      >
                        {p.active ? 'ACTIVE' : 'INACTIVE'}
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
            
            {/* Live Card Mockup */}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-800 rounded-[32px] overflow-hidden shadow group">
              <div className="h-32 relative bg-neutral-100 dark:bg-neutral-950">
                {stallCoverUrl ? <img src={stallCoverUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xs">No Cover Chosen</div>}
                <div className="absolute top-3 right-3 bg-white/95 px-2.5 py-0.5 rounded-full text-[9px] font-black text-brand-black">★ {selectedStall.avg_rating}</div>
              </div>
              <div className="p-4 space-y-1">
                <span className="text-[8px] text-gold font-extrabold uppercase tracking-wide block">{stallTitle || 'Slogan'}</span>
                <h4 className="text-xs font-black text-foreground">{stallName || 'Stall Name'}</h4>
                <p className="text-[10px] text-brand-gray mt-1 leading-relaxed line-clamp-2">{stallDescription || 'No description yet.'}</p>
              </div>
            </div>

          </div>
        </div>
      ) : activeTab === 'orders' ? (
        /* Orders list & dispatcher */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5 bg-white dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-800 rounded-[28px] p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold font-outfit text-foreground mb-2">
              Incoming Orders Queue
            </h3>
            
            <div className="divide-y divide-neutral-105 dark:divide-neutral-800/60 space-y-3 max-h-[500px] overflow-y-auto no-scrollbar">
              {orders.length === 0 ? (
                <p className="text-center py-16 text-[10px] text-brand-gray font-bold">
                  No active orders in the queue.
                </p>
              ) : (
                orders.map((order) => {
                  const isSelected = selectedOrderId === order.id;
                  
                  const statusColors = {
                    pending: 'bg-amber-500/10 text-amber-500 border border-amber-500/20',
                    preparing: 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20',
                    shipping: 'bg-sky-500/10 text-sky-500 border border-sky-500/20',
                    delivered: 'bg-neutral-500/10 text-neutral-450 border border-neutral-500/20'
                  };

                  return (
                    <div
                      key={order.id}
                      onClick={() => setSelectedOrderId(order.id)}
                      className={`p-4 rounded-2xl cursor-pointer border transition-all flex justify-between items-center ${
                        isSelected
                          ? 'bg-neutral-50 dark:bg-neutral-950 border-gold'
                          : 'bg-transparent border-transparent hover:bg-neutral-50/50 dark:hover:bg-neutral-950/40'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-foreground">
                            Order #{order.id.slice(-6).toUpperCase()}
                          </span>
                          <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${statusColors[order.status]}`}>
                            {order.status}
                          </span>
                        </div>
                        <p className="text-[10px] text-brand-gray font-semibold truncate w-36">
                          📍 {order.delivery_address}
                        </p>
                        <p className="text-[9px] text-neutral-450 dark:text-neutral-500 font-bold">
                          {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-xs font-black text-foreground">
                          ${order.total_amount.toFixed(2)}
                        </p>
                        <p className="text-[8px] text-brand-gray font-semibold mt-1">
                          {order.items?.length || 0} items
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Order Details panel (7 cols) */}
          <div className="lg:col-span-7 bg-white dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-800 rounded-[28px] p-6 shadow-sm min-h-[420px] flex flex-col justify-between">
            {(() => {
              const activeOrder = orders.find(o => o.id === selectedOrderId);
              if (!activeOrder) {
                return (
                  <div className="flex-1 flex items-center justify-center text-xs text-brand-gray font-semibold">
                    Select an order from the queue to view details.
                  </div>
                );
              }

              const transitionButtons = {
                pending: {
                  label: 'Accept & Start Cooking',
                  nextStatus: 'preparing' as const,
                  color: 'bg-amber-500 hover:bg-amber-600 text-white'
                },
                preparing: {
                  label: 'Mark as Out for Delivery',
                  nextStatus: 'shipping' as const,
                  color: 'bg-sky-500 hover:bg-sky-600 text-white'
                },
                shipping: {
                  label: 'Mark as Completed / Delivered',
                  nextStatus: 'delivered' as const,
                  color: 'bg-gold hover:bg-gold-hover text-brand-black font-black'
                },
                delivered: null
              };

              const currentBtn = transitionButtons[activeOrder.status];

              return (
                <div className="flex-1 flex flex-col justify-between h-full space-y-6">
                  {/* Top order summary */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-start border-b border-neutral-100 dark:border-neutral-800/80 pb-4">
                      <div>
                        <span className="text-[9px] text-gold font-bold uppercase tracking-wider">Order Details</span>
                        <h3 className="text-sm font-black text-foreground mt-0.5">
                          Order ID: #{activeOrder.id.slice(-8).toUpperCase()}
                        </h3>
                        <p className="text-[10px] text-brand-gray font-semibold mt-1">
                          Placed at: {new Date(activeOrder.created_at).toLocaleString()}
                        </p>
                      </div>
                      
                      <div className="text-right">
                        <span className="text-[9px] text-brand-gray font-semibold block uppercase">Total amount</span>
                        <span className="text-lg font-black text-foreground">${activeOrder.total_amount.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Shipping Address */}
                    <div className="bg-neutral-50 dark:bg-neutral-950 p-4 rounded-2xl border border-neutral-100 dark:border-neutral-800">
                      <span className="text-[9px] text-brand-gray font-bold uppercase tracking-wider block mb-1">
                        Shipping Address
                      </span>
                      <p className="text-xs text-foreground font-extrabold leading-relaxed flex items-center gap-1.5">
                        <span>📍</span>
                        <span>{activeOrder.delivery_address}</span>
                      </p>
                    </div>

                    {/* Purchased Items List */}
                    <div className="space-y-3">
                      <span className="text-[9px] text-brand-gray font-bold uppercase tracking-wider block">
                        Items Purchased
                      </span>
                      
                      <div className="space-y-2.5 max-h-[180px] overflow-y-auto no-scrollbar pr-1 divide-y divide-neutral-100 dark:divide-neutral-800/60">
                        {activeOrder.items?.map((item) => (
                          <div key={item.id} className="flex justify-between items-center text-xs font-semibold py-2">
                            <div className="flex items-center gap-2">
                              <span className="text-[9px] text-neutral-450 dark:text-neutral-500 font-bold bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded">
                                x{item.quantity}
                              </span>
                              <span className="text-foreground font-black">
                                {item.food_name || 'Delicious Dish'}
                              </span>
                            </div>
                            <span className="text-foreground font-bold">
                              ${(item.price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Dispatch control buttons */}
                  <div className="border-t border-neutral-100 dark:border-neutral-800/85 pt-4">
                    {currentBtn ? (
                      <button
                        type="button"
                        onClick={async () => {
                          await updateOrderStatus(activeOrder.id, currentBtn.nextStatus);
                        }}
                        className={`w-full py-4 rounded-2xl font-extrabold text-xs shadow-md transition-all active:scale-[0.98] cursor-pointer ${currentBtn.color}`}
                      >
                        {currentBtn.label}
                      </button>
                    ) : (
                      <div className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-center py-4 rounded-2xl text-xs font-black uppercase tracking-wider">
                        ✓ Order Completed & Delivered
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      ) : (
        /* Performance & Analytics view with SVG charts */
        <div className="space-y-8 animate-fade-in">
          
          {/* Analytics Statistics Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-850 p-5 rounded-[24px] shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[9px] text-brand-gray font-black uppercase">Visitor Views</span>
                <h4 className="text-lg font-black text-foreground mt-1">2,840 views</h4>
                <span className="text-[8px] text-emerald-500 font-extrabold flex items-center gap-0.5 mt-0.5">
                  <TrendingUp size={10} /> +12.4% vs last week
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-gold/15 text-gold flex items-center justify-center text-sm font-black">👁</div>
            </div>

            <div className="bg-white dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-850 p-5 rounded-[24px] shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[9px] text-brand-gray font-black uppercase">Avg Dish Rating</span>
                <h4 className="text-lg font-black text-foreground mt-1">★ 4.8 / 5.0</h4>
                <span className="text-[8px] text-emerald-500 font-extrabold flex items-center gap-0.5 mt-0.5">
                  Based on {vendorReviews.length} total reviews
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center text-sm font-black">⭐</div>
            </div>

            <div className="bg-white dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-850 p-5 rounded-[24px] shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[9px] text-brand-gray font-black uppercase">Total Revenue</span>
                <h4 className="text-lg font-black text-foreground mt-1">
                  ${orders.filter(o => o.status === 'delivered').reduce((sum, o) => sum + o.total_amount, 0).toFixed(2)}
                </h4>
                <span className="text-[8px] text-emerald-500 font-extrabold flex items-center gap-0.5 mt-0.5">
                  Approved orders payout
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center text-sm font-black">💵</div>
            </div>

            <div className="bg-white dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-850 p-5 rounded-[24px] shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[9px] text-brand-gray font-black uppercase">Completed Rate</span>
                <h4 className="text-lg font-black text-foreground mt-1">
                  {orders.length > 0 
                    ? `${Math.round((orders.filter(o => o.status === 'delivered').length / orders.length) * 100)}%` 
                    : '100%'}
                </h4>
                <span className="text-[8px] text-brand-gray font-extrabold mt-0.5 block">
                  {orders.filter(o => o.status !== 'delivered').length} ongoing order(s)
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-sky-500/15 text-sky-500 flex items-center justify-center text-sm font-black">✓</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Sales Chart (SVG) */}
            <div className="lg:col-span-8 bg-white dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-800 rounded-[28px] p-5 shadow-sm space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-neutral-450 dark:text-neutral-500 flex items-center gap-1">
                <BarChart3 size={14} className="text-gold" />
                <span>Monthly Orders Sales Trend</span>
              </h3>

              <div className="w-full h-56 flex items-center justify-center">
                {/* SVG Visual Chart */}
                <svg className="w-full h-full max-h-[200px]" viewBox="0 0 600 200">
                  {/* Grid Lines */}
                  <line x1="50" y1="30" x2="550" y2="30" stroke="#888888" strokeOpacity="0.1" strokeDasharray="3,3" />
                  <line x1="50" y1="80" x2="550" y2="80" stroke="#888888" strokeOpacity="0.1" strokeDasharray="3,3" />
                  <line x1="50" y1="130" x2="550" y2="130" stroke="#888888" strokeOpacity="0.1" strokeDasharray="3,3" />
                  <line x1="50" y1="180" x2="550" y2="180" stroke="#888888" strokeOpacity="0.2" />

                  {/* Trend Area Gradient */}
                  <defs>
                    <linearGradient id="chart-grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#D4AF37" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  
                  {/* Area fill */}
                  <path 
                    d="M 50 180 Q 150 120 250 150 T 450 60 T 550 50 L 550 180 Z" 
                    fill="url(#chart-grad)"
                  />

                  {/* Trend Line */}
                  <path 
                    d="M 50 180 Q 150 120 250 150 T 450 60 T 550 50" 
                    fill="none" 
                    stroke="#D4AF37" 
                    strokeWidth="3.5" 
                    strokeLinecap="round" 
                  />

                  {/* Nodes */}
                  <circle cx="50" cy="180" r="5" fill="#fff" stroke="#D4AF37" strokeWidth="2" />
                  <circle cx="178" cy="132" r="5" fill="#fff" stroke="#D4AF37" strokeWidth="2" />
                  <circle cx="306" cy="140" r="5" fill="#fff" stroke="#D4AF37" strokeWidth="2" />
                  <circle cx="434" cy="65" r="5" fill="#fff" stroke="#D4AF37" strokeWidth="2" />
                  <circle cx="550" cy="50" r="5" fill="#fff" stroke="#D4AF37" strokeWidth="2" />

                  {/* Text Labels */}
                  <text x="50" y="195" fill="#888" fontSize="8" textAnchor="middle">Feb</text>
                  <text x="178" y="195" fill="#888" fontSize="8" textAnchor="middle">Mar</text>
                  <text x="306" y="195" fill="#888" fontSize="8" textAnchor="middle">Apr</text>
                  <text x="434" y="195" fill="#888" fontSize="8" textAnchor="middle">May</text>
                  <text x="550" y="195" fill="#888" fontSize="8" textAnchor="middle">Jun (Now)</text>

                  <text x="40" y="34" fill="#888" fontSize="8" textAnchor="end">$200</text>
                  <text x="40" y="84" fill="#888" fontSize="8" textAnchor="end">$100</text>
                  <text x="40" y="134" fill="#888" fontSize="8" textAnchor="end">$50</text>
                  <text x="40" y="184" fill="#888" fontSize="8" textAnchor="end">$0</text>
                </svg>
              </div>
            </div>

            {/* Best Sellers (4 cols) */}
            <div className="lg:col-span-4 bg-white dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-800 rounded-[28px] p-5 shadow-sm space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-neutral-450 dark:text-neutral-500">
                Most Viewed Dishes
              </h3>

              <div className="space-y-4">
                {vendorFoods.slice(0, 3).map((food, idx) => (
                  <div key={food.id} className="flex justify-between items-center">
                    <div className="flex items-center gap-2.5">
                      <span className="text-[10px] font-black text-brand-gray">#{idx + 1}</span>
                      <div>
                        <span className="text-[11px] font-extrabold text-foreground block">{food.name}</span>
                        <span className="text-[8px] text-brand-gray font-bold uppercase">{food.category}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-black text-foreground block">{100 - idx * 25} views</span>
                      <span className="text-[8px] text-emerald-500 font-extrabold uppercase">Top viewed</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Customer Reviews Response panel */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-800 rounded-[28px] p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-neutral-450 dark:text-neutral-500 flex items-center gap-1.5">
              <MessageSquare size={14} className="text-gold" />
              <span>Reviews Response manager</span>
            </h3>

            <div className="divide-y divide-neutral-100 dark:divide-neutral-800/80 space-y-4 max-h-[300px] overflow-y-auto pr-1 no-scrollbar">
              {vendorReviews.length === 0 ? (
                <p className="text-xs text-brand-gray font-bold text-center py-6">No customer reviews for this stall yet.</p>
              ) : (
                vendorReviews.map(r => (
                  <div key={r.id} className="py-4 space-y-3 text-xs">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-foreground">{r.user_name || 'Anonymous'}</span>
                        <span className="text-[9px] text-gold font-black">{'★'.repeat(r.rating)}</span>
                      </div>
                      <span className="text-[8px] text-brand-gray">{new Date(r.created_at).toLocaleDateString()}</span>
                    </div>

                    <p className="text-brand-gray leading-relaxed font-semibold italic">"{r.comment}"</p>

                    {r.vendor_reply ? (
                      <div className="bg-neutral-50 dark:bg-neutral-950 p-3 rounded-2xl border border-neutral-100 dark:border-neutral-850 pl-4 border-l-gold text-[11px] font-bold text-foreground">
                        <span className="text-gold text-[9px] uppercase tracking-wider block mb-1">Your Response</span>
                        <p>{r.vendor_reply}</p>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <textarea
                          placeholder="Write a public reply to this customer..."
                          value={replyInput[r.id] || ''}
                          onChange={(e) => setReplyInput(prev => ({ ...prev, [r.id]: e.target.value }))}
                          className="flex-1 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl px-3 py-2 text-[10px] text-foreground focus:outline-none resize-none"
                          rows={1}
                        />
                        <button
                          onClick={() => handlePostReply(r.id)}
                          className="bg-gold hover:bg-gold-hover text-brand-black px-4 rounded-xl text-[9px] font-black uppercase transition-all"
                        >
                          Reply
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
