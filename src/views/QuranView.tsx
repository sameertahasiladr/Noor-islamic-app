import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Search,
  BookOpen,
  Bookmark,
  Play,
  Pause,
  Copy,
  Share2,
  Check,
  Layers,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';
import { ALL_SURAHS, fetchSurahDetail } from '../data/surahs';
import { JUZ_LIST } from '../data/juzData';
import { SurahDetail, Ayah, UserProfile } from '../types';
import { storageService } from '../services/storageService';
import { audioService } from '../services/audioService';

interface QuranViewProps {
  profile: UserProfile;
  initialSurahNumber?: number;
  onSelectSurah: (surahNumber: number) => void;
  onUpdateProfile: (p: UserProfile) => void;
}

export const QuranView: React.FC<QuranViewProps> = ({
  profile,
  initialSurahNumber = 1,
  onSelectSurah,
  onUpdateProfile,
}) => {
  const [activeTab, setActiveTab] = useState<'surahs' | 'juz' | 'bookmarks'>('surahs');
  const [activeView, setActiveView] = useState<'catalog' | 'reader'>('catalog');
  const [currentSurahNumber, setCurrentSurahNumber] = useState<number>(initialSurahNumber);
  const [surahDetail, setSurahDetail] = useState<SurahDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [revelationFilter, setRevelationFilter] = useState<'All' | 'Meccan' | 'Medinan'>('All');
  const [activePlayingAyah, setActivePlayingAyah] = useState<number | null>(null);
  const [copiedAyah, setCopiedAyah] = useState<number | null>(null);
  const [targetAyahToScroll, setTargetAyahToScroll] = useState<number | null>(null);

  // Settings
  const [showTransliteration, setShowTransliteration] = useState<boolean>(
    profile.showTransliteration !== false
  );
  const [fontSize, setFontSize] = useState<'sm' | 'md' | 'lg' | 'xl'>(
    profile.arabicFontSize || 'lg'
  );

  const loadSurah = async (num: number, targetAyah?: number) => {
    setLoading(true);
    setCurrentSurahNumber(num);
    try {
      const data = await fetchSurahDetail(num);
      setSurahDetail(data);

      // Track last read
      storageService.updateQuranProgress(num, targetAyah || 1);
      onUpdateProfile(storageService.getProfile());

      if (targetAyah) {
        setTargetAyahToScroll(targetAyah);
      }
    } catch (err) {
      console.error('Failed to load Surah', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialSurahNumber) {
      setCurrentSurahNumber(initialSurahNumber);
    }
  }, [initialSurahNumber]);

  useEffect(() => {
    if (targetAyahToScroll && surahDetail) {
      const timer = setTimeout(() => {
        const el = document.getElementById(`ayah-${targetAyahToScroll}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        setTargetAyahToScroll(null);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [targetAyahToScroll, surahDetail]);

  useEffect(() => {
    const unsub = audioService.subscribe((state) => {
      if (state && state.surahNumber === currentSurahNumber && state.isPlaying) {
        setActivePlayingAyah(state.ayahNumber);
      } else if (!state || !state.isPlaying) {
        setActivePlayingAyah(null);
      }
    });
    return unsub;
  }, [currentSurahNumber]);

  const handleOpenSurah = (num: number, ayahNum?: number) => {
    onSelectSurah(num);
    loadSurah(num, ayahNum);
    setActiveView('reader');
  };

  const handleOpenJuz = (juzNumber: number) => {
    const juz = JUZ_LIST.find((j) => j.number === juzNumber);
    if (juz) {
      handleOpenSurah(juz.startSurahNumber, juz.startAyahNumber);
    }
  };

  const handleNextSurah = () => {
    if (currentSurahNumber < 114) {
      handleOpenSurah(currentSurahNumber + 1);
    }
  };

  const handlePrevSurah = () => {
    if (currentSurahNumber > 1) {
      handleOpenSurah(currentSurahNumber - 1);
    }
  };

  const handlePlayAyah = (ayahNum: number) => {
    if (!surahDetail) return;
    if (activePlayingAyah === ayahNum && audioService.isPlaying(surahDetail.number, ayahNum)) {
      audioService.stop();
      setActivePlayingAyah(null);
      return;
    }

    setActivePlayingAyah(ayahNum);
    audioService.playAyah(
      surahDetail.number,
      ayahNum,
      {
        surahName: surahDetail.englishName,
        surahArabicName: surahDetail.name,
        totalAyahs: surahDetail.numberOfAyahs,
      },
      () => {
        // Automatically play next ayah in surah if available
        if (ayahNum < surahDetail.numberOfAyahs) {
          handlePlayAyah(ayahNum + 1);
        } else {
          setActivePlayingAyah(null);
        }
      },
      () => {
        setActivePlayingAyah(null);
      }
    );
  };

  const handleToggleBookmark = (ayah: Ayah) => {
    if (!surahDetail) return;
    const isBookmarked = storageService.isAyahBookmarked(surahDetail.number, ayah.numberInSurah);
    if (isBookmarked) {
      const bms = profile.bookmarks.filter(
        (b) => !(b.surahNumber === surahDetail.number && b.ayahNumber === ayah.numberInSurah)
      );
      profile.bookmarks = bms;
      storageService.saveProfile(profile);
    } else {
      storageService.addBookmark({
        surahNumber: surahDetail.number,
        surahName: surahDetail.englishName,
        ayahNumber: ayah.numberInSurah,
        arabicText: ayah.arabicText,
        translation: ayah.translation,
      });
    }
    onUpdateProfile(storageService.getProfile());
  };

  const handleCopyAyah = (ayah: Ayah) => {
    if (!surahDetail) return;
    const text = `${ayah.arabicText}\n\n"${ayah.translation}"\n- [Surah ${surahDetail.englishName} ${surahDetail.number}:${ayah.numberInSurah}]`;
    navigator.clipboard.writeText(text);
    setCopiedAyah(ayah.numberInSurah);
    setTimeout(() => setCopiedAyah(null), 2000);
  };

  const handleShareAyah = (ayah: Ayah) => {
    if (!surahDetail) return;
    const text = `${ayah.arabicText}\n\n"${ayah.translation}"\n- [Surah ${surahDetail.englishName} ${surahDetail.number}:${ayah.numberInSurah}]\nVia Noor App`;
    if (navigator.share) {
      navigator.share({ title: `Surah ${surahDetail.englishName}`, text }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
      setCopiedAyah(ayah.numberInSurah);
      setTimeout(() => setCopiedAyah(null), 2000);
    }
  };

  const filteredSurahs = ALL_SURAHS.filter((s) => {
    const matchesSearch =
      s.englishName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.englishNameTranslation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.name.includes(searchQuery) ||
      String(s.number) === searchQuery.trim();

    const matchesFilter =
      revelationFilter === 'All' || s.revelationType === revelationFilter;

    return matchesSearch && matchesFilter;
  });

  const filteredJuz = JUZ_LIST.filter((j) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      String(j.number) === q ||
      j.nameTransliteration.toLowerCase().includes(q) ||
      j.nameEnglish.toLowerCase().includes(q) ||
      j.nameArabic.includes(q) ||
      j.startSurahName.toLowerCase().includes(q) ||
      j.endSurahName.toLowerCase().includes(q)
    );
  });

  const getFontSizeClass = () => {
    switch (fontSize) {
      case 'sm':
        return 'text-lg leading-loose';
      case 'md':
        return 'text-xl leading-loose';
      case 'xl':
        return 'text-3xl leading-loose';
      default:
        return 'text-2xl leading-loose';
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 pb-20 pt-2 space-y-4">
      {/* Quran Header and Progress Banner */}
      {activeView === 'catalog' && (
        <div className="space-y-4">
          {/* Progress bar card */}
          <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 text-white shadow-xl relative overflow-hidden border border-emerald-800/60">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-emerald-200 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-amber-300" />
                The Holy Quran • القرآن الكريم
              </span>
              <span className="text-xs font-bold text-amber-300">
                {profile.quranProgress.percentage}% Read
              </span>
            </div>
            <p className="text-sm sm:text-base font-bold text-zinc-100">
              Complete 114 Surahs & 30 Juz with authentic verse-by-verse recitation
            </p>
            {/* Progress bar */}
            <div className="w-full h-2 bg-white/20 rounded-full mt-3 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-amber-200 rounded-full transition-all duration-500"
                style={{ width: `${profile.quranProgress.percentage}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-emerald-200/80 mt-2">
              <span>{profile.quranProgress.completedSurahs.length} of 114 Surahs marked finished</span>
              <button
                onClick={() => handleOpenSurah(profile.quranProgress.lastReadSurah || 1, profile.quranProgress.lastReadAyah || 1)}
                className="font-bold text-amber-300 hover:text-white underline"
              >
                Resume Surah {profile.quranProgress.lastReadSurah || 1}
              </button>
            </div>
          </div>

          {/* Navigation Mode Tabs: Surahs (114) vs 30 Juz vs Bookmarks */}
          <div className="flex items-center space-x-1.5 p-1 bg-zinc-100 dark:bg-zinc-850 rounded-2xl border border-zinc-200/80 dark:border-zinc-800">
            <button
              onClick={() => setActiveTab('surahs')}
              className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'surahs'
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Surahs (114)</span>
            </button>

            <button
              onClick={() => setActiveTab('juz')}
              className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'juz'
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>30 Juz (Para)</span>
            </button>

            <button
              onClick={() => setActiveTab('bookmarks')}
              className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'bookmarks'
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              <Bookmark className="w-4 h-4" />
              <span>Bookmarks ({profile.bookmarks?.length || 0})</span>
            </button>
          </div>

          {/* Search bar */}
          {activeTab !== 'bookmarks' && (
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={
                    activeTab === 'surahs'
                      ? 'Search Surah by name, translation, or number (1-114)...'
                      : 'Search Juz / Para by number (1-30), name, or starting Surah...'
                  }
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-800 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:text-zinc-100 placeholder:text-zinc-400 shadow-sm"
                />
              </div>

              {activeTab === 'surahs' && (
                <div className="flex items-center space-x-1 bg-white dark:bg-zinc-850 p-1 rounded-xl border border-zinc-200 dark:border-zinc-800 shrink-0">
                  {(['All', 'Meccan', 'Medinan'] as const).map((rev) => (
                    <button
                      key={rev}
                      onClick={() => setRevelationFilter(rev)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        revelationFilter === rev
                          ? 'bg-emerald-700 text-white shadow-sm'
                          : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
                      }`}
                    >
                      {rev}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 1: 114 SURAHS LIST */}
          {activeTab === 'surahs' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {filteredSurahs.map((surah) => {
                const isCompleted = profile.quranProgress.completedSurahs.includes(surah.number);

                return (
                  <button
                    key={surah.number}
                    onClick={() => handleOpenSurah(surah.number)}
                    className="p-3.5 rounded-2xl bg-white dark:bg-zinc-850 hover:bg-emerald-50/50 dark:hover:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-800 text-left transition-all hover:scale-[1.01] shadow-sm flex items-center justify-between group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100/70 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 font-bold text-xs flex items-center justify-center shrink-0 group-hover:bg-emerald-700 group-hover:text-white transition-colors">
                        {surah.number}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-400">
                            {surah.englishName}
                          </span>
                          {isCompleted && (
                            <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[9px]">
                              ✓
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                          {surah.englishNameTranslation} • {surah.numberOfAyahs} verses
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-lg font-arabic font-bold text-emerald-800 dark:text-emerald-300 block">
                        {surah.name}
                      </span>
                      <span className="text-[10px] uppercase tracking-wider text-zinc-400">
                        {surah.revelationType}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* TAB 2: COMPLETE 30 JUZ (PARAS) */}
          {activeTab === 'juz' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredJuz.map((juz) => (
                <button
                  key={juz.number}
                  onClick={() => handleOpenJuz(juz.number)}
                  className="p-4 rounded-2xl bg-white dark:bg-zinc-850 hover:bg-emerald-50/50 dark:hover:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-800 text-left transition-all hover:scale-[1.01] shadow-sm flex items-center justify-between group"
                >
                  <div className="flex items-center space-x-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-bold text-sm flex items-center justify-center shrink-0 group-hover:bg-emerald-700 group-hover:text-white transition-colors shadow-xs">
                      {juz.number}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-400">
                          Juz {juz.number} • {juz.nameTransliteration}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                        {juz.startSurahName} ({juz.startAyahNumber}) → {juz.endSurahName} ({juz.endAyahNumber})
                      </p>
                      <span className="inline-block mt-1 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md">
                        {juz.totalAyahs} Verses
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xl font-arabic font-bold text-emerald-800 dark:text-emerald-300 block">
                      {juz.nameArabic}
                    </span>
                    <span className="text-[10px] text-zinc-400 flex items-center gap-0.5 justify-end mt-1 group-hover:text-emerald-600">
                      Read Juz <ArrowUpRight className="w-3 h-3" />
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* TAB 3: BOOKMARKS */}
          {activeTab === 'bookmarks' && (
            <div className="space-y-3">
              {(!profile.bookmarks || profile.bookmarks.length === 0) ? (
                <div className="p-10 text-center bg-white dark:bg-zinc-850 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                  <Bookmark className="w-10 h-10 text-zinc-300 dark:text-zinc-600 mx-auto mb-2" />
                  <p className="text-sm font-bold text-zinc-700 dark:text-zinc-300">No Bookmarked Ayahs</p>
                  <p className="text-xs text-zinc-400 mt-1">Tap the bookmark icon on any ayah while reading to save it here for quick access.</p>
                </div>
              ) : (
                profile.bookmarks.map((bm) => (
                  <div
                    key={bm.id}
                    className="p-4 rounded-2xl bg-white dark:bg-zinc-850 border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-2 hover:border-emerald-300 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                        Surah {bm.surahName} ({bm.surahNumber}:{bm.ayahNumber})
                      </span>
                      <button
                        onClick={() => handleOpenSurah(bm.surahNumber, bm.ayahNumber)}
                        className="px-3 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold flex items-center gap-1 shadow-xs"
                      >
                        <span>Open Ayah</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p dir="rtl" className="text-lg font-quran text-right text-zinc-900 dark:text-zinc-100">
                      {bm.arabicText}
                    </p>
                    <p className="text-xs text-zinc-600 dark:text-zinc-300 italic">
                      "{bm.translation || (bm as any).translationText}"
                    </p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* SURAH READER VIEW */}
      {activeView === 'reader' && (
        <div className="space-y-4">
          {/* Top navigation controls */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-zinc-850 border border-zinc-200/80 dark:border-zinc-800 shadow-sm sticky top-14 z-20 backdrop-blur-md">
            <button
              onClick={() => {
                setActiveView('catalog');
              }}
              className="flex items-center text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 p-1 rounded-lg"
            >
              <ChevronLeft className="w-4 h-4 mr-0.5" />
              <span>Index / 30 Juz</span>
            </button>

            {/* Prev / Next Surah Quick Controls */}
            <div className="flex items-center space-x-1">
              <button
                disabled={currentSurahNumber <= 1}
                onClick={handlePrevSurah}
                className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-40"
                title="Previous Surah"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 px-1">
                {currentSurahNumber} / 114
              </span>

              <button
                disabled={currentSurahNumber >= 114}
                onClick={handleNextSurah}
                className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-40"
                title="Next Surah"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Font size and options */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowTransliteration(!showTransliteration)}
                className={`px-2 py-1 rounded-lg text-xs font-semibold border transition-colors ${
                  showTransliteration
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                    : 'text-zinc-400 border-zinc-200 dark:border-zinc-700'
                }`}
                title="Toggle Transliteration"
              >
                Aa Translit
              </button>

              <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 rounded-lg p-0.5">
                {(['sm', 'md', 'lg', 'xl'] as const).map((size) => (
                  <button
                    key={size}
                    onClick={() => {
                      setFontSize(size);
                      const updated = { ...profile, arabicFontSize: size };
                      onUpdateProfile(updated);
                      storageService.saveProfile(updated);
                    }}
                    className={`px-2 py-0.5 text-xs rounded font-bold uppercase ${
                      fontSize === size
                        ? 'bg-white dark:bg-zinc-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
                        : 'text-zinc-400 hover:text-zinc-700'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center text-zinc-400 space-y-3 bg-white dark:bg-zinc-850 rounded-3xl border border-zinc-200 dark:border-zinc-800">
              <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm font-medium">Loading authentic Quran verses...</p>
            </div>
          ) : surahDetail ? (
            <div className="space-y-4">
              {/* Surah Title Banner */}
              <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-950 text-white shadow-xl text-center relative overflow-hidden border border-emerald-800/60">
                <div className="relative z-10">
                  <span className="text-xs uppercase tracking-widest text-amber-300 font-bold">
                    Surah {surahDetail.number} • {surahDetail.revelationType} • {surahDetail.numberOfAyahs} Verses
                  </span>
                  <h1 className="text-3xl font-arabic font-extrabold my-2 text-white">
                    {surahDetail.name}
                  </h1>
                  <h2 className="text-lg font-bold text-emerald-100">
                    {surahDetail.englishName}
                  </h2>
                  <p className="text-xs text-emerald-200/80">
                    "{surahDetail.englishNameTranslation}"
                  </p>

                  {/* Play entire surah continuously */}
                  <div className="mt-4 flex items-center justify-center gap-2">
                    <button
                      onClick={() => handlePlayAyah(1)}
                      className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-900 font-bold text-xs flex items-center gap-1.5 shadow-md transition-all hover:scale-105"
                    >
                      {activePlayingAyah ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                      <span>{activePlayingAyah ? 'Pause Audio' : 'Play Recitation (Alafasy)'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Bismillah Header (except Surah 9 At-Tawbah and Surah 1 Al-Fatihah where it's verse 1) */}
              {surahDetail.bismillahPre && (
                <div className="p-5 text-center bg-white dark:bg-zinc-850 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-sm">
                  <p className="text-2xl sm:text-3xl font-quran text-zinc-900 dark:text-zinc-100">
                    بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                  </p>
                  <p className="text-xs text-zinc-400 mt-1">
                    In the name of Allah, the Entirely Merciful, the Especially Merciful
                  </p>
                </div>
              )}

              {/* Ayahs List */}
              <div className="space-y-3">
                {surahDetail.ayahs.map((ayah) => {
                  const isBookmarked = storageService.isAyahBookmarked(surahDetail.number, ayah.numberInSurah);
                  const isPlayingThis = activePlayingAyah === ayah.numberInSurah;

                  return (
                    <div
                      key={ayah.numberInSurah}
                      id={`ayah-${ayah.numberInSurah}`}
                      className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                        isPlayingThis
                          ? 'bg-amber-50/70 dark:bg-amber-950/20 border-amber-400 shadow-md ring-2 ring-amber-400/20'
                          : 'bg-white dark:bg-zinc-850 border-zinc-200/80 dark:border-zinc-800 shadow-sm hover:border-emerald-200'
                      }`}
                    >
                      {/* Top bar of Ayah: number, actions */}
                      <div className="flex items-center justify-between pb-3 mb-3 border-b border-zinc-100 dark:border-zinc-800 text-xs">
                        <div className="flex items-center space-x-2">
                          <span className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold flex items-center justify-center text-xs">
                            {ayah.numberInSurah}
                          </span>
                          <span className="text-[11px] text-zinc-400">
                            Ayah {ayah.numberInSurah} of {surahDetail.numberOfAyahs}
                          </span>
                        </div>

                        <div className="flex items-center space-x-1">
                          {/* Audio play */}
                          <button
                            onClick={() => handlePlayAyah(ayah.numberInSurah)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              isPlayingThis
                                ? 'bg-amber-500 text-white'
                                : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-emerald-600'
                            }`}
                            title={isPlayingThis ? 'Stop Audio' : 'Play Ayah Audio'}
                          >
                            {isPlayingThis ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                          </button>

                          {/* Bookmark */}
                          <button
                            onClick={() => handleToggleBookmark(ayah)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              isBookmarked
                                ? 'text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950'
                                : 'text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                            }`}
                            title={isBookmarked ? 'Remove Bookmark' : 'Bookmark Ayah'}
                          >
                            <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
                          </button>

                          {/* Copy */}
                          <button
                            onClick={() => handleCopyAyah(ayah)}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                            title="Copy Ayah text"
                          >
                            {copiedAyah === ayah.numberInSurah ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>

                          {/* Share */}
                          <button
                            onClick={() => handleShareAyah(ayah)}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                            title="Share Ayah"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Arabic Quranic text */}
                      <p
                        dir="rtl"
                        className={`font-quran text-right text-zinc-900 dark:text-zinc-100 ${getFontSizeClass()} select-text`}
                      >
                        {ayah.arabicText}
                        <span className="inline-flex items-center justify-center w-7 h-7 mx-2 rounded-full border border-emerald-600/40 text-emerald-800 dark:text-emerald-300 font-bold text-xs align-middle">
                          {ayah.numberInSurah}
                        </span>
                      </p>

                      {/* Transliteration */}
                      {showTransliteration && ayah.transliteration && (
                        <p className="text-xs text-emerald-800 dark:text-emerald-400 italic mt-3 mb-1 leading-relaxed">
                          {ayah.transliteration}
                        </p>
                      )}

                      {/* English Translation */}
                      <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed mt-2 font-normal">
                        {ayah.translation}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Bottom Navigation: Prev Surah, Mark Completed, Next Surah */}
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200 dark:border-emerald-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    disabled={currentSurahNumber <= 1}
                    onClick={handlePrevSurah}
                    className="px-3 py-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-bold text-zinc-700 dark:text-zinc-300 disabled:opacity-40 flex items-center gap-1"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Previous Surah</span>
                  </button>
                  <button
                    disabled={currentSurahNumber >= 114}
                    onClick={handleNextSurah}
                    className="px-3 py-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-bold text-zinc-700 dark:text-zinc-300 disabled:opacity-40 flex items-center gap-1"
                  >
                    <span>Next Surah</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  onClick={() => {
                    storageService.updateQuranProgress(surahDetail.number, surahDetail.numberOfAyahs, true);
                    onUpdateProfile(storageService.getProfile());
                    alert(`Surah ${surahDetail.englishName} marked as completed! MashAllah!`);
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-700 text-white font-bold text-xs shadow hover:bg-emerald-800 transition-colors flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Mark Surah Completed</span>
                </button>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};
