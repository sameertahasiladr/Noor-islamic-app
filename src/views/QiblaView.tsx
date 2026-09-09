import React, { useState, useEffect } from 'react';
import { Compass, MapPin, ChevronLeft, RotateCw, CheckCircle2, Navigation } from 'lucide-react';
import { UserProfile } from '../types';
import { calculateQibla } from '../services/prayerService';

interface QiblaViewProps {
  profile: UserProfile;
  onBack: () => void;
}

export const QiblaView: React.FC<QiblaViewProps> = ({ profile, onBack }) => {
  const [deviceHeading, setDeviceHeading] = useState<number>(0);
  const [hasCompassSupport, setHasCompassSupport] = useState<boolean>(false);
  const [manualOffset, setManualOffset] = useState<number>(0);

  const qiblaInfo = calculateQibla(profile.location.latitude, profile.location.longitude);
  const getCardinal = (deg: number) => {
    const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    return dirs[Math.round(deg / 45) % 8];
  };

  useEffect(() => {
    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.alpha !== null) {
        setHasCompassSupport(true);
        // iOS provides webkitCompassHeading directly
        const heading = (e as any).webkitCompassHeading ?? (360 - e.alpha);
        setDeviceHeading(Math.round(heading));
      }
    };

    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', handleOrientation, true);
    }

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation, true);
    };
  }, []);

  const currentHeading = (deviceHeading + manualOffset) % 360;
  // Calculate relative angle to the Kaaba
  const relativeAngle = (qiblaInfo.degree - currentHeading + 360) % 360;
  // Is aligned within 3 degrees
  const isAligned = Math.abs(relativeAngle) <= 3 || Math.abs(relativeAngle - 360) <= 3;

  return (
    <div className="max-w-4xl mx-auto px-4 pb-20 pt-2 space-y-4">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800"
        >
          <ChevronLeft className="w-4 h-4 mr-0.5" />
          <span>Back to Tools</span>
        </button>

        <div className="flex items-center space-x-1.5 text-xs text-zinc-500">
          <MapPin className="w-3.5 h-3.5 text-emerald-600" />
          <span>{profile.location.city}, {profile.location.country}</span>
        </div>
      </div>

      {/* Main Compass Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-950 via-zinc-900 to-teal-950 text-white shadow-2xl border border-emerald-800/40 text-center relative overflow-hidden">
        {/* Alignment Glow */}
        {isAligned && (
          <div className="absolute inset-0 bg-emerald-500/10 pointer-events-none animate-pulse" />
        )}

        <div className="relative z-10 space-y-2 mb-4">
          <span className="text-xs uppercase font-bold tracking-widest text-amber-400">
            Sacred Kaaba Direction
          </span>
          <h1 className="text-2xl font-extrabold font-arabic">اتجاه القبلة الشريفة</h1>

          <div className="flex items-center justify-center gap-4 text-xs mt-2">
            <div className="bg-white/10 px-3 py-1 rounded-xl">
              Qibla Bearing: <strong className="text-amber-300 font-bold">{qiblaInfo.degree}°</strong> ({getCardinal(qiblaInfo.degree)})
            </div>
            <div className="bg-white/10 px-3 py-1 rounded-xl">
              Distance to Makkah: <strong className="text-emerald-300 font-bold">{qiblaInfo.distanceKm.toLocaleString()} km</strong>
            </div>
          </div>
        </div>

        {/* Alignment status alert */}
        <div className="my-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-colors">
          {isAligned ? (
            <span className="text-emerald-300 bg-emerald-900/60 border border-emerald-500/50 px-3 py-1 rounded-full flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Aligned with Qibla! Ready for Salah.
            </span>
          ) : (
            <span className="text-zinc-300 bg-white/5 px-3 py-1 rounded-full">
              Turn device until the golden arrow points directly up
            </span>
          )}
        </div>

        {/* Compass Dial Visualizer */}
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 mx-auto my-6 flex items-center justify-center">
          {/* Outer dial ring */}
          <div
            className="w-full h-full rounded-full border-4 border-emerald-700/50 relative transition-transform duration-300 ease-out shadow-inner bg-zinc-900/70"
            style={{ transform: `rotate(${-currentHeading}deg)` }}
          >
            {/* Compass Cardinal Points */}
            <span className="absolute top-2 left-1/2 -translate-x-1/2 text-xs font-bold text-rose-400">N</span>
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400">E</span>
            <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs font-bold text-zinc-400">S</span>
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400">W</span>

            {/* Tick marks */}
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-0.5 h-2 bg-zinc-600 left-1/2 top-0 origin-bottom"
                style={{
                  height: i % 3 === 0 ? '10px' : '6px',
                  backgroundColor: i % 3 === 0 ? '#10b981' : '#52525b',
                  transform: `translateX(-50%) rotate(${i * 30}deg)`,
                  transformOrigin: '50% 128px',
                }}
              />
            ))}

            {/* Holy Kaaba Icon Marker fixed at qiblaInfo.degree */}
            <div
              className="absolute left-1/2 top-0 -translate-x-1/2 origin-bottom"
              style={{
                transform: `rotate(${qiblaInfo.degree}deg)`,
                transformOrigin: '50% 128px',
              }}
            >
              <div className="flex flex-col items-center -translate-y-2">
                <div className="w-7 h-7 rounded-md bg-zinc-950 border border-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/20">
                  <span className="text-amber-400 text-[10px] font-bold">🕋</span>
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1" />
              </div>
            </div>
          </div>

          {/* Center Indicator needle pointing directly towards Qibla */}
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none transition-transform duration-300"
            style={{ transform: `rotate(${relativeAngle}deg)` }}
          >
            <div className="flex flex-col items-center -translate-y-16">
              <Navigation className={`w-8 h-8 ${isAligned ? 'text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]' : 'text-emerald-400'}`} />
            </div>
          </div>

          {/* Center hub */}
          <div className="w-12 h-12 rounded-full bg-zinc-900 border-2 border-amber-400/80 flex items-center justify-center z-10 shadow-md">
            <Compass className="w-6 h-6 text-amber-400" />
          </div>
        </div>

        {/* Manual adjustment control for desktop or sensors not active */}
        <div className="pt-4 border-t border-emerald-900/60 max-w-xs mx-auto">
          <p className="text-[11px] text-zinc-400 mb-2">
            {hasCompassSupport ? 'Hardware compass active.' : 'Interactive rotation preview mode:'}
          </p>
          <div className="flex items-center justify-center space-x-2">
            <button
              onClick={() => setManualOffset((prev) => (prev - 15 + 360) % 360)}
              className="px-3 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold flex items-center gap-1"
            >
              <RotateCw className="w-3.5 h-3.5 -scale-x-100" />
              <span>Rotate Left</span>
            </button>
            <button
              onClick={() => setManualOffset(0)}
              className="px-3 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold"
            >
              Reset
            </button>
            <button
              onClick={() => setManualOffset((prev) => (prev + 15) % 360)}
              className="px-3 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold flex items-center gap-1"
            >
              <span>Rotate Right</span>
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
