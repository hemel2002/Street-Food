'use client';

import React, { useState } from 'react';
import { ArrowLeft, Trash2, Plus, Minus, Ticket, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';

export default function CartView() {
  const { 
    cart, 
    updateCartQuantity, 
    removeFromCart, 
    discountAmount, 
    applyPromoCode, 
    currentLocation, 
    checkout 
  } = useApp();

  const router = useRouter();
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState(false);
  const [couponSuccess, setCouponSuccess] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const subtotal = cart.reduce((acc, item) => acc + (item.food.price * item.quantity), 0);
  const deliverySubtotal = 0; 
  const finalDiscount = Math.min(subtotal, discountAmount); 
  const total = Math.max(0, subtotal + deliverySubtotal - finalDiscount);

  const handleApplyPromo = () => {
    setCouponError(false);
    setCouponSuccess(false);
    if (!couponCode.trim()) return;

    const valid = applyPromoCode(couponCode);
    if (valid) {
      setCouponSuccess(true);
    } else {
      setCouponError(true);
    }
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setIsCheckingOut(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: cart,
          successUrl: '/order-tracking?payment=success',
          cancelUrl: '/cart',
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to initialize checkout session');
      }

      const { url } = await res.json();
      if (url) {
        if (url.startsWith('/')) {
          router.push(url);
        } else {
          window.location.href = url;
        }
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (err: any) {
      console.error('Checkout redirect failed:', err);
      // Fallback to local simulated payment if something goes wrong or offline
      router.push('/simulated-payment');
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <div className="w-full py-6 text-foreground">
      {/* Header back navigation */}
      <button 
        onClick={() => router.push('/menu')}
        className="flex items-center gap-2 text-xs font-black text-brand-gray hover:text-gold transition-colors mb-6 uppercase tracking-wider"
      >
        <ArrowLeft size={14} />
        <span>Back to Stalls</span>
      </button>

      <h1 className="text-2xl font-black font-outfit text-foreground mb-8">
        Your Cart (Chart)
      </h1>

      {/* 2 Column desktop layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Items list & Promo code (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-800 rounded-[28px] p-5 md:p-6 shadow-sm space-y-5">
            <h3 className="text-sm font-black uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-2">
              Cart Items
            </h3>

            <div className="divide-y divide-neutral-100 dark:divide-neutral-800/60 space-y-4">
              <AnimatePresence mode="popLayout">
                {cart.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-16 text-xs font-semibold text-brand-gray"
                  >
                    Your cart is currently empty.
                  </motion.div>
                ) : (
                  cart.map((item, idx) => (
                    <motion.div
                      key={item.food.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className={`flex gap-4 items-center justify-between py-4 ${idx === 0 ? 'pt-0' : ''}`}
                    >
                      <div className="flex gap-4 items-center">
                        <div className="w-16 h-16 rounded-2xl overflow-hidden bg-neutral-150 shrink-0">
                          <img 
                            src={item.food.cover_pic} 
                            alt={item.food.name} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <h4 className="font-extrabold text-sm text-foreground leading-snug">
                            {item.food.name}
                          </h4>
                          <p className="text-[10px] text-brand-gray font-semibold mt-1">
                            Price Per 1: ${item.food.price.toFixed(2)}
                          </p>
                        </div>
                      </div>

                      {/* Right actions */}
                      <div className="flex items-center gap-6">
                        {/* Quantity Counter */}
                        <div className="flex items-center gap-3 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 px-3 py-1.5 rounded-xl">
                          <button 
                            onClick={() => updateCartQuantity(item.food.id, item.quantity - 1)}
                            className="w-6 h-6 rounded-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-850 flex items-center justify-center text-foreground hover:bg-neutral-100 transition-colors"
                          >
                            <Minus size={10} />
                          </button>
                          <span className="text-xs font-extrabold w-4 text-center">{item.quantity}</span>
                          <button 
                            onClick={() => updateCartQuantity(item.food.id, item.quantity + 1)}
                            className="w-6 h-6 rounded-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-850 flex items-center justify-center text-foreground hover:bg-neutral-100 transition-colors"
                          >
                            <Plus size={10} />
                          </button>
                        </div>

                        {/* Total item price */}
                        <div className="text-right w-16">
                          <p className="text-sm font-black text-foreground">
                            ${(item.food.price * item.quantity).toFixed(2)}
                          </p>
                        </div>

                        {/* Delete button */}
                        <button 
                          onClick={() => removeFromCart(item.food.id)}
                          className="text-neutral-400 hover:text-brand-firebrick transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Promo code entry */}
          {cart.length > 0 && (
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-800 rounded-[28px] p-5 md:p-6 shadow-sm">
              <h3 className="text-xs font-black uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-3 block">
                Apply Promo Code
              </h3>
              <div className="flex gap-3">
                <div className="flex-1 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl flex items-center px-4 py-3 gap-2.5 hover:border-neutral-350 dark:hover:border-neutral-705 transition-colors">
                  <Ticket size={16} className="text-brand-gray" />
                  <input 
                    type="text" 
                    placeholder="Enter Coupon Code (e.g. WELCOME20)" 
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="bg-transparent text-xs w-full focus:outline-none placeholder-brand-gray text-foreground font-semibold"
                  />
                </div>
                <button 
                  onClick={handleApplyPromo}
                  className="px-6 bg-brand-black dark:bg-white text-white dark:text-brand-black hover:bg-neutral-800 dark:hover:bg-neutral-100 font-extrabold text-xs rounded-2xl transition-all shadow"
                >
                  Apply Code
                </button>
              </div>

              {couponSuccess && (
                <p className="text-[10px] text-emerald-500 font-bold mt-2.5 px-1">
                  ✓ Voucher successfully applied to checkout!
                </p>
              )}
              {couponError && (
                <p className="text-[10px] text-brand-firebrick font-bold mt-2.5 px-1">
                  ✗ Coupon code is invalid. Try &quot;WELCOME20&quot; or &quot;STREET30&quot;.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Address and checkout calculations (5 cols) */}
        {cart.length > 0 && (
          <div className="lg:col-span-5 space-y-6">
            {/* Delivery address */}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-800 rounded-[28px] p-5 shadow-sm">
              <p className="text-[10px] text-brand-gray font-bold uppercase tracking-wider mb-2.5">
                Delivery Location
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-foreground font-bold text-xs">
                  <MapPin size={15} className="text-gold" />
                  <span>{currentLocation}</span>
                </div>
                <button 
                  onClick={() => router.push('/menu')}
                  className="text-[10px] font-black text-gold hover:underline"
                >
                  Edit
                </button>
              </div>
            </div>

            {/* Calculations breakdown */}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-800 rounded-[28px] p-6 shadow-sm space-y-4 text-xs font-semibold">
              <h3 className="text-xs font-black uppercase tracking-wider text-neutral-400 dark:text-neutral-500 pb-1">
                Order Summary
              </h3>

              <div className="flex justify-between">
                <span className="text-brand-gray font-medium">Subtotals for products</span>
                <span className="text-foreground font-bold">${subtotal.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-brand-gray font-medium">Delivery subtotal</span>
                <span className="text-emerald-500 font-bold">Free</span>
              </div>

              {finalDiscount > 0 && (
                <div className="flex justify-between text-brand-firebrick">
                  <span className="font-medium">Discount Vouchers</span>
                  <span className="font-bold">-${finalDiscount.toFixed(2)}</span>
                </div>
              )}

              <div className="border-t border-dashed border-neutral-205 dark:border-neutral-800 pt-4 flex justify-between text-sm font-black">
                <span className="text-foreground">Total</span>
                <span className="text-foreground">${total.toFixed(2)}</span>
              </div>

              <button 
                onClick={handleCheckout}
                disabled={isCheckingOut}
                className="w-full bg-gold hover:bg-gold-hover text-brand-black disabled:opacity-75 font-extrabold text-xs py-4 rounded-2xl shadow-lg transition-transform duration-200 active:scale-[0.98] mt-3 flex items-center justify-center gap-2"
              >
                {isCheckingOut ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-brand-black" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Redirecting to payment...</span>
                  </>
                ) : (
                  'Proceed to Checkout'
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
