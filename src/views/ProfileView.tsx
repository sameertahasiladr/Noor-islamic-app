import React, { useState } from 'react';
import {
  User,
  Bookmark,
  Award,
  Clock,
  Sparkles,
  BookOpen,
  Settings,
  LogIn,
  LogOut,
  Check,
  ChevronRight,
  Moon,
  Sun,
  Trash2,
  MapPin,
  Database,
  RefreshCw,
  ShieldCheck,
  Edit2,
  Save,
  RotateCcw,
} from 'lucide-react';
import { AppTab, QuranBookmark, UserProfile } from '../types';
import { storageService } from '../services/storageService';
import { autoDetectAndApplyLocation } from '../services/locationService';
import {
  auth,
  logOutUser,
  saveUserProfileToFirestore,
  fetchUserProfileFromFirestore,
  buildActualUserProfile,
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
  isDark,
  onToggleTheme,
  onOpenAuthModal,
  onUpdateProfile,
  onNavigateTab,
  onSelectSurah,
}) => {
  const [activeTab, setActiveTab] = useState<'bookmarks' | 'progress' | 'settings'>('bookmarks');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);
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

  const handleResetCleanAccount = async () => {
    if (profile.isGuest || !profile.id || profile.id === 'guest_default') return;
    const confirmed = window.confirm(
      'Reset account data to clean state? This removes any old guest test data from your account.'
    );
    if (!confirmed) return;

    setIsSyncing(true);
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        const fresh = buildActualUserProfile(currentUser, null);
        await saveUserProfileToFirestore(currentUser.uid, fresh);
        storageService.saveProfile(fresh, false);
        onUpdateProfile(fresh);
        setCloudMsg('Account data reset to clean profile.');
        setTimeout(() => setCloudMsg(null), 3000);
      }
    } catch (e) {
      console.error('Reset failed:', e);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleManualSync = async () => {
    if (profile.isGuest || !profile.id || profile.id === 'guest_default') {
      onOpenAuthModal();
      return;
    }
    setIsSyncing(true);
    setSyncSuccess(false);
    try {
      await saveUserProfileToFirestore(profile.id, profile);
      setSyncSuccess(true);
      setTimeout(() => setSyncSuccess(false), 2500);
    } catch (e) {
      console.error('Manual sync failed:', e);
    } finally {
      setIsSyncing(false);
    }
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
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
            activeTab === 'settings'
              ? 'bg-white dark:bg-zinc-900 text-emerald-800 dark:text-emerald-400 shadow-sm'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
          }`}
        >
          Preferences
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

      {/* VIEW 3: SETTINGS */}
      {activeTab === 'settings' && (
        <div className="space-y-4">
          {/* Appearance Settings */}
          <div className="p-4 rounded-2xl bg-white dark:bg-zinc-850 border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Appearance & Font
            </h3>

            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-700 dark:text-zinc-300">
                Dark Mode (Deep Emerald & Night Canvas)
              </span>
              <button
                onClick={onToggleTheme}
                className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
              >
                {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-emerald-800" />}
              </button>
            </div>
          </div>

          {/* Data Backup & Cloud Sync */}
          <div className="p-5 rounded-2xl bg-white dark:bg-zinc-850 border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    Firebase Firestore Database
                  </h3>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    {profile.isGuest
                      ? 'Local storage mode • Cloud backup inactive'
                      : 'Real-time synchronization active'}
                  </p>
                </div>
              </div>

              {!profile.isGuest && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Synced
                </span>
              )}
            </div>

            <div className="text-xs text-zinc-600 dark:text-zinc-400 space-y-1.5 leading-relaxed bg-zinc-50 dark:bg-zinc-900 p-3.5 rounded-xl border border-zinc-200/60 dark:border-zinc-800">
              <div className="flex justify-between py-1 border-b border-zinc-200/40 dark:border-zinc-800">
                <span className="text-zinc-500">Database Engine:</span>
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">Google Cloud Firestore</span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-200/40 dark:border-zinc-800">
                <span className="text-zinc-500">Authentication:</span>
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                  {profile.isGuest ? 'Guest (Local Only)' : 'Firebase Auth (Verified)'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-200/40 dark:border-zinc-800">
                <span className="text-zinc-500">Active Account ID:</span>
                <span className="font-mono text-[11px] text-zinc-700 dark:text-zinc-300 truncate max-w-[180px]">
                  {profile.id}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-zinc-500">Synchronized Items:</span>
                <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                  Bookmarks, Dhikr, Qada, Settings
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              {profile.isGuest ? (
                <button
                  type="button"
                  onClick={onOpenAuthModal}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Sign In with Google to Activate Database Backup</span>
                </button>
              ) : (
                <div className="flex flex-col sm:flex-row gap-2 w-full">
                  <button
                    type="button"
                    onClick={handleManualSync}
                    disabled={isSyncing}
                    className="flex-1 py-2.5 px-4 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 hover:bg-emerald-100 font-semibold text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                  >
                    {isSyncing ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-emerald-700 dark:border-emerald-300 border-t-transparent rounded-full animate-spin" />
                        <span>Saving to Firestore...</span>
                      </>
                    ) : syncSuccess ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span className="font-bold text-emerald-700 dark:text-emerald-300">Synchronized!</span>
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Push State to Cloud</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleResetCleanAccount}
                    disabled={isSyncing}
                    className="py-2.5 px-3 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 hover:bg-rose-100 text-xs font-semibold flex items-center justify-center gap-1.5"
                    title="Purge any old guest data from your user account and reset to clean state"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Purge Guest Artifacts</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
