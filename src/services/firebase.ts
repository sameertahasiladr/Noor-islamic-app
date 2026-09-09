import { initializeApp } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';

export { onAuthStateChanged };
export type { FirebaseUser };
import {
  getFirestore,
  doc,
  getDoc,
  getDocs,
  getDocFromServer,
  setDoc,
  deleteDoc,
  collection,
  onSnapshot,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { UserProfile, QuranBookmark, TasbihRecord } from '../types';

// Initialize Firebase App with user's new project configuration
export const app = initializeApp(firebaseConfig);

// Initialize Firebase Analytics gracefully
if (typeof window !== 'undefined') {
  isSupported()
    .then((supported) => {
      if (supported) {
        try {
          getAnalytics(app);
        } catch {
          // Ignore analytics failures in sandboxed previews
        }
      }
    })
    .catch(() => {});
}

// Initialize Firebase Authentication
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

// Initialize Cloud Firestore database for new Firebase project
export const db = getFirestore(app);

/**
 * Validate Connection to Firestore (Skill Mandate)
 */
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
testConnection();

/**
 * Standardized Firestore Error Handling (Skill Mandate)
 */
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const currentUser = auth.currentUser;
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: currentUser?.uid,
      email: currentUser?.email,
      emailVerified: currentUser?.emailVerified,
      isAnonymous: currentUser?.isAnonymous,
      tenantId: currentUser?.tenantId,
      providerInfo: currentUser?.providerData?.map((provider) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

/**
 * Authentication Helper Functions
 */
export const signInWithGoogle = async (): Promise<FirebaseUser> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    if (error?.code === 'auth/unauthorized-domain') {
      const currentHost = typeof window !== 'undefined' ? window.location.hostname : '';
      console.warn(
        `[Firebase Auth] Domain '${currentHost}' is not in Authorized Domains for project '${firebaseConfig.projectId}'. Add '${currentHost}' (or 'run.app') in Firebase Console > Authentication > Settings > Authorized domains.`
      );
    } else {
      console.error('Google Sign-In Error:', error);
    }
    throw error;
  }
};

export const signInWithEmail = async (email: string, pass: string): Promise<FirebaseUser> => {
  const result = await signInWithEmailAndPassword(auth, email, pass);
  return result.user;
};

export const signUpWithEmail = async (name: string, email: string, pass: string): Promise<FirebaseUser> => {
  const result = await createUserWithEmailAndPassword(auth, email, pass);
  if (name.trim()) {
    await updateProfile(result.user, {
      displayName: name.trim(),
    });
  }
  return result.user;
};

export const sendPasswordReset = async (email: string): Promise<void> => {
  await sendPasswordResetEmail(auth, email);
};

export const logOutUser = async (): Promise<void> => {
  await signOut(auth);
};

/**
 * Format readable name from email address
 */
