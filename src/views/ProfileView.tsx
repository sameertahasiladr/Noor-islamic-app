import React, { useState } from 'react';
import {
  Bookmark,
  Award,
  Clock,
  Sparkles,
  BookOpen,
  LogIn,
  LogOut,
  Check,
  ChevronRight,
  Trash2,
  MapPin,
  ShieldCheck,
  Edit2,
} from 'lucide-react';
import { AppTab, UserProfile } from '../types';
import { storageService } from '../services/storageService';
import { autoDetectAndApplyLocation } from '../services/locationService';
import {
  logOutUser,
} from '../services/firebase';

interface ProfileViewProps {
  profile: UserProfile;
  isDark: boolean;
  onToggleTheme: () => void;
  onOpenAuthModal: () => void;
  onUpdateProfile: (p: UserProfile) => void;
  onNavigateTab: (tab: AppTab) => void;
  onSelectSurah: (num: number) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  profile,
  onOpenAuthModal,
  onUpdateProfile,
  onNavigateTab,
  onSelectSurah,
}) => {
  const [activeTab, setActiveTab] = useState<'bookmarks' | 'progress'>('bookmarks');
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(profile.name);
  const [cloudMsg, setCloudMsg] = useState<string | null>(null);

  const handleRemoveBookmark = (bmId: string) => {
    storageService.removeBookmark(bmId);
    onUpdateProfile(storageService.getProfile());
  };

  const handleLogout = async () => {
    try {
      await logOutUser();
    } catch (e) {
      console.warn('Logout notice:', e);
    }
    storageService.setActiveUser(null);
    const guestProfile = storageService.getGuestProfile();
    onUpdateProfile(guestProfile);
    autoDetectAndApplyLocation(guestProfile, onUpdateProfile).catch((err) => {
      console.info('[ProfileView] Auto location detection on logout into guest notice:', err);
    });
    onOpenAuthModal();
  };

  const handleSaveName = async () => {
    const trimmed = editedName.trim();
    if (!trimmed) return;
    const updated: UserProfile = {
      ...profile,
      name: trimmed,
      avatar: profile.avatar?.includes('dicebear')
        ? `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(trimmed)}`
        : profile.avatar,
    };
    onUpdateProfile(updated);
    storageService.saveProfile(updated);
    setIsEditingName(false);
    setCloudMsg('Name updated & synced!');
    setTimeout(() => setCloudMsg(null), 2500);
  };

  const totalMissedPrayers = Object.values(profile.qadaPrayers || {}).reduce((a: number, b: number) => a + b, 0);

  return (
    <div className="max-w-4xl mx-auto px-4 pb-20 pt-2 space-y-4">
      {/* Profile Header Card */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#0D1E17] border border-[#E8E4DC] dark:border-emerald-900/30 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-2xl ring-4 ring-emerald-700/15 bg-emerald-800/10 dark:bg-emerald-950 flex items-center justify-center text-emerald-800 dark:text-amber-300 text-2xl font-bold overflow-hidden shrink-0 shadow-xs border border-emerald-700/20">
            {profile.avatar ? (
              <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
            ) : (
              profile.name.charAt(0)
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              {isEditingName ? (
                <div className="flex items-center gap-1.5 my-1">
                  <input
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className="px-3 py-1 text-sm rounded-xl border border-emerald-600 bg-white dark:bg-[#14241D] text-[#14241D] dark:text-[#F4F3EC] focus:outline-none ring-2 ring-emerald-600/20"
                    placeholder="Enter your name"
                    autoFocus
                  />
                  <button
                    onClick={handleSaveName}
                    className="p-1.5 rounded-xl bg-emerald-800 text-white hover:bg-emerald-900 transition-colors"
                    title="Save Name"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      setEditedName(profile.name);
                      setIsEditingName(false);
                    }}
                    className="p-1.5 rounded-xl bg-[#ECE7DE] dark:bg-zinc-800 text-[#5C6F66] dark:text-[#9EB2A7] hover:bg-[#E0DBD0]"
                    title="Cancel"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h1 className="text-lg sm:text-xl font-bold text-[#14241D] dark:text-[#F4F3EC]">
                    {profile.name}
                  </h1>
                  {!profile.isGuest && (
                    <button
                      onClick={() => {
                        setEditedName(profile.name);
                        setIsEditingName(true);
                      }}
                      className="p-1 text-[#5C6F66] hover:text-emerald-800 transition-colors"
                      title="Edit Display Name"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )}

              {profile.isGuest ? (
                <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300/40">
                  Guest Mode
                </span>
              ) : (
                <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-800/10 dark:bg-emerald-950 text-emerald-800 dark:text-amber-300 flex items-center gap-1 border border-emerald-700/20">
                  <ShieldCheck className="w-3 h-3 text-amber-500" />
                  Verified Account
                </span>
              )}
            </div>
            <p className="text-xs text-[#5C6F66] dark:text-[#9EB2A7] mt-0.5 font-medium">
              {profile.email ? (
                <span className="text-emerald-800 dark:text-amber-300 font-semibold">
                  {profile.email}
                </span>
              ) : (
                'Data stored locally on this device'
              )}
            </p>
            <p className="text-xs text-emerald-800 dark:text-amber-300 mt-0.5 flex items-center gap-1 font-semibold">
              <MapPin className="w-3 h-3 text-amber-500" />
              <span>{profile.location.city}, {profile.location.country}</span>
            </p>
            {cloudMsg && (
              <p className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 mt-1 animate-in fade-in">
                {cloudMsg}
              </p>
            )}
          </div>
        </div>

        <div className="shrink-0">
          {profile.isGuest ? (
            <button
              onClick={onOpenAuthModal}
              className="w-full sm:w-auto px-4 py-2.5 rounded-2xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors"
            >
              <LogIn className="w-3.5 h-3.5 text-amber-300" />
              <span>Sign In / Sync Data</span>
            </button>
          ) : (
            <button
              onClick={handleLogout}
              className="px-3.5 py-2 rounded-2xl bg-[#FAF8F5] dark:bg-[#14241D] hover:bg-rose-50 dark:hover:bg-rose-950/40 text-[#5C6F66] hover:text-rose-600 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border border-[#E8E4DC] dark:border-emerald-900/30"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          )}
        </div>
      </div>

      {/* Sub-tab pills */}
      <div className="flex items-center space-x-1 p-1 bg-[#ECE7DE] dark:bg-[#0A1A13] rounded-2xl max-w-sm mx-auto border border-[#E0DBD0] dark:border-emerald-950/80">
        <button
          onClick={() => setActiveTab('bookmarks')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'bookmarks'
              ? 'bg-white dark:bg-[#0D1E17] text-emerald-800 dark:text-amber-300 shadow-xs'
              : 'text-[#5C6F66] dark:text-[#9EB2A7] hover:text-[#14241D]'
          }`}
        >
          Saved Verses ({profile.bookmarks.length})
        </button>
        <button
          onClick={() => setActiveTab('progress')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'progress'
              ? 'bg-white dark:bg-[#0D1E17] text-emerald-800 dark:text-amber-300 shadow-xs'
              : 'text-[#5C6F66] dark:text-[#9EB2A7] hover:text-[#14241D]'
          }`}
        >
          My Spiritual Journey
        </button>
      </div>

      {/* VIEW 1: BOOKMARKS */}
      {activeTab === 'bookmarks' && (
        <div className="space-y-3">
          {profile.bookmarks.length === 0 ? (
            <div className="p-12 text-center text-[#5C6F66] dark:text-[#9EB2A7] space-y-2 bg-white dark:bg-[#0D1E17] rounded-3xl border border-[#E8E4DC] dark:border-emerald-900/30 shadow-xs">
              <Bookmark className="w-8 h-8 mx-auto text-[#8F9E96] dark:text-emerald-900" />
              <p className="text-sm font-bold text-[#14241D] dark:text-[#F4F3EC]">No Bookmarks Saved Yet</p>
              <p className="text-xs max-w-sm mx-auto">
                While reading the Quran, tap the bookmark icon on any Ayah to save it here for swift reflection.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {profile.bookmarks.map((bm) => (
                <div
                  key={bm.id}
                  className="p-5 rounded-3xl bg-white dark:bg-[#0D1E17] border border-[#E8E4DC] dark:border-emerald-900/30 shadow-xs space-y-2 hover:border-amber-400/60 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-800 dark:text-amber-300">
                      Surah {bm.surahName} ({bm.surahNumber}:{bm.ayahNumber})
                    </span>
                    <button
                      onClick={() => handleRemoveBookmark(bm.id)}
                      className="p-1 text-[#5C6F66] hover:text-rose-600 transition-colors"
                      title="Remove Bookmark"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <p
                    dir="rtl"
                    className="text-xl font-quran text-right leading-loose text-[#14241D] dark:text-[#F4F3EC]"
                  >
                    {bm.arabicText}
                  </p>

                  <p className="text-xs text-[#5C6F66] dark:text-[#9EB2A7] italic">
                    "{bm.translation}"
                  </p>

                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => {
                        onNavigateTab('quran');
                        onSelectSurah(bm.surahNumber);
                      }}
                      className="text-xs font-bold text-emerald-800 dark:text-amber-300 hover:text-emerald-900 flex items-center gap-1"
                    >
                      <span>Read in Context</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: PROGRESS */}
      {activeTab === 'progress' && (
        <div className="space-y-4">
          {/* Stats Bento Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-3xl bg-white dark:bg-[#0D1E17] border border-[#E8E4DC] dark:border-emerald-900/30 text-center shadow-xs">
              <div className="w-9 h-9 rounded-2xl bg-emerald-800/10 dark:bg-emerald-950 flex items-center justify-center mx-auto mb-2 text-emerald-800 dark:text-emerald-300">
                <BookOpen className="w-4 h-4" />
              </div>
              <span className="text-2xl font-extrabold text-[#14241D] dark:text-[#F4F3EC]">
                {profile.quranProgress.percentage}%
              </span>
              <p className="text-[11px] text-[#5C6F66] dark:text-[#9EB2A7] mt-0.5 font-medium">Quran Completed</p>
            </div>

            <div className="p-4 rounded-3xl bg-white dark:bg-[#0D1E17] border border-[#E8E4DC] dark:border-emerald-900/30 text-center shadow-xs">
              <div className="w-9 h-9 rounded-2xl bg-amber-400/10 dark:bg-amber-950 flex items-center justify-center mx-auto mb-2 text-amber-600 dark:text-amber-400">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-2xl font-extrabold text-[#14241D] dark:text-[#F4F3EC]">
                {(profile.tasbihTotal || 0).toLocaleString()}
              </span>
              <p className="text-[11px] text-[#5C6F66] dark:text-[#9EB2A7] mt-0.5 font-medium">Total Dhikr</p>
            </div>

            <div className="p-4 rounded-3xl bg-white dark:bg-[#0D1E17] border border-[#E8E4DC] dark:border-emerald-900/30 text-center shadow-xs">
              <div className="w-9 h-9 rounded-2xl bg-emerald-800/10 dark:bg-emerald-950 flex items-center justify-center mx-auto mb-2 text-emerald-800 dark:text-amber-300">
                <Award className="w-4 h-4" />
              </div>
              <span className="text-2xl font-extrabold text-[#14241D] dark:text-[#F4F3EC]">
                {profile.quizScore || 0}
              </span>
              <p className="text-[11px] text-[#5C6F66] dark:text-[#9EB2A7] mt-0.5 font-medium">Quiz Mastery Pts</p>
            </div>

            <div className="p-4 rounded-3xl bg-white dark:bg-[#0D1E17] border border-[#E8E4DC] dark:border-emerald-900/30 text-center shadow-xs">
              <div className="w-9 h-9 rounded-2xl bg-rose-500/10 dark:bg-rose-950 flex items-center justify-center mx-auto mb-2 text-rose-600 dark:text-rose-400">
                <Clock className="w-4 h-4" />
              </div>
              <span className="text-2xl font-extrabold text-[#14241D] dark:text-[#F4F3EC]">
                {totalMissedPrayers}
              </span>
              <p className="text-[11px] text-[#5C6F66] dark:text-[#9EB2A7] mt-0.5 font-medium">Qada Due</p>
            </div>
          </div>

          {/* Detailed Quran Reading Journey Card */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#0D1E17] border border-[#E8E4DC] dark:border-emerald-900/30 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#14241D] dark:text-[#F4F3EC]">
                Khatm al-Quran Progress
              </h3>
              <span className="text-xs font-bold text-emerald-800 dark:text-amber-300">
                {profile.quranProgress.completedSurahs.length} / 114 Surahs
              </span>
            </div>

            <div className="w-full h-2.5 bg-[#ECE7DE] dark:bg-[#0A1A13] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#064E3B] to-amber-500 rounded-full transition-all"
                style={{ width: `${profile.quranProgress.percentage}%` }}
              />
            </div>

            <p className="text-xs text-[#5C6F66] dark:text-[#9EB2A7] font-medium">
              Last read: Surah {profile.quranProgress.lastReadSurah}, Ayah {profile.quranProgress.lastReadAyah}. Regularly reciting the Quran illuminates the grave and heart.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
