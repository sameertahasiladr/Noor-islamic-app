import React from 'react';
import { Compass, Sparkles, Heart, BookCheck, Moon, Calculator, MapPin, GraduationCap, HelpCircle, Calendar, Bookmark, Award } from 'lucide-react';
import { ExploreFeature } from '../types';

interface ExploreViewProps {
  onSelectFeature: (feature: ExploreFeature) => void;
}

export const ExploreView: React.FC<ExploreViewProps> = ({ onSelectFeature }) => {
  const tools = [
    {
      id: 'qibla' as ExploreFeature,
      title: 'Qibla Direction',
      arabic: 'اتجاه القبلة',
      description: 'Accurate compass toward the Holy Kaaba in Makkah with real-time degrees and distance.',
      icon: Compass,
      color: 'from-amber-600 to-amber-700',
      badge: 'Sensors Ready',
    },
    {
      id: 'tasbih' as ExploreFeature,
      title: 'Digital Tasbih',
      arabic: 'المسبحة الإلكترونية',
      description: 'Counter with haptic vibration, preset Dhikr (SubhanAllah, Alhamdulillah, Allahu Akbar), and history.',
      icon: Sparkles,
      color: 'from-emerald-600 to-teal-700',
      badge: 'Sound & Vibrate',
    },
    {
      id: 'duas' as ExploreFeature,
      title: 'Duas & Supplications',
      arabic: 'الأدعية المأثورة',
      description: 'Authentic prayers from Hisn al-Muslim for morning, evening, protection, forgiveness, and travel.',
      icon: Heart,
      color: 'from-rose-600 to-rose-700',
      badge: '10 Categories',
    },
    {
      id: 'hadith' as ExploreFeature,
      title: 'Authentic Hadith',
      arabic: 'الأحاديث النبوية',
      description: 'Curated traditions from Sahih al-Bukhari, Sahih Muslim, and 40 Hadith an-Nawawi with scholarly grades.',
      icon: BookCheck,
      color: 'from-blue-600 to-indigo-700',
      badge: 'Authentic',
    },
    {
      id: 'names' as ExploreFeature,
      title: '99 Names of Allah',
      arabic: 'أسماء الله الحسنى',
      description: 'Asma ul-Husna with exquisite Arabic calligraphy, English meanings, and spiritual explanations.',
      icon: Award,
      color: 'from-amber-700 to-emerald-800',
      badge: 'Complete 99',
    },
    {
      id: 'ramadan' as ExploreFeature,
      title: 'Ramadan Dashboard',
      arabic: 'أدوات رمضان المبارك',
      description: 'Suhoor & Iftar countdown, daily fasting tracker, Taraweeh tracker, and Laylat al-Qadr duas.',
      icon: Moon,
      color: 'from-teal-700 to-emerald-900',
      badge: 'Blessed Month',
    },
    {
      id: 'zakat' as ExploreFeature,
      title: 'Zakat Calculator',
      arabic: 'حاسبة الزكاة',
      description: 'Calculate 2.5% Zakat on cash, gold, silver, investments, and business stock with current Nisab.',
      icon: Calculator,
      color: 'from-emerald-700 to-teal-800',
      badge: 'Instant Fiqh',
    },
    {
      id: 'mosques' as ExploreFeature,
      title: 'Mosque Finder',
      arabic: 'دليل المساجد',
      description: 'Discover nearby Masjids, prayer facilities, women sections, walking distance, and directions.',
      icon: MapPin,
      color: 'from-indigo-600 to-indigo-800',
      badge: 'Verified',
    },
    {
      id: 'learning' as ExploreFeature,
      title: 'Islamic Learning',
      arabic: 'التعليم الإسلامي',
      description: 'Step-by-step guides for Wudu, Salah with rakats, 5 Pillars, and stories of the Prophets.',
      icon: GraduationCap,
      color: 'from-teal-600 to-cyan-700',
      badge: 'Comprehensive',
    },
    {
      id: 'quiz' as ExploreFeature,
      title: 'Islamic Quiz',
      arabic: 'مسابقات إسلامية',
      description: 'Test your knowledge across Quran, Hadith, Seerah, and Fiqh with Beginner, Medium, and Hard tiers.',
      icon: HelpCircle,
      color: 'from-amber-600 to-orange-700',
      badge: 'Score & Learn',
    },
    {
      id: 'calendar' as ExploreFeature,
      title: 'Hijri Calendar & Events',
      arabic: 'التقويم الهجري',
      description: 'Islamic dates, holy months, upcoming events (Ashura, Ramadan, Eid al-Fitr, Eid al-Adha, Mawlid).',
      icon: Calendar,
      color: 'from-emerald-800 to-teal-900',
      badge: '1447 AH',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 pb-20 pt-2 space-y-4">
      {/* Header */}
      <div className="p-5 rounded-3xl bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-950 text-white shadow-xl relative overflow-hidden border border-emerald-700/40">
        <div className="relative z-10">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-300">
            Comprehensive Suite
          </span>
          <h1 className="text-2xl font-bold mt-1">Islamic Tools & Companionship</h1>
          <p className="text-xs text-emerald-200/80 mt-1 max-w-md">
            Everything a believer needs for daily worship, reflection, learning, and peace of mind in one respectful sanctuary.
          </p>
        </div>
      </div>

      {/* Grid of Tools */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <button
              key={tool.id}
              onClick={() => onSelectFeature(tool.id)}
              className="p-4 rounded-2xl bg-white dark:bg-zinc-850 hover:bg-emerald-50/50 dark:hover:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-800 text-left transition-all hover:scale-[1.01] hover:shadow-md flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tool.color} text-white flex items-center justify-center shadow-md group-hover:rotate-3 transition-transform`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                    {tool.badge}
                  </span>
                </div>

                <div className="flex items-baseline justify-between">
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-400">
                    {tool.title}
                  </h3>
                  <span className="text-xs font-arabic font-semibold text-emerald-800 dark:text-emerald-300">
                    {tool.arabic}
                  </span>
                </div>

                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5 leading-relaxed line-clamp-2">
                  {tool.description}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs text-emerald-700 dark:text-emerald-400 font-semibold">
                <span>Open Tool</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
