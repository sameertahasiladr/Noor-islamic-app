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
    { label: 'Quran', arabic: 'القرآن', icon: BookOpen, action: () => onNavigateTab('quran') },
    { label: 'Prayer', arabic: 'الصلاة', icon: Clock, action: () => onNavigateTab('prayer') },
    { label: 'Qibla', arabic: 'القبلة', icon: Compass, action: () => onNavigateExplore('qibla') },
    { label: 'Tasbih', arabic: 'التسبيح', icon: Sparkles, action: () => onNavigateExplore('tasbih') },
    { label: 'Duas', arabic: 'الأدعية', icon: Heart, action: () => onNavigateExplore('duas') },
    { label: 'Ramadan', arabic: 'رمضان', icon: Moon, action: () => onNavigateExplore('ramadan') },
  ];

  const gregorianFormatted = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date());

  return (
    <div className="space-y-5 pb-24 max-w-4xl mx-auto px-4 pt-2">
      {/* Date banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between px-1 text-xs">
        <div className="flex items-center space-x-2 text-[#4B5E54] dark:text-[#9EB2A7]">
          <span className="font-bold text-emerald-800 dark:text-emerald-400">
            {hijriDate.formatted}
          </span>
          <span className="text-[#C2CBC5] dark:text-emerald-900">•</span>
          <span className="font-medium text-[#5C6F66] dark:text-[#9EB2A7]">{gregorianFormatted}</span>
        </div>
        <div className="text-right mt-1 sm:mt-0 font-arabic text-sm font-bold text-emerald-800 dark:text-emerald-300">
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
        <div className="p-4 rounded-3xl bg-gradient-to-r from-[#064E3B] via-[#063B2D] to-[#04281E] text-white shadow-xl shadow-emerald-950/20 border border-emerald-600/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center shrink-0">
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
              <p className="text-xs text-emerald-200/80 truncate font-medium">
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
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 border border-white/10 transition-colors"
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

            {/* Stop button */}
            <button
              onClick={() => audioService.stop()}
              className="px-3.5 py-2 rounded-xl bg-rose-600/90 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
              title="Stop Quran recitation"
            >
              <Square className="w-3 h-3 fill-current" />
              <span>Stop</span>
            </button>

            {/* Open in Quran */}
            <button
              onClick={() => {
                onNavigateTab('quran');
                onSelectSurah(activeQuranAudio.surahNumber);
              }}
              className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-[#14241D] text-xs font-bold flex items-center gap-1 shadow transition-colors"
              title="Open Quran Reader"
            >
              <span>Open</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Quick Access Grid - Cohesive Emerald & Gold Theme */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#4B5E54] dark:text-[#9EB2A7]">
            Quick Access
          </h2>
          <button
            onClick={() => onNavigateTab('explore')}
            className="text-xs font-bold text-emerald-800 dark:text-emerald-400 flex items-center hover:underline"
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
                className="flex flex-col items-center p-3 rounded-2xl bg-white dark:bg-[#0D1E17] hover:bg-emerald-50/40 dark:hover:bg-[#122820] border border-[#E8E4DC] dark:border-emerald-900/30 transition-all hover:scale-[1.02] shadow-xs group"
              >
                <div
                  className="w-11 h-11 rounded-2xl bg-emerald-800 dark:bg-emerald-900/80 text-amber-300 flex items-center justify-center shadow-xs mb-2 group-hover:scale-105 group-hover:bg-emerald-700 transition-all border border-emerald-700/40"
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-[#14241D] dark:text-[#F4F3EC]">
                  {btn.label}
                </span>
                <span className="text-[10px] font-arabic text-[#5C6F66] dark:text-[#9EB2A7] group-hover:text-emerald-700 dark:group-hover:text-emerald-400">
                  {btn.arabic}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Quran Reading Progress Banner */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#0D1E17] border border-[#E8E4DC] dark:border-emerald-900/30 flex items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center space-x-3.5 min-w-0">
          <div className="w-12 h-12 rounded-2xl bg-emerald-800 dark:bg-emerald-950 text-amber-300 flex items-center justify-center shrink-0 shadow-sm border border-emerald-700/30">
            <BookOpen className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                Quran Journey
              </span>
              <span className="text-[10px] font-bold text-amber-900 dark:text-amber-300 bg-amber-100/90 dark:bg-amber-950/70 px-2 py-0.5 rounded-full border border-amber-300/40">
                {profile.quranProgress.percentage}%
              </span>
            </div>
            <p className="text-xs sm:text-sm font-bold text-[#14241D] dark:text-[#F4F3EC] mt-0.5 truncate">
              {profile.quranProgress.completedSurahs.length} of 114 Surahs completed
            </p>
            <p className="text-[11px] text-[#5C6F66] dark:text-[#9EB2A7] truncate">
              Last read: Surah {profile.quranProgress.lastReadSurah}, Ayah {profile.quranProgress.lastReadAyah}
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            onNavigateTab('quran');
            onSelectSurah(profile.quranProgress.lastReadSurah);
          }}
          className="shrink-0 px-4 py-2.5 rounded-2xl bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold shadow transition-all hover:scale-105 active:scale-95 border border-emerald-700/40"
        >
          Continue
        </button>
      </div>

      {/* Daily Islamic Content */}
      <div className="space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-[#4B5E54] dark:text-[#9EB2A7] px-1">
          Daily Spiritual Nourishment
        </h2>

        {/* 1. Verse of the Day */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#0D1E17] border border-[#E8E4DC] dark:border-emerald-900/30 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="inline-flex items-center text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400 gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Verse of the Day • آية اليوم
            </span>
            <span className="text-xs font-semibold text-[#5C6F66] dark:text-[#9EB2A7]">
              Surah Al-Baqarah (2:286)
            </span>
          </div>

          <p className="text-xl sm:text-2xl font-quran text-right leading-loose text-[#14241D] dark:text-[#F4F3EC] my-3 font-semibold">
            لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا ۚ لَهَا مَا كَسَبَتْ وَعَلَيْهَا مَا اكْتَسَبَتْ
          </p>

          <p className="text-xs text-emerald-800 dark:text-emerald-400 italic mb-2 font-medium">
            Lā yukallifullāhu nafsan illā wus\'ahā, lahā mā kasabat wa \'alayhā maktasabat
          </p>

          <p className="text-sm text-[#3A4B43] dark:text-[#C5D3CB] leading-relaxed font-normal">
            "Allah does not charge a soul except [with that within] its capacity. It will have [the consequence of] what [good] it has gained, and it will bear [the consequence of] what [evil] it has earned."
          </p>

          <div className="mt-4 pt-3 border-t border-[#F0EBE1] dark:border-emerald-950/60 flex items-center justify-between text-xs">
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
              className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-400 hover:text-emerald-900 font-bold"
            >
              <Volume2 className={`w-3.5 h-3.5 ${activeQuranAudio?.surahNumber === 2 && activeQuranAudio?.ayahNumber === 286 && !activeQuranAudio.isPaused ? 'animate-pulse text-amber-500' : 'text-emerald-700 dark:text-emerald-400'}`} />
              <span>
                {activeQuranAudio?.surahNumber === 2 && activeQuranAudio?.ayahNumber === 286 && !activeQuranAudio.isPaused
                  ? 'Playing Recitation...'
                  : 'Listen Recitation'}
              </span>
            </button>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => handleCopy('لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا - Surah Al-Baqarah (2:286)', 'verse_day')}
                className="p-2 rounded-xl text-[#5C6F66] hover:text-[#14241D] dark:hover:text-[#F4F3EC] hover:bg-emerald-900/5 dark:hover:bg-emerald-950/60 transition-colors"
                title="Copy Verse"
              >
                {copiedId === 'verse_day' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
              <button
                onClick={() => handleShare('Verse of the Day', 'Allah does not charge a soul except [with that within] its capacity. (Surah Al-Baqarah 2:286)')}
                className="p-2 rounded-xl text-[#5C6F66] hover:text-[#14241D] dark:hover:text-[#F4F3EC] hover:bg-emerald-900/5 dark:hover:bg-emerald-950/60 transition-colors"
                title="Share Verse"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* 2. Hadith of the Day */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#0D1E17] border border-[#E8E4DC] dark:border-emerald-900/30 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="inline-flex items-center text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400 gap-1.5">
              <Award className="w-3.5 h-3.5 text-amber-500" />
              Hadith of the Day • حديث اليوم
            </span>
            <span className="text-xs font-semibold text-[#5C6F66] dark:text-[#9EB2A7]">
              Sahih al-Bukhari 6011
            </span>
          </div>

          <p className="text-lg font-arabic text-right leading-loose text-[#14241D] dark:text-[#F4F3EC] my-2 font-semibold">
            مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ
          </p>

          <p className="text-sm text-[#3A4B43] dark:text-[#C5D3CB] leading-relaxed font-normal">
            "Whoever believes in Allah and the Last Day should speak what is good or remain silent."
          </p>
          <p className="text-xs text-[#5C6F66] dark:text-[#9EB2A7] mt-1 font-medium">Narrated by Abu Hurairah (may Allah be pleased with him)</p>

          <div className="mt-4 pt-3 border-t border-[#F0EBE1] dark:border-emerald-950/60 flex items-center justify-between text-xs">
            <span className="text-[11px] text-[#5C6F66] dark:text-[#9EB2A7] font-medium">Collection: Sahih al-Bukhari</span>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => handleCopy('Whoever believes in Allah and the Last Day should speak what is good or remain silent. (Sahih al-Bukhari 6011)', 'hadith_day')}
                className="p-2 rounded-xl text-[#5C6F66] hover:text-[#14241D] dark:hover:text-[#F4F3EC] hover:bg-emerald-900/5 dark:hover:bg-emerald-950/60 transition-colors"
              >
                {copiedId === 'hadith_day' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
              <button
                onClick={() => handleShare('Hadith of the Day', 'Whoever believes in Allah and the Last Day should speak what is good or remain silent. - Sahih al-Bukhari 6011')}
                className="p-2 rounded-xl text-[#5C6F66] hover:text-[#14241D] dark:hover:text-[#F4F3EC] hover:bg-emerald-900/5 dark:hover:bg-emerald-950/60 transition-colors"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* 3. Daily Dua */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#0D1E17] border border-[#E8E4DC] dark:border-emerald-900/30 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="inline-flex items-center text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400 gap-1.5">
              <Heart className="w-3.5 h-3.5 text-amber-500" />
              Daily Dua • دعاء اليوم
            </span>
            <span className="text-xs font-semibold text-[#5C6F66] dark:text-[#9EB2A7]">
              Surah Taha (20:114)
            </span>
          </div>

          <p className="text-xl font-arabic text-right leading-loose text-[#14241D] dark:text-[#F4F3EC] my-2 font-semibold">
            رَّبِّ زِدْنِي عِلْمًا
          </p>
          <p className="text-xs text-emerald-800 dark:text-emerald-400 italic mb-1 font-medium">
            Rabbi zidnī \'ilmā
          </p>
          <p className="text-sm text-[#3A4B43] dark:text-[#C5D3CB] leading-relaxed font-normal">
            "My Lord, increase me in beneficial knowledge."
          </p>

          <div className="mt-4 pt-3 border-t border-[#F0EBE1] dark:border-emerald-950/60 flex items-center justify-between text-xs">
            <button
              onClick={() => {
                if (isSpeakingArabic && speakingText === 'رب زدني علما') {
                  audioService.stopSpeakingArabic();
                } else {
                  audioService.speakArabicText('رب زدني علما');
                }
              }}
              className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-400 hover:text-emerald-900 font-bold"
            >
              <Volume2 className={`w-3.5 h-3.5 ${isSpeakingArabic && speakingText === 'رب زدني علما' ? 'animate-pulse text-amber-500' : 'text-emerald-700 dark:text-emerald-400'}`} />
              <span>
                {isSpeakingArabic && speakingText === 'رب زدني علما' ? 'Playing Audio...' : 'Listen Audio'}
              </span>
            </button>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => handleCopy('رَّبِّ زِدْنِي عِلْمًا - "My Lord, increase me in knowledge."', 'dua_day')}
                className="p-2 rounded-xl text-[#5C6F66] hover:text-[#14241D] dark:hover:text-[#F4F3EC] hover:bg-emerald-900/5 dark:hover:bg-emerald-950/60 transition-colors"
              >
                {copiedId === 'dua_day' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
              <button
                onClick={() => handleShare('Daily Dua', 'Rabbi zidni ilma - My Lord, increase me in knowledge. (Surah Taha 20:114)')}
                className="p-2 rounded-xl text-[#5C6F66] hover:text-[#14241D] dark:hover:text-[#F4F3EC] hover:bg-emerald-900/5 dark:hover:bg-emerald-950/60 transition-colors"
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
