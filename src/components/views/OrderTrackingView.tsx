'use client';

import React from 'react';
import { ArrowLeft, Clock, ChefHat, Bike, PackageCheck, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';

export default function OrderTrackingView() {
  const { orderStatus, clearCart, cart, checkout, currentLocation } = useApp();
  const router = useRouter();

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const payment = searchParams.get('payment');
      if (payment === 'success' && cart.length > 0) {
        checkout(currentLocation);
        clearCart();
      }
    }
  }, [cart, currentLocation, checkout, clearCart]);

  const statuses = [
    {
      id: 'pending',
      title: 'Order Received',
      desc: 'We have received your food order and sent it to the kitchen.',
      icon: CheckCircle2,
      color: 'text-emerald-500'
    },
    {
      id: 'preparing',
      title: 'Preparing Food',
      desc: 'The chef is cooking your delicious street food dishes.',
      icon: ChefHat,
      color: 'text-amber-500'
    },
    {
      id: 'shipping',
      title: 'Out for Delivery',
      desc: 'Our delivery partner is speeding towards your location.',
      icon: Bike,
      color: 'text-sky-500'
    },
    {
      id: 'delivered',
      title: 'Delivered',
      desc: 'Your street food has arrived! Enjoy your fresh meal.',
      icon: PackageCheck,
      color: 'text-gold'
    }
  ];

  const getStatusIndex = (status: string) => {
    return statuses.findIndex(s => s.id === status);
  };

  const currentIndex = getStatusIndex(orderStatus);

  const handleReturnHome = () => {
    clearCart();
    router.push('/menu');
  };

  return (
    <div className="w-full py-6 text-foreground">
      {/* Header back navigation */}
      <button 
        onClick={handleReturnHome}
        className="flex items-center gap-2 text-xs font-black text-brand-gray hover:text-gold transition-colors mb-6 uppercase tracking-wider"
      >
        <ArrowLeft size={14} />
        <span>Return to Stalls</span>
      </button>

      {/* Main Container */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-805 rounded-[32px] p-6 md:p-8 shadow-md space-y-8">
        
        {/* Status card */}
        <div className="bg-neutral-50 dark:bg-neutral-950 border border-neutral-100 dark:border-neutral-850 p-6 rounded-2xl text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-gold/10 text-gold flex items-center justify-center mx-auto animate-float">
            {React.createElement(statuses[currentIndex]?.icon || Clock, { size: 32 })}
          </div>
          <div>
            <h2 className="text-xl font-black font-outfit text-foreground leading-tight">
              {statuses[currentIndex]?.title}
            </h2>
            <p className="text-xs text-brand-gray mt-1 max-w-md mx-auto leading-relaxed font-semibold">
              {statuses[currentIndex]?.desc}
            </p>
          </div>

          {orderStatus !== 'delivered' && (
            <div className="flex items-center justify-center gap-2 text-xs font-bold text-neutral-400 dark:text-neutral-500">
              <Clock size={14} className="animate-spin-slow" />
              <span>Estimated delivery: 15-20 mins</span>
            </div>
          )}
        </div>

        {/* Timeline List */}
        <div className="space-y-8 relative pl-6 max-w-md mx-auto">
          {/* Timeline Connector Line */}
          <div className="absolute left-[37px] top-4 bottom-4 w-[2.5px] bg-neutral-105 dark:bg-neutral-800 rounded-full z-0">
            <div 
              className="w-full bg-gold rounded-full transition-all duration-1000"
              style={{ height: `${(currentIndex / (statuses.length - 1)) * 100}%` }}
            ></div>
          </div>

          {statuses.map((step, idx) => {
            const isCompleted = idx < currentIndex;
            const isActive = idx === currentIndex;
            const StepIcon = step.icon;

            return (
              <div key={step.id} className="flex gap-6 items-start relative z-10">
                {/* Step indicator circle */}
                <div 
                  className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 border-[3px] transition-all duration-300 ${
                    isCompleted 
                      ? 'bg-gold border-gold text-brand-black shadow-sm' 
                      : isActive 
                      ? 'bg-brand-light dark:bg-neutral-900 border-gold text-gold shadow-md scale-105' 
                      : 'bg-white dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800 text-neutral-300 dark:text-neutral-700'
                  }`}
                >
                  <StepIcon size={14} fill={isCompleted ? "currentColor" : "none"} />
                </div>

                {/* Step text */}
                <div className="pt-0.5">
                  <h4 className={`text-xs font-black transition-colors duration-300 ${
                    isActive ? 'text-gold' : isCompleted ? 'text-foreground' : 'text-neutral-400 dark:text-neutral-600'
                  }`}>
                    {step.title}
                  </h4>
                  <p className={`text-[10px] leading-relaxed mt-1 font-semibold transition-colors duration-300 ${
                    isActive ? 'text-neutral-500 dark:text-neutral-400' : isCompleted ? 'text-neutral-400 dark:text-neutral-500' : 'text-neutral-300 dark:text-neutral-700'
                  }`}>
                    {step.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Back Button */}
        <button 
          onClick={handleReturnHome}
          className="w-full bg-brand-black text-white dark:bg-white dark:text-brand-black hover:bg-neutral-800 dark:hover:bg-neutral-100 font-extrabold text-xs py-4 rounded-2xl shadow-md transition-all active:scale-[0.99] mt-4"
        >
          Return to Stalls Home
        </button>
      </div>
    </div>
  );
}
