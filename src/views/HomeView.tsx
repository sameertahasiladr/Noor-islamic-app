import React, { useState, useEffect } from 'react';
import { BookOpen, Clock, Compass, Heart, Moon, Volume2, Share2, Copy, Check, Sparkles, ChevronRight, Award, Play, Pause, Square } from 'lucide-react';
import { AppTab, ExploreFeature, HijriDate, PrayerTimeData, UserProfile } from '../types';
import { PrayerCard } from '../components/PrayerCard';
import { audioService, ActiveQuranPlayback } from '../services/audioService';

interface HomeViewProps {
  profile: UserProfile;
  prayerData: PrayerTimeData;
  hijriDate: HijriDate;
  onNavigateTab: (tab: AppTab) => void;
  onNavigateExplore: (feature: ExploreFeature) => void;
  onSelectSurah: (surahNumber: number) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  profile,
  prayerData,
  hijriDate,
  onNavigateTab,
  onNavigateExplore,
  onSelectSurah,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeQuranAudio, setActiveQuranAudio] = useState<ActiveQuranPlayback | null>(null);
  const [isSpeakingArabic, setIsSpeakingArabic] = useState<boolean>(false);
  const [speakingText, setSpeakingText] = useState<string | null>(null);

  useEffect(() => {
    const unsubPlayback = audioService.subscribe((state) => {
      setActiveQuranAudio(state);
    });
    const unsubSpeaking = audioService.subscribeSpeaking((speaking, text) => {
      setIsSpeakingArabic(speaking);
      setSpeakingText(text);
    });

    return () => {
      unsubPlayback();
      unsubSpeaking();
    };
  }, []);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleShare = (title: string, text: string) => {
    if (navigator.share) {
      navigator.share({ title, text }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`${title}\n\n${text}\n\nShared via Noor App`);
      alert('Copied to clipboard for sharing!');
    }
  };

  const quickAccessButtons = [
    { label: 'Quran', arabic: 'القرآن', icon: BookOpen, action: () => onNavigateTab('quran'), color: 'from-emerald-600 to-emerald-700' },
    { label: 'Prayer', arabic: 'الصلاة', icon: Clock, action: () => onNavigateTab('prayer'), color: 'from-teal-600 to-teal-700' },
    { label: 'Qibla', arabic: 'القبلة', icon: Compass, action: () => onNavigateExplore('qibla'), color: 'from-amber-600 to-amber-700' },
    { label: 'Tasbih', arabic: 'التسبيح', icon: Sparkles, action: () => onNavigateExplore('tasbih'), color: 'from-emerald-700 to-teal-800' },
    { label: 'Duas', arabic: 'الأدعية', icon: Heart, action: () => onNavigateExplore('duas'), color: 'from-rose-600 to-rose-700' },
    { label: 'Ramadan', arabic: 'رمضان', icon: Moon, action: () => onNavigateExplore('ramadan'), color: 'from-indigo-600 to-indigo-700' },
  ];

  const gregorianFormatted = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date());

  return (
    <div className="space-y-5 pb-20 max-w-4xl mx-auto px-4 pt-2">
      {/* Date banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between px-1 text-xs">
        <div className="flex items-center space-x-2 text-zinc-600 dark:text-zinc-300">
          <span className="font-semibold text-emerald-800 dark:text-emerald-400">
            {hijriDate.formatted}
          </span>
          <span>•</span>
          <span className="text-zinc-500">{gregorianFormatted}</span>
        </div>
        <div className="text-right mt-0.5 sm:mt-0 font-arabic text-sm font-semibold text-emerald-800 dark:text-emerald-300">
          {hijriDate.formattedArabic}
        </div>
      </div>

      {/* Hero Prayer Card with live countdown */}
      <PrayerCard
        prayerData={prayerData}
        onViewFullTimes={() => onNavigateTab('prayer')}
      />

      {/* Background Quran Recitation Player on Home Screen */}
      {activeQuranAudio && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-950 text-white shadow-lg border border-emerald-600/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-emerald-700/80 border border-emerald-500/30 flex items-center justify-center shrink-0 shadow-inner">
              <Volume2 className={`w-5 h-5 text-amber-300 ${!activeQuranAudio.isPaused ? 'animate-pulse' : ''}`} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  {activeQuranAudio.isPaused ? 'Recitation Paused' : 'Playing in Background'}
                </span>
                {activeQuranAudio.surahArabicName && (
                  <span className="font-arabic text-sm text-emerald-200">
                    {activeQuranAudio.surahArabicName}
                  </span>
                )}
              </div>
              <h4 className="text-sm font-bold text-white truncate mt-0.5">
                Surah {activeQuranAudio.surahNumber}. {activeQuranAudio.surahName || 'Quran'} • Ayah {activeQuranAudio.ayahNumber}
                {activeQuranAudio.totalAyahs ? ` of ${activeQuranAudio.totalAyahs}` : ''}
              </h4>
              <p className="text-xs text-emerald-200/80 truncate">
                Mishary Rashid Alafasy recitation
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 self-end sm:self-auto shrink-0">
            {/* Pause / Resume */}
            <button
              onClick={() => {
                if (activeQuranAudio.isPaused) {
                  audioService.resume();
                } else {
                  audioService.pause();
                }
              }}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 border border-white/10 transition-colors"
              title={activeQuranAudio.isPaused ? 'Resume recitation' : 'Pause recitation'}
            >
              {activeQuranAudio.isPaused ? (
                <>
                  <Play className="w-3.5 h-3.5 fill-current text-amber-300" />
                  <span>Resume</span>
                </>
              ) : (
                <>
                  <Pause className="w-3.5 h-3.5 text-white" />
                  <span>Pause</span>
                </>
              )}
            </button>

            {/* Stop button - immediately stops background Quran playback */}
            <button
              onClick={() => audioService.stop()}
              className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
              title="Stop Quran recitation"
            >
              <Square className="w-3 h-3 fill-current" />
              <span>Stop Audio</span>
            </button>

            {/* Open in Quran */}
            <button
              onClick={() => {
                onNavigateTab('quran');
                onSelectSurah(activeQuranAudio.surahNumber);
              }}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1 transition-colors"
              title="Open Quran Reader"
            >
              <span>Open</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Quick Access Grid */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Quick Access
          </h2>
          <button
            onClick={() => onNavigateTab('explore')}
            className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center hover:underline"
          >
            All 12 Features <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
          {quickAccessButtons.map((btn) => {
            const Icon = btn.icon;
            return (
              <button
                key={btn.label}
                onClick={btn.action}
                className="flex flex-col items-center p-3 rounded-2xl bg-white dark:bg-zinc-850 hover:bg-emerald-50/50 dark:hover:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-800 transition-all hover:scale-[1.02] shadow-sm group"
              >
                <div
                  className={`w-10 h-10 rounded-xl bg-gradient-to-br ${btn.color} text-white flex items-center justify-center shadow-md mb-2 group-hover:rotate-3 transition-transform`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-zinc-800 dark:text-zinc-100">
                  {btn.label}
                </span>
                <span className="text-[10px] font-arabic text-zinc-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                  {btn.arabic}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Quran Reading Progress Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-100/70 dark:from-emerald-950/40 dark:via-zinc-900 dark:to-emerald-900/30 border border-emerald-200/80 dark:border-emerald-800/40 flex items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-700 text-amber-300 flex items-center justify-center shrink-0 shadow-md">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                Quran Journey
              </span>
              <span className="text-[11px] font-semibold text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/80 px-1.5 py-0.2 rounded">
                {profile.quranProgress.percentage}%
              </span>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-zinc-800 dark:text-zinc-200">
              You have completed {profile.quranProgress.percentage}% of your Quran reading journey.
            </p>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              Last read: Surah {profile.quranProgress.lastReadSurah}, Ayah {profile.quranProgress.lastReadAyah}
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            onNavigateTab('quran');
            onSelectSurah(profile.quranProgress.lastReadSurah);
          }}
          className="shrink-0 px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow transition-all hover:scale-105"
        >
          Continue
        </button>
      </div>

      {/* Daily Islamic Content */}
      <div className="space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 px-1">
          Daily Islamic Spiritual Nourishment
        </h2>

        {/* 1. Verse of the Day */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-zinc-850 border border-zinc-200/80 dark:border-zinc-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="inline-flex items-center text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Verse of the Day • آية اليوم
            </span>
            <span className="text-xs font-semibold text-zinc-500">
              Surah Al-Baqarah (2:286)
            </span>
          </div>

          <p className="text-xl sm:text-2xl font-quran text-right leading-loose text-zinc-900 dark:text-zinc-100 my-2">
            لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا ۚ لَهَا مَا كَسَبَتْ وَعَلَيْهَا مَا اكْتَسَبَتْ
          </p>

          <p className="text-xs text-emerald-700 dark:text-emerald-400 italic mb-2">
            Lā yukallifullāhu nafsan illā wus\'ahā, lahā mā kasabat wa \'alayhā maktasabat
          </p>

          <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed font-normal">
            "Allah does not charge a soul except [with that within] its capacity. It will have [the consequence of] what [good] it has gained, and it will bear [the consequence of] what [evil] it has earned."
          </p>

          <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs">
            <button
              onClick={() => {
                if (activeQuranAudio?.surahNumber === 2 && activeQuranAudio?.ayahNumber === 286 && !activeQuranAudio.isPaused) {
                  audioService.stop();
                } else {
                  audioService.playAyah(2, 286, {
                    surahName: 'Al-Baqarah',
                    surahArabicName: 'البقرة',
                    totalAyahs: 286,
                  });
                }
              }}
              className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 font-semibold"
            >
              <Volume2 className={`w-3.5 h-3.5 ${activeQuranAudio?.surahNumber === 2 && activeQuranAudio?.ayahNumber === 286 && !activeQuranAudio.isPaused ? 'animate-pulse text-emerald-600' : ''}`} />
              <span>
                {activeQuranAudio?.surahNumber === 2 && activeQuranAudio?.ayahNumber === 286 && !activeQuranAudio.isPaused
                  ? 'Playing Recitation...'
                  : 'Listen Recitation'}
              </span>
            </button>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleCopy('لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا - Surah Al-Baqarah (2:286)', 'verse_day')}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
                title="Copy Verse"
              >
                {copiedId === 'verse_day' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>
              <button
                onClick={() => handleShare('Verse of the Day', 'Allah does not charge a soul except [with that within] its capacity. (Surah Al-Baqarah 2:286)')}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
                title="Share Verse"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* 2. Hadith of the Day */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-zinc-850 border border-zinc-200/80 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="inline-flex items-center text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 gap-1.5">
              <Award className="w-3.5 h-3.5 text-amber-500" />
              Hadith of the Day • حديث اليوم
            </span>
            <span className="text-xs font-semibold text-zinc-500">
              Sahih al-Bukhari 6011
            </span>
          </div>

          <p className="text-lg font-arabic text-right leading-loose text-zinc-900 dark:text-zinc-100 my-1">
            مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ
          </p>

          <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed font-normal">
            "Whoever believes in Allah and the Last Day should speak what is good or remain silent."
          </p>
          <p className="text-xs text-zinc-400 mt-1">Narrated by Abu Hurairah (may Allah be pleased with him)</p>

          <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs">
            <span className="text-[11px] text-zinc-400 font-medium">Collection: Sahih al-Bukhari</span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleCopy('Whoever believes in Allah and the Last Day should speak what is good or remain silent. (Sahih al-Bukhari 6011)', 'hadith_day')}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
              >
                {copiedId === 'hadith_day' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>
              <button
                onClick={() => handleShare('Hadith of the Day', 'Whoever believes in Allah and the Last Day should speak what is good or remain silent. - Sahih al-Bukhari 6011')}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* 3. Daily Dua */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-zinc-850 border border-zinc-200/80 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="inline-flex items-center text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400 gap-1.5">
              <Heart className="w-3.5 h-3.5 text-rose-500" />
              Daily Dua • دعاء اليوم
            </span>
            <span className="text-xs font-semibold text-zinc-500">
              Surah Taha (20:114)
            </span>
          </div>

          <p className="text-xl font-arabic text-right leading-loose text-zinc-900 dark:text-zinc-100 my-1">
            رَّبِّ زِدْنِي عِلْمًا
          </p>
          <p className="text-xs text-rose-700 dark:text-rose-400 italic mb-1">
            Rabbi zidnī \'ilmā
          </p>
          <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed font-normal">
            "My Lord, increase me in beneficial knowledge."
          </p>

          <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs">
            <button
              onClick={() => {
                if (isSpeakingArabic && speakingText === 'رب زدني علما') {
                  audioService.stopSpeakingArabic();
                } else {
                  audioService.speakArabicText('رب زدني علما');
                }
              }}
              className="flex items-center gap-1.5 text-rose-700 dark:text-rose-400 hover:text-rose-800 font-semibold"
            >
              <Volume2 className={`w-3.5 h-3.5 ${isSpeakingArabic && speakingText === 'رب زدني علما' ? 'animate-pulse text-rose-600' : ''}`} />
              <span>
                {isSpeakingArabic && speakingText === 'رب زدني علما' ? 'Playing Audio...' : 'Listen'}
              </span>
            </button>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleCopy('رَّبِّ زِدْنِي عِلْمًا - "My Lord, increase me in knowledge."', 'dua_day')}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
              >
                {copiedId === 'dua_day' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>
              <button
                onClick={() => handleShare('Daily Dua', 'Rabbi zidni ilma - My Lord, increase me in knowledge. (Surah Taha 20:114)')}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
