import React from 'react';
import { Home, Clock, BookOpen, Compass, User } from 'lucide-react';
import { AppTab } from '../types';

interface BottomNavProps {
  activeTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onSelectTab }) => {
  const tabs = [
    { id: 'home' as AppTab, label: 'Home', icon: Home, arabic: 'الرئيسية' },
    { id: 'prayer' as AppTab, label: 'Prayer', icon: Clock, arabic: 'الصلاة' },
    { id: 'quran' as AppTab, label: 'Quran', icon: BookOpen, arabic: 'القرآن' },
    { id: 'explore' as AppTab, label: 'Explore', icon: Compass, arabic: 'المزيد' },
    { id: 'profile' as AppTab, label: 'Profile', icon: User, arabic: 'حسابي' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-lg border-t border-zinc-200/80 dark:border-zinc-800 transition-colors shadow-lg">
      <div className="max-w-md md:max-w-2xl mx-auto flex items-center justify-around px-2 py-1.5 safe-area-bottom">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all duration-200 group relative ${
                isActive
                  ? 'text-emerald-700 dark:text-emerald-400 font-semibold'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              <div
                className={`p-1.5 rounded-xl transition-all ${
                  isActive
                    ? 'bg-emerald-100/70 dark:bg-emerald-950/70 shadow-sm scale-105'
                    : 'group-hover:bg-zinc-100 dark:group-hover:bg-zinc-800/60'
                }`}
              >
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'stroke-[2.4]' : 'stroke-[1.8]'}`} />
              </div>
              <span className="text-[11px] mt-0.5 tracking-tight font-medium">
                {tab.label}
              </span>
              {isActive && (
                <span className="absolute bottom-0 w-8 h-0.5 bg-gradient-to-r from-emerald-600 to-amber-500 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
