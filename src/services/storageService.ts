import { UserProfile, QuranBookmark, TasbihRecord } from '../types';
import {
  saveUserProfileToFirestore,
  saveBookmarkToFirestore,
  deleteBookmarkFromFirestore,
  saveTasbihLogToFirestore,
} from './firebase';

const GUEST_STORAGE_KEY = 'noor_guest_profile';
const ACTIVE_UID_KEY = 'noor_active_uid';
const getUserKey = (uid: string) => `noor_user_profile_${uid}`;

const isIndiaUser = typeof Intl !== 'undefined' && (
  Intl.DateTimeFormat().resolvedOptions().timeZone === 'Asia/Kolkata' ||
  Intl.DateTimeFormat().resolvedOptions().timeZone === 'Asia/Calcutta' ||
  new Date().getTimezoneOffset() === -330
);

export const DEFAULT_GUEST_PROFILE: UserProfile = {
  id: 'guest_default',
  name: 'Guest Seeker',
  email: undefined,
  avatar: undefined,
  isGuest: true,
  preferredLanguage: 'English',
  location: isIndiaUser
    ? {
        city: 'New Delhi',
        country: 'India',
        latitude: 28.6139,
        longitude: 77.2090,
      }
    : {
        city: 'Makkah',
        country: 'Saudi Arabia',
        latitude: 21.4225,
        longitude: 39.8262,
      },
  prayerCalculationMethod: isIndiaUser ? 'Karachi' : 'MWL',
  asrMethod: isIndiaUser ? 'hanafi' : 'standard',
  hijriDateAdjustment: 0,
  prayerTimeOffsets: {
    fajr: 0,
    sunrise: 0,
    dhuhr: 0,
    asr: 0,
    maghrib: 0,
    isha: 0,
  },
  highLatitudeRule: 'angleBased',
  notifications: {
    fajr: true,
    sunrise: false,
    dhuhr: true,
    asr: true,
    maghrib: true,
    isha: true,
    prePrayerReminder: true,
    prePrayerMinutes: 5,
    playAzaan: true,
    azaanVoice: 'makkah',
    soundEnabled: true,
    vibration: true,
    dailyQuran: true,
    dailyDua: true,
    dailyHadith: true,
    ramadanReminder: true,
  },
  arabicFontSize: 'lg',
  showTransliteration: true,
  quranProgress: {
    lastReadSurah: 1,
    lastReadAyah: 1,
    completedSurahs: [],
    percentage: 0,
  },
  bookmarks: [],
  customDhikrs: [],
  tasbihHistory: [],
  tasbihTotal: 0,
  quizScore: 0,
  fastingTracker: {
    fastedDays: [],
    taraweehDays: [],
  },
  qadaPrayers: {
    fajr: 0,
    dhuhr: 0,
    asr: 0,
    maghrib: 0,
    isha: 0,
  },
};

