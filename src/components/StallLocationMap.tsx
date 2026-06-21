'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Target } from 'lucide-react';

interface StallLocationMapProps {
  lat: number;
  lng: number;
  onLocationChange: (lat: number, lng: number) => void;
}

export default function StallLocationMap({ lat, lng, onLocationChange }: StallLocationMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapInstance = useRef<any>(null);
  const markerInstance = useRef<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Ensure Leaflet assets are loaded
    if ((window as any).L) {
      setMapLoaded(true);
      return;
    }

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = () => setMapLoaded(true);
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;
    const L = (window as any).L;
    if (!L) return;

    if (!leafletMapInstance.current) {
      // Initialize map centered at current coordinates
      leafletMapInstance.current = L.map(mapRef.current, {
        zoomControl: true,
        attributionControl: false
      }).setView([lat, lng], 15);

      // Add CartoDB Dark Matter tile layer
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 20,
        subdomains: 'abcd',
      }).addTo(leafletMapInstance.current);

      // Create draggable marker representing the vendor shop
      markerInstance.current = L.marker([lat, lng], {
        draggable: true,
        icon: L.divIcon({
          className: 'stall-draggable-marker',
          html: `<div class="flex items-center justify-center w-8 h-8 rounded-full bg-gold text-brand-black text-base font-bold shadow-lg border-2 border-white dark:border-neutral-950 animate-bounce">
                  🏪
                </div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 32]
        })
      }).addTo(leafletMapInstance.current);

      // Listen to drag event to update vendor coordinates
      markerInstance.current.on('dragend', (e: any) => {
        const position = e.target.getLatLng();
        onLocationChange(position.lat, position.lng);
      });

      // Listen to map click to reposition marker
      leafletMapInstance.current.on('click', (e: any) => {
        const { lat: clickLat, lng: clickLng } = e.latlng;
        markerInstance.current.setLatLng([clickLat, clickLng]);
        onLocationChange(clickLat, clickLng);
      });
    } else {
      // Reposition map and marker if changed externally
      const map = leafletMapInstance.current;
      const marker = markerInstance.current;
      
      const currentCenter = map.getCenter();
      if (Math.abs(currentCenter.lat - lat) > 0.0001 || Math.abs(currentCenter.lng - lng) > 0.0001) {
        map.setView([lat, lng]);
      }
      if (marker) {
        const markerPos = marker.getLatLng();
        if (Math.abs(markerPos.lat - lat) > 0.0001 || Math.abs(markerPos.lng - lng) > 0.0001) {
          marker.setLatLng([lat, lng]);
        }
      }
    }
  }, [mapLoaded, lat, lng]);

  return (
    <div className="relative w-full h-[220px] rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800 shadow-sm mt-3">
      {!mapLoaded && (
        <div className="absolute inset-0 bg-neutral-900/50 backdrop-blur-sm flex flex-col items-center justify-center text-[10px] font-black text-white gap-1 z-20">
          <Target className="animate-spin text-gold" size={16} />
          <span>Loading Shop Map...</span>
        </div>
      )}
      <div ref={mapRef} className="w-full h-full z-10" />
      <div className="absolute bottom-2 left-2 z-20 bg-neutral-950/80 backdrop-blur px-2.5 py-1 rounded text-[8px] font-black text-gold pointer-events-none border border-neutral-850">
        📍 Drag marker or click map to reposition shop
      </div>
    </div>
  );
}
