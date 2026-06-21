'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CreditCard, ShieldCheck, ShoppingBag, ArrowLeft, Loader2, Landmark } from 'lucide-react';
import { motion } from 'framer-motion';
import { useApp } from '@/context/AppContext';

export default function SimulatedPaymentPage() {
  const { cart, discountAmount, checkout, clearCart, currentLocation } = useApp();
  const router = useRouter();
  
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [expiry, setExpiry] = useState('12/28');
  const [cvc, setCvc] = useState('***');
  const [name, setName] = useState('Hemal');
  const [isPaying, setIsPaying] = useState(false);

  const subtotal = cart.reduce((acc, item) => acc + (item.food.price * item.quantity), 0);
  const deliverySubtotal = 0;
  const finalDiscount = Math.min(subtotal, discountAmount);
  const total = Math.max(0, subtotal + deliverySubtotal - finalDiscount);

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPaying(true);
    
    // Simulate transaction delay
    setTimeout(async () => {
      await checkout(currentLocation);
      clearCart();
      setIsPaying(false);
      router.push('/order-tracking?payment=success');
    }, 2000);
  };

  return (
    <div className="w-full py-8 px-4 text-foreground">
      {/* Back button */}
      <button 
        onClick={() => router.push('/cart')}
        className="flex items-center gap-2 text-xs font-black text-brand-gray hover:text-gold transition-colors mb-8 uppercase tracking-wider"
      >
        <ArrowLeft size={14} />
        <span>Back to Cart</span>
      </button>

      {/* Main Stripe-like container */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch bg-white dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-805 rounded-[32px] overflow-hidden shadow-xl min-h-[480px]">
        
        {/* Left Side: Order summary (Stripe Checkout style) */}
        <div className="md:col-span-5 bg-neutral-50 dark:bg-neutral-950 p-6 md:p-8 flex flex-col justify-between border-r border-neutral-100 dark:border-neutral-800">
          <div className="space-y-6">
            <div>
              <span className="text-[9px] font-black uppercase text-gold tracking-wide bg-gold/10 px-2.5 py-0.5 rounded-full">
                Stripe Demo Session
              </span>
              <h2 className="text-xl font-extrabold font-outfit mt-2 text-foreground">Vrooklyn Street Food</h2>
              <p className="text-2xl font-black text-foreground mt-2">${total.toFixed(2)}</p>
            </div>

            {/* List of items */}
            <div className="space-y-3 max-h-[220px] overflow-y-auto no-scrollbar">
              {cart.map((item) => (
                <div key={item.food.id} className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg overflow-hidden bg-neutral-200 shrink-0">
                      <img src={item.food.cover_pic} alt={item.food.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h4 className="font-extrabold truncate w-24 sm:w-32 leading-snug">{item.food.name}</h4>
                      <p className="text-[10px] text-brand-gray font-semibold">Qty {item.quantity}</p>
                    </div>
                  </div>
                  <span className="font-black text-foreground">${(item.food.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-neutral-200/60 dark:border-neutral-800/80 pt-4 mt-6 space-y-2.5 text-xs font-semibold">
            <div className="flex justify-between text-brand-gray">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            {finalDiscount > 0 && (
              <div className="flex justify-between text-brand-firebrick">
                <span>Discount applied</span>
                <span>-${finalDiscount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-foreground font-black border-t border-dashed border-neutral-200/40 dark:border-neutral-800/40 pt-2 text-sm">
              <span>Amount Due</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Right Side: Payment Form */}
        <div className="md:col-span-7 p-6 md:p-8 flex flex-col justify-between">
          <form onSubmit={handlePay} className="space-y-5">
            <h3 className="text-sm font-black uppercase text-foreground flex items-center gap-2">
              <CreditCard size={16} className="text-gold" />
              <span>Card Information</span>
            </h3>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-brand-gray uppercase tracking-wider pl-1 mb-1 block">
                  Name on Card
                </label>
                <input 
                  type="text" 
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl px-4 py-3 text-xs font-semibold focus:outline-none focus:border-gold transition-colors text-foreground"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-brand-gray uppercase tracking-wider pl-1 mb-1 block">
                  Card Number
                </label>
                <input 
                  type="text" 
                  required
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl px-4 py-3 text-xs font-semibold focus:outline-none focus:border-gold transition-colors text-foreground"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-brand-gray uppercase tracking-wider pl-1 mb-1 block">
                    Expiration Date
                  </label>
                  <input 
                    type="text" 
                    placeholder="MM/YY"
                    required
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl px-4 py-3 text-xs font-semibold focus:outline-none focus:border-gold transition-colors text-foreground text-center"
                  />
                </div>
                
                <div>
                  <label className="text-[10px] font-bold text-brand-gray uppercase tracking-wider pl-1 mb-1 block">
                    CVC
                  </label>
                  <input 
                    type="password" 
                    placeholder="***"
                    maxLength={3}
                    required
                    value={cvc}
                    onChange={(e) => setCvc(e.target.value)}
                    className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl px-4 py-3 text-xs font-semibold focus:outline-none focus:border-gold transition-colors text-foreground text-center"
                  />
                </div>
              </div>
            </div>

            <button 
              type="submit"
              disabled={isPaying || total === 0}
              className="w-full bg-gold hover:bg-gold-hover text-brand-black disabled:opacity-50 font-black text-xs py-4 rounded-2xl shadow-lg transition-transform duration-200 active:scale-[0.98] flex items-center justify-center gap-2 mt-4"
            >
              {isPaying ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Processing payment...</span>
                </>
              ) : (
                <>
                  <span>Pay ${total.toFixed(2)}</span>
                </>
              )}
            </button>
          </form>

          {/* Secure indicator */}
          <div className="flex items-center justify-center gap-1.5 text-[10px] font-bold text-neutral-400 dark:text-neutral-500 pt-6 mt-4 border-t border-neutral-100 dark:border-neutral-800/80">
            <ShieldCheck size={14} className="text-emerald-500" />
            <span>Guaranteed secure payment powered by Stripe Mock Engine</span>
          </div>
        </div>

      </div>
    </div>
  );
}
