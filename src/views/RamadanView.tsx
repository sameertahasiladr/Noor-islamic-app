import React, { useState, useMemo } from 'react';
import {
  ChevronLeft,
  Moon,
  Clock,
  Check,
  Volume2,
  Sparkles,
  Heart,
  Calendar,
  Copy,
  Share2,
  CheckCheck,
  Flame,
  Star,
  Info,
} from 'lucide-react';
import { PrayerTimeData, UserProfile } from '../types';
import { audioService } from '../services/audioService';
import { storageService } from '../services/storageService';
import { getHijriDate } from '../services/prayerService';

interface RamadanViewProps {
  profile: UserProfile;
  prayerData: PrayerTimeData;
  onBack: () => void;
  onUpdateProfile: (p: UserProfile) => void;
}

export interface RamadanDaySchedule {
  dayNumber: number;
  gregorianDate: Date;
  dateFormatted: string;
  dayOfWeek: string;
  shortDate: string;
  isToday: boolean;
  isPast: boolean;
  ashra: 'Mercy' | 'Forgiveness' | 'Salvation';
  isLastTen: boolean;
  isOddNight: boolean;
}

/**
 * Finds the upcoming or current Ramadan starting Gregorian date
 */
function getUpcomingRamadanSchedule(hijriAdjustment = 0): RamadanDaySchedule[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Scan from today up to 380 days in future to find the first day of Ramadan (month 9, day 1)
  // or if we are already in Ramadan, find day 1 of the current Ramadan.
  let ramadanStartDate: Date | null = null;

  // First check if today is inside Ramadan
  const todayHijri = getHijriDate(today, hijriAdjustment);
  if (todayHijri.month === 9) {
    // Current Ramadan: backtrack to day 1
    const d = new Date(today);
    d.setDate(d.getDate() - (todayHijri.day - 1));
    ramadanStartDate = d;
  } else {
    // Scan ahead to find next 1st of Ramadan
    const probe = new Date(today);
    for (let i = 0; i < 370; i++) {
      const h = getHijriDate(probe, hijriAdjustment);
      if (h.month === 9 && h.day <= 2) {
        // found beginning of Ramadan
        const start = new Date(probe);
        start.setDate(start.getDate() - (h.day - 1));
        ramadanStartDate = start;
        break;
      }
      probe.setDate(probe.getDate() + 1);
    }
  }

  // Fallback if not found (approximate next Ramadan)
  if (!ramadanStartDate) {
    ramadanStartDate = new Date(today.getFullYear(), 2, 1); // March 1st fallback
  }

  const schedule: RamadanDaySchedule[] = [];
  const curDate = new Date(ramadanStartDate);

  for (let day = 1; day <= 30; day++) {
    const d = new Date(curDate);
    const dayOfWeek = d.toLocaleDateString(undefined, { weekday: 'short' });
    const shortDate = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    const dateFormatted = d.toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    const isToday =
      d.getFullYear() === today.getFullYear() &&
      d.getMonth() === today.getMonth() &&
      d.getDate() === today.getDate();

    const isPast = d < today && !isToday;

    let ashra: 'Mercy' | 'Forgiveness' | 'Salvation' = 'Mercy';
    if (day > 10 && day <= 20) ashra = 'Forgiveness';
    else if (day > 20) ashra = 'Salvation';

    const isLastTen = day >= 21;
    const isOddNight = [21, 23, 25, 27, 29].includes(day);

    schedule.push({
      dayNumber: day,
      gregorianDate: d,
      dateFormatted,
      dayOfWeek,
      shortDate,
      isToday,
      isPast,
      ashra,
      isLastTen,
      isOddNight,
    });

    curDate.setDate(curDate.getDate() + 1);
  }

  return schedule;
}

