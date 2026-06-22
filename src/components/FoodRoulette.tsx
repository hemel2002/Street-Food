'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ShoppingBag, X, RefreshCw } from 'lucide-react';
import { useApp, Food } from '@/context/AppContext';

interface FoodRouletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FoodRoulette({ isOpen, onClose }: FoodRouletteProps) {
  const { foods, addToCart } = useApp();
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedResult, setSelectedResult] = useState<Food | null>(null);
  const [animationIndex, setAnimationIndex] = useState(0);

  const handleSpin = () => {
    if (foods.length === 0 || isSpinning) return;
    
    setIsSpinning(true);
    setSelectedResult(null);
    
    let counter = 0;
    const totalTicks = 20; // Number of cycles
    const intervalTime = 100; // Duration between cycles (ms)

    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * foods.length);
      setAnimationIndex(randomIndex);
      counter++;

      if (counter >= totalTicks) {
        clearInterval(interval);
        // Select final random item
        const finalSelection = foods[Math.floor(Math.random() * foods.length)];
        setSelectedResult(finalSelection);
        setIsSpinning(false);
      }
    }, intervalTime);
  };

  const handleAddToCart = () => {
    if (selectedResult) {
      addToCart(selectedResult, 1);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-md bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-[32px] p-6 shadow-2xl relative overflow-hidden"
      >
        {/* Background flares */}
        <div className="absolute top-[-50px] right-[-50px] w-40 h-40 bg-gold/10 rounded-full blur-2xl"></div>

        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-foreground flex items-center justify-center transition-all"
        >
          <X size={14} />
        </button>

        {/* Header */}
        <div className="text-center mb-6 space-y-1">
          <div className="inline-flex items-center gap-1 text-gold font-bold text-xs uppercase tracking-wider bg-gold/10 px-3 py-1 rounded-full">
            <Sparkles size={12} className="animate-spin-slow" />
            <span>Undecided?</span>
          </div>
          <h2 className="text-lg font-black font-outfit text-foreground">
            Street Food Roulette
          </h2>
          <p className="text-[10px] text-brand-gray font-semibold">
            Let the wheel choose your next delicious meal!
          </p>
        </div>

        {/* The Roulette Screen */}
        <div 
          style={{ perspective: 600 }}
          className="bg-neutral-50 dark:bg-neutral-950 border border-neutral-150 dark:border-neutral-800/80 rounded-2xl p-6 flex flex-col items-center justify-center min-h-[240px] relative"
        >
          {isSpinning ? (
            /* Spinning state - 3D coin spin animation */
            <div className="space-y-4 text-center">
              <motion.div 
                animate={{ rotateY: [0, 360], rotateZ: [0, 5, -5, 0] }}
                transition={{ repeat: Infinity, duration: 1.0, ease: "linear" }}
                className="w-24 h-24 rounded-full overflow-hidden border-4 border-gold mx-auto shadow-2xl relative"
                style={{ transformStyle: 'preserve-3d' }}
              >
                <img 
                  src={foods[animationIndex]?.cover_pic} 
                  alt="Spinning..." 
                  className="w-full h-full object-cover blur-[0.5px]"
                />
              </motion.div>
              <h3 className="text-xs font-black text-gold uppercase tracking-wider animate-pulse">
                Selecting Dish...
              </h3>
            </div>
          ) : selectedResult ? (
            /* Result Selected State - 3D spring pop-in */
            <motion.div 
              initial={{ scale: 0.3, rotateY: 90, opacity: 0 }}
              animate={{ scale: 1, rotateY: 0, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 220, damping: 16 }}
              className="text-center space-y-4 w-full"
              style={{ transformStyle: 'preserve-3d' }}
            >
              <motion.div 
                whileHover={{ scale: 1.08, rotateY: 15 }}
                className="w-24 h-24 rounded-full overflow-hidden border-4 border-emerald-500 mx-auto shadow-xl cursor-pointer"
              >
                <img 
                  src={selectedResult.cover_pic} 
                  alt={selectedResult.name} 
                  className="w-full h-full object-cover"
                />
              </motion.div>
              
              <div>
                <span className="text-[9px] font-black uppercase tracking-wider text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 px-2.5 py-0.5 rounded-full">
                  You matched:
                </span>
                <h3 className="text-sm font-black font-outfit mt-1 text-foreground leading-snug">{selectedResult.name}</h3>
                <p className="text-xs font-bold text-neutral-400 dark:text-neutral-500 mt-0.5">${selectedResult.price.toFixed(2)}</p>
              </div>

              <div className="flex gap-2 justify-center w-full pt-1.5">
                <button 
                  onClick={handleSpin}
                  className="p-3 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-foreground rounded-xl flex items-center justify-center transition-all"
                  title="Spin Again"
                >
                  <RefreshCw size={14} />
                </button>
                
                <button 
                  onClick={handleAddToCart}
                  className="flex-1 bg-gold hover:bg-gold-hover text-brand-black font-extrabold text-xs py-3 rounded-xl shadow flex items-center justify-center gap-1.5 transition-all"
                >
                  <ShoppingBag size={13} />
                  <span>Add to Cart</span>
                </button>
              </div>
            </motion.div>
          ) : (
            /* Idle Initial state */
            <div className="text-center space-y-4">
              <div className="text-5xl animate-float">🎰</div>
              <button 
                onClick={handleSpin}
                className="px-6 py-3 bg-gold hover:bg-gold-hover text-brand-black font-extrabold text-xs rounded-xl shadow-lg transition-transform duration-200 active:scale-95 flex items-center gap-1.5"
              >
                <RefreshCw size={12} className="animate-spin-slow" />
                <span>SPIN THE WHEEL</span>
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
