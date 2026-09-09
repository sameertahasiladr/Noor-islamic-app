import React, { useState, useMemo } from 'react';
import { ChevronLeft, Search, BookCheck, Copy, Share2, Check, Award, ShieldCheck } from 'lucide-react';
import { HADITH_CATEGORIES, HADITH_COLLECTIONS, HADITHS_LIST } from '../data/hadiths';
import { HadithItem } from '../types';

interface HadithViewProps {
  onBack: () => void;
}

export const HadithView: React.FC<HadithViewProps> = ({ onBack }) => {
  const [selectedCollection, setSelectedCollection] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredHadiths = useMemo(() => {
    return HADITHS_LIST.filter((h) => {
      const matchCol =
        selectedCollection === 'All' || h.collection === selectedCollection;
      const matchCat =
        selectedCategory === 'All' || h.category === selectedCategory;

      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        h.textEnglish.toLowerCase().includes(q) ||
        h.narrator.toLowerCase().includes(q) ||
        h.collection.toLowerCase().includes(q) ||
        h.hadithNumber.toLowerCase().includes(q);

      return matchCol && matchCat && matchSearch;
    });
  }, [selectedCollection, selectedCategory, searchQuery]);

  const handleCopy = (h: HadithItem) => {
    const text = `Hadith - ${h.collection} (${h.hadithNumber})\n\nNarrated by: ${h.narrator}\n\n"${h.textEnglish}"\n\nGrade: ${h.grade}\nShared via Noor App`;
    navigator.clipboard.writeText(text);
    setCopiedId(h.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleShare = (h: HadithItem) => {
    const text = `"${h.textEnglish}"\n- Narrated by ${h.narrator} [${h.collection} ${h.hadithNumber}]`;
    if (navigator.share) {
      navigator.share({ title: `Hadith from ${h.collection}`, text }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
      alert('Hadith copied to clipboard!');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 pb-20 pt-2 space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800"
        >
          <ChevronLeft className="w-4 h-4 mr-0.5" />
          <span>Back to Tools</span>
        </button>

        <span className="text-xs text-zinc-500">
          {filteredHadiths.length} Prophetic Traditions
        </span>
      </div>

      {/* Hero Banner */}
      <div className="p-5 rounded-3xl bg-gradient-to-br from-blue-950 via-zinc-900 to-emerald-950 text-white shadow-xl relative overflow-hidden border border-blue-900/40">
        <div className="relative z-10">
          <span className="text-xs uppercase font-bold tracking-widest text-amber-300">
            Sunnah of Prophet Muhammad ﷺ
          </span>
          <h1 className="text-2xl font-bold mt-1">Authentic Hadith Library</h1>
          <p className="text-xs text-zinc-300 mt-1 max-w-md">
            "I have left among you two things; you will never go astray as long as you hold fast to them: the Book of Allah and the Sunnah of His Prophet."
          </p>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search hadith texts, narrators (e.g. Abu Hurairah), intentions..."
          className="w-full pl-9 pr-4 py-2 rounded-xl bg-white dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-800 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-zinc-100"
        />
      </div>

      {/* Collection filter pills */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
        <button
          onClick={() => setSelectedCollection('All')}
          className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all ${
            selectedCollection === 'All'
              ? 'bg-blue-700 text-white shadow-sm'
              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200'
          }`}
        >
          All Collections
        </button>
        {HADITH_COLLECTIONS.map((c) => (
          <button
            key={c}
            onClick={() => setSelectedCollection(c)}
            className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all ${
              selectedCollection === c
                ? 'bg-blue-700 text-white shadow-sm'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Hadith Cards */}
      <div className="space-y-3.5">
        {filteredHadiths.map((h) => (
          <div
            key={h.id}
            className="p-5 rounded-2xl bg-white dark:bg-zinc-850 border border-zinc-200/80 dark:border-zinc-800 shadow-sm hover:border-blue-300 transition-all space-y-3"
          >
            {/* Header info */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center space-x-2">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300">
                  {h.collection} • {h.hadithNumber}
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  {h.grade}
                </span>
              </div>
              <span className="text-[11px] font-medium text-amber-700 dark:text-amber-400">
                {h.category}
              </span>
            </div>

            {/* Narrator */}
            <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              Narrated by: <span className="text-zinc-800 dark:text-zinc-200 font-bold">{h.narrator}</span>
            </p>

            {/* Arabic Hadith Text if available */}
            {h.textArabic && (
              <p
                dir="rtl"
                className="text-lg font-arabic text-right leading-loose text-zinc-900 dark:text-zinc-100 my-1"
              >
                {h.textArabic}
              </p>
            )}

            {/* English Text */}
            <p className="text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed font-normal">
              "{h.textEnglish}"
            </p>

            {/* Footer buttons */}
            <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs">
              <span className="text-[11px] text-zinc-400">
                Verified Islamic Reference
              </span>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleCopy(h)}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
                  title="Copy Hadith"
                >
                  {copiedId === h.id ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => handleShare(h)}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
                  title="Share Hadith"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
