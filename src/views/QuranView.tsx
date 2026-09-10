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
          <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-[#064E3B] via-[#063B2D] to-[#04281E] text-white shadow-xl shadow-emerald-950/20 relative overflow-hidden border border-emerald-600/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-emerald-200 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-amber-300" />
                The Holy Quran • القرآن الكريم
              </span>
              <span className="text-xs font-extrabold text-amber-300 bg-amber-400/20 border border-amber-400/30 px-2 py-0.5 rounded-full">
                {profile.quranProgress.percentage}% Read
              </span>
            </div>
            <p className="text-sm sm:text-base font-bold text-white mt-1">
              Complete 114 Surahs & 30 Juz with authentic verse-by-verse recitation
            </p>
            {/* Progress bar */}
            <div className="w-full h-2.5 bg-white/15 rounded-full mt-3 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-amber-300 rounded-full transition-all duration-500 shadow-[0_0_8px_#FBBF24]"
                style={{ width: `${profile.quranProgress.percentage}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs text-emerald-200/90 mt-2.5 font-medium">
              <span>{profile.quranProgress.completedSurahs.length} of 114 Surahs marked finished</span>
              <button
                onClick={() => handleOpenSurah(profile.quranProgress.lastReadSurah || 1, profile.quranProgress.lastReadAyah || 1)}
                className="font-bold text-amber-300 hover:text-white underline underline-offset-2"
              >
                Resume Surah {profile.quranProgress.lastReadSurah || 1}
              </button>
            </div>
          </div>

          {/* Navigation Mode Tabs: Surahs (114) vs 30 Juz vs Bookmarks */}
          <div className="flex items-center space-x-1 p-1 bg-[#ECE7DE] dark:bg-[#0A1A13] border border-[#E0DBD0] dark:border-emerald-950/80 rounded-2xl max-w-md mx-auto">
            <button
              onClick={() => setActiveTab('surahs')}
              className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'surahs'
                  ? 'bg-emerald-800 text-white dark:bg-emerald-950 dark:text-amber-300 shadow-xs border border-emerald-700/40'
                  : 'text-[#5C6F66] dark:text-[#9EB2A7] hover:text-[#14241D] dark:hover:text-[#F4F3EC]'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Surahs (114)</span>
            </button>

            <button
              onClick={() => setActiveTab('juz')}
              className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'juz'
                  ? 'bg-emerald-800 text-white dark:bg-emerald-950 dark:text-amber-300 shadow-xs border border-emerald-700/40'
                  : 'text-[#5C6F66] dark:text-[#9EB2A7] hover:text-[#14241D] dark:hover:text-[#F4F3EC]'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>30 Juz</span>
            </button>

            <button
              onClick={() => setActiveTab('bookmarks')}
              className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'bookmarks'
                  ? 'bg-emerald-800 text-white dark:bg-emerald-950 dark:text-amber-300 shadow-xs border border-emerald-700/40'
                  : 'text-[#5C6F66] dark:text-[#9EB2A7] hover:text-[#14241D] dark:hover:text-[#F4F3EC]'
              }`}
            >
              <Bookmark className="w-4 h-4" />
              <span>Saved ({profile.bookmarks?.length || 0})</span>
            </button>
          </div>

          {/* Search bar */}
          {activeTab !== 'bookmarks' && (
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-[#5C6F66] absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={
                    activeTab === 'surahs'
                      ? 'Search Surah by name, translation, or number (1-114)...'
                      : 'Search Juz by number (1-30), name, or starting Surah...'
                  }
                  className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-white dark:bg-[#0D1E17] border border-[#E8E4DC] dark:border-emerald-900/30 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700 dark:text-[#F4F3EC] placeholder:text-[#5C6F66] shadow-xs"
                />
              </div>

              {activeTab === 'surahs' && (
                <div className="flex items-center space-x-1 bg-white dark:bg-[#0D1E17] p-1 rounded-2xl border border-[#E8E4DC] dark:border-emerald-900/30 shrink-0">
                  {(['All', 'Meccan', 'Medinan'] as const).map((rev) => (
                    <button
                      key={rev}
                      onClick={() => setRevelationFilter(rev)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        revelationFilter === rev
                          ? 'bg-emerald-800 text-white shadow-xs'
                          : 'text-[#5C6F66] hover:text-[#14241D] dark:hover:text-[#F4F3EC]'
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredSurahs.map((surah) => {
                const isCompleted = profile.quranProgress.completedSurahs.includes(surah.number);

                return (
                  <button
                    key={surah.number}
                    onClick={() => handleOpenSurah(surah.number)}
                    className="p-4 rounded-3xl bg-white dark:bg-[#0D1E17] hover:bg-emerald-900/5 dark:hover:bg-emerald-950/40 border border-[#E8E4DC] dark:border-emerald-900/30 hover:border-amber-400/60 text-left transition-all hover:scale-[1.01] shadow-xs flex items-center justify-between group"
                  >
                    <div className="flex items-center space-x-3.5">
                      <div className="w-10 h-10 rounded-2xl bg-emerald-800/10 dark:bg-emerald-950 text-emerald-800 dark:text-amber-300 font-bold text-xs flex items-center justify-center shrink-0 border border-emerald-700/20 group-hover:bg-emerald-800 group-hover:text-white transition-colors">
                        {surah.number}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-bold text-[#14241D] dark:text-[#F4F3EC] group-hover:text-emerald-800 dark:group-hover:text-amber-300 transition-colors">
                            {surah.englishName}
                          </span>
                          {isCompleted && (
                            <span className="w-4 h-4 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[10px]">
                              ✓
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#5C6F66] dark:text-[#9EB2A7] font-medium">
                          {surah.englishNameTranslation} • {surah.numberOfAyahs} verses
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-lg font-arabic font-bold text-emerald-800 dark:text-emerald-300 block">
                        {surah.name}
                      </span>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-[#5C6F66] dark:text-[#9EB2A7]">
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
                  className="p-4 rounded-3xl bg-white dark:bg-[#0D1E17] hover:bg-emerald-900/5 dark:hover:bg-emerald-950/40 border border-[#E8E4DC] dark:border-emerald-900/30 hover:border-amber-400/60 text-left transition-all hover:scale-[1.01] shadow-xs flex items-center justify-between group"
                >
                  <div className="flex items-center space-x-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-emerald-800/10 dark:bg-emerald-950 text-emerald-800 dark:text-amber-300 font-bold text-sm flex items-center justify-center shrink-0 border border-emerald-700/20 group-hover:bg-emerald-800 group-hover:text-white transition-colors">
                      {juz.number}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold text-[#14241D] dark:text-[#F4F3EC] group-hover:text-emerald-800 dark:group-hover:text-amber-300 transition-colors">
                          Juz {juz.number} • {juz.nameTransliteration}
                        </span>
                      </div>
                      <p className="text-xs text-[#5C6F66] dark:text-[#9EB2A7] mt-0.5 font-medium">
                        {juz.startSurahName} ({juz.startAyahNumber}) → {juz.endSurahName} ({juz.endAyahNumber})
                      </p>
                      <span className="inline-block mt-1 text-[10px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-800/10 dark:bg-emerald-950 px-2 py-0.5 rounded-md border border-emerald-700/20">
                        {juz.totalAyahs} Verses
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xl font-arabic font-bold text-emerald-800 dark:text-emerald-300 block">
                      {juz.nameArabic}
                    </span>
                    <span className="text-[10px] font-bold text-[#5C6F66] dark:text-[#9EB2A7] flex items-center gap-0.5 justify-end mt-1 group-hover:text-emerald-700">
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
                <div className="p-12 text-center bg-white dark:bg-[#0D1E17] rounded-3xl border border-[#E8E4DC] dark:border-emerald-900/30 shadow-xs">
                  <Bookmark className="w-10 h-10 text-[#5C6F66] mx-auto mb-2 opacity-50" />
                  <p className="text-sm font-bold text-[#14241D] dark:text-[#F4F3EC]">No Saved Ayahs</p>
                  <p className="text-xs text-[#5C6F66] dark:text-[#9EB2A7] mt-1 font-medium">Tap the bookmark icon on any ayah while reading to save it here for quick access.</p>
                </div>
              ) : (
                profile.bookmarks.map((bm) => (
                  <div
                    key={bm.id}
                    className="p-4 rounded-3xl bg-white dark:bg-[#0D1E17] border border-[#E8E4DC] dark:border-emerald-900/30 shadow-xs space-y-2 hover:border-amber-400/60 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-800 dark:text-amber-300">
                        Surah {bm.surahName} ({bm.surahNumber}:{bm.ayahNumber})
                      </span>
                      <button
                        onClick={() => handleOpenSurah(bm.surahNumber, bm.ayahNumber)}
                        className="px-3 py-1 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold flex items-center gap-1 shadow-xs transition-colors"
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
          <div className="flex items-center justify-between p-3 rounded-2xl bg-white/95 dark:bg-[#0D1E17]/95 border border-[#E8E4DC] dark:border-emerald-900/30 shadow-xs sticky top-14 z-20 backdrop-blur-md">
            <button
              onClick={() => {
                setActiveView('catalog');
              }}
              className="flex items-center text-xs font-bold text-emerald-800 dark:text-amber-300 hover:text-emerald-900 p-1.5 rounded-xl hover:bg-emerald-800/10 transition-colors"
            >
              <ChevronLeft className="w-4 h-4 mr-0.5" />
              <span>Index / 30 Juz</span>
            </button>

            {/* Prev / Next Surah Quick Controls */}
            <div className="flex items-center space-x-1">
              <button
                disabled={currentSurahNumber <= 1}
                onClick={handlePrevSurah}
                className="p-1.5 rounded-xl border border-[#E8E4DC] dark:border-emerald-900/40 text-[#5C6F66] dark:text-[#9EB2A7] hover:bg-emerald-800/10 disabled:opacity-40"
                title="Previous Surah"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              <span className="text-xs font-bold text-[#14241D] dark:text-[#F4F3EC] px-1.5">
                {currentSurahNumber} / 114
              </span>

              <button
                disabled={currentSurahNumber >= 114}
                onClick={handleNextSurah}
                className="p-1.5 rounded-xl border border-[#E8E4DC] dark:border-emerald-900/40 text-[#5C6F66] dark:text-[#9EB2A7] hover:bg-emerald-800/10 disabled:opacity-40"
                title="Next Surah"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Font size and options */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowTransliteration(!showTransliteration)}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold border transition-colors ${
                  showTransliteration
                    ? 'bg-emerald-800/10 dark:bg-emerald-950 text-emerald-800 dark:text-amber-300 border-emerald-700/30'
                    : 'text-[#5C6F66] border-[#E8E4DC] dark:border-emerald-900/40'
                }`}
                title="Toggle Transliteration"
              >
                Aa Translit
              </button>

              <div className="flex items-center bg-[#ECE7DE] dark:bg-[#0A1A13] rounded-xl p-0.5 border border-[#E0DBD0] dark:border-emerald-950/80">
                {(['sm', 'md', 'lg', 'xl'] as const).map((size) => (
                  <button
                    key={size}
                    onClick={() => {
                      setFontSize(size);
                      const updated = { ...profile, arabicFontSize: size };
                      onUpdateProfile(updated);
                      storageService.saveProfile(updated);
                    }}
                    className={`px-2 py-0.5 text-xs rounded-lg font-bold uppercase transition-all ${
                      fontSize === size
                        ? 'bg-emerald-800 text-white dark:bg-emerald-950 dark:text-amber-300 shadow-xs'
                        : 'text-[#5C6F66] hover:text-[#14241D] dark:hover:text-[#F4F3EC]'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {loading ? (
            <div className="p-16 text-center text-[#5C6F66] dark:text-[#9EB2A7] space-y-3 bg-white dark:bg-[#0D1E17] rounded-3xl border border-[#E8E4DC] dark:border-emerald-900/30 shadow-xs">
              <div className="w-8 h-8 border-3 border-emerald-800 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm font-bold">Loading authentic Quran verses...</p>
            </div>
          ) : surahDetail ? (
            <div className="space-y-4">
              {/* Surah Title Banner */}
              <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-[#064E3B] via-[#063B2D] to-[#04281E] text-white shadow-xl shadow-emerald-950/20 text-center relative overflow-hidden border border-emerald-600/30">
                <div className="relative z-10">
                  <span className="text-xs uppercase tracking-widest text-amber-300 font-bold">
                    Surah {surahDetail.number} • {surahDetail.revelationType} • {surahDetail.numberOfAyahs} Verses
                  </span>
                  <h1 className="text-3xl font-arabic font-extrabold my-2 text-white">
                    {surahDetail.name}
                  </h1>
                  <h2 className="text-lg font-bold text-white">
                    {surahDetail.englishName}
                  </h2>
                  <p className="text-xs text-emerald-200/80 font-medium">
                    "{surahDetail.englishNameTranslation}"
                  </p>

                  {/* Play entire surah continuously */}
                  <div className="mt-4 flex items-center justify-center gap-2">
                    <button
                      onClick={() => handlePlayAyah(1)}
                      className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-emerald-950 font-extrabold text-xs flex items-center gap-1.5 shadow-md transition-all hover:scale-105"
                    >
                      {activePlayingAyah ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                      <span>{activePlayingAyah ? 'Pause Audio' : 'Play Recitation (Alafasy)'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Bismillah Header (except Surah 9 At-Tawbah and Surah 1 Al-Fatihah where it's verse 1) */}
              {surahDetail.bismillahPre && (
                <div className="p-6 text-center bg-white dark:bg-[#0D1E17] rounded-3xl border border-[#E8E4DC] dark:border-emerald-900/30 shadow-xs">
                  <p className="text-2xl sm:text-3xl font-quran text-[#14241D] dark:text-[#F4F3EC]">
                    بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                  </p>
                  <p className="text-xs text-[#5C6F66] dark:text-[#9EB2A7] mt-1.5 font-medium">
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
                      className={`p-5 sm:p-6 rounded-3xl border transition-all ${
                        isPlayingThis
                          ? 'bg-amber-50/60 dark:bg-[#122820] border-amber-400 shadow-md ring-2 ring-amber-400/20'
                          : 'bg-white dark:bg-[#0D1E17] border-[#E8E4DC] dark:border-emerald-900/30 shadow-xs hover:border-amber-400/50'
                      }`}
                    >
                      {/* Top bar of Ayah: number, actions */}
                      <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#E8E4DC] dark:border-emerald-900/20 text-xs">
                        <div className="flex items-center space-x-2">
                          <span className="w-7 h-7 rounded-xl bg-emerald-800/10 dark:bg-emerald-950 text-emerald-800 dark:text-amber-300 font-bold flex items-center justify-center text-xs border border-emerald-700/20">
                            {ayah.numberInSurah}
                          </span>
                          <span className="text-[11px] text-[#5C6F66] dark:text-[#9EB2A7] font-medium">
                            Ayah {ayah.numberInSurah} of {surahDetail.numberOfAyahs}
                          </span>
                        </div>

                        <div className="flex items-center space-x-1">
                          {/* Audio play */}
                          <button
                            onClick={() => handlePlayAyah(ayah.numberInSurah)}
                            className={`p-1.5 rounded-xl transition-colors ${
                              isPlayingThis
                                ? 'bg-amber-400 text-emerald-950 font-bold'
                                : 'text-[#5C6F66] hover:bg-emerald-800/10 hover:text-emerald-800'
                            }`}
                            title={isPlayingThis ? 'Stop Audio' : 'Play Ayah Audio'}
                          >
                            {isPlayingThis ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                          </button>

                          {/* Bookmark */}
                          <button
                            onClick={() => handleToggleBookmark(ayah)}
                            className={`p-1.5 rounded-xl transition-colors ${
                              isBookmarked
                                ? 'text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950'
                                : 'text-[#5C6F66] hover:text-[#14241D] hover:bg-emerald-800/10'
                            }`}
                            title={isBookmarked ? 'Remove Bookmark' : 'Bookmark Ayah'}
                          >
                            <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
                          </button>

                          {/* Copy */}
                          <button
                            onClick={() => handleCopyAyah(ayah)}
                            className="p-1.5 rounded-xl text-[#5C6F66] hover:text-[#14241D] hover:bg-emerald-800/10 transition-colors"
                            title="Copy Ayah text"
                          >
                            {copiedAyah === ayah.numberInSurah ? (
                              <Check className="w-3.5 h-3.5 text-emerald-700 font-bold" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>

                          {/* Share */}
                          <button
                            onClick={() => handleShareAyah(ayah)}
                            className="p-1.5 rounded-xl text-[#5C6F66] hover:text-[#14241D] hover:bg-emerald-800/10 transition-colors"
                            title="Share Ayah"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Arabic Quranic text */}
                      <p
                        dir="rtl"
                        className={`font-quran text-right text-[#14241D] dark:text-[#F4F3EC] ${getFontSizeClass()} select-text`}
                      >
                        {ayah.arabicText}
                        <span className="inline-flex items-center justify-center w-7 h-7 mx-2 rounded-full border border-emerald-700/40 text-emerald-800 dark:text-amber-300 font-bold text-xs align-middle">
                          {ayah.numberInSurah}
                        </span>
                      </p>

                      {/* Transliteration */}
                      {showTransliteration && ayah.transliteration && (
                        <p className="text-xs text-emerald-800 dark:text-emerald-300 italic mt-3 mb-1 leading-relaxed">
                          {ayah.transliteration}
                        </p>
                      )}

                      {/* English Translation */}
                      <p className="text-sm text-[#14241D] dark:text-[#F4F3EC] leading-relaxed mt-2 font-normal">
                        {ayah.translation}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Bottom Navigation: Prev Surah, Mark Completed, Next Surah */}
              <div className="p-4 bg-white dark:bg-[#0D1E17] rounded-3xl border border-[#E8E4DC] dark:border-emerald-900/30 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-2">
                  <button
                    disabled={currentSurahNumber <= 1}
                    onClick={handlePrevSurah}
                    className="px-3.5 py-2 rounded-xl bg-[#FAF8F5] dark:bg-[#14241D] border border-[#E8E4DC] dark:border-emerald-900/40 text-xs font-bold text-[#14241D] dark:text-[#F4F3EC] disabled:opacity-40 flex items-center gap-1 transition-colors hover:border-amber-400/60"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Previous Surah</span>
                  </button>
                  <button
                    disabled={currentSurahNumber >= 114}
                    onClick={handleNextSurah}
                    className="px-3.5 py-2 rounded-xl bg-[#FAF8F5] dark:bg-[#14241D] border border-[#E8E4DC] dark:border-emerald-900/40 text-xs font-bold text-[#14241D] dark:text-[#F4F3EC] disabled:opacity-40 flex items-center gap-1 transition-colors hover:border-amber-400/60"
                  >
                    <span>Next Surah</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  onClick={() => {
                    storageService.updateQuranProgress(surahDetail.number, surahDetail.numberOfAyahs, true);
                    onUpdateProfile(storageService.getProfile());
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4 text-amber-300" />
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
