import React, { useState } from 'react';
import { ChevronLeft, GraduationCap, BookOpen, Check, Sparkles, ChevronRight } from 'lucide-react';
import { LEARNING_TOPICS } from '../data/learning';
import { LearningTopic } from '../types';

interface LearningViewProps {
  onBack: () => void;
}

export const LearningView: React.FC<LearningViewProps> = ({ onBack }) => {
  const [selectedTopic, setSelectedTopic] = useState<LearningTopic | null>(null);

  return (
    <div className="max-w-4xl mx-auto px-4 pb-20 pt-2 space-y-4">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => {
            if (selectedTopic) {
              setSelectedTopic(null);
            } else {
              onBack();
            }
          }}
          className="flex items-center text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800"
        >
          <ChevronLeft className="w-4 h-4 mr-0.5" />
          <span>{selectedTopic ? 'Back to All Modules' : 'Back to Tools'}</span>
        </button>

        <span className="text-xs text-zinc-500">
          Islamic Learning Center
        </span>
      </div>

      {/* Hero Banner */}
      {!selectedTopic && (
        <div className="p-6 rounded-3xl bg-gradient-to-br from-teal-950 via-emerald-900 to-zinc-950 text-white shadow-xl relative overflow-hidden border border-teal-800/40">
          <div className="relative z-10">
            <span className="text-xs uppercase font-bold tracking-widest text-amber-300">
              Talab al-Ilm • طلب العلم فريضة
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold font-arabic mt-1">
              يَرْفَعِ اللَّهُ الَّذِينَ آمَنُوا مِنكُمْ وَالَّذِينَ أُوتُوا الْعِلْمَ دَرَجَاتٍ
            </h1>
            <p className="text-xs text-zinc-300 mt-1 max-w-md">
              "Allah will raise those who have believed among you and those who were given knowledge, by degrees." (Surah Al-Mujadila 58:11)
            </p>
          </div>
        </div>
      )}

      {/* TOPICS LIST */}
      {!selectedTopic ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {LEARNING_TOPICS.map((topic) => (
            <div
              key={topic.id}
              onClick={() => setSelectedTopic(topic)}
              className="p-5 rounded-2xl bg-white dark:bg-zinc-850 border border-zinc-200/80 dark:border-zinc-800 shadow-sm hover:border-emerald-500/80 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                    {topic.category}
                  </span>
                  <span className="text-xs text-zinc-400">
                    {topic.readTime}
                  </span>
                </div>

                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                  {topic.title}
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  {topic.subtitle}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs text-emerald-700 dark:text-emerald-400 font-semibold">
                <span>Start Learning</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* DETAIL ARTICLE VIEW */
        <div className="space-y-4">
          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-850 border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                {selectedTopic.category} • {selectedTopic.readTime}
              </span>
              <span className="text-xs text-zinc-400">
                Authentic Sunnah Guide
              </span>
            </div>

            <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100">
              {selectedTopic.title}
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">
              {selectedTopic.subtitle}
            </p>

            <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 space-y-6">
              {selectedTopic.content.map((sec, idx) => (
                <div key={idx} className="space-y-3">
                  <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span>{sec.heading}</span>
                  </h3>

                  <div className="space-y-2 pl-8">
                    {sec.paragraphs.map((p, pIdx) => (
                      <p key={pIdx} className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                        {p}
                      </p>
                    ))}

                    {sec.arabicQuote && (
                      <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 my-2 space-y-1.5">
                        <p
                          dir="rtl"
                          className="text-lg font-arabic text-right leading-loose text-emerald-950 dark:text-emerald-200"
                        >
                          {sec.arabicQuote.arabic}
                        </p>
                        <p className="text-xs text-zinc-700 dark:text-zinc-300 italic">
                          "{sec.arabicQuote.translation}"
                        </p>
                        <p className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                          {sec.arabicQuote.reference}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
