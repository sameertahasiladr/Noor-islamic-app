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
    <header className="sticky top-0 z-30 bg-[#FAF8F5]/95 dark:bg-[#07130E]/95 backdrop-blur-md border-b border-[#E8E4DC] dark:border-emerald-950/80 transition-colors">
      <div className="max-w-4xl mx-auto px-4 py-2.5 flex items-center justify-between">
        {/* Left: User greeting & Profile */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onOpenProfile}
            className="relative group focus:outline-none"
            title="View Profile"
          >
            <div className="w-10 h-10 rounded-2xl ring-2 ring-emerald-700/20 dark:ring-emerald-400/20 overflow-hidden bg-emerald-800 dark:bg-emerald-950 flex items-center justify-center text-emerald-100 font-bold text-sm shadow-sm transition-transform group-hover:scale-105">
              {profile.avatar ? (
                <img
                  src={profile.avatar}
                  alt={profile.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                profile.name.charAt(0).toUpperCase()
              )}
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-amber-400 rounded-full border-2 border-[#FAF8F5] dark:border-[#07130E]" />
          </button>

          <div className="flex flex-col text-left">
            <div className="flex items-center space-x-1.5">
              <span className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-400 tracking-tight flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5 text-amber-500" />
                {getGreeting()}
              </span>
              {profile.isGuest ? (
                <span className="text-[9px] uppercase tracking-wider bg-amber-100/80 dark:bg-amber-950/50 text-amber-900 dark:text-amber-300 font-bold px-1.5 py-0.5 rounded-md border border-amber-300/40">
                  Guest
                </span>
              ) : (
                <span className="text-[9px] uppercase tracking-wider bg-emerald-100/80 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 font-bold px-1.5 py-0.5 rounded-md border border-emerald-300/40">
                  Member
                </span>
              )}
            </div>
            <h1 className="text-sm sm:text-base font-extrabold text-[#14241D] dark:text-[#F4F3EC] leading-tight tracking-tight">
              {profile.name}
            </h1>
            <button
              onClick={onOpenLocationModal}
              className="flex items-center text-[11px] text-[#5C6F66] dark:text-[#9EB2A7] hover:text-emerald-800 dark:hover:text-emerald-300 transition-colors text-left font-medium mt-0.5"
            >
              <MapPin className="w-3 h-3 text-emerald-700 dark:text-emerald-400 mr-1 shrink-0" />
              <span className="truncate max-w-[150px] sm:max-w-none">{profile.location.city}, {profile.location.country}</span>
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
                ? 'bg-emerald-800 text-white shadow-md ring-2 ring-amber-400/50'
                : 'text-[#4B5E54] dark:text-[#9EB2A7] hover:bg-emerald-900/5 dark:hover:bg-emerald-950/60 hover:text-emerald-800 dark:hover:text-emerald-300'
            }`}
            title="Hands-Free Voice Navigation (Speak to navigate)"
            aria-label="Voice Navigation"
          >
            <Mic className="w-4 h-4" />
            {isVoiceActive && (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-amber-400 rounded-full animate-ping" />
            )}
          </button>

          {/* Global search trigger */}
          <button
            onClick={onOpenSearch}
            className="p-2 rounded-xl text-[#4B5E54] dark:text-[#9EB2A7] hover:bg-emerald-900/5 dark:hover:bg-emerald-950/60 hover:text-emerald-800 dark:hover:text-emerald-300 transition-colors"
            title="Global Search (Duas, Quran, Hadith)"
            aria-label="Search"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Theme toggle */}
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-xl text-[#4B5E54] dark:text-[#9EB2A7] hover:bg-emerald-900/5 dark:hover:bg-emerald-950/60 hover:text-emerald-800 dark:hover:text-emerald-300 transition-colors"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-emerald-800" />}
          </button>

          {/* Hijri badge pill */}
          <div className="hidden sm:flex flex-col text-right pl-2.5 border-l border-[#E8E4DC] dark:border-emerald-950">
            <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-400 font-arabic">
              {hijriDate.formattedArabic}
            </span>
            <span className="text-[10px] font-medium text-[#5C6F66] dark:text-[#9EB2A7]">
              {hijriDate.formatted}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
