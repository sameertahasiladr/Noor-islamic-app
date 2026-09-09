import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { MosqueItem } from '../types';
import { formatDistance } from '../services/mosqueService';

interface MosqueMapViewProps {
  userLocation: { lat: number; lng: number; city: string };
  mosques: MosqueItem[];
  selectedMosqueId?: string | null;
  onSelectMosque?: (mosque: MosqueItem) => void;
  height?: string;
}

export const MosqueMapView: React.FC<MosqueMapViewProps> = ({
  userLocation,
  mosques,
  selectedMosqueId,
  onSelectMosque,
  height = '320px',
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const markersMapRef = useRef<Map<string, L.Marker>>(new Map());

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [userLocation.lat, userLocation.lng],
        zoom: 13,
        zoomControl: false,
        attributionControl: false,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);

      // Add zoom control in top-right
      L.control.zoom({ position: 'topright' }).addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update center when user location changes
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([userLocation.lat, userLocation.lng], 13);
    }
  }, [userLocation.lat, userLocation.lng]);

  // Handle ResizeObserver for dynamic layout / tab changes
  useEffect(() => {
    if (!mapContainerRef.current || !mapInstanceRef.current) return;

    const ro = new ResizeObserver(() => {
      mapInstanceRef.current?.invalidateSize();
    });
    ro.observe(mapContainerRef.current);

    return () => ro.disconnect();
  }, []);

  // Render Markers
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();
    markersMapRef.current.clear();

    // 1. User location marker (Pulsing blue dot)
    const userIcon = L.divIcon({
      className: 'custom-user-marker',
      html: `
        <div style="position: relative; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; width: 24px; height: 24px; border-radius: 9999px; background-color: rgba(59, 130, 246, 0.35); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="position: relative; width: 14px; height: 14px; border-radius: 9999px; background-color: #2563eb; border: 2.5px solid #ffffff; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });

    const userMarker = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon });
    userMarker.bindPopup(`
      <div style="padding: 4px 6px; font-family: sans-serif; font-size: 12px; font-weight: bold; color: #1e293b;">
        📍 Your Location (${userLocation.city})
      </div>
    `);
    markersLayerRef.current.addLayer(userMarker);

    // 2. Mosque markers
    mosques.forEach((mosque) => {
      const isSelected = mosque.id === selectedMosqueId;

      const mosqueIcon = L.divIcon({
        className: `custom-mosque-marker-${mosque.id}`,
        html: `
          <div style="
            display: flex;
            align-items: center;
            justify-content: center;
            width: ${isSelected ? '36px' : '30px'};
            height: ${isSelected ? '36px' : '30px'};
            background: ${isSelected ? '#047857' : '#059669'};
            color: #ffffff;
            border-radius: 9999px;
            border: 2.5px solid #ffffff;
            box-shadow: 0 4px 10px rgba(0,0,0,0.35);
            transition: all 0.2s ease;
            cursor: pointer;
          ">
            <svg width="${isSelected ? '20' : '16'}" height="${isSelected ? '20' : '16'}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2v4"/>
              <path d="M4 10a8 8 0 0 1 16 0v10H4V10z"/>
              <path d="M9 20v-5a3 3 0 0 1 6 0v5"/>
            </svg>
          </div>
        `,
        iconSize: isSelected ? [36, 36] : [30, 30],
        iconAnchor: isSelected ? [18, 18] : [15, 15],
      });

      const marker = L.marker([mosque.lat, mosque.lng], { icon: mosqueIcon });

      const popupHtml = `
        <div style="padding: 6px 8px; font-family: system-ui, -apple-system, sans-serif; min-width: 180px; max-width: 240px;">
          <div style="font-size: 13px; font-weight: 700; color: #0f172a; line-height: 1.3;">
            ${mosque.name}
          </div>
          ${mosque.arabicName ? `<div style="font-size: 12px; color: #047857; margin-top: 2px;">${mosque.arabicName}</div>` : ''}
          <div style="display: inline-block; background: #ecfdf5; color: #065f46; font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 9999px; margin-top: 4px;">
            ${formatDistance(mosque.distanceKm)}
          </div>
          <div style="font-size: 11px; color: #64748b; margin-top: 4px; line-height: 1.3;">
            ${mosque.address}
          </div>
          <div style="margin-top: 8px; display: flex; gap: 6px;">
            <a 
              href="https://www.google.com/maps/dir/?api=1&destination=${mosque.lat},${mosque.lng}" 
              target="_blank" 
              rel="noopener noreferrer"
              style="display: inline-block; background: #4338ca; color: #ffffff; text-decoration: none; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700;"
            >
              Directions
            </a>
            <a 
              href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mosque.name + ' ' + mosque.address)}" 
              target="_blank" 
              rel="noopener noreferrer"
              style="display: inline-block; background: #f1f5f9; color: #334155; text-decoration: none; padding: 4px 8px; border-radius: 6px; font-size: 11px; font-weight: 600;"
            >
              Google Maps
            </a>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);

      marker.on('click', () => {
        if (onSelectMosque) {
          onSelectMosque(mosque);
        }
      });

      markersLayerRef.current?.addLayer(marker);
      markersMapRef.current.set(mosque.id, marker);
    });

    // Auto-fit bounds if we have mosques
    if (mosques.length > 0 && mapInstanceRef.current) {
      const bounds = L.latLngBounds([
        [userLocation.lat, userLocation.lng],
        ...mosques.map((m) => [m.lat, m.lng] as [number, number]),
      ]);
      mapInstanceRef.current.fitBounds(bounds.pad(0.15), {
        maxZoom: 15,
      });
    }
  }, [mosques, userLocation, selectedMosqueId, onSelectMosque]);

  // Fly to selected mosque when selectedMosqueId changes
  useEffect(() => {
    if (!selectedMosqueId || !mapInstanceRef.current) return;
    const marker = markersMapRef.current.get(selectedMosqueId);
    if (marker) {
      const latLng = marker.getLatLng();
      mapInstanceRef.current.setView(latLng, 15, { animate: true });
      marker.openPopup();
    }
  }, [selectedMosqueId]);

  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([userLocation.lat, userLocation.lng], 14, {
        animate: true,
      });
    }
  };

  return (
    <div className="relative rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-inner group">
      <div ref={mapContainerRef} style={{ height, width: '100%' }} />

      {/* Recenter Button Overlay */}
      <button
        type="button"
        onClick={handleRecenter}
        className="absolute bottom-3 right-3 z-[400] px-3 py-1.5 rounded-xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md text-zinc-700 dark:text-zinc-200 text-xs font-bold shadow-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all flex items-center gap-1.5 border border-zinc-200 dark:border-zinc-700"
        title="Recenter on your location"
      >
        <span>📍 Center on Me</span>
      </button>

      {/* Map Attribution small pill */}
      <div className="absolute bottom-1 left-2 z-[400] text-[9px] text-zinc-500 bg-white/80 dark:bg-zinc-900/80 px-1.5 py-0.5 rounded backdrop-blur-xs">
        OpenStreetMap • Real Coordinates
      </div>
    </div>
  );
};
