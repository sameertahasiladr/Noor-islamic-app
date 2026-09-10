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
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#FAF8F5]/95 dark:bg-[#07130E]/95 backdrop-blur-md border-t border-[#E8E4DC] dark:border-emerald-950 transition-colors shadow-lg shadow-emerald-950/5">
      <div className="max-w-md md:max-w-2xl mx-auto flex items-center justify-around px-3 py-2 safe-area-bottom">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-2xl transition-all duration-200 group relative ${
                isActive
                  ? 'text-emerald-800 dark:text-emerald-300 font-bold'
                  : 'text-[#5C6F66] dark:text-[#9EB2A7] hover:text-[#14241D] dark:hover:text-[#F4F3EC]'
              }`}
            >
              <div
                className={`p-1.5 px-3 rounded-2xl transition-all ${
                  isActive
                    ? 'bg-emerald-800 dark:bg-emerald-950/80 text-amber-300 shadow-xs scale-105 border border-emerald-700/40'
                    : 'group-hover:bg-emerald-900/5 dark:group-hover:bg-emerald-950/40'
                }`}
              >
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'stroke-[2.3]' : 'stroke-[1.75]'}`} />
              </div>
              <span className="text-[10px] mt-1 tracking-tight font-bold">
                {tab.label}
              </span>
              {isActive && (
                <span className="absolute bottom-0 w-6 h-0.5 bg-amber-400 rounded-full shadow-[0_0_6px_#FBBF24]" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
