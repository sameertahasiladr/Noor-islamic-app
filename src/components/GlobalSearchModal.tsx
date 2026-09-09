import React, { useState, useMemo } from 'react';
import { Search, X, BookOpen, Heart, Sparkles, Compass, BookCheck, ArrowUpRight } from 'lucide-react';
import { ALL_SURAHS, BUNDLED_SURAHS } from '../data/surahs';
import { DUAS_LIST } from '../data/duas';
import { HADITHS_LIST } from '../data/hadiths';
import { NAMES_OF_ALLAH } from '../data/namesOfAllah';
import { LEARNING_TOPICS } from '../data/learning';
import { AppTab, ExploreFeature } from '../types';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: AppTab) => void;
  onNavigateExplore: (feature: ExploreFeature) => void;
  onSelectSurah?: (surahNumber: number) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
  onNavigateExplore,
  onSelectSurah,
}) => {
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return {
        surahs: [],
        duas: [],
        hadiths: [],
        names: [],
        articles: [],
      };
    }

    // Search Surahs
    const matchedSurahs = ALL_SURAHS.filter(
      (s) =>
        s.englishName.toLowerCase().includes(q) ||
        s.englishNameTranslation.toLowerCase().includes(q) ||
        s.name.includes(q) ||
        String(s.number) === q
    ).slice(0, 4);

    // Search Duas
    const matchedDuas = DUAS_LIST.filter(
      (d) =>
        d.title.toLowerCase().includes(q) ||
        d.translation.toLowerCase().includes(q) ||
        d.transliteration.toLowerCase().includes(q) ||
        d.arabic.includes(q)
    ).slice(0, 4);

    // Search Hadith
    const matchedHadiths = HADITHS_LIST.filter(
      (h) =>
        h.textEnglish.toLowerCase().includes(q) ||
        h.narrator.toLowerCase().includes(q) ||
        h.category.toLowerCase().includes(q) ||
        h.collection.toLowerCase().includes(q)
    ).slice(0, 3);

    // Search Names of Allah
    const matchedNames = NAMES_OF_ALLAH.filter(
      (n) =>
        n.transliteration.toLowerCase().includes(q) ||
        n.englishMeaning.toLowerCase().includes(q) ||
        n.arabic.includes(q) ||
        n.explanation.toLowerCase().includes(q)
    ).slice(0, 4);

    // Search Learning articles
    const matchedArticles = LEARNING_TOPICS.filter(
      (l) =>
        l.title.toLowerCase().includes(q) ||
        l.subtitle.toLowerCase().includes(q)
    ).slice(0, 3);

    return {
      surahs: matchedSurahs,
      duas: matchedDuas,
      hadiths: matchedHadiths,
      names: matchedNames,
      articles: matchedArticles,
    };
  }, [query]);

  if (!isOpen) return null;

  const totalResults =
    results.surahs.length +
    results.duas.length +
    results.hadiths.length +
    results.names.length +
    results.articles.length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-6 bg-zinc-950/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Search input header */}
        <div className="flex items-center px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
          <Search className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mr-3 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Quran surahs, duas, hadith, 99 names, articles..."
            className="w-full bg-transparent text-sm sm:text-base text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 mr-2"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
          >
            <span className="text-xs font-semibold px-1">ESC</span>
          </button>
        </div>

        {/* Search results list */}
        <div className="overflow-y-auto p-4 space-y-5 flex-1">
          {query.trim() === '' ? (
            <div className="py-8 text-center text-zinc-400 dark:text-zinc-500">
              <Sparkles className="w-8 h-8 mx-auto text-emerald-500/50 mb-2" />
              <p className="text-sm font-medium">Search the Islamic Companion</p>
              <p className="text-xs mt-1 text-zinc-400">
                Try searching for <span className="font-semibold text-emerald-600 dark:text-emerald-400">"Al-Mulk"</span>, <span className="font-semibold text-emerald-600 dark:text-emerald-400">"Forgiveness"</span>, <span className="font-semibold text-emerald-600 dark:text-emerald-400">"Patience"</span>, or <span className="font-semibold text-emerald-600 dark:text-emerald-400">"Ar-Rahman"</span>
              </p>
            </div>
          ) : totalResults === 0 ? (
            <div className="py-8 text-center text-zinc-500">
              <p className="text-sm">No Islamic matches found for "{query}"</p>
              <p className="text-xs text-zinc-400 mt-1">Try another keyword or search by English or Arabic name.</p>
            </div>
          ) : (
            <>
              {/* Surahs */}
              {results.surahs.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5 mb-2">
                    <BookOpen className="w-3.5 h-3.5" />
                    Quran Surahs
                  </h3>
                  <div className="space-y-1.5">
                    {results.surahs.map((surah) => (
                      <button
                        key={surah.number}
                        onClick={() => {
                          onClose();
                          if (onSelectSurah) {
                            onSelectSurah(surah.number);
                          } else {
                            onNavigateTab('quran');
                          }
                        }}
                        className="w-full text-left p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-zinc-200/60 dark:border-zinc-800 flex items-center justify-between transition-colors group"
                      >
                        <div className="flex items-center space-x-2.5">
                          <span className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 font-bold text-xs flex items-center justify-center">
                            {surah.number}
                          </span>
                          <div>
                            <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 flex items-center gap-1">
                              {surah.englishName}
                              <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </p>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                              {surah.englishNameTranslation} • {surah.numberOfAyahs} verses • {surah.revelationType}
                            </p>
                          </div>
                        </div>
                        <span className="text-base font-arabic font-bold text-emerald-800 dark:text-emerald-300">
                          {surah.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Duas */}
              {results.duas.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5 mb-2">
                    <Heart className="w-3.5 h-3.5" />
                    Supplications (Duas)
                  </h3>
                  <div className="space-y-1.5">
                    {results.duas.map((dua) => (
                      <button
                        key={dua.id}
                        onClick={() => {
                          onClose();
                          onNavigateExplore('duas');
                        }}
                        className="w-full text-left p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-zinc-200/60 dark:border-zinc-800 transition-colors group"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-400">
                            {dua.title}
                          </p>
                          <span className="text-xs text-emerald-600 dark:text-emerald-400 shrink-0 font-medium">
                            {dua.reference.split(' ')[0]}
                          </span>
                        </div>
                        <p className="text-xs font-arabic text-zinc-700 dark:text-zinc-300 line-clamp-1 my-1 text-right">
                          {dua.arabic}
                        </p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-1">
                          "{dua.translation}"
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Hadith */}
              {results.hadiths.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5 mb-2">
                    <BookCheck className="w-3.5 h-3.5" />
                    Prophetic Hadith
                  </h3>
                  <div className="space-y-1.5">
                    {results.hadiths.map((hadith) => (
                      <button
                        key={hadith.id}
                        onClick={() => {
                          onClose();
                          onNavigateExplore('hadith');
                        }}
                        className="w-full text-left p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-zinc-200/60 dark:border-zinc-800 transition-colors group"
                      >
                        <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                          {hadith.collection} • {hadith.hadithNumber}
                        </span>
                        <p className="text-xs text-zinc-700 dark:text-zinc-300 line-clamp-2 mt-1 italic">
                          "{hadith.textEnglish}"
                        </p>
                        <p className="text-[11px] text-zinc-400 mt-1">
                          Narrated by: {hadith.narrator}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 99 Names of Allah */}
              {results.names.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5 mb-2">
                    <Sparkles className="w-3.5 h-3.5" />
                    Asma ul-Husna (Names of Allah)
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {results.names.map((name) => (
                      <button
                        key={name.number}
                        onClick={() => {
                          onClose();
                          onNavigateExplore('names');
                        }}
                        className="text-left p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-zinc-200/60 dark:border-zinc-800 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                            #{name.number} {name.transliteration}
                          </span>
                          <span className="text-sm font-arabic font-bold text-zinc-900 dark:text-zinc-100">
                            {name.arabic}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-1 mt-0.5">
                          {name.englishMeaning}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Learning Articles */}
              {results.articles.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5 mb-2">
                    <Compass className="w-3.5 h-3.5" />
                    Islamic Knowledge & Articles
                  </h3>
                  <div className="space-y-1.5">
                    {results.articles.map((art) => (
                      <button
                        key={art.id}
                        onClick={() => {
                          onClose();
                          onNavigateExplore('learning');
                        }}
                        className="w-full text-left p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-zinc-200/60 dark:border-zinc-800 flex items-center justify-between transition-colors"
                      >
                        <div>
                          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                            {art.title}
                          </p>
                          <p className="text-xs text-zinc-500">{art.subtitle}</p>
                        </div>
                        <span className="text-[11px] text-zinc-400">{art.readTime}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
