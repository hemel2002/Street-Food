'use client';

import React from 'react';
import { Wifi, Battery, Signal, ArrowLeft, Heart, ShoppingCart } from 'lucide-react';
import { useApp } from '@/context/AppContext';

interface MobileFrameProps {
  children: React.ReactNode;
}

export default function MobileFrame({ children }: MobileFrameProps) {
  const { isDarkMode, cart } = useApp();
  
  const totalCartItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="relative mx-auto my-4 md:my-8 transition-transform duration-500 hover:scale-[1.01]">
      {/* 3D shadow effects and high-end outer device frame */}
      <div className="relative mx-auto w-full max-w-[400px] h-[820px] rounded-[55px] p-[10px] bg-brand-black shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)] border-[4px] border-neutral-800 flex flex-col overflow-hidden">
        
        {/* Screen Bezel Notch / Dynamic Island */}
        <div className="absolute top-[18px] left-1/2 transform -translate-x-1/2 w-[110px] h-[28px] bg-black rounded-3xl z-50 flex items-center justify-center">
          <div className="w-[10px] h-[10px] bg-[#1a1a1a] rounded-full absolute left-4"></div>
          <div className="w-[45px] h-[4px] bg-[#101010] rounded-full absolute right-6"></div>
        </div>

        {/* Status Bar */}
        <div className="h-[44px] px-8 pt-3 flex justify-between items-center bg-transparent z-40 text-xs font-semibold select-none text-foreground">
          <span>9:41</span>
          <div className="flex items-center gap-1.5">
            <Signal size={12} className="text-current" />
            <Wifi size={12} className="text-current" />
            <Battery size={16} className="text-current" />
          </div>
        </div>

        {/* Internal Screen Content Area */}
        <div className="flex-1 w-full rounded-[45px] overflow-hidden flex flex-col bg-brand-light dark:bg-brand-dark transition-colors duration-300 relative">
          <div className="flex-1 overflow-y-auto no-scrollbar pb-24">
            {children}
          </div>
        </div>

        {/* Home Indicator Bar */}
        <div className="absolute bottom-[14px] left-1/2 transform -translate-x-1/2 w-[130px] h-[4.5px] bg-neutral-600 dark:bg-neutral-400 rounded-full z-50"></div>
      </div>
    </div>
  );
}
