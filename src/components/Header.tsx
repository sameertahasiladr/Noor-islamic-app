import React from 'react';
import { Moon, Sun, Search, Bell, MapPin, Sparkles, Mic } from 'lucide-react';
import { UserProfile, HijriDate } from '../types';

interface HeaderProps {
  profile: UserProfile;
  hijriDate: HijriDate;
  isDark: boolean;
  isVoiceActive?: boolean;
  onToggleTheme: () => void;
  onOpenSearch: () => void;
  onOpenVoiceNav: () => void;
  onOpenProfile: () => void;
  onOpenLocationModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  profile,
  hijriDate,
  isDark,
  isVoiceActive = false,
  onToggleTheme,
  onOpenSearch,
  onOpenVoiceNav,
  onOpenProfile,
  onOpenLocationModal,
}) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 4 && hour < 12) return 'Sabah al-Khayr';
    if (hour >= 12 && hour < 17) return 'Assalamu Alaikum';
    return 'Masa\' al-Khayr';
  };

  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border-b border-emerald-900/10 dark:border-emerald-500/10 transition-colors">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Left: User greeting & Hijri date */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onOpenProfile}
            className="relative group focus:outline-none"
            title="View Profile"
          >
            <div className="w-10 h-10 rounded-full ring-2 ring-emerald-600/30 dark:ring-emerald-400/30 overflow-hidden bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-800 dark:text-emerald-200 font-semibold shadow-sm">
              {profile.avatar ? (
                <img
                  src={profile.avatar}
                  alt={profile.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                profile.name.charAt(0)
              )}
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-zinc-900" />
          </button>

          <div className="flex flex-col">
            <div className="flex items-center space-x-1.5">
              <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                {getGreeting()}
              </span>
              {profile.isGuest && (
                <span className="text-[10px] uppercase tracking-wider bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-semibold px-1.5 py-0.2 rounded">
                  Guest
                </span>
              )}
            </div>
            <h1 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-50 leading-tight">
              {profile.name}
            </h1>
            <button
              onClick={onOpenLocationModal}
              className="flex items-center text-[11px] text-zinc-500 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors text-left"
            >
              <MapPin className="w-2.5 h-2.5 mr-0.5" />
              <span>{profile.location.city}, {profile.location.country}</span>
            </button>
          </div>
        </div>

        {/* Right action controls */}
        <div className="flex items-center space-x-1.5">
          {/* Hands-free Voice Navigation trigger */}
          <button
            onClick={onOpenVoiceNav}
            className={`relative p-2 rounded-xl transition-all ${
              isVoiceActive
                ? 'bg-emerald-600 text-white shadow-md ring-2 ring-emerald-400/50'
                : 'text-zinc-600 dark:text-zinc-300 hover:bg-emerald-50 dark:hover:bg-zinc-800 hover:text-emerald-700 dark:hover:text-emerald-400'
            }`}
            title="Hands-Free Voice Navigation (Speak to navigate)"
            aria-label="Voice Navigation"
          >
            <Mic className="w-4 h-4" />
            {isVoiceActive && (
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping" />
            )}
          </button>

          {/* Global search trigger */}
          <button
            onClick={onOpenSearch}
            className="p-2 rounded-xl text-zinc-600 dark:text-zinc-300 hover:bg-emerald-50 dark:hover:bg-zinc-800 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors"
            title="Global Search (Duas, Quran, Hadith)"
            aria-label="Search"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Theme toggle */}
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-xl text-zinc-600 dark:text-zinc-300 hover:bg-emerald-50 dark:hover:bg-zinc-800 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-emerald-800" />}
          </button>

          {/* Hijri badge pill */}
          <div className="hidden sm:flex flex-col text-right pl-2 border-l border-zinc-200 dark:border-zinc-800">
            <span className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-400 font-arabic">
              {hijriDate.formattedArabic}
            </span>
            <span className="text-[10px] text-zinc-500 dark:text-zinc-400">
              {hijriDate.formatted}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
