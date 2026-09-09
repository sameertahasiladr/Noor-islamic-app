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
      <div className="p-6 rounded-3xl bg-white dark:bg-zinc-850 border border-zinc-200/80 dark:border-zinc-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-2xl ring-4 ring-emerald-500/20 bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-800 dark:text-emerald-200 text-2xl font-bold overflow-hidden shrink-0 shadow-sm">
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
                    className="px-2.5 py-1 text-sm rounded-lg border border-emerald-500 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none ring-2 ring-emerald-500/20"
                    placeholder="Enter your name"
                    autoFocus
                  />
                  <button
                    onClick={handleSaveName}
                    className="p-1.5 rounded-lg bg-emerald-700 text-white hover:bg-emerald-800 transition-colors"
                    title="Save Name"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      setEditedName(profile.name);
                      setIsEditingName(false);
                    }}
                    className="p-1.5 rounded-lg bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-300"
                    title="Cancel"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h1 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-100">
                    {profile.name}
                  </h1>
                  {!profile.isGuest && (
                    <button
                      onClick={() => {
                        setEditedName(profile.name);
                        setIsEditingName(true);
                      }}
                      className="p-1 text-zinc-400 hover:text-emerald-600 transition-colors"
                      title="Edit Display Name"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )}

              {profile.isGuest ? (
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                  Guest Mode
                </span>
              ) : (
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  Verified Account
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 font-medium">
              {profile.email ? (
                <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
                  {profile.email}
                </span>
              ) : (
                'Data stored locally on this device'
              )}
            </p>
            <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5 flex items-center gap-1 font-medium">
              <MapPin className="w-3 h-3" />
              <span>{profile.location.city}, {profile.location.country}</span>
            </p>
            {cloudMsg && (
              <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 mt-1 animate-in fade-in">
                {cloudMsg}
              </p>
            )}
          </div>
        </div>

        <div className="shrink-0">
          {profile.isGuest ? (
            <button
              onClick={onOpenAuthModal}
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In / Sync Data</span>
            </button>
          ) : (
            <button
              onClick={handleLogout}
              className="px-3.5 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-zinc-700 dark:text-zinc-300 hover:text-rose-600 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          )}
        </div>
      </div>

      {/* Sub-tab pills */}
      <div className="flex items-center space-x-2 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl max-w-sm mx-auto">
        <button
          onClick={() => setActiveTab('bookmarks')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
            activeTab === 'bookmarks'
              ? 'bg-white dark:bg-zinc-900 text-emerald-800 dark:text-emerald-400 shadow-sm'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
          }`}
        >
          Saved Verses ({profile.bookmarks.length})
        </button>
        <button
          onClick={() => setActiveTab('progress')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
            activeTab === 'progress'
              ? 'bg-white dark:bg-zinc-900 text-emerald-800 dark:text-emerald-400 shadow-sm'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
          }`}
        >
          My Spiritual Journey
        </button>
      </div>

      {/* VIEW 1: BOOKMARKS */}
      {activeTab === 'bookmarks' && (
        <div className="space-y-3">
          {profile.bookmarks.length === 0 ? (
            <div className="p-12 text-center text-zinc-400 dark:text-zinc-500 space-y-2 bg-white dark:bg-zinc-850 rounded-2xl border border-zinc-200/80 dark:border-zinc-800">
              <Bookmark className="w-8 h-8 mx-auto text-zinc-300 dark:text-zinc-600" />
              <p className="text-sm font-semibold">No Bookmarks Saved Yet</p>
              <p className="text-xs">
                While reading the Quran, tap the bookmark icon on any Ayah to save it here for swift reflection.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {profile.bookmarks.map((bm) => (
                <div
                  key={bm.id}
                  className="p-4 rounded-2xl bg-white dark:bg-zinc-850 border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-2 hover:border-emerald-300 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                      Surah {bm.surahName} ({bm.surahNumber}:{bm.ayahNumber})
                    </span>
                    <button
                      onClick={() => handleRemoveBookmark(bm.id)}
                      className="p-1 text-zinc-400 hover:text-rose-600 transition-colors"
                      title="Remove Bookmark"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <p
                    dir="rtl"
                    className="text-lg font-arabic text-right leading-loose text-zinc-900 dark:text-zinc-100"
                  >
                    {bm.arabicText}
                  </p>

                  <p className="text-xs text-zinc-600 dark:text-zinc-300 italic">
                    "{bm.translation}"
                  </p>

                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => {
                        onNavigateTab('quran');
                        onSelectSurah(bm.surahNumber);
                      }}
                      className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1"
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
            <div className="p-4 rounded-2xl bg-white dark:bg-zinc-850 border border-zinc-200/80 dark:border-zinc-800 text-center shadow-sm">
              <BookOpen className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
              <span className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100">
                {profile.quranProgress.percentage}%
              </span>
              <p className="text-[11px] text-zinc-400 mt-0.5">Quran Completed</p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-zinc-850 border border-zinc-200/80 dark:border-zinc-800 text-center shadow-sm">
              <Sparkles className="w-5 h-5 text-amber-500 mx-auto mb-1" />
              <span className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100">
                {(profile.tasbihTotal || 0).toLocaleString()}
              </span>
              <p className="text-[11px] text-zinc-400 mt-0.5">Total Dhikr (Tasbih)</p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-zinc-850 border border-zinc-200/80 dark:border-zinc-800 text-center shadow-sm">
              <Award className="w-5 h-5 text-indigo-500 mx-auto mb-1" />
              <span className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100">
                {profile.quizScore || 0}
              </span>
              <p className="text-[11px] text-zinc-400 mt-0.5">Quiz Mastery Pts</p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-zinc-850 border border-zinc-200/80 dark:border-zinc-800 text-center shadow-sm">
              <Clock className="w-5 h-5 text-rose-500 mx-auto mb-1" />
              <span className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100">
                {totalMissedPrayers}
              </span>
              <p className="text-[11px] text-zinc-400 mt-0.5">Qada Prayers Due</p>
            </div>
          </div>

          {/* Detailed Quran Reading Journey Card */}
          <div className="p-5 rounded-2xl bg-white dark:bg-zinc-850 border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Khatm al-Quran Progress
              </h3>
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                {profile.quranProgress.completedSurahs.length} / 114 Surahs
              </span>
            </div>

            <div className="w-full h-2.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-600 rounded-full transition-all"
                style={{ width: `${profile.quranProgress.percentage}%` }}
              />
            </div>

            <p className="text-xs text-zinc-500">
              Last read: Surah {profile.quranProgress.lastReadSurah}, Ayah {profile.quranProgress.lastReadAyah}. Regularly reciting the Quran illuminates the grave and heart.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
