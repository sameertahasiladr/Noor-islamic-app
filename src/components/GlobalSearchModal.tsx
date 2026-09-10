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
    <div className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-white dark:bg-[#0D1E17] rounded-3xl shadow-2xl border border-[#E8E4DC] dark:border-emerald-900/30 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Search input header */}
        <div className="flex items-center px-5 py-4 border-b border-[#E8E4DC] dark:border-emerald-900/30 bg-[#FAF8F5] dark:bg-[#14241D]">
          <Search className="w-5 h-5 text-emerald-800 dark:text-amber-300 mr-3 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Quran surahs, duas, hadith, 99 names, articles..."
            className="w-full bg-transparent text-sm sm:text-base text-[#14241D] dark:text-[#F4F3EC] placeholder-[#5C6F66] dark:placeholder-[#9EB2A7] focus:outline-none"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-md text-[#5C6F66] hover:text-[#14241D] dark:hover:text-[#F4F3EC] mr-2"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#5C6F66] hover:bg-[#ECE7DE] dark:hover:bg-[#14241D] transition-colors"
          >
            <span className="text-xs font-bold px-1">ESC</span>
          </button>
        </div>

        {/* Search results list */}
        <div className="overflow-y-auto p-4 sm:p-5 space-y-5 flex-1">
          {query.trim() === '' ? (
            <div className="py-10 text-center text-[#5C6F66] dark:text-[#9EB2A7]">
              <Sparkles className="w-8 h-8 mx-auto text-amber-500 mb-2" />
              <p className="text-sm font-bold text-[#14241D] dark:text-[#F4F3EC]">Search the Islamic Companion</p>
              <p className="text-xs mt-1 text-[#5C6F66] dark:text-[#9EB2A7]">
                Try searching for <span className="font-bold text-emerald-800 dark:text-amber-300">"Al-Mulk"</span>, <span className="font-bold text-emerald-800 dark:text-amber-300">"Forgiveness"</span>, <span className="font-bold text-emerald-800 dark:text-amber-300">"Patience"</span>, or <span className="font-bold text-emerald-800 dark:text-amber-300">"Ar-Rahman"</span>
              </p>
            </div>
          ) : totalResults === 0 ? (
            <div className="py-10 text-center text-[#5C6F66] dark:text-[#9EB2A7]">
              <p className="text-sm font-bold text-[#14241D] dark:text-[#F4F3EC]">No Islamic matches found for "{query}"</p>
              <p className="text-xs text-[#5C6F66] dark:text-[#9EB2A7] mt-1">Try another keyword or search by English or Arabic name.</p>
            </div>
          ) : (
            <>
              {/* Surahs */}
              {results.surahs.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-amber-300 flex items-center gap-1.5 mb-2">
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
                        className="w-full text-left p-3 rounded-2xl bg-[#FAF8F5] dark:bg-[#14241D] hover:bg-emerald-800/10 dark:hover:bg-emerald-950/60 border border-[#E8E4DC] dark:border-emerald-900/30 flex items-center justify-between transition-colors group"
                      >
                        <div className="flex items-center space-x-2.5">
                          <span className="w-8 h-8 rounded-xl bg-emerald-800/10 dark:bg-emerald-950 text-emerald-800 dark:text-amber-300 font-bold text-xs flex items-center justify-center border border-emerald-700/20">
                            {surah.number}
                          </span>
                          <div>
                            <p className="text-sm font-bold text-[#14241D] dark:text-[#F4F3EC] group-hover:text-emerald-800 dark:group-hover:text-amber-300 flex items-center gap-1">
                              {surah.englishName}
                              <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </p>
                            <p className="text-xs text-[#5C6F66] dark:text-[#9EB2A7]">
                              {surah.englishNameTranslation} • {surah.numberOfAyahs} verses • {surah.revelationType}
                            </p>
                          </div>
                        </div>
                        <span className="text-base font-quran font-bold text-emerald-800 dark:text-amber-300">
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
                  <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-amber-300 flex items-center gap-1.5 mb-2">
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
                        className="w-full text-left p-3.5 rounded-2xl bg-[#FAF8F5] dark:bg-[#14241D] hover:bg-emerald-800/10 dark:hover:bg-emerald-950/60 border border-[#E8E4DC] dark:border-emerald-900/30 transition-colors group"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-bold text-[#14241D] dark:text-[#F4F3EC] group-hover:text-emerald-800 dark:group-hover:text-amber-300">
                            {dua.title}
                          </p>
                          <span className="text-xs text-emerald-800 dark:text-amber-300 shrink-0 font-semibold">
                            {dua.reference.split(' ')[0]}
                          </span>
                        </div>
                        <p className="text-xs font-quran text-[#14241D] dark:text-[#F4F3EC] line-clamp-1 my-1 text-right">
                          {dua.arabic}
                        </p>
                        <p className="text-xs text-[#5C6F66] dark:text-[#9EB2A7] line-clamp-1 italic">
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
                  <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-amber-300 flex items-center gap-1.5 mb-2">
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
                        className="w-full text-left p-3.5 rounded-2xl bg-[#FAF8F5] dark:bg-[#14241D] hover:bg-emerald-800/10 dark:hover:bg-emerald-950/60 border border-[#E8E4DC] dark:border-emerald-900/30 transition-colors group"
                      >
                        <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                          {hadith.collection} • {hadith.hadithNumber}
                        </span>
                        <p className="text-xs text-[#14241D] dark:text-[#F4F3EC] line-clamp-2 mt-1 italic">
                          "{hadith.textEnglish}"
                        </p>
                        <p className="text-[11px] text-[#5C6F66] dark:text-[#9EB2A7] mt-1">
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
                  <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-amber-300 flex items-center gap-1.5 mb-2">
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
                        className="text-left p-3 rounded-2xl bg-[#FAF8F5] dark:bg-[#14241D] hover:bg-emerald-800/10 dark:hover:bg-emerald-950/60 border border-[#E8E4DC] dark:border-emerald-900/30 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-emerald-800 dark:text-amber-300">
                            #{name.number} {name.transliteration}
                          </span>
                          <span className="text-sm font-quran font-bold text-[#14241D] dark:text-[#F4F3EC]">
                            {name.arabic}
                          </span>
                        </div>
                        <p className="text-xs text-[#5C6F66] dark:text-[#9EB2A7] line-clamp-1 mt-0.5">
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
                  <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-amber-300 flex items-center gap-1.5 mb-2">
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
                        className="w-full text-left p-3 rounded-2xl bg-[#FAF8F5] dark:bg-[#14241D] hover:bg-emerald-800/10 dark:hover:bg-emerald-950/60 border border-[#E8E4DC] dark:border-emerald-900/30 flex items-center justify-between transition-colors"
                      >
                        <div>
                          <p className="text-sm font-bold text-[#14241D] dark:text-[#F4F3EC]">
                            {art.title}
                          </p>
                          <p className="text-xs text-[#5C6F66] dark:text-[#9EB2A7]">{art.subtitle}</p>
                        </div>
                        <span className="text-[11px] text-[#5C6F66] dark:text-[#9EB2A7] font-semibold">{art.readTime}</span>
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
