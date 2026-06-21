'use client';

import React, { useEffect } from 'react';
import { useParams } from 'next/navigation';
import DetailView from '@/components/views/DetailView';
import { useApp } from '@/context/AppContext';

export default function StallDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const { stalls, setSelectedStall, setSelectedFood, selectedFood } = useApp();

  useEffect(() => {
    if (id) {
      const stall = stalls.find(s => s.id === id);
      if (stall) {
        setSelectedStall(stall);
        // Reset food selection only if it belongs to a different stall
        if (selectedFood && selectedFood.stall_id !== stall.id) {
          setSelectedFood(null);
        }
      }
    }
  }, [id, stalls, setSelectedStall, setSelectedFood, selectedFood]);

  return <DetailView />;
}
