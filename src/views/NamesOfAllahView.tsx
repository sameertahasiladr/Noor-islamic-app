import React, { useState, useMemo } from 'react';
import { ChevronLeft, Search, Volume2, Sparkles, Award } from 'lucide-react';
import { NAMES_OF_ALLAH } from '../data/namesOfAllah';
import { NameOfAllah } from '../types';
import { audioService } from '../services/audioService';

interface NamesOfAllahViewProps {
  onBack: () => void;
}

export const NamesOfAllahView: React.FC<NamesOfAllahViewProps> = ({ onBack }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedName, setSelectedName] = useState<NameOfAllah | null>(null);

  const filteredNames = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return NAMES_OF_ALLAH;
    return NAMES_OF_ALLAH.filter(
      (n) =>
        n.transliteration.toLowerCase().includes(q) ||
        n.englishMeaning.toLowerCase().includes(q) ||
        n.arabic.includes(q) ||
        n.explanation.toLowerCase().includes(q) ||
        String(n.number) === q
    );
  }, [searchQuery]);

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
          99 Beautiful Names
        </span>
      </div>

      {/* Hero Banner */}
      <div className="p-5 rounded-3xl bg-gradient-to-br from-amber-950 via-zinc-900 to-emerald-950 text-white shadow-xl relative overflow-hidden border border-amber-800/40 text-center">
        <span className="text-xs uppercase font-bold tracking-widest text-amber-300">
          Asma ul-Husna • أسماء الله الحسنى
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold font-arabic mt-1 text-amber-200">
          وَلِلَّهِ الْأَسْمَاءُ الْحُسْنَىٰ فَادْعُوهُ بِهَا
        </h1>
        <p className="text-xs text-zinc-300 mt-1 max-w-md mx-auto">
          "And to Allah belong the best names, so invoke Him by them." (Surah Al-A'raf 7:180)
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by divine name, Arabic, or meaning (e.g. Ar-Rahman, The All-Merciful)..."
          className="w-full pl-9 pr-4 py-2 rounded-xl bg-white dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-800 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 dark:text-zinc-100"
        />
      </div>

      {/* Grid of 99 Names */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredNames.map((name) => (
          <div
            key={name.number}
            onClick={() => setSelectedName(name)}
            className="p-4 rounded-2xl bg-white dark:bg-zinc-850 border border-zinc-200/80 dark:border-zinc-800 shadow-sm hover:border-amber-400/80 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 font-bold text-xs flex items-center justify-center">
                  {name.number}
                </span>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    audioService.speakArabicText(name.arabic);
                  }}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-zinc-800 transition-colors"
                  title="Listen Pronunciation"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>

              <div className="text-center py-2">
                <p className="text-3xl font-arabic font-bold text-emerald-900 dark:text-amber-300 mb-1">
                  {name.arabic}
                </p>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-amber-600 transition-colors">
                  {name.transliteration}
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                  {name.englishMeaning}
                </p>
              </div>
            </div>

            <p className="text-[11px] text-zinc-400 dark:text-zinc-500 line-clamp-2 mt-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
              {name.explanation}
            </p>
          </div>
        ))}
      </div>

      {/* Detail Modal for Selected Name */}
      {selectedName && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-2xl border border-amber-400/40 text-center space-y-4">
            <span className="text-xs uppercase font-bold text-amber-600 tracking-wider">
              Name #{selectedName.number} of 99
            </span>

            <p className="text-5xl font-arabic font-extrabold text-emerald-800 dark:text-amber-300">
              {selectedName.arabic}
            </p>

            <div>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                {selectedName.transliteration}
              </h2>
              <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400 mt-0.5">
                "{selectedName.englishMeaning}"
              </p>
            </div>

            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed text-left bg-zinc-50 dark:bg-zinc-800/60 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-700">
              {selectedName.explanation}
            </p>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => audioService.speakArabicText(selectedName.arabic)}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex items-center gap-1.5 shadow"
              >
                <Volume2 className="w-4 h-4" />
                <span>Listen Audio</span>
              </button>

              <button
                onClick={() => setSelectedName(null)}
                className="px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-zinc-800 dark:text-zinc-200 text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
