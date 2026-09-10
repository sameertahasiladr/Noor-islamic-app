import React from 'react';
import { Clock, ArrowRight, Volume2, VolumeX, Sunrise, Sun, Sunset, Moon, CloudSun } from 'lucide-react';
import { PrayerTimeData } from '../types';

interface PrayerCardProps {
  prayerData: PrayerTimeData;
  onViewFullTimes: () => void;
  soundEnabled?: boolean;
  onToggleSound?: () => void;
}

export const PrayerCard: React.FC<PrayerCardProps> = ({
  prayerData,
  onViewFullTimes,
  soundEnabled = true,
  onToggleSound,
}) => {
  const prayerList = [
    { name: 'Fajr', time: prayerData.fajr, icon: Sunrise, arabic: 'الفجر' },
    { name: 'Sunrise', time: prayerData.sunrise, icon: CloudSun, arabic: 'الشروق' },
    { name: 'Dhuhr', time: prayerData.dhuhr, icon: Sun, arabic: 'الظهر' },
    { name: 'Asr', time: prayerData.asr, icon: CloudSun, arabic: 'العصر' },
    { name: 'Maghrib', time: prayerData.maghrib, icon: Sunset, arabic: 'المغرب' },
    { name: 'Isha', time: prayerData.isha, icon: Moon, arabic: 'العشاء' },
  ];

  const nextPrayerName = prayerData.nextPrayer.name;

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#064E3B] via-[#06392C] to-[#03231A] text-white shadow-xl shadow-emerald-950/20 border border-emerald-600/30 p-5 sm:p-6 transition-all">
      {/* Decorative Islamic Geometry SVG Watermark */}
      <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 opacity-10 pointer-events-none">
        <svg width="260" height="260" viewBox="0 0 100 100" fill="none" stroke="currentColor">
          <path d="M50 2 L62 38 L98 50 L62 62 L50 98 L38 62 L2 50 L38 38 Z" strokeWidth="1.5" stroke="currentColor" />
          <circle cx="50" cy="50" r="30" strokeWidth="1" stroke="currentColor" />
          <path d="M50 15 C35 15 20 30 20 50 C20 70 35 85 50 85 C65 85 80 70 80 50 C80 30 65 15 50 15 Z" strokeWidth="0.8" />
        </svg>
      </div>

      {/* Header section: Next Prayer & Countdown */}
      <div className="flex items-start justify-between relative z-10 mb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 backdrop-blur-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse mr-1.5 shadow-[0_0_8px_#FBBF24]" />
              Upcoming Prayer
            </span>
            <span className="text-xs text-emerald-200/90 font-medium">
              Next: <strong className="text-white font-bold">{nextPrayerName}</strong>
            </span>
          </div>

          <div className="mt-2.5">
            <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white flex items-baseline gap-2">
              <span className="font-mono tracking-tighter">{prayerData.nextPrayer.remainingFormatted}</span>
              <span className="text-xs sm:text-sm font-normal text-emerald-200/80">
                remaining
              </span>
            </div>
            <p className="text-xs text-emerald-300/90 mt-1 font-medium">
              Scheduled at <span className="font-bold text-amber-300">{prayerData.nextPrayer.time}</span>
            </p>
          </div>
        </div>

        {/* Sound toggle button */}
        {onToggleSound && (
          <button
            onClick={onToggleSound}
            className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/15 text-emerald-100 transition-all border border-white/10 backdrop-blur-xs hover:scale-105 active:scale-95"
            title={soundEnabled ? 'Adhan alert active' : 'Adhan muted'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-300" /> : <VolumeX className="w-4 h-4 text-zinc-300" />}
          </button>
        )}
      </div>

      {/* Grid of 6 prayer times */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-2.5 relative z-10 my-4">
        {prayerList.map((p) => {
          const isNext = p.name === nextPrayerName;
          const Icon = p.icon;

          return (
            <div
              key={p.name}
              className={`flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-2xl text-center transition-all ${
                isNext
                  ? 'bg-amber-400/20 border border-amber-400/60 shadow-lg shadow-amber-950/20 scale-[1.02]'
                  : 'bg-white/5 hover:bg-white/10 border border-white/8'
              }`}
            >
              <Icon className={`w-4 h-4 mb-1.5 ${isNext ? 'text-amber-300' : 'text-emerald-200/80'}`} />
              <span className={`text-[11px] font-bold ${isNext ? 'text-amber-200' : 'text-emerald-100'}`}>
                {p.name}
              </span>
              <span className="text-[10px] font-arabic text-emerald-200/70 leading-none my-0.5">
                {p.arabic}
              </span>
              <span className={`text-xs font-bold mt-1 ${isNext ? 'text-white font-extrabold' : 'text-zinc-100'}`}>
                {p.time}
              </span>
            </div>
          );
        })}
      </div>

      {/* Footer link to full prayer timetable */}
      <div className="pt-3 border-t border-emerald-700/40 flex items-center justify-between text-xs relative z-10">
        <span className="text-emerald-200/80 flex items-center gap-1.5 text-[11px] font-medium">
          <Clock className="w-3.5 h-3.5 text-amber-300" />
          <span>Local Solar Timing</span>
        </span>
        <button
          onClick={onViewFullTimes}
          className="font-bold text-amber-300 hover:text-amber-200 flex items-center gap-1.5 transition-all group"
        >
          <span>View Full Schedule</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  );
};
