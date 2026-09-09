import React, { useState, useMemo, useEffect } from 'react';
import {
  ChevronLeft,
  Search,
  Heart,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Square,
  Copy,
  Share2,
  Check,
  Sparkles,
  BookOpen,
  Headphones,
  Sliders,
  Languages,
} from 'lucide-react';
import { DUA_CATEGORIES, DUAS_LIST } from '../data/duas';
import { DuaItem, UserProfile } from '../types';
import {
  speechService,
  RecitationMode,
  RecitationStatus,
} from '../services/speechService';

interface DuasViewProps {
  profile: UserProfile;
  onBack: () => void;
  onUpdateProfile: (p: UserProfile) => void;
}

export const DuasView: React.FC<DuasViewProps> = ({
  profile: _profile,
  onBack,
  onUpdateProfile: _onUpdateProfile,
}) => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Recitation settings & state via Web Speech API
  const [recitationMode, setRecitationMode] = useState<RecitationMode>('both');
  const [recitationRate, setRecitationRate] = useState<number>(0.85);
  const [speechStatus, setSpeechStatus] = useState<RecitationStatus>(() =>
    speechService.getStatus()
  );

  const isTtsSupported = speechService.isSpeechSynthesisSupported();

  useEffect(() => {
    const unsub = speechService.subscribeStatus((status) => {
      setSpeechStatus(status);
    });
    return () => {
      unsub();
    };
  }, []);

  const filteredDuas = useMemo(() => {
    return DUAS_LIST.filter((d) => {
      const matchesCategory =
        selectedCategoryId === 'all' ||
        d.categoryId === selectedCategoryId ||
        d.category === selectedCategoryId;

      const q = searchQuery.toLowerCase().trim();
      const catObj = DUA_CATEGORIES.find((c) => c.id === d.categoryId);
      const catTitle = catObj ? catObj.title.toLowerCase() : '';
      const matchesSearch =
        !q ||
        d.title.toLowerCase().includes(q) ||
        d.translation.toLowerCase().includes(q) ||
        d.transliteration.toLowerCase().includes(q) ||
        d.arabic.includes(q) ||
        catTitle.includes(q) ||
        d.reference.toLowerCase().includes(q);

      return matchesCategory && matchesSearch;
    });
  }, [selectedCategoryId, searchQuery]);

  const handleCopy = (dua: DuaItem) => {
    const text = `${dua.title}\n\n${dua.arabic}\n\n"${dua.transliteration}"\n\n"${dua.translation}"\n\nReference: ${dua.reference}\nShared via Noor App`;
    navigator.clipboard.writeText(text);
    setCopiedId(dua.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleShare = (dua: DuaItem) => {
    const text = `${dua.title}\n\n${dua.arabic}\n\n"${dua.translation}"\n\nReference: ${dua.reference}`;
    if (navigator.share) {
      navigator.share({ title: dua.title, text }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
      setCopiedId(dua.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleToggleRecitation = (dua: DuaItem) => {
    if (speechStatus.currentDuaId === dua.id && speechStatus.isPlaying) {
      if (speechStatus.isPaused) {
        speechService.resumeRecitation();
      } else {
        speechService.pauseRecitation();
      }
    } else {
      speechService.reciteDua(dua, recitationMode, recitationRate);
    }
  };

  const handleStopCurrent = () => {
    speechService.stopRecitation();
  };

  const activeCategory = DUA_CATEGORIES.find((c) => c.id === selectedCategoryId);

  return (
    <div className="max-w-4xl mx-auto px-4 pb-28 pt-2 space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 transition-colors"
        >
          <ChevronLeft className="w-4 h-4 mr-0.5" />
          <span>Back to Features</span>
        </button>

        <span className="text-xs text-zinc-500 font-medium">
          {filteredDuas.length} Authentic Supplications
        </span>
      </div>

      {/* Hero Banner with Recitation Feature Badge */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-rose-950 via-zinc-900 to-emerald-950 text-white shadow-xl relative overflow-hidden border border-rose-900/40">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase font-bold tracking-widest text-rose-300 flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-rose-400" />
              Hisn al-Muslim • حصن المسلم
            </span>
            <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-emerald-800/80 text-emerald-200 flex items-center gap-1">
              <Volume2 className="w-3 h-3" />
              Web Speech Recitation
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold mt-1">Authentic Duas & Supplications</h1>
          <p className="text-xs text-zinc-300 mt-1 max-w-lg leading-relaxed">
            "And your Lord says: Call upon Me; I will respond to you." (Surah Ghafir 40:60). Listen to Arabic recitations and English translations powered by Web Speech API.
          </p>
        </div>
      </div>

      {/* Recitation Options Toolbar */}
      <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-850 border border-zinc-200/80 dark:border-zinc-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Headphones className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
          <span className="font-bold text-zinc-800 dark:text-zinc-200">Audio Recitation Mode:</span>
          <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 p-0.5 rounded-xl">
            <button
              onClick={() => {
                setRecitationMode('both');
                if (speechStatus.isPlaying) speechService.stopRecitation();
              }}
              className={`px-2.5 py-1 rounded-lg font-semibold text-[11px] transition-all ${
                recitationMode === 'both'
                  ? 'bg-white dark:bg-zinc-700 text-rose-700 dark:text-rose-300 shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
              }`}
            >
              Arabic + English
            </button>
            <button
              onClick={() => {
                setRecitationMode('arabic');
                if (speechStatus.isPlaying) speechService.stopRecitation();
              }}
              className={`px-2.5 py-1 rounded-lg font-semibold text-[11px] transition-all ${
                recitationMode === 'arabic'
                  ? 'bg-white dark:bg-zinc-700 text-rose-700 dark:text-rose-300 shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
              }`}
            >
              Arabic Only
            </button>
            <button
              onClick={() => {
                setRecitationMode('translation');
                if (speechStatus.isPlaying) speechService.stopRecitation();
              }}
              className={`px-2.5 py-1 rounded-lg font-semibold text-[11px] transition-all ${
                recitationMode === 'translation'
                  ? 'bg-white dark:bg-zinc-700 text-rose-700 dark:text-rose-300 shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
              }`}
            >
              English Only
            </button>
          </div>
        </div>

        {/* Speed rate control */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Sliders className="w-3.5 h-3.5 text-zinc-400" />
          <span className="text-[11px] text-zinc-500">Pace:</span>
          <div className="flex items-center gap-1">
            {[
              { label: '0.75x', rate: 0.75 },
              { label: '0.85x', rate: 0.85 },
              { label: '1.0x', rate: 1.0 },
            ].map((s) => (
              <button
                key={s.label}
                onClick={() => {
                  setRecitationRate(s.rate);
                  speechService.setRate(s.rate);
                }}
                className={`px-2 py-0.5 rounded-md font-semibold text-[10px] transition-colors ${
                  recitationRate === s.rate
                    ? 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search supplications, keywords, morning, fasting, forgiveness, protection..."
          className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-800 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 dark:text-zinc-100 placeholder:text-zinc-400 shadow-sm"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-2.5 text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
          >
            Clear
          </button>
        )}
      </div>

      {/* Categories Scrollable Pills */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
        <button
          onClick={() => setSelectedCategoryId('all')}
          className={`px-3.5 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all ${
            selectedCategoryId === 'all'
              ? 'bg-rose-700 text-white shadow-sm'
              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
          }`}
        >
          All Duas ({DUAS_LIST.length})
        </button>
        {DUA_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategoryId(cat.id)}
            className={`px-3.5 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all ${
              selectedCategoryId === cat.id
                ? 'bg-rose-700 text-white shadow-sm'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
            }`}
          >
            <span>{cat.title}</span>
            <span className="ml-1 text-[10px] opacity-75 font-arabic">({cat.arabicTitle})</span>
          </button>
        ))}
      </div>

      {activeCategory && selectedCategoryId !== 'all' && (
        <div className="p-3 rounded-xl bg-rose-50/80 dark:bg-rose-950/30 border border-rose-200/60 dark:border-rose-900/40 text-xs text-rose-800 dark:text-rose-300 flex items-center justify-between">
          <span>{activeCategory.description}</span>
          <span className="font-arabic font-bold text-sm">{activeCategory.arabicTitle}</span>
        </div>
      )}

      {/* Duas List Cards */}
      <div className="space-y-4">
        {filteredDuas.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-zinc-850 rounded-2xl border border-zinc-200 dark:border-zinc-800">
            <BookOpen className="w-10 h-10 text-zinc-300 dark:text-zinc-600 mx-auto mb-2" />
            <p className="text-sm font-bold text-zinc-700 dark:text-zinc-300">No supplications found</p>
            <p className="text-xs text-zinc-400 mt-1">Try searching for different keywords or select All Duas.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategoryId('all');
              }}
              className="mt-3 px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-700 text-white"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          filteredDuas.map((dua) => {
            const catObj = DUA_CATEGORIES.find((c) => c.id === dua.categoryId);
            const categoryLabel = catObj?.title || dua.category || 'Supplication';
            const isCurrentlyPlaying =
              speechStatus.currentDuaId === dua.id && speechStatus.isPlaying;
            const isCurrentDua = speechStatus.currentDuaId === dua.id;

            return (
              <div
                key={dua.id}
                id={`dua-card-${dua.id}`}
                className={`p-5 rounded-2xl transition-all duration-300 space-y-4 ${
                  isCurrentlyPlaying
                    ? 'bg-white dark:bg-zinc-850 border-2 border-rose-400 dark:border-rose-600 shadow-xl ring-2 ring-rose-400/20 dark:ring-rose-500/20'
                    : 'bg-white dark:bg-zinc-850 border border-zinc-200/80 dark:border-zinc-800 shadow-sm hover:shadow-md'
                }`}
              >
                {/* Active Playing Banner */}
                {isCurrentlyPlaying && (
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200/80 dark:border-rose-900/60 text-xs text-rose-800 dark:text-rose-300 animate-in fade-in">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-0.5">
                        <span className="w-1 h-3 bg-rose-600 rounded-full animate-[pulse_0.6s_ease-in-out_infinite]" />
                        <span className="w-1 h-4 bg-rose-600 rounded-full animate-[pulse_0.4s_ease-in-out_infinite]" />
                        <span className="w-1 h-2 bg-rose-600 rounded-full animate-[pulse_0.8s_ease-in-out_infinite]" />
                      </div>
                      <span className="font-semibold">
                        {speechStatus.isPaused
                          ? 'Recitation Paused'
                          : speechStatus.currentPhase === 'arabic'
                          ? 'Reciting in Arabic (لسان عربي)...'
                          : 'Reading English Translation...'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleToggleRecitation(dua)}
                        className="px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-800 font-semibold text-[11px] shadow-xs hover:bg-zinc-100 transition-colors flex items-center gap-1 text-zinc-700 dark:text-zinc-200"
                      >
                        {speechStatus.isPaused ? (
                          <>
                            <Play className="w-3 h-3 fill-current text-rose-600" /> Resume
                          </>
                        ) : (
                          <>
                            <Pause className="w-3 h-3 text-rose-600" /> Pause
                          </>
                        )}
                      </button>
                      <button
                        onClick={handleStopCurrent}
                        className="px-2 py-1 rounded-lg bg-rose-600 text-white hover:bg-rose-700 shadow-xs text-[11px] font-bold flex items-center gap-1"
                        title="Stop Recitation"
                      >
                        <Square className="w-3 h-3 fill-current" /> Stop
                      </button>
                    </div>
                  </div>
                )}

                {/* Header: Title, Category & Reference */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/70 text-rose-800 dark:text-rose-300">
                      {categoryLabel}
                    </span>
                    <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100 mt-1.5 flex items-center gap-2">
                      <span>{dua.title}</span>
                      {isCurrentlyPlaying && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 animate-pulse">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-600 dark:bg-rose-400"></span>
                          Now Playing
                        </span>
                      )}
                    </h3>
                  </div>

                  <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium shrink-0 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-lg">
                    {dua.reference}
                  </span>
                </div>

                {/* Arabic Text */}
                <div
                  className={`relative transition-all duration-300 rounded-xl ${
                    isCurrentlyPlaying && speechStatus.currentPhase === 'arabic'
                      ? 'bg-rose-50/70 dark:bg-rose-950/40 p-3 ring-1 ring-rose-300 dark:ring-rose-800'
                      : ''
                  }`}
                >
                  {isCurrentlyPlaying && speechStatus.currentPhase === 'arabic' && (
                    <div className="flex items-center gap-1 text-[10px] font-bold text-rose-700 dark:text-rose-300 mb-1">
                      <span className="flex gap-0.5 items-end h-2.5">
                        <span className="w-0.5 h-2 bg-rose-600 dark:bg-rose-400 animate-pulse"></span>
                        <span className="w-0.5 h-3 bg-rose-600 dark:bg-rose-400 animate-pulse delay-75"></span>
                        <span className="w-0.5 h-1.5 bg-rose-600 dark:bg-rose-400 animate-pulse delay-150"></span>
                      </span>
                      <span>Reciting Arabic</span>
                    </div>
                  )}
                  <p
                    dir="rtl"
                    className="text-xl sm:text-2xl font-arabic text-right leading-loose text-zinc-900 dark:text-zinc-100 font-semibold"
                  >
                    {dua.arabic}
                  </p>
                </div>

                {/* Transliteration */}
                <p className="text-xs text-rose-700 dark:text-rose-400 italic leading-relaxed font-serif">
                  {dua.transliteration}
                </p>

                {/* Translation */}
                <div
                  className={`relative transition-all duration-300 rounded-xl ${
                    isCurrentlyPlaying && speechStatus.currentPhase === 'translation'
                      ? 'bg-rose-50/70 dark:bg-rose-950/40 p-3 ring-1 ring-rose-300 dark:ring-rose-800'
                      : ''
                  }`}
                >
                  {isCurrentlyPlaying && speechStatus.currentPhase === 'translation' && (
                    <div className="flex items-center gap-1 text-[10px] font-bold text-rose-700 dark:text-rose-300 mb-1">
                      <span className="flex gap-0.5 items-end h-2.5">
                        <span className="w-0.5 h-2 bg-rose-600 dark:bg-rose-400 animate-pulse"></span>
                        <span className="w-0.5 h-3 bg-rose-600 dark:bg-rose-400 animate-pulse delay-75"></span>
                        <span className="w-0.5 h-1.5 bg-rose-600 dark:bg-rose-400 animate-pulse delay-150"></span>
                      </span>
                      <span>Reading Translation</span>
                    </div>
                  )}
                  <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed font-normal">
                    "{dua.translation}"
                  </p>
                </div>

                {/* Benefit note */}
                {dua.benefit && (
                  <div className="p-2.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/50 dark:border-amber-900/40 text-[11px] text-amber-900 dark:text-amber-300 flex items-start gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <span>{dua.benefit}</span>
                  </div>
                )}

                {/* Footer controls: Recitation, Copy, Share */}
                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                  {isCurrentlyPlaying ? (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleToggleRecitation(dua)}
                        className="px-3 py-1.5 rounded-xl font-bold text-xs bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-200 border border-rose-300 dark:border-rose-800 flex items-center gap-1.5 shadow-xs transition-colors"
                        title={speechStatus.isPaused ? 'Resume recitation' : 'Pause recitation'}
                      >
                        {speechStatus.isPaused ? (
                          <>
                            <Play className="w-3.5 h-3.5 fill-current text-rose-600 dark:text-rose-400" />
                            <span>Resume</span>
                          </>
                        ) : (
                          <>
                            <Pause className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                            <span>Pause</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={handleStopCurrent}
                        className="px-3 py-1.5 rounded-xl font-bold text-xs bg-rose-600 hover:bg-rose-700 text-white flex items-center gap-1.5 shadow-xs transition-colors"
                        title="Stop recitation"
                      >
                        <Square className="w-3 h-3 fill-current" />
                        <span>Stop</span>
                      </button>

                      <div className="hidden sm:flex items-center gap-1 text-[11px] text-rose-600 dark:text-rose-400 font-semibold px-2 py-0.5 rounded-lg bg-rose-50 dark:bg-rose-950/50">
                        <span className="flex gap-0.5 items-end h-2.5">
                          <span className="w-0.5 h-2 bg-rose-600 animate-pulse"></span>
                          <span className="w-0.5 h-3 bg-rose-600 animate-pulse delay-75"></span>
                          <span className="w-0.5 h-1.5 bg-rose-600 animate-pulse delay-150"></span>
                        </span>
                        <span>
                          {speechStatus.isPaused
                            ? 'Paused'
                            : speechStatus.currentPhase === 'arabic'
                            ? 'Reciting Arabic...'
                            : 'Reading English...'}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleToggleRecitation(dua)}
                      className="flex items-center gap-1.5 font-semibold px-3 py-1.5 rounded-xl text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200/50 dark:border-rose-900/40 transition-all"
                      title="Listen to recitation"
                    >
                      <Volume2 className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                      <span>Listen Recitation</span>
                    </button>
                  )}

                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => handleCopy(dua)}
                      className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all flex items-center gap-1 text-xs"
                      title="Copy Dua"
                    >
                      {copiedId === dua.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-600 font-bold">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleShare(dua)}
                      className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all flex items-center gap-1 text-xs"
                      title="Share Dua"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Share</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Floating Bottom Sticky Audio Player when recitation is active */}
      {speechStatus.isPlaying && (
        <div className="fixed bottom-20 sm:bottom-24 left-3 right-3 max-w-xl mx-auto z-50 animate-in slide-in-from-bottom-5 duration-300">
          <div className="p-3.5 rounded-2xl bg-zinc-900/95 dark:bg-zinc-900/95 text-white backdrop-blur-md shadow-2xl border border-rose-500/50 flex items-center justify-between gap-3">
            <div className="flex items-center space-x-2.5 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 to-amber-600 flex items-center justify-center text-white shrink-0 shadow-md">
                <Volume2 className="w-5 h-5 animate-pulse" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-zinc-100 truncate">
                  {speechStatus.currentTitle || 'Dua Recitation'}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="flex gap-0.5 items-end h-2.5">
                    <span className="w-0.5 h-2 bg-rose-400 animate-pulse"></span>
                    <span className="w-0.5 h-3 bg-rose-400 animate-pulse delay-75"></span>
                    <span className="w-0.5 h-1.5 bg-rose-400 animate-pulse delay-150"></span>
                  </span>
                  <p className="text-[11px] text-rose-300 truncate font-semibold">
                    {speechStatus.isPaused
                      ? 'Paused'
                      : speechStatus.currentPhase === 'arabic'
                      ? 'Reciting Arabic text...'
                      : 'Reading English translation...'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              <button
                onClick={() => {
                  if (speechStatus.isPaused) {
                    speechService.resumeRecitation();
                  } else {
                    speechService.pauseRecitation();
                  }
                }}
                className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs flex items-center gap-1 transition-colors border border-zinc-700"
                title={speechStatus.isPaused ? 'Resume' : 'Pause'}
              >
                {speechStatus.isPaused ? (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current text-rose-400" />
                    <span>Resume</span>
                  </>
                ) : (
                  <>
                    <Pause className="w-3.5 h-3.5 text-rose-400" />
                    <span>Pause</span>
                  </>
                )}
              </button>
              <button
                onClick={handleStopCurrent}
                className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1 transition-colors shadow-sm"
                title="Stop audio"
              >
                <Square className="w-3 h-3 fill-current" />
                <span>Stop</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

