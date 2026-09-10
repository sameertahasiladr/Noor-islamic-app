import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  BookOpen,
  User,
  Mail,
  Lock,
  RefreshCw,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
  Moon,
  ChevronRight,
  Copy,
  Check,
  ExternalLink,
  ShieldAlert,
  X,
} from 'lucide-react';
import { ISLAMIC_QUOTES, getRandomQuote, IslamicQuote } from '../data/islamicQuotes';
import { UserProfile } from '../types';
import {
  signInWithGoogle,
  signInWithEmail,
  signUpWithEmail,
  fetchUserProfileFromFirestore,
  saveUserProfileToFirestore,
  buildActualUserProfile,
} from '../services/firebase';
import { storageService } from '../services/storageService';
import { autoDetectAndApplyLocation } from '../services/locationService';
import { isNative } from '../services/nativeService';

interface OpeningFlowModalProps {
  isOpen: boolean;
  onFinish: () => void;
  currentProfile: UserProfile;
  onSaveProfile: (profile: UserProfile) => void;
}

export const OpeningFlowModal: React.FC<OpeningFlowModalProps> = ({
  isOpen,
  onFinish,
  currentProfile,
  onSaveProfile,
}) => {
  const [stage, setStage] = useState<'quote' | 'auth'>('quote');
  const [currentQuote, setCurrentQuote] = useState<IslamicQuote>(() => getRandomQuote());
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [unauthorizedDomain, setUnauthorizedDomain] = useState<string | null>(null);
  const [copiedDomain, setCopiedDomain] = useState(false);

  if (!isOpen) return null;

  const handleCopyDomain = () => {
    const domain = unauthorizedDomain || (typeof window !== 'undefined' ? window.location.hostname : '');
    if (domain && navigator.clipboard) {
      navigator.clipboard.writeText(domain);
      setCopiedDomain(true);
      setTimeout(() => setCopiedDomain(false), 2200);
    }
  };

  const handleNextQuote = () => {
    setCurrentQuote(getRandomQuote());
  };

  const handleContinueToAuth = () => {
    setStage('auth');
  };

  const handleContinueAsGuest = () => {
    // Keep or set as guest
    const guestProfile: UserProfile = {
      ...currentProfile,
      isGuest: true,
    };
    storageService.saveProfile(guestProfile);
    onSaveProfile(guestProfile);
    onFinish();

    // Automatically detect and apply user's location on entering guest mode
    autoDetectAndApplyLocation(guestProfile, onSaveProfile).catch((err) => {
      console.info('[OpeningFlow] Auto location detection for guest notice:', err);
    });
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setErrorMsg(null);

    const cleanEmail = email.trim();
    const cleanPassword = password.trim();
    const cleanName = name.trim();

    if (!cleanEmail) {
      setErrorMsg('Please provide a valid email address.');
      return;
    }
    if (cleanPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      let firebaseUser;
      if (authMode === 'signup') {
        firebaseUser = await signUpWithEmail(cleanName || '', cleanEmail, cleanPassword);
      } else {
        firebaseUser = await signInWithEmail(cleanEmail, cleanPassword);
      }

      // 1. Immediately create local user profile and authenticate UI
      const initialProfile = buildActualUserProfile(firebaseUser, null, cleanName || undefined);
      storageService.setActiveUser(firebaseUser.uid);
      storageService.saveProfile(initialProfile, false);
      onSaveProfile(initialProfile);

      // 2. Immediately stop loading spinner and show success
      setLoading(false);
      setSuccessMsg(authMode === 'signup' ? 'Account created! Welcome to Noor.' : 'Signed in successfully! Welcome back.');

      // 3. Schedule closing opening flow
      setTimeout(() => {
        onFinish();
      }, 800);

      // 4. Safely perform Firestore profile sync and location detection in background (non-blocking)
      (async () => {
        try {
          const cloudDoc = await fetchUserProfileFromFirestore(firebaseUser.uid).catch((e) => {
            console.warn('[OpeningFlow] Background Firestore fetch note:', e);
            return null;
          });

          const targetProfile = buildActualUserProfile(firebaseUser, cloudDoc, cleanName || undefined);
          storageService.saveProfile(targetProfile, false);
          onSaveProfile(targetProfile);

          saveUserProfileToFirestore(firebaseUser.uid, targetProfile).catch((err) => {
            console.warn('[OpeningFlow] Background Firestore save note:', err);
          });

          autoDetectAndApplyLocation(targetProfile, onSaveProfile).catch((err) => {
            console.info('[OpeningFlow] Auto location detection notice:', err);
          });
        } catch (bgErr) {
          console.warn('[OpeningFlow] Post-auth background sync issue:', bgErr);
        }
      })();
    } catch (err: any) {
      const code = err?.code || '';
      if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
        setErrorMsg('Invalid email or password. If you are new, please select "Create Account" above.');
      } else if (code === 'auth/email-already-in-use') {
        setErrorMsg('An account already exists with this email address. Please select "Sign In".');
      } else if (code === 'auth/weak-password') {
        setErrorMsg('Password should be at least 6 characters.');
      } else if (code === 'auth/invalid-email') {
        setErrorMsg('Please enter a valid email address.');
      } else {
        setErrorMsg(err?.message || 'Authentication error. You may also continue in Guest Mode.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    if (loading) return;
    setErrorMsg(null);
    setLoading(true);
    try {
      const firebaseUser = await signInWithGoogle();

      // 1. Immediately create local user profile and authenticate UI
      const initialProfile = buildActualUserProfile(firebaseUser, null);
      storageService.setActiveUser(firebaseUser.uid);
      storageService.saveProfile(initialProfile, false);
      onSaveProfile(initialProfile);

      // 2. Immediately stop loading spinner and show success
      setLoading(false);
      setSuccessMsg('Signed in with Google! Welcome to Noor.');

      // 3. Schedule closing opening flow
      setTimeout(() => {
        onFinish();
      }, 800);

      // 4. Safely perform Firestore profile sync and location detection in background (non-blocking)
      (async () => {
        try {
          const cloudDoc = await fetchUserProfileFromFirestore(firebaseUser.uid).catch((e) => {
            console.warn('[OpeningFlow] Background Google Firestore fetch note:', e);
            return null;
          });

          const targetProfile = buildActualUserProfile(firebaseUser, cloudDoc);
          storageService.saveProfile(targetProfile, false);
          onSaveProfile(targetProfile);

          saveUserProfileToFirestore(firebaseUser.uid, targetProfile).catch((err) => {
            console.warn('[OpeningFlow] Background Google Firestore save note:', err);
          });

          autoDetectAndApplyLocation(targetProfile, onSaveProfile).catch((err) => {
            console.info('[OpeningFlow] Auto location detection for Google login notice:', err);
          });
        } catch (bgErr) {
          console.warn('[OpeningFlow] Post-auth Google background sync issue:', bgErr);
        }
      })();
    } catch (err: any) {
      const isUnauthorized =
        err?.code === 'auth/unauthorized-domain' ||
        err?.message?.includes('unauthorized-domain');

      if (isUnauthorized) {
        const host = typeof window !== 'undefined' ? window.location.hostname : '';
        setUnauthorizedDomain(host);
        setErrorMsg(null);
      } else {
        if (err?.code === 'auth/popup-closed-by-user' || err?.code === 'auth/cancelled-popup-request') {
          setErrorMsg('Google sign-in was cancelled. Please try again.');
        } else {
          setErrorMsg(err?.message || 'Google sign-in could not complete. Please try again or use email.');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white dark:bg-[#0D1E17] rounded-3xl shadow-2xl border border-[#E8E4DC] dark:border-emerald-900/30 overflow-hidden">
        {/* STAGE 1: RANDOM ISLAMIC QUOTE SCREEN */}
        {stage === 'quote' && (
          <div className="p-6 sm:p-8 space-y-6 text-center">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-800 dark:text-amber-300 flex items-center gap-1.5 bg-emerald-800/10 dark:bg-emerald-950 px-3 py-1 rounded-full border border-emerald-700/20">
                <Moon className="w-3.5 h-3.5 text-amber-500" />
                Noor • Words of Wisdom
              </span>

              <button
                onClick={handleNextQuote}
                className="text-xs text-[#5C6F66] hover:text-emerald-800 dark:text-[#9EB2A7] dark:hover:text-amber-300 flex items-center gap-1 transition-colors font-medium"
                title="Shuffle another quote"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Next Quote</span>
              </button>
            </div>

            {/* Quote Card */}
            <div className="py-7 px-5 sm:px-8 rounded-3xl bg-gradient-to-br from-[#064E3B] via-[#0A3326] to-[#041F17] text-white shadow-xl relative overflow-hidden border border-emerald-700/30">
              <span className="text-[11px] uppercase tracking-wider font-bold text-amber-400 block mb-3">
                {currentQuote.topic}
              </span>

              <p
                dir="rtl"
                className="text-2xl sm:text-3xl font-quran font-bold text-center leading-loose text-white mb-4"
              >
                {currentQuote.arabic}
              </p>

              <p className="text-sm sm:text-base text-[#F4F3EC] font-serif italic leading-relaxed max-w-md mx-auto">
                "{currentQuote.translation}"
              </p>

              <span className="inline-block mt-4 text-xs font-bold text-amber-300 bg-black/30 border border-amber-400/20 px-3 py-1 rounded-full">
                — {currentQuote.source}
              </span>
            </div>

            {/* Bottom Controls */}
            <div className="space-y-2 pt-2">
              <button
                onClick={handleContinueToAuth}
                className="w-full py-3 px-6 rounded-2xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-sm shadow-xs transition-all flex items-center justify-center gap-2 group"
              >
                <span>Continue to Sign In / Guest Mode</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform text-amber-300" />
              </button>

              <button
                onClick={handleContinueAsGuest}
                className="text-xs text-[#5C6F66] dark:text-[#9EB2A7] hover:text-[#14241D] dark:hover:text-[#F4F3EC] font-semibold py-1 transition-colors"
              >
                Skip straight to Guest Mode
              </button>
            </div>
          </div>
        )}

        {/* STAGE 2: AUTHENTICATION / GUEST MODE SCREEN */}
        {stage === 'auth' && (
          <div className="p-6 sm:p-7 space-y-4">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-2xl bg-emerald-800/10 dark:bg-emerald-950 text-emerald-800 dark:text-amber-300 font-quran font-bold text-2xl flex items-center justify-center mx-auto shadow-xs border border-emerald-700/20">
                نُور
              </div>
              <h2 className="text-xl font-bold text-[#14241D] dark:text-[#F4F3EC]">
                Welcome to Noor Islamic Companion
              </h2>
              <p className="text-xs text-[#5C6F66] dark:text-[#9EB2A7] max-w-sm mx-auto">
                Sign in to back up your Quran reading, tasbih logs & bookmarks, or use Guest Mode freely.
              </p>
            </div>

            {/* Sign In / Sign Up Mode Pill */}
            <div className="flex items-center p-1 bg-[#ECE7DE] dark:bg-[#0A1A13] rounded-2xl max-w-xs mx-auto text-xs font-bold border border-[#E0DBD0] dark:border-emerald-950/80">
              <button
                onClick={() => {
                  setErrorMsg(null);
                  setAuthMode('signin');
                }}
                className={`flex-1 py-1.5 rounded-xl transition-all ${
                  authMode === 'signin'
                    ? 'bg-white dark:bg-[#0D1E17] text-emerald-800 dark:text-amber-300 shadow-xs'
                    : 'text-[#5C6F66] dark:text-[#9EB2A7]'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  setErrorMsg(null);
                  setAuthMode('signup');
                }}
                className={`flex-1 py-1.5 rounded-xl transition-all ${
                  authMode === 'signup'
                    ? 'bg-white dark:bg-[#0D1E17] text-emerald-800 dark:text-amber-300 shadow-xs'
                    : 'text-[#5C6F66] dark:text-[#9EB2A7]'
                }`}
              >
                Create Account
              </button>
            </div>

            {unauthorizedDomain && (
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/70 space-y-2.5 text-xs text-amber-900 dark:text-amber-200">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 font-bold text-amber-950 dark:text-amber-100">
                    <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Domain Authorization Required</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setUnauthorizedDomain(null)}
                    className="text-amber-500 hover:text-amber-700 dark:text-amber-400 p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <p className="text-[11px] leading-relaxed text-amber-800 dark:text-amber-300">
                  Google Sign-In requires your app domain to be added to Authorized Domains in your Firebase Project (<strong>noor-5cee7</strong>).
                </p>

                <div className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-zinc-900 border border-amber-200/80 dark:border-amber-900/60 font-mono text-[11px] text-zinc-800 dark:text-zinc-200">
                  <span className="truncate mr-2 select-all font-semibold">{unauthorizedDomain}</span>
                  <button
                    type="button"
                    onClick={handleCopyDomain}
                    className="shrink-0 px-2.5 py-1 rounded-lg bg-amber-700 hover:bg-amber-800 text-white font-sans font-bold text-[10px] flex items-center gap-1 transition-colors"
                  >
                    {copiedDomain ? (
                      <>
                        <Check className="w-3 h-3" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy Domain</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="text-[11px] space-y-1 text-amber-900 dark:text-amber-300">
                  <p className="font-semibold text-amber-950 dark:text-amber-100">How to authorize in 30 seconds:</p>
                  <ol className="list-decimal list-inside space-y-0.5 pl-0.5 text-[11px] text-amber-800 dark:text-amber-300">
                    <li>Click <strong>Copy Domain</strong> above (or add <code>run.app</code> to authorize all preview URLs)</li>
                    <li>In Firebase Console &gt; Authentication &gt; Settings &gt; Authorized domains</li>
                    <li>Click <strong>Add domain</strong>, paste, and save</li>
                  </ol>
                </div>

                <div className="pt-1 flex flex-wrap items-center gap-2">
                  <a
                    href="https://console.firebase.google.com/project/noor-5cee7/authentication/settings"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-[11px] transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open Firebase Settings</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      setUnauthorizedDomain(null);
                      setAuthMode('signup');
                    }}
                    className="px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-800 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 font-bold text-[11px] hover:bg-amber-100/50"
                  >
                    Use Email / Password Instead
                  </button>
                </div>
              </div>
            )}

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-start gap-2 text-xs text-rose-700 dark:text-rose-300">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
                <div className="w-full">
                  <p className="text-[11px] leading-relaxed">{errorMsg}</p>
                </div>
              </div>
            )}

            {successMsg ? (
              <div className="py-6 text-center space-y-2">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{successMsg}</p>
              </div>
            ) : (
              <>
                {/* Google Sign In Button */}
                <button
                  onClick={handleGoogleAuth}
                  disabled={loading}
                  className="w-full py-2.5 px-4 rounded-2xl border border-[#E8E4DC] dark:border-emerald-900/40 bg-white dark:bg-[#14241D] hover:bg-[#FAF8F5] text-[#14241D] dark:text-[#F4F3EC] text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all disabled:opacity-50"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </button>

                <div className="relative flex items-center justify-center my-2">
                  <div className="border-t border-[#E8E4DC] dark:border-emerald-950/80 w-full" />
                  <span className="bg-white dark:bg-[#0D1E17] px-3 text-[10px] text-[#5C6F66] dark:text-[#9EB2A7] uppercase font-bold tracking-wider">
                    Or with email
                  </span>
                </div>

                {/* Email Form */}
                <form onSubmit={handleAuthSubmit} className="space-y-2.5">
                  {authMode === 'signup' && (
                    <div>
                      <label className="block text-[11px] font-bold text-[#14241D] dark:text-[#F4F3EC] mb-1">
                        Your Name
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-[#5C6F66] absolute left-3 top-2.5" />
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="e.g. Tariq Mansoor"
                          className="w-full pl-9 pr-3 py-2 rounded-2xl border border-[#E8E4DC] dark:border-emerald-900/40 bg-[#FAF8F5] dark:bg-[#14241D] text-xs focus:outline-none focus:ring-2 focus:ring-emerald-700 dark:text-[#F4F3EC]"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-[11px] font-bold text-[#14241D] dark:text-[#F4F3EC] mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-[#5C6F66] absolute left-3 top-2.5" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your.email@example.com"
                        className="w-full pl-9 pr-3 py-2 rounded-2xl border border-[#E8E4DC] dark:border-emerald-900/40 bg-[#FAF8F5] dark:bg-[#14241D] text-xs focus:outline-none focus:ring-2 focus:ring-emerald-700 dark:text-[#F4F3EC]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#14241D] dark:text-[#F4F3EC] mb-1">
                      Password (min 6 characters)
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-[#5C6F66] absolute left-3 top-2.5" />
                      <input
                        type="password"
                        required
                        minLength={6}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-9 pr-3 py-2 rounded-2xl border border-[#E8E4DC] dark:border-emerald-900/40 bg-[#FAF8F5] dark:bg-[#14241D] text-xs focus:outline-none focus:ring-2 focus:ring-emerald-700 dark:text-[#F4F3EC]"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-1 py-2.5 px-4 rounded-2xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    {loading ? (
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <span>{authMode === 'signup' ? 'Create Free Account' : 'Sign In'}</span>
                    )}
                  </button>
                </form>

                {/* GUEST MODE BUTTON */}
                <div className="pt-2 border-t border-[#E8E4DC] dark:border-emerald-950/80 space-y-1.5">
                  <button
                    onClick={handleContinueAsGuest}
                    className="w-full py-2.5 px-4 rounded-2xl border border-[#E8E4DC] dark:border-emerald-900/40 bg-[#FAF8F5] dark:bg-[#14241D] hover:bg-[#F0EBE1] text-[#14241D] dark:text-[#F4F3EC] font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs"
                  >
                    <span>Continue as Guest (No Sign Up Needed)</span>
                    <ChevronRight className="w-4 h-4 text-amber-600" />
                  </button>
                  <p className="text-[10px] text-center text-[#5C6F66] dark:text-[#9EB2A7]">
                    If you do not sign in, you can still use all app features with local storage.
                  </p>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
