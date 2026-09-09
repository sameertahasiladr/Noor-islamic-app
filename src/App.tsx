import { useState, useEffect, useMemo, useCallback } from 'react';
import { AppTab, ExploreFeature, UserProfile, HijriDate } from './types';
import { storageService } from './services/storageService';
import { calculatePrayerTimes, getHijriDate } from './services/prayerService';
import {
  auth,
  onAuthStateChanged,
  fetchUserProfileFromFirestore,
  saveUserProfileToFirestore,
  subscribeToUserProfile,
  buildActualUserProfile,
} from './services/firebase';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { AuthModal } from './components/AuthModal';
import { OpeningFlowModal } from './components/OpeningFlowModal';
import { VoiceNavigationModal } from './components/VoiceNavigationModal';
import { QuranFloatingPlayer } from './components/QuranFloatingPlayer';
import { speechService } from './services/speechService';
import { audioService, ActiveQuranPlayback } from './services/audioService';
import { Mic, Check, MapPin } from 'lucide-react';
import { autoDetectAndApplyLocation, subscribeToLocationDetection } from './services/locationService';
import { initNativeAndroid } from './services/nativeService';

// Views
import { HomeView } from './views/HomeView';
import { PrayerTimesView } from './views/PrayerTimesView';
import { QuranView } from './views/QuranView';
import { ExploreView } from './views/ExploreView';
import { ProfileView } from './views/ProfileView';

// Sub-feature Views
import { QiblaView } from './views/QiblaView';
import { TasbihView } from './views/TasbihView';
import { DuasView } from './views/DuasView';
import { HadithView } from './views/HadithView';
import { NamesOfAllahView } from './views/NamesOfAllahView';
import { RamadanView } from './views/RamadanView';
import { ZakatView } from './views/ZakatView';
import { MosqueFinderView } from './views/MosqueFinderView';
import { LearningView } from './views/LearningView';
import { QuizView } from './views/QuizView';
import { CalendarView } from './views/CalendarView';

