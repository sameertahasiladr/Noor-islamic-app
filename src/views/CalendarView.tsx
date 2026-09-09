import React, { useState } from 'react';
import { ChevronLeft, Calendar as CalendarIcon, Star, Clock, Info } from 'lucide-react';
import { ISLAMIC_EVENTS } from '../data/islamicCalendar';
import { HijriDate } from '../types';

interface CalendarViewProps {
  hijriDate: HijriDate;
  onBack: () => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ hijriDate, onBack }) => {
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);

  const hijriMonths = [
    { num: 1, name: 'Muharram', arabic: 'مُحَرَّم', sacred: true },
    { num: 2, name: 'Safar', arabic: 'صَفَر', sacred: false },
    { num: 3, name: 'Rabi al-Awwal', arabic: 'رَبِيع الأَوَّل', sacred: false },
    { num: 4, name: 'Rabi al-Thani', arabic: 'رَبِيع الآخِر', sacred: false },
    { num: 5, name: 'Jumada al-Ula', arabic: 'جُمَادَى الأُولَى', sacred: false },
    { num: 6, name: 'Jumada al-Akhirah', arabic: 'جُمَادَى الآخِرَة', sacred: false },
    { num: 7, name: 'Rajab', arabic: 'رَجَب', sacred: true },
    { num: 8, name: 'Sha\'ban', arabic: 'شَعْبَان', sacred: false },
    { num: 9, name: 'Ramadan', arabic: 'رَمَضَان', sacred: true },
    { num: 10, name: 'Shawwal', arabic: 'شَوَّال', sacred: false },
    { num: 11, name: 'Dhu al-Qi\'dah', arabic: 'ذُو القَعْدَة', sacred: true },
    { num: 12, name: 'Dhu al-Hijjah', arabic: 'ذُو الحِجَّة', sacred: true },
  ];

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

        <span className="text-xs text-zinc-500">
          Year {hijriDate.year} AH
        </span>
      </div>

      {/* Hero Hijri Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-950 via-teal-900 to-zinc-950 text-white shadow-xl relative overflow-hidden border border-emerald-800/40 text-center">
        <span className="text-xs uppercase font-bold tracking-widest text-amber-300">
          Today in Hijri Calendar
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold font-arabic my-2 text-white">
          {hijriDate.formattedArabic}
        </h1>
        <p className="text-base font-bold text-emerald-200">
          {hijriDate.day} {hijriDate.monthName} {hijriDate.year} AH
        </p>
        <p className="text-xs text-zinc-300 mt-1">
          Corresponding Gregorian: {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
      </div>

      {/* Important Islamic Events */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 px-1">
          Key Islamic Dates & Holy Days
        </h3>

        <div className="space-y-2.5">
          {ISLAMIC_EVENTS.map((ev) => (
            <div
              key={ev.id}
              className="p-4 rounded-2xl bg-white dark:bg-zinc-850 border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-2 hover:border-emerald-300 transition-all"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5">
                    {ev.isImportant && (
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-current" />
                    )}
                    <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                      {ev.name}
                    </h4>
                  </div>
                  <span className="text-xs font-arabic font-semibold text-emerald-800 dark:text-emerald-400">
                    {ev.arabicName}
                  </span>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-bold text-amber-700 dark:text-amber-400 block">
                    {ev.hijriDateFormatted}
                  </span>
                  <span className="text-[11px] text-zinc-400 block">
                    {ev.gregorianDateFormatted}
                  </span>
                </div>
              </div>

              <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed font-normal">
                {ev.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 12 Hijri Months Guide */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 px-1">
          The 12 Hijri Months
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {hijriMonths.map((m) => (
            <div
              key={m.num}
              className={`p-2.5 rounded-xl border text-center ${
                m.num === hijriDate.month
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 font-bold'
                  : 'border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-850'
              }`}
            >
              <span className="text-[10px] text-zinc-400 block">
                Month {m.num} {m.sacred ? '• Sacred' : ''}
              </span>
              <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 block">
                {m.name}
              </span>
              <span className="text-xs font-arabic text-emerald-800 dark:text-emerald-400 block">
                {m.arabic}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
