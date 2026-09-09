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
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-950 text-white shadow-xl border border-emerald-700/40 p-4 sm:p-5">
      {/* Decorative Islamic Arch Background SVG */}
      <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 opacity-10 pointer-events-none">
        <svg width="240" height="240" viewBox="0 0 100 100" fill="none" stroke="currentColor">
          <path d="M50 5 C30 5 10 25 10 50 C10 75 25 90 50 95 C75 90 90 75 90 50 C90 25 70 5 50 5 Z" strokeWidth="2" />
          <path d="M50 15 C35 15 20 30 20 50 C20 70 35 85 50 85 C65 85 80 70 80 50 C80 30 65 15 50 15 Z" strokeWidth="1" />
        </svg>
      </div>

      {/* Header section: Next Prayer & Countdown */}
      <div className="flex items-start justify-between relative z-10 mb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-400/20 text-amber-300 border border-amber-400/30">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse mr-1.5" />
              Upcoming
            </span>
            <span className="text-xs text-emerald-200/80 font-medium">
              Next Prayer: <strong className="text-white font-bold">{nextPrayerName}</strong>
            </span>
          </div>

          <div className="mt-2">
            <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-baseline gap-2">
              <span>{prayerData.nextPrayer.remainingFormatted}</span>
              <span className="text-xs sm:text-sm font-normal text-emerald-200/70">
                remaining
              </span>
            </div>
            <p className="text-xs text-emerald-300/80 mt-0.5">
              Scheduled for <span className="font-semibold text-white">{prayerData.nextPrayer.time}</span>
            </p>
          </div>
        </div>

        {/* Sound toggle button */}
        {onToggleSound && (
          <button
            onClick={onToggleSound}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-emerald-100 transition-colors border border-white/10"
            title={soundEnabled ? 'Adhan alert active' : 'Adhan muted'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-300" /> : <VolumeX className="w-4 h-4 text-zinc-400" />}
          </button>
        )}
      </div>

      {/* Grid of prayer times */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 relative z-10 my-3">
        {prayerList.map((p) => {
          const isNext = p.name === nextPrayerName;
          const Icon = p.icon;

          return (
            <div
              key={p.name}
              className={`flex flex-col items-center justify-center p-2.5 rounded-xl text-center transition-all ${
                isNext
                  ? 'bg-amber-400/20 border border-amber-400/50 shadow-inner'
                  : 'bg-white/5 hover:bg-white/10 border border-white/5'
              }`}
            >
              <Icon className={`w-4 h-4 mb-1 ${isNext ? 'text-amber-300' : 'text-emerald-200/80'}`} />
              <span className={`text-[11px] font-semibold ${isNext ? 'text-amber-200' : 'text-emerald-100'}`}>
                {p.name}
              </span>
              <span className="text-[10px] font-arabic text-emerald-200/60 leading-none my-0.5">
                {p.arabic}
              </span>
              <span className={`text-xs font-bold mt-0.5 ${isNext ? 'text-white font-extrabold' : 'text-zinc-100'}`}>
                {p.time}
              </span>
            </div>
          );
        })}
      </div>

      {/* Footer link to full prayer timetable */}
      <div className="pt-2 border-t border-emerald-700/50 flex items-center justify-between text-xs relative z-10">
        <span className="text-emerald-200/80 flex items-center gap-1 text-[11px]">
          <Clock className="w-3.5 h-3.5 text-amber-300" />
          <span>Local Solar Timing</span>
        </span>
        <button
          onClick={onViewFullTimes}
          className="font-semibold text-amber-300 hover:text-amber-200 flex items-center gap-1 transition-colors group"
        >
          <span>View Full Prayer Times</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>
    </div>
  );
};