export const RamadanView: React.FC<RamadanViewProps> = ({
  profile,
  prayerData,
  onBack,
  onUpdateProfile,
}) => {
  const [activeTab, setActiveTab] = useState<'fasting_duas' | 'tracker' | 'calendar'>('fasting_duas');
  const [copiedTitle, setCopiedTitle] = useState<string | null>(null);
  const [filterMode, setFilterMode] = useState<'all' | 'last10' | 'fasted'>('all');

  const fastedDays = profile.fastingTracker?.fastedDays || [];
  const taraweehDays = profile.fastingTracker?.taraweehDays || [];

  // Generate coming Ramadan dates
  const ramadanSchedule = useMemo(() => {
    return getUpcomingRamadanSchedule(profile.hijriDateAdjustment || 0);
  }, [profile.hijriDateAdjustment]);

  const toggleDayFasted = (day: number) => {
    let updatedFasted = [...fastedDays];
    if (updatedFasted.includes(day)) {
      updatedFasted = updatedFasted.filter((d) => d !== day);
    } else {
      updatedFasted.push(day);
    }
    const updated = {
      ...profile,
      fastingTracker: {
        ...profile.fastingTracker,
        fastedDays: updatedFasted,
        taraweehDays,
      },
    };
    onUpdateProfile(updated);
    storageService.saveProfile(updated);
  };

  const toggleDayTaraweeh = (day: number) => {
    let updatedTaraweeh = [...taraweehDays];
    if (updatedTaraweeh.includes(day)) {
      updatedTaraweeh = updatedTaraweeh.filter((d) => d !== day);
    } else {
      updatedTaraweeh.push(day);
    }
    const updated = {
      ...profile,
      fastingTracker: {
        ...profile.fastingTracker,
        fastedDays,
        taraweehDays: updatedTaraweeh,
      },
    };
    onUpdateProfile(updated);
    storageService.saveProfile(updated);
  };

  const handleCopyDua = (title: string, arabic: string, translation: string, ref: string) => {
    const text = `${title}\n\n${arabic}\n\n"${translation}"\n- ${ref}\nVia Noor Islamic App`;
    navigator.clipboard.writeText(text);
    setCopiedTitle(title);
    setTimeout(() => setCopiedTitle(null), 2000);
  };

  const FASTING_DUAS = [
    {
      id: 'suhoor',
      title: 'Intention for Fasting at Suhoor (Niyyah)',
      arabic: 'وَبِصَوْمِ غَدٍ نَوَيْتُ مِنْ شَهْرِ رَمَضَانَ',
      transliteration: 'Wa bi-ṣawmi ghadin nawaytu min shahri Ramaḍān.',
      translation: 'I intend to fast tomorrow in the blessed month of Ramadan for the sake of Allah.',
      reference: 'Islamic Jurisprudence (Fiqh as-Sunnah)',
      timing: 'Before Fajr Adhan',
      tag: 'Suhoor',
    },
    {
      id: 'iftar_primary',
      title: 'Dua at Iftar (Breaking the Fast - Sunnah)',
      arabic: 'ذَهَبَ الظَّمَأُ وَابْتَلَّتِ الْعُرُوقُ وَثَبَتَ الأَجْرُ إِنْ شَاءَ اللَّهُ',
      transliteration: 'Dhahabadh-dhama\'u wabtallatil-\'urūqu wa thabatal-ajru in shā\' Allāh.',
      translation: 'The thirst has gone, the veins are moistened, and the reward is confirmed, if Allah wills.',
      reference: 'Sunan Abi Dawud 2357 (Sahih)',
      timing: 'At Maghrib Adhan',
      tag: 'Iftar',
    },
    {
      id: 'iftar_alternate',
      title: 'Gratitude Dua at Iftar Table',
      arabic: 'اللَّهُمَّ إِنِّي لَكَ صُمْتُ وَعَلَى رِزْقِكَ أَفْطَرْتُ',
      transliteration: 'Allāhumma innī laka ṣumtu wa \'alā rizqika afṭart.',
      translation: 'O Allah, I fasted for You and upon Your provision I have broken my fast.',
      reference: 'Sunan Abi Dawud 2358',
      timing: 'Upon breaking fast',
      tag: 'Iftar',
    },
    {
      id: 'laylatul_qadr',
      title: 'Supplication for Laylat al-Qadr (Night of Power)',
      arabic: 'اللَّهُمَّ إِنَّكَ عَفُوٌّ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي',
      transliteration: 'Allāhumma innaka \'Afuwwun tuḥibbul-\'afwa fa\'fu \'annī.',
      translation: 'O Allah, You are Most Forgiving, and You love forgiveness; so pardon me.',
      reference: 'Jami` at-Tirmidhi 3513 (Reported by Aisha RA)',
      timing: 'Odd nights of last 10 days',
      tag: 'Last 10 Nights',
    },
    {
      id: 'guest_iftar',
      title: 'Dua when Breaking Fast at Someone Else’s Home',
      arabic: 'أَفْطَرَ عِنْدَكُمُ الصَّائِمُونَ، وَأَكَلَ طَعَامَكُمُ الأَبْرَارُ، وَصَلَّتْ عَلَيْكُمُ الْمَلاَئِكَةُ',
      transliteration: 'Afṭara \'indakumuṣ-ṣā\'imūna, wa akala ṭa\'āmakumul-abrāru, wa ṣallat \'alaykumul-malā\'ikah.',
      translation: 'May those who are fasting break their fast with you, may the righteous eat your food, and may the angels send blessings upon you.',
      reference: 'Sunan Abi Dawud 3854',
      timing: 'After eating at host',
      tag: 'Hospitality',
    },
    {
      id: 'restraint',
      title: 'When Provoked or Angered While Fasting',
      arabic: 'إِنِّي صَائِمٌ، إِنِّي صَائِمٌ',
      transliteration: 'Innī ṣā\'im, innī ṣā\'im.',
      translation: 'I am fasting, indeed I am fasting.',
      reference: 'Sahih al-Bukhari 1894, Sahih Muslim 1151',
      timing: 'In moments of dispute',
      tag: 'Self-Restraint',
    },
  ];

  const filteredDays = ramadanSchedule.filter((day) => {
    if (filterMode === 'last10') return day.isLastTen;
    if (filterMode === 'fasted') return fastedDays.includes(day.dayNumber);
    return true;
  });

  const firstDayStr = ramadanSchedule[0]?.shortDate || '';
  const lastDayStr = ramadanSchedule[29]?.shortDate || '';

  return (
    <div className="max-w-4xl mx-auto px-4 pb-20 pt-2 space-y-4">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 transition-colors"
        >
          <ChevronLeft className="w-4 h-4 mr-0.5" />
          <span>Back to Features</span>
        </button>

        <span className="text-xs text-amber-700 dark:text-amber-400 font-bold flex items-center gap-1 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-1 rounded-xl border border-amber-200 dark:border-amber-900/60">
          <Moon className="w-3.5 h-3.5" />
          Ramadan Kareem • رمضان مبارك
        </span>
      </div>

      {/* Hero Ramadan Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-teal-950 via-emerald-900 to-zinc-950 text-white shadow-2xl border border-teal-800/40 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs uppercase font-bold tracking-widest text-amber-300 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Ramadan Dashboard & Fasting Tracker
            </span>
            <span className="text-[11px] bg-white/10 px-2.5 py-0.5 rounded-full text-emerald-200">
              Coming Ramadan Dates: {firstDayStr} – {lastDayStr}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold font-arabic mt-2 text-white">
            شَهْرُ رَمَضَانَ الَّذِي أُنزِلَ فِيهِ الْقُرْآنُ
          </h1>
          <p className="text-xs text-zinc-300 max-w-lg mt-1">
            "The month of Ramadan in which was revealed the Quran, a guidance for the people..." (Al-Baqarah 2:185)
          </p>

          {/* Suhoor & Iftar Timings */}
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-center">
              <span className="text-[11px] font-bold text-emerald-200 uppercase tracking-wider block">
                Suhoor Cutoff (Fajr)
              </span>
              <span className="text-xl sm:text-2xl font-extrabold text-white mt-0.5 block font-mono">
                {prayerData.fajr}
              </span>
              <span className="text-[11px] text-emerald-300">
                Stop eating before Fajr begins
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-400/20 backdrop-blur-md border border-amber-400/30 text-center">
              <span className="text-[11px] font-bold text-amber-200 uppercase tracking-wider block">
                Iftar Time (Maghrib)
              </span>
              <span className="text-xl sm:text-2xl font-extrabold text-amber-300 mt-0.5 block font-mono">
                {prayerData.maghrib}
              </span>
              <span className="text-[11px] text-amber-200/80">
                Break fast immediately at Adhan
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Feature Tabs */}
      <div className="flex items-center space-x-1.5 p-1 bg-zinc-100 dark:bg-zinc-850 rounded-2xl border border-zinc-200/80 dark:border-zinc-800">
        <button
          onClick={() => setActiveTab('fasting_duas')}
          className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'fasting_duas'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          <Heart className="w-4 h-4" />
          <span>Fasting Duas</span>
        </button>

        <button
          onClick={() => setActiveTab('tracker')}
          className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'tracker'
              ? 'bg-emerald-700 text-white shadow-sm'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Fasting Tracker (Coming Ramadan Dates)</span>
        </button>
      </div>

      {/* TAB 1: FASTING DUAS */}
      {activeTab === 'fasting_duas' && (
        <div className="space-y-3.5">
          <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-xs text-amber-900 dark:text-amber-300 flex items-center justify-between">
            <span className="font-semibold">
              Authentic supplications for Suhoor, Iftar, Laylat al-Qadr, and daily fasting.
            </span>
            <span className="font-bold shrink-0">6 Prophetic Prayers</span>
          </div>

          {FASTING_DUAS.map((dua) => (
            <div
              key={dua.id}
              className="p-5 rounded-2xl bg-white dark:bg-zinc-850 border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-3 hover:border-amber-300 dark:hover:border-amber-900 transition-all"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300">
                    {dua.tag} • {dua.timing}
                  </span>
                  <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100 mt-1.5">
                    {dua.title}
                  </h3>
                </div>

                <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium shrink-0 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-lg">
                  {dua.reference}
                </span>
              </div>

              {/* Arabic */}
              <p
                dir="rtl"
                className="text-xl sm:text-2xl font-arabic text-right leading-loose text-zinc-900 dark:text-zinc-100 font-semibold"
              >
                {dua.arabic}
              </p>

              {/* Transliteration */}
              <p className="text-xs text-emerald-800 dark:text-emerald-400 italic leading-relaxed font-serif">
                {dua.transliteration}
              </p>

              {/* Translation */}
              <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed font-normal">
                "{dua.translation}"
              </p>

              {/* Actions: Audio, Copy */}
              <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs">
                <button
                  onClick={() => audioService.speakArabicText(dua.arabic)}
                  className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 font-semibold"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>Listen Arabic Recitation</span>
                </button>

                <button
                  onClick={() => handleCopyDua(dua.title, dua.arabic, dua.translation, dua.reference)}
                  className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all flex items-center gap-1 text-xs"
                >
                  {copiedTitle === dua.title ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-600 font-bold">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Dua</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: FASTING TRACKER WITH COMING RAMADAN REAL DATES */}
      {activeTab === 'tracker' && (
        <div className="space-y-4">
          {/* Progress Overview Card */}
          <div className="p-5 bg-white dark:bg-zinc-850 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                  Coming Ramadan Schedule & Fasting Log
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Calculated from astronomical lunar calculations: <strong>{firstDayStr}</strong> through <strong>{lastDayStr}</strong>
                </p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-emerald-700 dark:text-emerald-400">
                  {fastedDays.length} / 30
                </span>
                <span className="text-[11px] block text-zinc-400 font-medium">Days Fasted</span>
              </div>
            </div>

            {/* Visual Progress Bar */}
            <div className="w-full h-2.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-600 to-teal-400 rounded-full transition-all duration-500"
                style={{ width: `${Math.round((fastedDays.length / 30) * 100)}%` }}
              />
            </div>

            {/* Quick Stats: Taraweeh, Ashras */}
            <div className="grid grid-cols-3 gap-2 pt-1 text-center text-xs">
              <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-800">
                <span className="text-zinc-400 text-[10px] block uppercase font-bold">1st Ashra (1-10)</span>
                <span className="text-emerald-700 dark:text-emerald-300 font-bold">Days of Mercy</span>
              </div>
              <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-800">
                <span className="text-zinc-400 text-[10px] block uppercase font-bold">2nd Ashra (11-20)</span>
                <span className="text-amber-700 dark:text-amber-300 font-bold">Days of Forgiveness</span>
              </div>
              <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-800">
                <span className="text-zinc-400 text-[10px] block uppercase font-bold">3rd Ashra (21-30)</span>
                <span className="text-rose-700 dark:text-rose-300 font-bold">Salvation from Fire</span>
              </div>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center space-x-1.5 text-xs">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                filterMode === 'all'
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
              }`}
            >
              All 30 Days
            </button>
            <button
              onClick={() => setFilterMode('last10')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1 ${
                filterMode === 'last10'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Blessed Last 10 Nights</span>
            </button>
            <button
              onClick={() => setFilterMode('fasted')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                filterMode === 'fasted'
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
              }`}
            >
              Fasted Days ({fastedDays.length})
            </button>
          </div>

          {/* 30 Days List with Actual Calendar Dates */}
          <div className="space-y-2">
            {filteredDays.map((day) => {
              const isFasted = fastedDays.includes(day.dayNumber);
              const isTaraweeh = taraweehDays.includes(day.dayNumber);

              return (
                <div
                  key={day.dayNumber}
                  className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                    isFasted
                      ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800/80 shadow-xs'
                      : 'bg-white dark:bg-zinc-850 border-zinc-200/80 dark:border-zinc-800'
                  } ${day.isOddNight ? 'ring-1 ring-amber-400/30' : ''}`}
                >
                  {/* Day Info & Gregorian Date */}
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-11 h-11 rounded-2xl flex flex-col items-center justify-center shrink-0 font-bold ${
                        isFasted
                          ? 'bg-emerald-700 text-white shadow-sm'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                      }`}
                    >
                      <span className="text-[10px] uppercase tracking-tighter opacity-80">Day</span>
                      <span className="text-sm font-black -mt-1">{day.dayNumber}</span>
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                          {day.dateFormatted}
                        </span>
                        {day.isOddNight && (
                          <span className="text-[10px] font-extrabold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-md flex items-center gap-1">
                            <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                            Laylat al-Qadr Odd Night
                          </span>
                        )}
                        {day.isToday && (
                          <span className="text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-1.5 py-0.5 rounded">
                            Today
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        {day.ashra} Ashra • Suhoor {prayerData.fajr} / Iftar {prayerData.maghrib}
                      </p>
                    </div>
                  </div>

                  {/* Actions: Fasted & Taraweeh Toggle Buttons */}
                  <div className="flex items-center space-x-2 shrink-0">
                    {/* Taraweeh toggle */}
                    <button
                      onClick={() => toggleDayTaraweeh(day.dayNumber)}
                      className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                        isTaraweeh
                          ? 'bg-teal-700 text-white border-teal-600 shadow-xs'
                          : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:border-teal-400'
                      }`}
                      title="Log Taraweeh prayer for this night"
                    >
                      {isTaraweeh ? '🕌 Taraweeh ✓' : '🕌 Taraweeh'}
                    </button>

                    {/* Fasted toggle */}
                    <button
                      onClick={() => toggleDayFasted(day.dayNumber)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 shadow-xs ${
                        isFasted
                          ? 'bg-emerald-700 text-white hover:bg-emerald-800'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-emerald-50 hover:text-emerald-700'
                      }`}
                    >
                      {isFasted ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Fasted</span>
                        </>
                      ) : (
                        <span>Mark Fasted</span>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Laylat al-Qadr Reminder Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-emerald-500/10 to-teal-500/20 border border-amber-400/40">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Laylat al-Qadr (The Night of Power)
            </h4>
            <p className="text-xs text-zinc-700 dark:text-zinc-300 mt-1 leading-relaxed">
              "The Night of Decree is better than a thousand months" (Surah Al-Qadr 97:3). Seek it in the odd nights of the last ten days: <strong>21st, 23rd, 25th, 27th, and 29th</strong> of Ramadan.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
