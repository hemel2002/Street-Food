'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Stall } from '@/context/AppContext';
import { Map, Layers, Target, Compass } from 'lucide-react';

interface MapProps {
  stalls: Stall[];
  userLocation: { lat: number; lng: number } | null;
  selectedRadius: number; // in meters (e.g. 500, 1000, 3000, 5000)
  onStallSelect: (stall: Stall) => void;
  heatmapMode: boolean;
}

export default function StreetFoodMap({
  stalls,
  userLocation,
  selectedRadius,
  onStallSelect,
  heatmapMode
}: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapInstance = useRef<any>(null);
  const markerGroupRef = useRef<any>(null);
  const radiusCircleRef = useRef<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    // 1. Dynamic Script Loading for Leaflet CSS & JS
    if (typeof window === 'undefined') return;

    // Check if Leaflet is already loaded
    if ((window as any).L) {
      setMapLoaded(true);
      return;
    }

    // Add Leaflet CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
    link.crossOrigin = '';
    document.head.appendChild(link);

    // Add Leaflet JS
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
    script.crossOrigin = '';
    script.onload = () => {
      setMapLoaded(true);
    };
    document.head.appendChild(script);

    return () => {
      // Clean up if component unmounts and Leaflet wasn't fully loaded yet
    };
  }, []);

  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;
    const L = (window as any).L;
    if (!L) return;

    const defaultLat = userLocation?.lat || 40.6782;
    const defaultLng = userLocation?.lng || -73.9442;

    // Initialize Map Instance if not created
    if (!leafletMapInstance.current) {
      leafletMapInstance.current = L.map(mapRef.current, {
        zoomControl: false,
        attributionControl: false
      }).setView([defaultLat, defaultLng], 14);

      // Dark Mode Tile Style or standard CartoDB Dark Matter
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 20,
        subdomains: 'abcd',
      }).addTo(leafletMapInstance.current);

      // Add zoom control at bottom right
      L.control.zoom({
        position: 'bottomright'
      }).addTo(leafletMapInstance.current);

      markerGroupRef.current = L.layerGroup().addTo(leafletMapInstance.current);
    } else {
      leafletMapInstance.current.setView([defaultLat, defaultLng]);
    }

    const map = leafletMapInstance.current;
    const markerGroup = markerGroupRef.current;
    markerGroup.clearLayers();

    // 2. Draw User Location Marker
    if (userLocation) {
      const userIcon = L.divIcon({
        className: 'user-location-marker',
        html: `<div class="relative flex items-center justify-center">
                <div class="absolute w-6 h-6 bg-gold/30 rounded-full animate-ping"></div>
                <div class="w-3.5 h-3.5 bg-gold rounded-full border-2 border-white shadow-md"></div>
              </div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
        .addTo(markerGroup)
        .bindPopup('<span class="text-xs font-black text-brand-black">Your Current Location</span>');

      // Draw Radius Circle
      if (radiusCircleRef.current) {
        map.removeLayer(radiusCircleRef.current);
      }
      
      radiusCircleRef.current = L.circle([userLocation.lat, userLocation.lng], {
        color: '#D4AF37', // Gold
        fillColor: '#D4AF37',
        fillOpacity: 0.05,
        weight: 1.5,
        dashArray: '4, 4',
        radius: selectedRadius
      }).addTo(map);
    }

    // 3. Draw Stalls Pins
    stalls.forEach((stall) => {
      // If heatmap mode, render as density gradient circles
      if (heatmapMode) {
        L.circle([stall.lat, stall.lng], {
          color: 'transparent',
          fillColor: '#ff4d4d',
          fillOpacity: 0.35,
          radius: 180
        }).addTo(markerGroup);
        return;
      }

      const isApproved = stall.status === 'approved';
      const pinColor = isApproved ? 'bg-gold' : stall.status === 'pending' ? 'bg-amber-500' : 'bg-red-500';
      const nameLower = stall.name.toLowerCase();
      const pinEmoji = nameLower.includes('pizza') ? '🍕' : nameLower.includes('sushi') ? '🍣' : '🍔';

      const customIcon = L.divIcon({
        className: 'custom-stall-marker',
        html: `<div class="flex flex-col items-center group cursor-pointer">
                <div class="flex items-center justify-center w-8 h-8 rounded-full ${pinColor} text-brand-black text-xs font-bold shadow-lg border-2 border-white dark:border-neutral-950 transition-all hover:scale-110 active:scale-95">
                  ${pinEmoji}
                </div>
                <div class="bg-brand-black/90 dark:bg-neutral-950/95 backdrop-blur text-[8px] font-black text-white px-1.5 py-0.5 rounded shadow mt-0.5 max-w-[80px] truncate border border-neutral-800/30">
                  ${stall.name}
                </div>
              </div>`,
        iconSize: [50, 50],
        iconAnchor: [25, 25]
      });

      const marker = L.marker([stall.lat, stall.lng], { icon: customIcon })
        .addTo(markerGroup);

      marker.on('click', () => {
        onStallSelect(stall);
      });
    });

  }, [mapLoaded, stalls, userLocation, selectedRadius, heatmapMode]);

  return (
    <div className="relative w-full h-[320px] md:h-[400px] rounded-3xl overflow-hidden border border-neutral-200/50 dark:border-neutral-800 shadow-md">
      {!mapLoaded && (
        <div className="absolute inset-0 bg-neutral-900/50 backdrop-blur-sm flex flex-col items-center justify-center text-xs font-extrabold text-white gap-2 z-20">
          <Target className="animate-spin text-gold" size={24} />
          <span>Initializing Leaflet Map...</span>
        </div>
      )}
      <div ref={mapRef} className="w-full h-full z-10" />
      
      {/* Legend Overlays */}
      <div className="absolute top-4 left-4 z-20 bg-neutral-900/90 backdrop-blur border border-neutral-850 px-3 py-2 rounded-2xl shadow text-[9px] font-bold text-white space-y-1.5 pointer-events-none">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-gold inline-block"></span>
          <span>Approved Stalls</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
          <span>Pending Approvals</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block"></span>
          <span>Closed / Suspended</span>
        </div>
      </div>
    </div>
  );
}