export default function App() {
  const [profile, setProfile] = useState<UserProfile>(() => storageService.getProfile());
  const [isDark, setIsDark] = useState<boolean>(() => storageService.getTheme() === 'dark');
  const [activeTab, setActiveTab] = useState<AppTab>('home');
  const [activeExploreFeature, setActiveExploreFeature] = useState<ExploreFeature | null>(null);
  const [selectedSurahNumber, setSelectedSurahNumber] = useState<number>(1);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [isVoiceNavOpen, setIsVoiceNavOpen] = useState<boolean>(false);
  const [isVoiceListening, setIsVoiceListening] = useState<boolean>(false);
  const [voiceToast, setVoiceToast] = useState<string | null>(null);
  const [locationToast, setLocationToast] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [activeQuranPlayback, setActiveQuranPlayback] = useState<ActiveQuranPlayback | null>(null);

  useEffect(() => {
    const unsub = audioService.subscribe((state) => {
      setActiveQuranPlayback(state);
    });
    return unsub;
  }, []);

  useEffect(() => {
    const unsub = subscribeToLocationDetection((loc) => {
      setLocationToast(`Location detected: ${loc.city}, ${loc.country}`);
      setTimeout(() => setLocationToast(null), 4000);
    });
    return unsub;
  }, []);

  // Initialize native Android status bar and hardware back button behavior
  useEffect(() => {
    initNativeAndroid(isDark, () => {
      if (isSearchOpen) {
        setIsSearchOpen(false);
        return true;
      }
      if (isAuthOpen) {
        setIsAuthOpen(false);
        return true;
      }
      if (isVoiceNavOpen) {
        setIsVoiceNavOpen(false);
        return true;
      }
      if (activeExploreFeature) {
        setActiveExploreFeature(null);
        return true;
      }
      if (activeTab !== 'home') {
        setActiveTab('home');
        return true;
      }
      return false; // Exit app
    });
  }, [isDark, isSearchOpen, isAuthOpen, isVoiceNavOpen, activeExploreFeature, activeTab]);

  // Handle centralized profile update (both local and Firestore)
  const handleUpdateProfile = useCallback((updated: UserProfile) => {
    setProfile(updated);
    storageService.saveProfile(updated);
    if (!updated.isGuest && updated.id && updated.id !== 'guest_default') {
      saveUserProfileToFirestore(updated.id, updated).catch((err) => {
        console.warn('Background Firestore sync error:', err);
      });
    }
  }, []);

  const [showOpeningFlow, setShowOpeningFlow] = useState<boolean>(() => {
    const dismissed = sessionStorage.getItem('noor_opening_dismissed');
    const storedProfile = storageService.getProfile();
    return !dismissed && storedProfile.isGuest;
  });

  const handleFinishOpeningFlow = useCallback(() => {
    sessionStorage.setItem('noor_opening_dismissed', 'true');
    setShowOpeningFlow(false);
    const current = storageService.getProfile();
    if (current.isGuest) {
      autoDetectAndApplyLocation(current, handleUpdateProfile).catch((err) => {
        console.info('Auto detect location on opening flow dismiss notice:', err);
      });
    }
  }, [handleUpdateProfile]);

  // Apply dark mode class to html element
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    storageService.saveTheme(isDark ? 'dark' : 'light');
  }, [isDark]);

  // Listen for Firebase Auth state changes and sync with Cloud Firestore
  useEffect(() => {
    let unsubscribeProfileListener: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (unsubscribeProfileListener) {
        unsubscribeProfileListener();
        unsubscribeProfileListener = null;
      }

      if (firebaseUser) {
        storageService.setActiveUser(firebaseUser.uid);
        try {
          // Fetch existing profile document from Firestore
          const cloudData = await fetchUserProfileFromFirestore(firebaseUser.uid);

          // Build actual user profile (pure actual user data, zero guest data)
          const actualProfile = buildActualUserProfile(firebaseUser, cloudData);

          // Save to local cache & update state
          storageService.saveProfile(actualProfile, false);
          setProfile(actualProfile);

          // Automatically detect location if user still has default location
          if (
            actualProfile.location.latitude === 21.4225 &&
            actualProfile.location.longitude === 39.8262
          ) {
            autoDetectAndApplyLocation(actualProfile, handleUpdateProfile).catch((e) => {
              console.info('Auto detect location on user sign-in notice:', e);
            });
          }

          // If document didn't exist in Firestore or had corrupted legacy guest artifacts, heal it immediately
          if (
            !cloudData ||
            Object.keys(cloudData).length === 0 ||
            cloudData.name === 'Beloved Seeker' ||
            cloudData.name === 'Faithful Servant' ||
            cloudData.email === 'guest@noor.app' ||
            cloudData.isGuest
          ) {
            saveUserProfileToFirestore(firebaseUser.uid, actualProfile).catch((e) => {
              console.warn('Initial cloud profile healing note:', e);
            });
          }

          // Subscribe to live Firestore updates
          unsubscribeProfileListener = subscribeToUserProfile(firebaseUser.uid, (updatedData) => {
            if (updatedData) {
              setProfile((prev) => {
                const refreshed = buildActualUserProfile(firebaseUser, { ...prev, ...updatedData });
                storageService.saveProfile(refreshed, false);
                return refreshed;
              });
            }
          });
        } catch (err) {
          console.error('Failed to initialize Firestore user session:', err);
          const fallback = buildActualUserProfile(firebaseUser, null);
          storageService.saveProfile(fallback, false);
          setProfile(fallback);
        }
      } else {
        // User signed out / guest mode
        storageService.setActiveUser(null);
        const guestProfile = storageService.getGuestProfile();
        setProfile(guestProfile);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfileListener) {
        unsubscribeProfileListener();
      }
    };
  }, []);

  // Update timer every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000 * 30);
    return () => clearInterval(timer);
  }, []);

  // Calculate live prayer times based on profile settings & coordinates
  const prayerData = useMemo(() => {
    return calculatePrayerTimes(
      currentTime,
      profile.location.latitude,
      profile.location.longitude,
      profile.prayerCalculationMethod,
      profile.asrMethod,
      profile.hijriDateAdjustment || 0,
      profile.prayerTimeOffsets,
      profile.highLatitudeRule || 'angleBased'
    );
  }, [
    currentTime,
    profile.location,
    profile.prayerCalculationMethod,
    profile.asrMethod,
    profile.hijriDateAdjustment,
    profile.prayerTimeOffsets,
    profile.highLatitudeRule,
  ]);

  // Current Hijri date with optional user lunar adjustment
  const hijriDate: HijriDate = useMemo(() => {
    return getHijriDate(currentTime, profile.hijriDateAdjustment || 0);
  }, [currentTime, profile.hijriDateAdjustment]);

  const handleToggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  const handleSelectTab = (tab: AppTab) => {
    setActiveTab(tab);
    setActiveExploreFeature(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectExploreFeature = (feature: ExploreFeature) => {
    setActiveExploreFeature(feature);
    setActiveTab('explore');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectSurah = (surahNumber: number) => {
    setSelectedSurahNumber(surahNumber);
    setActiveTab('quran');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 flex flex-col transition-colors duration-200">
      {/* Top sticky Header */}
      <Header
        profile={profile}
        hijriDate={hijriDate}
        isDark={isDark}
        isVoiceActive={isVoiceListening}
        onToggleTheme={handleToggleTheme}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenVoiceNav={() => setIsVoiceNavOpen(true)}
        onOpenProfile={() => handleSelectTab('profile')}
        onOpenLocationModal={() => {
          handleSelectTab('prayer');
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full pt-2">
        {/* TAB 1: HOME */}
        {activeTab === 'home' && (
          <HomeView
            profile={profile}
            prayerData={prayerData}
            hijriDate={hijriDate}
            onNavigateTab={handleSelectTab}
            onNavigateExplore={handleSelectExploreFeature}
            onSelectSurah={handleSelectSurah}
          />
        )}

        {/* TAB 2: PRAYER */}
        {activeTab === 'prayer' && (
          <PrayerTimesView
            profile={profile}
            prayerData={prayerData}
            onUpdateProfile={handleUpdateProfile}
          />
        )}

        {/* TAB 3: QURAN */}
        {activeTab === 'quran' && (
          <QuranView
            profile={profile}
            selectedSurahNumber={selectedSurahNumber}
            onSelectSurah={(num) => setSelectedSurahNumber(num)}
            onUpdateProfile={handleUpdateProfile}
          />
        )}

        {/* TAB 4: EXPLORE & ITS SUB-TOOLS */}
        {activeTab === 'explore' && (
          <>
            {!activeExploreFeature && (
              <ExploreView onSelectFeature={handleSelectExploreFeature} />
            )}

            {activeExploreFeature === 'qibla' && (
              <QiblaView
                profile={profile}
                onBack={() => setActiveExploreFeature(null)}
              />
            )}

            {activeExploreFeature === 'tasbih' && (
              <TasbihView
                profile={profile}
                onBack={() => setActiveExploreFeature(null)}
                onUpdateProfile={handleUpdateProfile}
              />
            )}

            {activeExploreFeature === 'duas' && (
              <DuasView
                profile={profile}
                onBack={() => setActiveExploreFeature(null)}
                onUpdateProfile={handleUpdateProfile}
              />
            )}

            {activeExploreFeature === 'hadith' && (
              <HadithView onBack={() => setActiveExploreFeature(null)} />
            )}

            {activeExploreFeature === 'names' && (
              <NamesOfAllahView onBack={() => setActiveExploreFeature(null)} />
            )}

            {activeExploreFeature === 'ramadan' && (
              <RamadanView
                profile={profile}
                prayerData={prayerData}
                onBack={() => setActiveExploreFeature(null)}
                onUpdateProfile={handleUpdateProfile}
              />
            )}

            {activeExploreFeature === 'zakat' && (
              <ZakatView onBack={() => setActiveExploreFeature(null)} />
            )}

            {activeExploreFeature === 'mosques' && (
              <MosqueFinderView
                profile={profile}
                onBack={() => setActiveExploreFeature(null)}
                onUpdateProfile={handleUpdateProfile}
              />
            )}

            {activeExploreFeature === 'learning' && (
              <LearningView onBack={() => setActiveExploreFeature(null)} />
            )}

            {activeExploreFeature === 'quiz' && (
              <QuizView
                profile={profile}
                onBack={() => setActiveExploreFeature(null)}
                onUpdateProfile={handleUpdateProfile}
              />
            )}

            {activeExploreFeature === 'calendar' && (
              <CalendarView
                hijriDate={hijriDate}
                onBack={() => setActiveExploreFeature(null)}
              />
            )}
          </>
        )}

        {/* TAB 5: PROFILE */}
        {activeTab === 'profile' && (
          <ProfileView
            profile={profile}
            isDark={isDark}
            onToggleTheme={handleToggleTheme}
            onOpenAuthModal={() => setIsAuthOpen(true)}
            onUpdateProfile={handleUpdateProfile}
            onNavigateTab={handleSelectTab}
            onSelectSurah={handleSelectSurah}
          />
        )}
      </main>

      {/* Floating Mini Quran Player (available when navigating outside Home) */}
      {activeQuranPlayback && activeTab !== 'home' && (
        <QuranFloatingPlayer
          activePlayback={activeQuranPlayback}
          onOpenSurah={(num) => {
            handleSelectTab('quran');
            handleSelectSurah(num);
          }}
        />
      )}

      {/* Bottom Sticky Navigation */}
      <BottomNav activeTab={activeTab} onSelectTab={handleSelectTab} />

      {/* Global Search Modal */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onNavigateTab={handleSelectTab}
        onNavigateExplore={handleSelectExploreFeature}
        onSelectSurah={handleSelectSurah}
      />

      {/* Authentication / Account Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        currentProfile={profile}
        onSaveProfile={handleUpdateProfile}
        onContinueAsGuest={() => {
          setIsAuthOpen(false);
          const current = storageService.getProfile();
          autoDetectAndApplyLocation(current, handleUpdateProfile).catch((err) => {
            console.info('Auto location on guest continue notice:', err);
          });
        }}
      />

      {/* Opening Flow: Random Islamic Quotes followed by Sign In / Sign Up / Guest Mode */}
      <OpeningFlowModal
        isOpen={showOpeningFlow}
        onFinish={handleFinishOpeningFlow}
        currentProfile={profile}
        onSaveProfile={handleUpdateProfile}
      />

      {/* Hands-free Voice Navigation Assistant Modal */}
      <VoiceNavigationModal
        isOpen={isVoiceNavOpen}
        onClose={() => setIsVoiceNavOpen(false)}
        onNavigateTab={(tab) => {
          handleSelectTab(tab);
          setVoiceToast(`Navigated to ${tab.charAt(0).toUpperCase() + tab.slice(1)}`);
          setTimeout(() => setVoiceToast(null), 3000);
        }}
        onNavigateExplore={(feature) => {
          handleSelectExploreFeature(feature);
          setVoiceToast(`Opened ${feature.charAt(0).toUpperCase() + feature.slice(1)}`);
          setTimeout(() => setVoiceToast(null), 3000);
        }}
        onSelectSurah={(surahNum) => {
          handleSelectSurah(surahNum);
          setVoiceToast(`Opened Surah ${surahNum}`);
          setTimeout(() => setVoiceToast(null), 3000);
        }}
        onToggleTheme={() => {
          handleToggleTheme();
          setVoiceToast(`Switched theme`);
          setTimeout(() => setVoiceToast(null), 3000);
        }}
        onOpenSearch={() => {
          setIsSearchOpen(true);
        }}
        onStopAudio={() => {
          speechService.stopRecitation();
          setVoiceToast(`Recitation stopped`);
          setTimeout(() => setVoiceToast(null), 3000);
        }}
        onReciteDua={() => {
          handleSelectExploreFeature('duas');
        }}
      />

      {/* Location Acquired Notification Toast */}
      {locationToast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-3 duration-200 pointer-events-none">
          <div className="px-4 py-2.5 rounded-2xl bg-emerald-900/95 dark:bg-emerald-950/95 text-emerald-100 text-xs font-semibold shadow-2xl backdrop-blur-md flex items-center gap-2.5 border border-emerald-500/40">
            <MapPin className="w-4 h-4 text-emerald-300 shrink-0 animate-bounce" />
            <span>{locationToast}</span>
          </div>
        </div>
      )}

      {/* Voice Notification Toast */}
      {voiceToast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-3 duration-200">
          <div className="px-4 py-2 rounded-2xl bg-zinc-900/90 dark:bg-white/95 text-white dark:text-zinc-900 text-xs font-semibold shadow-xl backdrop-blur-md flex items-center gap-2 border border-zinc-700/50 dark:border-zinc-200">
            <Mic className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-600" />
            <span>{voiceToast}</span>
          </div>
        </div>
      )}
    </div>
  );
}