export const storageService = {
  getActiveUserId(): string | null {
    try {
      return localStorage.getItem(ACTIVE_UID_KEY);
    } catch {
      return null;
    }
  },

  setActiveUser(uid: string | null): void {
    try {
      if (uid && uid !== 'guest_default') {
        localStorage.setItem(ACTIVE_UID_KEY, uid);
      } else {
        localStorage.removeItem(ACTIVE_UID_KEY);
      }
    } catch {
      // ignore
    }
  },

  getGuestProfile(): UserProfile {
    try {
      const stored = localStorage.getItem(GUEST_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          ...DEFAULT_GUEST_PROFILE,
          ...parsed,
          notifications: {
            ...DEFAULT_GUEST_PROFILE.notifications,
            ...(parsed.notifications || {}),
          },
          isGuest: true,
          id: 'guest_default',
        };
      }
    } catch {
      // Fallback
    }
    return { ...DEFAULT_GUEST_PROFILE };
  },

  getUserProfile(uid: string): UserProfile | null {
    if (!uid || uid === 'guest_default') return null;
    try {
      const stored = localStorage.getItem(getUserKey(uid));
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          ...DEFAULT_GUEST_PROFILE,
          ...parsed,
          notifications: {
            ...DEFAULT_GUEST_PROFILE.notifications,
            ...(parsed.notifications || {}),
          },
          id: uid,
          isGuest: false,
        };
      }
    } catch {
      // fallback
    }
    return null;
  },

  getProfile(): UserProfile {
    const activeUid = this.getActiveUserId();
    if (activeUid && activeUid !== 'guest_default') {
      const userProfile = this.getUserProfile(activeUid);
      if (userProfile) {
        return userProfile;
      }
    }
    return this.getGuestProfile();
  },

  saveProfile(profile: UserProfile, syncToFirestore = true): void {
    try {
      if (profile.isGuest || !profile.id || profile.id === 'guest_default') {
        localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(profile));
      } else {
        this.setActiveUser(profile.id);
        localStorage.setItem(getUserKey(profile.id), JSON.stringify(profile));
        if (syncToFirestore) {
          saveUserProfileToFirestore(profile.id, profile).catch((err) => {
            console.warn('Background Firestore sync note:', err);
          });
        }
      }
    } catch (e) {
      console.error('Failed to persist profile', e);
    }
  },

  clearGuestProfile(): void {
    try {
      localStorage.removeItem(GUEST_STORAGE_KEY);
      localStorage.removeItem('noor_islamic_user_profile');
    } catch {
      // ignore
    }
  },

  addBookmark(bookmark: Omit<QuranBookmark, 'id' | 'timestamp'>): QuranBookmark {
    const profile = this.getProfile();
    const newBookmark: QuranBookmark = {
      ...bookmark,
      id: `bm_${Date.now()}`,
      timestamp: Date.now(),
    };
    // avoid duplicates
    const filtered = profile.bookmarks.filter(
      b => !(b.surahNumber === bookmark.surahNumber && b.ayahNumber === bookmark.ayahNumber)
    );
    profile.bookmarks = [newBookmark, ...filtered];
    this.saveProfile(profile);

    if (!profile.isGuest && profile.id && profile.id !== 'guest_default') {
      saveBookmarkToFirestore(profile.id, newBookmark).catch(() => {});
    }

    return newBookmark;
  },

  removeBookmark(id: string): void {
    const profile = this.getProfile();
    profile.bookmarks = profile.bookmarks.filter(b => b.id !== id);
    this.saveProfile(profile);

    if (!profile.isGuest && profile.id && profile.id !== 'guest_default') {
      deleteBookmarkFromFirestore(profile.id, id).catch(() => {});
    }
  },

  isAyahBookmarked(surahNumber: number, ayahNumber: number): boolean {
    const profile = this.getProfile();
    return profile.bookmarks.some(b => b.surahNumber === surahNumber && b.ayahNumber === ayahNumber);
  },

  updateQuranProgress(surahNumber: number, ayahNumber: number, isCompletedSurah = false): void {
    const profile = this.getProfile();
    const completed = new Set(profile.quranProgress.completedSurahs);
    if (isCompletedSurah) {
      completed.add(surahNumber);
    }
    const completedArr = Array.from(completed);
    const percentage = Math.min(100, Math.round((completedArr.length / 114) * 100));

    profile.quranProgress = {
      lastReadSurah: surahNumber,
      lastReadAyah: ayahNumber,
      completedSurahs: completedArr,
      percentage: Math.max(percentage, profile.quranProgress.percentage),
    };
    this.saveProfile(profile);
  },

  recordTasbih(record: Omit<TasbihRecord, 'id'>): void {
    const profile = this.getProfile();
    const newRecord: TasbihRecord = {
      ...record,
      id: `th_${Date.now()}`,
    };
    profile.tasbihHistory = [newRecord, ...(profile.tasbihHistory || []).slice(0, 49)];
    profile.tasbihTotal = (profile.tasbihTotal || 0) + record.count;
    this.saveProfile(profile);

    if (!profile.isGuest && profile.id && profile.id !== 'guest_default') {
      saveTasbihLogToFirestore(profile.id, newRecord).catch(() => {});
    }
  },

  addCustomDhikr(dhikr: { arabic?: string; transliteration: string; translation?: string; target: number }): void {
    const profile = this.getProfile();
    const newDhikr = {
      id: `custom_dhikr_${Date.now()}`,
      arabic: dhikr.arabic?.trim() || 'ذِكْرٌ مَخْصُوصٌ',
      transliteration: dhikr.transliteration.trim(),
      translation: dhikr.translation?.trim() || 'Custom personal remembrance',
      count: 0,
      target: dhikr.target || 33,
    };
    profile.customDhikrs = [...(profile.customDhikrs || []), newDhikr];
    this.saveProfile(profile);
  },

  deleteCustomDhikr(id: string): void {
    const profile = this.getProfile();
    profile.customDhikrs = (profile.customDhikrs || []).filter(d => d.id !== id);
    this.saveProfile(profile);
  },

  updateQada(prayer: 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha', delta: number): void {
    const profile = this.getProfile();
    if (!profile.qadaPrayers) {
      profile.qadaPrayers = { fajr: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0 };
    }
    const current = profile.qadaPrayers[prayer] || 0;
    profile.qadaPrayers[prayer] = Math.max(0, current + delta);
    this.saveProfile(profile);
  },

  updateHijriAdjustment(days: number): void {
    const profile = this.getProfile();
    profile.hijriDateAdjustment = days;
    this.saveProfile(profile);
  },

  updatePrayerOffsets(offsets: NonNullable<UserProfile['prayerTimeOffsets']>): void {
    const profile = this.getProfile();
    profile.prayerTimeOffsets = offsets;
    this.saveProfile(profile);
  },

  updateNotification(key: keyof UserProfile['notifications'], val: boolean): void {
    const profile = this.getProfile();
    profile.notifications[key] = val;
    this.saveProfile(profile);
  },

  updateLocation(loc: UserProfile['location']): void {
    const profile = this.getProfile();
    profile.location = loc;
    this.saveProfile(profile);
  },

  getTheme(): 'dark' | 'light' {
    try {
      const stored = localStorage.getItem('noor_theme');
      if (stored === 'dark' || stored === 'light') return stored;
    } catch {
      // fallback
    }
    return 'light';
  },

  saveTheme(theme: 'dark' | 'light'): void {
    try {
      localStorage.setItem('noor_theme', theme);
    } catch {
      // ignore
    }
  },
};
