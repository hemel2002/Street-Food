'use client';

import React from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export default function TiltCard({ children, className = '', onClick }: TiltCardProps) {
  const x = useMotionValue(150);
  const y = useMotionValue(100);

  // Rotates card based on hover coordinates
  const rotateX = useTransform(y, [0, 200], [10, -10]);
  const rotateY = useTransform(x, [0, 300], [-10, 10]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set(e.clientX - rect.left);
    y.set(e.clientY - rect.top);
  };

  const handleMouseLeave = () => {
    // Reset to center smoothly
    x.set(150);
    y.set(100);
  };

  return (
    <div style={{ perspective: 800 }} className="h-full">
      <motion.div
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={onClick}
        className={`${className} transition-all duration-100 ease-out`}
      >
        {children}
      </motion.div>
    </div>
  );
}