export function formatNameFromEmail(email?: string): string {
  if (!email) return 'Faithful Seeker';
  const localPart = email.split('@')[0];
  let formatted = localPart.replace(/[._-]+/g, ' ').replace(/\d+/g, '').trim();
  if (!formatted) {
    formatted = localPart;
  }
  return formatted
    .split(' ')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Clean User Profile Builder:
 * Guarantees that when a real user logs in, they receive their ACTUAL data,
 * completely isolated from any guest data, guest bookmarks, or guest placeholders.
 */
export function buildActualUserProfile(
  firebaseUser: {
    uid: string;
    displayName?: string | null;
    email?: string | null;
    photoURL?: string | null;
  },
  cloudData?: Partial<UserProfile> | null,
  cleanName?: string
): UserProfile {
  // Determine actual display name
  let realName = '';
  if (cleanName && cleanName.trim()) {
    realName = cleanName.trim();
  } else if (firebaseUser.displayName && firebaseUser.displayName.trim()) {
    realName = firebaseUser.displayName.trim();
  } else if (
    cloudData?.name &&
    cloudData.name !== 'Beloved Seeker' &&
    cloudData.name !== 'Faithful Servant' &&
    cloudData.name !== 'Guest' &&
    !cloudData.name.toLowerCase().includes('guest')
  ) {
    realName = cloudData.name.trim();
  } else if (firebaseUser.email) {
    realName = formatNameFromEmail(firebaseUser.email);
  } else {
    realName = 'Faithful Seeker';
  }

  // Determine actual email
  const realEmail =
    firebaseUser.email ||
    (cloudData?.email && !cloudData.email.includes('guest') ? cloudData.email : undefined);

  // Determine actual avatar
  const realAvatar =
    firebaseUser.photoURL ||
    (cloudData?.avatar && !cloudData.avatar.includes('unsplash') ? cloudData.avatar : undefined) ||
    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(realName)}`;

  // Default clean baseline (ZERO GUEST DATA)
  const baselineProfile: UserProfile = {
    id: firebaseUser.uid,
    name: realName,
    email: realEmail,
    avatar: realAvatar,
    isGuest: false,
    preferredLanguage: 'English',
    location: {
      city: 'Makkah',
      country: 'Saudi Arabia',
      latitude: 21.4225,
      longitude: 39.8262,
    },
    prayerCalculationMethod: 'MWL',
    asrMethod: 'standard',
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

  if (!cloudData || Object.keys(cloudData).length === 0) {
    return baselineProfile;
  }

  // Merge cloud data safely while ensuring guest artifacts are never retained
  return {
    ...baselineProfile,
    ...cloudData,
    id: firebaseUser.uid,
    name: realName,
    email: realEmail,
    avatar: realAvatar,
    isGuest: false,
    bookmarks: Array.isArray(cloudData.bookmarks) ? cloudData.bookmarks : [],
    tasbihHistory: Array.isArray(cloudData.tasbihHistory) ? cloudData.tasbihHistory : [],
    tasbihTotal: typeof cloudData.tasbihTotal === 'number' ? cloudData.tasbihTotal : 0,
    customDhikrs: Array.isArray(cloudData.customDhikrs) ? cloudData.customDhikrs : [],
    quranProgress: cloudData.quranProgress || baselineProfile.quranProgress,
    fastingTracker: cloudData.fastingTracker || baselineProfile.fastingTracker,
    qadaPrayers: cloudData.qadaPrayers || baselineProfile.qadaPrayers,
    location: cloudData.location || baselineProfile.location,
    prayerCalculationMethod: cloudData.prayerCalculationMethod || baselineProfile.prayerCalculationMethod,
    asrMethod: cloudData.asrMethod || baselineProfile.asrMethod,
    notifications: {
      ...baselineProfile.notifications,
      ...(cloudData.notifications || {}),
    },
  };
}

/**
 * Firestore Database Persistence Helpers
 * Paths:
 *   /users/{userId}
 *   /users/{userId}/bookmarks/{bookmarkId}
 *   /users/{userId}/tasbihLogs/{logId}
 */
export const userDocRef = (userId: string) => doc(db, 'users', userId);
export const userBookmarksCollectionRef = (userId: string) => collection(db, 'users', userId, 'bookmarks');
export const userTasbihLogsCollectionRef = (userId: string) => collection(db, 'users', userId, 'tasbihLogs');

/**
 * Save a single Quran Bookmark to /users/{userId}/bookmarks/{bookmarkId}
 */
export const saveBookmarkToFirestore = async (userId: string, bookmark: QuranBookmark): Promise<void> => {
  if (!userId || userId === 'guest_default') return;
  const bookmarkId = bookmark.id || `bm_${Date.now()}`;
  const path = `users/${userId}/bookmarks/${bookmarkId}`;
  try {
    const ref = doc(db, 'users', userId, 'bookmarks', bookmarkId);
    await setDoc(
      ref,
      {
        id: bookmarkId,
        userId,
        surahNumber: bookmark.surahNumber,
        surahName: bookmark.surahName,
        ayahNumber: bookmark.ayahNumber,
        arabicText: bookmark.arabicText || '',
        translation: bookmark.translation || '',
        timestamp: bookmark.timestamp || Date.now(),
        note: bookmark.note || '',
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

/**
 * Delete a single Quran Bookmark from /users/{userId}/bookmarks/{bookmarkId}
 */
export const deleteBookmarkFromFirestore = async (userId: string, bookmarkId: string): Promise<void> => {
  if (!userId || userId === 'guest_default') return;
  const path = `users/${userId}/bookmarks/${bookmarkId}`;
  try {
    const ref = doc(db, 'users', userId, 'bookmarks', bookmarkId);
    await deleteDoc(ref);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
};

/**
 * Fetch all Quran Bookmarks from /users/{userId}/bookmarks
 */
export const fetchBookmarksFromFirestore = async (userId: string): Promise<QuranBookmark[]> => {
  if (!userId || userId === 'guest_default') return [];
  const path = `users/${userId}/bookmarks`;
  try {
    const colRef = userBookmarksCollectionRef(userId);
    const snap = await getDocs(colRef);
    const bookmarks: QuranBookmark[] = [];
    snap.forEach((docSnap) => {
      const data = docSnap.data();
      bookmarks.push({
        id: docSnap.id,
        surahNumber: data.surahNumber,
        surahName: data.surahName,
        ayahNumber: data.ayahNumber,
        arabicText: data.arabicText || '',
        translation: data.translation || '',
        timestamp: data.timestamp || Date.now(),
        note: data.note,
      });
    });
    bookmarks.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    return bookmarks;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
};

/**
 * Save a single Tasbih Log to /users/{userId}/tasbihLogs/{logId}
 */
export const saveTasbihLogToFirestore = async (userId: string, record: TasbihRecord): Promise<void> => {
  if (!userId || userId === 'guest_default') return;
  const logId = record.id || `th_${Date.now()}`;
  const path = `users/${userId}/tasbihLogs/${logId}`;
  try {
    const ref = doc(db, 'users', userId, 'tasbihLogs', logId);
    await setDoc(
      ref,
      {
        id: logId,
        userId,
        dhikrName: record.dhikrName,
        count: record.count,
        target: record.target,
        date: record.date || new Date().toISOString(),
        timestamp: Date.now(),
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

/**
 * Fetch all Tasbih Logs from /users/{userId}/tasbihLogs
 */
export const fetchTasbihLogsFromFirestore = async (userId: string): Promise<TasbihRecord[]> => {
  if (!userId || userId === 'guest_default') return [];
  const path = `users/${userId}/tasbihLogs`;
  try {
    const colRef = userTasbihLogsCollectionRef(userId);
    const snap = await getDocs(colRef);
    const logs: TasbihRecord[] = [];
    snap.forEach((docSnap) => {
      const data = docSnap.data();
      logs.push({
        id: docSnap.id,
        dhikrName: data.dhikrName,
        count: data.count,
        target: data.target,
        date: data.date,
      });
    });
    logs.sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());
    return logs;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
};

/**
 * Save user profile to /users/{userId} and sync subcollections
 * STRICT SECURITY: Passwords are NEVER stored in Firestore.
 */
export const saveUserProfileToFirestore = async (userId: string, profile: Partial<UserProfile>): Promise<void> => {
  if (!userId || userId === 'guest_default') return;
  const path = `users/${userId}`;
  try {
    // Sanitize profile object: NEVER store passwords in Firestore
    const sanitized = { ...profile } as Record<string, any>;
    delete sanitized.password;
    delete sanitized.pass;
    delete sanitized.currentPassword;
    delete sanitized.newPassword;

    const ref = userDocRef(userId);
    await setDoc(
      ref,
      {
        ...sanitized,
        id: userId,
        isGuest: false,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    // Synchronize bookmarks to subcollection /users/{userId}/bookmarks/{bookmarkId}
    if (Array.isArray(profile.bookmarks) && profile.bookmarks.length > 0) {
      for (const bm of profile.bookmarks) {
        if (bm && bm.id) {
          saveBookmarkToFirestore(userId, bm).catch(() => {});
        }
      }
    }

    // Synchronize recent tasbih history to subcollection /users/{userId}/tasbihLogs/{logId}
    if (Array.isArray(profile.tasbihHistory) && profile.tasbihHistory.length > 0) {
      for (const log of profile.tasbihHistory.slice(0, 20)) {
        if (log && log.id) {
          saveTasbihLogToFirestore(userId, log).catch(() => {});
        }
      }
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

/**
 * Fetch complete user profile from /users/{userId} and merge subcollections
 */
export const fetchUserProfileFromFirestore = async (userId: string): Promise<Partial<UserProfile> | null> => {
  if (!userId || userId === 'guest_default') return null;
  const path = `users/${userId}`;
  try {
    const ref = userDocRef(userId);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      return null;
    }

    const docData = snap.data() as Partial<UserProfile>;

    // Fetch bookmarks and tasbih logs subcollections in parallel
    try {
      const [subBookmarks, subLogs] = await Promise.all([
        fetchBookmarksFromFirestore(userId).catch(() => []),
        fetchTasbihLogsFromFirestore(userId).catch(() => []),
      ]);

      if (subBookmarks && subBookmarks.length > 0) {
        docData.bookmarks = subBookmarks;
      }
      if (subLogs && subLogs.length > 0) {
        docData.tasbihHistory = subLogs;
      }
    } catch {
      // Keep docData bookmarks & tasbihHistory as fallback
    }

    return docData;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
};

export const subscribeToUserProfile = (
  userId: string,
  onUpdate: (data: Partial<UserProfile>) => void
) => {
  if (!userId || userId === 'guest_default') return () => {};
  const path = `users/${userId}`;
  const ref = userDocRef(userId);
  return onSnapshot(
    ref,
    (snap) => {
      if (snap.exists()) {
        onUpdate(snap.data() as Partial<UserProfile>);
      }
    },
    (err) => {
      handleFirestoreError(err, OperationType.GET, path);
    }
  );
};

