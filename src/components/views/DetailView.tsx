'use client';

import React, { useState } from 'react';
import { ArrowLeft, Heart, Star, Flame, Clock, Plus, Minus, ShoppingBag, Video, MessageSquare, AlertCircle, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';

export default function DetailView() {
  const { 
    selectedStall, 
    selectedFood, 
    setSelectedFood, 
    foods, 
    addToCart,
    reviews,
    addReview,
    addComplaint,
    favoriteFoodIds,
    toggleFavoriteFood
  } = useApp();

  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [readMore, setReadMore] = useState(false);
  
  // Review inputs
  const [ratingInput, setRatingInput] = useState(5);
  const [commentInput, setCommentInput] = useState('');
  
  // Complaint state
  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [complaintReason, setComplaintReason] = useState('');
  const [complaintSuccess, setComplaintSuccess] = useState(false);

  if (!selectedStall) {
    return (
      <div className="max-w-xl mx-auto my-16 text-center p-8 bg-white dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-850 rounded-3xl">
        <p className="text-brand-gray text-xs mb-4">Stall not found.</p>
        <button 
          onClick={() => router.push('/menu')}
          className="px-5 py-2.5 bg-gold text-brand-black font-bold text-xs rounded-xl shadow"
        >
          Back to Stalls
        </button>
      </div>
    );
  }

  const suggestions = selectedFood 
    ? foods.filter(f => f.stall_id === selectedStall.id && f.id !== selectedFood.id)
    : [];
  const stallReviews = reviews.filter(r => r.stall_id === selectedStall.id);

  const handleQuantityChange = (val: number) => {
    setQuantity(prev => Math.max(1, prev + val));
  };

  const handleAddToCart = () => {
    if (selectedFood) {
      addToCart(selectedFood, quantity);
      router.push('/cart');
    }
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    addReview(selectedStall.id, ratingInput, commentInput);
    setCommentInput('');
    alert('✓ Thank you! Your review has been recorded.');
  };

  const handleComplaintSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaintReason.trim()) return;
    
    const success = await addComplaint(selectedStall.id, complaintReason);
    if (success) {
      setComplaintReason('');
      setComplaintSuccess(true);
      setTimeout(() => {
        setComplaintSuccess(false);
        setShowComplaintModal(false);
      }, 2500);
    }
  };

  const isFavorite = selectedFood ? favoriteFoodIds.includes(selectedFood.id) : false;
  const totalPrice = selectedFood ? (selectedFood.price * quantity).toFixed(2) : '0.00';

  if (!selectedFood) {
    const stallFoods = foods.filter(f => f.stall_id === selectedStall.id);
    return (
      <div className="w-full py-6 px-4 sm:px-6 lg:px-8 text-foreground animate-fade-in relative">
        {/* Back navigation */}
        <button 
          onClick={() => router.push('/menu')}
          className="flex items-center gap-2 text-xs font-black text-brand-gray hover:text-gold transition-colors mb-6 uppercase tracking-wider"
        >
          <ArrowLeft size={14} />
          <span>Back to Stalls</span>
        </button>

        {/* Stall Info Visual */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start bg-white dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-805 rounded-[32px] p-6 md:p-8 shadow-md">
          {/* Left Column: Stall Image & Hours */}
          <div className="md:col-span-5 space-y-6">
            <div className="relative w-full h-[240px] rounded-3xl overflow-hidden bg-neutral-100 dark:bg-neutral-950 border border-neutral-205/30">
              <img 
                src={selectedStall.cover_pic} 
                alt={selectedStall.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4 bg-neutral-950/80 backdrop-blur-md px-2.5 py-0.5 rounded-full flex items-center gap-0.5 text-[9px] font-black text-gold border border-neutral-800/30">
                ★ {selectedStall.avg_rating}
              </div>
            </div>

            {/* Operating Hours */}
            {selectedStall.hours && (
              <div className="bg-neutral-50 dark:bg-neutral-950 border border-neutral-100 dark:border-neutral-800/80 p-5 rounded-3xl space-y-3">
                <h4 className="text-[10px] font-black uppercase text-gold">Stall Schedule Hours</h4>
                <div className="divide-y divide-neutral-100 dark:divide-neutral-900 text-[10px] font-bold text-neutral-450 dark:text-neutral-500">
                  {Object.entries(selectedStall.hours).map(([day, time]: any) => (
                    <div key={day} className="flex justify-between py-1.5 first:pt-0 last:pb-0">
                      <span>{day}</span>
                      <span>{time.closed ? 'CLOSED' : `${time.open} - ${time.close}`}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Stall Details & Menu Grid */}
          <div className="md:col-span-7 space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className={`text-[9px] font-black px-2.5 py-1 rounded-full border ${selectedStall.status === 'approved' ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500 border-emerald-200/30' : 'bg-red-50 dark:bg-red-950/20 text-red-500 border-red-200/30'}`}>
                  {selectedStall.status === 'approved' ? 'ACTIVE & OPEN' : 'CLOSED'}
                </span>
                
                <button 
                  onClick={() => setShowComplaintModal(true)}
                  className="text-[9px] font-black text-brand-gray hover:text-brand-firebrick flex items-center gap-1 uppercase tracking-wider transition-colors"
                >
                  <AlertCircle size={12} />
                  <span>Submit Complaint</span>
                </button>
              </div>

              <h1 className="text-3xl font-black font-outfit text-foreground leading-tight">{selectedStall.name}</h1>
              <p className="text-xs font-black text-gold">{selectedStall.title}</p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 font-semibold leading-relaxed">{selectedStall.description}</p>
              <p className="text-[10px] text-brand-gray font-bold">📍 Location: {selectedStall.area}</p>
            </div>

            {/* Menu Grid */}
            <div className="border-t border-neutral-100 dark:border-neutral-800 pt-5 space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-brand-gray">Stall Gourmet Dishes</h3>
              {stallFoods.length === 0 ? (
                <p className="text-[10px] text-brand-gray">No dishes uploaded by this vendor yet.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {stallFoods.map(food => (
                    <div 
                      key={food.id}
                      onClick={() => {
                        setSelectedFood(food);
                        setQuantity(1);
                      }}
                      className="bg-neutral-50 dark:bg-neutral-950 border border-neutral-200/50 dark:border-neutral-850 rounded-2xl p-3 flex items-center gap-3.5 cursor-pointer hover:border-gold/30 hover:shadow-md transition-all group"
                    >
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-neutral-100 shrink-0">
                        <img src={food.cover_pic} alt={food.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      </div>
                      <div className="overflow-hidden flex-1">
                        <h4 className="text-[11px] font-black truncate text-foreground group-hover:text-gold transition-colors">{food.name}</h4>
                        <div className="flex items-center gap-2 mt-1 text-[9px] font-bold text-brand-gray">
                          <span>${food.price.toFixed(2)}</span>
                          <span>•</span>
                          <span className="flex items-center gap-0.5 text-gold">★ {food.rating}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Reviews section (same structure as product reviews) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mt-10">
          <div className="md:col-span-7 bg-white dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-800 rounded-[28px] p-6 shadow-sm space-y-6">
            <h3 className="text-sm font-bold font-outfit text-foreground flex items-center gap-2">
              <MessageSquare size={16} className="text-gold" />
              <span>Customer Reviews ({stallReviews.length})</span>
            </h3>

            <div className="divide-y divide-neutral-100 dark:divide-neutral-800/60 space-y-4 max-h-[400px] overflow-y-auto pr-1 no-scrollbar">
              {stallReviews.length === 0 ? (
                <div className="text-center py-6 text-brand-gray text-[10px] font-bold">
                  💬 No reviews submitted for this stall yet.
                </div>
              ) : (
                stallReviews.map((rev) => (
                  <div key={rev.id} className="pt-4 first:pt-0 space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-foreground">{rev.user_name || 'Anonymous Foodie'}</span>
                        <span className="text-[9px] text-gold font-black">{'★'.repeat(rev.rating)}</span>
                      </div>
                      <span className="text-brand-gray font-medium">{new Date(rev.created_at).toLocaleDateString()}</span>
                    </div>

                    <p className="text-brand-gray font-semibold leading-relaxed">"{rev.comment}"</p>

                    {rev.vendor_reply && (
                      <div className="bg-neutral-50 dark:bg-neutral-950 p-3 rounded-2xl border border-neutral-100 dark:border-neutral-800/80 pl-4 border-l-gold text-[10px] font-bold text-foreground mt-2">
                        <span className="text-gold text-[8px] uppercase tracking-wider block mb-1">Vendor Reply</span>
                        <p>{rev.vendor_reply}</p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="md:col-span-5 bg-white dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-800 rounded-[28px] p-6 shadow-sm">
            <h3 className="text-sm font-bold font-outfit text-foreground mb-4">Add a Review</h3>
            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="text-[9px] font-bold text-brand-gray uppercase tracking-wider block mb-1">Rating</label>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setRatingInput(num)}
                      className="hover:scale-110 transition-transform"
                    >
                      <Star size={18} className={ratingInput >= num ? 'text-gold fill-current' : 'text-neutral-250 dark:text-neutral-800'} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[9px] font-bold text-brand-gray uppercase tracking-wider block mb-1">Comment</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Share your experience dining at this street food stall..."
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl px-4 py-3 text-xs font-semibold focus:outline-none focus:border-gold transition-colors text-foreground"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gold hover:bg-gold-hover text-brand-black font-extrabold text-xs py-3.5 rounded-xl shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-1.5"
              >
                <Send size={12} />
                <span>Submit Stall Review</span>
              </button>
            </form>
          </div>
        </div>

        {/* Complaint Modal Overlay */}
        <AnimatePresence>
          {showComplaintModal && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            >
              <motion.div 
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-[28px] max-w-sm w-full p-6 shadow-xl relative"
              >
                <h3 className="text-sm font-extrabold font-outfit text-foreground mb-1 uppercase tracking-wide">⚠️ Submit Stall Complaint</h3>
                <p className="text-[10px] text-brand-gray font-semibold mb-4 leading-relaxed">Report issues regarding hygiene, incorrect prices, or safety. Admin will review the complaint.</p>
                
                {complaintSuccess ? (
                  <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-205 text-emerald-600 text-center py-4 rounded-xl text-[10px] font-bold">
                    ✓ Complaint Escalated to Moderation Board.
                  </div>
                ) : (
                  <form onSubmit={handleComplaintSubmit} className="space-y-4">
                    <textarea 
                      rows={3}
                      required
                      placeholder="Type details of your complaint here..."
                      value={complaintReason}
                      onChange={(e) => setComplaintReason(e.target.value)}
                      className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-850 rounded-xl p-3 text-xs font-semibold focus:outline-none"
                    />
                    <div className="flex gap-2.5">
                      <button 
                        type="button"
                        onClick={() => setShowComplaintModal(false)}
                        className="flex-1 border border-neutral-200 dark:border-neutral-800 text-[10px] font-extrabold text-brand-gray py-2.5 rounded-xl uppercase"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit"
                        className="flex-1 bg-red-500 hover:bg-red-600 text-white text-[10px] font-extrabold py-2.5 rounded-xl uppercase"
                      >
                        Submit Case
                      </button>
                    </div>
                  </form>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="w-full py-6 px-4 sm:px-6 lg:px-8 text-foreground animate-fade-in relative">
      
      {/* Back navigation */}
      <button 
        onClick={() => {
          setSelectedFood(null);
        }}
        className="flex items-center gap-2 text-xs font-black text-brand-gray hover:text-gold transition-colors mb-6 uppercase tracking-wider"
      >
        <ArrowLeft size={14} />
        <span>Back to Stall</span>
      </button>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start bg-white dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-805 rounded-[32px] p-6 md:p-8 shadow-md">
        
        {/* Left Column: Image and Video (5 cols) */}
        <div className="md:col-span-5 space-y-6">
          <div className="relative w-full h-[320px] md:h-[360px] rounded-3xl overflow-hidden bg-neutral-100 dark:bg-neutral-950 border border-neutral-205/30">
            <img 
              src={selectedFood.cover_pic} 
              alt={selectedFood.name}
              className="w-full h-full object-cover"
            />
            
            <button 
              onClick={() => toggleFavoriteFood(selectedFood.id)}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/95 dark:bg-neutral-900/95 backdrop-blur shadow border border-neutral-250/20 flex items-center justify-center hover:scale-105 active:scale-95 transition-all text-foreground z-10"
            >
              <Heart size={16} className={isFavorite ? "text-brand-firebrick fill-current" : "text-foreground"} />
            </button>
          </div>

          {/* Video Player Box */}
          {selectedFood.video_url ? (
            <div className="bg-neutral-50 dark:bg-neutral-950 border border-neutral-100 dark:border-neutral-800/80 p-4 rounded-3xl space-y-3">
              <h4 className="text-[10px] font-black uppercase text-gold flex items-center gap-1.5">
                <Video size={14} />
                <span>Video preparation log</span>
              </h4>

              <div className="rounded-2xl overflow-hidden aspect-video bg-black border border-neutral-800">
                <video 
                  src={selectedFood.video_url} 
                  controls 
                  preload="metadata"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          ) : (
            <div className="bg-neutral-50 dark:bg-neutral-950 border border-neutral-105 dark:border-neutral-850 p-5 rounded-3xl text-center text-brand-gray text-[10px] font-bold">
              🎥 Video preparation logs not uploaded yet.
            </div>
          )}
        </div>

        {/* Right Column: Title, Metrics, Add to Cart (7 cols) */}
        <div className="md:col-span-7 flex flex-col justify-between h-full space-y-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <button 
                onClick={() => setSelectedFood(null)}
                className="inline-flex items-center gap-1 bg-gold/10 hover:bg-gold/25 border border-gold/15 px-3.5 py-1.5 rounded-xl transition-all text-left group"
              >
                <span className="text-[10px] font-black uppercase text-gold tracking-wide">
                  🏪 View Stall: {selectedStall.name}
                </span>
              </button>

              <button 
                onClick={() => setShowComplaintModal(true)}
                className="text-[9px] font-black text-brand-gray hover:text-brand-firebrick flex items-center gap-1 uppercase tracking-wider transition-colors"
              >
                <AlertCircle size={12} />
                <span>Submit Complaint</span>
              </button>
            </div>

            <h1 className="text-2xl md:text-3xl font-black font-outfit text-foreground leading-tight">
              {selectedFood.name}
            </h1>

            {/* Metrics Row */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-neutral-50 dark:bg-neutral-950 border border-neutral-100 dark:border-neutral-800 px-4 py-3 rounded-2xl text-center">
                <span className="text-[10px] text-brand-gray font-bold uppercase tracking-wider block mb-1">Ratings</span>
                <div className="flex items-center justify-center gap-1 text-xs font-black text-foreground">
                  <Star size={12} className="text-gold fill-current" />
                  <span>{selectedFood.rating}</span>
                </div>
              </div>
              
              <div className="bg-neutral-50 dark:bg-neutral-950 border border-neutral-100 dark:border-neutral-800 px-4 py-3 rounded-2xl text-center">
                <span className="text-[10px] text-brand-gray font-bold uppercase tracking-wider block mb-1">Calories</span>
                <div className="flex items-center justify-center gap-1 text-xs font-black text-brand-firebrick">
                  <Flame size={12} className="fill-current" />
                  <span>{selectedFood.calories} kcal</span>
                </div>
              </div>

              <div className="bg-neutral-50 dark:bg-neutral-950 border border-neutral-100 dark:border-neutral-800 px-4 py-3 rounded-2xl text-center">
                <span className="text-[10px] text-brand-gray font-bold uppercase tracking-wider block mb-1">Prep Time</span>
                <div className="flex items-center justify-center gap-1 text-xs font-black text-foreground">
                  <Clock size={12} className="text-emerald-500" />
                  <span>{selectedFood.prep_time_mins} min</span>
                </div>
              </div>
            </div>

            {/* Ingredients */}
            <div className="text-xs text-neutral-500 dark:text-neutral-400 font-medium leading-relaxed">
              <h3 className="font-extrabold text-foreground mb-1 text-[11px] uppercase tracking-wider">Ingredients</h3>
              <p>
                {readMore ? selectedFood.ingredients : `${selectedFood.ingredients.slice(0, 140)}...`}
                {selectedFood.ingredients.length > 140 && (
                  <button 
                    onClick={() => setReadMore(!readMore)}
                    className="text-gold font-extrabold ml-1.5 hover:underline focus:outline-none"
                  >
                    {readMore ? 'Read Less' : 'Read More'}
                  </button>
                )}
              </p>
            </div>
          </div>

          {/* Pricing, Quantity adjusters, and Checkout Actions */}
          <div className="border-t border-neutral-100 dark:border-neutral-800 pt-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-[10px] text-brand-gray font-bold uppercase tracking-wider">Total Price</p>
                <p className="text-2xl font-black text-foreground">${totalPrice}</p>
              </div>

              <div className="flex items-center gap-4 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 px-4 py-2.5 rounded-2xl shadow-sm">
                <button 
                  onClick={() => handleQuantityChange(-1)}
                  className="w-8 h-8 rounded-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-foreground flex items-center justify-center hover:bg-neutral-100 transition-colors active:scale-90"
                >
                  <Minus size={14} />
                </button>
                <span className="text-sm font-black w-6 text-center">{quantity}</span>
                <button 
                  onClick={() => handleQuantityChange(1)}
                  className="w-8 h-8 rounded-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-805 text-foreground flex items-center justify-center hover:bg-neutral-100 transition-colors active:scale-90"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            {selectedStall.status === 'closed' ? (
              <div className="w-full bg-red-500/10 border border-red-500/20 text-red-500 text-center py-4 rounded-2xl text-xs font-black uppercase tracking-wider">
                ⚠️ Stall is Temporarily Closed. You cannot place orders.
              </div>
            ) : (
              <button 
                onClick={handleAddToCart}
                className="w-full bg-gold hover:bg-gold-hover text-brand-black font-extrabold text-xs py-4 rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
              >
                <ShoppingBag size={16} />
                <span>Add to Cart</span>
              </button>
            )}
          </div>
        </div>

      </div>

      {/* Reviews, Ratings, Responses & Submissions Panel */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mt-10">
        
        {/* Left: reviews list (7 cols) */}
        <div className="md:col-span-7 bg-white dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-800 rounded-[28px] p-6 shadow-sm space-y-6">
          <h3 className="text-sm font-bold font-outfit text-foreground flex items-center gap-2">
            <MessageSquare size={16} className="text-gold" />
            <span>Customer Reviews ({stallReviews.length})</span>
          </h3>

          <div className="divide-y divide-neutral-100 dark:divide-neutral-800/60 space-y-4 max-h-[400px] overflow-y-auto pr-1 no-scrollbar">
            {stallReviews.length === 0 ? (
              <p className="text-xs text-brand-gray font-bold text-center py-8">No reviews written for this vendor yet. Be the first!</p>
            ) : (
              stallReviews.map(r => (
                <div key={r.id} className="py-4 space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-foreground">{r.user_name || 'Anonymous Customer'}</span>
                      <span className="text-[9px] text-gold font-black">{'★'.repeat(r.rating)}</span>
                    </div>
                    <span className="text-[8px] text-brand-gray">{new Date(r.created_at).toLocaleDateString()}</span>
                  </div>

                  <p className="text-brand-gray font-semibold leading-relaxed">"{r.comment}"</p>

                  {/* Vendor Reply */}
                  {r.vendor_reply && (
                    <div className="bg-neutral-50 dark:bg-neutral-950 p-3 rounded-2xl border border-neutral-100 dark:border-neutral-800/80 pl-4 border-l-gold text-[10px] font-bold text-foreground mt-2">
                      <span className="text-gold text-[8px] uppercase tracking-wider block mb-1">Stall Response</span>
                      <p>{r.vendor_reply}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Write Review Form (5 cols) */}
        <div className="md:col-span-5 bg-white dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-800 rounded-[28px] p-6 shadow-sm">
          <h3 className="text-xs font-black uppercase tracking-wider text-neutral-450 dark:text-neutral-500 mb-4 block">Write a Review</h3>
          
          <form onSubmit={handleReviewSubmit} className="space-y-4">
            <div>
              <label className="text-[9px] font-black uppercase text-brand-gray block mb-1.5">Rating stars</label>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map((stars) => (
                  <button
                    key={stars}
                    type="button"
                    onClick={() => setRatingInput(stars)}
                    className="hover:scale-110 transition-transform"
                  >
                    <Star 
                      size={20} 
                      className={ratingInput >= stars ? 'text-gold fill-current' : 'text-neutral-200 dark:text-neutral-800'} 
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[9px] font-black uppercase text-brand-gray block mb-1">Your Review Comment</label>
              <textarea 
                rows={4} 
                required 
                placeholder="Share your dining experience..." 
                value={commentInput}
                onChange={e => setCommentInput(e.target.value)}
                className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl px-3.5 py-3 text-xs text-foreground focus:outline-none focus:border-gold resize-none"
              />
            </div>

            <button 
              type="submit"
              className="w-full bg-gold hover:bg-gold-hover text-brand-black font-extrabold text-xs py-3 rounded-2xl shadow-sm transition-transform active:scale-98 flex items-center justify-center gap-1.5"
            >
              <Send size={12} />
              <span>Submit Review</span>
            </button>
          </form>
        </div>

      </div>

      {/* Complaint Modal Overlay */}
      <AnimatePresence>
        {showComplaintModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-[32px] p-6 max-w-md w-full shadow-2xl space-y-4"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-bold font-outfit text-foreground">File a Complaint</h3>
                  <p className="text-[9px] text-brand-gray font-bold uppercase mt-0.5">Admin Monitoring & Escalation</p>
                </div>
                <button 
                  onClick={() => setShowComplaintModal(false)}
                  className="text-xs text-brand-gray hover:text-foreground font-black px-2 py-1 rounded"
                >
                  ✕
                </button>
              </div>

              {complaintSuccess ? (
                <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-250 text-emerald-600 p-4 rounded-2xl text-xs font-black text-center">
                  ✓ Complaint submitted! Admin will investigate this stall.
                </div>
              ) : (
                <form onSubmit={handleComplaintSubmit} className="space-y-4">
                  <p className="text-[10px] text-brand-gray font-medium leading-relaxed">
                    If you experienced issues with food quality, sanitization, price discrepancy, or incorrect listings, please describe it below.
                  </p>
                  
                  <div>
                    <label className="text-[9px] font-black uppercase text-brand-gray block mb-1">Reason / Details</label>
                    <textarea 
                      rows={4} 
                      required
                      placeholder="Write complaint details..."
                      value={complaintReason}
                      onChange={e => setComplaintReason(e.target.value)}
                      className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-205 dark:border-neutral-800 rounded-2xl px-3.5 py-3 text-xs text-foreground focus:outline-none focus:border-gold resize-none"
                    />
                  </div>

                  <button 
                    type="submit"
                    className="w-full bg-brand-firebrick text-white hover:bg-red-600 py-3 rounded-2xl text-xs font-black uppercase shadow-md transition-transform active:scale-98"
                  >
                    Escalate to Admin
                  </button>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Suggestions Tray */}
      {suggestions.length > 0 && (
        <div className="mt-12">
          <h3 className="text-md font-bold font-outfit mb-4">
            Other Dishes from this Stall
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {suggestions.map((item) => (
              <div 
                key={item.id}
                onClick={() => {
                  setSelectedFood(item);
                  setQuantity(1);
                }}
                className="bg-white dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-800/80 rounded-2xl p-3 flex items-center gap-3 cursor-pointer hover:border-gold/30 hover:shadow-md transition-all group"
              >
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-neutral-100 shrink-0">
                  <img 
                    src={item.cover_pic} 
                    alt={item.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="overflow-hidden">
                  <h4 className="text-xs font-bold truncate leading-tight group-hover:text-gold transition-colors text-foreground">
                    {item.name}
                  </h4>
                  <p className="text-[10px] text-brand-gray mt-1 font-semibold">
                    ${item.price.toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
